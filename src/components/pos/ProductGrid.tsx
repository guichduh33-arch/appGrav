import { useMemo, memo, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import type { Product } from '../../types/database'
import { formatPrice } from '../../utils/helpers'
import { useStockLevelsOffline, TStockStatus } from '@/hooks/offline/useStockLevelsOffline'
import { StockBadge } from './StockBadge'
import { cn } from '@/lib/utils'

interface ProductGridProps {
    products: Product[]
    onProductClick: (product: Product, variants?: Product[]) => void
    isLoading?: boolean
}

interface ProductCardProps {
    product: Product & { category?: { color: string | null } | null }
    stockStatus: TStockStatus | null
    stockQuantity?: number
    minStockLevel?: number
    onClick: (product: Product) => void
}

const ProductCard = memo(function ProductCard({
    product,
    stockStatus,
    stockQuantity,
    minStockLevel,
    onClick,
}: ProductCardProps) {
    const isOutOfStock = stockStatus === 'out_of_stock'
    const showStockBadge = stockStatus === 'warning' || stockStatus === 'critical' || stockStatus === 'out_of_stock'
    const [bouncing, setBouncing] = useState(false)
    const categoryColor = (product as any).category?.color || null

    const handleClick = useCallback(() => {
        setBouncing(true)
        setTimeout(() => setBouncing(false), 300)
        onClick(product)
    }, [onClick, product])

    return (
        <button
            className={cn(
                'group relative flex flex-col bg-[var(--theme-bg-secondary)] border border-white/5 rounded-xl p-0 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden h-full text-left',
                'hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[var(--color-gold)]/5 hover:border-[var(--color-gold)]/40',
                'active:scale-[0.98]',
                isOutOfStock && 'opacity-60 hover:opacity-80',
                bouncing && 'pos-bounce'
            )}
            onClick={handleClick}
        >
            {/* Category color dot */}
            {categoryColor && (
                <div
                    className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full z-[3]"
                    style={{ backgroundColor: categoryColor }}
                />
            )}

            {/* Stock badge - warning/critical only */}
            {showStockBadge && stockStatus && (
                <div className="absolute top-1.5 right-1.5 z-[2] pointer-events-none">
                    <StockBadge
                        status={stockStatus}
                        stockQuantity={stockQuantity}
                        minLevel={minStockLevel}
                    />
                </div>
            )}

            {/* Product image or initial */}
            <div className={cn(
                'w-full aspect-square bg-[var(--theme-bg-primary)] flex items-center justify-center overflow-hidden shrink-0 rounded-t-xl',
                isOutOfStock && 'grayscale-[50%]'
            )}>
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                        }}
                    />
                ) : null}
                <span
                    className="text-3xl font-display font-bold text-[var(--theme-text-muted)] flex items-center justify-center"
                    style={{ display: product.image_url ? 'none' : 'flex' }}
                >
                    {product.name.charAt(0).toUpperCase()}
                </span>
            </div>

            {/* Product info */}
            <div className="px-5 pt-4 pb-1 text-sm font-semibold text-[var(--theme-text-primary)] leading-snug line-clamp-2 flex-1">
                {product.name}
            </div>

            <div className="px-5 pt-0.5 pb-4 text-sm font-semibold text-[var(--color-gold)] tracking-wider">
                {formatPrice(product.retail_price || 0)}
            </div>
        </button>
    )
})

function ProductGrid({ products, onProductClick, isLoading }: ProductGridProps) {
    // Get product IDs for stock lookup
    const productIds = useMemo(() => products.map(p => p.id), [products])
    const { stockLevels, getStockStatus } = useStockLevelsOffline(productIds)

    // Create a map for quick stock level lookup
    const stockMap = useMemo(() => {
        return new Map(stockLevels.map(s => [s.product_id, s]))
    }, [stockLevels])

    const handleProductClick = useCallback((product: Product) => {
        const status = getStockStatus(product.id)
        if (status === 'out_of_stock') {
            toast.info(`${product.name} is out of stock`, {
                description: 'You can still add it for pre-order',
                duration: 2000,
            })
        }
        onProductClick(product)
    }, [getStockStatus, onProductClick])

    if (isLoading) {
        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 w-full pb-xl">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-[200px] bg-[var(--theme-bg-secondary)] rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-[var(--theme-text-muted)] text-center">
                <Search size={48} className="mb-md opacity-50" />
                <p>No items found</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 w-full pb-xl">
            {products.map((product) => {
                const stockStatus = getStockStatus(product.id)
                const stockLevel = stockMap.get(product.id)

                return (
                    <ProductCard
                        key={product.id}
                        product={product}
                        stockStatus={stockStatus}
                        stockQuantity={stockLevel?.quantity}
                        minStockLevel={stockLevel?.min_stock_level}
                        onClick={handleProductClick}
                    />
                )
            })}
        </div>
    )
}

export default memo(ProductGrid)
