import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Plus, Search, FileText, Truck, CreditCard,
    Eye, Edit2, Clock, CheckCircle, Package, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import './B2BOrdersPage.css'

interface B2BOrder {
    id: string
    order_number: string
    customer_id: string
    customer?: {
        name: string
        company_name: string | null
        phone: string | null
    }
    status: 'draft' | 'confirmed' | 'processing' | 'ready' | 'partially_delivered' | 'delivered' | 'cancelled'
    order_date: string
    requested_delivery_date: string | null
    subtotal: number
    discount_amount: number
    tax_amount: number
    total_amount: number
    payment_status: 'unpaid' | 'partial' | 'paid'
    payment_terms: string | null
    due_date: string | null
    amount_paid: number
    amount_due: number
    created_at: string
}

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

export default function B2BOrdersPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<B2BOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_orders')
                .select(`
                    *,
                    customer:customers(name, company_name, phone)
                `)
                .order('order_date', { ascending: false })

            if (error) throw error
            if (data) {
                // Map database fields to UI expected fields
                const mappedOrders = data.map(order => ({
                    ...order,
                    total_amount: order.total ?? 0,
                    amount_paid: order.paid_amount ?? 0,
                    amount_due: (order.total ?? 0) - (order.paid_amount ?? 0),
                    requested_delivery_date: order.delivery_date,
                    payment_status: order.payment_status ?? 'unpaid',
                })) as unknown as B2BOrder[]
                setOrders(mappedOrders)
            }
        } catch (error) {
            console.error('Error fetching B2B orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchLower) ||
            order.customer?.name?.toLowerCase().includes(searchLower) ||
            order.customer?.company_name?.toLowerCase().includes(searchLower)

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter

        return matchesSearch && matchesStatus && matchesPayment
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
            <span className={`b2b-status-badge b2b-status-badge--${config.color}`}>
                <Icon size={14} />
                {config.label}
            </span>
        )
    }

    const getPaymentBadge = (status: string) => {
        const config = PAYMENT_STATUS_CONFIG[status] || { label: status, color: 'gray' }
        return (
            <span className={`b2b-payment-badge b2b-payment-badge--${config.color}`}>
                {config.label}
            </span>
        )
    }

    return (
        <div className="b2b-orders-page">
            {/* Header */}
            <div className="b2b-orders-page__header">
                <div className="b2b-orders-page__title-section">
                    <h1 className="b2b-orders-page__title">
                        <FileText size={28} />
                        B2B Orders
                    </h1>
                    <p className="b2b-orders-page__subtitle">
                        Manage your wholesale orders and track deliveries
                    </p>
                </div>
                <div className="b2b-orders-page__actions">
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
            <div className="b2b-orders-stats">
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon b2b-stat-card__icon--primary">
                        <FileText size={24} />
                    </div>
                    <div className="b2b-stat-card__content">
                        <span className="b2b-stat-card__value">{stats.total}</span>
                        <span className="b2b-stat-card__label">Total Orders</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon b2b-stat-card__icon--warning">
                        <Clock size={24} />
                    </div>
                    <div className="b2b-stat-card__content">
                        <span className="b2b-stat-card__value">{stats.pending}</span>
                        <span className="b2b-stat-card__label">In Progress</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon b2b-stat-card__icon--info">
                        <Truck size={24} />
                    </div>
                    <div className="b2b-stat-card__content">
                        <span className="b2b-stat-card__value">{stats.toDeliver}</span>
                        <span className="b2b-stat-card__label">To Deliver</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon b2b-stat-card__icon--danger">
                        <CreditCard size={24} />
                    </div>
                    <div className="b2b-stat-card__content">
                        <span className="b2b-stat-card__value">{formatCurrency(stats.totalDue)}</span>
                        <span className="b2b-stat-card__label">To Collect</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="b2b-orders-filters">
                <div className="b2b-orders-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by order # or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="b2b-orders-filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="b2b-orders-filter"
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
                        className="b2b-orders-filter"
                    >
                        <option value="all">All payments</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="b2b-orders-loading">
                    <div className="spinner"></div>
                    <span>Loading orders...</span>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="b2b-orders-empty">
                    <FileText size={48} />
                    <h3>No B2B orders</h3>
                    <p>Create your first wholesale order</p>
                    <button className="btn btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                        <Plus size={18} />
                        New Order
                    </button>
                </div>
            ) : (
                <div className="b2b-orders-table-container">
                    <table className="b2b-orders-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Delivery</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} onClick={() => navigate(`/b2b/orders/${order.id}`)}>
                                    <td>
                                        <span className="b2b-order-number">{order.order_number}</span>
                                    </td>
                                    <td>
                                        <div className="b2b-customer-cell">
                                            <span className="b2b-customer-name">
                                                {order.customer?.company_name || order.customer?.name}
                                            </span>
                                            {order.customer?.company_name && (
                                                <span className="b2b-customer-contact">{order.customer.name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{formatDate(order.order_date)}</td>
                                    <td>{formatDate(order.requested_delivery_date)}</td>
                                    <td>
                                        <div className="b2b-amount-cell">
                                            <span className="b2b-amount-total">{formatCurrency(order.total_amount)}</span>
                                            {order.amount_due > 0 && (
                                                <span className="b2b-amount-due">Due: {formatCurrency(order.amount_due)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td>{getPaymentBadge(order.payment_status)}</td>
                                    <td>
                                        <div className="b2b-actions-cell" onClick={e => e.stopPropagation()}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                                title="View details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {order.status === 'draft' && (
                                                <button
                                                    className="btn-icon"
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
