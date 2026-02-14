import { formatCurrency } from '@/utils/helpers'
import type { IPOReturnsSectionProps } from './types'

const returnReasonLabels: Record<string, string> = {
  damaged: 'Damaged',
  wrong_item: 'Wrong item',
  quality_issue: 'Quality issue',
  excess_quantity: 'Excess quantity',
  other: 'Other',
}

const statusBadgeClass: Record<string, string> = {
  pending: 'border-amber-400/40 text-amber-400',
  approved: 'border-emerald-400/40 text-emerald-400',
  completed: 'border-emerald-400/40 text-emerald-400',
  rejected: 'border-red-400/40 text-red-400',
}

export function POReturnsSection({ returns }: IPOReturnsSectionProps) {
  const getReturnReasonLabel = (reason: string): string => {
    return returnReasonLabels[reason] || reason
  }

  if (returns.length === 0) {
    return null
  }

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-6 pb-4 border-b border-white/5">
        Returns
      </h2>
      <div className="flex flex-col gap-4">
        {returns.map((ret) => (
          <div key={ret.id} className="p-4 bg-black/20 rounded-lg border-l-3 border-l-red-400">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm text-white">{ret.item?.product_name}</span>
              <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded-full border ${statusBadgeClass[ret.status] || statusBadgeClass.pending}`}>
                {ret.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs text-[var(--muted-smoke)]">
              <div>
                Quantity:{' '}
                <strong className="text-[var(--stone-text)]">{parseFloat(ret.quantity_returned.toString())}</strong>
              </div>
              <div>
                Reason:{' '}
                <strong className="text-[var(--stone-text)]">{getReturnReasonLabel(ret.reason)}</strong>
              </div>
              {ret.reason_details && <div className="text-[var(--stone-text)]">{ret.reason_details}</div>}
              {ret.refund_amount && (
                <div>
                  Refund:{' '}
                  <strong className="text-[var(--stone-text)]">{formatCurrency(parseFloat(ret.refund_amount.toString()))}</strong>
                </div>
              )}
              <div className="mt-1 text-[10px] text-[var(--theme-text-muted)]">
                {new Date(ret.return_date).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
