import { useNavigate } from 'react-router-dom'
import { Coffee, Croissant, Package, Eye, DollarSign } from 'lucide-react'
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

interface ProductListViewProps {
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

const TH_CLASS = "text-left py-3.5 px-4 bg-white/[0.02] font-body text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-wider border-b border-white/5 sticky top-0 backdrop-blur-sm"
const TH_RIGHT_CLASS = "text-right py-3.5 px-4 bg-white/[0.02] font-body text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-wider border-b border-white/5 sticky top-0 backdrop-blur-sm"

export default function ProductListView({ products }: ProductListViewProps) {
    const navigate = useNavigate()

    return (
        <div className="bg-[var(--onyx-surface)] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={TH_CLASS}>Product</th>
                        <th className={TH_CLASS}>SKU</th>
                        <th className={TH_CLASS}>Type</th>
                        <th className={TH_CLASS}>Category</th>
                        <th className={TH_RIGHT_CLASS}>Retail</th>
                        <th className={TH_RIGHT_CLASS}>Wholesale</th>
                        <th className={TH_CLASS}>Status</th>
                        <th className={TH_CLASS}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr
                            key={product.id}
                            className={cn(
                                'cursor-pointer transition-all duration-200 hover:bg-white/[0.02] border-b border-white/5 border-l-2 border-l-transparent hover:border-l-[var(--color-gold)]',
                                !product.is_active && 'opacity-40'
                            )}
                            onClick={() => navigate(`/products/${product.id}`)}
                        >
                            <td className="py-3 px-4 font-body text-sm">
                                <span className="font-display font-semibold text-white">{product.name}</span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[var(--theme-text-muted)] text-xs">{product.sku}</td>
                            <td className="py-3 px-4 font-body text-sm">
                                <span className={cn(
                                    'inline-flex items-center gap-1 py-0.5 px-2 rounded-full font-body text-[0.6rem] font-semibold',
                                    getTypeBadgeClasses(product.product_type)
                                )}>
                                    {getProductTypeIcon(product.product_type)}
                                    {getProductTypeLabel(product.product_type)}
                                </span>
                            </td>
                            <td className="py-3 px-4 font-body text-sm">
                                {product.category && (
                                    <span
                                        className="inline-block py-0.5 px-2 rounded-full font-body text-[0.6rem] text-white"
                                        style={{ backgroundColor: product.category.color || '#6366f1' }}
                                    >
                                        {product.category.name}
                                    </span>
                                )}
                            </td>
                            <td className="text-right py-3 px-4 font-mono text-sm font-medium text-[var(--color-gold)]">
                                {formatCurrency(product.retail_price)}
                            </td>
                            <td className="text-right py-3 px-4 font-mono text-sm font-medium text-white">
                                {product.wholesale_price ? formatCurrency(product.wholesale_price) : <span className="text-[var(--theme-text-muted)]">&mdash;</span>}
                            </td>
                            <td className="py-3 px-4 font-body text-sm">
                                <span className={cn(
                                    'py-0.5 px-2.5 rounded-full font-body text-[0.6rem] font-semibold',
                                    product.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                )}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="py-3 px-4 font-body text-sm">
                                <div className="flex gap-1">
                                    <button
                                        className="w-8 h-8 p-0 rounded-lg bg-transparent border border-white/10 text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-black"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`) }}
                                        title="View"
                                        aria-label="View"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        className="w-8 h-8 p-0 rounded-lg bg-transparent border border-white/10 text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-black"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}/pricing`) }}
                                        title="Prices"
                                        aria-label="Prices"
                                    >
                                        <DollarSign size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
