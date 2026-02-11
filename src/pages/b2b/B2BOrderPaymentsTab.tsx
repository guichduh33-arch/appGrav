import { CreditCard } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import { formatDate, PAYMENT_METHODS } from './b2bOrderDetailHelpers'
import type { Payment } from './b2bOrderDetailTypes'

interface B2BOrderPaymentsTabProps {
    payments: Payment[]
}

export default function B2BOrderPaymentsTab({ payments }: B2BOrderPaymentsTabProps) {
    if (payments.length === 0) {
        return (
            <div className="b2b-payments-list">
                <div className="empty-state">
                    <CreditCard size={32} />
                    <p>No payments recorded</p>
                </div>
            </div>
        )
    }

    return (
        <div className="b2b-payments-list">
            <table>
                <thead>
                    <tr>
                        <th>Payment #</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id}>
                            <td><span className="payment-number">{payment.payment_number}</span></td>
                            <td>{formatDate(payment.payment_date)}</td>
                            <td>{PAYMENT_METHODS[payment.payment_method] || payment.payment_method}</td>
                            <td>{payment.reference_number || '-'}</td>
                            <td><strong>{formatCurrency(payment.amount)}</strong></td>
                            <td>
                                <span className={`payment-badge payment-badge--${payment.status}`}>
                                    {payment.status === 'completed' ? 'Completed' : payment.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
