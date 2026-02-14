import { Trash2, Building2, Crown, UserCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'

interface CategoryPriceRowProps {
    category: { id: string; name: string; slug: string; color: string; price_modifier_type: string; discount_percentage: number | null }
    price: number
    isActive: boolean
    calculatedPrice: number
    onPriceChange: (price: number) => void
    onToggleActive: () => void
    onRemove: () => void
}

function getCategoryIcon(slug: string) {
    switch (slug) {
        case 'wholesale': return <Building2 size={18} />
        case 'vip': return <Crown size={18} />
        case 'staff': return <UserCheck size={18} />
        default: return <Users size={18} />
    }
}

export default function CategoryPriceRow({
    category, price, isActive, calculatedPrice,
    onPriceChange, onToggleActive, onRemove
}: CategoryPriceRowProps) {
    const difference = price - calculatedPrice
    const percentDiff = calculatedPrice !== 0 ? ((price - calculatedPrice) / calculatedPrice) * 100 : 0

    return (
        <div className={cn('rounded-xl border border-white/5 overflow-hidden transition-all', !isActive && 'opacity-50')}>
            <div className="flex items-center gap-4 p-4 bg-white/[0.02] border-b border-white/5">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: category.color }}
                >
                    {getCategoryIcon(category.slug)}
                </div>
                <div className="flex-1 flex flex-col">
                    <span className="font-semibold text-white">{category.name}</span>
                    <span className="text-xs text-[var(--theme-text-muted)]">
                        {category.price_modifier_type === 'retail' && 'Standard Price'}
                        {category.price_modifier_type === 'wholesale' && 'Wholesale Price'}
                        {category.price_modifier_type === 'discount_percentage' && `${category.discount_percentage}% discount`}
                        {category.price_modifier_type === 'custom' && 'Custom Price'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            isActive
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-white/5 border-white/10 text-[var(--theme-text-muted)]'
                        )}
                        onClick={onToggleActive}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-[var(--theme-text-muted)] flex items-center justify-center transition-all hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                        onClick={onRemove}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="p-5 grid grid-cols-2 gap-6 max-md:grid-cols-1">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Custom Price</label>
                    <div className="flex items-center border-2 border-white/10 rounded-xl overflow-hidden transition-all focus-within:border-[var(--color-gold)] focus-within:ring-1 focus-within:ring-[var(--color-gold)]/20">
                        <span className="px-4 py-3 bg-white/[0.03] text-[var(--theme-text-muted)] text-sm font-medium">Rp</span>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => onPriceChange(Number(e.target.value))}
                            min="0"
                            step="1000"
                            className="flex-1 border-none p-3 text-lg font-semibold bg-transparent outline-none font-mono text-white"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--theme-text-muted)]">Auto price:</span>
                        <span className="text-sm font-medium font-mono text-[var(--theme-text-secondary)]">{formatCurrency(calculatedPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--theme-text-muted)]">Difference:</span>
                        <span className={cn(
                            'text-sm font-medium font-mono',
                            difference > 0 ? 'text-emerald-400' : difference < 0 ? 'text-red-400' : 'text-[var(--theme-text-secondary)]'
                        )}>
                            {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                            <span className="text-xs ml-1 opacity-70">
                                ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
