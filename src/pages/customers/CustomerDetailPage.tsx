import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Edit, User, Phone, Mail, MapPin,
    QrCode, Star, Crown, TrendingUp, ShoppingBag, Calendar,
    Gift, Plus, Minus, Clock, CreditCard, FileText, History
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './CustomerDetailPage.css'

interface Customer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    address: string | null
    customer_type: string
    category_id: string | null
    category?: {
        id: string
        name: string
        slug: string
        color: string
        price_modifier_type: string
        discount_percentage: number | null
    }
    loyalty_points: number
    lifetime_points: number
    loyalty_tier: string
    total_spent: number
    total_visits: number
    is_active: boolean
    membership_number: string | null
    loyalty_qr_code: string | null
    date_of_birth: string | null
    created_at: string
    last_visit_at: string | null
}

interface LoyaltyTransaction {
    id: string
    transaction_type: string
    points: number
    description: string | null
    created_at: string
}

interface Order {
    id: string
    order_number: string
    total_amount: number
    status: string
    created_at: string
}

interface LoyaltyTier {
    id: string
    name: string
    min_points: number
    max_points: number | null
    benefits: string | null
    color: string
}

type TabType = 'overview' | 'history' | 'loyalty' | 'orders'

const TIER_CONFIG: Record<string, { color: string; gradient: string }> = {
    bronze: { color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32 0%, #a66829 100%)' },
    silver: { color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0 0%, #8e8e8e 100%)' },
    gold: { color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700 0%, #d4a800 100%)' },
    platinum: { color: '#e5e4e2', gradient: 'linear-gradient(135deg, #e5e4e2 0%, #b8b8b8 100%)' }
}

export default function CustomerDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [tiers, setTiers] = useState<LoyaltyTier[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [showPointsModal, setShowPointsModal] = useState(false)
    const [pointsAction, setPointsAction] = useState<'add' | 'redeem'>('add')
    const [pointsAmount, setPointsAmount] = useState('')
    const [pointsDescription, setPointsDescription] = useState('')

    useEffect(() => {
        if (id) {
            fetchCustomer()
            fetchLoyaltyTransactions()
            fetchOrders()
            fetchTiers()
        }
    }, [id])

    const fetchCustomer = async () => {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(id, name, slug, color, price_modifier_type, discount_percentage)
                `)
                .eq('id', id as string)
                .single()

            if (error) throw error
            setCustomer(data as unknown as Customer)
        } catch (error) {
            console.error('Error fetching customer:', error)
            toast.error('Client non trouvé')
            navigate('/customers')
        } finally {
            setLoading(false)
        }
    }

    const fetchLoyaltyTransactions = async () => {
        const { data } = await supabase
            .from('loyalty_transactions')
            .select('*')
            .eq('customer_id', id as string)
            .order('created_at', { ascending: false })
            .limit(50)
        if (data) setLoyaltyTransactions(data as LoyaltyTransaction[])
    }

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('id, order_number, total, status, created_at')
            .eq('customer_id', id as string)
            .order('created_at', { ascending: false })
            .limit(20)
        if (data) setOrders(data.map(d => ({
            id: d.id,
            order_number: d.order_number ?? '',
            total_amount: d.total ?? 0,
            status: d.status ?? '',
            created_at: d.created_at ?? ''
        })) as Order[])
    }

    const fetchTiers = async () => {
        const { data } = await supabase
            .from('loyalty_tiers')
            .select('*')
            .eq('is_active', true)
            .order('min_points')
        if (data) setTiers(data as unknown as LoyaltyTier[])
    }

    const handlePointsSubmit = async () => {
        if (!pointsAmount || Number(pointsAmount) <= 0) {
            toast.error('Veuillez entrer un montant valide')
            return
        }

        try {
            const points = Number(pointsAmount)

            if (pointsAction === 'add') {
                // Add points
                const { error } = await supabase.rpc('add_loyalty_points' as never, {
                    p_customer_id: id,
                    p_points: points,
                    p_description: pointsDescription || 'Ajout manuel de points',
                    p_order_id: null
                } as never)
                if (error) throw error
                toast.success(`${points} points ajoutés`)
            } else {
                // Redeem points
                if (customer && points > customer.loyalty_points) {
                    toast.error('Points insuffisants')
                    return
                }
                const { error } = await supabase.rpc('redeem_loyalty_points' as never, {
                    p_customer_id: id,
                    p_points: points,
                    p_description: pointsDescription || 'Échange manuel de points'
                } as never)
                if (error) throw error
                toast.success(`${points} points utilisés`)
            }

            setShowPointsModal(false)
            setPointsAmount('')
            setPointsDescription('')
            fetchCustomer()
            fetchLoyaltyTransactions()
        } catch (error) {
            console.error('Error updating points:', error)
            toast.error('Erreur lors de la mise à jour des points')
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
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'En attente',
            preparing: 'En préparation',
            ready: 'Prête',
            completed: 'Complétée',
            cancelled: 'Annulée'
        }
        return labels[status] || status
    }

    const getNextTier = () => {
        if (!customer) return null
        const currentTierIndex = tiers.findIndex(t => t.name.toLowerCase() === customer.loyalty_tier)
        if (currentTierIndex < tiers.length - 1) {
            return tiers[currentTierIndex + 1]
        }
        return null
    }

    const getProgressToNextTier = () => {
        if (!customer) return 0
        const nextTier = getNextTier()
        if (!nextTier) return 100
        const currentTier = tiers.find(t => t.name.toLowerCase() === customer.loyalty_tier)
        const minPoints = currentTier?.min_points || 0
        const maxPoints = nextTier.min_points
        const progress = ((customer.lifetime_points - minPoints) / (maxPoints - minPoints)) * 100
        return Math.min(Math.max(progress, 0), 100)
    }

    if (loading) {
        return (
            <div className="customer-detail-page">
                <div className="customer-detail-loading">
                    <div className="spinner"></div>
                    <span>Chargement...</span>
                </div>
            </div>
        )
    }

    if (!customer) return null

    const tierConfig = TIER_CONFIG[customer.loyalty_tier] || TIER_CONFIG.bronze
    const nextTier = getNextTier()

    return (
        <div className="customer-detail-page">
            {/* Header */}
            <header className="customer-detail-header">
                <div className="customer-detail-header__left">
                    <button className="btn btn-ghost" onClick={() => navigate('/customers')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div
                        className="customer-detail-avatar"
                        style={{ background: tierConfig.gradient }}
                    >
                        {customer.company_name?.[0] || customer.name[0]}
                    </div>
                    <div className="customer-detail-header__info">
                        <h1>{customer.company_name || customer.name}</h1>
                        {customer.company_name && (
                            <span className="customer-contact-name">{customer.name}</span>
                        )}
                        <div className="customer-badges">
                            {customer.category && (
                                <span
                                    className="category-badge"
                                    style={{ backgroundColor: customer.category.color }}
                                >
                                    {customer.category.name}
                                </span>
                            )}
                            <span
                                className="tier-badge"
                                style={{ background: tierConfig.gradient }}
                            >
                                <Crown size={12} />
                                {customer.loyalty_tier}
                            </span>
                            <span className={`status-badge ${customer.is_active ? 'active' : 'inactive'}`}>
                                {customer.is_active ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/customers/${id}/edit`)}
                >
                    <Edit size={18} />
                    Modifier
                </button>
            </header>

            {/* Loyalty Card */}
            <div className="loyalty-card" style={{ background: tierConfig.gradient }}>
                <div className="loyalty-card__header">
                    <div className="loyalty-card__tier">
                        <Crown size={24} />
                        <span>{customer.loyalty_tier.toUpperCase()}</span>
                    </div>
                    {customer.membership_number && (
                        <div className="loyalty-card__member">
                            <QrCode size={16} />
                            {customer.membership_number}
                        </div>
                    )}
                </div>
                <div className="loyalty-card__points">
                    <div className="points-current">
                        <span className="points-value">{customer.loyalty_points.toLocaleString()}</span>
                        <span className="points-label">Points disponibles</span>
                    </div>
                    <div className="points-lifetime">
                        <span className="points-value">{customer.lifetime_points.toLocaleString()}</span>
                        <span className="points-label">Points cumulés</span>
                    </div>
                </div>
                {nextTier && (
                    <div className="loyalty-card__progress">
                        <div className="progress-info">
                            <span>Prochain niveau: {nextTier.name}</span>
                            <span>{nextTier.min_points - customer.lifetime_points} pts restants</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar__fill"
                                style={{ width: `${getProgressToNextTier()}%` }}
                            />
                        </div>
                    </div>
                )}
                <div className="loyalty-card__actions">
                    <button
                        className="btn btn-loyalty"
                        onClick={() => { setPointsAction('add'); setShowPointsModal(true) }}
                    >
                        <Plus size={16} />
                        Ajouter points
                    </button>
                    <button
                        className="btn btn-loyalty"
                        onClick={() => { setPointsAction('redeem'); setShowPointsModal(true) }}
                        disabled={customer.loyalty_points <= 0}
                    >
                        <Gift size={16} />
                        Utiliser points
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="customer-stats">
                <div className="customer-stat">
                    <ShoppingBag size={24} />
                    <div>
                        <span className="stat-value">{customer.total_visits}</span>
                        <span className="stat-label">Visites</span>
                    </div>
                </div>
                <div className="customer-stat">
                    <TrendingUp size={24} />
                    <div>
                        <span className="stat-value stat-value--sm">{formatCurrency(customer.total_spent)}</span>
                        <span className="stat-label">Total dépensé</span>
                    </div>
                </div>
                <div className="customer-stat">
                    <CreditCard size={24} />
                    <div>
                        <span className="stat-value stat-value--sm">
                            {customer.total_visits > 0
                                ? formatCurrency(customer.total_spent / customer.total_visits)
                                : formatCurrency(0)}
                        </span>
                        <span className="stat-label">Panier moyen</span>
                    </div>
                </div>
                <div className="customer-stat">
                    <Calendar size={24} />
                    <div>
                        <span className="stat-value stat-value--date">{formatDate(customer.last_visit_at)}</span>
                        <span className="stat-label">Dernière visite</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="customer-tabs">
                <button
                    className={`customer-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <User size={16} />
                    Infos
                </button>
                <button
                    className={`customer-tab ${activeTab === 'loyalty' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loyalty')}
                >
                    <Star size={16} />
                    Fidélité ({loyaltyTransactions.length})
                </button>
                <button
                    className={`customer-tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} />
                    Commandes ({orders.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="customer-tab-content">
                {activeTab === 'overview' && (
                    <div className="customer-overview">
                        <div className="info-section">
                            <h3>Coordonnées</h3>
                            <div className="info-grid">
                                {customer.phone && (
                                    <div className="info-item">
                                        <Phone size={16} />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="info-item">
                                        <Mail size={16} />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="info-item info-item--full">
                                        <MapPin size={16} />
                                        <span>{customer.address}</span>
                                    </div>
                                )}
                                {customer.date_of_birth && (
                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <span>Anniversaire: {formatDate(customer.date_of_birth)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="info-section">
                            <h3>Membre depuis</h3>
                            <p className="member-since">
                                <Clock size={16} />
                                {formatDate(customer.created_at)}
                            </p>
                        </div>
                        {customer.category && (
                            <div className="info-section">
                                <h3>Tarification</h3>
                                <div className="pricing-info">
                                    <span
                                        className="pricing-badge"
                                        style={{ backgroundColor: customer.category.color }}
                                    >
                                        {customer.category.name}
                                    </span>
                                    <span className="pricing-type">
                                        {customer.category.price_modifier_type === 'retail' && 'Prix standard'}
                                        {customer.category.price_modifier_type === 'wholesale' && 'Prix de gros'}
                                        {customer.category.price_modifier_type === 'discount_percentage' &&
                                            `${customer.category.discount_percentage}% de réduction`}
                                        {customer.category.price_modifier_type === 'custom' && 'Prix personnalisé'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'loyalty' && (
                    <div className="loyalty-history">
                        {loyaltyTransactions.length === 0 ? (
                            <div className="empty-state">
                                <Star size={48} />
                                <h3>Aucune transaction fidélité</h3>
                                <p>Les transactions de points apparaîtront ici</p>
                            </div>
                        ) : (
                            <div className="transactions-list">
                                {loyaltyTransactions.map(tx => (
                                    <div key={tx.id} className="transaction-item">
                                        <div className={`transaction-icon ${tx.transaction_type}`}>
                                            {tx.transaction_type === 'earn' ? <Plus size={16} /> :
                                                tx.transaction_type === 'redeem' ? <Minus size={16} /> :
                                                    <History size={16} />}
                                        </div>
                                        <div className="transaction-info">
                                            <span className="transaction-desc">
                                                {tx.description || (tx.transaction_type === 'earn' ? 'Points gagnés' : 'Points utilisés')}
                                            </span>
                                            <span className="transaction-date">{formatDateTime(tx.created_at)}</span>
                                        </div>
                                        <span className={`transaction-points ${tx.transaction_type}`}>
                                            {tx.transaction_type === 'earn' ? '+' : '-'}{tx.points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="orders-history">
                        {orders.length === 0 ? (
                            <div className="empty-state">
                                <FileText size={48} />
                                <h3>Aucune commande</h3>
                                <p>Les commandes du client apparaîtront ici</p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map(order => (
                                    <div key={order.id} className="order-item">
                                        <div className="order-info">
                                            <span className="order-number">{order.order_number}</span>
                                            <span className="order-date">{formatDateTime(order.created_at)}</span>
                                        </div>
                                        <span className={`order-status ${order.status}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <span className="order-amount">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Points Modal */}
            {showPointsModal && (
                <div className="modal-overlay" onClick={() => setShowPointsModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>
                            {pointsAction === 'add' ? (
                                <><Plus size={20} /> Ajouter des points</>
                            ) : (
                                <><Gift size={20} /> Utiliser des points</>
                            )}
                        </h2>
                        {pointsAction === 'redeem' && (
                            <p className="points-available">
                                Points disponibles: <strong>{customer.loyalty_points.toLocaleString()}</strong>
                            </p>
                        )}
                        <div className="form-group">
                            <label>Nombre de points</label>
                            <input
                                type="number"
                                value={pointsAmount}
                                onChange={(e) => setPointsAmount(e.target.value)}
                                placeholder="Ex: 100"
                                min="1"
                                max={pointsAction === 'redeem' ? customer.loyalty_points : undefined}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description (optionnel)</label>
                            <input
                                type="text"
                                value={pointsDescription}
                                onChange={(e) => setPointsDescription(e.target.value)}
                                placeholder="Raison de l'ajustement"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPointsModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handlePointsSubmit}
                            >
                                {pointsAction === 'add' ? 'Ajouter' : 'Utiliser'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
