import { useNavigate } from 'react-router-dom'
import { CheckCircle, CreditCard, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/helpers'

interface OutstandingOrder {
    id: string
    order_number: string
    customer?: { name: string; company_name: string | null }
    total_amount: number
    amount_due: number
    due_date: string | null
    payment_status: string
}

interface B2BPaymentsOutstandingTabProps {
    orders: OutstandingOrder[]
    formatDate: (d: string | null) => string
}

function isOverdue(dueDate: string | null) {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
}

export default function B2BPaymentsOutstandingTab({ orders, formatDate }: B2BPaymentsOutstandingTabProps) {
    const navigate = useNavigate()

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <CheckCircle size={48} className="text-[var(--theme-text-muted)] opacity-30 mb-4" />
                <h3 className="mb-1 text-white font-semibold">No outstanding amounts</h3>
                <p className="text-[var(--theme-text-muted)] text-sm">All payments are up to date</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
            {orders.map(order => (
                <div
                    key={order.id}
                    className={cn(
                        'bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 cursor-pointer transition-all hover:border-white/10',
                        isOverdue(order.due_date) && 'border-l-2 border-l-red-500'
                    )}
                    onClick={() => navigate(`/b2b/orders/${order.id}`)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-semibold text-[var(--color-gold)]">{order.order_number}</span>
                        {isOverdue(order.due_date) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[11px] font-semibold">
                                <AlertCircle size={14} />
                                Overdue
                            </span>
                        )}
                    </div>
                    <div className="font-medium text-white mb-4">
                        {order.customer?.company_name || order.customer?.name}
                    </div>
                    <div className="flex flex-wrap gap-6 py-4 border-t border-white/5 mb-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total</span>
                            <span className="font-semibold text-white">{formatCurrency(order.total_amount)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Amount Due</span>
                            <span className="font-semibold text-red-400">{formatCurrency(order.amount_due)}</span>
                        </div>
                        {order.due_date && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Due Date</span>
                                <span className={cn('font-semibold text-white', isOverdue(order.due_date) && 'text-red-400')}>
                                    {formatDate(order.due_date)}
                                </span>
                            </div>
                        )}
                    </div>
                    <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110">
                        <CreditCard size={16} />
                        Record Payment
                    </button>
                </div>
            ))}
        </div>
    )
}
