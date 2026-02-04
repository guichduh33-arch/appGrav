import type { Product } from '../../types/database'
import { formatPrice } from '../../utils/helpers'
import './ProductGrid.css'

interface ProductGridProps {
    products: Product[]
    onProductClick: (product: Product, variants?: Product[]) => void
    isLoading?: boolean
}

// Extract base name (without variant info in parentheses)


export default function ProductGrid({ products, onProductClick, isLoading }: ProductGridProps) {
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
            {products.map((product) => (
                <button
                    key={product.id}
                    className="pos-product-card"
                    onClick={() => onProductClick(product)}
                >
                    {/* Product image or emoji */}
                    <div className="pos-product-card__image">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} />
                        ) : (
                            <span>{getProductEmoji(product)}</span>
                        )}
                    </div>

                    {/* Product info */}
                    <div className="pos-product-card__name">
                        {product.name}
                    </div>

                    <div className="pos-product-card__price">
                        {formatPrice(product.retail_price || 0)}
                    </div>
                </button>
            ))}
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
