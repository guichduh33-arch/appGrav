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
    draft: { label: 'Draft', color: 'gray', icon: FileText },
    confirmed: { label: 'Confirmed', color: 'blue', icon: CheckCircle },
    processing: { label: 'Processing', color: 'yellow', icon: Clock },
    ready: { label: 'Ready', color: 'purple', icon: Package },
    partially_delivered: { label: 'Partial Delivery', color: 'orange', icon: Truck },
    delivered: { label: 'Delivered', color: 'green', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'red', icon: AlertCircle }
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    unpaid: { label: 'Unpaid', color: 'red' },
    partial: { label: 'Partial', color: 'orange' },
    paid: { label: 'Paid', color: 'green' },
}

const statusBadgeColorMap: Record<string, string> = {
    gray: 'bg-[rgba(108,117,125,0.1)] text-[#6c757d]',
    blue: 'bg-[rgba(123,163,181,0.15)] text-info',
    yellow: 'bg-[rgba(234,192,134,0.2)] text-[#b38600]',
    purple: 'bg-[rgba(138,118,171,0.15)] text-[#7c5cbf]',
    orange: 'bg-[rgba(255,153,0,0.15)] text-[#cc7a00]',
    green: 'bg-[rgba(107,142,107,0.15)] text-success',
    red: 'bg-[rgba(220,53,69,0.1)] text-[var(--color-urgent)]',
}

const paymentBadgeColorMap: Record<string, string> = {
    green: 'bg-[rgba(107,142,107,0.15)] text-success',
    orange: 'bg-[rgba(255,153,0,0.15)] text-[#cc7a00]',
    red: 'bg-[rgba(220,53,69,0.1)] text-[var(--color-urgent)]',
}

