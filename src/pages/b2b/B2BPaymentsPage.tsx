import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, CreditCard, Search,
    TrendingUp, Clock, CheckCircle, AlertCircle, Eye
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
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

const PAYMENT_METHODS = {
    cash: { label: 'Espèces', icon: '💵' },
    transfer: { label: 'Virement', icon: '🏦' },
    check: { label: 'Chèque', icon: '📝' },
    card: { label: 'Carte', icon: '💳' },
    qris: { label: 'QRIS', icon: '📱' },
    credit: { label: 'Crédit', icon: '📋' }
}

export default function B2BPaymentsPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'received' | 'outstanding'>('received')
    const [payments, setPayments] = useState<Payment[]>([])
    const [outstandingOrders, setOutstandingOrders] = useState<OutstandingOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [methodFilter, setMethodFilter] = useState<string>('all')
    const [dateFilter, setDateFilter] = useState<string>('all')

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
            if (data) setPayments(data)
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
                    id, order_number, total_amount, amount_due, due_date, payment_status,
                    customer:customers(name, company_name)
                `)
                .in('payment_status', ['unpaid', 'partial', 'overdue'])
                .neq('status', 'cancelled')
                .order('due_date', { ascending: true, nullsFirst: false })

            if (error) throw error
            if (data) setOutstandingOrders(data)
        } catch (error) {
            console.error('Error fetching outstanding orders:', error)
        }
    }

    const getDateRange = (filter: string) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (filter) {
            case 'today':
                return { start: today, end: now }
            case 'week':
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - 7)
                return { start: weekStart, end: now }
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                return { start: monthStart, end: now }
            default:
                return null
        }
    }

    const filteredPayments = payments.filter(payment => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            payment.payment_number.toLowerCase().includes(searchLower) ||
            payment.order?.order_number.toLowerCase().includes(searchLower) ||
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
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false
        return new Date(dueDate) < new Date()
    }

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
                            Paiements B2B
                        </h1>
                        <p className="b2b-payments-header__subtitle">
                            Gérez les paiements et le suivi des encaissements
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="b2b-payments-stats">
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--success">
                        <TrendingUp size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{formatCurrency(stats.totalReceived)}</span>
                        <span className="b2b-payment-stat__label">Total Encaissé</span>
                    </div>
                </div>
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--warning">
                        <Clock size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{formatCurrency(stats.totalOutstanding)}</span>
                        <span className="b2b-payment-stat__label">En Attente</span>
                    </div>
                </div>
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--info">
                        <CheckCircle size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{stats.paymentsCount}</span>
                        <span className="b2b-payment-stat__label">Paiements Reçus</span>
                    </div>
                </div>
                <div className="b2b-payment-stat">
                    <div className="b2b-payment-stat__icon b2b-payment-stat__icon--danger">
                        <AlertCircle size={24} />
                    </div>
                    <div className="b2b-payment-stat__content">
                        <span className="b2b-payment-stat__value">{stats.overdueCount}</span>
                        <span className="b2b-payment-stat__label">En Retard</span>
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
                    Paiements Reçus ({payments.length})
                </button>
                <button
                    className={`b2b-payments-tab ${activeTab === 'outstanding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('outstanding')}
                >
                    <Clock size={16} />
                    À Encaisser ({outstandingOrders.length})
                </button>
            </div>

            {/* Filters */}
            <div className="b2b-payments-filters">
                <div className="b2b-payments-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
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
                            <option value="all">Toutes les méthodes</option>
                            {Object.entries(PAYMENT_METHODS).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="b2b-payments-filter"
                        >
                            <option value="all">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">7 derniers jours</option>
                            <option value="month">Ce mois</option>
                        </select>
                    </>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="b2b-payments-loading">
                    <div className="spinner"></div>
                    <span>Chargement...</span>
                </div>
            ) : activeTab === 'received' ? (
                <div className="b2b-payments-table-container">
                    {filteredPayments.length === 0 ? (
                        <div className="b2b-payments-empty">
                            <CreditCard size={48} />
                            <h3>Aucun paiement</h3>
                            <p>Les paiements reçus apparaîtront ici</p>
                        </div>
                    ) : (
                        <table className="b2b-payments-table">
                            <thead>
                                <tr>
                                    <th>N° Paiement</th>
                                    <th>Commande</th>
                                    <th>Client</th>
                                    <th>Date</th>
                                    <th>Méthode</th>
                                    <th>Référence</th>
                                    <th>Montant</th>
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
                                                {PAYMENT_METHODS[payment.payment_method as keyof typeof PAYMENT_METHODS]?.icon}
                                                {PAYMENT_METHODS[payment.payment_method as keyof typeof PAYMENT_METHODS]?.label || payment.payment_method}
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
                                                title="Voir la commande"
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
            ) : (
                <div className="b2b-outstanding-container">
                    {filteredOutstanding.length === 0 ? (
                        <div className="b2b-payments-empty">
                            <CheckCircle size={48} />
                            <h3>Aucun montant en attente</h3>
                            <p>Tous les paiements sont à jour</p>
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
                                                En retard
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
                                            <span className="label">Reste dû</span>
                                            <span className="value due">{formatCurrency(order.amount_due)}</span>
                                        </div>
                                        {order.due_date && (
                                            <div className="detail">
                                                <span className="label">Échéance</span>
                                                <span className={`value ${isOverdue(order.due_date) ? 'overdue' : ''}`}>
                                                    {formatDate(order.due_date)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button className="btn btn-primary btn-sm btn-block">
                                        <CreditCard size={16} />
                                        Enregistrer un paiement
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
