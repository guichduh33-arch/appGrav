import { useState, useEffect } from 'react'
import { Plus, Search, FileText, DollarSign, Package, Trash2, Eye, Edit2, Check, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/helpers'
import './PurchaseOrdersPage.css'

interface PurchaseOrder {
    id: string
    po_number: string
    supplier_id: string
    supplier?: {
        name: string
    }
    status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled' | 'modified'
    order_date: string
    expected_delivery_date: string | null
    actual_delivery_date: string | null
    subtotal: number
    discount_amount: number
    tax_amount: number
    total_amount: number
    payment_status: 'unpaid' | 'partially_paid' | 'paid'
    payment_date: string | null
    notes: string | null
    created_at: string
}

const STATUS_LABELS = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    confirmed: 'Confirmé',
    partially_received: 'Partiellement Reçu',
    received: 'Reçu',
    cancelled: 'Annulé',
    modified: 'Modifié'
}

const PAYMENT_STATUS_LABELS = {
    unpaid: 'Non Payé',
    partially_paid: 'Partiellement Payé',
    paid: 'Payé'
}

export default function PurchaseOrdersPage() {
    const navigate = useNavigate()
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')

    useEffect(() => {
        fetchPurchaseOrders()
    }, [])

    const fetchPurchaseOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
                    *,
                    supplier:suppliers(name)
                `)
                .order('order_date', { ascending: false })

            if (error) throw error
            if (data) {
                setPurchaseOrders(data as PurchaseOrder[])
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) {
            return
        }

        try {
            const { error } = await supabase
                .from('purchase_orders')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchPurchaseOrders()
        } catch (error) {
            console.error('Error deleting purchase order:', error)
            alert('Erreur lors de la suppression du bon de commande')
        }
    }

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const updateData: any = { status }

            if (status === 'received') {
                updateData.actual_delivery_date = new Date().toISOString()
            }

            const { error } = await supabase
                .from('purchase_orders')
                .update(updateData)
                .eq('id', id)

            if (error) throw error
            await fetchPurchaseOrders()
        } catch (error) {
            console.error('Error updating purchase order status:', error)
        }
    }

    const filteredOrders = purchaseOrders.filter(po => {
        const matchesSearch =
            po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || po.status === statusFilter
        const matchesPayment = paymentFilter === 'all' || po.payment_status === paymentFilter

        return matchesSearch && matchesStatus && matchesPayment
    })

    const stats = {
        total: purchaseOrders.length,
        draft: purchaseOrders.filter(po => po.status === 'draft').length,
        pending: purchaseOrders.filter(po => ['sent', 'confirmed', 'partially_received'].includes(po.status)).length,
        completed: purchaseOrders.filter(po => po.status === 'received').length,
        totalValue: purchaseOrders.reduce((sum, po) => sum + (parseFloat(po.total_amount?.toString() ?? '0') || 0), 0)
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'draft': return 'status-badge--gray'
            case 'sent': return 'status-badge--blue'
            case 'confirmed': return 'status-badge--yellow'
            case 'partially_received': return 'status-badge--orange'
            case 'received': return 'status-badge--success'
            case 'cancelled': return 'status-badge--danger'
            case 'modified': return 'status-badge--purple'
            default: return 'status-badge--gray'
        }
    }

    const getPaymentBadgeClass = (status: string) => {
        switch (status) {
            case 'paid': return 'status-badge--success'
            case 'partially_paid': return 'status-badge--orange'
            case 'unpaid': return 'status-badge--danger'
            default: return 'status-badge--gray'
        }
    }

    return (
        <div className="purchase-orders-page">
            {/* Header */}
            <div className="purchase-orders-page__header">
                <div>
                    <h1 className="purchase-orders-page__title">
                        <FileText size={32} />
                        Bons de Commande
                    </h1>
                    <p className="purchase-orders-page__subtitle">
                        Gérez vos commandes fournisseurs et suivez leur statut
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/purchasing/purchase-orders/new')}
                >
                    <Plus size={20} />
                    Nouveau Bon de Commande
                </button>
            </div>

            {/* Stats */}
            <div className="purchase-orders-stats">
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--primary">
                        <FileText size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.total}</div>
                        <div className="purchase-orders-stat__label">Total Commandes</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--warning">
                        <Clock size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.pending}</div>
                        <div className="purchase-orders-stat__label">En Attente</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--success">
                        <Check size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{stats.completed}</div>
                        <div className="purchase-orders-stat__label">Complétées</div>
                    </div>
                </div>
                <div className="purchase-orders-stat">
                    <div className="purchase-orders-stat__icon purchase-orders-stat__icon--info">
                        <DollarSign size={24} />
                    </div>
                    <div className="purchase-orders-stat__content">
                        <div className="purchase-orders-stat__value">{formatCurrency(stats.totalValue)}</div>
                        <div className="purchase-orders-stat__label">Valeur Totale</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="purchase-orders-filters">
                <div className="purchase-orders-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un bon de commande..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="purchase-orders-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="sent">Envoyé</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="partially_received">Partiellement Reçu</option>
                    <option value="received">Reçu</option>
                    <option value="cancelled">Annulé</option>
                </select>
                <select
                    className="purchase-orders-filter"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <option value="all">Tous les paiements</option>
                    <option value="unpaid">Non Payé</option>
                    <option value="partially_paid">Partiellement Payé</option>
                    <option value="paid">Payé</option>
                </select>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="purchase-orders-loading">Chargement...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="purchase-orders-empty">
                    <FileText size={48} />
                    <h3>Aucun bon de commande</h3>
                    <p>Commencez par créer votre premier bon de commande</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/purchasing/purchase-orders/new')}
                    >
                        <Plus size={20} />
                        Nouveau Bon de Commande
                    </button>
                </div>
            ) : (
                <div className="purchase-orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>N° BC</th>
                                <th>Fournisseur</th>
                                <th>Date</th>
                                <th>Livraison Prévue</th>
                                <th>Statut</th>
                                <th>Paiement</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(po => (
                                <tr key={po.id}>
                                    <td>
                                        <strong>{po.po_number}</strong>
                                    </td>
                                    <td>{po.supplier?.name || '-'}</td>
                                    <td>{new Date(po.order_date).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        {po.expected_delivery_date
                                            ? new Date(po.expected_delivery_date).toLocaleDateString('fr-FR')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(po.status)}`}>
                                            {STATUS_LABELS[po.status]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getPaymentBadgeClass(po.payment_status)}`}>
                                            {PAYMENT_STATUS_LABELS[po.payment_status]}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{formatCurrency(parseFloat(po.total_amount?.toString() ?? '0') || 0)}</strong>
                                    </td>
                                    <td>
                                        <div className="purchase-orders-table__actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => navigate(`/purchasing/purchase-orders/${po.id}`)}
                                                title="Voir"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => navigate(`/purchasing/purchase-orders/${po.id}/edit`)}
                                                title="Modifier"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {po.status === 'sent' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateStatus(po.id, 'confirmed')}
                                                    title="Confirmer"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {po.status === 'confirmed' && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleUpdateStatus(po.id, 'received')}
                                                    title="Marquer comme reçu"
                                                >
                                                    <Package size={18} />
                                                </button>
                                            )}
                                            {po.status === 'draft' && (
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => handleDelete(po.id)}
                                                    title="Supprimer"
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
