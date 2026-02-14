import { ArrowLeft, Edit, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIER_CONFIG: Record<string, { color: string; gradient: string }> = {
    bronze: { color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32 0%, #a66829 100%)' },
    silver: { color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0 0%, #8e8e8e 100%)' },
    gold: { color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700 0%, #d4a800 100%)' },
    platinum: { color: '#e5e4e2', gradient: 'linear-gradient(135deg, #e5e4e2 0%, #b8b8b8 100%)' },
}

interface CustomerDetailHeaderProps {
    customer: {
        name: string
        company_name?: string | null
        loyalty_tier: string
        is_active: boolean
        category?: { name: string; color: string } | null
    }
    onBack: () => void
    onEdit: () => void
}

export function CustomerDetailHeader({ customer, onBack, onEdit }: CustomerDetailHeaderProps) {
    const tierConfig = TIER_CONFIG[customer.loyalty_tier] || TIER_CONFIG.bronze

    return (
        <header className="flex justify-between items-center mb-8 gap-4 max-md:flex-col max-md:items-start">
            <div className="flex items-center gap-4">
                <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-transparent text-white hover:bg-white/5 transition-all"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                </button>
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                    style={{ background: tierConfig.gradient }}
                >
                    {customer.company_name?.[0] || customer.name[0]}
                </div>
                <div>
                    <h1 className="m-0 text-2xl font-display font-bold text-white">
                        {customer.company_name || customer.name}
                    </h1>
                    {customer.company_name && (
                        <span className="block text-sm text-[var(--muted-smoke)] mb-1.5">{customer.name}</span>
                    )}
                    <div className="flex gap-2 flex-wrap mt-1.5">
                        {customer.category && (
                            <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize"
                                style={{
                                    color: customer.category.color,
                                    borderColor: `${customer.category.color}33`,
                                    backgroundColor: `${customer.category.color}15`,
                                }}
                            >
                                {customer.category.name}
                            </span>
                        )}
                        <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white capitalize"
                            style={{ background: tierConfig.gradient }}
                        >
                            <Crown size={10} />
                            {customer.loyalty_tier}
                        </span>
                        <span className={cn(
                            'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                            customer.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}>
                            {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
            <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all max-md:w-full justify-center"
                onClick={onEdit}
            >
                <Edit size={16} />
                Edit
            </button>
        </header>
    )
}
