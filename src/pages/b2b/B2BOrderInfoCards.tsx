import {
    User, Truck, CreditCard, Phone, Mail,
    Calendar, CheckCircle, MapPin, Plus
} from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import { formatDate, PAYMENT_STATUS_CONFIG } from './b2bOrderDetailHelpers'
import type { B2BOrder } from './b2bOrderDetailTypes'

interface B2BOrderInfoCardsProps {
    order: B2BOrder
    onRecordPayment: () => void
}

export default function B2BOrderInfoCards({ order, onRecordPayment }: B2BOrderInfoCardsProps) {
    const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || { label: order.payment_status, color: 'gray' }

    return (
        <div className="b2b-detail-cards">
            {/* Customer Card */}
            <div className="b2b-detail-card">
                <h3><User size={18} /> Customer</h3>
                <div className="b2b-detail-card__content">
                    <p className="company-name">
                        {order.customer?.company_name || order.customer?.name}
                    </p>
                    {order.customer?.company_name && (
                        <p className="contact-name">{order.customer.name}</p>
                    )}
                    {order.customer?.phone && (
                        <p className="contact-info">
                            <Phone size={14} /> {order.customer.phone}
                        </p>
                    )}
                    {order.customer?.email && (
                        <p className="contact-info">
                            <Mail size={14} /> {order.customer.email}
                        </p>
                    )}
                </div>
            </div>

            {/* Delivery Card */}
            <div className="b2b-detail-card">
                <h3><Truck size={18} /> Delivery</h3>
                <div className="b2b-detail-card__content">
                    {order.requested_delivery_date && (
                        <p className="delivery-date">
                            <Calendar size={14} />
                            <span>Requested: {formatDate(order.requested_delivery_date)}</span>
                        </p>
                    )}
                    {order.actual_delivery_date && (
                        <p className="delivery-date delivered">
                            <CheckCircle size={14} />
                            <span>Delivered: {formatDate(order.actual_delivery_date)}</span>
                        </p>
                    )}
                    {order.delivery_address && (
                        <p className="delivery-address">
                            <MapPin size={14} />
                            <span>{order.delivery_address}</span>
                        </p>
                    )}
                    {order.delivery_notes && (
                        <p className="delivery-notes">{order.delivery_notes}</p>
                    )}
                </div>
            </div>

            {/* Payment Card */}
            <div className="b2b-detail-card">
                <h3><CreditCard size={18} /> Payment</h3>
                <div className="b2b-detail-card__content">
                    <div className="payment-status-row">
                        <span className={`b2b-payment-status b2b-payment-status--${paymentStatusConfig.color}`}>
                            {paymentStatusConfig.label}
                        </span>
                    </div>
                    {order.payment_terms && (
                        <p className="payment-terms">
                            Terms: {order.payment_terms === 'cod' ? 'Cash on delivery' : `Net ${order.payment_terms.replace('net', '')} days`}
                        </p>
                    )}
                    {order.due_date && (
                        <p className="due-date">
                            Due date: {formatDate(order.due_date)}
                        </p>
                    )}
                    <div className="payment-amounts">
                        <div className="payment-amount">
                            <span>Paid</span>
                            <span className="amount paid">{formatCurrency(order.amount_paid)}</span>
                        </div>
                        <div className="payment-amount">
                            <span>Amount due</span>
                            <span className="amount due">{formatCurrency(order.amount_due)}</span>
                        </div>
                    </div>
                    {order.amount_due > 0 && (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm btn-block b2b-payment-btn"
                            onClick={onRecordPayment}
                        >
                            <Plus size={16} />
                            Record a payment
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
