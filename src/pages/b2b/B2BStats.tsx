import { useNavigate } from 'react-router-dom'
import { Building2, FileText, TrendingUp, Clock } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

interface B2BStatsData {
    totalClients: number
    activeClients: number
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    unpaidAmount: number
}

interface B2BStatsProps {
    stats: B2BStatsData
}

export default function B2BStats({ stats }: B2BStatsProps) {
    const navigate = useNavigate()

    const cards = [
        {
            icon: Building2,
            iconColor: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
            value: stats.totalClients,
            label: 'B2B Clients',
            onClick: () => navigate('/b2b/orders'),
        },
        {
            icon: FileText,
            iconColor: 'bg-blue-500/10 text-blue-400',
            value: stats.totalOrders,
            label: 'Orders',
            onClick: () => navigate('/b2b/orders'),
        },
        {
            icon: TrendingUp,
            iconColor: 'bg-emerald-500/10 text-emerald-400',
            value: formatCurrency(stats.totalRevenue),
            label: 'Total Revenue',
        },
        {
            icon: Clock,
            iconColor: 'bg-amber-500/10 text-amber-400',
            value: formatCurrency(stats.unpaidAmount),
            label: 'To Collect',
            onClick: () => navigate('/b2b/payments'),
        },
    ]

    return (
        <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 mb-8">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all hover:border-white/10"
                    onClick={card.onClick}
                >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${card.iconColor}`}>
                        <card.icon size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white leading-tight">{card.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{card.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
