import { DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import type { IPOSummarySidebarProps } from './types'

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pending',
  partial: 'Partial',
  paid: 'Paid',
  unpaid: 'Unpaid',
  partially_paid: 'Partially Paid',
}

const paymentBadgeClass: Record<string, string> = {
  paid: 'border-emerald-400/40 text-emerald-400',
  partially_paid: 'border-orange-400/40 text-orange-400',
  unpaid: 'border-red-400/40 text-red-400',
  pending: 'border-amber-400/40 text-amber-400',
  partial: 'border-orange-400/40 text-orange-400',
}

export function POSummarySidebar({ purchaseOrder, isOnline, onMarkAsPaid }: IPOSummarySidebarProps) {
  const getPaymentStatusLabel = (status: string) => paymentStatusLabels[status] || status
  const getBadgeClass = (status: string) => paymentBadgeClass[status] || paymentBadgeClass.pending

  return (
    <div className="sticky top-6 flex flex-col gap-6 max-lg:static">
      {/* Financial Summary */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-5">
          Financial Summary
        </h3>
        <div className="flex justify-between items-center py-2.5 text-sm text-[var(--muted-smoke)]">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--stone-text)]">{formatCurrency(parseFloat(purchaseOrder.subtotal.toString()))}</span>
        </div>
        {parseFloat(purchaseOrder.discount_amount.toString()) > 0 && (
          <div className="flex justify-between items-center py-2.5 text-sm text-emerald-400">
            <span>Discount</span>
            <span>-{formatCurrency(parseFloat(purchaseOrder.discount_amount.toString()))}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-2.5 text-sm text-[var(--muted-smoke)]">
          <span>Tax</span>
          <span className="font-medium text-[var(--stone-text)]">{formatCurrency(parseFloat(purchaseOrder.tax_amount.toString()))}</span>
        </div>
        {purchaseOrder.shipping_cost > 0 && (
          <div className="flex justify-between items-center py-2.5 text-sm text-[var(--muted-smoke)]">
            <span>Shipping</span>
            <span className="font-medium text-[var(--stone-text)]">{formatCurrency(purchaseOrder.shipping_cost)}</span>
          </div>
        )}
        <div className="h-px bg-white/10 my-3"></div>
        <div className="flex justify-between items-center py-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-smoke)]">Total</span>
          <span className="text-xl font-bold text-[var(--color-gold)]">
            {formatCurrency(parseFloat(purchaseOrder.total_amount.toString()))}
          </span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-5">
          Payment Status
        </h3>
        <div className="flex flex-col gap-3">
          <span className={`inline-flex self-start px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border ${getBadgeClass(purchaseOrder.payment_status)}`}>
            {getPaymentStatusLabel(purchaseOrder.payment_status)}
          </span>
          {purchaseOrder.payment_date && (
            <div className="text-xs text-[var(--muted-smoke)]">
              Paid on{' '}
              {new Date(purchaseOrder.payment_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
        {purchaseOrder.payment_status !== 'paid' && (
          <button
            className="w-full flex items-center justify-center gap-2 mt-5 py-3 bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-emerald-500/90 disabled:opacity-40"
            onClick={onMarkAsPaid}
            disabled={!isOnline}
          >
            <DollarSign size={16} />
            Mark as Paid
          </button>
        )}
      </div>
    </div>
  )
}
