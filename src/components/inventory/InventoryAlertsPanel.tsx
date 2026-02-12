/**
 * Inventory Alerts Panel
 * Epic 9: Stories 9.1, 9.2, 9.4
 *
 * Shows low stock alerts, reorder suggestions, and production recommendations
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AlertTriangle,
    ShoppingCart,
    Factory,
    ChevronRight,
    Package,
    Clock,
    DollarSign,
    XCircle,
    CheckCircle,
    RefreshCw,
    ExternalLink
} from 'lucide-react'
import {
    getLowStockItems,
    getReorderSuggestions,
    getProductionSuggestions,
    createPoFromLowStock,
    type ILowStockItem,
    type IReorderSuggestion,
    type IProductionSuggestion
} from '@/services/inventory/inventoryAlerts'
import { formatPrice } from '@/utils/helpers'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'

type TabType = 'alerts' | 'reorder' | 'production'

export default function InventoryAlertsPanel() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<TabType>('alerts')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [lowStockItems, setLowStockItems] = useState<ILowStockItem[]>([])
    const [reorderSuggestions, setReorderSuggestions] = useState<IReorderSuggestion[]>([])
    const [productionSuggestions, setProductionSuggestions] = useState<IProductionSuggestion[]>([])

    const [selectedForPo, setSelectedForPo] = useState<Set<string>>(new Set())
    const [creatingPo, setCreatingPo] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [lowStock, reorder, production] = await Promise.all([
                getLowStockItems(),
                getReorderSuggestions(),
                getProductionSuggestions()
            ])
            setLowStockItems(lowStock)
            setReorderSuggestions(reorder)
            setProductionSuggestions(production)
        } catch (err) {
            logError('Error loading alerts:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadData()
        setRefreshing(false)
    }

    const toggleSelectForPo = (productId: string) => {
        setSelectedForPo(prev => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) {
                newSet.delete(productId)
            } else {
                newSet.add(productId)
            }
            return newSet
        })
    }

    const handleCreatePo = async () => {
        if (selectedForPo.size === 0) return

        // Group by supplier
        const supplierGroups = new Map<string, IReorderSuggestion[]>()
        reorderSuggestions
            .filter(s => selectedForPo.has(s.product_id))
            .forEach(s => {
                const supplierId = s.supplier_id || 'unknown'
                if (!supplierGroups.has(supplierId)) {
                    supplierGroups.set(supplierId, [])
                }
                supplierGroups.get(supplierId)!.push(s)
            })

        setCreatingPo(true)
        try {
            // Create PO for each supplier
            for (const [supplierId, items] of supplierGroups) {
                if (supplierId === 'unknown') continue

                await createPoFromLowStock(
                    supplierId,
                    items.map(i => ({
                        productId: i.product_id,
                        quantity: i.suggested_quantity,
                        unitPrice: i.last_purchase_price || 0
                    }))
                )
            }

            setSelectedForPo(new Set())
            navigate('/purchasing/purchase-orders')
        } catch (err) {
            logError('Error creating PO:', err)
        } finally {
            setCreatingPo(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return '#dc2626'
            case 'warning': return '#f59e0b'
            default: return '#10b981'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#dc2626'
            case 'medium': return '#f59e0b'
            default: return '#10b981'
        }
    }

    if (loading) {
        return (
            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden flex flex-col h-full items-center justify-center gap-3 p-10 text-[#888]">
                <RefreshCw className="animate-spin" size={24} />
                <span>Loading alerts...</span>
            </div>
        )
    }

    const criticalCount = lowStockItems.filter(i => i.severity === 'critical').length
    const warningCount = lowStockItems.filter(i => i.severity === 'warning').length

    return (
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 bg-[#222] border-b border-[#333]">
                <h2 className="flex items-center gap-2.5 text-[1.1rem] font-semibold text-white m-0">
                    <AlertTriangle size={20} />
                    Inventory Alerts
                </h2>
                <button
                    className="w-9 h-9 border-none rounded-lg bg-[#333] text-[#aaa] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[#444] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw className={refreshing ? 'animate-spin' : ''} size={18} />
                </button>
            </div>

            {/* Summary */}
            <div className="flex gap-2 px-5 py-3 bg-[#1f1f1f] border-b border-[#333] flex-wrap">
                {criticalCount > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-[0.85rem] font-semibold bg-red-600/20 text-red-500">
                        {criticalCount} critical
                    </span>
                )}
                {warningCount > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-[0.85rem] font-semibold bg-amber-500/20 text-amber-500">
                        {warningCount} warning{warningCount > 1 ? 's' : ''}
                    </span>
                )}
                {criticalCount === 0 && warningCount === 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-[0.85rem] font-semibold bg-emerald-500/20 text-emerald-500">
                        <CheckCircle size={14} />
                        Stock OK
                    </span>
                )}
            </div>

            {/* Tabs */}
            <div className="flex px-3 py-2 gap-1 bg-[#1a1a1a] border-b border-[#333]">
                {([
                    { key: 'alerts' as TabType, icon: <AlertTriangle size={16} />, label: 'Low Stock', count: lowStockItems.length },
                    { key: 'reorder' as TabType, icon: <ShoppingCart size={16} />, label: 'Reorder', count: reorderSuggestions.length },
                    { key: 'production' as TabType, icon: <Factory size={16} />, label: 'Production', count: productionSuggestions.length },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border-none rounded-lg bg-transparent text-[#888] text-[0.85rem] font-medium cursor-pointer transition-all duration-200',
                            'hover:bg-[#2a2a2a] hover:text-[#ccc]',
                            'max-md:py-2 max-md:text-xs max-md:[&_svg]:hidden',
                            activeTab === tab.key && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'
                        )}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-[10px] bg-white/20 text-xs font-bold flex items-center justify-center">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
                {/* Low Stock Alerts (Story 9.1) */}
                {activeTab === 'alerts' && (
                    <div className="flex flex-col gap-2">
                        {lowStockItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10 px-5 text-emerald-500">
                                <CheckCircle size={40} />
                                <p className="text-[#888] text-[0.9rem] m-0">No low stock alerts</p>
                            </div>
                        ) : (
                            lowStockItems.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 px-4 py-3 bg-[#222] rounded-[10px] cursor-pointer transition-all duration-200 relative hover:bg-[#2a2a2a] hover:translate-x-1"
                                    onClick={() => navigate(`/inventory/product/${item.id}`)}
                                >
                                    <div
                                        className="w-1 h-10 rounded-sm shrink-0"
                                        style={{ backgroundColor: getSeverityColor(item.severity) }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="block font-semibold text-white text-[0.95rem] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                                        <span className="block text-[0.8rem] text-[#888] mt-0.5">{item.sku}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 font-mono whitespace-nowrap">
                                        <span className={cn('text-[1.1rem] font-bold', item.severity === 'warning' ? 'text-amber-500' : 'text-red-500')}>{item.current_stock}</span>
                                        <span className="text-[#666]">/</span>
                                        <span className="text-[0.9rem] text-[#888]">{item.min_stock_level}</span>
                                        <span className="text-xs text-[#666] ml-1">{item.unit_name}</span>
                                    </div>
                                    <div
                                        className="w-[60px] h-1.5 bg-[#333] rounded-sm overflow-hidden relative max-md:hidden"
                                        style={{
                                            '--percentage': `${Math.min(item.stock_percentage, 100)}%`,
                                            '--color': getSeverityColor(item.severity)
                                        } as React.CSSProperties}
                                    >
                                        <div
                                            className="absolute left-0 top-0 h-full rounded-sm"
                                            style={{
                                                width: `${Math.min(item.stock_percentage, 100)}%`,
                                                backgroundColor: getSeverityColor(item.severity)
                                            }}
                                        />
                                    </div>
                                    <ChevronRight size={16} className="text-[#666] shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Reorder Suggestions (Story 9.2) */}
                {activeTab === 'reorder' && (
                    <div className="flex flex-col gap-2">
                        {reorderSuggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10 px-5 text-emerald-500">
                                <CheckCircle size={40} />
                                <p className="text-[#888] text-[0.9rem] m-0">No reorder suggestions</p>
                            </div>
                        ) : (
                            <>
                                {selectedForPo.size > 0 && (
                                    <div className="flex justify-between items-center px-4 py-3 bg-blue-500 rounded-[10px] text-white mb-2">
                                        <span className="font-medium">{selectedForPo.size} product(s) selected</span>
                                        <button
                                            className="flex items-center gap-1.5 px-4 py-2 border-none rounded-lg bg-white text-blue-500 font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleCreatePo}
                                            disabled={creatingPo}
                                        >
                                            {creatingPo ? 'Creating...' : 'Create PO'}
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                )}
                                {reorderSuggestions.map(suggestion => (
                                    <div
                                        key={suggestion.product_id}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 bg-[#222] rounded-[10px] transition-all duration-200',
                                            selectedForPo.has(suggestion.product_id) && 'bg-blue-500/15 border border-blue-500/30'
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-blue-500 cursor-pointer"
                                            checked={selectedForPo.has(suggestion.product_id)}
                                            onChange={() => toggleSelectForPo(suggestion.product_id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <span className="block font-semibold text-white text-[0.95rem]">{suggestion.product_name}</span>
                                            <span className="block text-[0.8rem] text-[#888] mt-0.5">
                                                {suggestion.supplier_name || 'No supplier defined'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[0.85rem] text-emerald-500 whitespace-nowrap">
                                            <Package size={14} />
                                            <span>{suggestion.suggested_quantity} {suggestion.unit_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[0.85rem] text-amber-500 whitespace-nowrap max-md:hidden">
                                            <Clock size={14} />
                                            <span>{suggestion.days_until_stockout}j</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[0.85rem] text-violet-400 font-semibold whitespace-nowrap">
                                            <DollarSign size={14} />
                                            <span>{formatPrice(suggestion.estimated_cost)}</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Production Suggestions (Story 9.4) */}
                {activeTab === 'production' && (
                    <div className="flex flex-col gap-2">
                        {productionSuggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10 px-5 text-emerald-500">
                                <CheckCircle size={40} />
                                <p className="text-[#888] text-[0.9rem] m-0">No production suggestions</p>
                            </div>
                        ) : (
                            productionSuggestions.map(suggestion => (
                                <div
                                    key={suggestion.product_id}
                                    className="flex items-center gap-3 px-4 py-3 bg-[#222] rounded-[10px] cursor-pointer transition-all duration-200 hover:bg-[#2a2a2a] hover:translate-x-1"
                                    onClick={() => navigate('/inventory/production')}
                                >
                                    <div
                                        className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-[0.9rem] shrink-0"
                                        style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                                    >
                                        {suggestion.priority === 'high' ? '!' : suggestion.priority === 'medium' ? '!!' : ''}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block font-semibold text-white text-[0.95rem]">{suggestion.product_name}</span>
                                        <span className="block text-[0.8rem] text-[#888] mt-0.5">
                                            Stock: {suggestion.current_stock} / {suggestion.min_stock_level}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-emerald-500 whitespace-nowrap">
                                        <Factory size={14} />
                                        <span>+{suggestion.suggested_quantity}</span>
                                    </div>
                                    <div className="shrink-0">
                                        {suggestion.ingredients_available ? (
                                            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-500 rounded-md text-[0.8rem] font-semibold">
                                                <CheckCircle size={14} />
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-500 rounded-md text-[0.8rem] font-semibold">
                                                <XCircle size={14} />
                                                {suggestion.missing_ingredients.length} missing
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight size={16} className="text-[#666] shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
