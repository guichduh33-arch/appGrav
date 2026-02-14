import {
    Star, Crown, Phone, Mail, QrCode, Eye, Edit, Building2, Users, UserCheck
} from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const TIER_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    bronze: { color: '#cd7f32', icon: <Star size={12} /> },
    silver: { color: '#c0c0c0', icon: <Star size={12} /> },
    gold: { color: '#ffd700', icon: <Crown size={12} /> },
    platinum: { color: '#e5e4e2', icon: <Crown size={12} /> },
}

function getCategoryIcon(type: string) {
    switch (type) {
        case 'wholesale': return <Building2 size={12} />
        case 'vip': return <Crown size={12} />
        case 'staff': return <UserCheck size={12} />
        default: return <Users size={12} />
    }
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

interface CustomerCardProps {
    customer: {
        id: string
        name: string
        company_name?: string | null
        phone?: string | null
        email?: string | null
        membership_number?: string | null
        loyalty_tier: string
        loyalty_points: number
        total_visits: number
        total_spent: number
        is_active: boolean
        created_at: string
        category?: { name: string; slug: string; color: string } | null
    }
    onView: (id: string) => void
    onEdit: (id: string) => void
}

export function CustomerCard({ customer, onView, onEdit }: CustomerCardProps) {
    const tier = TIER_CONFIG[customer.loyalty_tier]

    return (
        <div
            className="group bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 cursor-pointer transition-all relative hover:border-[var(--color-gold)]/30 hover:shadow-[0_4px_24px_rgba(202,176,109,0.08)]"
            onClick={() => onView(customer.id)}
        >
            {/* Top: Avatar + Badges */}
            <div className="flex justify-between items-start mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: customer.category?.color || '#6366f1' }}
                >
                    {getInitials(customer.company_name || customer.name)}
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                    {customer.category && (
                        <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize"
                            style={{
                                color: customer.category.color,
                                borderColor: `${customer.category.color}33`,
                                backgroundColor: `${customer.category.color}15`,
                            }}
                        >
                            {getCategoryIcon(customer.category.slug)}
                            {customer.category.name}
                        </span>
                    )}
                    {customer.loyalty_tier && customer.loyalty_tier !== 'bronze' && tier && (
                        <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize"
                            style={{
                                color: tier.color,
                                borderColor: `${tier.color}33`,
                                backgroundColor: `${tier.color}15`,
                            }}
                        >
                            {tier.icon}
                            {customer.loyalty_tier}
                        </span>
                    )}
                </div>
            </div>

            {/* Name + Contact */}
            <div className="mb-4">
                <h3 className="m-0 mb-1 text-[15px] font-bold text-white">
                    {customer.company_name || customer.name}
                </h3>
                {customer.company_name && (
                    <p className="m-0 mb-2 text-sm text-[var(--muted-smoke)]">{customer.name}</p>
                )}
                <div className="flex flex-col gap-1">
                    {customer.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)]">
                            <Phone size={11} className="text-[var(--theme-text-muted)]" />
                            {customer.phone}
                        </span>
                    )}
                    {customer.email && (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)]">
                            <Mail size={11} className="text-[var(--theme-text-muted)]" />
                            {customer.email}
                        </span>
                    )}
                </div>
                {customer.membership_number && (
                    <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 bg-white/5 rounded-lg font-mono text-xs text-[var(--muted-smoke)] w-fit">
                        <QrCode size={12} />
                        {customer.membership_number}
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/5 mb-3">
                <div className="flex flex-col items-center text-center">
                    <span className="text-base font-bold text-white">{customer.total_visits}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Visits</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-base font-bold text-white">{customer.loyalty_points.toLocaleString()}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Points</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-bold text-white">{formatCurrency(customer.total_spent)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Total</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center">
                <span className={cn(
                    'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                    customer.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                )}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                    Since {formatDate(customer.created_at)}
                </span>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-md:opacity-100">
                <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[var(--muted-smoke)] hover:bg-[var(--color-gold)] hover:text-black hover:border-[var(--color-gold)] transition-all"
                    onClick={(e) => { e.stopPropagation(); onView(customer.id) }}
                    title="View details"
                >
                    <Eye size={14} />
                </button>
                <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[var(--muted-smoke)] hover:bg-[var(--color-gold)] hover:text-black hover:border-[var(--color-gold)] transition-all"
                    onClick={(e) => { e.stopPropagation(); onEdit(customer.id) }}
                    title="Edit"
                >
                    <Edit size={14} />
                </button>
            </div>
        </div>
    )
}
