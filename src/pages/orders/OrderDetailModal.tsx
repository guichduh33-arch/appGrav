import { X, Hash, User, ShoppingBag, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderItemStatusBadge } from '../../components/orders/OrderItemStatusBadge';
import {
    formatCurrency,
    formatFullDate,
    getOrderTypeIcon,
    getOrderTypeLabel,
    getStatusLabel,
    getPaymentIcon,
    getPaymentMethodLabel,
} from './ordersPageHelpers';
import type { Order } from './ordersPageHelpers';

interface OrderDetailModalProps {
    order: Order;
    recentlyUpdatedItems: Set<string>;
    onClose: () => void;
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

const infoCardClass = 'flex flex-col gap-1 p-3 rounded-xl bg-black/30 border border-white/5';
const infoLabelClass = 'flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]';
const infoValueClass = 'flex items-center gap-1 text-sm font-medium text-white';

const OrderDetailModal = ({ order, recentlyUpdatedItems, onClose }: OrderDetailModalProps) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 z-[1000] bg-black/80 backdrop-blur-sm animate-[od-fadeIn_0.2s_ease-out]"
            onClick={onClose}
        >
            <div
                className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl w-full max-w-[600px] max-h-[90vh] max-md:max-h-screen max-md:rounded-none flex flex-col shadow-2xl animate-[od-slideUp_0.3s_ease-out]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <h2 className="flex items-center gap-2 text-xl font-display font-bold text-white m-0">
                            <Hash size={20} className="text-[var(--color-gold)]" />
                            Order #{order.order_number}
                        </h2>
                        <span className={statusBadge(order.status)}>
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                    <button
                        className="p-1.5 cursor-pointer rounded-lg transition-colors text-[var(--theme-text-muted)] hover:bg-white/5 hover:text-white border-none bg-transparent"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
                        <div className={infoCardClass}>
                            <span className={infoLabelClass}>Transaction ID</span>
                            <span className={cn(infoValueClass, 'font-mono')}>
                                {order.id.slice(0, 8)}...
                            </span>
                        </div>
                        <div className={infoCardClass}>
                            <span className={infoLabelClass}>Date & Time</span>
                            <span className={infoValueClass}>
                                {formatFullDate(order.created_at)}
                            </span>
                        </div>
                        <div className={infoCardClass}>
                            <span className={infoLabelClass}>Type</span>
                            <span className={infoValueClass}>
                                {getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}
                                {order.table_number && ` - Table ${order.table_number}`}
                            </span>
                        </div>
                        {order.customer_name && (
                            <div className={infoCardClass}>
                                <span className={infoLabelClass}>
                                    <User size={10} /> Customer
                                </span>
                                <span className={infoValueClass}>
                                    {order.customer_name}
                                </span>
                            </div>
                        )}
                        <div className={infoCardClass}>
                            <span className={infoLabelClass}>Payment Status</span>
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
                        </div>
                        {order.payment_method && (
                            <div className={infoCardClass}>
                                <span className={infoLabelClass}>Payment Method</span>
                                <span className={infoValueClass}>
                                    {getPaymentIcon(order.payment_method)}
                                    {getPaymentMethodLabel(order.payment_method)}
                                </span>
                            </div>
                        )}
                        {order.completed_at && (
                            <div className={infoCardClass}>
                                <span className={infoLabelClass}>Payment Time</span>
                                <span className={infoValueClass}>
                                    {formatFullDate(order.completed_at)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold mb-3 pb-2 border-b border-white/5 text-[var(--color-gold)]">
                            <ShoppingBag size={16} />
                            <span>Items ({order.items.length})</span>
                        </div>
                        <div className="flex flex-col">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center gap-2 py-2.5 border-b border-dashed border-white/5 last:border-b-0">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="font-semibold min-w-[28px] text-[var(--color-gold)]">
                                            {item.quantity}x
                                        </span>
                                        <span className="text-white text-sm">{item.product_name}</span>
                                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                            <span className="text-xs text-[var(--theme-text-muted)]">
                                                + options ({formatCurrency(item.modifiers_total)})
                                            </span>
                                        )}
                                    </div>
                                    <OrderItemStatusBadge
                                        status={item.item_status}
                                        animate={recentlyUpdatedItems.has(item.id)}
                                        size="sm"
                                    />
                                    <span className="font-semibold font-mono text-[var(--color-gold)]">
                                        {formatCurrency(item.total_price + (item.modifiers_total || 0))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Totals */}
                    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
                        <div className="flex justify-between py-2 text-sm text-[var(--theme-text-muted)]">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between py-2 text-sm text-amber-400">
                                <span>Discount</span>
                                <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}
                        {(order.service_charge ?? 0) > 0 && (
                            <div className="flex justify-between py-2 text-sm text-[var(--theme-text-muted)]">
                                <span>Service Charge</span>
                                <span>{formatCurrency(order.service_charge!)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 text-sm text-[var(--theme-text-muted)]">
                            <span>Tax (10%)</span>
                            <span>{formatCurrency(order.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between mt-2 pt-3 text-lg font-bold border-t border-white/10 text-[var(--color-gold)]">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        {order.payment_method === 'cash' && order.cash_received && (
                            <>
                                <div className="flex justify-between py-2 text-sm text-[var(--theme-text-muted)]">
                                    <span>Cash Received</span>
                                    <span>{formatCurrency(order.cash_received)}</span>
                                </div>
                                <div className="flex justify-between py-2 text-sm text-[var(--theme-text-muted)]">
                                    <span>Change</span>
                                    <span>{formatCurrency(order.change_given || 0)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes od-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes od-slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OrderDetailModal;
