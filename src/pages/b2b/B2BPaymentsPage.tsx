import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, CreditCard, Search,
    TrendingUp, Clock, CheckCircle, AlertCircle, Eye,
    Download, BarChart3, DollarSign, Loader2
} from 'lucide-react'
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
import './B2BPaymentsPage.css'

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
    cash: { label: 'Cash', icon: '💵' },
    transfer: { label: 'Transfer', icon: '🏦' },
    check: { label: 'Check', icon: '📝' },
    card: { label: 'Card', icon: '💳' },
    qris: { label: 'QRIS', icon: '📱' },
    credit: { label: 'Credit', icon: '📋' },
    store_credit: { label: 'Store Credit', icon: '🏪' },
}

type TabType = 'received' | 'outstanding' | 'aging'

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
                .order('payment_date', { ascending: false })

            if (error) throw error
            if (data) setPayments(data as unknown as Payment[])
        } catch (error) {
            console.error('Error fetching payments:', error)
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

            if (error) throw error
            if (data) {
                const mappedOrders = data.map(order => ({
                    id: order.id,
                    order_number: order.order_number,
                    customer: order.customer,
                    total_amount: order.total ?? 0,
                    amount_due: (order.total ?? 0) - (order.paid_amount ?? 0),
                    due_date: order.delivery_date,
                    payment_status: order.payment_status ?? 'unpaid',
                })) as unknown as OutstandingOrder[]
                setOutstandingOrders(mappedOrders)
            }
        } catch (error) {
            console.error('Error fetching outstanding orders:', error)
        }
    }

    const loadAgingReport = useCallback(async () => {
        setAgingLoading(true)
        try {
            const report = await generateAgingReport()
            setAgingReport(report)
        } catch (error) {
            console.error('Error loading aging report:', error)
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
            console.error('FIFO payment error:', error)
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

    return (
        <div className="b2b-payments-page">
            {/* Header */}
            <div className="b2b-payments-header">
                <div className="b2b-payments-header__left">
                    <button className="btn btn-ghost" onClick={() => navigate('/b2b/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="b2b-payments-header__title">
                            <CreditCard size={28} />
                            B2B Payments
                        </h1>
                        <p className="b2b-payments-header__subtitle">
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
            <div className="b2b-payments-stats">
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--success">
                        <TrendingUp size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{formatCurrency(stats.totalReceived)}</span>
                        <span className="b2b-payment-stat__label">Total Received</span>
                    </div>
                </div>
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--warning">
                        <Clock size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{formatCurrency(stats.totalOutstanding)}</span>
                        <span className="b2b-payment-stat__label">Outstanding</span>
                    </div>
                </div>
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--info">
                        <CheckCircle size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{stats.paymentsCount}</span>
                        <span className="b2b-payment-stat__label">Payments Received</span>
                    </div>
                </div>
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--danger">
                        <AlertCircle size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{stats.overdueCount}</span>
                        <span className="b2b-payment-stat__label">Overdue</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="b2b-payments-tabs">
                <button
                    className={`b2b-payments-tab ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => setActiveTab('received')}
                >
                    <CheckCircle size={16} />
                    Received ({payments.length})
                </button>
                <button
                    className={`b2b-payments-tab ${activeTab === 'outstanding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('outstanding')}
                >
                    <Clock size={16} />
                    Outstanding ({outstandingOrders.length})
                </button>
                <button
                    className={`b2b-payments-tab ${activeTab === 'aging' ? 'active' : ''}`}
                    onClick={() => setActiveTab('aging')}
                >
                    <BarChart3 size={16} />
                    Aging Report
                </button>
            </div>

            {/* Filters - only for received and outstanding tabs */}
            {activeTab !== 'aging' && (
                <div className="b2b-payments-filters">
                    <div className="b2b-payments-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {activeTab === 'received' && (
                        <>
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="b2b-payments-filter"
                            >
                                <option value="all">All methods</option>
                                {Object.entries(PAYMENT_METHODS).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="b2b-payments-filter"
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
                <div className="b2b-payments-loading">
                    <div className="spinner"></div>
                    <span>Loading...</span>
                </div>
            ) : activeTab === 'received' ? (
                <div className="b2b-payments-table-container">
                    {filteredPayments.length === 0 ? (
                        <div className="b2b-payments-empty">
                            <CreditCard size={48} />
                            <h3>No payments</h3>
                            <p>Received payments will appear here</p>
                        </div>
                    ) : (
                        <table className="b2b-payments-table">
                            <thead>
                                <tr>
                                    <th>Payment #</th>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Method</th>
                                    <th>Reference</th>
                                    <th>Amount</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>
                                            <span className="payment-number">{payment.payment_number}</span>
                                        </td>
                                        <td>
                                            <span
                                                className="order-link"
                                                onClick={() => navigate(`/b2b/orders/${payment.order_id}`)}
                                            >
                                                {payment.order?.order_number}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="customer-cell">
                                                <span className="customer-name">
                                                    {payment.customer?.company_name || payment.customer?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{formatDate(payment.payment_date)}</td>
                                        <td>
                                            <span className="payment-method">
                                                {PAYMENT_METHODS[payment.payment_method]?.icon}
                                                {PAYMENT_METHODS[payment.payment_method]?.label || payment.payment_method}
                                            </span>
                                        </td>
                                        <td>{payment.reference_number || '-'}</td>
                                        <td>
                                            <strong className="amount-value">{formatCurrency(payment.amount)}</strong>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
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
                <div className="b2b-outstanding-container">
                    {filteredOutstanding.length === 0 ? (
                        <div className="b2b-payments-empty">
                            <CheckCircle size={48} />
                            <h3>No outstanding amounts</h3>
                            <p>All payments are up to date</p>
                        </div>
                    ) : (
                        <div className="b2b-outstanding-list">
                            {filteredOutstanding.map(order => (
                                <div
                                    key={order.id}
                                    className={`b2b-outstanding-card ${isOverdue(order.due_date) ? 'overdue' : ''}`}
                                    onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                >
                                    <div className="b2b-outstanding-card__header">
                                        <span className="order-number">{order.order_number}</span>
                                        {isOverdue(order.due_date) && (
                                            <span className="overdue-badge">
                                                <AlertCircle size={14} />
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                    <div className="b2b-outstanding-card__customer">
                                        {order.customer?.company_name || order.customer?.name}
                                    </div>
                                    <div className="b2b-outstanding-card__details">
                                        <div className="detail">
                                            <span className="label">Total</span>
                                            <span className="value">{formatCurrency(order.total_amount)}</span>
                                        </div>
                                        <div className="detail">
                                            <span className="label">Amount Due</span>
                                            <span className="value due">{formatCurrency(order.amount_due)}</span>
                                        </div>
                                        {order.due_date && (
                                            <div className="detail">
                                                <span className="label">Due Date</span>
                                                <span className={`value ${isOverdue(order.due_date) ? 'overdue' : ''}`}>
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
                <div className="b2b-aging-container">
                    {agingLoading ? (
                        <div className="b2b-payments-loading">
                            <div className="spinner"></div>
                            <span>Loading aging report...</span>
                        </div>
                    ) : !agingReport ? (
                        <div className="b2b-payments-empty">
                            <BarChart3 size={48} />
                            <h3>No data available</h3>
                            <p>Aging report could not be loaded</p>
                        </div>
                    ) : (
                        <>
                            {/* Aging Summary */}
                            <div className="b2b-aging-summary">
                                <div className="b2b-aging-summary__total">
                                    <span className="b2b-aging-summary__total-label">Total Outstanding</span>
                                    <span className="b2b-aging-summary__total-value">
                                        {formatCurrency(agingReport.totalOutstanding)}
                                    </span>
                                    <span className="b2b-aging-summary__total-count">
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
                            <div className="b2b-aging-buckets">
                                {agingReport.buckets.map((bucket, idx) => (
                                    <div
                                        key={bucket.label}
                                        className={`b2b-aging-bucket b2b-aging-bucket--${idx === 0 ? 'current' : idx === 1 ? 'overdue' : 'critical'}`}
                                    >
                                        <div className="b2b-aging-bucket__header">
                                            <h3 className="b2b-aging-bucket__title">{bucket.label}</h3>
                                            <div className="b2b-aging-bucket__stats">
                                                <span className="b2b-aging-bucket__amount">
                                                    {formatCurrency(bucket.totalDue)}
                                                </span>
                                                <span className="b2b-aging-bucket__count">
                                                    {bucket.count} order(s)
                                                </span>
                                            </div>
                                        </div>

                                        {bucket.orders.length > 0 ? (
                                            <table className="b2b-aging-bucket__table">
                                                <thead>
                                                    <tr>
                                                        <th>Order</th>
                                                        <th>Customer</th>
                                                        <th>Days Overdue</th>
                                                        <th>Amount Due</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bucket.orders.map(order => (
                                                        <tr
                                                            key={order.id}
                                                            className="b2b-aging-bucket__row"
                                                            onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                                        >
                                                            <td>
                                                                <span className="order-link">{order.order_number}</span>
                                                            </td>
                                                            <td>{order.company_name || order.customer_name}</td>
                                                            <td>
                                                                <span className={`days-badge ${order.days_overdue > 60 ? 'critical' : order.days_overdue > 30 ? 'warning' : ''}`}>
                                                                    {order.days_overdue}d
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <strong>{formatCurrency(order.amount_due)}</strong>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="b2b-aging-bucket__empty">
                                                No orders in this range
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* FIFO Payment by Customer */}
                            {Object.keys(customerGroups).length > 0 && (
                                <div className="b2b-fifo-section">
                                    <h3 className="b2b-fifo-section__title">
                                        <DollarSign size={20} />
                                        Record FIFO Payment
                                    </h3>
                                    <p className="b2b-fifo-section__desc">
                                        Select a customer to allocate a payment across their oldest invoices first.
                                    </p>
                                    <div className="b2b-fifo-customers">
                                        {Object.entries(customerGroups).map(([custId, group]) => (
                                            <div key={custId} className="b2b-fifo-customer-card">
                                                <div className="b2b-fifo-customer-card__info">
                                                    <span className="b2b-fifo-customer-card__name">{group.name}</span>
                                                    <span className="b2b-fifo-customer-card__details">
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
                    <div className="modal modal-md is-active fifo-modal">
                        <div className="modal__header">
                            <h3 className="modal__title">
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
                            <p className="fifo-modal__desc">
                                Payment will be allocated to the oldest unpaid invoices first (FIFO).
                            </p>
                            <div className="fifo-modal__field">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    value={fifoAmount}
                                    onChange={(e) => setFifoAmount(e.target.value)}
                                    placeholder="Enter amount..."
                                    min="0"
                                    disabled={fifoProcessing}
                                />
                            </div>
                            <div className="fifo-modal__field">
                                <label>Payment Method</label>
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
                            <div className="fifo-modal__field">
                                <label>Reference (optional)</label>
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
