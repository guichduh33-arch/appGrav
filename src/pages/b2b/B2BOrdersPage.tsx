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
    payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue'
    payment_terms: string | null
    due_date: string | null
    amount_paid: number
    amount_due: number
    created_at: string
}

const STATUS_CONFIG = {
    draft: { label: 'Brouillon', color: 'gray', icon: FileText },
    confirmed: { label: 'Confirmée', color: 'blue', icon: CheckCircle },
    processing: { label: 'En préparation', color: 'yellow', icon: Clock },
    ready: { label: 'Prête', color: 'purple', icon: Package },
    partially_delivered: { label: 'Livr. partielle', color: 'orange', icon: Truck },
    delivered: { label: 'Livrée', color: 'green', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'red', icon: AlertCircle }
}

const PAYMENT_STATUS_CONFIG = {
    unpaid: { label: 'Non payé', color: 'red' },
    partial: { label: 'Partiel', color: 'orange' },
    paid: { label: 'Payé', color: 'green' },
    overdue: { label: 'En retard', color: 'red' }
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
            if (data) setOrders(data)
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
        return new Date(dateString).toLocaleDateString('fr-FR', {
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

    const getPaymentBadge = (status: keyof typeof PAYMENT_STATUS_CONFIG) => {
        const config = PAYMENT_STATUS_CONFIG[status]
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
                        Commandes B2B
                    </h1>
                    <p className="b2b-orders-page__subtitle">
                        Gérez vos commandes wholesale et suivez les livraisons
                    </p>
                </div>
                <div className="b2b-orders-page__actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/b2b/payments')}>
                        <CreditCard size={18} />
                        Paiements
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                        <Plus size={18} />
                        Nouvelle Commande
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
                        <span className="b2b-stat-card__label">Total Commandes</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon b2b-stat-card__icon--warning">
                        <Clock size={24} />
                    </div>
                    <div className="b2b-stat-card__content">
                        <span className="b2b-stat-card__value">{stats.pending}</span>
                        <span className="b2b-stat-card__label">En cours</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon b2b-stat-card__icon--info">
                        <Truck size={24} />
                    </div>
                    <div className="b2b-stat-card__content">
                        <span className="b2b-stat-card__value">{stats.toDeliver}</span>
                        <span className="b2b-stat-card__label">À livrer</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon b2b-stat-card__icon--danger">
                        <CreditCard size={24} />
                    </div>
                    <div className="b2b-stat-card__content">
                        <span className="b2b-stat-card__value">{formatCurrency(stats.totalDue)}</span>
                        <span className="b2b-stat-card__label">À encaisser</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="b2b-orders-filters">
                <div className="b2b-orders-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par n° commande ou client..."
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
                        <option value="all">Tous les statuts</option>
                        <option value="draft">Brouillon</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="processing">En préparation</option>
                        <option value="ready">Prête</option>
                        <option value="partially_delivered">Livr. partielle</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                    </select>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="b2b-orders-filter"
                    >
                        <option value="all">Tous les paiements</option>
                        <option value="unpaid">Non payé</option>
                        <option value="partial">Partiel</option>
                        <option value="paid">Payé</option>
                        <option value="overdue">En retard</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="b2b-orders-loading">
                    <div className="spinner"></div>
                    <span>Chargement des commandes...</span>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="b2b-orders-empty">
                    <FileText size={48} />
                    <h3>Aucune commande B2B</h3>
                    <p>Créez votre première commande wholesale</p>
                    <button className="btn btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                        <Plus size={18} />
                        Nouvelle Commande
                    </button>
                </div>
            ) : (
                <div className="b2b-orders-table-container">
                    <table className="b2b-orders-table">
                        <thead>
                            <tr>
                                <th>N° Commande</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Livraison</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Paiement</th>
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
                                                <span className="b2b-amount-due">Dû: {formatCurrency(order.amount_due)}</span>
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
                                                title="Voir détails"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {order.status === 'draft' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => navigate(`/b2b/orders/${order.id}/edit`)}
                                                    title="Modifier"
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
