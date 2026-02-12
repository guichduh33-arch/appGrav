import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import { formatDate, PAYMENT_METHODS } from './b2bOrderDetailHelpers'
import type { Payment } from './b2bOrderDetailTypes'

interface B2BOrderPaymentsTabProps {
    payments: Payment[]
}

const paymentBadgeStyles: Record<string, string> = {
    completed: 'bg-[rgba(107,142,107,0.15)] text-success',
    pending: 'bg-[rgba(234,192,134,0.2)] text-[#b38600]',
}

export default function B2BOrderPaymentsTab({ payments }: B2BOrderPaymentsTabProps) {
    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-2xl text-[var(--color-gris-chaud)]">
                <CreditCard size={32} className="opacity-30 mb-sm" />
                <p>No payments recorded</p>
            </div>
        )
    }

    return (
        <div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Payment #</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Date</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Method</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Reference</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Amount</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id} className="[&:last-child>td]:border-b-0">
                            <td className="p-md text-sm border-b border-border">
                                <span className="font-mono font-semibold text-[var(--color-rose-poudre)]">{payment.payment_number}</span>
                            </td>
                            <td className="p-md text-sm border-b border-border">{formatDate(payment.payment_date)}</td>
                            <td className="p-md text-sm border-b border-border">{PAYMENT_METHODS[payment.payment_method] || payment.payment_method}</td>
                            <td className="p-md text-sm border-b border-border">{payment.reference_number || '-'}</td>
                            <td className="p-md text-sm border-b border-border"><strong>{formatCurrency(payment.amount)}</strong></td>
                            <td className="p-md text-sm border-b border-border">
                                <span className={cn(
                                    'inline-flex px-2 py-1 rounded-xl text-[10px] font-semibold uppercase',
                                    paymentBadgeStyles[payment.status] || ''
                                )}>
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
