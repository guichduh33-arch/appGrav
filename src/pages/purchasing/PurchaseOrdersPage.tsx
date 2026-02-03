import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Search, FileText, DollarSign, Package, Trash2, Eye, Edit2, Check, Clock, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
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
                toast.error(t('purchasing.orders.offlineWarning'))
            }
        }
    }, [isOnline, t])

    // Show error toast
    useEffect(() => {
        if (error) {
            toast.error(t('purchasing.orders.loadError'))
        }
    }, [error, t])

    const handleDelete = async (id: string) => {
        if (!isOnline) {
            toast.error(t('purchasing.orders.offlineWarning'))
            return
        }

        if (!confirm(t('purchasing.orders.deleteConfirm'))) {
            return
        }

        try {
            await deleteMutation.mutateAsync(id)
            toast.success(t('purchasing.orders.deleteSuccess'))
        } catch (error) {
            console.error('Error deleting purchase order:', error)
            // Handle specific validation error for non-draft PO deletion
            if (error instanceof Error && error.message === 'DELETE_NOT_DRAFT') {
                toast.error(t('purchasing.orders.deleteOnlyDraft'))
            } else {
                toast.error(t('purchasing.orders.deleteError'))
            }
        }
    }

    const handleUpdateStatus = async (id: string, status: TPOStatus) => {
        if (!isOnline) {
            toast.error(t('purchasing.orders.offlineWarning'))
            return
        }

        try {
            await updateStatusMutation.mutateAsync({
                purchaseOrderId: id,
                status
            })
            toast.success(t('purchasing.orders.updateSuccess'))
        } catch (error) {
            console.error('Error updating purchase order status:', error)
            toast.error(t('purchasing.orders.updateError'))
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

    return (
        <div className="purchase-orders-page">
            {/* Offline Warning Banner */}
            {!isOnline && (
                <div className="purchase-orders-page__offline-banner">
                    <WifiOff size={20} />
                    <span>{t('purchasing.orders.offlineWarning')}</span>
                </div>
            )}

            {/* Header */}
            <div className="purchase-orders-page__header">
                <div>
                    <h1 className="purchase-orders-page__title">
                        <FileText size={32} />
                        {t('purchasing.orders.title')}
                    </h1>
                    <p className="purchase-orders-page__subtitle">
                        {t('purchasing.orders.subtitle')}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/purchasing/purchase-orders/new')}
                    disabled={!isOnline}
                >
                    <Plus size={20} />
                    {t('purchasing.orders.newOrder')}
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
                        <div className="purchase-orders-stat__label">{t('purchasing.orders.stats.total')}</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--warning">
                        <Clock size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.pending}</div>
                        <div className="purchase-orders-stat__label">{t('purchasing.orders.stats.pending')}</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--success">
                        <Check size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.completed}</div>
                        <div className="purchase-orders-stat__label">{t('purchasing.orders.stats.completed')}</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--info">
                        <DollarSign size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{formatCurrency(stats.totalValue)}</div>
                        <div className="purchase-orders-stat__label">{t('purchasing.orders.stats.totalValue')}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="purchase-orders-filters">
                <div className="purchase-orders-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder={t('purchasing.orders.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="purchase-orders-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label={t('purchasing.orders.status.label')}
                >
                    <option value="all">{t('purchasing.orders.status.all')}</option>
                    <option value="draft">{t('purchasing.orders.status.draft')}</option>
                    <option value="sent">{t('purchasing.orders.status.sent')}</option>
                    <option value="confirmed">{t('purchasing.orders.status.confirmed')}</option>
                    <option value="partially_received">{t('purchasing.orders.status.partially_received')}</option>
                    <option value="received">{t('purchasing.orders.status.received')}</option>
                    <option value="cancelled">{t('purchasing.orders.status.cancelled')}</option>
                </select>
                <select
                    className="purchase-orders-filter"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    aria-label={t('purchasing.orders.payment.label')}
                >
                    <option value="all">{t('purchasing.orders.payment.all')}</option>
                    <option value="unpaid">{t('purchasing.orders.payment.unpaid')}</option>
                    <option value="partially_paid">{t('purchasing.orders.payment.partially_paid')}</option>
                    <option value="paid">{t('purchasing.orders.payment.paid')}</option>
                </select>
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="purchase-orders-loading">{t('common.loading')}</div>
            ) : filteredOrders.length === 0 ? (
                <div className="purchase-orders-empty">
                    <FileText size={48} />
                    <h3>{t('purchasing.orders.noOrders')}</h3>
                    <p>{t('purchasing.orders.noOrdersDescription')}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/purchasing/purchase-orders/new')}
                        disabled={!isOnline}
                    >
                        <Plus size={20} />
                        {t('purchasing.orders.newOrder')}
                    </button>
                </div>
            ) : (
                <div className="purchase-orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('purchasing.orders.table.poNumber')}</th>
                                <th>{t('purchasing.orders.table.supplier')}</th>
                                <th>{t('purchasing.orders.table.date')}</th>
                                <th>{t('purchasing.orders.table.expectedDelivery')}</th>
                                <th>{t('purchasing.orders.table.status')}</th>
                                <th>{t('purchasing.orders.table.payment')}</th>
                                <th>{t('purchasing.orders.table.total')}</th>
                                <th>{t('purchasing.orders.table.actions')}</th>
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
                                            {t(`purchasing.orders.status.${po.status}`)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getPaymentBadgeClass(po.payment_status)}`}>
                                            {t(`purchasing.orders.payment.${po.payment_status}`)}
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
                                                title={t('purchasing.orders.actions.view')}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => navigate(`/purchasing/purchase-orders/${po.id}/edit`)}
                                                title={t('purchasing.orders.actions.edit')}
                                                disabled={!isOnline}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {po.status === 'sent' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateStatus(po.id, 'confirmed')}
                                                    title={t('purchasing.orders.actions.confirm')}
                                                    disabled={!isOnline}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {po.status === 'confirmed' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateStatus(po.id, 'received')}
                                                    title={t('purchasing.orders.actions.markReceived')}
                                                    disabled={!isOnline}
                                                >
                                                    <Package size={18} />
                                                </button>
                                            )}
                                            {po.status === 'draft' && (
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => handleDelete(po.id)}
                                                    title={t('purchasing.orders.actions.delete')}
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
