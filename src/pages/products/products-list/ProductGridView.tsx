import { useNavigate } from 'react-router-dom'
import { Coffee, Croissant, Package, Eye, Edit, DollarSign, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'

interface Category {
    id: string
    name: string
    color: string | null
}

interface Product {
    id: string
    name: string
    sku: string
    category_id: string | null
    category?: Category
    product_type: string
    retail_price: number
    wholesale_price: number | null
    cost_price: number
    pos_visible: boolean
    is_active: boolean
    image_url: string | null
}

interface ProductGridViewProps {
    products: Product[]
}

function getProductTypeIcon(type: string) {
    switch (type) {
        case 'finished': return <Coffee size={16} />
        case 'semi_finished': return <Croissant size={16} />
        case 'raw_material': return <Package size={16} />
        default: return <Package size={16} />
    }
}

function getProductTypeLabel(type: string) {
    switch (type) {
        case 'finished': return 'Finished Product'
        case 'semi_finished': return 'Semi-Finished'
        case 'raw_material': return 'Raw Material'
        default: return type
    }
}

function getTypeBadgeClasses(type: string) {
    switch (type) {
        case 'finished': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        case 'semi_finished': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        case 'raw_material': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
        default: return ''
    }
}

export default function ProductGridView({ products }: ProductGridViewProps) {
    const navigate = useNavigate()

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 md:grid-cols-1">
            {products.map(product => (
                <div
                    key={product.id}
                    className={cn(
                        'bg-[var(--onyx-surface)] rounded-2xl border border-white/5 overflow-hidden cursor-pointer transition-all duration-300 relative shadow-sm group',
                        'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[var(--color-gold)]/30',
                        !product.is_active && 'opacity-50'
                    )}
                    onClick={() => navigate(`/products/${product.id}`)}
                >
                    <div className="h-[160px] bg-gradient-to-br from-white/[0.02] to-[rgba(201,165,92,0.03)] relative flex items-center justify-center">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-[var(--theme-text-muted)] opacity-40 [&>svg]:w-10 [&>svg]:h-10">
                                {getProductTypeIcon(product.product_type)}
                            </div>
                        )}
                        <span className={cn(
                            'absolute top-3 left-3 flex items-center gap-1 py-1 px-2.5 rounded-full font-body text-[0.6rem] font-semibold uppercase tracking-[0.04em] backdrop-blur-sm',
                            getTypeBadgeClasses(product.product_type)
                        )}>
                            {getProductTypeIcon(product.product_type)}
                            {getProductTypeLabel(product.product_type)}
                        </span>
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <button
                                className="w-8 h-8 p-0 rounded-lg bg-black/50 backdrop-blur-sm border-none text-white/80 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:text-black"
                                onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`) }}
                                title="View details"
                                aria-label="View details"
                            >
                                <Eye size={14} />
                            </button>
                            <button
                                className="w-8 h-8 p-0 rounded-lg bg-black/50 backdrop-blur-sm border-none text-white/80 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:text-black"
                                onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}/edit`) }}
                                title="Edit"
                                aria-label="Edit"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                className="w-8 h-8 p-0 rounded-lg bg-black/50 backdrop-blur-sm border-none text-white/80 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:text-black"
                                onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}/pricing`) }}
                                title="Price by category"
                                aria-label="Price by category"
                            >
                                <DollarSign size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="m-0 mb-1 font-display text-base font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">{product.name}</h3>
                        <span className="block font-mono text-[0.65rem] text-[var(--theme-text-muted)] mb-2">{product.sku}</span>
                        {product.category && (
                            <span
                                className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full font-body text-[0.65rem] text-white mb-2"
                                style={{ backgroundColor: product.category.color || '#6366f1' }}
                            >
                                <Tag size={10} />
                                {product.category.name}
                            </span>
                        )}
                        <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="font-body text-[0.55rem] text-[var(--theme-text-muted)] uppercase tracking-[0.08em]">Retail</span>
                                <span className="font-mono text-sm font-semibold text-[var(--color-gold)]">{formatCurrency(product.retail_price)}</span>
                            </div>
                            {product.wholesale_price && (
                                <div className="flex flex-col">
                                    <span className="font-body text-[0.55rem] text-[var(--theme-text-muted)] uppercase tracking-[0.08em]">Wholesale</span>
                                    <span className="font-mono text-sm font-semibold text-white">{formatCurrency(product.wholesale_price)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-1.5 py-2.5 px-4 bg-white/[0.02] border-t border-white/5">
                        <span className={cn(
                            'py-0.5 px-2.5 rounded-full font-body text-[0.6rem] font-semibold',
                            product.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        )}>
                            {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={cn(
                            'py-0.5 px-2.5 rounded-full font-body text-[0.6rem] font-medium bg-white/5 text-[var(--theme-text-secondary)]',
                            product.pos_visible && 'bg-sky-500/10 text-sky-400'
                        )}>
                            {product.pos_visible ? 'POS' : 'Hidden'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
