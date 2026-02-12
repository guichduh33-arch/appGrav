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
        <div className="relative bg-flour border border-parchment rounded-xl p-8 shadow-[0_2px_8px_rgba(45,42,36,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-gold before:via-gold-dark before:to-gold before:rounded-t-xl animate-sh-slide-up [animation-delay:0.2s] max-md:p-6">
            <h2 className="font-display text-xl font-semibold text-charcoal mb-7 pb-4 border-b border-dashed border-parchment flex items-center gap-3">
                <Calendar size={20} className="text-gold-dark" />
                Time Constraints
            </h2>

            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <div className="mb-6">
                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                        Start date
                    </label>
                    <input
                        type="date"
                        className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
                        value={form.start_date}
                        onChange={(e) => updateField('start_date', e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                        End date
                    </label>
                    <input
                        type="date"
                        className={cn(
                            'w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]',
                            errors.end_date && 'border-danger bg-[rgba(181,68,43,0.03)]'
                        )}
                        value={form.end_date}
                        onChange={(e) => updateField('end_date', e.target.value)}
                    />
                    {errors.end_date && (
                        <span className="text-xs text-danger mt-1.5 flex items-center gap-1">
                            <Info size={12} />{errors.end_date}
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                    Days of the week
                </label>
                <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                        <button
                            key={day.value}
                            type="button"
                            className={cn(
                                'flex-none px-4 py-2.5 font-body text-xs font-semibold text-smoke bg-cream border-[1.5px] border-parchment rounded-full cursor-pointer transition-all duration-fast uppercase tracking-wider',
                                'hover:border-gold hover:text-gold-dark',
                                form.days_of_week.includes(day.value) && 'bg-gold border-gold text-white shadow-[0_2px_8px_rgba(201,165,92,0.35)]'
                            )}
                            onClick={() => toggleDay(day.value)}
                            title={day.full}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-smoke mt-1.5 italic block">Leave blank for all days</span>
            </div>

            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <div className="mb-6">
                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                        Start time
                    </label>
                    <input
                        type="time"
                        className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
                        value={form.time_start}
                        onChange={(e) => updateField('time_start', e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                        End time
                    </label>
                    <input
                        type="time"
                        className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
                        value={form.time_end}
                        onChange={(e) => updateField('time_end', e.target.value)}
                    />
                </div>
            </div>

            <h2 className="font-display text-xl font-semibold text-charcoal mb-7 pb-4 border-b border-dashed border-parchment flex items-center gap-3 mt-8">
                <Clock size={20} className="text-gold-dark" />
                Usage Limits
            </h2>

            <div className="mb-6">
                <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                    Minimum purchase (IDR)
                </label>
                <input
                    type="number"
                    className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
                    value={form.min_purchase_amount}
                    onChange={(e) => updateField('min_purchase_amount', Number(e.target.value))}
                    min={0}
                    step={1000}
                />
            </div>

            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <div className="mb-6">
                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                        Max uses (total)
                    </label>
                    <input
                        type="number"
                        className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-smoke/60 placeholder:italic focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
                        value={form.max_uses_total || ''}
                        onChange={(e) => updateField('max_uses_total', e.target.value ? Number(e.target.value) : null)}
                        min={0}
                        placeholder="Unlimited"
                    />
                </div>
                <div className="mb-6">
                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                        Max per customer
                    </label>
                    <input
                        type="number"
                        className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-smoke/60 placeholder:italic focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
                        value={form.max_uses_per_customer || ''}
                        onChange={(e) => updateField('max_uses_per_customer', e.target.value ? Number(e.target.value) : null)}
                        min={0}
                        placeholder="Unlimited"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                    Priority
                </label>
                <input
                    type="number"
                    className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
                    value={form.priority}
                    onChange={(e) => updateField('priority', Number(e.target.value))}
                    min={0}
                />
                <span className="text-xs text-smoke mt-1.5 italic block">Higher priority promotions apply first</span>
            </div>

            {/* Toggles */}
            <div
                className="flex items-center gap-3 cursor-pointer py-3"
                onClick={() => updateField('is_stackable', !form.is_stackable)}
            >
                <div className={cn(
                    'relative w-12 h-[26px] rounded-[13px] transition-all duration-300 border border-transparent',
                    form.is_stackable ? 'bg-gold border-gold-dark' : 'bg-parchment'
                )}>
                    <div className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        form.is_stackable && 'translate-x-[22px]'
                    )} />
                </div>
                <div>
                    <div className="font-body text-sm font-medium text-espresso">Stackable</div>
                    <div className="text-xs text-smoke">Can be combined with other promotions</div>
                </div>
            </div>

            <div
                className="flex items-center gap-3 cursor-pointer py-3"
                onClick={() => updateField('is_active', !form.is_active)}
            >
                <div className={cn(
                    'relative w-12 h-[26px] rounded-[13px] transition-all duration-300 border border-transparent',
                    form.is_active ? 'bg-gold border-gold-dark' : 'bg-parchment'
                )}>
                    <div className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        form.is_active && 'translate-x-[22px]'
                    )} />
                </div>
                <div>
                    <div className="font-body text-sm font-medium text-espresso">Active</div>
                    <div className="text-xs text-smoke">Promotion is available for customers</div>
                </div>
            </div>

            {/* Applicable Products */}
            <PromotionProductSearch
                title="Applicable products"
                subtitle="Leave blank for all products"
                emptyText="All products are eligible"
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
    )
}
