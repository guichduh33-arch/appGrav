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

export default function PromotionConstraintsSection({
    form,
    errors,
    selectedProducts,
    filteredProducts,
    showProductSearch,
    searchTerm,
    updateField,
    toggleDay,
    setShowProductSearch,
    setSearchTerm,
    addProduct,
    removeProduct
}: PromotionConstraintsSectionProps) {
    return (
        <div className="relative bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-sh-slide-up [animation-delay:0.2s] max-md:p-6 overflow-hidden">
            {/* Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold-dark)] to-[var(--color-gold)]" />

            <h2 className="font-display text-2xl font-semibold text-[var(--theme-text-primary)] mb-8 pb-4 border-b border-dashed border-[var(--theme-border)] flex items-center gap-3">
                <Calendar size={24} className="text-[var(--color-gold)]" />
                Artisan Timeline
            </h2>

            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                <div className="mb-6">
                    <label htmlFor="start_date" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                        Inception Date
                    </label>
                    <input
                        id="start_date"
                        type="date"
                        className="w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]"
                        value={form.start_date}
                        onChange={(e) => updateField('start_date', e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="end_date" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                        Expiration Date
                    </label>
                    <input
                        id="end_date"
                        type="date"
                        className={cn(
                            'w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]',
                            errors.end_date && 'border-red-500/50 bg-red-500/5'
                        )}
                        value={form.end_date}
                        onChange={(e) => updateField('end_date', e.target.value)}
                    />
                    {errors.end_date && (
                        <span className="text-xs text-red-500 mt-2 flex items-center gap-1.5 font-medium">
                            <Info size={14} />{errors.end_date}
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-8 p-6 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)]">
                <label className="block font-body text-xs font-bold text-[var(--color-gold)] mb-4 uppercase tracking-widest opacity-70">
                    Artisan Schedule
                </label>
                <div className="flex flex-wrap gap-2.5">
                    {DAYS_OF_WEEK.map(day => {
                        const active = form.days_of_week.includes(day.value)
                        return (
                            <button
                                key={day.value}
                                type="button"
                                className={cn(
                                    'px-5 py-2 rounded-full font-body text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border shadow-sm',
                                    active
                                        ? 'bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)] border-transparent text-white shadow-[0_4px_12px_rgba(201,165,92,0.3)] scale-105'
                                        : 'bg-[var(--theme-bg-secondary)] border-[var(--theme-border)] text-[var(--theme-text-secondary)] opacity-60 hover:opacity-100 hover:border-[var(--color-gold-muted)]'
                                )}
                                onClick={() => toggleDay(day.value)}
                                title={day.full}
                            >
                                {day.label}
                            </button>
                        )
                    })}
                </div>
                <span className="text-[10px] text-[var(--theme-text-secondary)] mt-4 block italic opacity-30">
                    * If none selected, the promotion will grace every day of the week.
                </span>
            </div>

            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-8">
                <div>
                    <label htmlFor="time_start" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                        Daily Commencement
                    </label>
                    <input
                        id="time_start"
                        type="time"
                        className="w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]"
                        value={form.time_start}
                        onChange={(e) => updateField('time_start', e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="time_end" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                        Daily Conclusion
                    </label>
                    <input
                        id="time_end"
                        type="time"
                        className="w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]"
                        value={form.time_end}
                        onChange={(e) => updateField('time_end', e.target.value)}
                    />
                </div>
            </div>

            <h2 className="font-display text-2xl font-semibold text-[var(--theme-text-primary)] mb-8 pb-4 border-b border-dashed border-[var(--theme-border)] flex items-center gap-3 mt-12">
                <Clock size={24} className="text-[var(--color-gold)]" />
                Exclusivity & Limits
            </h2>

            <div className="space-y-6">
                <div className="p-6 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)]">
                    <label htmlFor="min_purchase" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                        Threshold for Indulgence (Min Purchase)
                    </label>
                    <input
                        id="min_purchase"
                        type="number"
                        className="w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]"
                        value={form.min_purchase_amount}
                        onChange={(e) => updateField('min_purchase_amount', Number(e.target.value))}
                        min={0}
                        step={1000}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                    <div className="p-6 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)]">
                        <label htmlFor="max_uses_total" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                            Total Redemptions
                        </label>
                        <input
                            id="max_uses_total"
                            type="number"
                            className="w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] placeholder:opacity-20"
                            value={form.max_uses_total || ''}
                            onChange={(e) => updateField('max_uses_total', e.target.value ? Number(e.target.value) : null)}
                            min={0}
                            placeholder="Infinite"
                        />
                    </div>
                    <div className="p-6 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)]">
                        <label htmlFor="max_uses_per_customer" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                            Per Patron Limit
                        </label>
                        <input
                            id="max_uses_per_customer"
                            type="number"
                            className="w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] placeholder:opacity-20"
                            value={form.max_uses_per_customer || ''}
                            onChange={(e) => updateField('max_uses_per_customer', e.target.value ? Number(e.target.value) : null)}
                            min={0}
                            placeholder="Infinite"
                        />
                    </div>
                </div>

                <div className="p-6 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)]">
                    <label htmlFor="priority" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-2 uppercase tracking-widest opacity-70">
                        Curation Priority
                    </label>
                    <input
                        id="priority"
                        type="number"
                        className="w-full py-4 px-5 font-body text-[0.95rem] text-[var(--theme-text-primary)] bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]"
                        value={form.priority}
                        onChange={(e) => updateField('priority', Number(e.target.value))}
                        min={0}
                    />
                </div>
            </div>

            {/* Toggles */}
            <div className="mt-8 space-y-4">
                <div
                    className="flex items-center justify-between p-6 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)] cursor-pointer transition-all duration-300 hover:border-[var(--color-gold-muted)]"
                    onClick={() => updateField('is_stackable', !form.is_stackable)}
                >
                    <div className="flex flex-col gap-1">
                        <div className="font-display text-base font-semibold text-[var(--theme-text-primary)]">Layered Privileges</div>
                        <div className="text-xs text-[var(--theme-text-secondary)] opacity-50 italic">Can be harmonized with other collections</div>
                    </div>
                    <div className={cn(
                        'relative w-14 h-8 rounded-full transition-all duration-500 border shadow-inner',
                        form.is_stackable ? 'bg-[var(--color-gold)] border-[var(--color-gold-dark)]' : 'bg-[var(--theme-bg-secondary)] border-[var(--theme-border)]'
                    )}>
                        <div className={cn(
                            'absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                            form.is_stackable && 'translate-x-6'
                        )} />
                    </div>
                </div>

                <div
                    className="flex items-center justify-between p-6 bg-[var(--theme-bg-tertiary)] rounded-2xl border border-[var(--theme-border)] cursor-pointer transition-all duration-300 hover:border-[var(--color-gold-muted)]"
                    onClick={() => updateField('is_active', !form.is_active)}
                >
                    <div className="flex flex-col gap-1">
                        <div className="font-display text-base font-semibold text-[var(--theme-text-primary)]">Public Presence</div>
                        <div className="text-xs text-[var(--theme-text-secondary)] opacity-50 italic">The promotion is live and gracing the establishment</div>
                    </div>
                    <div className={cn(
                        'relative w-14 h-8 rounded-full transition-all duration-500 border shadow-inner',
                        form.is_active ? 'bg-[var(--color-gold)] border-[var(--color-gold-dark)]' : 'bg-[var(--theme-bg-secondary)] border-[var(--theme-border)]'
                    )}>
                        <div className={cn(
                            'absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                            form.is_active && 'translate-x-6'
                        )} />
                    </div>
                </div>
            </div>

            {/* Applicable Products */}
            <div className="mt-8">
                <PromotionProductSearch
                    title="Artisan Collection Coverage"
                    subtitle="Leave empty to embrace the entire repertoire"
                    emptyText="The entire artisanal catalog is eligible."
                    type="applicable"
                    selectedProducts={selectedProducts}
                    filteredProducts={filteredProducts}
                    showSearch={showProductSearch === 'applicable'}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    onOpenSearch={() => setShowProductSearch('applicable')}
                    onAddProduct={addProduct}
                    onRemoveProduct={removeProduct}
                />
            </div>
        </div>
    )
}
