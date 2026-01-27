import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Edit2, Printer, Truck, CreditCard, Clock,
    CheckCircle, Package, AlertCircle, FileText, MapPin,
    Phone, Mail, Calendar, Plus, X, User
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import './B2BOrderDetailPage.css'

interface B2BOrder {
    id: string
    order_number: string
    customer_id: string
    customer?: {
        id: string
        name: string
        company_name: string | null
        phone: string | null
        email: string | null
        address: string | null
    }
    status: 'draft' | 'confirmed' | 'processing' | 'ready' | 'partially_delivered' | 'delivered' | 'cancelled'
    order_date: string
    requested_delivery_date: string | null
    actual_delivery_date: string | null
    delivery_address: string | null
    delivery_notes: string | null
    subtotal: number
    discount_type: string | null
    discount_value: number
    discount_amount: number
    tax_rate: number
    tax_amount: number
    total_amount: number
    payment_status: 'unpaid' | 'partial' | 'paid'
    payment_terms: string | null
    due_date: string | null
    amount_paid: number
    amount_due: number
    notes: string | null
    internal_notes: string | null
    created_at: string
}

interface OrderItem {
    id: string
    product_id: string | null
    product_name: string
    product_sku: string | null
    quantity: number
    unit: string
    unit_price: number
    discount_percentage: number
    discount_amount: number
    line_total: number
    quantity_delivered: number
    quantity_remaining: number
}

interface Payment {
    id: string
    payment_number: string
    amount: number
    payment_method: string
    payment_date: string
    reference_number: string | null
    status: string
}

interface Delivery {
    id: string
    delivery_number: string
    status: string
    scheduled_date: string | null
    actual_date: string | null
    driver_name: string | null
    received_by: string | null
}

