import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, CreditCard, Search,
    TrendingUp, Clock, CheckCircle, AlertCircle, Eye,
    Download, BarChart3, DollarSign, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import {
    generateAgingReport,
    exportOutstandingCSV,
    downloadCSV,
    applyFIFOPayment,
    type IAgingReport,
    type IOutstandingOrder,
} from '../../services/b2b/arService'
import { useAuthStore } from '../../stores/authStore'
import { logError } from '@/utils/logger'

interface Payment {
    id: string
    payment_number: string
    order_id: string
    order?: {
        order_number: string
    }
    customer_id: string
    customer?: {
        name: string
        company_name: string | null
    }
    amount: number
    payment_method: string
    payment_date: string
    reference_number: string | null
    bank_name: string | null
    status: string
    notes: string | null
    created_at: string
}

interface OutstandingOrder {
    id: string
    order_number: string
    customer?: {
        name: string
        company_name: string | null
    }
    total_amount: number
    amount_due: number
    due_date: string | null
    payment_status: string
}

const PAYMENT_METHODS: Record<string, { label: string; icon: string }> = {
    cash: { label: 'Cash', icon: '\uD83D\uDCB5' },
    transfer: { label: 'Transfer', icon: '\uD83C\uDFE6' },
    check: { label: 'Check', icon: '\uD83D\uDCDD' },
    card: { label: 'Card', icon: '\uD83D\uDCB3' },
    qris: { label: 'QRIS', icon: '\uD83D\uDCF1' },
    credit: { label: 'Credit', icon: '\uD83D\uDCCB' },
    store_credit: { label: 'Store Credit', icon: '\uD83C\uDFEA' },
}

type TabType = 'received' | 'outstanding' | 'aging'

const statIconStyles: Record<string, string> = {
    success: 'bg-[rgba(107,142,107,0.15)] text-success',
    warning: 'bg-[rgba(234,192,134,0.15)] text-warning',
    info: 'bg-[rgba(123,163,181,0.15)] text-info',
    danger: 'bg-[rgba(220,53,69,0.15)] text-[var(--color-urgent)]',
}

