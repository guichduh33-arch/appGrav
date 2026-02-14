import { Package, Coffee, Croissant } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = 'all' | 'finished' | 'semi_finished' | 'raw_material'

interface ProductsStatsProps {
    stats: { all: number; finished: number; semiFinished: number; rawMaterial: number }
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

export default function ProductsStats({ stats, activeTab, onTabChange }: ProductsStatsProps) {
    const statCards: { tab: TabType; icon: React.ReactNode; value: number; label: string }[] = [
        { tab: 'all', icon: <Package size={22} />, value: stats.all, label: 'All Products' },
        { tab: 'finished', icon: <Coffee size={22} />, value: stats.finished, label: 'Finished' },
        { tab: 'semi_finished', icon: <Croissant size={22} />, value: stats.semiFinished, label: 'Semi-Finished' },
        { tab: 'raw_material', icon: <Package size={22} />, value: stats.rawMaterial, label: 'Raw Materials' },
    ]

    return (
        <div className="grid grid-cols-4 gap-4 mb-8 lg:grid-cols-2 md:grid-cols-2">
            {statCards.map(stat => (
                <div
                    key={stat.tab}
                    className={cn(
                        'relative overflow-hidden flex items-center gap-4 p-5 bg-[var(--onyx-surface)] rounded-2xl border border-white/5 cursor-pointer transition-all duration-300 shadow-sm group',
                        'hover:border-[var(--color-gold)]/30 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(201,165,92,0.1)]',
                        'md:p-4 [&>svg]:text-[var(--color-gold)] [&>svg]:shrink-0',
                        activeTab === stat.tab && 'border-[var(--color-gold)]/50 bg-gradient-to-br from-[rgba(201,165,92,0.08)] to-[var(--onyx-surface)] shadow-[0_0_0_1px_rgba(201,165,92,0.3)]'
                    )}
                    onClick={() => onTabChange(stat.tab)}
                >
                    {activeTab === stat.tab && (
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
                    )}
                    {stat.icon}
                    <div className="flex flex-col">
                        <span className="font-display text-3xl font-bold text-white md:text-2xl">{stat.value}</span>
                        <span className="font-body text-[0.65rem] text-[var(--theme-text-secondary)] uppercase tracking-[0.08em]">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
