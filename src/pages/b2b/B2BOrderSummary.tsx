import { formatCurrency } from '../../utils/helpers'
import type { B2BOrder } from './b2bOrderDetailTypes'

interface B2BOrderSummaryProps {
    order: B2BOrder
}

export default function B2BOrderSummary({ order }: B2BOrderSummaryProps) {
    return (
        <div className="b2b-detail-sidebar">
            <div className="b2b-detail-summary">
                <h3>Summary</h3>

                <div className="summary-line">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discount_amount > 0 && (
                    <div className="summary-line summary-line--discount">
                        <span>Discount {order.discount_type === 'percentage' ? `(${order.discount_value}%)` : ''}</span>
                        <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                )}

                <div className="summary-line">
                    <span>Tax ({order.tax_rate}%)</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total">
                    <span>Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                </div>

                {order.notes && (
                    <div className="summary-notes">
                        <h4>Notes</h4>
                        <p>{order.notes}</p>
                    </div>
                )}

                {order.internal_notes && (
                    <div className="summary-notes internal">
                        <h4>Internal Notes</h4>
                        <p>{order.internal_notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
