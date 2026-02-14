import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Edit2, Printer, Truck, CreditCard, Clock,
    CheckCircle, Package, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PinVerificationModal from '../../components/pos/modals/PinVerificationModal'
import { STATUS_CONFIG, formatDate } from './b2bOrderDetailHelpers'
import { printB2BOrder } from './b2bOrderPrint'
import { useB2BOrderDetail } from './useB2BOrderDetail'
import B2BOrderInfoCards from './B2BOrderInfoCards'
import B2BOrderItemsTab from './B2BOrderItemsTab'
import B2BOrderPaymentsTab from './B2BOrderPaymentsTab'
import B2BOrderDeliveriesTab from './B2BOrderDeliveriesTab'
import B2BOrderHistoryTab from './B2BOrderHistoryTab'
import B2BOrderSummary from './B2BOrderSummary'
import B2BPaymentModal from './B2BPaymentModal'

type TabKey = 'items' | 'payments' | 'deliveries' | 'history'

const statusColorMap: Record<string, string> = {
    gray: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function B2BOrderDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    const {
        order, items, payments, deliveries, history, loading,
        showPaymentModal, paymentForm, setPaymentForm, setShowPaymentModal,
        updateOrderStatus, handleAddPayment, openPaymentModal,
    } = useB2BOrderDetail(id)

    const [activeTab, setActiveTab] = useState<TabKey>('items')
    const [showPinModal, setShowPinModal] = useState(false)

    const requiresPinToEdit = order?.status === 'delivered' || order?.status === 'partially_delivered'

    const handleEditClick = () => {
        if (requiresPinToEdit) {
            setShowPinModal(true)
        } else {
            navigate(`/b2b/orders/${id}/edit`)
        }
    }

    const handlePinVerify = (verified: boolean) => {
        setShowPinModal(false)
        if (verified) {
            navigate(`/b2b/orders/${id}/edit`)
        }
    }

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status]
        if (!config) return null
        const Icon = config.icon
        return (
            <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border',
                statusColorMap[config.color] || ''
            )}>
                <Icon size={16} />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-[var(--theme-text-muted)]">
                <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
                <span>Loading order...</span>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-[var(--theme-text-muted)]">
                <AlertCircle size={48} />
                <h3 className="text-white font-semibold">Order not found</h3>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm"
                    onClick={() => navigate('/b2b/orders')}
                >
                    Back to orders
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-4">
                    <button
                        className="inline-flex items-center gap-2 px-3 py-2 bg-transparent border border-white/10 text-white rounded-xl text-sm transition-colors hover:border-white/20"
                        onClick={() => navigate('/b2b/orders')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-4">
                            <span className="font-display text-2xl font-bold text-[var(--color-gold)]">{order.order_number}</span>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-[var(--theme-text-muted)] text-sm mt-1">
                            Created on {formatDate(order.order_date)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {order.status !== 'cancelled' && (
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-white font-medium rounded-xl text-sm transition-colors hover:border-white/20"
                            onClick={handleEditClick}
                        >
                            <Edit2 size={18} />
                            Edit
                        </button>
                    )}
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-white font-medium rounded-xl text-sm transition-colors hover:border-white/20"
                        onClick={() => printB2BOrder(order, items)}
                    >
                        <Printer size={18} />
                        Print
                    </button>
                    {order.status === 'draft' && (
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={() => updateOrderStatus('confirmed')}>
                            <CheckCircle size={18} /> Confirm
                        </button>
                    )}
                    {order.status === 'confirmed' && (
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={() => updateOrderStatus('processing')}>
                            <Clock size={18} /> Processing
                        </button>
                    )}
                    {order.status === 'processing' && (
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={() => updateOrderStatus('ready')}>
                            <Package size={18} /> Ready
                        </button>
                    )}
                    {(order.status === 'ready' || order.status === 'partially_delivered') && (
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={() => updateOrderStatus('delivered')}>
                            <Truck size={18} /> Delivered
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_320px] max-md:grid-cols-1 gap-8 items-start">
                <div>
                    <B2BOrderInfoCards order={order} onRecordPayment={openPaymentModal} />

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-white/5 mb-6">
                        {([
                            { key: 'items' as TabKey, icon: Package, label: `Items (${items.length})` },
                            { key: 'payments' as TabKey, icon: CreditCard, label: `Payments (${payments.length})` },
                            { key: 'deliveries' as TabKey, icon: Truck, label: `Deliveries (${deliveries.length})` },
                            { key: 'history' as TabKey, icon: Clock, label: 'History' },
                        ]).map(tab => (
                            <button
                                key={tab.key}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2.5 bg-transparent border-none border-b-2 border-b-transparent text-sm font-medium cursor-pointer transition-all -mb-px',
                                    activeTab === tab.key
                                        ? 'text-[var(--color-gold)] !border-b-[var(--color-gold)]'
                                        : 'text-[var(--theme-text-muted)] hover:text-white'
                                )}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                        {activeTab === 'items' && <B2BOrderItemsTab items={items} />}
                        {activeTab === 'payments' && <B2BOrderPaymentsTab payments={payments} />}
                        {activeTab === 'deliveries' && <B2BOrderDeliveriesTab deliveries={deliveries} />}
                        {activeTab === 'history' && <B2BOrderHistoryTab history={history} />}
                    </div>
                </div>

                <B2BOrderSummary order={order} />
            </div>

            {showPaymentModal && (
                <B2BPaymentModal
                    paymentForm={paymentForm}
                    onFormChange={setPaymentForm}
                    onSubmit={handleAddPayment}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}

            {showPinModal && (
                <PinVerificationModal
                    title="Authorization required"
                    message="This order has already been delivered. Enter a manager PIN to edit."
                    onVerify={handlePinVerify}
                    onClose={() => setShowPinModal(false)}
                    allowedRoles={['manager', 'admin']}
                />
            )}
        </div>
    )
}
