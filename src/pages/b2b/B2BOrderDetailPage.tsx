import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Edit2, Printer, Truck, CreditCard, Clock,
    CheckCircle, Package, AlertCircle
} from 'lucide-react'
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
import './B2BOrderDetailPage.css'

type TabKey = 'items' | 'payments' | 'deliveries' | 'history'

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
            <span className={`b2b-detail-status b2b-detail-status--${config.color}`}>
                <Icon size={16} />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="b2b-detail-loading">
                <div className="spinner"></div>
                <span>Loading order...</span>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="b2b-detail-error">
                <AlertCircle size={48} />
                <h3>Order not found</h3>
                <button className="btn btn-primary" onClick={() => navigate('/b2b/orders')}>
                    Back to orders
                </button>
            </div>
        )
    }

    return (
        <div className="b2b-order-detail-page">
            {/* Header */}
            <div className="b2b-detail-header">
                <div className="b2b-detail-header__left">
                    <button className="btn btn-ghost" onClick={() => navigate('/b2b/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="b2b-detail-header__number">
                            <span className="order-number">{order.order_number}</span>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="b2b-detail-header__date">
                            Created on {formatDate(order.order_date)}
                        </p>
                    </div>
                </div>
                <div className="b2b-detail-header__actions">
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

            <div className="b2b-detail-content">
                <div className="b2b-detail-main">
                    <B2BOrderInfoCards order={order} onRecordPayment={openPaymentModal} />

                    {/* Tabs */}
                    <div className="b2b-detail-tabs">
                        <button
                            className={`b2b-detail-tab ${activeTab === 'items' ? 'active' : ''}`}
                            onClick={() => setActiveTab('items')}
                        >
                            <Package size={16} />
                            Items ({items.length})
                        </button>
                        <button
                            className={`b2b-detail-tab ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            <CreditCard size={16} />
                            Payments ({payments.length})
                        </button>
                        <button
                            className={`b2b-detail-tab ${activeTab === 'deliveries' ? 'active' : ''}`}
                            onClick={() => setActiveTab('deliveries')}
                        >
                            <Truck size={16} />
                            Deliveries ({deliveries.length})
                        </button>
                        <button
                            className={`b2b-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <Clock size={16} />
                            History
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="b2b-detail-tab-content">
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