const statIconStyles: Record<string, string> = {
    primary: 'bg-[rgba(186,144,162,0.15)] text-[var(--color-rose-poudre)]',
    warning: 'bg-[rgba(234,192,134,0.15)] text-warning',
    info: 'bg-[rgba(123,163,181,0.15)] text-info',
    danger: 'bg-[rgba(220,53,69,0.15)] text-[var(--color-urgent)]',
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

    // Resolve customer name for the filter banner
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
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap',
                statusBadgeColorMap[config.color] || ''
            )}>
                <Icon size={14} />
                {config.label}
            </span>
        )
    }

    const getPaymentBadge = (status: string) => {
        const config = PAYMENT_STATUS_CONFIG[status] || { label: status, color: 'gray' }
        return (
            <span className={cn(
                'inline-flex px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap',
                paymentBadgeColorMap[config.color] || ''
            )}>
                {config.label}
            </span>
        )
    }

    return (
        <div className="p-lg h-full overflow-y-auto bg-[var(--color-blanc-creme)]">
            {/* Header */}
            <div className="flex items-start justify-between mb-xl gap-lg max-md:flex-col max-md:items-stretch">
                <div>
                    <h1 className="flex items-center gap-sm font-display text-3xl font-bold text-[var(--color-brun-chocolat)]">
                        <FileText size={28} />
                        B2B Orders
                    </h1>
                    <p className="text-[var(--color-gris-chaud)] text-sm mt-xs">
                        Manage your wholesale orders and track deliveries
                    </p>
                </div>
                <div className="flex gap-sm max-md:justify-end">
                    <button className="btn btn-secondary" onClick={() => navigate('/b2b/payments')}>
                        <CreditCard size={18} />
                        Payments
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                        <Plus size={18} />
                        New Order
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-md mb-xl max-md:grid-cols-1" style={{ '--tw-grid-cols-1200': 'repeat(2, 1fr)' } as React.CSSProperties}>
                {[
                    { icon: FileText, style: 'primary', value: stats.total, label: 'Total Orders' },
                    { icon: Clock, style: 'warning', value: stats.pending, label: 'In Progress' },
                    { icon: Truck, style: 'info', value: stats.toDeliver, label: 'To Deliver' },
                    { icon: CreditCard, style: 'danger', value: formatCurrency(stats.totalDue), label: 'To Collect' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-lg flex items-center gap-md transition-all duration-fast ease-standard hover:shadow-md hover:-translate-y-0.5">
                        <div className={cn('w-12 h-12 rounded-md flex items-center justify-center shrink-0', statIconStyles[stat.style])}>
                            <stat.icon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-[var(--color-brun-chocolat)] leading-tight">{stat.value}</span>
                            <span className="text-sm text-[var(--color-gris-chaud)]">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-md mb-lg flex-wrap max-md:flex-col max-md:items-stretch">
                <div className="flex-1 min-w-[280px] max-w-[400px] flex items-center gap-sm bg-white border border-border rounded-md px-md py-sm transition-all duration-fast ease-standard focus-within:border-[var(--color-rose-poudre)] focus-within:shadow-[0_0_0_3px_rgba(186,144,162,0.1)] max-md:max-w-none">
                    <Search size={20} className="text-[var(--color-gris-chaud)] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by order # or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none bg-transparent text-sm text-[var(--color-brun-chocolat)] outline-none placeholder:text-[var(--color-gris-chaud)]"
                    />
                </div>
                <div className="flex gap-sm max-md:flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-md py-sm bg-white border border-border rounded-md text-sm text-[var(--color-brun-chocolat)] cursor-pointer transition-all duration-fast ease-standard hover:border-[var(--color-rose-poudre)] focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(186,144,162,0.1)]"
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
                        className="px-md py-sm bg-white border border-border rounded-md text-sm text-[var(--color-brun-chocolat)] cursor-pointer transition-all duration-fast ease-standard hover:border-[var(--color-rose-poudre)] focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(186,144,162,0.1)]"
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
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-50,#eff6ff)] rounded-lg mb-4 text-sm">
                    <span>Showing orders for <strong>{customerName}</strong></span>
                    <button
                        type="button"
                        onClick={() => setSearchParams({})}
                        className="ml-auto bg-transparent border-none cursor-pointer text-sm text-[var(--color-primary-600,#2563eb)] underline"
                    >
                        Show all orders
                    </button>
                </div>
            )}

            {/* Orders Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-2xl gap-md text-[var(--color-gris-chaud)]">
                    <div className="w-10 h-10 border-3 border-border border-t-[var(--color-rose-poudre)] rounded-full animate-spin"></div>
                    <span>Loading orders...</span>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-2xl text-center bg-white rounded-lg shadow">
                    <FileText size={48} className="text-[var(--color-gris-chaud)] opacity-40 mb-md" />
                    <h3 className="text-lg font-semibold text-[var(--color-brun-chocolat)] mb-xs">No B2B orders</h3>
                    <p className="text-[var(--color-gris-chaud)] text-sm mb-lg">Create your first wholesale order</p>
                    <button className="btn btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                        <Plus size={18} />
                        New Order
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden max-md:overflow-x-auto">
                    <table className="w-full border-collapse max-md:min-w-[900px]">
                        <thead>
                            <tr>
                                {['Order #', 'Customer', 'Date', 'Delivery', 'Amount', 'Status', 'Payment', 'Actions'].map(th => (
                                    <th key={th} className="px-lg py-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border whitespace-nowrap">{th}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr
                                    key={order.id}
                                    onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                    className="cursor-pointer transition-colors duration-fast ease-standard hover:bg-[rgba(186,144,162,0.05)] [&:last-child>td]:border-b-0"
                                >
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">
                                        <span className="font-mono font-semibold text-[var(--color-rose-poudre)]">{order.order_number}</span>
                                    </td>
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium">
                                                {order.customer?.company_name || order.customer?.name}
                                            </span>
                                            {order.customer?.company_name && (
                                                <span className="text-xs text-[var(--color-gris-chaud)]">{order.customer.name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">{formatDate(order.order_date)}</td>
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">{formatDate(order.requested_delivery_date)}</td>
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                                            {order.amount_due > 0 && (
                                                <span className="text-xs text-[var(--color-urgent)]">Due: {formatCurrency(order.amount_due)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">{getStatusBadge(order.status)}</td>
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">{getPaymentBadge(order.payment_status)}</td>
                                    <td className="px-lg py-md text-sm text-[var(--color-brun-chocolat)] border-b border-border align-middle">
                                        <div className="flex gap-xs" onClick={e => e.stopPropagation()}>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-md text-[var(--color-gris-chaud)] cursor-pointer transition-all duration-fast ease-standard hover:bg-[var(--color-blanc-creme)] hover:border-[var(--color-rose-poudre)] hover:text-[var(--color-rose-poudre)]"
                                                onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                                title="View details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {order.status === 'draft' && (
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-md text-[var(--color-gris-chaud)] cursor-pointer transition-all duration-fast ease-standard hover:bg-[var(--color-blanc-creme)] hover:border-[var(--color-rose-poudre)] hover:text-[var(--color-rose-poudre)]"
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
