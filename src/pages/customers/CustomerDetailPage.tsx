import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Edit, User, Phone, Mail, MapPin,
    QrCode, Star, Crown, TrendingUp, ShoppingBag, Calendar,
    Gift, Plus, Minus, Clock, CreditCard, FileText, History
} from 'lucide-react'
import {
    useCustomerById,
    useCustomerOrders,
    useLoyaltyTransactions,
    useLoyaltyTiers,
    useAddLoyaltyPoints,
    useRedeemLoyaltyPoints,
} from '@/hooks/customers'
import { formatCurrency } from '../../utils/helpers'
import { toast } from 'sonner'
import './CustomerDetailPage.css'

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
    const { data: customer, isLoading } = useCustomerById(id)
    const { data: orders = [] } = useCustomerOrders(id)
    const { data: loyaltyTransactions = [] } = useLoyaltyTransactions(id)
    const { data: tiers = [] } = useLoyaltyTiers()
    const addPointsMutation = useAddLoyaltyPoints()
    const redeemPointsMutation = useRedeemLoyaltyPoints()

    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [showPointsModal, setShowPointsModal] = useState(false)
    const [pointsAction, setPointsAction] = useState<'add' | 'redeem'>('add')
    const [pointsAmount, setPointsAmount] = useState('')
    const [pointsDescription, setPointsDescription] = useState('')

    useEffect(() => {
        if (!isLoading && !customer && id) {
            toast.error('Customer not found')
            navigate('/customers')
        }
    }, [isLoading, customer, id, navigate])

    const handlePointsSubmit = async () => {
        if (!pointsAmount || Number(pointsAmount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        const points = Number(pointsAmount)

        if (pointsAction === 'add') {
            await addPointsMutation.mutateAsync({
                customerId: id!,
                points,
                description: pointsDescription || 'Manual points addition',
            })
        } else {
            if (customer && points > customer.loyalty_points) {
                toast.error('Insufficient points')
                return
            }
            await redeemPointsMutation.mutateAsync({
                customerId: id!,
                points,
                description: pointsDescription || 'Manual points redemption',
            })
        }

        setShowPointsModal(false)
        setPointsAmount('')
        setPointsDescription('')
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pending',
            preparing: 'Preparing',
            ready: 'Ready',
            completed: 'Completed',
            cancelled: 'Cancelled'
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

    if (isLoading) {
        return (
            <div className="customer-detail-page">
                <div className="customer-detail-loading">
                    <div className="spinner"></div>
                    <span>Loading...</span>
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
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/customers/${id}/edit`)}
                >
                    <Edit size={18} />
                    Edit
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
                        <span className="points-label">Available points</span>
                    </div>
                    <div className="points-lifetime">
                        <span className="points-value">{customer.lifetime_points.toLocaleString()}</span>
                        <span className="points-label">Lifetime points</span>
                    </div>
                </div>
                {nextTier && (
                    <div className="loyalty-card__progress">
                        <div className="progress-info">
                            <span>Next tier: {nextTier.name}</span>
                            <span>{nextTier.min_points - customer.lifetime_points} pts remaining</span>
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
                        Add points
                    </button>
                    <button
                        className="btn btn-loyalty"
                        onClick={() => { setPointsAction('redeem'); setShowPointsModal(true) }}
                        disabled={customer.loyalty_points <= 0}
                    >
                        <Gift size={16} />
                        Redeem points
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="customer-stats">
                <div className="customer-stat">
                    <ShoppingBag size={24} />
                    <div>
                        <span className="stat-value">{customer.total_visits}</span>
                        <span className="stat-label">Visits</span>
                    </div>
                </div>
                <div className="customer-stat">
                    <TrendingUp size={24} />
                    <div>
                        <span className="stat-value stat-value--sm">{formatCurrency(customer.total_spent)}</span>
                        <span className="stat-label">Total spent</span>
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
                        <span className="stat-label">Average basket</span>
                    </div>
                </div>
                <div className="customer-stat">
                    <Calendar size={24} />
                    <div>
                        <span className="stat-value stat-value--date">{formatDate(customer.last_visit_at)}</span>
                        <span className="stat-label">Last visit</span>
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
                    Info
                </button>
                <button
                    className={`customer-tab ${activeTab === 'loyalty' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loyalty')}
                >
                    <Star size={16} />
                    Loyalty ({loyaltyTransactions.length})
                </button>
                <button
                    className={`customer-tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} />
                    Orders ({orders.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="customer-tab-content">
                {activeTab === 'overview' && (
                    <div className="customer-overview">
                        <div className="info-section">
                            <h3>Contact Information</h3>
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
                                        <span>Birthday: {formatDate(customer.date_of_birth)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="info-section">
                            <h3>Member since</h3>
                            <p className="member-since">
                                <Clock size={16} />
                                {formatDate(customer.created_at)}
                            </p>
                        </div>
                        {customer.category && (
                            <div className="info-section">
                                <h3>Pricing</h3>
                                <div className="pricing-info">
                                    <span
                                        className="pricing-badge"
                                        style={{ backgroundColor: customer.category.color }}
                                    >
                                        {customer.category.name}
                                    </span>
                                    <span className="pricing-type">
                                        {customer.category.price_modifier_type === 'retail' && 'Standard price'}
                                        {customer.category.price_modifier_type === 'wholesale' && 'Wholesale price'}
                                        {customer.category.price_modifier_type === 'discount_percentage' &&
                                            `${customer.category.discount_percentage}% discount`}
                                        {customer.category.price_modifier_type === 'custom' && 'Custom price'}
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
                                <h3>No loyalty transactions</h3>
                                <p>Points transactions will appear here</p>
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
                                                {tx.description || (tx.transaction_type === 'earn' ? 'Points earned' : 'Points redeemed')}
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
                                <h3>No orders</h3>
                                <p>Customer orders will appear here</p>
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
                                <><Plus size={20} /> Add Points</>
                            ) : (
                                <><Gift size={20} /> Redeem Points</>
                            )}
                        </h2>
                        {pointsAction === 'redeem' && (
                            <p className="points-available">
                                Available points: <strong>{customer.loyalty_points.toLocaleString()}</strong>
                            </p>
                        )}
                        <div className="form-group">
                            <label>Number of points</label>
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
                            <label>Description (optional)</label>
                            <input
                                type="text"
                                value={pointsDescription}
                                onChange={(e) => setPointsDescription(e.target.value)}
                                placeholder="Reason for adjustment"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPointsModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handlePointsSubmit}
                            >
                                {pointsAction === 'add' ? 'Add' : 'Redeem'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
