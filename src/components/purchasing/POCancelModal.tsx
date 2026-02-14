import type { IPOCancelModalProps } from './types'

export function POCancelModal({
  isOpen,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
  isLoading,
}: IPOCancelModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl w-[480px] max-w-[90vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Confirm Cancellation</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--stone-text)]">Are you sure you want to cancel this order?</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Reason (optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all resize-none"
            />
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <button
            className="py-2.5 px-5 bg-transparent border border-white/10 rounded-xl text-white text-sm font-medium transition-all hover:border-white/20"
            onClick={onClose}
          >
            Go Back
          </button>
          <button
            className="py-2.5 px-5 bg-red-500 text-white font-bold text-sm rounded-xl transition-all hover:bg-red-500/90 disabled:opacity-40"
            onClick={onConfirm}
            disabled={isLoading}
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  )
}
