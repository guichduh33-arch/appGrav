import { ArrowLeft, Save, Tag, Sparkles, Info } from 'lucide-react'
import { PROMOTION_TYPES } from './promotionFormConstants'
import { usePromotionForm } from './usePromotionForm'
import PromotionProductSearch from './PromotionProductSearch'
import PromotionConstraintsSection from './PromotionConstraintsSection'
import './PromotionFormPage.css'

export default function PromotionFormPage() {
    const {
        isEditing,
        loading,
        saving,
        form,
        errors,
        selectedProducts,
        freeProducts,
        showProductSearch,
        searchTerm,
        filteredProducts,
        navigate,
        updateField,
        toggleDay,
        addProduct,
        removeProduct,
        setShowProductSearch,
        setSearchTerm,
        handleSubmit,
        getPreviewValue
    } = usePromotionForm()

    if (loading) {
        return (
            <div className="promo-form-page">
                <div className="promo-loading">
                    <div className="promo-loading-spinner" />
                    <span className="promo-loading-text">Loading promotion...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="promo-form-page">
            {/* Header */}
            <header className="promo-form-header">
                <button
                    type="button"
                    className="btn-back-promo"
                    onClick={() => navigate('/products/promotions')}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <div className="promo-form-title">
                    <h1>
                        <Sparkles size={28} />
                        {isEditing ? 'Edit Promotion' : 'New Promotion'}
                    </h1>
                    <span>Create irresistible offers for your customers</span>
                </div>
            </header>

            {/* Form Container */}
            <div className="promo-form-container">
                <form onSubmit={handleSubmit} className="promo-form">
                    {/* Left Column - Basic Info */}
                    <div className="promo-section">
                        <h2 className="promo-section-title">
                            <Tag size={20} />
                            Basic Information
                        </h2>

                        <div className="promo-field">
                            <label className="promo-label promo-label-required">Promotion code</label>
                            <input
                                type="text"
                                className={`promo-input ${errors.code ? 'error' : ''}`}
                                value={form.code}
                                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                                placeholder="Ex: CROISSANT20"
                                maxLength={20}
                            />
                            {errors.code && <span className="promo-error-text"><Info size={12} />{errors.code}</span>}
                            <span className="promo-hint">Unique code to apply the promotion</span>
                        </div>

                        <div className="promo-field">
                            <label className="promo-label promo-label-required">Offer Name</label>
                            <input
                                type="text"
                                className={`promo-input ${errors.name ? 'error' : ''}`}
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Ex: Baker's Breakfast Special"
                            />
                            {errors.name && <span className="promo-error-text"><Info size={12} />{errors.name}</span>}
                        </div>

                        <div className="promo-field">
                            <label className="promo-label">Description</label>
                            <textarea
                                className="promo-textarea"
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Describe your promotional offer..."
                                rows={3}
                            />
                        </div>

                        {/* Promotion Type Selection */}
                        <div className="promo-field">
                            <label className="promo-label promo-label-required">Promotion type</label>
                            <div className="promo-type-grid">
                                {PROMOTION_TYPES.map(({ type, label, desc, icon: Icon }) => (
                                    <div
                                        key={type}
                                        className={`promo-type-card ${form.promotion_type === type ? 'selected' : ''}`}
                                        onClick={() => updateField('promotion_type', type)}
                                    >
                                        <div className="promo-type-icon">
                                            <Icon size={24} />
                                        </div>
                                        <div className="promo-type-name">{label}</div>
                                        <div className="promo-type-desc">{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conditional Fields based on type */}
                        <div className="promo-conditional">
                            <div className="promo-conditional-title">
                                <Sparkles size={16} />
                                Discount settings
                            </div>

                            {form.promotion_type === 'percentage' && (
                                <div className="promo-field">
                                    <label className="promo-label promo-label-required">Discount percentage</label>
                                    <input
                                        type="number"
                                        className={`promo-input ${errors.discount_percentage ? 'error' : ''}`}
                                        value={form.discount_percentage}
                                        onChange={(e) => updateField('discount_percentage', Number(e.target.value))}
                                        min={1}
                                        max={100}
                                    />
                                    {errors.discount_percentage && (
                                        <span className="promo-error-text"><Info size={12} />{errors.discount_percentage}</span>
                                    )}
                                </div>
                            )}

                            {form.promotion_type === 'fixed_amount' && (
                                <div className="promo-field">
                                    <label className="promo-label promo-label-required">Discount amount (IDR)</label>
                                    <input
                                        type="number"
                                        className={`promo-input ${errors.discount_amount ? 'error' : ''}`}
                                        value={form.discount_amount}
                                        onChange={(e) => updateField('discount_amount', Number(e.target.value))}
                                        min={0}
                                        step={1000}
                                    />
                                    {errors.discount_amount && (
                                        <span className="promo-error-text"><Info size={12} />{errors.discount_amount}</span>
                                    )}
                                </div>
                            )}

                            {form.promotion_type === 'buy_x_get_y' && (
                                <div className="promo-row">
                                    <div className="promo-field">
                                        <label className="promo-label promo-label-required">Buy (X)</label>
                                        <input
                                            type="number"
                                            className={`promo-input ${errors.buy_quantity ? 'error' : ''}`}
                                            value={form.buy_quantity}
                                            onChange={(e) => updateField('buy_quantity', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div className="promo-field">
                                        <label className="promo-label promo-label-required">Get free (Y)</label>
                                        <input
                                            type="number"
                                            className="promo-input"
                                            value={form.get_quantity}
                                            onChange={(e) => updateField('get_quantity', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                </div>
                            )}

                            {form.promotion_type === 'free_product' && (
                                <PromotionProductSearch
                                    title="Free products"
                                    subtitle="Select gifts"
                                    emptyText="No free product selected"
                                    type="free"
                                    selectedProducts={freeProducts}
                                    filteredProducts={filteredProducts}
                                    showSearch={showProductSearch === 'free'}
                                    searchTerm={searchTerm}
                                    onSearchTermChange={setSearchTerm}
                                    onOpenSearch={() => setShowProductSearch('free')}
                                    onAddProduct={addProduct}
                                    onRemoveProduct={removeProduct}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Column - Constraints & Limits */}
                    <PromotionConstraintsSection
                        form={form}
                        errors={errors}
                        selectedProducts={selectedProducts}
                        filteredProducts={filteredProducts}
                        showProductSearch={showProductSearch}
                        searchTerm={searchTerm}
                        updateField={updateField}
                        toggleDay={toggleDay}
                        setShowProductSearch={setShowProductSearch}
                        setSearchTerm={setSearchTerm}
                        addProduct={addProduct}
                        removeProduct={removeProduct}
                    />

                    {/* Preview Section */}
                    {form.name && (
                        <div className="promo-preview-section promo-section">
                            <div className="promo-preview-card">
                                <div className="promo-preview-badge">{form.code || 'CODE'}</div>
                                <div className="promo-preview-value">{getPreviewValue()}</div>
                                <div className="promo-preview-desc">{form.name}</div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="promo-form-actions">
                        <button
                            type="button"
                            className="btn-promo-secondary"
                            onClick={() => navigate('/products/promotions')}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-promo-primary"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="promo-spinner-sm" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {isEditing ? 'Update' : 'Create Promotion'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
