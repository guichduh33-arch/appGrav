import { Eye, Edit, Trash2, CheckCircle, Clock, Percent, TrendingDown, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'
import { Promotion, PromotionType } from '@/types/database'

const PROMOTION_TYPE_ICONS: Record<PromotionType, React.ReactNode> = {
    percentage: <Percent size={16} />,
    fixed_amount: <TrendingDown size={16} />,
    buy_x_get_y: <Gift size={16} />,
    free_product: <Gift size={16} />,
    fixed: <TrendingDown size={16} />,
    free: <Gift size={16} />
}

interface PromotionCardProps {
    promo: Promotion
    active: boolean
    timeConstraints: string[]
    formattedValue: string
    onView: (id: string) => void
    onEdit: (id: string) => void
    onToggleActive: () => void
    onDelete: (id: string) => void
}

export default function PromotionCard({
    promo, active, timeConstraints, formattedValue,
    onView, onEdit, onToggleActive, onDelete
}: PromotionCardProps) {
    return (
        <div
            className={cn(
                'group relative bg-[var(--onyx-surface)] rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 flex flex-col hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
                !active && 'grayscale opacity-60'
            )}
        >
            {/* Header */}
            <div className="relative p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center text-[var(--color-gold)] shadow-lg shadow-[var(--color-gold)]/10">
                        {PROMOTION_TYPE_ICONS[promo.promotion_type as PromotionType]}
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                        {active ? 'Active' : 'Inactive'}
                    </div>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-[var(--color-gold)] transition-colors">
                    {promo.name}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 bg-black/30 border border-white/10 rounded-lg text-xs font-mono font-bold text-[var(--color-gold)]">
                        CODE: {promo.code}
                    </div>
                    <span className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-tighter">
                        Ref: {promo.id.substring(0, 8)}
                    </span>
                </div>

                {promo.description && (
                    <p className="text-sm text-[var(--theme-text-secondary)] opacity-60 line-clamp-2 leading-relaxed mb-6 italic">
                        "{promo.description}"
                    </p>
                )}

                {/* Value Badge */}
                <div className="bg-black/20 p-6 rounded-xl border-l-4 border-[var(--color-gold)] mb-6">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-gold)] mb-1 opacity-70">
                        Value
                    </div>
                    <div className="text-3xl font-display font-black text-white">
                        {formattedValue}
                    </div>
                </div>

                {/* Constraints */}
                <div className="space-y-3">
                    {timeConstraints.length > 0 && (
                        <div className="flex gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                            <Clock size={16} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1.5">
                                {timeConstraints.map((constraint, idx) => (
                                    <span key={idx} className="text-xs font-semibold text-white opacity-80">{constraint}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {promo.min_purchase_amount && (
                            <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-violet-400/70">Min Purchase</span>
                                <span className="text-sm font-bold text-white">
                                    {formatCurrency(promo.min_purchase_amount)}
                                </span>
                            </div>
                        )}

                        {(promo.max_uses_total || promo.max_uses_per_customer) && (
                            <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/10 flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-sky-400/70">Redemptions</span>
                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                    {promo.current_uses} / {promo.max_uses_total || '\u221E'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto px-8 py-6 bg-black/20 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-[var(--theme-text-muted)]">
                        PRIORITY {promo.priority}
                    </span>
                    {promo.is_stackable && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
                            STACKABLE
                        </span>
                    )}
                </div>

                <div className="flex gap-1.5">
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[var(--theme-text-secondary)] transition-all hover:bg-white/10 hover:text-[var(--color-gold)]"
                        onClick={() => onView(promo.id)}
                        title="View"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[var(--theme-text-secondary)] transition-all hover:bg-white/10 hover:text-[var(--color-gold)]"
                        onClick={() => onEdit(promo.id)}
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={cn(
                            "w-9 h-9 flex items-center justify-center rounded-lg border transition-all",
                            promo.is_active
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                                : "bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                        )}
                        onClick={onToggleActive}
                        title={promo.is_active ? 'Deactivate' : 'Activate'}
                    >
                        <CheckCircle size={16} />
                    </button>
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 transition-all hover:bg-red-500 hover:text-white"
                        onClick={() => onDelete(promo.id)}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
