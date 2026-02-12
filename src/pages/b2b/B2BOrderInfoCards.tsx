import {
    User, Truck, CreditCard, Phone, Mail,
    Calendar, CheckCircle, MapPin, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/helpers'
import { formatDate, PAYMENT_STATUS_CONFIG } from './b2bOrderDetailHelpers'
import type { B2BOrder } from './b2bOrderDetailTypes'

interface B2BOrderInfoCardsProps {
    order: B2BOrder
    onRecordPayment: () => void
}

const paymentStatusColorMap: Record<string, string> = {
    green: 'bg-[rgba(107,142,107,0.15)] text-success',
    orange: 'bg-[rgba(255,153,0,0.15)] text-[#cc7a00]',
    red: 'bg-[rgba(220,53,69,0.1)] text-[var(--color-urgent)]',
}

export default function B2BOrderInfoCards({ order, onRecordPayment }: B2BOrderInfoCardsProps) {
    const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || { label: order.payment_status, color: 'gray' }

    return (
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-md mb-lg">
            {/* Customer Card */}
            <div className="bg-white rounded-lg shadow p-lg">
                <h3 className="flex items-center gap-sm text-sm font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide mb-md pb-sm border-b border-border">
                    <User size={18} /> Customer
                </h3>
                <div className="text-sm">
                    <p className="text-lg font-semibold text-[var(--color-brun-chocolat)] mb-xs">
                        {order.customer?.company_name || order.customer?.name}
                    </p>
                    {order.customer?.company_name && (
                        <p className="text-[var(--color-gris-chaud)] mb-sm">{order.customer.name}</p>
                    )}
                    {order.customer?.phone && (
                        <p className="flex items-center gap-xs text-[var(--color-gris-chaud)] my-xs">
                            <Phone size={14} /> {order.customer.phone}
                        </p>
                    )}
                    {order.customer?.email && (
                        <p className="flex items-center gap-xs text-[var(--color-gris-chaud)] my-xs">
                            <Mail size={14} /> {order.customer.email}
                        </p>
                    )}
                </div>
            </div>

            {/* Delivery Card */}
            <div className="bg-white rounded-lg shadow p-lg">
                <h3 className="flex items-center gap-sm text-sm font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide mb-md pb-sm border-b border-border">
                    <Truck size={18} /> Delivery
                </h3>
                <div className="text-sm">
                    {order.requested_delivery_date && (
                        <p className="flex items-center gap-xs my-xs">
                            <Calendar size={14} />
                            <span>Requested: {formatDate(order.requested_delivery_date)}</span>
                        </p>
                    )}
                    {order.actual_delivery_date && (
                        <p className="flex items-center gap-xs my-xs text-success">
                            <CheckCircle size={14} />
                            <span>Delivered: {formatDate(order.actual_delivery_date)}</span>
                        </p>
                    )}
                    {order.delivery_address && (
                        <p className="flex gap-xs my-sm text-[var(--color-gris-chaud)]">
                            <MapPin size={14} />
                            <span>{order.delivery_address}</span>
                        </p>
                    )}
                    {order.delivery_notes && (
                        <p className="italic text-[var(--color-gris-chaud)] mt-sm">{order.delivery_notes}</p>
                    )}
                </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-lg shadow p-lg">
                <h3 className="flex items-center gap-sm text-sm font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide mb-md pb-sm border-b border-border">
                    <CreditCard size={18} /> Payment
                </h3>
                <div className="text-sm">
                    <div className="mb-sm">
                        <span className={cn(
                            'inline-flex px-2.5 py-1 rounded-xl text-[11px] font-semibold',
                            paymentStatusColorMap[paymentStatusConfig.color] || ''
                        )}>
                            {paymentStatusConfig.label}
                        </span>
                    </div>
                    {order.payment_terms && (
                        <p className="text-sm text-[var(--color-gris-chaud)] my-xs">
                            Terms: {order.payment_terms === 'cod' ? 'Cash on delivery' : `Net ${order.payment_terms.replace('net', '')} days`}
                        </p>
                    )}
                    {order.due_date && (
                        <p className="text-sm text-[var(--color-gris-chaud)] my-xs">
                            Due date: {formatDate(order.due_date)}
                        </p>
                    )}
                    <div className="flex gap-lg my-md py-sm border-t border-border">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-[var(--color-gris-chaud)]">Paid</span>
                            <span className="text-lg font-semibold text-success">{formatCurrency(order.amount_paid)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-[var(--color-gris-chaud)]">Amount due</span>
                            <span className="text-lg font-semibold text-[var(--color-urgent)]">{formatCurrency(order.amount_due)}</span>
                        </div>
                    </div>
                    {order.amount_due > 0 && (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm btn-block mt-md relative z-[1] cursor-pointer"
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
