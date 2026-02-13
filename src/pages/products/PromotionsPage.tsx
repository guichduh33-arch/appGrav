import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Tag, Plus, Search, Edit, Trash2, Eye, Percent, Gift,
    Calendar, Clock, TrendingDown, AlertCircle, CheckCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { Promotion, PromotionType } from '../../types/database'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'


const PROMOTION_TYPE_ICONS: Record<PromotionType, React.ReactNode> = {
    percentage: <Percent size={16} />,
    fixed_amount: <TrendingDown size={16} />,
    buy_x_get_y: <Gift size={16} />,
    free_product: <Gift size={16} />,
    fixed: <TrendingDown size={16} />,
    free: <Gift size={16} />
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
]

export default function PromotionsPage() {
    const navigate = useNavigate()
    const [promotions, setPromotions] = useState<Promotion[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<PromotionType | 'all'>('all')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

    useEffect(() => {
        fetchPromotions()
    }, [])

    const fetchPromotions = async () => {
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setPromotions(data)
        } catch (error) {
            logError('Error fetching promotions:', error)
        } finally {
            setLoading(false)
        }
    }

    const isPromotionActive = (promo: Promotion): boolean => {
        if (!promo.is_active) return false

        const now = new Date()

        // Check date range
        if (promo.start_date && new Date(promo.start_date) > now) return false
        if (promo.end_date && new Date(promo.end_date) < now) return false

        // Check usage limits
        if (promo.max_uses_total && (promo.current_uses ?? 0) >= promo.max_uses_total) return false

        return true
    }

    const filteredPromotions = promotions.filter(promo => {
        const matchesSearch =
            promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.description?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === 'all' || promo.promotion_type === filterType

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && isPromotionActive(promo)) ||
            (filterStatus === 'inactive' && !isPromotionActive(promo))

        return matchesSearch && matchesType && matchesStatus
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotion?')) return

        try {
            const { error } = await supabase
                .from('promotions')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchPromotions()
        } catch (error) {
            logError('Error deleting promotion:', error)
        }
    }

    const handleToggleActive = async (promo: Promotion) => {
        try {
            const { error } = await supabase
                .from('promotions')
                .update({ is_active: !promo.is_active })
                .eq('id', promo.id)

            if (error) throw error
            await fetchPromotions()
        } catch (error) {
            logError('Error updating promotion:', error)
        }
    }

    const formatPromotionValue = (promo: Promotion): string => {
        switch (promo.promotion_type) {
            case 'percentage':
                return `${promo.discount_percentage}% discount`
            case 'fixed_amount':
                return `${formatCurrency(promo.discount_amount || 0)} discount`
            case 'buy_x_get_y':
                return `Buy ${promo.buy_quantity}, get ${promo.get_quantity} free`
            case 'free_product':
                return 'Free product'
            default:
                return '-'
        }
    }

    const formatTimeConstraints = (promo: Promotion): string[] => {
        const constraints: string[] = []

        if (promo.start_date || promo.end_date) {
            const start = promo.start_date ? new Date(promo.start_date).toLocaleDateString('en-GB') : '...'
            const end = promo.end_date ? new Date(promo.end_date).toLocaleDateString('en-GB') : '...'
            constraints.push(`From ${start} to ${end}`)
        }

        if (promo.days_of_week && promo.days_of_week.length > 0) {
            const days = promo.days_of_week
                .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label.substring(0, 3))
                .join(', ')
            constraints.push(`Days: ${days}`)
        }

        if (promo.time_start && promo.time_end) {
            constraints.push(`${promo.time_start} - ${promo.time_end}`)
        }

        return constraints
    }

    const stats = {
        total: promotions.length,
        active: promotions.filter(isPromotionActive).length,
        inactive: promotions.filter(p => !isPromotionActive(p)).length,
        expired: promotions.filter(p =>
            p.end_date && new Date(p.end_date) < new Date()
        ).length
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto md:p-4 font-body">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 max-md:flex-col max-md:items-start max-md:gap-4">
                <div className="flex-col">
                    <h1 className="font-display text-3xl font-semibold text-[var(--theme-text-primary)] m-0 flex items-center gap-3">
                        <Tag size={28} className="text-[var(--color-gold)]" />
                        Artisan Promotions
                    </h1>
                    <p className="text-[var(--theme-text-secondary)] text-sm opacity-60 mt-1">
                        Curate special experiences and value for your patrons
                    </p>
                </div>
                <button
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[0_10px_30px_rgba(201,165,92,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(201,165,92,0.4)] active:scale-[0.98]"
                    onClick={() => navigate('/products/promotions/new')}
                    title="Design new promotion"
                >
                    <Plus size={20} />
                    <span>Inaugurate Promotion</span>
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8 max-md:grid-cols-1">
                <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex items-center gap-4 transition-all hover:border-[var(--color-gold-muted)]">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-gold-muted)]/10 flex items-center justify-center text-[var(--color-gold)]">
                        <Tag size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-display font-bold text-[var(--theme-text-primary)]">{stats.total}</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--theme-text-secondary)] opacity-50">Total</span>
                    </div>
                </div>
                <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex items-center gap-4 transition-all hover:border-emerald-500/30">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-display font-bold text-[var(--theme-text-primary)]">{stats.active}</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--theme-text-secondary)] opacity-50">Active</span>
                    </div>
                </div>
                <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex items-center gap-4 transition-all hover:border-amber-500/30">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-display font-bold text-[var(--theme-text-primary)]">{stats.inactive}</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--theme-text-secondary)] opacity-50">Inactive</span>
                    </div>
                </div>
                <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex items-center gap-4 transition-all hover:border-red-500/30">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <Calendar size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-display font-bold text-[var(--theme-text-primary)]">{stats.expired}</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--theme-text-secondary)] opacity-50">Expired</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[var(--theme-bg-secondary)] p-4 rounded-2xl border border-[var(--theme-border)] flex gap-4 mb-8 max-md:flex-col">
                <div className="flex-1 relative flex items-center">
                    <Search size={18} className="absolute left-4 text-[var(--color-gold)] opacity-50" />
                    <input
                        type="text"
                        placeholder="Search by name, code or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 pr-4 pl-12 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] placeholder:opacity-30"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as PromotionType | 'all')}
                    className="py-3 px-6 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none cursor-pointer transition-all focus:border-[var(--color-gold)]"
                    title="Filter by type"
                >
                    <option value="all">All Disciplines</option>
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="buy_x_get_y">Transactional (Buy/Get)</option>
                    <option value="free_product">Complimentary Item</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="py-3 px-6 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none cursor-pointer transition-all focus:border-[var(--color-gold)]"
                    title="Filter by status"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Currently Active</option>
                    <option value="inactive">Idle/Scheduled</option>
                </select>
            </div>

            {/* Promotions List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-3 border-[var(--color-gold-muted)]/20 border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span className="text-[var(--theme-text-secondary)] opacity-50 font-display italic">Summoning Artisan Promotions...</span>
                </div>
            ) : filteredPromotions.length === 0 ? (
                <div className="bg-[var(--theme-bg-secondary)] rounded-3xl p-24 text-center border border-dashed border-[var(--theme-border)]">
                    <div className="w-20 h-20 bg-[var(--theme-bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-gold)]/30">
                        <Tag size={40} />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-[var(--theme-text-primary)] mb-2">The Archive is Empty</h3>
                    <p className="text-[var(--theme-text-secondary)] opacity-50 max-w-md mx-auto">
                        {searchTerm || filterType !== 'all'
                            ? 'No promotions match your refined search criteria.'
                            : 'Start crafting your first artisanal promotion to offer special value to your clientele.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-8 max-md:grid-cols-1">
                    {filteredPromotions.map(promo => {
                        const active = isPromotionActive(promo)
                        const timeConstraints = formatTimeConstraints(promo)

                        return (
                            <div
                                key={promo.id}
                                className={cn(
                                    'group relative bg-[var(--theme-bg-secondary)] rounded-[2rem] border border-[var(--theme-border)] overflow-hidden transition-all duration-500 flex flex-col hover:border-[var(--color-gold-muted)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
                                    !active && 'grayscale opacity-60'
                                )}
                            >
                                {/* Promotion Header Card */}
                                <div className="relative p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-gold)]/20">
                                            {PROMOTION_TYPE_ICONS[promo.promotion_type as PromotionType]}
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                            active
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {active ? 'Active Engagement' : 'Dormant'}
                                        </div>
                                    </div>

                                    <h3 className="font-display text-2xl font-bold text-[var(--theme-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">
                                        {promo.name}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="px-3 py-1 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-lg text-xs font-mono font-bold text-[var(--color-gold)]">
                                            CODE: {promo.code}
                                        </div>
                                        <span className="text-[10px] text-[var(--theme-text-secondary)] opacity-40 uppercase tracking-tighter">
                                            Ref: {promo.id.substring(0, 8)}
                                        </span>
                                    </div>

                                    {promo.description && (
                                        <p className="text-sm text-[var(--theme-text-secondary)] opacity-60 line-clamp-2 leading-relaxed mb-6 italic">
                                            "{promo.description}"
                                        </p>
                                    )}

                                    {/* Value Badge */}
                                    <div className="bg-gradient-to-r from-[var(--theme-bg-tertiary)] to-transparent p-6 rounded-2xl border-l-4 border-[var(--color-gold)] mb-6">
                                        <div className="text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-gold)] mb-1 opacity-70">
                                            Promotion Value
                                        </div>
                                        <div className="text-3xl font-display font-black text-[var(--theme-text-primary)]">
                                            {formatPromotionValue(promo)}
                                        </div>
                                    </div>

                                    {/* Constraints & Limits */}
                                    <div className="space-y-3">
                                        {timeConstraints.length > 0 && (
                                            <div className="flex gap-4 p-4 rounded-xl bg-[var(--theme-bg-tertiary)]/50 border border-[var(--theme-border)]">
                                                <Clock size={16} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                                                <div className="flex flex-col gap-1.5">
                                                    {timeConstraints.map((constraint, idx) => (
                                                        <span key={idx} className="text-xs font-semibold text-[var(--theme-text-primary)] opacity-80">{constraint}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            {promo.min_purchase_amount && (
                                                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 flex flex-col gap-1">
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-violet-500/70">Min Purchase</span>
                                                    <span className="text-sm font-bold text-[var(--theme-text-primary)]">
                                                        {formatCurrency(promo.min_purchase_amount)}
                                                    </span>
                                                </div>
                                            )}

                                            {(promo.max_uses_total || promo.max_uses_per_customer) && (
                                                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col gap-1">
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-blue-500/70">Redemptions</span>
                                                    <span className="text-sm font-bold text-[var(--theme-text-primary)] flex items-center gap-2">
                                                        {promo.current_uses} / {promo.max_uses_total || '∞'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-auto px-8 py-6 bg-[var(--theme-bg-tertiary)]/30 border-t border-[var(--theme-border)] flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[9px] font-bold text-[var(--theme-text-secondary)] opacity-60">
                                            PRIORITY {promo.priority}
                                        </span>
                                        {promo.is_stackable && (
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500">
                                                STACKABLE
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-1.5">
                                        <button
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] transition-all hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--color-gold)]"
                                            onClick={() => navigate(`/products/promotions/${promo.id}`)}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] transition-all hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--color-gold)]"
                                            onClick={() => navigate(`/products/promotions/${promo.id}/edit`)}
                                            title="Edit Promotion"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className={cn(
                                                "w-9 h-9 flex items-center justify-center rounded-xl border transition-all",
                                                promo.is_active
                                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                    : "bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                                            )}
                                            onClick={() => handleToggleActive(promo)}
                                            title={promo.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                        <button
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                                            onClick={() => handleDelete(promo.id)}
                                            title="Dissolve Promotion"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute -inset-px bg-gradient-to-br from-[var(--color-gold)]/0 via-[var(--color-gold)]/0 to-[var(--color-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
