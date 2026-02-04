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
import './StockPage.css'

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
        <div className="stock-page">
            {/* Offline Banner */}
            {!isOnline && (
                <OfflineStockBanner
                    lastSyncAt={lastSyncAt}
                    cacheCount={cacheCount}
                    className="mb-4"
                />
            )}

            {/* Stale Data Warning - shown when offline and data is old */}
            {!isOnline && isDataStale(lastSyncAt) && (
                <StaleDataWarning
                    lastSyncAt={lastSyncAt}
                    className="mb-4"
                />
            )}

            {/* Stock Alerts Panel - shown when ?filter=alerts or low stock items exist */}
            {(showAlertsPanel || stats.lowStockItems > 0) && (
                <StockAlertsPanel
                    className="mb-4"
                    initialFilter={showAlertsPanel ? 'all' : 'critical'}
                />
            )}

            {/* Filter Tabs */}
            <div className="stock-filters">
                <button
                    className={`filter-btn ${activeFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    <LayoutDashboard size={18} />
                    All
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'raw_material' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('raw_material')}
                >
                    <Package size={18} />
                    Raw Materials
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'finished' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('finished')}
                >
                    <Coffee size={18} />
                    Finished Products
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'low_stock' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('low_stock')}
                >
                    <AlertCircle size={18} />
                    Low Stock
                    {stats.lowStockItems > 0 && (
                        <span className="filter-badge">{stats.lowStockItems}</span>
                    )}
                </button>
            </div>

            {/* KPI Stats Cards */}
            <div className="stock-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <Boxes size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Total Products</div>
                        <div className="stat-value">{stats.totalItems}</div>
                        <div className="stat-trend up">
                            <TrendingUp size={12} />
                            In stock
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon raw">
                        <Package size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Raw Materials</div>
                        <div className="stat-value">{stats.rawMaterials}</div>
                        <div className="stat-trend up">
                            Ingredients
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon finished">
                        <Coffee size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Finished Products</div>
                        <div className="stat-value">{stats.finishedProducts}</div>
                        <div className="stat-trend up">
                            Ready to sell
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon alert">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Low Stock Alerts</div>
                        <div className="stat-value">{stats.lowStockItems}</div>
                        <div className={`stat-trend ${stats.lowStockItems > 0 ? 'down' : 'up'}`}>
                            {stats.lowStockItems > 0
                                ? 'Needs attention'
                                : 'All OK'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Deferred Notes Badge - shown when online and notes exist */}
            {isOnline && (
                <div className="mb-4 flex justify-end">
                    <DeferredNotesBadge />
                </div>
            )}

            {/* Inventory Table */}
            <div className="stock-table-section">
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
