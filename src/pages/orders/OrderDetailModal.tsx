import { X, Hash, User, ShoppingBag, Check, Clock } from 'lucide-react';
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
        <div className="order-detail-overlay" onClick={onClose}>
            <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="order-detail__header">
                    <div className="order-detail__title-group">
                        <h2 className="order-detail__title">
                            <Hash size={20} />
                            Order #{order.order_number}
                        </h2>
                        <span className={`order-status ${order.status}`}>
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                    <button className="order-detail__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="order-detail__content">
                    {/* Order Info */}
                    <div className="order-detail__info-grid">
                        <div className="order-detail__info-item">
                            <span className="order-detail__info-label">Transaction ID</span>
                            <span className="order-detail__info-value order-detail__info-value--mono">
                                {order.id.slice(0, 8)}...
                            </span>
                        </div>
                        <div className="order-detail__info-item">
                            <span className="order-detail__info-label">Date & Time</span>
                            <span className="order-detail__info-value">
                                {formatFullDate(order.created_at)}
                            </span>
                        </div>
                        <div className="order-detail__info-item">
                            <span className="order-detail__info-label">Type</span>
                            <span className="order-detail__info-value">
                                {getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}
                                {order.table_number && ` - Table ${order.table_number}`}
                            </span>
                        </div>
                        {order.customer_name && (
                            <div className="order-detail__info-item">
                                <span className="order-detail__info-label">
                                    <User size={12} /> Customer
                                </span>
                                <span className="order-detail__info-value">
                                    {order.customer_name}
                                </span>
                            </div>
                        )}
                        <div className="order-detail__info-item">
                            <span className="order-detail__info-label">Payment Status</span>
                            <span className={`payment-status ${order.payment_status}`}>
                                {order.payment_status === 'paid' ? (
                                    <><Check size={14} /> Paid</>
                                ) : (
                                    <><Clock size={14} /> Unpaid</>
                                )}
                            </span>
                        </div>
                        {order.payment_method && (
                            <div className="order-detail__info-item">
                                <span className="order-detail__info-label">Payment Method</span>
                                <span className="order-detail__info-value">
                                    {getPaymentIcon(order.payment_method)}
                                    {getPaymentMethodLabel(order.payment_method)}
                                </span>
                            </div>
                        )}
                        {order.completed_at && (
                            <div className="order-detail__info-item">
                                <span className="order-detail__info-label">Payment Time</span>
                                <span className="order-detail__info-value">
                                    {formatFullDate(order.completed_at)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="order-detail__items">
                        <div className="order-detail__items-header">
                            <ShoppingBag size={16} />
                            <span>Items ({order.items.length})</span>
                        </div>
                        <div className="order-detail__items-list">
                            {order.items.map(item => (
                                <div key={item.id} className="order-detail__item">
                                    <div className="order-detail__item-info">
                                        <span className="order-detail__item-qty">{item.quantity}x</span>
                                        <span className="order-detail__item-name">{item.product_name}</span>
                                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                            <span className="order-detail__item-mods">
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
                                    <span className="order-detail__item-price">
                                        {formatCurrency(item.total_price + (item.modifiers_total || 0))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Totals */}
                    <div className="order-detail__totals">
                        <div className="order-detail__total-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="order-detail__total-row order-detail__total-row--discount">
                                <span>Discount</span>
                                <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="order-detail__total-row">
                            <span>Tax (10%)</span>
                            <span>{formatCurrency(order.tax_amount)}</span>
                        </div>
                        <div className="order-detail__total-row order-detail__total-row--final">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        {order.payment_method === 'cash' && order.cash_received && (
                            <>
                                <div className="order-detail__total-row">
                                    <span>Cash Received</span>
                                    <span>{formatCurrency(order.cash_received)}</span>
                                </div>
                                <div className="order-detail__total-row">
                                    <span>Change</span>
                                    <span>{formatCurrency(order.change_given || 0)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
