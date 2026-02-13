import { memo } from 'react'
import { formatPrice } from '@/utils/helpers'

interface PaymentOrderSummaryProps {
  totalPaid: number
  total: number
  remainingAmount: number
  status: string
  progressPercent: number
}

export const PaymentOrderSummary = memo(function PaymentOrderSummary({
  totalPaid,
  total,
  remainingAmount,
  status,
  progressPercent,
}: PaymentOrderSummaryProps) {
  return (
    <div className="p-3 bg-white/5 rounded-lg border border-[var(--theme-border)]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
          {status === 'complete' ? 'Payment Complete' : 'Payment Progress'}
        </span>
        <span className="text-sm font-bold text-white">
          {formatPrice(totalPaid)} / {formatPrice(total)}
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: status === 'complete' ? 'var(--color-success)' : 'var(--color-gold)',
            boxShadow: status === 'complete' ? '0 0 10px rgba(34, 197, 94, 0.3)' : '0 0 10px rgba(200, 164, 91, 0.3)',
          }}
        />
      </div>
      {remainingAmount > 0 && (
        <p className="mt-1 text-sm text-white/70 text-right">
          Remaining: <strong className="text-white">{formatPrice(remainingAmount)}</strong>
        </p>
      )}
    </div>
  )
})
