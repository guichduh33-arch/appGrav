import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { Promotion, PromotionType } from '../../types/database'
import { logError } from '@/utils/logger'

import PromotionsHeader from './promotions-list/PromotionsHeader'
import PromotionsStats from './promotions-list/PromotionsStats'
import PromotionCard from './promotions-list/PromotionCard'

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

    useEffect(() => { fetchPromotions() }, [])

    const fetchPromotions = async () => {
        try {
            const { data, error } = await supabase.from('promotions').select('*')
                .order('priority', { ascending: false }).order('created_at', { ascending: false })
            if (error) throw error
            if (data) setPromotions(data)
        } catch (error) { logError('Error fetching promotions:', error) }
        finally { setLoading(false) }
    }

    const isPromotionActive = (promo: Promotion): boolean => {
        if (!promo.is_active) return false
        const now = new Date()
        if (promo.start_date && new Date(promo.start_date) > now) return false
        if (promo.end_date && new Date(promo.end_date) < now) return false
        if (promo.max_uses_total && (promo.current_uses ?? 0) >= promo.max_uses_total) return false
        return true
    }

    const filteredPromotions = promotions.filter(promo => {
        const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'all' || promo.promotion_type === filterType
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && isPromotionActive(promo)) ||
            (filterStatus === 'inactive' && !isPromotionActive(promo))
        return matchesSearch && matchesType && matchesStatus
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotion?')) return
        try {
            const { error } = await supabase.from('promotions').delete().eq('id', id)
            if (error) throw error
            await fetchPromotions()
        } catch (error) { logError('Error deleting promotion:', error) }
    }

    const handleToggleActive = async (promo: Promotion) => {
        try {
            const { error } = await supabase.from('promotions').update({ is_active: !promo.is_active }).eq('id', promo.id)
            if (error) throw error
            await fetchPromotions()
        } catch (error) { logError('Error updating promotion:', error) }
    }

    const formatPromotionValue = (promo: Promotion): string => {
        switch (promo.promotion_type) {
            case 'percentage': return `${promo.discount_percentage}% discount`
            case 'fixed_amount': return `${formatCurrency(promo.discount_amount || 0)} discount`
            case 'buy_x_get_y': return `Buy ${promo.buy_quantity}, get ${promo.get_quantity} free`
            case 'free_product': return 'Free product'
            default: return '-'
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
            const days = promo.days_of_week.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label.substring(0, 3)).join(', ')
            constraints.push(`Days: ${days}`)
        }
        if (promo.time_start && promo.time_end) constraints.push(`${promo.time_start} - ${promo.time_end}`)
        return constraints
    }

    const stats = {
        total: promotions.length,
        active: promotions.filter(isPromotionActive).length,
        inactive: promotions.filter(p => !isPromotionActive(p)).length,
        expired: promotions.filter(p => p.end_date && new Date(p.end_date) < new Date()).length
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-8 max-w-[1400px] mx-auto max-md:p-4 font-body">
            <PromotionsHeader onCreateNew={() => navigate('/products/promotions/new')} />
            <PromotionsStats total={stats.total} active={stats.active} inactive={stats.inactive} expired={stats.expired} />

            {/* Filters */}
            <div className="bg-[var(--onyx-surface)] p-4 rounded-xl border border-white/5 flex gap-4 mb-8 max-md:flex-col">
                <div className="flex-1 relative flex items-center">
                    <Search size={18} className="absolute left-4 text-[var(--color-gold)] opacity-50" />
                    <input
                        type="text"
                        placeholder="Search by name, code or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 pr-4 pl-12 bg-black/40 border border-white/10 rounded-xl text-white outline-none transition-all focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as PromotionType | 'all')}
                    className="py-3 px-6 bg-black/40 border border-white/10 rounded-xl text-white outline-none cursor-pointer transition-all focus:border-[var(--color-gold)]"
                    title="Filter by type"
                >
                    <option value="all">All Types</option>
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                    <option value="free_product">Free Product</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="py-3 px-6 bg-black/40 border border-white/10 rounded-xl text-white outline-none cursor-pointer transition-all focus:border-[var(--color-gold)]"
                    title="Filter by status"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Promotions Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span className="text-[var(--theme-text-muted)]">Loading promotions...</span>
                </div>
            ) : filteredPromotions.length === 0 ? (
                <div className="bg-[var(--onyx-surface)] rounded-2xl p-24 text-center border border-dashed border-white/10">
                    <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--theme-text-muted)]">
                        <Tag size={40} />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-white mb-2">No Promotions Found</h3>
                    <p className="text-[var(--theme-text-secondary)] opacity-50 max-w-md mx-auto">
                        {searchTerm || filterType !== 'all'
                            ? 'No promotions match your search criteria.'
                            : 'Create your first promotion to offer value to your customers.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-8 max-md:grid-cols-1">
                    {filteredPromotions.map(promo => (
                        <PromotionCard
                            key={promo.id}
                            promo={promo}
                            active={isPromotionActive(promo)}
                            timeConstraints={formatTimeConstraints(promo)}
                            formattedValue={formatPromotionValue(promo)}
                            onView={(id) => navigate(`/products/promotions/${id}`)}
                            onEdit={(id) => navigate(`/products/promotions/${id}/edit`)}
                            onToggleActive={() => handleToggleActive(promo)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
