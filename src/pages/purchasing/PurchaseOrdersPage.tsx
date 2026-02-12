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
            case 'draft': return 'bg-gray-500/15 text-[var(--color-gray-400)]'
            case 'sent': return 'bg-blue-500/15 text-primary'
            case 'confirmed': return 'bg-amber-500/15 text-amber-500'
            case 'partially_received': return 'bg-orange-400/15 text-orange-400'
            case 'received': return 'bg-emerald-500/15 text-success'
            case 'cancelled': return 'bg-red-500/15 text-danger'
            case 'modified': return 'bg-violet-500/15 text-violet-500'
            default: return 'bg-gray-500/15 text-[var(--color-gray-400)]'
        }
    }

    const getPaymentBadgeClass = (status: TPaymentStatus) => {
        switch (status) {
            case 'paid': return 'bg-emerald-500/15 text-success'
            case 'partially_paid': return 'bg-orange-400/15 text-orange-400'
            case 'unpaid': return 'bg-red-500/15 text-danger'
            default: return 'bg-gray-500/15 text-[var(--color-gray-400)]'
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
        <div className="p-xl max-w-[1600px] mx-auto">
            {/* Offline Warning Banner */}
            {!isOnline && (
                <div className="flex items-center gap-sm px-lg py-md mb-lg bg-warning/10 border border-warning rounded-md text-warning font-medium">
                    <WifiOff size={20} />
                    <span>This feature requires an internet connection</span>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-xl">
                <div>
                    <h1 className="flex items-center gap-md text-3xl font-bold text-white m-0 mb-sm">
                        <FileText size={32} />
                        Purchase Orders
                    </h1>
                    <p className="text-base text-muted-foreground m-0">
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-lg mb-xl">
                <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-blue-500/15 text-primary">
                        <FileText size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-white leading-none mb-1">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                    </div>
                </div>
                <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-amber-500/15 text-amber-500">
                        <Clock size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-white leading-none mb-1">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                </div>
                <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-emerald-500/15 text-success">
                        <Check size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-white leading-none mb-1">{stats.completed}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                </div>
                <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-violet-500/15 text-violet-500">
                        <DollarSign size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-white leading-none mb-1">{formatCurrency(stats.totalValue)}</div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-md mb-lg">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search purchase orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 px-4 pl-12 bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg text-white text-base focus:outline-none focus:border-primary"
                    />
                </div>
                <select
                    className="py-3 px-4 bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg text-white text-base min-w-[200px] focus:outline-none focus:border-primary"
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
                    className="py-3 px-4 bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg text-white text-base min-w-[200px] focus:outline-none focus:border-primary"
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
                <div className="flex items-center justify-center p-3xl text-lg text-muted-foreground">Loading...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-3xl bg-[var(--color-gray-800)] border-2 border-dashed border-[var(--color-gray-700)] rounded-xl text-center">
                    <FileText size={48} className="text-[var(--color-gray-600)] mb-md" />
                    <h3 className="text-xl font-bold text-white m-0 mb-sm">No purchase orders</h3>
                    <p className="text-base text-muted-foreground m-0 mb-lg">Create your first purchase order to get started</p>
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
                <div className="bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead className="bg-[var(--color-gray-750)] border-b border-[var(--color-gray-700)]">
                            <tr>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">PO Number</th>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">Supplier</th>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">Expected Delivery</th>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">Payment</th>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                                <th className="p-md text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(po => (
                                <tr key={po.id} className="hover:bg-[var(--color-gray-750)] [&:last-child>td]:border-b-0">
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">
                                        <strong>{po.po_number}</strong>
                                    </td>
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">{po.supplier?.name || '-'}</td>
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">{new Date(po.order_date).toLocaleDateString('fr-FR')}</td>
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">
                                        {po.expected_delivery_date
                                            ? new Date(po.expected_delivery_date).toLocaleDateString('fr-FR')
                                            : '-'
                                        }
                                    </td>
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(po.status)}`}>
                                            {getStatusLabel(po.status)}
                                        </span>
                                    </td>
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${getPaymentBadgeClass(po.payment_status)}`}>
                                            {getPaymentLabel(po.payment_status)}
                                        </span>
                                    </td>
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">
                                        <strong>{formatCurrency(parseFloat(po.total_amount?.toString() ?? '0') || 0)}</strong>
                                    </td>
                                    <td className="p-md border-b border-[var(--color-gray-700)] text-sm text-[var(--color-gray-300)]">
                                        <div className="flex gap-1">
                                            <button
                                                className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-primary-light"
                                                onClick={() => navigate(`/purchasing/purchase-orders/${po.id}`)}
                                                title="View"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-primary-light"
                                                onClick={() => navigate(`/purchasing/purchase-orders/${po.id}/edit`)}
                                                title="Edit"
                                                disabled={!isOnline}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {po.status === 'sent' && (
                                                <button
                                                    className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-primary-light"
                                                    onClick={() => handleUpdateStatus(po.id, 'confirmed')}
                                                    title="Confirm"
                                                    disabled={!isOnline}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {po.status === 'confirmed' && (
                                                <button
                                                    className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-primary-light"
                                                    onClick={() => handleUpdateStatus(po.id, 'received')}
                                                    title="Mark Received"
                                                    disabled={!isOnline}
                                                >
                                                    <Package size={18} />
                                                </button>
                                            )}
                                            {po.status === 'draft' && (
                                                <button
                                                    className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-red-500/15 hover:text-danger"
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
