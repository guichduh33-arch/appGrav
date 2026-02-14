import { X, Save } from 'lucide-react'
import type { IWasteProduct as Product } from '@/hooks/inventory/useWasteRecords'

const WASTE_REASONS = [
    { value: 'expired', label: 'Expired' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'quality', label: 'Quality Issue' },
    { value: 'spillage', label: 'Spillage' },
    { value: 'theft', label: 'Theft' },
    { value: 'other', label: 'Other' }
]

interface WastageFormProps {
    selectedProduct: Product | null
    quantity: string
    reason: string
    notes: string
    productSearch: string
    filteredProducts: Product[]
    isSaving: boolean
    onProductSearchChange: (value: string) => void
    onSelectProduct: (product: Product) => void
    onClearProduct: () => void
    onQuantityChange: (value: string) => void
    onReasonChange: (value: string) => void
    onNotesChange: (value: string) => void
    onSave: () => void
    onClose: () => void
}

export default function WastageForm({
    selectedProduct,
    quantity,
    reason,
    notes,
    productSearch,
    filteredProducts,
    isSaving,
    onProductSearchChange,
    onSelectProduct,
    onClearProduct,
    onQuantityChange,
    onReasonChange,
    onNotesChange,
    onSave,
    onClose,
}: WastageFormProps) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-[var(--onyx-surface)] border border-white/10 rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">Record Waste</h3>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-smoke)] hover:bg-white/5 hover:text-white transition-colors"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex flex-col gap-5">
                    {/* Product Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                            Product *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search product..."
                                value={productSearch}
                                onChange={(e) => onProductSearchChange(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                            />
                            {productSearch && !selectedProduct && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] max-h-[200px] overflow-y-auto z-10">
                                    {filteredProducts.slice(0, 10).map(product => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-b-0"
                                            onClick={() => onSelectProduct(product)}
                                        >
                                            <span className="text-sm font-medium text-white">{product.name}</span>
                                            <span className="text-xs text-[var(--muted-smoke)]">
                                                Stock: {product.current_stock} {product.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedProduct && (
                            <div className="flex items-center justify-between px-4 py-3 bg-black/20 border border-white/5 rounded-xl">
                                <div>
                                    <span className="text-sm font-medium text-white">{selectedProduct.name}</span>
                                    <span className="ml-3 text-xs text-[var(--muted-smoke)]">
                                        Current stock: {selectedProduct.current_stock} {selectedProduct.unit}
                                    </span>
                                </div>
                                <button
                                    onClick={onClearProduct}
                                    className="p-1 text-[var(--muted-smoke)] hover:text-red-400 transition-colors"
                                    title="Clear"
                                    aria-label="Clear"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            max={selectedProduct?.current_stock || 0}
                            value={quantity}
                            onChange={(e) => onQuantityChange(e.target.value)}
                            placeholder="0"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Reason */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                            Reason *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            aria-label="Select reason"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all cursor-pointer"
                        >
                            {WASTE_REASONS.map(r => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            placeholder="Additional details..."
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5 bg-black/20">
                    <button
                        className="px-5 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-white hover:border-white/20 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-5 py-2.5 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-black font-bold text-sm rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-[var(--color-gold)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}
