import { memo } from 'react'
import { Check, Printer, RotateCcw, Clock, Loader2 } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'

interface PaymentSuccessProps {
  payments: Array<{ method: string }>
  successChange: number
  isOnline: boolean
  isPrinting: boolean
  onPrint: () => void
  onNewOrder: () => void
}

export const PaymentSuccess = memo(function PaymentSuccess({
  payments,
  successChange,
  isOnline,
  isPrinting,
  onPrint,
  onNewOrder,
}: PaymentSuccessProps) {
  return (
    <div
      className="modal-backdrop is-active"
      onClick={(e) => e.target === e.currentTarget && onNewOrder()}
    >
      <div className="modal modal-sm is-active" style={{ background: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border-strong)' }}>
        <div className="flex flex-col items-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mb-6">
            <Check size={48} className="text-[var(--color-success)]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Payment successful!</h2>
          <p className="text-[var(--theme-text-secondary)] mb-6">
            {payments.length > 1 ? `${payments.length} payments processed` : 'Order completed'}
          </p>

          {successChange > 0 && (
            <div className="w-full p-4 mb-4 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 flex justify-between items-center">
              <span className="text-[var(--color-success-text)] font-semibold">Change given</span>
              <span className="text-2xl font-extrabold text-[var(--color-success-text)]">{formatPrice(successChange)}</span>
            </div>
          )}

          {!isOnline && (
            <div className="w-full p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-sm">
              <Clock size={18} />
              <span>Will sync when online</span>
            </div>
          )}

          <div className="flex gap-3 w-full mt-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-strong)] text-[var(--theme-text-secondary)] font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--theme-border-strong)] hover:text-white"
              onClick={onPrint}
              disabled={isPrinting}
            >
              {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-gold-dark to-gold text-black font-bold cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(200,164,91,0.3)]"
              onClick={onNewOrder}
            >
              <RotateCcw size={18} />
              New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
