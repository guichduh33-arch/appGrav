import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Search, FileText, DollarSign, Package, Trash2, Eye, Edit2, Check, Clock, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/helpers'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import {
    usePurchaseOrders,
    useDeletePurchaseOrder,
    useUpdatePurchaseOrderStatus,
    type TPOStatus,
    type TPaymentStatus
} from '@/hooks/purchasing/usePurchaseOrders'
import { toast } from 'sonner'
import './PurchaseOrdersPage.css'

export default function PurchaseOrdersPage() {
    const navigate = useNavigate()
    const { isOnline } = useNetworkStatus()
    const hasCheckedInitialOnlineStatus = useRef(false)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')

    // React Query hooks
    const { data: purchaseOrders = [], isLoading, error } = usePurchaseOrders()
    const deleteMutation = useDeletePurchaseOrder()
    const updateStatusMutation = useUpdatePurchaseOrderStatus()

    // Check online status on mount
    useEffect(() => {
        if (!hasCheckedInitialOnlineStatus.current) {
            hasCheckedInitialOnlineStatus.current = true
            if (!isOnline) {
                toast.error('This feature requires an internet connection')
            }
        }
    }, [isOnline])

    // Show error toast
    useEffect(() => {
        if (error) {
            toast.error('Failed to load purchase orders')
        }
    }, [error])

    const handleDelete = async (id: string) => {
        if (!isOnline) {
            toast.error('This feature requires an internet connection')
            return
        }

        if (!confirm('Are you sure you want to delete this purchase order?')) {
            return
        }

        try {
            await deleteMutation.mutateAsync(id)
            toast.success('Purchase order deleted successfully')
        } catch (error) {
            console.error('Error deleting purchase order:', error)
            // Handle specific validation error for non-draft PO deletion
            if (error instanceof Error && error.message === 'DELETE_NOT_DRAFT') {
                toast.error('Only draft purchase orders can be deleted')
            } else {
                toast.error('Failed to delete purchase order')
            }
        }
    }

    const handleUpdateStatus = async (id: string, status: TPOStatus) => {
        if (!isOnline) {
            toast.error('This feature requires an internet connection')
            return
        }

        try {
            await updateStatusMutation.mutateAsync({
                purchaseOrderId: id,
                status
            })
            toast.success('Purchase order updated successfully')
        } catch (error) {
            console.error('Error updating purchase order status:', error)
            toast.error('Failed to update purchase order')
        }
    }

    // Memoized filtered orders
    const filteredOrders = useMemo(() => {
        return purchaseOrders.filter(po => {
            const matchesSearch =
                po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                po.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === 'all' || po.status === statusFilter
            const matchesPayment = paymentFilter === 'all' || po.payment_status === paymentFilter

            return matchesSearch && matchesStatus && matchesPayment
        })
    }, [purchaseOrders, searchTerm, statusFilter, paymentFilter])

    // Memoized stats
    const stats = useMemo(() => ({
        total: purchaseOrders.length,
        draft: purchaseOrders.filter(po => po.status === 'draft').length,
        pending: purchaseOrders.filter(po => ['sent', 'confirmed', 'partially_received'].includes(po.status)).length,
        completed: purchaseOrders.filter(po => po.status === 'received').length,
        totalValue: purchaseOrders.reduce((sum, po) => sum + (parseFloat(po.total_amount?.toString() ?? '0') || 0), 0)
    }), [purchaseOrders])

    const getStatusBadgeClass = (status: TPOStatus) => {
        switch (status) {
            case 'draft': return 'status-badge--gray'
            case 'sent': return 'status-badge--blue'
            case 'confirmed': return 'status-badge--yellow'
            case 'partially_received': return 'status-badge--orange'
            case 'received': return 'status-badge--success'
            case 'cancelled': return 'status-badge--danger'
            case 'modified': return 'status-badge--purple'
            default: return 'status-badge--gray'
        }
    }

    const getPaymentBadgeClass = (status: TPaymentStatus) => {
        switch (status) {
            case 'paid': return 'status-badge--success'
            case 'partially_paid': return 'status-badge--orange'
            case 'unpaid': return 'status-badge--danger'
            default: return 'status-badge--gray'
        }
    }

    const getStatusLabel = (status: TPOStatus) => {
        switch (status) {
            case 'draft': return 'Draft'
            case 'sent': return 'Sent'
            case 'confirmed': return 'Confirmed'
            case 'partially_received': return 'Partially Received'
            case 'received': return 'Received'
            case 'cancelled': return 'Cancelled'
            case 'modified': return 'Modified'
            default: return status
        }
    }

    const getPaymentLabel = (status: TPaymentStatus) => {
        switch (status) {
            case 'paid': return 'Paid'
            case 'partially_paid': return 'Partially Paid'
            case 'unpaid': return 'Unpaid'
            default: return status
        }
    }

    return (
        <div className="purchase-orders-page">
            {/* Offline Warning Banner */}
            {!isOnline && (
                <div className="purchase-orders-page__offline-banner">
                    <WifiOff size={20} />
                    <span>This feature requires an internet connection</span>
                </div>
            )}

            {/* Header */}
            <div className="purchase-orders-page__header">
                <div>
                    <h1 className="purchase-orders-page__title">
                        <FileText size={32} />
                        Purchase Orders
                    </h1>
                    <p className="purchase-orders-page__subtitle">
                        Manage your supplier orders
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/purchasing/purchase-orders/new')}
                    disabled={!isOnline}
                >
                    <Plus size={20} />
                    New Purchase Order
                </button>
            </div>

            {/* Stats */}
            <div className="purchase-orders-stats">
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--primary">
                        <FileText size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.total}</div>
                        <div className="purchase-orders-stat__label">Total Orders</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--warning">
                        <Clock size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.pending}</div>
                        <div className="purchase-orders-stat__label">Pending</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--success">
                        <Check size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.completed}</div>
                        <div className="purchase-orders-stat__label">Completed</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--info">
                        <DollarSign size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{formatCurrency(stats.totalValue)}</div>
                        <div className="purchase-orders-stat__label">Total Value</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="purchase-orders-filters">
                <div className="purchase-orders-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search purchase orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="purchase-orders-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="partially_received">Partially Received</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    className="purchase-orders-filter"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    aria-label="Filter by payment"
                >
                    <option value="all">All Payments</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                </select>
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="purchase-orders-loading">Loading...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="purchase-orders-empty">
                    <FileText size={48} />
                    <h3>No purchase orders</h3>
                    <p>Create your first purchase order to get started</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/purchasing/purchase-orders/new')}
                        disabled={!isOnline}
                    >
                        <Plus size={20} />
                        New Purchase Order
                    </button>
                </div>
            ) : (
                <div className="purchase-orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Supplier</th>
                                <th>Date</th>
                                <th>Expected Delivery</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(po => (
                                <tr key={po.id}>
                                    <td>
                                        <strong>{po.po_number}</strong>
                                    </td>
                                    <td>{po.supplier?.name || '-'}</td>
                                    <td>{new Date(po.order_date).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        {po.expected_delivery_date
                                            ? new Date(po.expected_delivery_date).toLocaleDateString('fr-FR')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(po.status)}`}>
                                            {getStatusLabel(po.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getPaymentBadgeClass(po.payment_status)}`}>
                                            {getPaymentLabel(po.payment_status)}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{formatCurrency(parseFloat(po.total_amount?.toString() ?? '0') || 0)}</strong>
                                    </td>
                                    <td>
                                        <div className="purchase-orders-table__actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => navigate(`/purchasing/purchase-orders/${po.id}`)}
                                                title="View"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => navigate(`/purchasing/purchase-orders/${po.id}/edit`)}
                                                title="Edit"
                                                disabled={!isOnline}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {po.status === 'sent' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateStatus(po.id, 'confirmed')}
                                                    title="Confirm"
                                                    disabled={!isOnline}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {po.status === 'confirmed' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateStatus(po.id, 'received')}
                                                    title="Mark Received"
                                                    disabled={!isOnline}
                                                >
                                                    <Package size={18} />
                                                </button>
                                            )}
                                            {po.status === 'draft' && (
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => handleDelete(po.id)}
                                                    title="Delete"
                                                    disabled={!isOnline}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
