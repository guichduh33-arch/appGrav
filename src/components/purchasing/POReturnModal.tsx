import type { IPOReturnModalProps } from './types'

const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
const labelClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"

export function POReturnModal({
  isOpen,
  item,
  formState,
  onFormChange,
  onSubmit,
  onClose,
}: IPOReturnModalProps) {
  if (!isOpen || !item) {
    return null
  }

  const maxReturnQuantity =
    parseFloat(item.quantity_received.toString()) - parseFloat(item.quantity_returned.toString())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl w-[480px] max-w-[90vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Item Return</h2>
          <p className="text-sm text-[var(--muted-smoke)] mt-1">{item.product_name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Quantity to return *</label>
            <input
              type="number"
              min="0"
              max={maxReturnQuantity}
              step="0.01"
              value={formState.quantity}
              onChange={(e) =>
                onFormChange({ ...formState, quantity: parseFloat(e.target.value) || 0 })
              }
              className={inputClass}
            />
            <span className="text-[10px] text-[var(--muted-smoke)]">
              Max: {maxReturnQuantity.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Reason *</label>
            <select
              value={formState.reason}
              onChange={(e) => onFormChange({ ...formState, reason: e.target.value })}
              className={inputClass}
            >
              <option value="damaged" className="bg-[var(--onyx-surface)]">Damaged</option>
              <option value="wrong_item" className="bg-[var(--onyx-surface)]">Wrong item</option>
              <option value="quality_issue" className="bg-[var(--onyx-surface)]">Quality issue</option>
              <option value="excess_quantity" className="bg-[var(--onyx-surface)]">Excess quantity</option>
              <option value="other" className="bg-[var(--onyx-surface)]">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Details</label>
            <textarea
              rows={3}
              value={formState.reason_details}
              onChange={(e) => onFormChange({ ...formState, reason_details: e.target.value })}
              placeholder="Enter additional details..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Refund amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.refund_amount}
              onChange={(e) =>
                onFormChange({ ...formState, refund_amount: parseFloat(e.target.value) || 0 })
              }
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
            onClick={onSubmit}
          >
            Submit Return
          </button>
        </div>
      </div>
    </div>
  )
}
