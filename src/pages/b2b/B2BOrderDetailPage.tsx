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
    gray: 'bg-[rgba(108,117,125,0.1)] text-[#6c757d]',
    blue: 'bg-[rgba(123,163,181,0.15)] text-info',
    yellow: 'bg-[rgba(234,192,134,0.2)] text-[#b38600]',
    purple: 'bg-[rgba(138,118,171,0.15)] text-[#7c5cbf]',
    orange: 'bg-[rgba(255,153,0,0.15)] text-[#cc7a00]',
    green: 'bg-[rgba(107,142,107,0.15)] text-success',
    red: 'bg-[rgba(220,53,69,0.1)] text-[var(--color-urgent)]',
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
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wide',
                statusColorMap[config.color] || ''
            )}>
                <Icon size={16} />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-md text-[var(--color-gris-chaud)]">
                <div className="w-10 h-10 border-3 border-border border-t-[var(--color-rose-poudre)] rounded-full animate-spin"></div>
                <span>Loading order...</span>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-md text-[var(--color-gris-chaud)]">
                <AlertCircle size={48} />
                <h3 className="text-[var(--color-brun-chocolat)]">Order not found</h3>
                <button className="btn btn-primary" onClick={() => navigate('/b2b/orders')}>
                    Back to orders
                </button>
            </div>
        )
    }

    return (
        <div className="p-lg h-full overflow-y-auto bg-[var(--color-blanc-creme)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-xl gap-lg">
                <div className="flex items-center gap-md">
                    <button className="btn btn-ghost" onClick={() => navigate('/b2b/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-md">
                            <span className="font-display text-2xl font-bold text-[var(--color-brun-chocolat)]">{order.order_number}</span>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-[var(--color-gris-chaud)] text-sm mt-1">
                            Created on {formatDate(order.order_date)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-sm">
                    {order.status !== 'cancelled' && (
                        <button className="btn btn-secondary" onClick={handleEditClick}>
                            <Edit2 size={18} />
                            Edit
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => printB2BOrder(order, items)}>
                        <Printer size={18} />
                        Print
                    </button>
                    {order.status === 'draft' && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('confirmed')}>
                            <CheckCircle size={18} />
                            Confirm
                        </button>
                    )}
                    {order.status === 'confirmed' && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('processing')}>
                            <Clock size={18} />
                            Processing
                        </button>
                    )}
                    {order.status === 'processing' && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('ready')}>
                            <Package size={18} />
                            Ready
                        </button>
                    )}
                    {(order.status === 'ready' || order.status === 'partially_delivered') && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('delivered')}>
                            <Truck size={18} />
                            Delivered
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_320px] max-md:grid-cols-1 gap-xl items-start">
                <div>
                    <B2BOrderInfoCards order={order} onRecordPayment={openPaymentModal} />

                    {/* Tabs */}
                    <div className="flex gap-xs border-b border-border mb-lg">
                        {([
                            { key: 'items' as TabKey, icon: Package, label: `Items (${items.length})` },
                            { key: 'payments' as TabKey, icon: CreditCard, label: `Payments (${payments.length})` },
                            { key: 'deliveries' as TabKey, icon: Truck, label: `Deliveries (${deliveries.length})` },
                            { key: 'history' as TabKey, icon: Clock, label: 'History' },
                        ]).map(tab => (
                            <button
                                key={tab.key}
                                className={cn(
                                    'flex items-center gap-xs px-md py-sm bg-transparent border-none border-b-2 border-b-transparent text-sm font-medium cursor-pointer transition-all duration-fast -mb-px',
                                    activeTab === tab.key
                                        ? 'text-[var(--color-rose-poudre)] !border-b-[var(--color-rose-poudre)]'
                                        : 'text-[var(--color-gris-chaud)] hover:text-[var(--color-brun-chocolat)]'
                                )}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
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
