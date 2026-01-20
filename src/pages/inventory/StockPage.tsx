import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
import { useInventoryItems } from '../../hooks/useInventory'
import type { Product } from '../../types/database'
import './StockPage.css'

type FilterType = 'all' | 'raw_material' | 'finished' | 'low_stock'

export default function StockPage() {
    const { t } = useTranslation()
    const { data: items = [], isLoading } = useInventoryItems()
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const navigate = useNavigate()

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
            {/* Filter Tabs */}
            <div className="stock-filters">
                <button
                    className={`filter-btn ${activeFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    <LayoutDashboard size={18} />
                    {t('inventory_page.all', 'All')}
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'raw_material' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('raw_material')}
                >
                    <Package size={18} />
                    {t('inventory_page.raw_materials', 'Raw Materials')}
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'finished' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('finished')}
                >
                    <Coffee size={18} />
                    {t('inventory_page.finished_products', 'Finished Products')}
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'low_stock' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('low_stock')}
                >
                    <AlertCircle size={18} />
                    {t('inventory_page.low_stock', 'Low Stock')}
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
                        <div className="stat-label">{t('inventory_page.stats.total_products', 'Total Products')}</div>
                        <div className="stat-value">{stats.totalItems}</div>
                        <div className="stat-trend up">
                            <TrendingUp size={12} />
                            {t('inventory_page.stats.in_stock', 'In stock')}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon raw">
                        <Package size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">{t('inventory_page.stats.raw_materials', 'Raw Materials')}</div>
                        <div className="stat-value">{stats.rawMaterials}</div>
                        <div className="stat-trend up">
                            {t('inventory_page.stats.ingredients', 'Ingredients')}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon finished">
                        <Coffee size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">{t('inventory_page.stats.finished_products', 'Finished Products')}</div>
                        <div className="stat-value">{stats.finishedProducts}</div>
                        <div className="stat-trend up">
                            {t('inventory_page.stats.ready_to_sell', 'Ready to sell')}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon alert">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">{t('inventory_page.stats.low_stock_alerts', 'Low Stock Alerts')}</div>
                        <div className="stat-value">{stats.lowStockItems}</div>
                        <div className={`stat-trend ${stats.lowStockItems > 0 ? 'down' : 'up'}`}>
                            {stats.lowStockItems > 0
                                ? t('inventory_page.stats.needs_attention', 'Needs attention')
                                : t('inventory_page.stats.all_ok', 'All OK')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="stock-table-section">
                <InventoryTable
                    items={filteredItems}
                    isLoading={isLoading}
                    onAdjustStock={setSelectedProduct}
                    onViewDetails={(product) => navigate(`/inventory/product/${product.id}`)}
                />
            </div>

            {selectedProduct && (
                <StockAdjustmentModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    )
}
