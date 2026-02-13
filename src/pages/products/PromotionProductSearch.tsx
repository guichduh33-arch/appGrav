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
        <div className="mt-8 p-8 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)] shadow-inner" style={style}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="font-display text-xl font-semibold text-[var(--theme-text-primary)]">{title}</div>
                    <div className="text-sm text-[var(--theme-text-secondary)] opacity-50 italic">{subtitle}</div>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 px-6 py-3 font-body text-sm font-bold text-white bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)] rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-[var(--color-gold)]/20"
                    onClick={onOpenSearch}
                >
                    <Plus size={18} />
                    Add Selection
                </button>
            </div>

            {showSearch && (
                <div className="relative mb-6 animate-sh-slide-down">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gold)] opacity-50" />
                        <input
                            id={`search-${type}`}
                            type="text"
                            className="w-full py-4 pl-12 pr-4 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] placeholder:opacity-30"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Type to find artistic creations..."
                            title="Search for products to include"
                            autoFocus
                        />
                    </div>
                    {searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-2 max-h-[320px] overflow-y-auto bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-2xl shadow-2xl z-[100] backdrop-blur-xl">
                            {filteredProducts.slice(0, 8).map(product => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between py-4 px-6 cursor-pointer transition-all duration-200 border-b border-[var(--theme-border)] last:border-b-0 hover:bg-[var(--theme-bg-tertiary)] group"
                                    onClick={() => onAddProduct(product, type)}
                                >
                                    <div className="flex flex-col">
                                        <div className="font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--color-gold)] transition-colors">{product.name}</div>
                                        <div className="text-xs text-[var(--theme-text-secondary)] opacity-40">{product.sku}</div>
                                    </div>
                                    <div className="font-display font-bold text-[var(--color-gold)]">
                                        {formatCurrency(product.retail_price || 0)}
                                    </div>
                                </div>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="p-8 text-center text-[var(--theme-text-secondary)] opacity-40 italic">
                                    No masterpieces found under that name.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {selectedProducts.length === 0 ? (
                    <div className="text-center py-12 px-6 text-[var(--theme-text-secondary)] opacity-30 italic bg-[var(--theme-bg-secondary)]/30 rounded-2xl border border-dashed border-[var(--theme-border)]">
                        {emptyText}
                    </div>
                ) : (
                    selectedProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-5 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-2xl transition-all duration-300 hover:border-[var(--color-gold-muted)] group">
                            <div className="flex-1">
                                <div className="font-semibold text-[var(--theme-text-primary)] mb-1 group-hover:text-[var(--color-gold)] transition-colors">{product.name}</div>
                                <div className="text-xs text-[var(--theme-text-secondary)] opacity-40">{product.sku}</div>
                            </div>
                            <button
                                type="button"
                                className="w-10 h-10 flex items-center justify-center bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] cursor-pointer text-[var(--theme-text-secondary)] rounded-xl transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500"
                                onClick={() => onRemoveProduct(product.id, type)}
                                title="Remove item"
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
