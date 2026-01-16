import { useTranslation } from 'react-i18next'
import type { Product } from '../../types/database'
import { formatPrice } from '../../utils/helpers'
import './ProductGrid.css'

interface ProductGridProps {
    products: Product[]
    onProductClick: (product: Product, variants?: Product[]) => void
    isLoading?: boolean
}

// Extract base name (without variant info in parentheses)
function getBaseName(name: string): string {
    return name.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

// Group products by base name
function groupProducts(products: Product[]): Map<string, Product[]> {
    const groups = new Map<string, Product[]>()

    products.forEach(product => {
        const baseName = getBaseName(product.name)
        if (!groups.has(baseName)) {
            groups.set(baseName, [])
        }
        groups.get(baseName)!.push(product)
    })

    return groups
}

// Get the representative product for a group (first one with an image, or just first)
function getRepresentativeProduct(variants: Product[]): Product {
    return variants.find(p => p.image_url) || variants[0]
}

// Get price range for variants
function getPriceRange(variants: Product[]): { min: number; max: number } {
    const prices = variants.map(v => v.retail_price || 0)
    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    }
}

export default function ProductGrid({ products, onProductClick, isLoading }: ProductGridProps) {
    const { t } = useTranslation()
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
                <p>{t('inventory_table.no_items')}</p>
            </div>
        )
    }

    // Group products by base name
    const groupedProducts = groupProducts(products)

    return (
        <div className="products-grid">
            {Array.from(groupedProducts.entries()).map(([baseName, variants]) => {
                const representativeProduct = getRepresentativeProduct(variants)
                const hasVariants = variants.length > 1
                const priceRange = getPriceRange(variants)

                return (
                    <button
                        key={baseName}
                        className="pos-product-card"
                        onClick={() => onProductClick(representativeProduct, hasVariants ? variants : undefined)}
                    >
                        {/* Variant badge */}
                        {hasVariants && (
                            <span className="pos-product-card__badge variant-badge">
                                {variants.length} {t('pos.products.options_label')}
                            </span>
                        )}

                        {/* Product image or emoji */}
                        <div className="pos-product-card__image">
                            {representativeProduct.image_url ? (
                                <img src={representativeProduct.image_url} alt={baseName} />
                            ) : (
                                <span>{getProductEmoji(representativeProduct)}</span>
                            )}
                        </div>

                        {/* Product info */}
                        <div className="pos-product-card__name">
                            {baseName}
                        </div>

                        <div className="pos-product-card__price">
                            {priceRange.min === priceRange.max ? (
                                formatPrice(priceRange.min)
                            ) : (
                                <>
                                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                                </>
                            )}
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
