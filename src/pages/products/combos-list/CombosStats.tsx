import { Box, Package, AlertCircle } from 'lucide-react'

interface CombosStatsProps {
    total: number
    active: number
    inactive: number
}

export default function CombosStats({ total, active, inactive }: CombosStatsProps) {
    const stats = [
        { label: 'Total Combos', value: total, icon: <Box size={26} />, color: 'var(--color-gold)' },
        { label: 'Active Sets', value: active, icon: <Package size={24} />, color: '#10b981' },
        { label: 'Inactive', value: inactive, icon: <AlertCircle size={24} />, color: '#f59e0b' }
    ]

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-10 max-md:grid-cols-1">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-5 p-6 bg-[var(--onyx-surface)] rounded-xl border border-white/5 shadow-sm hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300 group"
                >
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                    >
                        {stat.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-3xl font-display font-bold leading-none">{stat.value}</span>
                        <span className="text-[var(--theme-text-muted)] text-sm uppercase tracking-widest font-semibold mt-1">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