interface HistoryEntry {
    id: string
    action_type: string
    description: string
    created_at: string
    metadata: any
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

const PAYMENT_METHODS = {
    cash: 'Espèces',
    transfer: 'Virement',
    check: 'Chèque',
    card: 'Carte',
    qris: 'QRIS',
    credit: 'Crédit'
}

export default function B2BOrderDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [order, setOrder] = useState<B2BOrder | null>(null)
    const [items, setItems] = useState<OrderItem[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [deliveries, setDeliveries] = useState<Delivery[]>([])
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'items' | 'payments' | 'deliveries' | 'history'>('items')

    // Payment modal
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        payment_method: 'transfer',
        reference_number: '',
        notes: ''
    })

    useEffect(() => {
        if (id) {
            fetchOrder()
            fetchItems()
            fetchPayments()
            fetchDeliveries()
            fetchHistory()
        }
    }, [id])

    const fetchOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_orders')
                .select(`
                    *,
                    customer:customers(id, name, company_name, phone, email, address)
                `)
                .eq('id', id!)
                .single()

            if (error) throw error
            // Map database fields to UI expected fields
            if (data) {
                const mappedOrder = {
                    ...data,
                    total_amount: data.total ?? 0,
                    amount_paid: data.paid_amount ?? 0,
                    amount_due: (data.total ?? 0) - (data.paid_amount ?? 0),
                    requested_delivery_date: data.delivery_date,
                    actual_delivery_date: data.delivered_at,
                    discount_type: data.discount_percent ? 'percentage' : null,
                    discount_value: data.discount_percent ?? 0,
                    payment_status: data.payment_status ?? 'unpaid',
                } as unknown as B2BOrder
                setOrder(mappedOrder)
            }
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_order_items')
                .select('*')
                .eq('order_id', id!)
                .order('created_at')

            if (error) throw error
            if (data) {
                // Map database fields to UI expected fields
                const mappedItems = data.map(item => ({
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_sku: item.product_sku,
                    quantity: item.quantity,
                    unit: 'pcs', // Default unit since DB doesn't have it
                    unit_price: item.unit_price,
                    discount_percentage: item.discount_percent ?? 0,
                    discount_amount: (item.unit_price * item.quantity * (item.discount_percent ?? 0)) / 100,
                    line_total: item.total,
                    quantity_delivered: 0, // Not tracked in DB
                    quantity_remaining: item.quantity,
                })) as unknown as OrderItem[]
                setItems(mappedItems)
            }
        } catch (error) {
            console.error('Error fetching items:', error)
        }
    }

    const fetchPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_payments')
                .select('*')
                .eq('order_id', id!)
                .order('payment_date', { ascending: false })

            if (error) throw error
            if (data) setPayments(data as unknown as Payment[])
        } catch (error) {
            console.error('Error fetching payments:', error)
        }
    }

    const fetchDeliveries = async () => {
        try {
            // Note: b2b_deliveries table may not exist in DB schema
            // Wrapping in try-catch to handle gracefully
            const { data, error } = await supabase
                .from('b2b_deliveries')
                .select('*')
                .eq('order_id', id!)
                .order('scheduled_date', { ascending: false })

            if (error) {
                // Table might not exist, set empty array
                setDeliveries([])
                return
            }
            if (data) setDeliveries(data as unknown as Delivery[])
        } catch (error) {
            console.error('Error fetching deliveries:', error)
            setDeliveries([])
        }
    }

    const fetchHistory = async () => {
        try {
            // Note: b2b_order_history table may not exist in DB schema
            // Wrapping in try-catch to handle gracefully
            const { data, error } = await supabase
                .from('b2b_order_history')
                .select('*')
                .eq('order_id', id!)
                .order('created_at', { ascending: false })

            if (error) {
                // Table might not exist, set empty array
                setHistory([])
                return
            }
            if (data) setHistory(data as unknown as HistoryEntry[])
        } catch (error) {
            console.error('Error fetching history:', error)
            setHistory([])
        }
    }

    const updateOrderStatus = async (newStatus: string) => {
        if (!order) return

        try {
            const updateData: any = { status: newStatus }

            if (newStatus === 'delivered') {
                updateData.actual_delivery_date = new Date().toISOString()
            }

            const { error } = await supabase
                .from('b2b_orders')
                .update(updateData)
                .eq('id', order.id)

            if (error) throw error

            fetchOrder()
            fetchHistory()
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const handleAddPayment = async () => {
        if (!order || paymentForm.amount <= 0) return

        try {
            const { error } = await supabase
                .from('b2b_payments')
                .insert({
                    order_id: order.id,
                    customer_id: order.customer_id,
                    amount: paymentForm.amount,
                    payment_method: paymentForm.payment_method,
                    reference_number: paymentForm.reference_number || null,
                    notes: paymentForm.notes || null
                })

            if (error) throw error

            setShowPaymentModal(false)
            setPaymentForm({ amount: 0, payment_method: 'transfer', reference_number: '', notes: '' })
            fetchOrder()
            fetchPayments()
            fetchHistory()
        } catch (error: any) {
            console.error('Error adding payment:', error)
            alert(`Erreur: ${error?.message}`)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: keyof typeof STATUS_CONFIG) => {
        const config = STATUS_CONFIG[status]
        const Icon = config.icon
        return (
            <span className={`b2b-detail-status b2b-detail-status--${config.color}`}>
                <Icon size={16} />
                {config.label}
            </span>
        )
    }

    const getPaymentStatusBadge = (status: string) => {
        const config = {
            unpaid: { label: 'Non payé', color: 'red' },
            partial: { label: 'Partiel', color: 'orange' },
            paid: { label: 'Payé', color: 'green' },
            overdue: { label: 'En retard', color: 'red' }
        }[status] || { label: status, color: 'gray' }

        return (
            <span className={`b2b-payment-status b2b-payment-status--${config.color}`}>
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="b2b-detail-loading">
                <div className="spinner"></div>
                <span>Chargement de la commande...</span>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="b2b-detail-error">
                <AlertCircle size={48} />
                <h3>Commande introuvable</h3>
                <button className="btn btn-primary" onClick={() => navigate('/b2b/orders')}>
                    Retour aux commandes
                </button>
            </div>
        )
    }

    return (
        <div className="b2b-order-detail-page">
            {/* Header */}
            <div className="b2b-detail-header">
                <div className="b2b-detail-header__left">
                    <button className="btn btn-ghost" onClick={() => navigate('/b2b/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="b2b-detail-header__number">
                            <span className="order-number">{order.order_number}</span>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="b2b-detail-header__date">
                            Créée le {formatDate(order.order_date)}
                        </p>
                    </div>
                </div>
                <div className="b2b-detail-header__actions">
                    {order.status === 'draft' && (
                        <button className="btn btn-secondary" onClick={() => navigate(`/b2b/orders/${id}/edit`)}>
                            <Edit2 size={18} />
                            Modifier
                        </button>
                    )}
                    <button className="btn btn-secondary">
                        <Printer size={18} />
                        Imprimer
                    </button>
                    {order.status === 'draft' && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('confirmed')}>
                            <CheckCircle size={18} />
                            Confirmer
                        </button>
                    )}
                    {order.status === 'confirmed' && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('processing')}>
                            <Clock size={18} />
                            En préparation
                        </button>
                    )}
                    {order.status === 'processing' && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('ready')}>
                            <Package size={18} />
                            Prêt
                        </button>
                    )}
                    {(order.status === 'ready' || order.status === 'partially_delivered') && (
                        <button className="btn btn-primary" onClick={() => updateOrderStatus('delivered')}>
                            <Truck size={18} />
                            Livré
                        </button>
                    )}
                </div>
            </div>

            <div className="b2b-detail-content">
                {/* Main Content */}
                <div className="b2b-detail-main">
                    {/* Customer & Delivery Info */}
                    <div className="b2b-detail-cards">
                        <div className="b2b-detail-card">
                            <h3><User size={18} /> Client</h3>
                            <div className="b2b-detail-card__content">
                                <p className="company-name">
                                    {order.customer?.company_name || order.customer?.name}
                                </p>
                                {order.customer?.company_name && (
                                    <p className="contact-name">{order.customer.name}</p>
                                )}
                                {order.customer?.phone && (
                                    <p className="contact-info">
                                        <Phone size={14} /> {order.customer.phone}
                                    </p>
                                )}
                                {order.customer?.email && (
                                    <p className="contact-info">
                                        <Mail size={14} /> {order.customer.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="b2b-detail-card">
                            <h3><Truck size={18} /> Livraison</h3>
                            <div className="b2b-detail-card__content">
                                {order.requested_delivery_date && (
                                    <p className="delivery-date">
                                        <Calendar size={14} />
                                        <span>Demandée: {formatDate(order.requested_delivery_date)}</span>
                                    </p>
                                )}
                                {order.actual_delivery_date && (
                                    <p className="delivery-date delivered">
                                        <CheckCircle size={14} />
                                        <span>Livrée: {formatDate(order.actual_delivery_date)}</span>
                                    </p>
                                )}
                                {order.delivery_address && (
                                    <p className="delivery-address">
                                        <MapPin size={14} />
                                        <span>{order.delivery_address}</span>
                                    </p>
                                )}
                                {order.delivery_notes && (
                                    <p className="delivery-notes">{order.delivery_notes}</p>
                                )}
                            </div>
                        </div>

                        <div className="b2b-detail-card">
                            <h3><CreditCard size={18} /> Paiement</h3>
                            <div className="b2b-detail-card__content">
                                <div className="payment-status-row">
                                    {getPaymentStatusBadge(order.payment_status)}
                                </div>
                                {order.payment_terms && (
                                    <p className="payment-terms">
                                        Conditions: {order.payment_terms === 'cod' ? 'Paiement à la livraison' : `Net ${order.payment_terms.replace('net', '')} jours`}
                                    </p>
                                )}
                                {order.due_date && (
                                    <p className="due-date">
                                        Échéance: {formatDate(order.due_date)}
                                    </p>
                                )}
                                <div className="payment-amounts">
                                    <div className="payment-amount">
                                        <span>Payé</span>
                                        <span className="amount paid">{formatCurrency(order.amount_paid)}</span>
                                    </div>
                                    <div className="payment-amount">
                                        <span>Reste dû</span>
                                        <span className="amount due">{formatCurrency(order.amount_due)}</span>
                                    </div>
                                </div>
                                {order.amount_due > 0 && (
                                    <button
                                        className="btn btn-primary btn-sm btn-block"
                                        onClick={() => {
                                            setPaymentForm({ ...paymentForm, amount: order.amount_due })
                                            setShowPaymentModal(true)
                                        }}
                                    >
                                        <Plus size={16} />
                                        Enregistrer un paiement
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="b2b-detail-tabs">
                        <button
                            className={`b2b-detail-tab ${activeTab === 'items' ? 'active' : ''}`}
                            onClick={() => setActiveTab('items')}
                        >
                            <Package size={16} />
                            Articles ({items.length})
                        </button>
                        <button
                            className={`b2b-detail-tab ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            <CreditCard size={16} />
                            Paiements ({payments.length})
                        </button>
                        <button
                            className={`b2b-detail-tab ${activeTab === 'deliveries' ? 'active' : ''}`}
                            onClick={() => setActiveTab('deliveries')}
                        >
                            <Truck size={16} />
                            Livraisons ({deliveries.length})
                        </button>
                        <button
                            className={`b2b-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <Clock size={16} />
                            Historique
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="b2b-detail-tab-content">
                        {activeTab === 'items' && (
                            <div className="b2b-items-list">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Produit</th>
                                            <th>Qté</th>
                                            <th>Prix Unit.</th>
                                            <th>Remise</th>
                                            <th>Total</th>
                                            <th>Livré</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="item-product">
                                                        <span className="item-name">{item.product_name}</span>
                                                        {item.product_sku && (
                                                            <span className="item-sku">{item.product_sku}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{item.quantity} {item.unit}</td>
                                                <td>{formatCurrency(item.unit_price)}</td>
                                                <td>
                                                    {item.discount_percentage > 0
                                                        ? `${item.discount_percentage}%`
                                                        : '-'
                                                    }
                                                </td>
                                                <td><strong>{formatCurrency(item.line_total)}</strong></td>
                                                <td>
                                                    <span className={`delivery-progress ${item.quantity_delivered >= item.quantity ? 'complete' : ''}`}>
                                                        {item.quantity_delivered}/{item.quantity}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="b2b-payments-list">
                                {payments.length === 0 ? (
                                    <div className="empty-state">
                                        <CreditCard size={32} />
                                        <p>Aucun paiement enregistré</p>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>N° Paiement</th>
                                                <th>Date</th>
                                                <th>Méthode</th>
                                                <th>Référence</th>
                                                <th>Montant</th>
                                                <th>Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map(payment => (
                                                <tr key={payment.id}>
                                                    <td><span className="payment-number">{payment.payment_number}</span></td>
                                                    <td>{formatDate(payment.payment_date)}</td>
                                                    <td>{PAYMENT_METHODS[payment.payment_method as keyof typeof PAYMENT_METHODS] || payment.payment_method}</td>
                                                    <td>{payment.reference_number || '-'}</td>
                                                    <td><strong>{formatCurrency(payment.amount)}</strong></td>
                                                    <td>
                                                        <span className={`payment-badge payment-badge--${payment.status}`}>
                                                            {payment.status === 'completed' ? 'Complété' : payment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'deliveries' && (
                            <div className="b2b-deliveries-list">
                                {deliveries.length === 0 ? (
                                    <div className="empty-state">
                                        <Truck size={32} />
                                        <p>Aucune livraison enregistrée</p>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>N° Livraison</th>
                                                <th>Prévue</th>
                                                <th>Livrée</th>
                                                <th>Chauffeur</th>
                                                <th>Reçu par</th>
                                                <th>Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deliveries.map(delivery => (
                                                <tr key={delivery.id}>
                                                    <td><span className="delivery-number">{delivery.delivery_number}</span></td>
                                                    <td>{formatDate(delivery.scheduled_date)}</td>
                                                    <td>{formatDate(delivery.actual_date)}</td>
                                                    <td>{delivery.driver_name || '-'}</td>
                                                    <td>{delivery.received_by || '-'}</td>
                                                    <td>
                                                        <span className={`delivery-badge delivery-badge--${delivery.status}`}>
                                                            {delivery.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="b2b-history-list">
                                {history.map(entry => (
                                    <div key={entry.id} className="history-entry">
                                        <div className="history-entry__icon">
                                            <Clock size={16} />
                                        </div>
                                        <div className="history-entry__content">
                                            <p className="history-entry__description">{entry.description}</p>
                                            <span className="history-entry__date">{formatDateTime(entry.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Summary */}
                <div className="b2b-detail-sidebar">
                    <div className="b2b-detail-summary">
                        <h3>Résumé</h3>

                        <div className="summary-line">
                            <span>Sous-total</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>

                        {order.discount_amount > 0 && (
                            <div className="summary-line summary-line--discount">
                                <span>Remise {order.discount_type === 'percentage' ? `(${order.discount_value}%)` : ''}</span>
                                <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}

                        <div className="summary-line">
                            <span>TVA ({order.tax_rate}%)</span>
                            <span>{formatCurrency(order.tax_amount)}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Total</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                        </div>

                        {order.notes && (
                            <div className="summary-notes">
                                <h4>Notes</h4>
                                <p>{order.notes}</p>
                            </div>
                        )}

                        {order.internal_notes && (
                            <div className="summary-notes internal">
                                <h4>Notes internes</h4>
                                <p>{order.internal_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2>Enregistrer un paiement</h2>
                            <button className="modal__close" onClick={() => setShowPaymentModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal__body">
                            <div className="form-group">
                                <label>Montant *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Méthode de paiement *</label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                                >
                                    <option value="transfer">Virement</option>
                                    <option value="cash">Espèces</option>
                                    <option value="check">Chèque</option>
                                    <option value="card">Carte</option>
                                    <option value="qris">QRIS</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Référence (optionnel)</label>
                                <input
                                    type="text"
                                    value={paymentForm.reference_number}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                                    placeholder="N° de transaction, chèque..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    rows={2}
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                                Annuler
                            </button>
                            <button className="btn btn-primary" onClick={handleAddPayment}>
                                <CreditCard size={18} />
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
