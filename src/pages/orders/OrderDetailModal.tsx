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

const OrderDetailModal = ({ order, recentlyUpdatedItems, onClose }: OrderDetailModalProps) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 z-[1000] animate-[od-fadeIn_0.2s_ease-out]"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-[600px] max-h-[90vh] max-md:max-h-screen max-md:rounded-none flex flex-col animate-[od-slideUp_0.3s_ease-out]"
                style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-lg border-b border-border">
                    <div className="flex items-center gap-md">
                        <h2 className="flex items-center gap-sm text-xl font-bold m-0" style={{ color: 'var(--color-brun-chocolat)' }}>
                            <Hash size={20} />
                            Order #{order.order_number}
                        </h2>
                        <span className={cn(
                            'inline-flex py-xs px-sm rounded-xl text-[11px] font-semibold uppercase tracking-[0.5px]',
                            order.status === 'pending' && 'bg-info-bg text-info',
                            order.status === 'preparing' && 'bg-warning-bg text-warning',
                            order.status === 'ready' && 'bg-success-bg text-success',
                            order.status === 'completed' && 'od-status--completed',
                            order.status === 'cancelled' && 'od-status--cancelled'
                        )}>
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                    <button
                        className="bg-none border-none p-xs cursor-pointer rounded-sm transition-all duration-150 hover:bg-[var(--color-blanc-creme)]"
                        style={{ color: 'var(--color-gris-chaud)' }}
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-lg flex flex-col gap-lg">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-sm">
                        <div className="flex flex-col gap-1 p-sm rounded-sm" style={{ background: 'var(--color-blanc-creme)' }}>
                            <span className="flex items-center gap-1 text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                Transaction ID
                            </span>
                            <span className="flex items-center gap-1 text-sm font-medium font-mono" style={{ color: 'var(--color-brun-chocolat)' }}>
                                {order.id.slice(0, 8)}...
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-sm rounded-sm" style={{ background: 'var(--color-blanc-creme)' }}>
                            <span className="flex items-center gap-1 text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                Date & Time
                            </span>
                            <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-brun-chocolat)' }}>
                                {formatFullDate(order.created_at)}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-sm rounded-sm" style={{ background: 'var(--color-blanc-creme)' }}>
                            <span className="flex items-center gap-1 text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                Type
                            </span>
                            <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-brun-chocolat)' }}>
                                {getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}
                                {order.table_number && ` - Table ${order.table_number}`}
                            </span>
                        </div>
                        {order.customer_name && (
                            <div className="flex flex-col gap-1 p-sm rounded-sm" style={{ background: 'var(--color-blanc-creme)' }}>
                                <span className="flex items-center gap-1 text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                    <User size={12} /> Customer
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-brun-chocolat)' }}>
                                    {order.customer_name}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col gap-1 p-sm rounded-sm" style={{ background: 'var(--color-blanc-creme)' }}>
                            <span className="flex items-center gap-1 text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                Payment Status
                            </span>
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
                        </div>
                        {order.payment_method && (
                            <div className="flex flex-col gap-1 p-sm rounded-sm" style={{ background: 'var(--color-blanc-creme)' }}>
                                <span className="flex items-center gap-1 text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                    Payment Method
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-brun-chocolat)' }}>
                                    {getPaymentIcon(order.payment_method)}
                                    {getPaymentMethodLabel(order.payment_method)}
                                </span>
                            </div>
                        )}
                        {order.completed_at && (
                            <div className="flex flex-col gap-1 p-sm rounded-sm" style={{ background: 'var(--color-blanc-creme)' }}>
                                <span className="flex items-center gap-1 text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                                    Payment Time
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-brun-chocolat)' }}>
                                    {formatFullDate(order.completed_at)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="rounded-md p-md" style={{ background: 'var(--color-blanc-creme)' }}>
                        <div className="flex items-center gap-sm text-sm font-semibold mb-md pb-sm border-b border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                            <ShoppingBag size={16} />
                            <span>Items ({order.items.length})</span>
                        </div>
                        <div className="flex flex-col gap-xs">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center gap-sm py-sm border-b border-dashed border-border last:border-b-0">
                                    <div className="flex items-center gap-sm flex-1 min-w-0">
                                        <span className="font-semibold min-w-[28px]" style={{ color: 'var(--color-rose-poudre)' }}>
                                            {item.quantity}x
                                        </span>
                                        <span style={{ color: 'var(--color-brun-chocolat)' }}>{item.product_name}</span>
                                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                            <span className="text-xs" style={{ color: 'var(--color-gris-chaud)' }}>
                                                + options ({formatCurrency(item.modifiers_total)})
                                            </span>
                                        )}
                                    </div>
                                    {/* Story 4.7: Item status badge with animation */}
                                    <OrderItemStatusBadge
                                        status={item.item_status}
                                        animate={recentlyUpdatedItems.has(item.id)}
                                        size="sm"
                                    />
                                    <span className="font-semibold font-mono" style={{ color: 'var(--color-brun-chocolat)' }}>
                                        {formatCurrency(item.total_price + (item.modifiers_total || 0))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Totals */}
                    <div className="rounded-md p-md" style={{ background: 'var(--color-blanc-creme)' }}>
                        <div className="flex justify-between py-sm text-sm" style={{ color: 'var(--color-gris-chaud)' }}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between py-sm text-sm text-warning">
                                <span>Discount</span>
                                <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-sm text-sm" style={{ color: 'var(--color-gris-chaud)' }}>
                            <span>Tax (10%)</span>
                            <span>{formatCurrency(order.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between mt-sm pt-md text-lg font-bold border-t-2 border-border" style={{ color: 'var(--color-brun-chocolat)' }}>
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        {order.payment_method === 'cash' && order.cash_received && (
                            <>
                                <div className="flex justify-between py-sm text-sm" style={{ color: 'var(--color-gris-chaud)' }}>
                                    <span>Cash Received</span>
                                    <span>{formatCurrency(order.cash_received)}</span>
                                </div>
                                <div className="flex justify-between py-sm text-sm" style={{ color: 'var(--color-gris-chaud)' }}>
                                    <span>Change</span>
                                    <span>{formatCurrency(order.change_given || 0)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Scoped styles for animations and variants */}
            <style>{`
                @keyframes od-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes od-slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .od-status--completed { background: rgba(107,142,107,0.2); color: #5A7D5A; }
                .od-status--cancelled { background: var(--color-urgent-bg); color: var(--color-urgent); }
            `}</style>
        </div>
    );
};

export default OrderDetailModal;
