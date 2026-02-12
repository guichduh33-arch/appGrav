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
import { cn } from '@/lib/utils'

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
            <div className="p-6 max-w-[1200px] mx-auto max-md:p-4">
                <div className="flex flex-col items-center justify-center py-16 px-8 text-muted-foreground gap-4">
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
        <div className="p-6 max-w-[1200px] mx-auto max-md:p-4">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 gap-4 max-md:flex-col max-md:items-start">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost" onClick={() => navigate('/customers')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div
                        className="w-14 h-14 rounded-[14px] flex items-center justify-center text-white text-2xl font-bold shrink-0"
                        style={{ background: tierConfig.gradient }}
                    >
                        {customer.company_name?.[0] || customer.name[0]}
                    </div>
                    <div>
                        <h1 className="m-0 text-2xl font-bold text-foreground">{customer.company_name || customer.name}</h1>
                        {customer.company_name && (
                            <span className="block text-sm text-muted-foreground mb-1.5">{customer.name}</span>
                        )}
                        <div className="flex gap-2 flex-wrap mt-1.5">
                            {customer.category && (
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[0.7rem] font-medium text-white capitalize"
                                    style={{ backgroundColor: customer.category.color }}
                                >
                                    {customer.category.name}
                                </span>
                            )}
                            <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[0.7rem] font-medium text-white capitalize"
                                style={{ background: tierConfig.gradient }}
                            >
                                <Crown size={12} />
                                {customer.loyalty_tier}
                            </span>
                            <span className={cn(
                                'px-2 py-1 rounded text-[0.7rem] font-medium',
                                customer.is_active ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-600'
                            )}>
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-primary max-md:w-full"
                    onClick={() => navigate(`/customers/${id}/edit`)}
                >
                    <Edit size={18} />
                    Edit
                </button>
            </header>

            {/* Loyalty Card */}
            <div
                className="rounded-2xl p-6 text-white mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
                style={{ background: tierConfig.gradient }}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
                        <Crown size={24} />
                        <span>{customer.loyalty_tier.toUpperCase()}</span>
                    </div>
                    {customer.membership_number && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-md text-sm font-mono">
                            <QrCode size={16} />
                            {customer.membership_number}
                        </div>
                    )}
                </div>
                <div className="flex gap-12 mb-6 max-md:flex-col max-md:gap-4">
                    <div className="flex flex-col">
                        <span className="text-[2rem] font-extrabold leading-none">{customer.loyalty_points.toLocaleString()}</span>
                        <span className="text-sm opacity-90 mt-1">Available points</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[2rem] font-extrabold leading-none">{customer.lifetime_points.toLocaleString()}</span>
                        <span className="text-sm opacity-90 mt-1">Lifetime points</span>
                    </div>
                </div>
                {nextTier && (
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2 opacity-90">
                            <span>Next tier: {nextTier.name}</span>
                            <span>{nextTier.min_points - customer.lifetime_points} pts remaining</span>
                        </div>
                        <div className="h-2 bg-white/30 rounded overflow-hidden">
                            <div
                                className="h-full bg-white rounded transition-[width] duration-300 ease-out"
                                style={{ width: `${getProgressToNextTier()}%` }}
                            />
                        </div>
                    </div>
                )}
                <div className="flex gap-3 max-md:flex-col">
                    <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => { setPointsAction('add'); setShowPointsModal(true) }}
                    >
                        <Plus size={16} />
                        Add points
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => { setPointsAction('redeem'); setShowPointsModal(true) }}
                        disabled={customer.loyalty_points <= 0}
                    >
                        <Gift size={16} />
                        Redeem points
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2 max-md:grid-cols-1">
                <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 [&>svg]:text-primary">
                    <ShoppingBag size={24} />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-foreground">{customer.total_visits}</span>
                        <span className="text-xs text-muted-foreground">Visits</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 [&>svg]:text-primary">
                    <TrendingUp size={24} />
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-foreground">{formatCurrency(customer.total_spent)}</span>
                        <span className="text-xs text-muted-foreground">Total spent</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 [&>svg]:text-primary">
                    <CreditCard size={24} />
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-foreground">
                            {customer.total_visits > 0
                                ? formatCurrency(customer.total_spent / customer.total_visits)
                                : formatCurrency(0)}
                        </span>
                        <span className="text-xs text-muted-foreground">Average basket</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 [&>svg]:text-primary">
                    <Calendar size={24} />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{formatDate(customer.last_visit_at)}</span>
                        <span className="text-xs text-muted-foreground">Last visit</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-[10px] mb-6 max-md:flex-wrap">
                <button
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-3 px-4 border-none bg-transparent rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:text-slate-600',
                        activeTab === 'overview' && 'bg-white text-primary shadow-sm',
                        'max-md:flex-[0_0_calc(50%-0.25rem)]'
                    )}
                    onClick={() => setActiveTab('overview')}
                >
                    <User size={16} />
                    Info
                </button>
                <button
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-3 px-4 border-none bg-transparent rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:text-slate-600',
                        activeTab === 'loyalty' && 'bg-white text-primary shadow-sm',
                        'max-md:flex-[0_0_calc(50%-0.25rem)]'
                    )}
                    onClick={() => setActiveTab('loyalty')}
                >
                    <Star size={16} />
                    Loyalty ({loyaltyTransactions.length})
                </button>
                <button
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-3 px-4 border-none bg-transparent rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:text-slate-600',
                        activeTab === 'orders' && 'bg-white text-primary shadow-sm',
                        'max-md:flex-[0_0_calc(50%-0.25rem)]'
                    )}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} />
                    Orders ({orders.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-border p-6 min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Contact Information</h3>
                            <div className="flex flex-col gap-3">
                                {customer.phone && (
                                    <div className="flex items-center gap-3 text-foreground text-sm [&>svg]:text-slate-400 [&>svg]:shrink-0">
                                        <Phone size={16} />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex items-center gap-3 text-foreground text-sm [&>svg]:text-slate-400 [&>svg]:shrink-0">
                                        <Mail size={16} />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-3 text-foreground text-sm [&>svg]:text-slate-400 [&>svg]:shrink-0">
                                        <MapPin size={16} />
                                        <span>{customer.address}</span>
                                    </div>
                                )}
                                {customer.date_of_birth && (
                                    <div className="flex items-center gap-3 text-foreground text-sm [&>svg]:text-slate-400 [&>svg]:shrink-0">
                                        <Calendar size={16} />
                                        <span>Birthday: {formatDate(customer.date_of_birth)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Member since</h3>
                            <p className="flex items-center gap-2 m-0 text-slate-600 text-sm [&>svg]:text-slate-400">
                                <Clock size={16} />
                                {formatDate(customer.created_at)}
                            </p>
                        </div>
                        {customer.category && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Pricing</h3>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
                                        style={{ backgroundColor: customer.category.color }}
                                    >
                                        {customer.category.name}
                                    </span>
                                    <span className="text-slate-600 text-sm">
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
                    <div>
                        {loyaltyTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-8 text-center [&>svg]:text-slate-300 [&>svg]:mb-4">
                                <Star size={48} />
                                <h3 className="m-0 mb-2 text-slate-600 text-base">No loyalty transactions</h3>
                                <p className="m-0 text-slate-400 text-sm">Points transactions will appear here</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {loyaltyTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center gap-4 py-3.5 px-4 bg-slate-50 rounded-lg">
                                        <div className={cn(
                                            'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                                            tx.transaction_type === 'earn' && 'bg-green-100 text-green-600',
                                            tx.transaction_type === 'redeem' && 'bg-amber-100 text-amber-600',
                                            (tx.transaction_type === 'adjust' || tx.transaction_type === 'expire') && 'bg-slate-100 text-muted-foreground'
                                        )}>
                                            {tx.transaction_type === 'earn' ? <Plus size={16} /> :
                                                tx.transaction_type === 'redeem' ? <Minus size={16} /> :
                                                    <History size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-sm text-foreground font-medium">
                                                {tx.description || (tx.transaction_type === 'earn' ? 'Points earned' : 'Points redeemed')}
                                            </span>
                                            <span className="block text-xs text-slate-400 mt-0.5">{formatDateTime(tx.created_at)}</span>
                                        </div>
                                        <span className={cn(
                                            'text-base font-bold',
                                            tx.transaction_type === 'earn' && 'text-green-600',
                                            tx.transaction_type === 'redeem' && 'text-amber-600'
                                        )}>
                                            {tx.transaction_type === 'earn' ? '+' : '-'}{tx.points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-8 text-center [&>svg]:text-slate-300 [&>svg]:mb-4">
                                <FileText size={48} />
                                <h3 className="m-0 mb-2 text-slate-600 text-base">No orders</h3>
                                <p className="m-0 text-slate-400 text-sm">Customer orders will appear here</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {orders.map(order => (
                                    <div key={order.id} className="flex items-center gap-4 py-3.5 px-4 bg-slate-50 rounded-lg">
                                        <div className="flex-1">
                                            <span className="block text-sm font-semibold text-foreground">{order.order_number}</span>
                                            <span className="block text-xs text-slate-400 mt-0.5">{formatDateTime(order.created_at)}</span>
                                        </div>
                                        <span className={cn(
                                            'px-2 py-1 rounded text-xs font-medium',
                                            order.status === 'completed' && 'bg-green-100 text-green-600',
                                            (order.status === 'pending' || order.status === 'preparing') && 'bg-amber-100 text-amber-600',
                                            order.status === 'ready' && 'bg-blue-100 text-blue-600',
                                            order.status === 'cancelled' && 'bg-red-50 text-red-600'
                                        )}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <span className="text-sm font-semibold text-foreground">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Points Modal */}
            {showPointsModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
                    onClick={() => setShowPointsModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="flex items-center gap-2 text-xl m-0 mb-4 text-foreground [&>svg]:text-primary">
                            {pointsAction === 'add' ? (
                                <><Plus size={20} /> Add Points</>
                            ) : (
                                <><Gift size={20} /> Redeem Points</>
                            )}
                        </h2>
                        {pointsAction === 'redeem' && (
                            <p className="m-0 mb-4 p-3 bg-slate-100 rounded-lg text-sm text-slate-600">
                                Available points: <strong className="text-primary">{customer.loyalty_points.toLocaleString()}</strong>
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
                        <div className="flex gap-3 mt-6 [&>.btn]:flex-1">
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
