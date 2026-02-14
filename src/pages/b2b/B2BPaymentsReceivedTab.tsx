import { useNavigate } from 'react-router-dom'
import { CreditCard, Eye } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

interface Payment {
    id: string
    payment_number: string
    order_id: string
    order?: { order_number: string }
    customer?: { name: string; company_name: string | null }
    amount: number
    payment_method: string
    payment_date: string
    reference_number: string | null
}

interface B2BPaymentsReceivedTabProps {
    payments: Payment[]
    formatDate: (d: string | null) => string
}

const PAYMENT_METHODS: Record<string, { label: string; icon: string }> = {
    cash: { label: 'Cash', icon: '\uD83D\uDCB5' },
    transfer: { label: 'Transfer', icon: '\uD83C\uDFE6' },
    check: { label: 'Check', icon: '\uD83D\uDCDD' },
    card: { label: 'Card', icon: '\uD83D\uDCB3' },
    qris: { label: 'QRIS', icon: '\uD83D\uDCF1' },
    credit: { label: 'Credit', icon: '\uD83D\uDCCB' },
    store_credit: { label: 'Store Credit', icon: '\uD83C\uDFEA' },
}

const thClass = 'p-4 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] border-b border-white/5'
const tdClass = 'p-4 text-sm border-b border-white/5'

export default function B2BPaymentsReceivedTab({ payments, formatDate }: B2BPaymentsReceivedTabProps) {
    const navigate = useNavigate()

    if (payments.length === 0) {
        return (
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <CreditCard size={48} className="text-[var(--theme-text-muted)] opacity-30 mb-4" />
                    <h3 className="mb-1 text-white font-semibold">No payments</h3>
                    <p className="text-[var(--theme-text-muted)] text-sm">Received payments will appear here</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {['Payment #', 'Order', 'Customer', 'Date', 'Method', 'Reference', 'Amount', ''].map(th => (
                            <th key={th} className={thClass}>{th}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id} className="border-b border-white/5 [&:last-child]:border-b-0 hover:bg-white/[0.02]">
                            <td className={tdClass}>
                                <span className="font-mono font-semibold text-[var(--color-gold)]">{payment.payment_number}</span>
                            </td>
                            <td className={tdClass}>
                                <span
                                    className="font-mono font-medium text-blue-400 cursor-pointer hover:underline"
                                    onClick={() => navigate(`/b2b/orders/${payment.order_id}`)}
                                >
                                    {payment.order?.order_number}
                                </span>
                            </td>
                            <td className={tdClass}>
                                <span className="font-medium text-white">
                                    {payment.customer?.company_name || payment.customer?.name}
                                </span>
                            </td>
                            <td className={`${tdClass} text-[var(--theme-text-muted)]`}>{formatDate(payment.payment_date)}</td>
                            <td className={tdClass}>
                                <span className="inline-flex items-center gap-1 text-white">
                                    {PAYMENT_METHODS[payment.payment_method]?.icon}
                                    {PAYMENT_METHODS[payment.payment_method]?.label || payment.payment_method}
                                </span>
                            </td>
                            <td className={`${tdClass} text-[var(--theme-text-muted)]`}>{payment.reference_number || '-'}</td>
                            <td className={tdClass}>
                                <strong className="text-emerald-400">{formatCurrency(payment.amount)}</strong>
                            </td>
                            <td className={tdClass}>
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                                    onClick={() => navigate(`/b2b/orders/${payment.order_id}`)}
                                    title="View order"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
