import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Eye, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/helpers'

interface RecentOrder {
    id: string
    order_number: string
    customer?: {
        name: string
        company_name: string | null
    }
    total_amount: number
    status: string
    payment_status: string
    order_date: string
}

interface B2BRecentOrdersProps {
    orders: RecentOrder[]
    loading: boolean
}

const statusBadgeStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    processing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ready: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    partially_delivered: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

const paymentBadgeStyles: Record<string, string> = {
    paid: 'text-emerald-400',
    unpaid: 'text-red-400',
    partial: 'text-amber-400',
}

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    confirmed: 'Confirmed',
    processing: 'Processing',
    ready: 'Ready',
    partially_delivered: 'Partial Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}

export default function B2BRecentOrders({ orders, loading }: B2BRecentOrdersProps) {
    const navigate = useNavigate()

    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 bg-transparent border-none text-[var(--color-gold)] text-sm font-medium cursor-pointer transition-all hover:brightness-110"
                    onClick={() => navigate('/b2b/orders')}
                >
                    View All <ArrowRight size={16} />
                </button>
            </div>
            {loading ? (
                <div className="flex items-center justify-center p-16 text-[var(--theme-text-muted)]">
                    <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <FileText size={48} className="text-[var(--theme-text-muted)] opacity-30 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-1">No B2B Orders</h3>
                    <p className="text-[var(--theme-text-muted)] text-sm mb-6">Create your first wholesale order</p>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm"
                        onClick={() => navigate('/b2b/orders/new')}
                    >
                        <Plus size={18} />
                        New Order
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {['Order #', 'Client', 'Date', 'Amount', 'Status', 'Payment', ''].map(th => (
                                    <th key={th} className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] border-b border-white/5">{th}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr
                                    key={order.id}
                                    onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                    className="cursor-pointer border-b border-white/5 hover:bg-white/[0.02] [&:last-child]:border-b-0"
                                >
                                    <td className="p-4 text-sm">
                                        <span className="font-mono font-semibold text-[var(--color-gold)]">
                                            {order.order_number}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-white">{order.customer?.company_name || order.customer?.name || '-'}</td>
                                    <td className="p-4 text-sm text-[var(--theme-text-muted)]">{formatDate(order.order_date)}</td>
                                    <td className="p-4 text-sm text-white font-semibold">{formatCurrency(order.total_amount)}</td>
                                    <td className="p-4 text-sm">
                                        <span className={cn(
                                            'inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase border',
                                            statusBadgeStyles[order.status] || ''
                                        )}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 text-sm',
                                            paymentBadgeStyles[order.payment_status] || ''
                                        )}>
                                            {order.payment_status === 'paid' ? '\u2713 Paid' : order.payment_status === 'partial' ? '\u25D0 Partial' : '\u25CB Unpaid'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <button
                                            type="button"
                                            className="w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                                            title="View details"
                                            aria-label="View order details"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/b2b/orders/${order.id}`)
                                            }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
