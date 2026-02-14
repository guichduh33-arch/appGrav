import {
    Search, Trash2, Save, Package
} from 'lucide-react'
import type { ProductionItem, ProductWithSection } from '../StockProductionPage'

interface ProductionFormProps {
    sectionName: string
    searchQuery: string
    onSearchChange: (value: string) => void
    filteredProducts: ProductWithSection[]
    onAddProduct: (product: ProductWithSection) => void
    productionItems: ProductionItem[]
    onUpdateQuantity: (productId: string, field: 'quantity' | 'wasted', value: number) => void
    onUpdateUnit: (productId: string, unitName: string) => void
    onUpdateReason: (productId: string, reason: string) => void
    onRemoveItem: (productId: string) => void
    onClear: () => void
    onSave: () => void
    isSaving: boolean
}

export default function ProductionForm({
    sectionName,
    searchQuery,
    onSearchChange,
    filteredProducts,
    onAddProduct,
    productionItems,
    onUpdateQuantity,
    onUpdateUnit,
    onUpdateReason,
    onRemoveItem,
    onClear,
    onSave,
    isSaving,
}: ProductionFormProps) {
    return (
        <div className="bg-[var(--onyx-surface)] rounded-3xl p-8 border border-white/5 flex flex-col">
            {/* Header + Search */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-[var(--font-display)] text-2xl font-semibold text-white">
                    Production Entry
                    {sectionName && (
                        <span className="text-[var(--muted-smoke)] font-normal text-lg ml-2">
                            - {sectionName}
                        </span>
                    )}
                </h3>
                <div className="relative w-72">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-smoke)]"
                    />
                    <input
                        type="text"
                        placeholder="Search for a product..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-[var(--theme-bg-primary)] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                    />

                    {/* Search Results Dropdown */}
                    {searchQuery && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10 max-h-[300px] overflow-auto">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => onAddProduct(product)}
                                    className="w-full px-4 py-3 flex items-center gap-3 text-left border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-white">{product.name}</div>
                                        <div className="text-xs text-[var(--muted-smoke)]">{product.category?.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchQuery && filteredProducts.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--onyx-surface)] border border-white/10 rounded-xl p-4 text-center text-sm text-[var(--muted-smoke)]">
                            No product found in this section
                        </div>
                    )}
                </div>
            </div>

            {/* Production Items Table or Empty State */}
            {productionItems.length > 0 ? (
                <div className="flex-1 flex flex-col">
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">
                                        Waste
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">
                                        Note
                                    </th>
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {productionItems.map(item => (
                                    <tr key={item.productId} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-white">{item.name}</div>
                                            <div className="text-xs text-[var(--muted-smoke)]">{item.category}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => onUpdateQuantity(item.productId, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-20 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-center text-sm font-semibold text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    min="0"
                                                    step="0.1"
                                                    placeholder="0"
                                                />
                                                {item.availableUnits.length > 1 ? (
                                                    <select
                                                        value={item.selectedUnit}
                                                        onChange={(e) => onUpdateUnit(item.productId, e.target.value)}
                                                        className="px-2 py-2 bg-black/40 border border-white/10 rounded-lg text-xs font-medium text-[var(--stone-text)] focus:border-[var(--color-gold)] focus:outline-none cursor-pointer min-w-[70px]"
                                                        title="Select unit"
                                                        aria-label="Select unit"
                                                    >
                                                        {item.availableUnits.map(u => (
                                                            <option key={u.name} value={u.name}>
                                                                {u.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-xs font-medium text-[var(--muted-smoke)] min-w-[40px]">{item.selectedUnit}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    value={item.wasted}
                                                    onChange={(e) => onUpdateQuantity(item.productId, 'wasted', parseFloat(e.target.value) || 0)}
                                                    className={`w-20 px-3 py-2 border rounded-lg text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                                        item.wasted > 0
                                                            ? 'bg-red-900/20 border-red-900/30 text-red-400 focus:border-red-500'
                                                            : 'bg-black/40 border-white/10 text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
                                                    }`}
                                                    min="0"
                                                    step="0.1"
                                                    placeholder="0"
                                                />
                                                <span className={`text-xs font-medium min-w-[40px] ${item.wasted > 0 ? 'text-red-400' : 'text-[var(--muted-smoke)]'}`}>
                                                    {item.selectedUnit}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.wasted > 0 && (
                                                <input
                                                    type="text"
                                                    placeholder="Reason..."
                                                    value={item.wasteReason}
                                                    onChange={(e) => onUpdateReason(item.productId, e.target.value)}
                                                    className="w-full px-3 py-2 bg-black/40 border border-red-900/30 rounded-lg text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-red-500 focus:outline-none"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onRemoveItem(item.productId)}
                                                className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors"
                                                title="Delete row"
                                                aria-label="Delete row"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-end gap-3">
                        <button
                            onClick={onClear}
                            disabled={isSaving}
                            className="px-6 py-3 border border-white/10 rounded-xl text-sm font-medium text-white hover:border-white/20 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="px-6 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-black font-bold text-sm rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-[var(--color-gold)]/20 transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Submit Production'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 rounded-full bg-[var(--theme-bg-primary)] flex items-center justify-center mb-6">
                        <Package size={36} className="text-[var(--muted-smoke)]/50" />
                    </div>
                    <h4 className="text-lg font-medium text-white mb-2">No product added</h4>
                    <p className="text-[var(--muted-smoke)] text-sm max-w-xs">
                        Search for a product from the {sectionName || 'selected'} section to start recording today's production.
                    </p>
                </div>
            )}
        </div>
    )
}
