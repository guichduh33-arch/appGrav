import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Tag, Plus, Search, Edit, Trash2, Eye, Percent, Gift,
    Calendar, Clock, Users, TrendingDown, AlertCircle, CheckCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { Promotion, PromotionType } from '../../types/database'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'

const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
    percentage: 'Discount %',
    fixed_amount: 'Fixed amount',
    buy_x_get_y: 'Buy X get Y',
    free_product: 'Free product',
    fixed: 'Fixed amount',
    free: 'Free'
}

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
        <div className="p-8 max-w-[1400px] mx-auto md:p-4">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 max-md:flex-col max-md:items-start max-md:gap-4">
                <div className="flex-1">
                    <h1 className="flex items-center gap-3 text-[1.75rem] font-bold text-slate-800 mb-2">
                        <Tag size={28} />
                        Promotion Management
                    </h1>
                    <p className="text-slate-500 text-[0.95rem] m-0">
                        Create promotions with time rules and purchase conditions
                    </p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-6 py-3 border-none rounded-lg text-[0.95rem] font-medium cursor-pointer transition-all duration-200 bg-indigo-500 text-white hover:bg-indigo-600 hover:-translate-y-px hover:shadow-[0_4px_6px_rgba(99,102,241,0.25)]"
                    onClick={() => navigate('/products/promotions/new')}
                >
                    <Plus size={18} />
                    New Promotion
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8 max-md:grid-cols-1">
                <div className="group bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 [&>svg]:text-indigo-500 [&>svg]:shrink-0">
                    <Tag size={24} />
                    <div className="flex flex-col">
                        <span className="text-[1.75rem] font-bold text-slate-800 leading-none">{stats.total}</span>
                        <span className="text-sm text-slate-500 mt-1">Total Promotions</span>
                    </div>
                </div>
                <div className="group bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 [&>svg]:text-emerald-500 [&>svg]:shrink-0">
                    <CheckCircle size={24} />
                    <div className="flex flex-col">
                        <span className="text-[1.75rem] font-bold text-slate-800 leading-none">{stats.active}</span>
                        <span className="text-sm text-slate-500 mt-1">Active</span>
                    </div>
                </div>
                <div className="group bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 [&>svg]:text-amber-500 [&>svg]:shrink-0">
                    <AlertCircle size={24} />
                    <div className="flex flex-col">
                        <span className="text-[1.75rem] font-bold text-slate-800 leading-none">{stats.inactive}</span>
                        <span className="text-sm text-slate-500 mt-1">Inactive</span>
                    </div>
                </div>
                <div className="group bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 [&>svg]:text-red-500 [&>svg]:shrink-0">
                    <Calendar size={24} />
                    <div className="flex flex-col">
                        <span className="text-[1.75rem] font-bold text-slate-800 leading-none">{stats.expired}</span>
                        <span className="text-sm text-slate-500 mt-1">Expired</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-8 max-md:flex-col">
                <div className="flex-1 relative flex items-center [&>svg:first-child]:absolute [&>svg:first-child]:left-4 [&>svg:first-child]:text-slate-400">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, code or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 pr-4 pl-12 border border-slate-200 rounded-lg text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as PromotionType | 'all')}
                    className="py-3 px-4 border border-slate-200 rounded-lg text-[0.95rem] bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10"
                >
                    <option value="all">All types</option>
                    <option value="percentage">Discount %</option>
                    <option value="fixed_amount">Fixed amount</option>
                    <option value="buy_x_get_y">Buy X get Y</option>
                    <option value="free_product">Free product</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="py-3 px-4 border border-slate-200 rounded-lg text-[0.95rem] bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10"
                >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Promotions List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
                    <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-slate-500 text-[0.95rem]">Loading promotions...</span>
                </div>
            ) : filteredPromotions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center [&>svg:first-child]:text-slate-300 [&>svg:first-child]:mb-4">
                    <Tag size={64} />
                    <h3 className="text-xl text-slate-800 m-0 mb-2">No promotion found</h3>
                    <p className="text-slate-500 text-[0.95rem] m-0">
                        {searchTerm || filterType !== 'all'
                            ? 'Try modifying your filters'
                            : 'Start by creating your first promotion'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6 max-md:grid-cols-1">
                    {filteredPromotions.map(promo => {
                        const active = isPromotionActive(promo)
                        const timeConstraints = formatTimeConstraints(promo)

                        return (
                            <div
                                key={promo.id}
                                className={cn(
                                    'bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 flex flex-col hover:shadow-md hover:-translate-y-0.5',
                                    !active && 'opacity-70'
                                )}
                            >
                                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        {PROMOTION_TYPE_ICONS[promo.promotion_type as PromotionType]}
                                        <span>{PROMOTION_TYPE_LABELS[promo.promotion_type as PromotionType]}</span>
                                    </div>
                                    <span className={cn(
                                        'text-xs py-1.5 px-3 rounded-md font-medium bg-white/20',
                                        active ? 'text-white' : 'text-white/80'
                                    )}>
                                        {active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <h3 className="text-xl font-semibold text-slate-800 m-0">{promo.name}</h3>
                                    <div className="text-sm py-2 px-3 bg-slate-50 border border-dashed border-slate-300 rounded-md text-slate-600 font-mono font-semibold w-fit">
                                        Code: {promo.code}
                                    </div>

                                    {promo.description && (
                                        <p className="text-slate-500 text-[0.9rem] m-0 leading-relaxed">{promo.description}</p>
                                    )}

                                    <div className="text-lg font-bold text-emerald-500 py-3 px-4 bg-green-50 rounded-lg text-center">
                                        {formatPromotionValue(promo)}
                                    </div>

                                    {timeConstraints.length > 0 && (
                                        <div className="flex gap-3 py-3 px-4 bg-amber-100 rounded-lg text-amber-900 text-sm [&>svg]:shrink-0 [&>svg]:mt-0.5">
                                            <Clock size={14} />
                                            <div className="flex flex-col gap-1">
                                                {timeConstraints.map((constraint, idx) => (
                                                    <span key={idx}>{constraint}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {promo.min_purchase_amount && (
                                        <div className="py-2 px-3 bg-violet-100 text-violet-800 rounded-md text-sm font-medium">
                                            Minimum purchase: {formatCurrency(promo.min_purchase_amount)}
                                        </div>
                                    )}

                                    {(promo.max_uses_total || promo.max_uses_per_customer) && (
                                        <div className="flex items-center gap-2 py-2 px-3 bg-blue-100 text-blue-800 rounded-md text-sm [&>svg]:shrink-0">
                                            <Users size={14} />
                                            <span>
                                                {promo.current_uses} / {promo.max_uses_total || '\u221E'} uses
                                            </span>
                                            {promo.max_uses_per_customer && (
                                                <span className="ml-auto text-[0.8rem] opacity-80">
                                                    (Max {promo.max_uses_per_customer}/customer)
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                                        <span className="text-xs py-1.5 px-3 bg-slate-100 text-slate-600 rounded-md font-medium">
                                            Priority: {promo.priority}
                                        </span>
                                        {promo.is_stackable && (
                                            <span className="text-xs py-1.5 px-3 bg-green-100 text-green-800 rounded-md font-medium">
                                                Stackable
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
                                    <button
                                        className="p-2 border-none bg-white rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        onClick={() => navigate(`/products/promotions/${promo.id}`)}
                                        title="View details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="p-2 border-none bg-white rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        onClick={() => navigate(`/products/promotions/${promo.id}/edit`)}
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className={cn(
                                            'p-2 border-none bg-white rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-slate-100',
                                            promo.is_active ? 'text-emerald-500' : 'text-slate-400'
                                        )}
                                        onClick={() => handleToggleActive(promo)}
                                        title={promo.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    <button
                                        className="p-2 border-none bg-white rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center text-red-500 hover:bg-red-50"
                                        onClick={() => handleDelete(promo.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
