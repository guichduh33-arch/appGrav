import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Coffee,
    AlertCircle,
    Boxes,
    TrendingUp,
    AlertTriangle
} from 'lucide-react'
import InventoryTable from '../../components/inventory/InventoryTable'
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal'
import OfflineAdjustmentBlockedModal from '../../components/inventory/OfflineAdjustmentBlockedModal'
import DeferredNotesBadge from '../../components/inventory/DeferredNotesBadge'
import OfflineStockBanner from '../../components/inventory/OfflineStockBanner'
import StockAlertsPanel from '../../components/inventory/StockAlertsPanel'
import StaleDataWarning from '../../components/inventory/StaleDataWarning'
import { useInventoryItems, type TInventoryItem } from '@/hooks/inventory'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import { useStockLevelsOffline } from '@/hooks/offline/useStockLevelsOffline'
import { isDataStale } from '@/types/offline'
import type { Product } from '../../types/database'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'raw_material' | 'finished' | 'low_stock'

// Type alias for item with category that matches InventoryTable props
type InventoryItemWithCategory = Product & { category: { name: string } | null }

export default function StockPage() {
    const { data: items = [], isLoading } = useInventoryItems()
    const { isOnline } = useNetworkStatus()
    const { lastSyncAt, cacheCount } = useStockLevelsOffline()
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')
    const [selectedProduct, setSelectedProduct] = useState<TInventoryItem | null>(null)
    const [offlineBlockedProduct, setOfflineBlockedProduct] = useState<{ id: string; name: string } | null>(null)
    const [showAlertsPanel, setShowAlertsPanel] = useState(false)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Check for ?filter=alerts query param to show alerts panel
    useEffect(() => {
        const filterParam = searchParams.get('filter')
        if (filterParam === 'alerts') {
            setShowAlertsPanel(true)
            setActiveFilter('low_stock')
        }
    }, [searchParams])

    // Handle stock adjustment attempt - shows blocking modal if offline
    const handleAdjustStock = (product: Product) => {
        if (isOnline) {
            // Online: open the regular adjustment modal
            setSelectedProduct(product as unknown as TInventoryItem)
        } else {
            // Offline: open the blocking modal with note option
            setOfflineBlockedProduct({ id: product.id, name: product.name })
        }
    }

    // Calculate stats
    const stats = useMemo(() => {
        const totalItems = items.length
        const rawMaterials = items.filter(i => i.product_type === 'raw_material').length
        const finishedProducts = items.filter(i => i.product_type === 'finished').length
        const lowStockItems = items.filter(i => i.current_stock <= i.min_stock_level).length

        return { totalItems, rawMaterials, finishedProducts, lowStockItems }
    }, [items])

    // Filter items based on active filter
    const filteredItems = items.filter(item => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'raw_material') return item.product_type === 'raw_material'
        if (activeFilter === 'finished') return item.product_type === 'finished'
        if (activeFilter === 'low_stock') return item.current_stock <= item.min_stock_level
        return true
    })

    return (
        <div className="flex flex-col gap-6">
            {!isOnline && (
                <OfflineStockBanner
                    lastSyncAt={lastSyncAt}
                    cacheCount={cacheCount}
                    className="mb-4"
                />
            )}

            {!isOnline && isDataStale(lastSyncAt) && (
                <StaleDataWarning
                    lastSyncAt={lastSyncAt}
                    className="mb-4"
                />
            )}

            {(showAlertsPanel || stats.lowStockItems > 0) && (
                <StockAlertsPanel
                    className="mb-4"
                    initialFilter={showAlertsPanel ? 'all' : 'critical'}
                />
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap max-md:overflow-x-auto max-md:flex-nowrap max-md:pb-2">
                {([
                    { key: 'all', label: 'All', icon: <LayoutDashboard size={18} /> },
                    { key: 'raw_material', label: 'Raw Materials', icon: <Package size={18} /> },
                    { key: 'finished', label: 'Finished Products', icon: <Coffee size={18} /> },
                    { key: 'low_stock', label: 'Low Stock', icon: <AlertCircle size={18} /> },
                ] as const).map(f => (
                    <button
                        key={f.key}
                        className={cn(
                            'flex items-center gap-2 py-2.5 px-4 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 max-md:shrink-0 hover:border-primary hover:text-primary',
                            activeFilter === f.key && 'bg-primary border-primary text-white hover:text-white'
                        )}
                        onClick={() => setActiveFilter(f.key)}
                    >
                        {f.icon}
                        {f.label}
                        {f.key === 'low_stock' && stats.lowStockItems > 0 && (
                            <span className={cn(
                                'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold rounded-full',
                                activeFilter === 'low_stock' ? 'bg-white text-primary' : 'bg-red-500 text-white'
                            )}>
                                {stats.lowStockItems}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* KPI Stats Cards */}
            <div className="grid grid-cols-4 max-xl:grid-cols-2 max-md:grid-cols-1 gap-4">
                {([
                    { icon: <Boxes size={24} />, iconClass: 'bg-blue-500/10 text-primary', label: 'Total Products', value: stats.totalItems, trend: 'In stock', trendIcon: <TrendingUp size={12} />, trendUp: true },
                    { icon: <Package size={24} />, iconClass: 'bg-amber-500/10 text-amber-500', label: 'Raw Materials', value: stats.rawMaterials, trend: 'Ingredients', trendUp: true },
                    { icon: <Coffee size={24} />, iconClass: 'bg-emerald-500/10 text-emerald-500', label: 'Finished Products', value: stats.finishedProducts, trend: 'Ready to sell', trendUp: true },
                    { icon: <AlertTriangle size={24} />, iconClass: 'bg-red-500/10 text-red-500', label: 'Low Stock Alerts', value: stats.lowStockItems, trend: stats.lowStockItems > 0 ? 'Needs attention' : 'All OK', trendUp: stats.lowStockItems === 0 },
                ]).map((stat, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl">
                        <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', stat.iconClass)}>
                            {stat.icon}
                        </div>
                        <div className="flex-1">
                            <div className="text-[0.8125rem] font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
                            <div className="text-[1.75rem] font-bold text-gray-900 leading-tight">{stat.value}</div>
                            <div className={cn('flex items-center gap-1 text-[0.8125rem] font-medium mt-1', stat.trendUp ? 'text-emerald-600' : 'text-red-600')}>
                                {stat.trendIcon}
                                {stat.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isOnline && (
                <div className="mb-4 flex justify-end">
                    <DeferredNotesBadge />
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <InventoryTable
                    items={filteredItems as unknown as InventoryItemWithCategory[]}
                    isLoading={isLoading}
                    onAdjustStock={handleAdjustStock}
                    onViewDetails={(product) => navigate(`/inventory/product/${product.id}`)}
                />
            </div>

            {/* Stock Adjustment Modal - shown when online */}
            {selectedProduct && (
                <StockAdjustmentModal
                    product={{
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        current_stock: selectedProduct.current_stock,
                        unit: selectedProduct.unit
                    }}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {/* Offline Adjustment Blocked Modal - shown when offline */}
            {offlineBlockedProduct && (
                <OfflineAdjustmentBlockedModal
                    product={offlineBlockedProduct}
                    onClose={() => setOfflineBlockedProduct(null)}
                    onNoteSaved={() => setOfflineBlockedProduct(null)}
                />
            )}
        </div>
    )
}