export default function B2BPaymentsPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [activeTab, setActiveTab] = useState<TabType>('received')
    const [payments, setPayments] = useState<Payment[]>([])
    const [outstandingOrders, setOutstandingOrders] = useState<OutstandingOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [methodFilter, setMethodFilter] = useState<string>('all')
    const [dateFilter, setDateFilter] = useState<string>('all')

    // Aging report state
    const [agingReport, setAgingReport] = useState<IAgingReport | null>(null)
    const [agingLoading, setAgingLoading] = useState(false)

    // FIFO payment state
    const [showFIFOModal, setShowFIFOModal] = useState(false)
    const [fifoCustomerId, setFifoCustomerId] = useState('')
    const [fifoCustomerName, setFifoCustomerName] = useState('')
    const [fifoAmount, setFifoAmount] = useState('')
    const [fifoMethod, setFifoMethod] = useState('transfer')
    const [fifoReference, setFifoReference] = useState('')
    const [fifoProcessing, setFifoProcessing] = useState(false)

    useEffect(() => {
        fetchPayments()
        fetchOutstandingOrders()
    }, [])

    const fetchPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_payments')
                .select(`
                    *,
                    order:b2b_orders(order_number),
                    customer:customers(name, company_name)
                `)
                .eq('status', 'completed')
                .returns<Payment[]>()
                .order('payment_date', { ascending: false })

            if (error) throw error
            if (data) setPayments(data)
        } catch (error) {
            logError('Error fetching payments:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchOutstandingOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_orders')
                .select(`
                    id, order_number, total, paid_amount, delivery_date, payment_status,
                    customer:customers(name, company_name)
                `)
                .in('payment_status', ['unpaid', 'partial'])
                .neq('status', 'cancelled')
                .order('delivery_date', { ascending: true, nullsFirst: false })
                .returns<OutstandingOrder[]>()

            if (error) throw error
            if (data) {
                const mappedOrders = data.map(order => ({
                    id: order.id,
                    order_number: order.order_number,
                    customer: order.customer,
                    total_amount: (order as unknown as { total: number | null }).total ?? 0,
                    amount_due: ((order as unknown as { total: number | null }).total ?? 0) - ((order as unknown as { paid_amount: number | null }).paid_amount ?? 0),
                    due_date: (order as unknown as { delivery_date: string | null }).delivery_date,
                    payment_status: order.payment_status ?? 'unpaid',
                }))
                setOutstandingOrders(mappedOrders)
            }
        } catch (error) {
            logError('Error fetching outstanding orders:', error)
        }
    }

    const loadAgingReport = useCallback(async () => {
        setAgingLoading(true)
        try {
            const report = await generateAgingReport()
            setAgingReport(report)
        } catch (error) {
            logError('Error loading aging report:', error)
            toast.error('Failed to load aging report')
        } finally {
            setAgingLoading(false)
        }
    }, [])

    useEffect(() => {
        if (activeTab === 'aging' && !agingReport) {
            loadAgingReport()
        }
    }, [activeTab, agingReport, loadAgingReport])

    const handleExportCSV = useCallback(async () => {
        if (!agingReport) return
        const allOrders = agingReport.buckets.flatMap(b => b.orders)
        const csv = exportOutstandingCSV(allOrders)
        const date = new Date().toISOString().split('T')[0]
        downloadCSV(csv, `outstanding-orders-${date}.csv`)
        toast.success('CSV exported')
    }, [agingReport])

    const handleFIFOPayment = useCallback(async () => {
        if (!fifoCustomerId || !fifoAmount || Number(fifoAmount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        setFifoProcessing(true)
        try {
            const result = await applyFIFOPayment(
                fifoCustomerId,
                Number(fifoAmount),
                fifoMethod,
                fifoReference || null,
                user?.id || ''
            )

            if (result.success && result.allocations) {
                toast.success(
                    `Payment allocated to ${result.allocations.allocations.length} order(s). ` +
                    `Total: ${formatCurrency(result.allocations.totalAllocated)}`
                )
                if (result.allocations.remainingAmount > 0) {
                    toast.info(`Remaining: ${formatCurrency(result.allocations.remainingAmount)}`)
                }
                setShowFIFOModal(false)
                setFifoAmount('')
                setFifoReference('')
                // Refresh data
                fetchOutstandingOrders()
                fetchPayments()
                setAgingReport(null) // Force reload
            } else {
                toast.error(result.error || 'Payment failed')
            }
        } catch (error) {
            logError('FIFO payment error:', error)
            toast.error('Payment processing failed')
        } finally {
            setFifoProcessing(false)
        }
    }, [fifoCustomerId, fifoAmount, fifoMethod, fifoReference, user?.id])

    const openFIFOForCustomer = useCallback((customerId: string, customerName: string) => {
        setFifoCustomerId(customerId)
        setFifoCustomerName(customerName)
        setFifoAmount('')
        setFifoReference('')
        setFifoMethod('transfer')
        setShowFIFOModal(true)
    }, [])

    const getDateRange = (filter: string) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (filter) {
            case 'today':
                return { start: today, end: now }
            case 'week': {
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - 7)
                return { start: weekStart, end: now }
            }
            case 'month': {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                return { start: monthStart, end: now }
            }
            default:
                return null
        }
    }

    const filteredPayments = payments.filter(payment => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            payment.payment_number?.toLowerCase().includes(searchLower) ||
            payment.order?.order_number?.toLowerCase().includes(searchLower) ||
            payment.customer?.name?.toLowerCase().includes(searchLower) ||
            payment.customer?.company_name?.toLowerCase().includes(searchLower)

        const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter

        let matchesDate = true
        if (dateFilter !== 'all') {
            const range = getDateRange(dateFilter)
            if (range) {
                const paymentDate = new Date(payment.payment_date)
                matchesDate = paymentDate >= range.start && paymentDate <= range.end
            }
        }

        return matchesSearch && matchesMethod && matchesDate
    })

    const filteredOutstanding = outstandingOrders.filter(order => {
        const searchLower = searchTerm.toLowerCase()
        return order.order_number.toLowerCase().includes(searchLower) ||
            order.customer?.name?.toLowerCase().includes(searchLower) ||
            order.customer?.company_name?.toLowerCase().includes(searchLower)
    })

    const stats = {
        totalReceived: payments.reduce((sum, p) => sum + p.amount, 0),
        totalOutstanding: outstandingOrders.reduce((sum, o) => sum + o.amount_due, 0),
        paymentsCount: payments.length,
        outstandingCount: outstandingOrders.length,
        overdueCount: outstandingOrders.filter(o => {
            if (!o.due_date) return false
            return new Date(o.due_date) < new Date()
        }).length
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false
        return new Date(dueDate) < new Date()
    }

    // Group outstanding orders by customer for FIFO
    const customerGroups = agingReport
        ? agingReport.buckets.flatMap(b => b.orders).reduce<Record<string, { name: string; orders: IOutstandingOrder[]; totalDue: number }>>((acc, order) => {
            if (!acc[order.customer_id]) {
                acc[order.customer_id] = {
                    name: order.company_name || order.customer_name,
                    orders: [],
                    totalDue: 0,
                }
            }
            acc[order.customer_id].orders.push(order)
            acc[order.customer_id].totalDue += order.amount_due
            return acc
        }, {})
        : {}

    const thClass = 'p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border'
    const tdClass = 'p-md text-sm border-b border-border'

    return (
        <div className="p-lg h-full overflow-y-auto bg-[var(--color-blanc-creme)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-xl">
                <div className="flex items-center gap-md">
                    <button className="btn btn-ghost" onClick={() => navigate('/b2b/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="flex items-center gap-sm font-display text-2xl font-bold text-[var(--color-brun-chocolat)]">
                            <CreditCard size={28} />
                            B2B Payments
                        </h1>
                        <p className="text-[var(--color-gris-chaud)] text-sm mt-1">
                            Manage payments and receivables tracking
                        </p>
                    </div>
                </div>
                {activeTab === 'aging' && agingReport && (
                    <button className="btn btn-primary" onClick={handleExportCSV}>
                        <Download size={16} />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 max-md:grid-cols-2 gap-md mb-xl">
                {[
                    { icon: TrendingUp, style: 'success', value: formatCurrency(stats.totalReceived), label: 'Total Received' },
                    { icon: Clock, style: 'warning', value: formatCurrency(stats.totalOutstanding), label: 'Outstanding' },
                    { icon: CheckCircle, style: 'info', value: stats.paymentsCount, label: 'Payments Received' },
                    { icon: AlertCircle, style: 'danger', value: stats.overdueCount, label: 'Overdue' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-lg flex items-center gap-md">
                        <div className={cn('w-12 h-12 rounded-md flex items-center justify-center', statIconStyles[stat.style])}>
                            <stat.icon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-[var(--color-brun-chocolat)]">{stat.value}</span>
                            <span className="text-sm text-[var(--color-gris-chaud)]">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-xs border-b border-border mb-lg">
                {([
                    { key: 'received' as TabType, icon: CheckCircle, label: `Received (${payments.length})` },
                    { key: 'outstanding' as TabType, icon: Clock, label: `Outstanding (${outstandingOrders.length})` },
                    { key: 'aging' as TabType, icon: BarChart3, label: 'Aging Report' },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        className={cn(
                            'flex items-center gap-xs px-lg py-sm bg-transparent border-none border-b-2 border-b-transparent text-sm font-medium cursor-pointer transition-all duration-fast -mb-px',
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

            {/* Filters - only for received and outstanding tabs */}
            {activeTab !== 'aging' && (
                <div className="flex gap-md mb-lg flex-wrap">
                    <div className="flex-1 min-w-[250px] max-w-[350px] flex items-center gap-sm bg-white border border-border rounded-md px-md py-sm focus-within:border-[var(--color-rose-poudre)] focus-within:shadow-[0_0_0_3px_rgba(186,144,162,0.1)]">
                        <Search size={20} className="text-[var(--color-gris-chaud)]" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 border-none bg-transparent text-sm outline-none"
                        />
                    </div>
                    {activeTab === 'received' && (
                        <>
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="px-md py-sm bg-white border border-border rounded-md text-sm cursor-pointer focus:outline-none focus:border-[var(--color-rose-poudre)]"
                            >
                                <option value="all">All methods</option>
                                {Object.entries(PAYMENT_METHODS).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-md py-sm bg-white border border-border rounded-md text-sm cursor-pointer focus:outline-none focus:border-[var(--color-rose-poudre)]"
                            >
                                <option value="all">All dates</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 days</option>
                                <option value="month">This month</option>
                            </select>
                        </>
                    )}
                </div>
            )}

            {/* Content */}
            {loading && activeTab !== 'aging' ? (
                <div className="flex flex-col items-center justify-center p-2xl gap-md text-[var(--color-gris-chaud)] bg-white rounded-lg shadow">
                    <div className="w-10 h-10 border-3 border-border border-t-[var(--color-rose-poudre)] rounded-full animate-spin"></div>
                    <span>Loading...</span>
                </div>
            ) : activeTab === 'received' ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {filteredPayments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-2xl text-center">
                            <CreditCard size={48} className="text-[var(--color-gris-chaud)] opacity-30 mb-md" />
                            <h3 className="mb-xs text-[var(--color-brun-chocolat)]">No payments</h3>
                            <p className="text-[var(--color-gris-chaud)] text-sm">Received payments will appear here</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {['Payment #', 'Order', 'Customer', 'Date', 'Method', 'Reference', 'Amount', ''].map(th => (
                                        <th key={th} className={thClass}>{th}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="[&:last-child>td]:border-b-0 hover:bg-[rgba(186,144,162,0.03)]">
                                        <td className={tdClass}>
                                            <span className="font-mono font-semibold text-[var(--color-rose-poudre)]">{payment.payment_number}</span>
                                        </td>
                                        <td className={tdClass}>
                                            <span
                                                className="font-mono font-medium text-info cursor-pointer hover:underline"
                                                onClick={() => navigate(`/b2b/orders/${payment.order_id}`)}
                                            >
                                                {payment.order?.order_number}
                                            </span>
                                        </td>
                                        <td className={tdClass}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {payment.customer?.company_name || payment.customer?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={tdClass}>{formatDate(payment.payment_date)}</td>
                                        <td className={tdClass}>
                                            <span className="inline-flex items-center gap-xs">
                                                {PAYMENT_METHODS[payment.payment_method]?.icon}
                                                {PAYMENT_METHODS[payment.payment_method]?.label || payment.payment_method}
                                            </span>
                                        </td>
                                        <td className={tdClass}>{payment.reference_number || '-'}</td>
                                        <td className={tdClass}>
                                            <strong className="text-success">{formatCurrency(payment.amount)}</strong>
                                        </td>
                                        <td className={tdClass}>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-md text-[var(--color-gris-chaud)] cursor-pointer hover:border-[var(--color-rose-poudre)] hover:text-[var(--color-rose-poudre)]"
                                                onClick={() => navigate(`/b2b/orders/${payment.order_id}`)}
                                                title="View order"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : activeTab === 'outstanding' ? (
                <div>
                    {filteredOutstanding.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-2xl text-center bg-white rounded-lg shadow">
                            <CheckCircle size={48} className="text-[var(--color-gris-chaud)] opacity-30 mb-md" />
                            <h3 className="mb-xs text-[var(--color-brun-chocolat)]">No outstanding amounts</h3>
                            <p className="text-[var(--color-gris-chaud)] text-sm">All payments are up to date</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-md">
                            {filteredOutstanding.map(order => (
                                <div
                                    key={order.id}
                                    className={cn(
                                        'bg-white rounded-lg shadow p-lg cursor-pointer transition-all duration-fast border-l-4 border-l-warning hover:shadow-md hover:-translate-y-0.5',
                                        isOverdue(order.due_date) && 'border-l-[var(--color-urgent)] bg-[rgba(220,53,69,0.02)]'
                                    )}
                                    onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                >
                                    <div className="flex items-center justify-between mb-sm">
                                        <span className="font-mono font-semibold text-[var(--color-rose-poudre)]">{order.order_number}</span>
                                        {isOverdue(order.due_date) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgba(220,53,69,0.1)] text-[var(--color-urgent)] rounded-xl text-[11px] font-semibold">
                                                <AlertCircle size={14} />
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-medium text-[var(--color-brun-chocolat)] mb-md">
                                        {order.customer?.company_name || order.customer?.name}
                                    </div>
                                    <div className="flex flex-wrap gap-md py-md border-t border-border mb-md">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-[var(--color-gris-chaud)]">Total</span>
                                            <span className="font-semibold text-[var(--color-brun-chocolat)]">{formatCurrency(order.total_amount)}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-[var(--color-gris-chaud)]">Amount Due</span>
                                            <span className="font-semibold text-[var(--color-urgent)]">{formatCurrency(order.amount_due)}</span>
                                        </div>
                                        {order.due_date && (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-[var(--color-gris-chaud)]">Due Date</span>
                                                <span className={cn('font-semibold text-[var(--color-brun-chocolat)]', isOverdue(order.due_date) && 'text-[var(--color-urgent)]')}>
                                                    {formatDate(order.due_date)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button className="btn btn-primary btn-sm btn-block">
                                        <CreditCard size={16} />
                                        Record Payment
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Aging Report Tab */
                <div className="flex flex-col gap-lg">
                    {agingLoading ? (
                        <div className="flex flex-col items-center justify-center p-2xl gap-md text-[var(--color-gris-chaud)] bg-white rounded-lg shadow">
                            <div className="w-10 h-10 border-3 border-border border-t-[var(--color-rose-poudre)] rounded-full animate-spin"></div>
                            <span>Loading aging report...</span>
                        </div>
                    ) : !agingReport ? (
                        <div className="flex flex-col items-center justify-center p-2xl text-center bg-white rounded-lg shadow">
                            <BarChart3 size={48} className="text-[var(--color-gris-chaud)] opacity-30 mb-md" />
                            <h3 className="mb-xs text-[var(--color-brun-chocolat)]">No data available</h3>
                            <p className="text-[var(--color-gris-chaud)] text-sm">Aging report could not be loaded</p>
                        </div>
                    ) : (
                        <>
                            {/* Aging Summary */}
                            <div className="flex items-center justify-between bg-white rounded-lg shadow p-lg">
                                <div className="flex flex-col">
                                    <span className="text-sm text-[var(--color-gris-chaud)]">Total Outstanding</span>
                                    <span className="text-2xl font-bold text-[var(--color-brun-chocolat)]">
                                        {formatCurrency(agingReport.totalOutstanding)}
                                    </span>
                                    <span className="text-sm text-[var(--color-gris-chaud)]">
                                        {agingReport.totalOrders} order(s)
                                    </span>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={loadAgingReport}
                                    disabled={agingLoading}
                                >
                                    Refresh
                                </button>
                            </div>

                            {/* Aging Buckets */}
                            <div className="flex flex-col gap-lg">
                                {agingReport.buckets.map((bucket, idx) => {
                                    const borderColor = idx === 0 ? 'border-l-success' : idx === 1 ? 'border-l-warning' : 'border-l-[var(--color-urgent)]'
                                    return (
                                        <div
                                            key={bucket.label}
                                            className={cn('bg-white rounded-lg shadow overflow-hidden border-l-4 border-l-border', borderColor)}
                                        >
                                            <div className="flex items-center justify-between px-lg py-md bg-[var(--color-blanc-creme)] border-b border-border">
                                                <h3 className="text-base font-semibold text-[var(--color-brun-chocolat)]">{bucket.label}</h3>
                                                <div className="flex items-center gap-md">
                                                    <span className="text-lg font-bold text-[var(--color-brun-chocolat)]">
                                                        {formatCurrency(bucket.totalDue)}
                                                    </span>
                                                    <span className="text-sm text-[var(--color-gris-chaud)]">
                                                        {bucket.count} order(s)
                                                    </span>
                                                </div>
                                            </div>

                                            {bucket.orders.length > 0 ? (
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr>
                                                            {['Order', 'Customer', 'Days Overdue', 'Amount Due'].map(th => (
                                                                <th key={th} className="px-lg py-sm text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide">{th}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bucket.orders.map(order => (
                                                            <tr
                                                                key={order.id}
                                                                className="cursor-pointer hover:bg-[rgba(186,144,162,0.03)]"
                                                                onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                                            >
                                                                <td className="px-lg py-sm text-sm border-t border-border">
                                                                    <span className="font-mono font-medium text-info cursor-pointer hover:underline">{order.order_number}</span>
                                                                </td>
                                                                <td className="px-lg py-sm text-sm border-t border-border">{order.company_name || order.customer_name}</td>
                                                                <td className="px-lg py-sm text-sm border-t border-border">
                                                                    <span className={cn(
                                                                        'inline-block px-2 py-0.5 rounded-xl text-xs font-semibold bg-[rgba(107,142,107,0.1)] text-success',
                                                                        order.days_overdue > 60 && 'bg-[rgba(220,53,69,0.1)] text-[var(--color-urgent)]',
                                                                        order.days_overdue > 30 && order.days_overdue <= 60 && 'bg-[rgba(234,192,134,0.15)] text-warning'
                                                                    )}>
                                                                        {order.days_overdue}d
                                                                    </span>
                                                                </td>
                                                                <td className="px-lg py-sm text-sm border-t border-border">
                                                                    <strong>{formatCurrency(order.amount_due)}</strong>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-lg text-center text-[var(--color-gris-chaud)] text-sm">
                                                    No orders in this range
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* FIFO Payment by Customer */}
                            {Object.keys(customerGroups).length > 0 && (
                                <div className="bg-white rounded-lg shadow p-lg">
                                    <h3 className="flex items-center gap-sm text-lg font-semibold text-[var(--color-brun-chocolat)] mb-xs">
                                        <DollarSign size={20} />
                                        Record FIFO Payment
                                    </h3>
                                    <p className="text-sm text-[var(--color-gris-chaud)] mb-lg">
                                        Select a customer to allocate a payment across their oldest invoices first.
                                    </p>
                                    <div className="flex flex-col gap-sm">
                                        {Object.entries(customerGroups).map(([custId, group]) => (
                                            <div key={custId} className="flex items-center justify-between p-md border border-border rounded-md hover:border-[var(--color-rose-poudre)]">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[var(--color-brun-chocolat)]">{group.name}</span>
                                                    <span className="text-sm text-[var(--color-gris-chaud)]">
                                                        {group.orders.length} order(s) &middot; {formatCurrency(group.totalDue)} due
                                                    </span>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => openFIFOForCustomer(custId, group.name)}
                                                >
                                                    <DollarSign size={14} />
                                                    Pay
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* FIFO Payment Modal */}
            {showFIFOModal && (
                <div
                    className="modal-backdrop is-active"
                    onClick={(e) => e.target === e.currentTarget && !fifoProcessing && setShowFIFOModal(false)}
                >
                    <div className="modal modal-md is-active">
                        <div className="modal__header">
                            <h3 className="modal__title flex items-center gap-sm">
                                <DollarSign size={20} />
                                FIFO Payment - {fifoCustomerName}
                            </h3>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowFIFOModal(false)}
                                disabled={fifoProcessing}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal__body">
                            <p className="text-sm text-[var(--color-gris-chaud)] mb-lg">
                                Payment will be allocated to the oldest unpaid invoices first (FIFO).
                            </p>
                            <div className="form-group mb-md">
                                <label className="text-sm font-semibold text-[var(--color-brun-chocolat)]">Amount</label>
                                <input
                                    type="number"
                                    value={fifoAmount}
                                    onChange={(e) => setFifoAmount(e.target.value)}
                                    placeholder="Enter amount..."
                                    min="0"
                                    disabled={fifoProcessing}
                                />
                            </div>
                            <div className="form-group mb-md">
                                <label className="text-sm font-semibold text-[var(--color-brun-chocolat)]">Payment Method</label>
                                <select
                                    value={fifoMethod}
                                    onChange={(e) => setFifoMethod(e.target.value)}
                                    disabled={fifoProcessing}
                                >
                                    <option value="transfer">Transfer</option>
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="card">Card</option>
                                    <option value="qris">QRIS</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="text-sm font-semibold text-[var(--color-brun-chocolat)]">Reference (optional)</label>
                                <input
                                    type="text"
                                    value={fifoReference}
                                    onChange={(e) => setFifoReference(e.target.value)}
                                    placeholder="Transfer reference, check number..."
                                    disabled={fifoProcessing}
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowFIFOModal(false)}
                                disabled={fifoProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleFIFOPayment}
                                disabled={fifoProcessing || !fifoAmount || Number(fifoAmount) <= 0}
                            >
                                {fifoProcessing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <DollarSign size={16} />
                                        Apply FIFO Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
