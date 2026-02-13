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
    <div className="py-6">
      <div className="flex justify-between items-baseline mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
          {status === 'complete' ? 'Payment Complete' : 'Total Amount'}
        </span>
        <span className="text-sm text-[var(--theme-text-muted)]">
          {formatPrice(totalPaid)} / {formatPrice(total)}
        </span>
      </div>
      <div className="text-4xl font-light text-[var(--color-gold)] tracking-tight mb-4">
        {formatPrice(total)}
      </div>
      <div className="h-1 bg-white/10 rounded overflow-hidden">
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
        <p className="mt-2 text-sm text-[var(--theme-text-muted)] text-right">
          Remaining: <strong className="text-white">{formatPrice(remainingAmount)}</strong>
        </p>
      )}
    </div>
  )
})
