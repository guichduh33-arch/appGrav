import { Save, X, DollarSign, Building2, Percent, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryFormData {
    name: string
    slug: string
    description: string
    color: string
    price_modifier_type: 'retail' | 'wholesale' | 'discount_percentage' | 'custom'
    discount_percentage: number
    is_active: boolean
}

interface CategoryFormModalProps {
    isEditing: boolean
    formData: CategoryFormData
    onChange: (data: CategoryFormData) => void
    saving: boolean
    onSubmit: () => void
    onClose: () => void
}

const PRICING_TYPES = [
    { value: 'retail', label: 'Standard Price', icon: <DollarSign size={14} />, desc: 'Normal selling price' },
    { value: 'wholesale', label: 'Wholesale Price', icon: <Building2 size={14} />, desc: 'Wholesale price defined on products' },
    { value: 'discount_percentage', label: 'Discount %', icon: <Percent size={14} />, desc: 'Discount on selling price' },
    { value: 'custom', label: 'Custom Price', icon: <Tag size={14} />, desc: 'Price defined by product category' },
]

const COLOR_OPTIONS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1',
]

const inputClass = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none'
const labelClass = 'block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2'

export function CategoryFormModal({
    isEditing, formData, onChange, saving, onSubmit, onClose,
}: CategoryFormModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
            onClick={onClose}
        >
            <div
                className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-display font-bold text-white m-0">
                        {isEditing ? 'Edit Category' : 'New Category'}
                    </h2>
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[var(--muted-smoke)] hover:bg-white/10 transition-all"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                        <div>
                            <label className={labelClass}>Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                                placeholder="Ex: VIP, Wholesale..."
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Code *</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => onChange({ ...formData, slug: e.target.value.toLowerCase() })}
                                placeholder="Ex: vip, wholesale..."
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => onChange({ ...formData, description: e.target.value })}
                            placeholder="Category description..."
                            rows={2}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={cn(
                                        'w-8 h-8 rounded-lg border-2 border-transparent cursor-pointer transition-all hover:scale-110',
                                        formData.color === color && 'border-white shadow-[0_0_0_2px_rgba(255,255,255,0.2)]'
                                    )}
                                    style={{ backgroundColor: color }}
                                    title={`Color ${color}`}
                                    aria-label={`Select color ${color}`}
                                    onClick={() => onChange({ ...formData, color })}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Pricing Type</label>
                        <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                            {PRICING_TYPES.map(pricing => (
                                <div
                                    key={pricing.value}
                                    className={cn(
                                        'flex items-start gap-3 p-3 border border-white/10 rounded-xl cursor-pointer transition-all hover:border-[var(--color-gold)]/50',
                                        formData.price_modifier_type === pricing.value && 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                                    )}
                                    onClick={() => onChange({ ...formData, price_modifier_type: pricing.value as CategoryFormData['price_modifier_type'] })}
                                >
                                    <div className={cn(
                                        'w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[var(--muted-smoke)] shrink-0',
                                        formData.price_modifier_type === pricing.value && 'bg-[var(--color-gold)] text-black'
                                    )}>
                                        {pricing.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-sm font-bold text-white">{pricing.label}</span>
                                        <span className="block text-[10px] text-[var(--theme-text-muted)] mt-0.5">{pricing.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {formData.price_modifier_type === 'discount_percentage' && (
                        <div>
                            <label className={labelClass}>Discount percentage</label>
                            <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
                                <input
                                    type="number"
                                    aria-label="Discount percentage"
                                    value={formData.discount_percentage}
                                    onChange={(e) => onChange({ ...formData, discount_percentage: Number(e.target.value) })}
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="flex-1 bg-black/40 border-none px-4 py-3 text-white text-sm outline-none"
                                />
                                <span className="px-4 bg-white/5 text-[var(--muted-smoke)] font-bold text-sm h-full flex items-center py-3 border-l border-white/10">%</span>
                            </div>
                        </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer py-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
                            className="w-[18px] h-[18px] accent-[var(--color-gold)] rounded"
                        />
                        <span className="text-sm text-white font-medium">Active category</span>
                    </label>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-white/5">
                    <button
                        className="flex-1 py-3 rounded-xl text-sm font-bold bg-transparent border border-white/10 text-white hover:border-white/20 transition-all"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all disabled:opacity-50"
                        onClick={onSubmit}
                        disabled={saving}
                    >
                        <Save size={14} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}
