import { Box, Eye, Edit, Trash2, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'

interface ComboCardProduct {
    name?: string | null
    retail_price?: number | null
}

interface ComboCardItem {
    product?: ComboCardProduct
    price_adjustment: number | null
    is_default: boolean | null
}

interface ComboCardGroup {
    name: string | null
    is_required: boolean | null
    items: ComboCardItem[]
}

interface ComboCardData {
    id: string
    name: string
    description?: string | null
    image_url?: string | null
    is_active: boolean | null
    available_at_pos: boolean
    combo_price: number
    groups: ComboCardGroup[]
}

interface ComboCardProps {
    combo: ComboCardData
    minPrice: number
    maxPrice: number
    regularPrice: number
    savings: number
    savingsPercentage: string | number
    onView: (id: string) => void
    onEdit: (id: string) => void
    onToggleActive: () => void
    onDelete: (id: string) => void
}

export default function ComboCard({
    combo,
    minPrice,
    maxPrice,
    regularPrice,
    savings,
    savingsPercentage,
    onView,
    onEdit,
    onToggleActive,
    onDelete
}: ComboCardProps) {
    return (
        <div
            className={cn(
                "bg-[var(--onyx-surface)] rounded-2xl border border-white/5 overflow-hidden cursor-pointer transition-all duration-[350ms] group relative shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-white/10",
                !combo.is_active && 'opacity-60 grayscale-[0.3]'
            )}
            onClick={() => onEdit(combo.id)}
        >
            {combo.image_url ? (
                <div className="w-full h-56 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--onyx-surface)] via-transparent to-transparent z-10" />
                    <img
                        src={combo.image_url}
                        alt={combo.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {!combo.is_active && (
                        <div className="absolute top-4 left-4 z-20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[0.7rem] uppercase tracking-widest font-bold">
                            Inactive Set
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full h-48 bg-[var(--theme-bg-tertiary)] flex items-center justify-center relative">
                    <Box size={48} className="text-[var(--theme-text-muted)] opacity-20" />
                    {!combo.is_active && (
                        <div className="absolute top-4 left-4 z-20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[0.7rem] uppercase tracking-widest font-bold">
                            Inactive Set
                        </div>
                    )}
                </div>
            )}

            <div className="p-7 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-display text-2xl font-bold text-white transition-colors group-hover:text-[var(--color-gold)]">{combo.name}</h3>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[0.65rem] uppercase tracking-widest font-bold border",
                        combo.available_at_pos
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}>
                        {combo.available_at_pos ? 'POS Visible' : 'POS Hidden'}
                    </div>
                </div>

                {combo.description && (
                    <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed line-clamp-2 opacity-80">{combo.description}</p>
                )}

                <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                    <h4 className="font-body text-[0.7rem] uppercase tracking-widest font-bold text-[var(--theme-text-muted)] mb-4 flex items-center gap-2">
                        <Package size={14} className="text-[var(--color-gold)]" /> Selections
                    </h4>
                    {combo.groups.length === 0 ? (
                        <p className="text-[var(--theme-text-muted)] text-xs italic">No selection groups configured yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {combo.groups.map((group, groupIdx) => (
                                <div key={groupIdx} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <strong className="text-sm font-semibold text-white">{group.name}</strong>
                                        {!group.is_required && (
                                            <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[var(--theme-text-muted)]">Optional</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {group.items.slice(0, 3).map((item, itemIdx) => (
                                            <div
                                                key={itemIdx}
                                                className={cn(
                                                    "text-[0.65rem] px-2.5 py-1.5 rounded-lg border flex items-center gap-2 transition-all",
                                                    item.is_default
                                                        ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[var(--color-gold)] font-bold"
                                                        : "bg-white/5 border-white/10 text-[var(--theme-text-secondary)]"
                                                )}
                                            >
                                                <span className="truncate max-w-[100px]">{item.product?.name || 'Selection'}</span>
                                                {(item.price_adjustment ?? 0) !== 0 && (
                                                    <span className="font-bold opacity-80">
                                                        {(item.price_adjustment ?? 0) > 0 ? '+' : ''}{Math.abs(item.price_adjustment ?? 0) < 1000 ? item.price_adjustment : formatCurrency(item.price_adjustment ?? 0)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {group.items.length > 3 && (
                                            <div className="text-[0.65rem] px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[var(--theme-text-muted)]">
                                                +{group.items.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-6 border-t border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            {regularPrice > 0 && (
                                <div className="flex items-center gap-2 opacity-40">
                                    <span className="text-[0.65rem] uppercase tracking-wider font-bold">Value price:</span>
                                    <span className="text-sm line-through font-medium">{formatCurrency(regularPrice)}</span>
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--theme-text-muted)] mb-1">Bundle Set Price</span>
                                <span className="text-3xl font-display font-bold text-[var(--color-gold)]">
                                    {minPrice === maxPrice ? (
                                        formatCurrency(minPrice)
                                    ) : (
                                        <span className="text-2xl">
                                            {formatCurrency(minPrice)} <span className="text-sm opacity-50 px-1 font-body">to</span> {formatCurrency(maxPrice)}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {savings > 0 && (
                            <div className="bg-[var(--color-gold)] text-black px-4 py-2 rounded-xl flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(201,165,92,0.3)]">
                                <span className="text-[0.6rem] uppercase tracking-wider font-bold leading-none mb-0.5">Save</span>
                                <span className="text-sm font-bold leading-none">{savingsPercentage}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 z-30">
                <button
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-[var(--color-gold)] hover:text-black hover:scale-110 shadow-lg"
                    onClick={(e) => { e.stopPropagation(); onView(combo.id) }}
                    title="View set collection"
                >
                    <Eye size={18} />
                </button>
                <button
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-[var(--color-gold)] hover:text-black hover:scale-110 shadow-lg"
                    onClick={(e) => { e.stopPropagation(); onEdit(combo.id) }}
                    title="Edit set"
                >
                    <Edit size={18} />
                </button>
                <button
                    className={cn(
                        "w-10 h-10 rounded-full backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg",
                        combo.is_active ? "bg-white/10 hover:bg-amber-500" : "bg-emerald-500/80 hover:bg-emerald-600"
                    )}
                    onClick={(e) => { e.stopPropagation(); onToggleActive() }}
                    title={combo.is_active ? 'Archive Set' : 'Activate Set'}
                >
                    <Package size={18} />
                </button>
                <button
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-red-500 hover:scale-110 shadow-lg"
                    onClick={(e) => { e.stopPropagation(); onDelete(combo.id) }}
                    title="Delete combo"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    )
}
