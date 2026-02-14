import { RefreshCw, Check, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    formatCurrency,
    formatTime,
    formatDate,
    getOrderTypeIcon,
    getOrderTypeLabel,
    getStatusLabel,
    getPaymentIcon,
    getPaymentMethodLabel,
    ITEMS_PER_PAGE,
} from './ordersPageHelpers';
import type { Order } from './ordersPageHelpers';

interface OrdersTableProps {
    paginatedOrders: Order[];
    filteredTotal: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    onSelectOrder: (order: Order) => void;
    onPageChange: (page: number) => void;
}

const statusBadge = (status: string) => {
    const base = 'inline-flex py-1 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border';
    switch (status) {
        case 'pending': return cn(base, 'bg-blue-500/10 text-blue-400 border-blue-500/20');
        case 'preparing': return cn(base, 'bg-amber-500/10 text-amber-400 border-amber-500/20');
        case 'ready': return cn(base, 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20');
        case 'completed': return cn(base, 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20');
        case 'cancelled': return cn(base, 'bg-red-500/10 text-red-400 border-red-500/20');
        default: return cn(base, 'bg-white/5 text-[var(--theme-text-muted)] border-white/10');
    }
};

const typeBadge = (type: string) => {
    const base = 'inline-flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium';
    switch (type) {
        case 'dine_in': return cn(base, 'bg-blue-500/10 text-blue-400');
        case 'takeaway': return cn(base, 'bg-amber-500/10 text-amber-400');
        case 'delivery': return cn(base, 'bg-purple-500/10 text-purple-400');
        case 'b2b': return cn(base, 'bg-emerald-500/10 text-emerald-400');
        default: return cn(base, 'bg-white/5 text-[var(--theme-text-muted)]');
    }
};

const thClass = 'p-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] bg-black/20';

const OrdersTable = ({
    paginatedOrders,
    filteredTotal,
    currentPage,
    totalPages,
    isLoading,
    onSelectOrder,
    onPageChange,
}: OrdersTableProps) => {
    if (isLoading) {
        return (
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex flex-col items-center justify-center p-12 gap-3 text-[var(--theme-text-muted)]">
                    <RefreshCw size={32} className="animate-spin text-[var(--color-gold)]" />
                    <p className="m-0 text-sm">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (paginatedOrders.length === 0) {
        return (
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--theme-text-muted)]">
                    <div className="text-5xl mb-3 opacity-30">No orders</div>
                    <div className="text-sm">Adjust your filters to see more results</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full border-collapse max-md:block max-md:overflow-x-auto">
                <thead>
                    <tr>
                        <th className={thClass}>Order #</th>
                        <th className={thClass}>Time</th>
                        <th className={thClass}>Type</th>
                        <th className={thClass}>Customer</th>
                        <th className={thClass}>Items</th>
                        <th className={thClass}>Amount</th>
                        <th className={thClass}>Status</th>
                        <th className={thClass}>Payment</th>
                        <th className={thClass}></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {paginatedOrders.map(order => (
                        <tr
                            key={order.id}
                            className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                            onClick={() => onSelectOrder(order)}
                        >
                            <td className="p-3 text-sm">
                                <span className="font-mono font-semibold text-[var(--color-gold)]">
                                    #{order.order_number}
                                </span>
                            </td>
                            <td className="p-3 text-sm">
                                <div className="text-white">{formatTime(order.created_at)}</div>
                                <div className="text-[11px] text-[var(--theme-text-muted)]">
                                    {formatDate(order.created_at)}
                                </div>
                            </td>
                            <td className="p-3 text-sm">
                                <span className={typeBadge(order.order_type)}>
                                    {getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}
                                    {order.table_number && ` - T${order.table_number}`}
                                </span>
                            </td>
                            <td className="p-3 text-sm text-[var(--theme-text-muted)]">
                                {order.customer_name || '-'}
                            </td>
                            <td className="p-3 text-sm text-[var(--theme-text-muted)]">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </td>
                            <td className="p-3 text-sm">
                                <span className="font-semibold font-mono text-white">{formatCurrency(order.total)}</span>
                            </td>
                            <td className="p-3 text-sm">
                                <span className={statusBadge(order.status)}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </td>
                            <td className="p-3 text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className={cn(
                                        'inline-flex items-center gap-1 text-sm font-medium',
                                        order.payment_status === 'paid' ? 'text-emerald-400' : 'text-red-400'
                                    )}>
                                        {order.payment_status === 'paid' ? (
                                            <><Check size={14} /> Paid</>
                                        ) : (
                                            <><Clock size={14} /> Unpaid</>
                                        )}
                                    </span>
                                    {order.payment_status === 'paid' && order.payment_method && (
                                        <span className="flex items-center gap-1 text-xs text-[var(--theme-text-muted)]">
                                            {getPaymentIcon(order.payment_method)}
                                            {getPaymentMethodLabel(order.payment_method)}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="p-3 text-sm">
                                <button
                                    className="flex items-center gap-1 py-1 px-2.5 bg-transparent border border-white/10 rounded-lg text-xs font-medium text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectOrder(order);
                                    }}
                                >
                                    <Eye size={14} /> Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-3 border-t border-white/5 bg-black/20">
                <div className="text-sm text-[var(--theme-text-muted)]">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTotal)} of {filteredTotal} orders
                </div>
                <div className="flex gap-1.5">
                    <button
                        className="w-9 h-9 flex items-center justify-center bg-transparent border border-white/10 rounded-lg cursor-pointer transition-all text-[var(--theme-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-[var(--theme-text-muted)]"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        return (
                            <button
                                key={pageNum}
                                className={cn(
                                    'w-9 h-9 flex items-center justify-center border rounded-lg cursor-pointer transition-all text-sm font-medium',
                                    currentPage === pageNum
                                        ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold'
                                        : 'bg-transparent border-white/10 text-[var(--theme-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-white'
                                )}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="w-9 h-9 flex items-center justify-center bg-transparent border border-white/10 rounded-lg cursor-pointer transition-all text-[var(--theme-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-[var(--theme-text-muted)]"
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        aria-label="Next Page"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersTable;
