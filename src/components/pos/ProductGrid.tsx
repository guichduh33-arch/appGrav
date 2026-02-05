import { useMemo } from 'react'
import { toast } from 'sonner'
import type { Product } from '../../types/database'
import { formatPrice } from '../../utils/helpers'
import { useStockLevelsOffline } from '@/hooks/offline/useStockLevelsOffline'
import { StockBadge } from './StockBadge'
import './ProductGrid.css'

interface ProductGridProps {
    products: Product[]
    onProductClick: (product: Product, variants?: Product[]) => void
    isLoading?: boolean
}

export default function ProductGrid({ products, onProductClick, isLoading }: ProductGridProps) {
    // Get product IDs for stock lookup
    const productIds = useMemo(() => products.map(p => p.id), [products])
    const { stockLevels, getStockStatus } = useStockLevelsOffline(productIds)

    // Create a map for quick stock level lookup
    const stockMap = useMemo(() => {
        return new Map(stockLevels.map(s => [s.product_id, s]))
    }, [stockLevels])

    const handleProductClick = (product: Product) => {
        const status = getStockStatus(product.id)
        if (status === 'out_of_stock') {
            toast.info(`${product.name} is out of stock`, {
                description: 'You can still add it for pre-order',
                duration: 2000,
            })
        }
        onProductClick(product)
    }
    if (isLoading) {
        return (
            <div className="products-grid">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="pos-product-card-skeleton" />
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="products-empty">
                <span className="products-empty__icon">🔍</span>
                <p>No items found</p>
            </div>
        )
    }

    return (
        <div className="products-grid">
            {products.map((product) => {
                const stockStatus = getStockStatus(product.id)
                const stockLevel = stockMap.get(product.id)
                const isOutOfStock = stockStatus === 'out_of_stock'

                return (
                    <button
                        key={product.id}
                        className={`pos-product-card ${isOutOfStock ? 'pos-product-card--out-of-stock' : ''}`}
                        onClick={() => handleProductClick(product)}
                    >
                        {/* Stock badge with tooltip */}
                        {stockStatus && (
                            <div className="pos-product-card__stock-badge">
                                <StockBadge
                                    status={stockStatus}
                                    stockQuantity={stockLevel?.quantity}
                                    minLevel={stockLevel?.min_stock_level}
                                />
                            </div>
                        )}

                        {/* Product image or emoji */}
                        <div className="pos-product-card__image">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                        if (fallback) fallback.style.display = 'block'
                                    }}
                                />
                            ) : null}
                            <span
                                className="pos-product-card__emoji"
                                style={{ display: product.image_url ? 'none' : 'block' }}
                            >
                                {getProductEmoji(product)}
                            </span>
                        </div>

                        {/* Product info */}
                        <div className="pos-product-card__name">
                            {product.name}
                        </div>

                        <div className="pos-product-card__price">
                            {formatPrice(product.retail_price || 0)}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

function getProductEmoji(product: Product): string {
    const name = product.name.toLowerCase()

    if (name.includes('cappuccino') || name.includes('latte') || name.includes('espresso')) return '☕'
    if (name.includes('matcha')) return '🍵'
    if (name.includes('croissant')) return '🥐'
    if (name.includes('pain au chocolat') || name.includes('chocolatine')) return '🍫'
    if (name.includes('bagel')) return '🥯'
    if (name.includes('sandwich') || name.includes('burger')) return '🥪'
    if (name.includes('cheesecake')) return '🍰'
    if (name.includes('bread') || name.includes('pain') || name.includes('sourdough')) return '🍞'
    if (name.includes('juice') || name.includes('jus')) return '🧃'
    if (name.includes('smoothie')) return '🥤'

    return '🥐'
}
