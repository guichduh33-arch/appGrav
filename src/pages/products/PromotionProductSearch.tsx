import { Search, X, Plus } from 'lucide-react'
import { Product } from '../../types/database'
import { formatCurrency } from '../../utils/helpers'

interface PromotionProductSearchProps {
    title: string
    subtitle: string
    emptyText: string
    type: 'applicable' | 'free'
    selectedProducts: Product[]
    filteredProducts: Product[]
    showSearch: boolean
    searchTerm: string
    onSearchTermChange: (term: string) => void
    onOpenSearch: () => void
    onAddProduct: (product: Product, type: 'applicable' | 'free') => void
    onRemoveProduct: (productId: string, type: 'applicable' | 'free') => void
    style?: React.CSSProperties
}

export default function PromotionProductSearch({
    title,
    subtitle,
    emptyText,
    type,
    selectedProducts,
    filteredProducts,
    showSearch,
    searchTerm,
    onSearchTermChange,
    onOpenSearch,
    onAddProduct,
    onRemoveProduct,
    style
}: PromotionProductSearchProps) {
    return (
        <div className="promo-products-panel" style={style}>
            <div className="promo-products-header">
                <div>
                    <div className="promo-products-title">{title}</div>
                    <div className="promo-products-subtitle">{subtitle}</div>
                </div>
                <button
                    type="button"
                    className="btn-add-product"
                    onClick={onOpenSearch}
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>

            {showSearch && (
                <div className="promo-product-search">
                    <div className="promo-search-input-wrap">
                        <Search size={18} />
                        <input
                            type="text"
                            className="promo-search-input"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Search for a product..."
                            autoFocus
                        />
                    </div>
                    {searchTerm && (
                        <div className="promo-search-results">
                            {filteredProducts.slice(0, 8).map(product => (
                                <div
                                    key={product.id}
                                    className="promo-search-item"
                                    onClick={() => onAddProduct(product, type)}
                                >
                                    <div>
                                        <div className="promo-search-item-name">{product.name}</div>
                                        <div className="promo-search-item-sku">{product.sku}</div>
                                    </div>
                                    <div className="promo-search-item-price">
                                        {formatCurrency(product.retail_price || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="promo-selected-products">
                {selectedProducts.length === 0 ? (
                    <div className="promo-no-products">
                        {emptyText}
                    </div>
                ) : (
                    selectedProducts.map(product => (
                        <div key={product.id} className="promo-selected-item">
                            <div className="promo-selected-item-info">
                                <div className="promo-selected-item-name">{product.name}</div>
                                <div className="promo-selected-item-sku">{product.sku}</div>
                            </div>
                            <button
                                type="button"
                                className="btn-remove-product"
                                onClick={() => onRemoveProduct(product.id, type)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
