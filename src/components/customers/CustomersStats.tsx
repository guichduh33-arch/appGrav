import { Users, UserCheck, Star, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'

interface CustomersStatsProps {
    totalCustomers: number
    activeMembers: number
    totalPointsIssued: number
    averageSpent: number
}

export function CustomersStats({ totalCustomers, activeMembers, totalPointsIssued, averageSpent }: CustomersStatsProps) {
    const stats = [
        {
            icon: <Users size={22} />,
            value: String(totalCustomers),
            label: 'Total Customers',
            accent: 'text-violet-400',
            bg: 'bg-violet-500/10',
        },
        {
            icon: <UserCheck size={22} />,
            value: String(activeMembers),
            label: 'Active Members',
            accent: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
        },
        {
            icon: <Star size={22} />,
            value: totalPointsIssued.toLocaleString(),
            label: 'Points Issued',
            accent: 'text-amber-400',
            bg: 'bg-amber-500/10',
        },
        {
            icon: <TrendingUp size={22} />,
            value: formatCurrency(averageSpent),
            label: 'Average Basket',
            accent: 'text-sky-400',
            bg: 'bg-sky-500/10',
        },
    ]

    return (
        <div className="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2 max-md:grid-cols-2">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 flex items-center gap-4"
                >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.accent}`}>
                        {stat.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white leading-tight">{stat.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mt-0.5">
                            {stat.label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
