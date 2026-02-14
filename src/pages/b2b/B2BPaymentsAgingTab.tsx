import { useNavigate } from 'react-router-dom'
import { BarChart3, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/helpers'
import type { IAgingReport, IOutstandingOrder } from '../../services/b2b/arService'

interface CustomerGroup {
    name: string
    orders: IOutstandingOrder[]
    totalDue: number
}

interface B2BPaymentsAgingTabProps {
    agingReport: IAgingReport | null
    agingLoading: boolean
    customerGroups: Record<string, CustomerGroup>
    onRefresh: () => void
    onOpenFIFO: (customerId: string, customerName: string) => void
}

export default function B2BPaymentsAgingTab({
    agingReport,
    agingLoading,
    customerGroups,
    onRefresh,
    onOpenFIFO,
}: B2BPaymentsAgingTabProps) {
    const navigate = useNavigate()

    if (agingLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 gap-4 text-[var(--theme-text-muted)] bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
                <span>Loading aging report...</span>
            </div>
        )
    }

    if (!agingReport) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <BarChart3 size={48} className="text-[var(--theme-text-muted)] opacity-30 mb-4" />
                <h3 className="mb-1 text-white font-semibold">No data available</h3>
                <p className="text-[var(--theme-text-muted)] text-sm">Aging report could not be loaded</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Aging Summary */}
            <div className="flex items-center justify-between bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Outstanding</span>
                    <span className="text-2xl font-bold text-[var(--color-gold)]">
                        {formatCurrency(agingReport.totalOutstanding)}
                    </span>
                    <span className="text-sm text-[var(--theme-text-muted)]">
                        {agingReport.totalOrders} order(s)
                    </span>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110 disabled:opacity-50"
                    onClick={onRefresh}
                    disabled={agingLoading}
                >
                    Refresh
                </button>
            </div>

            {/* Aging Buckets */}
            <div className="flex flex-col gap-6">
                {agingReport.buckets.map((bucket, idx) => {
                    const borderColor = idx === 0 ? 'border-l-emerald-500' : idx === 1 ? 'border-l-amber-500' : 'border-l-red-500'
                    return (
                        <div
                            key={bucket.label}
                            className={cn('bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden border-l-2', borderColor)}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                <h3 className="text-base font-semibold text-white">{bucket.label}</h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-[var(--color-gold)]">
                                        {formatCurrency(bucket.totalDue)}
                                    </span>
                                    <span className="text-sm text-[var(--theme-text-muted)]">
                                        {bucket.count} order(s)
                                    </span>
                                </div>
                            </div>

                            {bucket.orders.length > 0 ? (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            {['Order', 'Customer', 'Days Overdue', 'Amount Due'].map(th => (
                                                <th key={th} className="px-6 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">{th}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bucket.orders.map(order => (
                                            <tr
                                                key={order.id}
                                                className="cursor-pointer border-t border-white/5 hover:bg-white/[0.02]"
                                                onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                            >
                                                <td className="px-6 py-2.5 text-sm">
                                                    <span className="font-mono font-medium text-blue-400 cursor-pointer hover:underline">{order.order_number}</span>
                                                </td>
                                                <td className="px-6 py-2.5 text-sm text-white">{order.company_name || order.customer_name}</td>
                                                <td className="px-6 py-2.5 text-sm">
                                                    <span className={cn(
                                                        'inline-block px-2 py-0.5 rounded-full text-xs font-semibold border',
                                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                                        order.days_overdue > 60 && 'bg-red-500/10 text-red-400 border-red-500/20',
                                                        order.days_overdue > 30 && order.days_overdue <= 60 && 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    )}>
                                                        {order.days_overdue}d
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5 text-sm">
                                                    <strong className="text-white">{formatCurrency(order.amount_due)}</strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 text-center text-[var(--theme-text-muted)] text-sm">
                                    No orders in this range
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* FIFO Payment by Customer */}
            {Object.keys(customerGroups).length > 0 && (
                <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-1">
                        <DollarSign size={20} className="text-[var(--color-gold)]" />
                        Record FIFO Payment
                    </h3>
                    <p className="text-sm text-[var(--theme-text-muted)] mb-6">
                        Select a customer to allocate a payment across their oldest invoices first.
                    </p>
                    <div className="flex flex-col gap-3">
                        {Object.entries(customerGroups).map(([custId, group]) => (
                            <div key={custId} className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white">{group.name}</span>
                                    <span className="text-sm text-[var(--theme-text-muted)]">
                                        {group.orders.length} order(s) &middot; {formatCurrency(group.totalDue)} due
                                    </span>
                                </div>
                                <button
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110"
                                    onClick={() => onOpenFIFO(custId, group.name)}
                                >
                                    <DollarSign size={14} />
                                    Pay
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
