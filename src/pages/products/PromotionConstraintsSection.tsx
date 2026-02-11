import { Calendar, Clock, Info } from 'lucide-react'
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
        <div className="promo-section">
            <h2 className="promo-section-title">
                <Calendar size={20} />
                Time Constraints
            </h2>

            <div className="promo-row">
                <div className="promo-field">
                    <label className="promo-label">Start date</label>
                    <input
                        type="date"
                        className="promo-input"
                        value={form.start_date}
                        onChange={(e) => updateField('start_date', e.target.value)}
                    />
                </div>
                <div className="promo-field">
                    <label className="promo-label">End date</label>
                    <input
                        type="date"
                        className={`promo-input ${errors.end_date ? 'error' : ''}`}
                        value={form.end_date}
                        onChange={(e) => updateField('end_date', e.target.value)}
                    />
                    {errors.end_date && (
                        <span className="promo-error-text"><Info size={12} />{errors.end_date}</span>
                    )}
                </div>
            </div>

            <div className="promo-field">
                <label className="promo-label">Days of the week</label>
                <div className="promo-days-grid">
                    {DAYS_OF_WEEK.map(day => (
                        <button
                            key={day.value}
                            type="button"
                            className={`promo-day-btn ${form.days_of_week.includes(day.value) ? 'active' : ''}`}
                            onClick={() => toggleDay(day.value)}
                            title={day.full}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
                <span className="promo-hint">Leave blank for all days</span>
            </div>

            <div className="promo-row">
                <div className="promo-field">
                    <label className="promo-label">Start time</label>
                    <input
                        type="time"
                        className="promo-input"
                        value={form.time_start}
                        onChange={(e) => updateField('time_start', e.target.value)}
                    />
                </div>
                <div className="promo-field">
                    <label className="promo-label">End time</label>
                    <input
                        type="time"
                        className="promo-input"
                        value={form.time_end}
                        onChange={(e) => updateField('time_end', e.target.value)}
                    />
                </div>
            </div>

            <h2 className="promo-section-title" style={{ marginTop: '2rem' }}>
                <Clock size={20} />
                Usage Limits
            </h2>

            <div className="promo-field">
                <label className="promo-label">Minimum purchase (IDR)</label>
                <input
                    type="number"
                    className="promo-input"
                    value={form.min_purchase_amount}
                    onChange={(e) => updateField('min_purchase_amount', Number(e.target.value))}
                    min={0}
                    step={1000}
                />
            </div>

            <div className="promo-row">
                <div className="promo-field">
                    <label className="promo-label">Max uses (total)</label>
                    <input
                        type="number"
                        className="promo-input"
                        value={form.max_uses_total || ''}
                        onChange={(e) => updateField('max_uses_total', e.target.value ? Number(e.target.value) : null)}
                        min={0}
                        placeholder="Unlimited"
                    />
                </div>
                <div className="promo-field">
                    <label className="promo-label">Max per customer</label>
                    <input
                        type="number"
                        className="promo-input"
                        value={form.max_uses_per_customer || ''}
                        onChange={(e) => updateField('max_uses_per_customer', e.target.value ? Number(e.target.value) : null)}
                        min={0}
                        placeholder="Unlimited"
                    />
                </div>
            </div>

            <div className="promo-field">
                <label className="promo-label">Priority</label>
                <input
                    type="number"
                    className="promo-input"
                    value={form.priority}
                    onChange={(e) => updateField('priority', Number(e.target.value))}
                    min={0}
                />
                <span className="promo-hint">Higher priority promotions apply first</span>
            </div>

            {/* Toggles */}
            <div
                className={`promo-toggle ${form.is_stackable ? 'active' : ''}`}
                onClick={() => updateField('is_stackable', !form.is_stackable)}
            >
                <div className="promo-toggle-track">
                    <div className="promo-toggle-thumb" />
                </div>
                <div>
                    <div className="promo-toggle-label">Stackable</div>
                    <div className="promo-toggle-desc">Can be combined with other promotions</div>
                </div>
            </div>

            <div
                className={`promo-toggle ${form.is_active ? 'active' : ''}`}
                onClick={() => updateField('is_active', !form.is_active)}
            >
                <div className="promo-toggle-track">
                    <div className="promo-toggle-thumb" />
                </div>
                <div>
                    <div className="promo-toggle-label">Active</div>
                    <div className="promo-toggle-desc">Promotion is available for customers</div>
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
                style={{ marginTop: '1.5rem' }}
            />
        </div>
    )
}
