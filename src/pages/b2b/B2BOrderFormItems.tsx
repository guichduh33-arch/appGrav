import { Plus, Trash2, Search, Package } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

interface Product {
    id: string
    name: string
    sku: string
    retail_price: number | null
    wholesale_price: number | null
    unit: string
    current_stock: number
}

interface OrderItem {
    id?: string
    product_id: string | null
    product_name: string
    product_sku: string
    quantity: number
    unit: string
    unit_price: number
    discount_percentage: number
    discount_amount: number
    line_total: number
}

interface B2BOrderFormItemsProps {
    items: OrderItem[]
    products: Product[]
    productSearch: string
    showProductSearch: number | null
    filteredProducts: Product[]
    onItemChange: (index: number, field: keyof OrderItem, value: unknown) => void
    onProductSelect: (index: number, product: Product) => void
    onAddItem: () => void
    onRemoveItem: (index: number) => void
    onProductSearchChange: (value: string) => void
    onToggleProductSearch: (index: number | null) => void
}

const thClass = 'px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] border-b border-white/5'
const inputClass = 'w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none'

export default function B2BOrderFormItems({
    items,
    productSearch,
    showProductSearch,
    filteredProducts,
    onItemChange,
    onProductSelect,
    onAddItem,
    onRemoveItem,
    onProductSearchChange,
    onToggleProductSearch,
}: B2BOrderFormItemsProps) {
    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Package size={20} className="text-[var(--color-gold)]" />
                    Items
                </h2>
                <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/10 text-white text-sm font-medium rounded-xl transition-colors hover:border-white/20"
                    onClick={onAddItem}
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>

            <div className="overflow-x-auto overflow-y-visible mt-4">
                <table className="w-full border-collapse overflow-visible">
                    <thead>
                        <tr>
                            <th className={thClass}>Product</th>
                            <th className={thClass} style={{ width: '80px' }}>Qty</th>
                            <th className={thClass} style={{ width: '100px' }}>Unit Price</th>
                            <th className={thClass} style={{ width: '80px' }}>Discount %</th>
                            <th className={thClass} style={{ width: '120px' }}>Total</th>
                            <th className={thClass} style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} className="border-b border-white/5 [&:last-child]:border-b-0">
                                <td className="px-4 py-2.5 text-sm align-middle overflow-visible">
                                    <div className="relative z-10">
                                        <div
                                            className="px-4 py-2.5 border border-white/10 rounded-xl text-sm cursor-pointer bg-black/40 min-w-[200px] hover:border-[var(--color-gold)] text-white"
                                            onClick={() => onToggleProductSearch(showProductSearch === index ? null : index)}
                                        >
                                            {item.product_name || (
                                                <span className="text-[var(--theme-text-muted)]">Search a product...</span>
                                            )}
                                        </div>
                                        {showProductSearch === index && (
                                            <div className="absolute top-full left-0 mt-1 bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-lg z-[1000] min-w-[350px] max-h-[400px] overflow-hidden flex flex-col">
                                                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5">
                                                    <Search size={16} className="text-[var(--theme-text-muted)] shrink-0" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={productSearch}
                                                        onChange={(e) => onProductSearchChange(e.target.value)}
                                                        autoFocus
                                                        className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[var(--theme-text-muted)]"
                                                    />
                                                </div>
                                                <div className="overflow-y-auto max-h-[350px]">
                                                    {filteredProducts.map(product => (
                                                        <div
                                                            key={product.id}
                                                            className="px-4 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.04]"
                                                            onClick={() => onProductSelect(index, product)}
                                                        >
                                                            <div className="font-medium text-white mb-0.5">
                                                                {product.name}
                                                            </div>
                                                            <div className="flex gap-4 text-xs text-[var(--theme-text-muted)]">
                                                                <span>{product.sku}</span>
                                                                <span className="text-[var(--color-gold)]">{formatCurrency(product.wholesale_price || product.retail_price || 0)}</span>
                                                                <span>Stock: {product.current_stock}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 text-sm align-middle">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => onItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-4 py-2.5 text-sm align-middle">
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.unit_price}
                                        onChange={(e) => onItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-4 py-2.5 text-sm align-middle">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={item.discount_percentage}
                                        onChange={(e) => onItemChange(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-4 py-2.5 text-sm align-middle">
                                    <strong className="text-[var(--color-gold)]">{formatCurrency(item.line_total)}</strong>
                                </td>
                                <td className="px-4 py-2.5 text-sm align-middle">
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-red-500/50 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                        onClick={() => onRemoveItem(index)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
