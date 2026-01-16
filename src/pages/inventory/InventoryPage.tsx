import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Coffee,
    AlertCircle,
    ClipboardCheck,
    Boxes,
    TrendingUp,
    AlertTriangle
} from 'lucide-react'
import InventoryTable from '../../components/inventory/InventoryTable'
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal'
import { useInventoryItems } from '../../hooks/useInventory'
import type { Product } from '../../types/database'
import './InventoryPage.css'

type TabType = 'all' | 'raw_material' | 'finished' | 'low_stock'

export default function InventoryPage() {
    const { t } = useTranslation()
    const { data: items = [], isLoading } = useInventoryItems()
    const [activeTab, setActiveTab] = useState<TabType>('all')
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

    // Filter items based on active tab
    const filteredItems = items.filter(item => {
        if (activeTab === 'all') return true
        if (activeTab === 'raw_material') return item.product_type === 'raw_material'
        if (activeTab === 'finished') return item.product_type === 'finished'
        if (activeTab === 'low_stock') return item.current_stock <= item.min_stock_level
        return true
    })

    return (
        <div className="inventory-page">
            <header className="inventory-header">
                <div className="inventory-title">
                    <h1>{t('inventory_page.title')}</h1>
                    <p>{t('inventory_page.subtitle')}</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="inventory-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            <LayoutDashboard size={18} />
                            {t('inventory_page.all')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'raw_material' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('raw_material')}
                        >
                            <Package size={18} />
                            {t('inventory_page.raw_materials')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'finished' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('finished')}
                        >
                            <Coffee size={18} />
                            {t('inventory_page.finished_products')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'low_stock' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('low_stock')}
                        >
                            <AlertCircle size={18} />
                            {t('inventory_page.low_stock')}
                            {stats.lowStockItems > 0 && (
                                <span className="tab-badge">
                                    {stats.lowStockItems}
                                </span>
                            )}
                        </button>
                    </div>

                    <button
                        className="btn-secondary flex items-center gap-2 ml-4"
                        onClick={() => navigate('/inventory/stock-opname')}
                        title={t('inventory_page.stock_opname')}
                    >
                        <ClipboardCheck size={18} />
                        {t('inventory_page.stock_opname')}
                    </button>
                </div>
            </header>

            <main className="inventory-content">
                {/* KPI Stats Cards */}
                <div className="inventory-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <Boxes size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">{t('inventory_page.stats.total_products')}</div>
                            <div className="stat-value">{stats.totalItems}</div>
                            <div className="stat-trend up">
                                <TrendingUp size={12} />
                                {t('inventory_page.stats.in_stock')}
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon raw">
                            <Package size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">{t('inventory_page.stats.raw_materials')}</div>
                            <div className="stat-value">{stats.rawMaterials}</div>
                            <div className="stat-trend up">
                                {t('inventory_page.stats.ingredients')}
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon finished">
                            <Coffee size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">{t('inventory_page.stats.finished_products')}</div>
                            <div className="stat-value">{stats.finishedProducts}</div>
                            <div className="stat-trend up">
                                {t('inventory_page.stats.ready_to_sell')}
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon alert">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">{t('inventory_page.stats.low_stock_alerts')}</div>
                            <div className="stat-value">{stats.lowStockItems}</div>
                            <div className={`stat-trend ${stats.lowStockItems > 0 ? 'down' : 'up'}`}>
                                {stats.lowStockItems > 0
                                    ? t('inventory_page.stats.needs_attention')
                                    : t('inventory_page.stats.all_ok')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="inventory-table-section">
                    <InventoryTable
                        items={filteredItems}
                        isLoading={isLoading}
                        onAdjustStock={setSelectedProduct}
                        onViewDetails={(product) => navigate(`/inventory/product/${product.id}`)}
                    />
                </div>
            </main>

            {selectedProduct && (
                <StockAdjustmentModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    )
}
