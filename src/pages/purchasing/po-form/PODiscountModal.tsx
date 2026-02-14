interface IPODiscountModalProps {
  discountAmount: number
  discountPercentage: number | null
  onDiscountChange: (amount: number, percentage: number | null) => void
  onApply: () => void
  onClose: () => void
}

export function PODiscountModal({
  discountAmount,
  discountPercentage,
  onDiscountChange,
  onApply,
  onClose,
}: IPODiscountModalProps) {
  const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl w-[420px] max-w-[90vw] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Order Discount</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Fixed Amount (IDR)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={discountAmount}
              onChange={e => onDiscountChange(parseFloat(e.target.value) || 0, null)}
              aria-label="Fixed discount amount"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={discountPercentage || ''}
              onChange={e => onDiscountChange(0, parseFloat(e.target.value) || null)}
              aria-label="Discount percentage"
              className={inputClass}
            />
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <button
            className="py-2.5 px-5 bg-transparent border border-white/10 rounded-xl text-white text-sm font-medium transition-all hover:border-white/20"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="py-2.5 px-5 bg-[var(--color-gold)] text-black font-bold text-sm rounded-xl transition-all hover:bg-[var(--color-gold)]/90"
            onClick={onApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
