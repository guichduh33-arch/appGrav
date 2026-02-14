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
      className="fixed inset-0 bg-[#0D0D0F]/95 backdrop-blur-sm flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal-backdrop)' }}
      onClick={(e) => e.target === e.currentTarget && onNewOrder()}
    >
      <div className="w-[450px] max-w-[90vw] rounded-2xl bg-[var(--theme-bg-secondary)] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col items-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mb-6">
            <Check size={48} className="text-[var(--color-success)]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Payment successful!</h2>
          <p className="text-[var(--theme-text-secondary)] mb-6">
            {payments.length > 1 ? `${payments.length} payments processed` : 'Order completed'}
          </p>

          {successChange > 0 && (
            <div className="w-full p-4 mb-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-success)]">Change given</span>
              <span className="text-2xl font-extrabold text-[var(--color-success)]">{formatPrice(successChange)}</span>
            </div>
          )}

          {!isOnline && (
            <div className="w-full p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-sm">
              <Clock size={18} />
              <span>Will sync when online</span>
            </div>
          )}

          <div className="flex gap-3 w-full mt-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-lg border border-white/10 bg-transparent text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-secondary)] cursor-pointer transition-all duration-200 hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={onPrint}
              disabled={isPrinting}
            >
              {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-lg bg-[var(--color-gold)] text-black text-[10px] font-bold uppercase tracking-[0.25em] cursor-pointer transition-all duration-200 shadow-lg shadow-[var(--color-gold)]/20 hover:brightness-110"
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
