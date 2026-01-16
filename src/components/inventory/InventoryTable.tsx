import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit2, AlertTriangle, Search, Package, FileText } from 'lucide-react'
import type { Product } from '../../types/database'
import './InventoryTable.css'

interface InventoryTableProps {
    items: (Product & { category: { name: string } | null })[]
    onAdjustStock: (product: Product) => void
    onViewDetails: (product: Product) => void
    isLoading?: boolean
}

export default function InventoryTable({ items, onAdjustStock, onViewDetails, isLoading }: InventoryTableProps) {
    const { t } = useTranslation()
    const [searchTerm, setSearchTerm] = useState('')

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return <div className="inventory-loading">{t('inventory_table.loading')}</div>
    }

    return (
        <div className="inventory-container">
            <div className="inventory-controls">
                <div className="inventory-search">
                    <Search className="inventory-search__icon" size={20} />
                    <input
                        type="text"
                        placeholder={t('inventory_table.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="inventory-search__input"
                    />
                </div>
                <div className="inventory-stats">
                    <span className="inventory-stat">
                        <Package size={16} />
                        {filteredItems.length} {t('inventory_table.items_count')}
                    </span>
                </div>
            </div>

            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>{t('inventory_table.product')}</th>
                            <th>{t('inventory_table.sku')}</th>
                            <th>{t('inventory_table.category')}</th>
                            <th>{t('inventory_table.type')}</th>
                            <th className="text-right">{t('inventory_table.current_stock')}</th>
                            <th className="text-center">{t('inventory_table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const isLowStock = item.current_stock <= item.min_stock_level

                            return (
                                <tr key={item.id} className={isLowStock ? 'is-low-stock' : ''}>
                                    <td className="cell-product">
                                        <div className="product-cell">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="product-thumb" />
                                            ) : (
                                                <div className="product-thumb-placeholder">📦</div>
                                            )}
                                            <div>
                                                <div
                                                    className="product-name clickable"
                                                    onClick={() => onViewDetails(item)}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    {item.name}
                                                </div>
                                                {isLowStock && (
                                                    <div className="stock-warning">
                                                        <AlertTriangle size={12} />
                                                        {t('inventory_table.low_stock')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="cell-sku">{item.sku}</td>
                                    <td className="cell-category">
                                        <span className="category-badge">
                                            {item.category?.name || t('inventory_table.no_category')}
                                        </span>
                                    </td>
                                    <td className="cell-type">
                                        {formatProductType(item.product_type, t)}
                                    </td>
                                    <td className="cell-stock text-right">
                                        <span className={`stock-value ${isLowStock ? 'text-urgent' : ''}`}>
                                            {item.current_stock}
                                        </span>
                                        <span className="stock-unit">{item.unit}</span>
                                    </td>
                                    <td className="cell-action text-center">
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon-sm"
                                                onClick={() => onViewDetails(item)}
                                                title={t('inventory_table.view_details')}
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button
                                                className="btn-icon-sm"
                                                onClick={() => onAdjustStock(item)}
                                                title={t('inventory_table.adjust_stock')}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {filteredItems.length === 0 && (
                    <div className="inventory-empty">
                        <Package size={48} />
                        <p>{t('inventory_table.no_items')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function formatProductType(type: string | undefined, t: (key: string) => string): string {
    switch (type) {
        case 'finished': return t('inventory_table.type_finished')
        case 'raw_material': return t('inventory_table.type_raw_material')
        case 'semi_finished': return t('inventory_table.type_semi_finished')
        default: return type || t('inventory_table.type_unknown')
    }
}
