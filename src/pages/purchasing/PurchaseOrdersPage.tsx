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
import { logError } from '@/utils/logger'

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
            logError('Error deleting purchase order:', error)
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
            logError('Error updating purchase order status:', error)
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
            case 'draft': return 'border-[var(--muted-smoke)] text-[var(--muted-smoke)]'
            case 'sent': return 'border-blue-400/40 text-blue-400'
            case 'confirmed': return 'border-[var(--color-gold)]/40 text-[var(--color-gold)]'
            case 'partially_received': return 'border-orange-400/40 text-orange-400'
            case 'received': return 'border-emerald-400/40 text-emerald-400'
            case 'cancelled': return 'border-red-400/40 text-red-400'
            case 'modified': return 'border-violet-400/40 text-violet-400'
            default: return 'border-[var(--muted-smoke)] text-[var(--muted-smoke)]'
        }
    }

    const getPaymentBadgeClass = (status: TPaymentStatus) => {
        switch (status) {
            case 'paid': return 'border-emerald-400/40 text-emerald-400'
            case 'partially_paid': return 'border-orange-400/40 text-orange-400'
            case 'unpaid': return 'border-red-400/40 text-red-400'
            default: return 'border-[var(--muted-smoke)] text-[var(--muted-smoke)]'
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
        <div className="min-h-screen bg-[var(--theme-bg-primary)] p-10 max-w-7xl mx-auto">
            {/* Offline Warning Banner */}
            {!isOnline && (
                <div className="flex items-center gap-3 px-5 py-3.5 mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-medium">
                    <WifiOff size={18} />
                    <span>This feature requires an internet connection</span>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-light text-white mb-2">
                        Pending Supplier{' '}
                        <span className="font-bold">Orders</span>
                    </h1>
                    <p className="text-sm text-[var(--muted-smoke)]">
                        Manage your supplier orders and track deliveries
                    </p>
                </div>
                <button
                    className="bg-[var(--color-gold)] px-5 py-2.5 rounded-xl text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-gold)]/90 transition-all flex items-center gap-2 disabled:opacity-40"
                    onClick={() => navigate('/purchasing/purchase-orders/new')}
                    disabled={!isOnline}
                >
                    <Plus size={16} />
                    New Order
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-10">
                {[
                    { icon: FileText, label: 'Total Orders', value: stats.total, color: 'text-[var(--color-gold)]', bg: 'bg-[var(--color-gold)]/10' },
                    { icon: Clock, label: 'Pending', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { icon: Check, label: 'Completed', value: stats.completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { icon: DollarSign, label: 'Total Value', value: formatCurrency(stats.totalValue), color: 'text-violet-400', bg: 'bg-violet-500/10' },
                ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-4 p-5 bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={22} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xl font-bold text-white leading-none mb-1">{stat.value}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-smoke)]">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 items-center">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-smoke)]" />
                    <input
                        type="text"
                        placeholder="Search purchase orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-2.5 px-4 pl-11 bg-[var(--onyx-surface)] border border-white/10 rounded-xl text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--muted-smoke)]">Status:</span>
                    <select
                        className="py-2.5 px-3 bg-[var(--onyx-surface)] border border-white/10 rounded-xl text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-[var(--color-gold)] focus:ring-0"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter by status"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="partially_received">Partial</option>
                        <option value="received">Received</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--muted-smoke)]">Payment:</span>
                    <select
                        className="py-2.5 px-3 bg-[var(--onyx-surface)] border border-white/10 rounded-xl text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-[var(--color-gold)] focus:ring-0"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        aria-label="Filter by payment"
                    >
                        <option value="all">All Payments</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partially_paid">Partial</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-lg text-[var(--muted-smoke)]">Loading...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[var(--onyx-surface)] border-2 border-dashed border-white/10 rounded-xl text-center">
                    <FileText size={48} className="text-white/10 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">No purchase orders</h3>
                    <p className="text-sm text-[var(--muted-smoke)] mb-6">Create your first purchase order to get started</p>
                    <button
                        className="bg-[var(--color-gold)] px-5 py-2.5 rounded-xl text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-gold)]/90 transition-all flex items-center gap-2 disabled:opacity-40"
                        onClick={() => navigate('/purchasing/purchase-orders/new')}
                        disabled={!isOnline}
                    >
                        <Plus size={16} />
                        New Order
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map(po => (
                        <div
                            key={po.id}
                            className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden transition-all hover:border-[var(--color-gold)]/30 group"
                        >
                            <div className="p-5 flex items-center justify-between">
                                <div className="grid grid-cols-5 flex-1 items-center gap-8">
                                    <div>
                                        <p className="text-[10px] text-[var(--muted-smoke)] uppercase tracking-widest mb-1">PO Number</p>
                                        <p className="text-sm font-medium text-[var(--color-gold)]">{po.po_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--muted-smoke)] uppercase tracking-widest mb-1">Supplier</p>
                                        <p className="text-sm text-[var(--stone-text)]">{po.supplier?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--muted-smoke)] uppercase tracking-widest mb-1">Order Date</p>
                                        <p className="text-sm text-[var(--stone-text)]">{new Date(po.order_date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--muted-smoke)] uppercase tracking-widest mb-1">Expected</p>
                                        <p className="text-sm text-[var(--stone-text)]">
                                            {po.expected_delivery_date
                                                ? new Date(po.expected_delivery_date).toLocaleDateString('fr-FR')
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--muted-smoke)] uppercase tracking-widest mb-1">Value</p>
                                        <p className="text-sm font-bold text-[var(--stone-text)]">
                                            {formatCurrency(parseFloat(po.total_amount?.toString() ?? '0') || 0)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-8">
                                    <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border ${getStatusBadgeClass(po.status)}`}>
                                        {getStatusLabel(po.status)}
                                    </span>
                                    <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border ${getPaymentBadgeClass(po.payment_status)}`}>
                                        {getPaymentLabel(po.payment_status)}
                                    </span>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-white/5 hover:text-[var(--color-gold)]"
                                            onClick={() => navigate(`/purchasing/purchase-orders/${po.id}`)}
                                            title="View"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-white/5 hover:text-[var(--color-gold)] disabled:opacity-30"
                                            onClick={() => navigate(`/purchasing/purchase-orders/${po.id}/edit`)}
                                            title="Edit"
                                            disabled={!isOnline}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {po.status === 'sent' && (
                                            <button
                                                className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-white/5 hover:text-emerald-400 disabled:opacity-30"
                                                onClick={() => handleUpdateStatus(po.id, 'confirmed')}
                                                title="Confirm"
                                                disabled={!isOnline}
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        {po.status === 'confirmed' && (
                                            <button
                                                className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-white/5 hover:text-emerald-400 disabled:opacity-30"
                                                onClick={() => handleUpdateStatus(po.id, 'received')}
                                                title="Mark Received"
                                                disabled={!isOnline}
                                            >
                                                <Package size={16} />
                                            </button>
                                        )}
                                        {po.status === 'draft' && (
                                            <button
                                                className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                                                onClick={() => handleDelete(po.id)}
                                                title="Delete"
                                                disabled={!isOnline}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
