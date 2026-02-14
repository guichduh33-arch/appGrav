import { Tag, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

interface PromotionsStatsProps {
    total: number
    active: number
    inactive: number
    expired: number
}

export default function PromotionsStats({ total, active, inactive, expired }: PromotionsStatsProps) {
    const stats = [
        { label: 'Total', value: total, icon: <Tag size={24} />, colorClass: 'text-[var(--color-gold)]', bgClass: 'bg-[var(--color-gold)]/10', hoverBorder: 'hover:border-[var(--color-gold)]/30' },
        { label: 'Active', value: active, icon: <CheckCircle size={24} />, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', hoverBorder: 'hover:border-emerald-500/30' },
        { label: 'Inactive', value: inactive, icon: <AlertCircle size={24} />, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', hoverBorder: 'hover:border-amber-500/30' },
        { label: 'Expired', value: expired, icon: <Calendar size={24} />, colorClass: 'text-red-400', bgClass: 'bg-red-500/10', hoverBorder: 'hover:border-red-500/30' }
    ]

    return (
        <div className="grid grid-cols-4 gap-4 mb-8 max-md:grid-cols-2 max-sm:grid-cols-1">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className={`bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5 shadow-sm flex items-center gap-4 transition-all ${stat.hoverBorder}`}
                >
                    <div className={`w-12 h-12 rounded-xl ${stat.bgClass} flex items-center justify-center ${stat.colorClass}`}>
                        {stat.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-display font-bold text-white">{stat.value}</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--theme-text-muted)]">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
