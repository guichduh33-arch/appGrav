import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import { formatDate, PAYMENT_METHODS } from './b2bOrderDetailHelpers'
import type { Payment } from './b2bOrderDetailTypes'

interface B2BOrderPaymentsTabProps {
    payments: Payment[]
}

const paymentBadgeStyles: Record<string, string> = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export default function B2BOrderPaymentsTab({ payments }: B2BOrderPaymentsTabProps) {
    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-[var(--theme-text-muted)]">
                <CreditCard size={32} className="opacity-30 mb-3" />
                <p>No payments recorded</p>
            </div>
        )
    }

    return (
        <div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {['Payment #', 'Date', 'Method', 'Reference', 'Amount', 'Status'].map(th => (
                            <th key={th} className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] border-b border-white/5">{th}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id} className="border-b border-white/5 [&:last-child]:border-b-0">
                            <td className="p-4 text-sm">
                                <span className="font-mono font-semibold text-[var(--color-gold)]">{payment.payment_number}</span>
                            </td>
                            <td className="p-4 text-sm text-[var(--theme-text-muted)]">{formatDate(payment.payment_date)}</td>
                            <td className="p-4 text-sm text-white">{PAYMENT_METHODS[payment.payment_method] || payment.payment_method}</td>
                            <td className="p-4 text-sm text-[var(--theme-text-muted)]">{payment.reference_number || '-'}</td>
                            <td className="p-4 text-sm"><strong className="text-emerald-400">{formatCurrency(payment.amount)}</strong></td>
                            <td className="p-4 text-sm">
                                <span className={cn(
                                    'inline-flex px-2 py-1 rounded-full text-[10px] font-semibold uppercase border',
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
