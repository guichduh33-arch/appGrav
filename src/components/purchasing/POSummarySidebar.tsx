import { DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import type { IPOSummarySidebarProps } from './types'

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pending',
  partial: 'Partial',
  paid: 'Paid',
}

export function POSummarySidebar({ purchaseOrder, isOnline, onMarkAsPaid }: IPOSummarySidebarProps) {
  const getPaymentStatusLabel = (status: string) => paymentStatusLabels[status] || status

  return (
    <div className="po-detail-page__sidebar">
      {/* Summary */}
      <div className="po-detail-card">
        <h3>Financial summary</h3>
        <div className="po-summary-line">
          <span>Subtotal</span>
          <span>{formatCurrency(parseFloat(purchaseOrder.subtotal.toString()))}</span>
        </div>
        {parseFloat(purchaseOrder.discount_amount.toString()) > 0 && (
          <div className="po-summary-line po-summary-line--discount">
            <span>Discount</span>
            <span>-{formatCurrency(parseFloat(purchaseOrder.discount_amount.toString()))}</span>
          </div>
        )}
        <div className="po-summary-line">
          <span>Tax</span>
          <span>{formatCurrency(parseFloat(purchaseOrder.tax_amount.toString()))}</span>
        </div>
        <div className="po-summary-divider"></div>
        <div className="po-summary-total">
          <span>Total</span>
          <span>{formatCurrency(parseFloat(purchaseOrder.total_amount.toString()))}</span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="po-detail-card">
        <h3>Payment status</h3>
        <div className="po-payment-status">
          <span className={`status-badge status-badge--${purchaseOrder.payment_status}`}>
            {getPaymentStatusLabel(purchaseOrder.payment_status)}
          </span>
          {purchaseOrder.payment_date && (
            <div className="po-payment-date">
              Paid on{' '}
              {new Date(purchaseOrder.payment_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
        {purchaseOrder.payment_status !== 'paid' && (
          <button
            className="btn btn-success btn-block"
            onClick={onMarkAsPaid}
            disabled={!isOnline}
            style={{ marginTop: 'var(--space-md)' }}
          >
            <DollarSign size={18} />
            Mark as paid
          </button>
        )}
      </div>
    </div>
  )
}
