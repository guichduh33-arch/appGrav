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
    title, subtitle, emptyText, type,
    selectedProducts, filteredProducts, showSearch, searchTerm,
    onSearchTermChange, onOpenSearch, onAddProduct, onRemoveProduct, style
}: PromotionProductSearchProps) {
    return (
        <div className="mt-8 p-8 bg-black/20 rounded-xl border border-white/5" style={style}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="font-display text-xl font-semibold text-white">{title}</div>
                    <div className="text-sm text-[var(--theme-text-muted)] italic">{subtitle}</div>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 px-6 py-3 font-body text-sm font-bold text-black bg-[var(--color-gold)] rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(201,165,92,0.25)]"
                    onClick={onOpenSearch}
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {showSearch && (
                <div className="relative mb-6">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gold)] opacity-50" />
                        <input
                            id={`search-${type}`}
                            type="text"
                            className="w-full py-4 pl-12 pr-4 text-white bg-black/40 border border-white/10 rounded-xl transition-all focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Search products..."
                            title="Search for products to include"
                            autoFocus
                        />
                    </div>
                    {searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-2 max-h-[320px] overflow-y-auto bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-2xl z-[100]">
                            {filteredProducts.slice(0, 8).map(product => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between py-4 px-6 cursor-pointer transition-all border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] group"
                                    onClick={() => onAddProduct(product, type)}
                                >
                                    <div className="flex flex-col">
                                        <div className="font-medium text-white group-hover:text-[var(--color-gold)] transition-colors">{product.name}</div>
                                        <div className="text-xs text-[var(--theme-text-muted)]">{product.sku}</div>
                                    </div>
                                    <div className="font-display font-bold text-[var(--color-gold)]">
                                        {formatCurrency(product.retail_price || 0)}
                                    </div>
                                </div>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="p-8 text-center text-[var(--theme-text-muted)] italic">
                                    No products found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {selectedProducts.length === 0 ? (
                    <div className="text-center py-12 px-6 text-[var(--theme-text-muted)] italic bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                        {emptyText}
                    </div>
                ) : (
                    selectedProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl transition-all hover:border-white/10 group">
                            <div className="flex-1">
                                <div className="font-semibold text-white mb-1 group-hover:text-[var(--color-gold)] transition-colors">{product.name}</div>
                                <div className="text-xs text-[var(--theme-text-muted)]">{product.sku}</div>
                            </div>
                            <button
                                type="button"
                                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 cursor-pointer text-[var(--theme-text-secondary)] rounded-lg transition-all hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                                onClick={() => onRemoveProduct(product.id, type)}
                                title="Remove"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
