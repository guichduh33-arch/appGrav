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
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function B2BOrderInfoCards({ order, onRecordPayment }: B2BOrderInfoCardsProps) {
    const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || { label: order.payment_status, color: 'gray' }

    return (
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4 mb-6">
            {/* Customer Card */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4 pb-3 border-b border-white/5">
                    <User size={18} className="text-[var(--color-gold)]" /> Customer
                </h3>
                <div className="text-sm">
                    <p className="text-lg font-semibold text-white mb-1">
                        {order.customer?.company_name || order.customer?.name}
                    </p>
                    {order.customer?.company_name && (
                        <p className="text-[var(--theme-text-muted)] mb-2">{order.customer.name}</p>
                    )}
                    {order.customer?.phone && (
                        <p className="flex items-center gap-2 text-[var(--theme-text-muted)] my-1">
                            <Phone size={14} /> {order.customer.phone}
                        </p>
                    )}
                    {order.customer?.email && (
                        <p className="flex items-center gap-2 text-[var(--theme-text-muted)] my-1">
                            <Mail size={14} /> {order.customer.email}
                        </p>
                    )}
                </div>
            </div>

            {/* Delivery Card */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4 pb-3 border-b border-white/5">
                    <Truck size={18} className="text-[var(--color-gold)]" /> Delivery
                </h3>
                <div className="text-sm">
                    {order.requested_delivery_date && (
                        <p className="flex items-center gap-2 my-1 text-[var(--theme-text-muted)]">
                            <Calendar size={14} />
                            <span>Requested: {formatDate(order.requested_delivery_date)}</span>
                        </p>
                    )}
                    {order.actual_delivery_date && (
                        <p className="flex items-center gap-2 my-1 text-emerald-400">
                            <CheckCircle size={14} />
                            <span>Delivered: {formatDate(order.actual_delivery_date)}</span>
                        </p>
                    )}
                    {order.delivery_address && (
                        <p className="flex gap-2 my-2 text-[var(--theme-text-muted)]">
                            <MapPin size={14} />
                            <span>{order.delivery_address}</span>
                        </p>
                    )}
                    {order.delivery_notes && (
                        <p className="italic text-[var(--theme-text-muted)] mt-2">{order.delivery_notes}</p>
                    )}
                </div>
            </div>

            {/* Payment Card */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4 pb-3 border-b border-white/5">
                    <CreditCard size={18} className="text-[var(--color-gold)]" /> Payment
                </h3>
                <div className="text-sm">
                    <div className="mb-2">
                        <span className={cn(
                            'inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                            paymentStatusColorMap[paymentStatusConfig.color] || ''
                        )}>
                            {paymentStatusConfig.label}
                        </span>
                    </div>
                    {order.payment_terms && (
                        <p className="text-sm text-[var(--theme-text-muted)] my-1">
                            Terms: {order.payment_terms === 'cod' ? 'Cash on delivery' : `Net ${order.payment_terms.replace('net', '')} days`}
                        </p>
                    )}
                    {order.due_date && (
                        <p className="text-sm text-[var(--theme-text-muted)] my-1">
                            Due date: {formatDate(order.due_date)}
                        </p>
                    )}
                    <div className="flex gap-6 my-4 py-3 border-t border-white/5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Paid</span>
                            <span className="text-lg font-semibold text-emerald-400">{formatCurrency(order.amount_paid)}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Amount due</span>
                            <span className="text-lg font-semibold text-red-400">{formatCurrency(order.amount_due)}</span>
                        </div>
                    </div>
                    {order.amount_due > 0 && (
                        <button
                            type="button"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm mt-4 relative z-[1] cursor-pointer transition-colors hover:brightness-110"
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
