import { Edit, Trash2, Percent, Building2, Crown, Users, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryCardProps {
    category: {
        id: string
        name: string
        slug: string
        description?: string | null
        color: string
        price_modifier_type: string
        discount_percentage?: number | null
        is_active: boolean
    }
    onEdit: () => void
    onDelete: () => void
}

function getCategoryIcon(slug: string) {
    switch (slug) {
        case 'wholesale': return <Building2 size={20} />
        case 'vip': return <Crown size={20} />
        case 'staff': return <UserCheck size={20} />
        default: return <Users size={20} />
    }
}

function getPricingLabel(type: string) {
    const map: Record<string, string> = {
        retail: 'Standard Price',
        wholesale: 'Wholesale Price',
        discount_percentage: 'Discount %',
        custom: 'Custom Price',
    }
    return map[type] || type
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
    return (
        <div
            className={cn(
                'bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 transition-all hover:border-[var(--color-gold)]/30 hover:shadow-[0_4px_24px_rgba(202,176,109,0.08)]',
                !category.is_active && 'opacity-50'
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                >
                    {getCategoryIcon(category.slug)}
                </div>
                <div className="flex gap-1">
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[var(--muted-smoke)] hover:bg-[var(--color-gold)] hover:text-black hover:border-[var(--color-gold)] transition-all"
                        onClick={onEdit}
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[var(--muted-smoke)] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all"
                        onClick={onDelete}
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <h3 className="m-0 mb-1 text-lg font-bold text-white">{category.name}</h3>
            <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg font-mono text-[10px] text-[var(--muted-smoke)] mb-3">
                {category.slug}
            </span>

            {category.description && (
                <p className="m-0 mb-4 text-sm text-[var(--muted-smoke)] leading-relaxed">{category.description}</p>
            )}

            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl mb-4">
                <span className="block text-sm font-bold text-[var(--stone-text)]">{getPricingLabel(category.price_modifier_type)}</span>
                {category.price_modifier_type === 'discount_percentage' && category.discount_percentage && (
                    <span className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-bold">
                        <Percent size={12} />
                        {category.discount_percentage}% discount
                    </span>
                )}
            </div>

            <div className="flex justify-end">
                <span className={cn(
                    'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                    category.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                )}>
                    {category.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
        </div>
    )
}
