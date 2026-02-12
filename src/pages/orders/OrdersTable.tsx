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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center p-2xl gap-md" style={{ color: 'var(--color-gris-chaud)' }}>
                    <RefreshCw size={32} className="animate-spin" />
                    <p className="m-0">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (paginatedOrders.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center p-2xl text-center" style={{ color: 'var(--color-gris-chaud)' }}>
                    <div className="text-[4rem] mb-md opacity-40">{'\uD83D\uDCCB'}</div>
                    <div className="text-lg mb-xs">No orders found</div>
                    <div className="text-sm">Adjust your filters to see more results</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="ot-table w-full border-collapse max-md:block max-md:overflow-x-auto">
                <thead>
                    <tr>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Order #</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Time</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Type</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Customer</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Items</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Amount</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Status</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}>Payment</th>
                        <th className="p-md text-left text-xs font-semibold uppercase tracking-[0.5px] border-b border-border" style={{ color: 'var(--color-gris-chaud)', background: 'var(--color-blanc-creme)' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedOrders.map(order => (
                        <tr
                            key={order.id}
                            className={cn(
                                'ot-row cursor-pointer transition-[background] duration-150',
                                order.payment_status !== 'paid' && 'ot-row--unpaid'
                            )}
                            onClick={() => onSelectOrder(order)}
                        >
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                                <span className="font-mono font-semibold" style={{ color: 'var(--color-rose-poudre)' }}>
                                    #{order.order_number}
                                </span>
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                                <div>{formatTime(order.created_at)}</div>
                                <div className="text-[12px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                    {formatDate(order.created_at)}
                                </div>
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                                <span className={cn(
                                    'ot-type-badge inline-flex items-center gap-xs py-xs px-sm rounded-sm text-xs font-medium',
                                    order.order_type === 'dine_in' && 'ot-type--dine_in',
                                    order.order_type === 'takeaway' && 'ot-type--takeaway',
                                    order.order_type === 'delivery' && 'ot-type--delivery',
                                    order.order_type === 'b2b' && 'ot-type--b2b'
                                )}>
                                    {getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}
                                    {order.table_number && ` - T${order.table_number}`}
                                </span>
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-gris-chaud)' }}>
                                {order.customer_name || '-'}
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-gris-chaud)' }}>
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                                <span className="font-semibold font-mono">{formatCurrency(order.total)}</span>
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                                <span className={cn(
                                    'ot-status inline-flex py-xs px-sm rounded-xl text-[11px] font-semibold uppercase tracking-[0.5px]',
                                    order.status === 'pending' && 'bg-info-bg text-info',
                                    order.status === 'preparing' && 'bg-warning-bg text-warning',
                                    order.status === 'ready' && 'bg-success-bg text-success',
                                    order.status === 'completed' && 'ot-status--completed',
                                    order.status === 'cancelled' && 'ot-status--cancelled'
                                )}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                                <div className="flex flex-col gap-1">
                                    <span className={cn(
                                        'inline-flex items-center gap-xs text-sm font-medium',
                                        order.payment_status === 'paid' ? 'text-success' : 'text-[var(--color-urgent)]'
                                    )}>
                                        {order.payment_status === 'paid' ? (
                                            <><Check size={14} /> Paid</>
                                        ) : (
                                            <><Clock size={14} /> Unpaid</>
                                        )}
                                    </span>
                                    {order.payment_status === 'paid' && order.payment_method && (
                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-gris-chaud)' }}>
                                            {getPaymentIcon(order.payment_method)}
                                            {getPaymentMethodLabel(order.payment_method)}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="p-md text-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                                <button
                                    className="ot-view-btn flex items-center gap-1 py-xs px-sm bg-transparent border border-border rounded-sm text-xs font-medium cursor-pointer transition-all duration-fast ease-standard"
                                    style={{ color: 'var(--color-gris-chaud)' }}
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
            <div className="flex items-center justify-between p-md border-t border-border" style={{ background: 'var(--color-blanc-creme)' }}>
                <div className="text-sm" style={{ color: 'var(--color-gris-chaud)' }}>
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTotal)} of {filteredTotal} orders
                </div>
                <div className="flex gap-xs">
                    <button
                        className="ot-page-btn w-9 h-9 flex items-center justify-center bg-white border border-border rounded-sm cursor-pointer transition-all duration-fast ease-standard disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: 'var(--color-brun-chocolat)' }}
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
                                    'ot-page-btn w-9 h-9 flex items-center justify-center border rounded-sm cursor-pointer transition-all duration-fast ease-standard',
                                    currentPage === pageNum
                                        ? 'text-white'
                                        : 'bg-white border-border'
                                )}
                                style={currentPage === pageNum
                                    ? { background: 'var(--color-rose-poudre)', borderColor: 'var(--color-rose-poudre)' }
                                    : { color: 'var(--color-brun-chocolat)' }
                                }
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="ot-page-btn w-9 h-9 flex items-center justify-center bg-white border border-border rounded-sm cursor-pointer transition-all duration-fast ease-standard disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: 'var(--color-brun-chocolat)' }}
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        aria-label="Next Page"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Scoped styles for hover effects and variants */}
            <style>{`
                .ot-row:hover td { background: rgba(186,144,162,0.05); }
                .ot-row--unpaid { background: rgba(239,68,68,0.03); }
                .ot-row--unpaid:hover td { background: rgba(239,68,68,0.08); }
                .ot-type-badge { background: var(--color-blanc-creme); }
                .ot-type--dine_in { background: rgba(123,163,181,0.1); color: #7BA3B5; }
                .ot-type--takeaway { background: rgba(234,192,134,0.1); color: #D4A574; }
                .ot-type--delivery { background: rgba(186,144,162,0.1); color: #BA90A2; }
                .ot-type--b2b { background: rgba(107,142,107,0.1); color: #5A7D5A; }
                .ot-status--completed { background: rgba(107,142,107,0.2); color: #5A7D5A; }
                .ot-status--cancelled { background: var(--color-urgent-bg); color: var(--color-urgent); }
                .ot-view-btn:hover {
                    border-color: var(--color-rose-poudre);
                    color: var(--color-rose-poudre);
                    background: rgba(186,144,162,0.05);
                }
                .ot-page-btn:hover:not(:disabled) {
                    border-color: var(--color-rose-poudre);
                    color: var(--color-rose-poudre);
                }
            `}</style>
        </div>
    );
};

export default OrdersTable;
