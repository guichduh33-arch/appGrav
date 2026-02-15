import { Check, CheckCircle, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import { formatCurrency } from './ordersPageHelpers';
import type { OrderStats } from './ordersPageHelpers';

interface OrdersStatsProps {
    stats: OrderStats;
}

const OrdersStats = ({ stats }: OrdersStatsProps) => {
    return (
        <div className="grid grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-1 gap-3 mb-6">
            {/* Total Orders */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={18} className="text-[var(--color-gold)]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                        Total Orders
                    </span>
                    <span className="text-xl font-bold text-white">{stats.total}</span>
                </div>
            </div>

            {/* Total Amount */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign size={18} className="text-[var(--color-gold)]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                        Total Amount
                    </span>
                    <span className="text-xl font-bold text-white">{formatCurrency(stats.totalAmount)}</span>
                </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-sky-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                        Completion
                    </span>
                    <span className="text-xl font-bold text-sky-400">{stats.completionRate}%</span>
                </div>
            </div>

            {/* Paid */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check size={18} className="text-emerald-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                        Paid
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-emerald-400">{stats.paid}</span>
                        <span className="text-sm font-mono text-[var(--theme-text-muted)]">
                            {formatCurrency(stats.paidAmount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Unpaid */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-red-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                        Unpaid
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-red-400">{stats.unpaid}</span>
                        <span className="text-sm font-mono text-[var(--theme-text-muted)]">
                            {formatCurrency(stats.unpaidAmount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersStats;
