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
        <div className="mt-6 p-6 bg-kraft rounded-[10px] border border-parchment" style={style}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <div className="font-display text-lg font-semibold text-charcoal">{title}</div>
                    <div className="text-xs text-smoke italic">{subtitle}</div>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2.5 font-body text-[0.85rem] font-semibold text-gold-dark bg-flour border-[1.5px] border-gold rounded-md cursor-pointer transition-all duration-normal hover:bg-gold hover:text-white"
                    onClick={onOpenSearch}
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>

            {showSearch && (
                <div className="relative mb-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke" />
                        <input
                            type="text"
                            className="w-full py-3.5 pl-11 pr-4 font-body text-[0.95rem] bg-flour border-[1.5px] border-parchment rounded-lg transition-all duration-normal focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15)]"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Search for a product..."
                            autoFocus
                        />
                    </div>
                    {searchTerm && (
                        <div className="absolute top-full left-0 right-0 max-h-[280px] overflow-y-auto bg-flour border-[1.5px] border-gold border-t-0 rounded-b-lg shadow-[0_8px_24px_rgba(45,42,36,0.25)] z-[100]">
                            {filteredProducts.slice(0, 8).map(product => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between py-3.5 px-4 cursor-pointer transition-colors duration-fast border-b border-kraft last:border-b-0 hover:bg-kraft"
                                    onClick={() => onAddProduct(product, type)}
                                >
                                    <div>
                                        <div className="font-medium text-charcoal">{product.name}</div>
                                        <div className="text-xs text-smoke">{product.sku}</div>
                                    </div>
                                    <div className="font-semibold text-gold-dark">
                                        {formatCurrency(product.retail_price || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-3">
                {selectedProducts.length === 0 ? (
                    <div className="text-center py-8 px-4 text-smoke italic">
                        {emptyText}
                    </div>
                ) : (
                    selectedProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-4 bg-flour border border-parchment rounded-lg transition-all duration-fast hover:border-gold hover:shadow-[0_2px_8px_rgba(45,42,36,0.12)]">
                            <div className="flex-1">
                                <div className="font-semibold text-charcoal mb-1">{product.name}</div>
                                <div className="text-xs text-smoke">{product.sku}</div>
                            </div>
                            <button
                                type="button"
                                className="p-2 bg-transparent border-none cursor-pointer text-smoke rounded-md transition-all duration-fast hover:bg-[rgba(181,68,43,0.1)] hover:text-danger"
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
