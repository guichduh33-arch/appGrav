import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShoppingBag, TrendingUp, CreditCard, Calendar } from 'lucide-react'
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
import { CustomerDetailHeader } from '@/components/customers/CustomerDetailHeader'
import { CustomerLoyaltyCard } from '@/components/customers/CustomerLoyaltyCard'
import { CustomerDetailTabs } from '@/components/customers/CustomerDetailTabs'
import { CustomerPointsModal } from '@/components/customers/CustomerPointsModal'

type TabType = 'overview' | 'loyalty' | 'orders'

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
            day: '2-digit', month: 'short', year: 'numeric',
        })
    }

    const getNextTier = () => {
        if (!customer) return null
        const currentTierIndex = tiers.findIndex(t => t.name.toLowerCase() === customer.loyalty_tier)
        if (currentTierIndex < tiers.length - 1) return tiers[currentTierIndex + 1]
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
            <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 max-w-[1200px] mx-auto max-md:p-4">
                <div className="flex flex-col items-center justify-center py-16 px-8 text-[var(--muted-smoke)] gap-4">
                    <div className="spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    if (!customer) return null

    const nextTier = getNextTier()

    const statItems = [
        { icon: <ShoppingBag size={22} />, value: String(customer.total_visits), label: 'Visits' },
        { icon: <TrendingUp size={22} />, value: formatCurrency(customer.total_spent), label: 'Total spent' },
        {
            icon: <CreditCard size={22} />,
            value: customer.total_visits > 0 ? formatCurrency(customer.total_spent / customer.total_visits) : formatCurrency(0),
            label: 'Average basket',
        },
        { icon: <Calendar size={22} />, value: formatDate(customer.last_visit_at), label: 'Last visit' },
    ]

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 max-w-[1200px] mx-auto max-md:p-4">
            <CustomerDetailHeader
                customer={customer}
                onBack={() => navigate('/customers')}
                onEdit={() => navigate(`/customers/${id}/edit`)}
            />

            <CustomerLoyaltyCard
                loyaltyTier={customer.loyalty_tier}
                membershipNumber={customer.membership_number}
                loyaltyPoints={customer.loyalty_points}
                lifetimePoints={customer.lifetime_points}
                nextTier={nextTier}
                progressPercent={getProgressToNextTier()}
                onAddPoints={() => { setPointsAction('add'); setShowPointsModal(true) }}
                onRedeemPoints={() => { setPointsAction('redeem'); setShowPointsModal(true) }}
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2 max-md:grid-cols-1">
                {statItems.map(stat => (
                    <div key={stat.label} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <span className="text-[var(--color-gold)]">{stat.icon}</span>
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-white">{stat.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <CustomerDetailTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                customer={customer}
                loyaltyTransactions={loyaltyTransactions}
                orders={orders}
            />

            {showPointsModal && (
                <CustomerPointsModal
                    action={pointsAction}
                    availablePoints={customer.loyalty_points}
                    pointsAmount={pointsAmount}
                    onPointsAmountChange={setPointsAmount}
                    pointsDescription={pointsDescription}
                    onPointsDescriptionChange={setPointsDescription}
                    onSubmit={handlePointsSubmit}
                    onClose={() => setShowPointsModal(false)}
                />
            )}
        </div>
    )
}
