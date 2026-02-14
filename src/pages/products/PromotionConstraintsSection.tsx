import { Calendar, Clock, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '../../types/database'
import { PromotionFormData, DAYS_OF_WEEK } from './promotionFormConstants'
import PromotionProductSearch from './PromotionProductSearch'

interface PromotionConstraintsSectionProps {
    form: PromotionFormData
    errors: Partial<Record<keyof PromotionFormData, string>>
    selectedProducts: Product[]
    filteredProducts: Product[]
    showProductSearch: 'applicable' | 'free' | null
    searchTerm: string
    updateField: <K extends keyof PromotionFormData>(field: K, value: PromotionFormData[K]) => void
    toggleDay: (day: number) => void
    setShowProductSearch: (value: 'applicable' | 'free' | null) => void
    setSearchTerm: (term: string) => void
    addProduct: (product: Product, type: 'applicable' | 'free') => void
    removeProduct: (productId: string, type: 'applicable' | 'free') => void
}

const INPUT_CLASS = "w-full py-4 px-5 text-white bg-black/40 border border-white/10 rounded-xl transition-all focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
const LABEL_CLASS = "block text-[10px] font-bold text-[var(--theme-text-muted)] mb-2 uppercase tracking-[0.2em]"

export default function PromotionConstraintsSection({
    form, errors, selectedProducts, filteredProducts, showProductSearch,
    searchTerm, updateField, toggleDay, setShowProductSearch, setSearchTerm,
    addProduct, removeProduct
}: PromotionConstraintsSectionProps) {
    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-2xl p-8 shadow-sm relative overflow-hidden max-md:p-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/60" />

            <h2 className="font-display text-2xl font-semibold text-white mb-8 pb-4 border-b border-dashed border-white/10 flex items-center gap-3">
                <Calendar size={24} className="text-[var(--color-gold)]" />
                Schedule & Constraints
            </h2>

            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                <div className="mb-6">
                    <label htmlFor="start_date" className={LABEL_CLASS}>Start Date</label>
                    <input id="start_date" type="date" className={INPUT_CLASS}
                        value={form.start_date} onChange={(e) => updateField('start_date', e.target.value)} />
                </div>
                <div className="mb-6">
                    <label htmlFor="end_date" className={LABEL_CLASS}>End Date</label>
                    <input id="end_date" type="date"
                        className={cn(INPUT_CLASS, errors.end_date && 'border-red-500/50')}
                        value={form.end_date} onChange={(e) => updateField('end_date', e.target.value)} />
                    {errors.end_date && (
                        <span className="text-xs text-red-400 mt-2 flex items-center gap-1.5 font-medium">
                            <Info size={14} />{errors.end_date}
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-8 p-6 bg-black/20 rounded-xl border border-white/5">
                <label className={LABEL_CLASS}>Active Days</label>
                <div className="flex flex-wrap gap-2.5 mt-2">
                    {DAYS_OF_WEEK.map(day => {
                        const active = form.days_of_week.includes(day.value)
                        return (
                            <button
                                key={day.value} type="button"
                                className={cn(
                                    'px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border',
                                    active
                                        ? 'bg-[var(--color-gold)] border-transparent text-black shadow-[0_4px_12px_rgba(201,165,92,0.3)]'
                                        : 'bg-white/[0.02] border-white/10 text-[var(--theme-text-secondary)] hover:border-white/20'
                                )}
                                onClick={() => toggleDay(day.value)}
                                title={day.full}
                            >
                                {day.label}
                            </button>
                        )
                    })}
                </div>
                <span className="text-[10px] text-[var(--theme-text-muted)] mt-4 block italic">
                    * If none selected, the promotion applies every day.
                </span>
            </div>

            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-8">
                <div>
                    <label htmlFor="time_start" className={LABEL_CLASS}>Start Time</label>
                    <input id="time_start" type="time" className={INPUT_CLASS}
                        value={form.time_start} onChange={(e) => updateField('time_start', e.target.value)} />
                </div>
                <div>
                    <label htmlFor="time_end" className={LABEL_CLASS}>End Time</label>
                    <input id="time_end" type="time" className={INPUT_CLASS}
                        value={form.time_end} onChange={(e) => updateField('time_end', e.target.value)} />
                </div>
            </div>

            <h2 className="font-display text-2xl font-semibold text-white mb-8 pb-4 border-b border-dashed border-white/10 flex items-center gap-3 mt-12">
                <Clock size={24} className="text-[var(--color-gold)]" />
                Limits
            </h2>

            <div className="space-y-6">
                <div className="p-6 bg-black/20 rounded-xl border border-white/5">
                    <label htmlFor="min_purchase" className={LABEL_CLASS}>Minimum Purchase</label>
                    <input id="min_purchase" type="number" className={INPUT_CLASS}
                        value={form.min_purchase_amount} onChange={(e) => updateField('min_purchase_amount', Number(e.target.value))}
                        min={0} step={1000} />
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                    <div className="p-6 bg-black/20 rounded-xl border border-white/5">
                        <label htmlFor="max_uses_total" className={LABEL_CLASS}>Total Redemptions</label>
                        <input id="max_uses_total" type="number" className={cn(INPUT_CLASS, "placeholder:text-[var(--theme-text-muted)]")}
                            value={form.max_uses_total || ''} onChange={(e) => updateField('max_uses_total', e.target.value ? Number(e.target.value) : null)}
                            min={0} placeholder="Unlimited" />
                    </div>
                    <div className="p-6 bg-black/20 rounded-xl border border-white/5">
                        <label htmlFor="max_uses_per_customer" className={LABEL_CLASS}>Per Customer Limit</label>
                        <input id="max_uses_per_customer" type="number" className={cn(INPUT_CLASS, "placeholder:text-[var(--theme-text-muted)]")}
                            value={form.max_uses_per_customer || ''} onChange={(e) => updateField('max_uses_per_customer', e.target.value ? Number(e.target.value) : null)}
                            min={0} placeholder="Unlimited" />
                    </div>
                </div>

                <div className="p-6 bg-black/20 rounded-xl border border-white/5">
                    <label htmlFor="priority" className={LABEL_CLASS}>Priority</label>
                    <input id="priority" type="number" className={INPUT_CLASS}
                        value={form.priority} onChange={(e) => updateField('priority', Number(e.target.value))} min={0} />
                </div>
            </div>

            {/* Toggles */}
            <div className="mt-8 space-y-4">
                <div
                    className="flex items-center justify-between p-6 bg-black/20 rounded-xl border border-white/5 cursor-pointer transition-all hover:border-white/10"
                    onClick={() => updateField('is_stackable', !form.is_stackable)}
                >
                    <div className="flex flex-col gap-1">
                        <div className="font-display text-base font-semibold text-white">Stackable</div>
                        <div className="text-xs text-[var(--theme-text-muted)] italic">Can be combined with other promotions</div>
                    </div>
                    <div className={cn(
                        'relative w-14 h-8 rounded-full transition-all border',
                        form.is_stackable ? 'bg-[var(--color-gold)] border-[var(--color-gold)]' : 'bg-white/5 border-white/10'
                    )}>
                        <div className={cn(
                            'absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all',
                            form.is_stackable && 'translate-x-6'
                        )} />
                    </div>
                </div>

                <div
                    className="flex items-center justify-between p-6 bg-black/20 rounded-xl border border-white/5 cursor-pointer transition-all hover:border-white/10"
                    onClick={() => updateField('is_active', !form.is_active)}
                >
                    <div className="flex flex-col gap-1">
                        <div className="font-display text-base font-semibold text-white">Active</div>
                        <div className="text-xs text-[var(--theme-text-muted)] italic">Promotion is live and available</div>
                    </div>
                    <div className={cn(
                        'relative w-14 h-8 rounded-full transition-all border',
                        form.is_active ? 'bg-[var(--color-gold)] border-[var(--color-gold)]' : 'bg-white/5 border-white/10'
                    )}>
                        <div className={cn(
                            'absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all',
                            form.is_active && 'translate-x-6'
                        )} />
                    </div>
                </div>
            </div>

            {/* Applicable Products */}
            <div className="mt-8">
                <PromotionProductSearch
                    title="Applicable Products" subtitle="Leave empty to apply to all products"
                    emptyText="All products are eligible." type="applicable"
                    selectedProducts={selectedProducts} filteredProducts={filteredProducts}
                    showSearch={showProductSearch === 'applicable'} searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm} onOpenSearch={() => setShowProductSearch('applicable')}
                    onAddProduct={addProduct} onRemoveProduct={removeProduct}
                />
            </div>
        </div>
    )
}
