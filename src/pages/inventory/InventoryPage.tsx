import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Coffee, AlertCircle, ClipboardCheck } from 'lucide-react'
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
                            {items.filter(i => i.current_stock <= i.min_stock_level).length > 0 && (
                                <span className="tab-badge">
                                    {items.filter(i => i.current_stock <= i.min_stock_level).length}
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
                <InventoryTable
                    items={filteredItems}
                    isLoading={isLoading}
                    onAdjustStock={setSelectedProduct}
                    onViewDetails={(product) => navigate(`/inventory/product/${product.id}`)}
                />
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
