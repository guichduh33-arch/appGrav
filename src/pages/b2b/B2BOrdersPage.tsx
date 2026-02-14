import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Plus, Search, FileText, Truck, CreditCard,
    Eye, Edit2, Clock, CheckCircle, Package, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useB2BOrders } from '@/hooks/useB2BOrders'
import { formatCurrency } from '../../utils/helpers'

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'zinc', icon: FileText },
    confirmed: { label: 'Confirmed', color: 'blue', icon: CheckCircle },
    processing: { label: 'Processing', color: 'amber', icon: Clock },
    ready: { label: 'Ready', color: 'purple', icon: Package },
    partially_delivered: { label: 'Partial Delivery', color: 'orange', icon: Truck },
    delivered: { label: 'Delivered', color: 'emerald', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'red', icon: AlertCircle }
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    unpaid: { label: 'Unpaid', color: 'red' },
    partial: { label: 'Partial', color: 'orange' },
    paid: { label: 'Paid', color: 'emerald' },
}

const statusBadgeColorMap: Record<string, string> = {
    zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const paymentBadgeColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statIconStyles: Record<string, string> = {
    primary: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
    warning: 'bg-amber-500/10 text-amber-400',
    info: 'bg-blue-500/10 text-blue-400',
    danger: 'bg-red-500/10 text-red-400',
}

export default function B2BOrdersPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const customerFilter = searchParams.get('customer')
    const { data: orders = [], isLoading: loading } = useB2BOrders()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')
    const [customerName, setCustomerName] = useState<string>('')

    useEffect(() => {
        if (customerFilter && orders.length > 0) {
            const match = orders.find(o => o.customer_id === customerFilter)
            if (match?.customer) {
                setCustomerName(match.customer.company_name || match.customer.name)
            }
        } else {
            setCustomerName('')
        }
    }, [customerFilter, orders])

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchLower) ||
            order.customer?.name?.toLowerCase().includes(searchLower) ||
            order.customer?.company_name?.toLowerCase().includes(searchLower)

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter
        const matchesCustomer = !customerFilter || order.customer_id === customerFilter

        return matchesSearch && matchesStatus && matchesPayment && matchesCustomer
    })

    const stats = {
        total: orders.length,
        pending: orders.filter(o => ['confirmed', 'processing', 'ready'].includes(o.status)).length,
        toDeliver: orders.filter(o => ['ready', 'partially_delivered'].includes(o.status)).length,
        unpaid: orders.filter(o => ['unpaid', 'partial', 'overdue'].includes(o.payment_status)).length,
        totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0),
        totalDue: orders.reduce((sum, o) => sum + o.amount_due, 0)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusBadge = (status: keyof typeof STATUS_CONFIG) => {
        const config = STATUS_CONFIG[status]
        const Icon = config.icon
        return (
            <span className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap border',
                statusBadgeColorMap[config.color] || ''
            )}>
                <Icon size={14} />
                {config.label}
            </span>
        )
    }

    const getPaymentBadge = (status: string) => {
        const config = PAYMENT_STATUS_CONFIG[status] || { label: status, color: 'zinc' }
        return (
            <span className={cn(
                'inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border',
                paymentBadgeColorMap[config.color] || ''
            )}>
                {config.label}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 gap-6 max-md:flex-col max-md:items-stretch">
                <div>
                    <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-white">
                        <FileText size={28} className="text-[var(--color-gold)]" />
                        B2B Orders
                    </h1>
                    <p className="text-[var(--theme-text-muted)] text-sm mt-1">
                        Manage your wholesale orders and track deliveries
                    </p>
                </div>
                <div className="flex gap-3 max-md:justify-end">
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-white font-medium rounded-xl text-sm transition-colors hover:border-white/20"
                        onClick={() => navigate('/b2b/payments')}
                    >
                        <CreditCard size={18} />
                        Payments
                    </button>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110"
                        onClick={() => navigate('/b2b/orders/new')}
                    >
                        <Plus size={18} />
                        New Order
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8 max-md:grid-cols-1" style={{ '--tw-grid-cols-1200': 'repeat(2, 1fr)' } as React.CSSProperties}>
                {[
                    { icon: FileText, style: 'primary', value: stats.total, label: 'Total Orders' },
                    { icon: Clock, style: 'warning', value: stats.pending, label: 'In Progress' },
                    { icon: Truck, style: 'info', value: stats.toDeliver, label: 'To Deliver' },
                    { icon: CreditCard, style: 'danger', value: formatCurrency(stats.totalDue), label: 'To Collect' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 flex items-center gap-4 transition-all hover:border-white/10">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', statIconStyles[stat.style])}>
                            <stat.icon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white leading-tight">{stat.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 flex-wrap max-md:flex-col max-md:items-stretch">
                <div className="flex-1 min-w-[280px] max-w-[400px] flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 transition-all focus-within:border-[var(--color-gold)] focus-within:ring-1 focus-within:ring-[var(--color-gold)]/20 max-md:max-w-none">
                    <Search size={20} className="text-[var(--theme-text-muted)] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by order # or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[var(--theme-text-muted)]"
                    />
                </div>
                <div className="flex gap-3 max-md:flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white cursor-pointer transition-all hover:border-white/20 focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
                    >
                        <option value="all">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="ready">Ready</option>
                        <option value="partially_delivered">Partial Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white cursor-pointer transition-all hover:border-white/20 focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
                    >
                        <option value="all">All payments</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </div>

            {/* Customer filter banner */}
            {customerFilter && customerName && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 rounded-xl mb-4 text-sm text-white">
                    <span>Showing orders for <strong className="text-[var(--color-gold)]">{customerName}</strong></span>
                    <button
                        type="button"
                        onClick={() => setSearchParams({})}
                        className="ml-auto bg-transparent border-none cursor-pointer text-sm text-[var(--color-gold)] underline"
                    >
                        Show all orders
                    </button>
                </div>
            )}

            {/* Orders Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-[var(--theme-text-muted)]">
                    <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
                    <span>Loading orders...</span>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                    <FileText size={48} className="text-[var(--theme-text-muted)] opacity-40 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-1">No B2B orders</h3>
                    <p className="text-[var(--theme-text-muted)] text-sm mb-6">Create your first wholesale order</p>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm"
                        onClick={() => navigate('/b2b/orders/new')}
                    >
                        <Plus size={18} />
                        New Order
                    </button>
                </div>
            ) : (
                <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden max-md:overflow-x-auto">
                    <table className="w-full border-collapse max-md:min-w-[900px]">
                        <thead>
                            <tr>
                                {['Order #', 'Customer', 'Date', 'Delivery', 'Amount', 'Status', 'Payment', 'Actions'].map(th => (
                                    <th key={th} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] border-b border-white/5 whitespace-nowrap">{th}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr
                                    key={order.id}
                                    onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                    className="cursor-pointer transition-colors border-b border-white/5 hover:bg-white/[0.02] [&:last-child]:border-b-0"
                                >
                                    <td className="px-5 py-3.5 text-sm align-middle">
                                        <span className="font-mono font-semibold text-[var(--color-gold)]">{order.order_number}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white align-middle">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium">
                                                {order.customer?.company_name || order.customer?.name}
                                            </span>
                                            {order.customer?.company_name && (
                                                <span className="text-xs text-[var(--theme-text-muted)]">{order.customer.name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-[var(--theme-text-muted)] align-middle">{formatDate(order.order_date)}</td>
                                    <td className="px-5 py-3.5 text-sm text-[var(--theme-text-muted)] align-middle">{formatDate(order.requested_delivery_date)}</td>
                                    <td className="px-5 py-3.5 text-sm align-middle">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-white">{formatCurrency(order.total_amount)}</span>
                                            {order.amount_due > 0 && (
                                                <span className="text-xs text-red-400">Due: {formatCurrency(order.amount_due)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm align-middle">{getStatusBadge(order.status)}</td>
                                    <td className="px-5 py-3.5 text-sm align-middle">{getPaymentBadge(order.payment_status)}</td>
                                    <td className="px-5 py-3.5 text-sm align-middle">
                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                                                onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                                title="View details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {order.status === 'draft' && (
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                                                    onClick={() => navigate(`/b2b/orders/${order.id}/edit`)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
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
