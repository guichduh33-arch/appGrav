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
import './InventoryAlertsPanel.css'

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
            console.error('Error loading alerts:', err)
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
            console.error('Error creating PO:', err)
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
            <div className="inventory-alerts-panel loading">
                <RefreshCw className="spin" size={24} />
                <span>Chargement des alertes...</span>
            </div>
        )
    }

    const criticalCount = lowStockItems.filter(i => i.severity === 'critical').length
    const warningCount = lowStockItems.filter(i => i.severity === 'warning').length

    return (
        <div className="inventory-alerts-panel">
            {/* Header */}
            <div className="alerts-panel__header">
                <h2>
                    <AlertTriangle size={20} />
                    Alertes Inventaire
                </h2>
                <button
                    className="btn-refresh"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw className={refreshing ? 'spin' : ''} size={18} />
                </button>
            </div>

            {/* Summary */}
            <div className="alerts-panel__summary">
                {criticalCount > 0 && (
                    <span className="summary-badge critical">
                        {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                    </span>
                )}
                {warningCount > 0 && (
                    <span className="summary-badge warning">
                        {warningCount} avertissement{warningCount > 1 ? 's' : ''}
                    </span>
                )}
                {criticalCount === 0 && warningCount === 0 && (
                    <span className="summary-badge ok">
                        <CheckCircle size={14} />
                        Stock OK
                    </span>
                )}
            </div>

            {/* Tabs */}
            <div className="alerts-panel__tabs">
                <button
                    className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    <AlertTriangle size={16} />
                    Stock Bas
                    {lowStockItems.length > 0 && (
                        <span className="tab-badge">{lowStockItems.length}</span>
                    )}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'reorder' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reorder')}
                >
                    <ShoppingCart size={16} />
                    Réappro
                    {reorderSuggestions.length > 0 && (
                        <span className="tab-badge">{reorderSuggestions.length}</span>
                    )}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'production' ? 'active' : ''}`}
                    onClick={() => setActiveTab('production')}
                >
                    <Factory size={16} />
                    Production
                    {productionSuggestions.length > 0 && (
                        <span className="tab-badge">{productionSuggestions.length}</span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="alerts-panel__content">
                {/* Low Stock Alerts (Story 9.1) */}
                {activeTab === 'alerts' && (
                    <div className="alerts-list">
                        {lowStockItems.length === 0 ? (
                            <div className="empty-state">
                                <CheckCircle size={40} />
                                <p>Aucune alerte de stock bas</p>
                            </div>
                        ) : (
                            lowStockItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`alert-item alert-item--${item.severity}`}
                                    onClick={() => navigate(`/inventory/product/${item.id}`)}
                                >
                                    <div
                                        className="alert-item__indicator"
                                        style={{ backgroundColor: getSeverityColor(item.severity) }}
                                    />
                                    <div className="alert-item__info">
                                        <span className="alert-item__name">{item.name}</span>
                                        <span className="alert-item__sku">{item.sku}</span>
                                    </div>
                                    <div className="alert-item__stock">
                                        <span className="current">{item.current_stock}</span>
                                        <span className="separator">/</span>
                                        <span className="min">{item.min_stock_level}</span>
                                        <span className="unit">{item.unit_name}</span>
                                    </div>
                                    <div
                                        className="alert-item__bar"
                                        style={{
                                            '--percentage': `${Math.min(item.stock_percentage, 100)}%`,
                                            '--color': getSeverityColor(item.severity)
                                        } as React.CSSProperties}
                                    />
                                    <ChevronRight size={16} className="alert-item__chevron" />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Reorder Suggestions (Story 9.2) */}
                {activeTab === 'reorder' && (
                    <div className="reorder-list">
                        {reorderSuggestions.length === 0 ? (
                            <div className="empty-state">
                                <CheckCircle size={40} />
                                <p>Aucune suggestion de réapprovisionnement</p>
                            </div>
                        ) : (
                            <>
                                {selectedForPo.size > 0 && (
                                    <div className="reorder-actions">
                                        <span>{selectedForPo.size} produit(s) sélectionné(s)</span>
                                        <button
                                            className="btn-create-po"
                                            onClick={handleCreatePo}
                                            disabled={creatingPo}
                                        >
                                            {creatingPo ? 'Création...' : 'Créer BC'}
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                )}
                                {reorderSuggestions.map(suggestion => (
                                    <div
                                        key={suggestion.product_id}
                                        className={`reorder-item ${selectedForPo.has(suggestion.product_id) ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedForPo.has(suggestion.product_id)}
                                            onChange={() => toggleSelectForPo(suggestion.product_id)}
                                        />
                                        <div className="reorder-item__info">
                                            <span className="reorder-item__name">{suggestion.product_name}</span>
                                            <span className="reorder-item__supplier">
                                                {suggestion.supplier_name || 'Fournisseur non défini'}
                                            </span>
                                        </div>
                                        <div className="reorder-item__qty">
                                            <Package size={14} />
                                            <span>{suggestion.suggested_quantity} {suggestion.unit_name}</span>
                                        </div>
                                        <div className="reorder-item__days">
                                            <Clock size={14} />
                                            <span>{suggestion.days_until_stockout}j</span>
                                        </div>
                                        <div className="reorder-item__cost">
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
                    <div className="production-list">
                        {productionSuggestions.length === 0 ? (
                            <div className="empty-state">
                                <CheckCircle size={40} />
                                <p>Aucune suggestion de production</p>
                            </div>
                        ) : (
                            productionSuggestions.map(suggestion => (
                                <div
                                    key={suggestion.product_id}
                                    className={`production-item production-item--${suggestion.priority}`}
                                    onClick={() => navigate('/inventory/production')}
                                >
                                    <div
                                        className="production-item__priority"
                                        style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                                    >
                                        {suggestion.priority === 'high' ? '!' : suggestion.priority === 'medium' ? '!!' : ''}
                                    </div>
                                    <div className="production-item__info">
                                        <span className="production-item__name">{suggestion.product_name}</span>
                                        <span className="production-item__stock">
                                            Stock: {suggestion.current_stock} / {suggestion.min_stock_level}
                                        </span>
                                    </div>
                                    <div className="production-item__qty">
                                        <Factory size={14} />
                                        <span>+{suggestion.suggested_quantity}</span>
                                    </div>
                                    <div className="production-item__status">
                                        {suggestion.ingredients_available ? (
                                            <span className="status-ok">
                                                <CheckCircle size={14} />
                                                Prêt
                                            </span>
                                        ) : (
                                            <span className="status-blocked">
                                                <XCircle size={14} />
                                                {suggestion.missing_ingredients.length} manquant(s)
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight size={16} className="production-item__chevron" />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
