import { ArrowLeft, Save, Tag, Sparkles, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROMOTION_TYPES } from './promotionFormConstants'
import { usePromotionForm } from './usePromotionForm'
import PromotionProductSearch from './PromotionProductSearch'
import PromotionConstraintsSection from './PromotionConstraintsSection'

const GRAIN_TEXTURE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
const HEADER_WAVE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12 Q50 0 100 12 Q150 24 200 12' fill='none' stroke='%23c9a55c' stroke-width='1'/%3E%3C/svg%3E\")"

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
            <div className="relative min-h-screen bg-cream overflow-x-hidden">
                <div
                    className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                    style={{ backgroundImage: GRAIN_TEXTURE }}
                />
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                    <div className="w-12 h-12 border-[3px] border-parchment border-t-gold rounded-full animate-spin" />
                    <span className="font-display text-lg italic text-smoke">Loading promotion...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-cream overflow-x-hidden">
            {/* Grain texture overlay */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{ backgroundImage: GRAIN_TEXTURE }}
            />

            {/* Header */}
            <header className="relative flex items-center gap-8 px-12 py-8 bg-gradient-to-b from-kraft to-cream border-b-2 border-parchment z-[1] max-md:flex-col max-md:items-start max-md:gap-4 max-md:px-6 max-md:py-5 max-lg:px-8 max-lg:py-6">
                {/* Header wave decoration */}
                <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[200px] h-6 bg-no-repeat bg-center opacity-60"
                    style={{ backgroundImage: HEADER_WAVE }}
                />
                <button
                    type="button"
                    className="flex items-center gap-2 px-5 py-3 bg-flour border border-parchment rounded-md text-smoke font-body text-sm font-medium cursor-pointer transition-all duration-normal shadow-sm hover:bg-kraft hover:text-espresso hover:-translate-x-0.5 hover:shadow"
                    onClick={() => navigate('/products/promotions')}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <div className="flex flex-col gap-1">
                    <h1 className="font-display text-4xl font-semibold text-charcoal m-0 tracking-tight flex items-center gap-3 max-md:text-3xl">
                        <Sparkles size={28} className="text-gold" />
                        {isEditing ? 'Edit Promotion' : 'New Promotion'}
                    </h1>
                    <span className="font-display italic text-smoke text-base">
                        Create irresistible offers for your customers
                    </span>
                </div>
            </header>

            {/* Form Container */}
            <div className="relative z-[1] max-w-[1400px] mx-auto px-12 pt-10 pb-16 max-md:px-5 max-lg:px-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_1.2fr] gap-10 max-lg:grid-cols-1">
                    {/* Left Column - Basic Info */}
                    <div className="relative bg-flour border border-parchment rounded-xl p-8 shadow-[0_2px_8px_rgba(45,42,36,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-gold before:via-gold-dark before:to-gold before:rounded-t-xl animate-sh-slide-up [animation-delay:0.1s] max-md:p-6">
                        <h2 className="font-display text-xl font-semibold text-charcoal mb-7 pb-4 border-b border-dashed border-parchment flex items-center gap-3">
                            <Tag size={20} className="text-gold-dark" />
                            Basic Information
                        </h2>

                        <div className="mb-6">
                            <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase after:content-['_*'] after:text-danger">
                                Promotion code
                            </label>
                            <input
                                type="text"
                                className={cn(
                                    'w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-smoke/60 placeholder:italic focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]',
                                    errors.code && 'border-danger bg-[rgba(181,68,43,0.03)]'
                                )}
                                value={form.code}
                                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                                placeholder="Ex: CROISSANT20"
                                maxLength={20}
                            />
                            {errors.code && (
                                <span className="text-xs text-danger mt-1.5 flex items-center gap-1">
                                    <Info size={12} />{errors.code}
                                </span>
                            )}
                            <span className="text-xs text-smoke mt-1.5 italic block">Unique code to apply the promotion</span>
                        </div>

                        <div className="mb-6">
                            <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase after:content-['_*'] after:text-danger">
                                Offer Name
                            </label>
                            <input
                                type="text"
                                className={cn(
                                    'w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-smoke/60 placeholder:italic focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]',
                                    errors.name && 'border-danger bg-[rgba(181,68,43,0.03)]'
                                )}
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Ex: Baker's Breakfast Special"
                            />
                            {errors.name && (
                                <span className="text-xs text-danger mt-1.5 flex items-center gap-1">
                                    <Info size={12} />{errors.name}
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase">
                                Description
                            </label>
                            <textarea
                                className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-smoke/60 placeholder:italic focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)] resize-y min-h-[80px]"
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Describe your promotional offer..."
                                rows={3}
                            />
                        </div>

                        {/* Promotion Type Selection */}
                        <div className="mb-6">
                            <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase after:content-['_*'] after:text-danger">
                                Promotion type
                            </label>
                            <div className="grid grid-cols-2 gap-4 mb-6 max-md:grid-cols-1">
                                {PROMOTION_TYPES.map(({ type, label, desc, icon: Icon }) => (
                                    <div
                                        key={type}
                                        className={cn(
                                            'relative p-5 bg-cream border-2 border-parchment rounded-[10px] cursor-pointer transition-all duration-normal text-center',
                                            'hover:border-gold hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(45,42,36,0.12)]',
                                            form.promotion_type === type && 'border-gold bg-gradient-to-b from-gold/[0.08] to-flour shadow-[0_4px_12px_rgba(45,42,36,0.12),inset_0_0_0_1px_var(--color-gold)]'
                                        )}
                                        onClick={() => updateField('promotion_type', type)}
                                    >
                                        {/* Checkmark badge on selected */}
                                        {form.promotion_type === type && (
                                            <div
                                                className="absolute -top-px -right-px w-6 h-6 bg-gold rounded-[0_8px_0_8px] bg-no-repeat bg-center bg-[length:12px]"
                                                style={{
                                                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\")"
                                                }}
                                            />
                                        )}
                                        <div className={cn(
                                            'w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-kraft rounded-full text-gold-dark transition-all duration-normal',
                                            (form.promotion_type === type) && 'bg-gold text-white scale-[1.08]'
                                        )}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="font-body text-sm font-semibold text-charcoal mb-1">{label}</div>
                                        <div className="text-xs text-smoke leading-snug">{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conditional Fields based on type */}
                        <div className="p-5 bg-gradient-to-br from-gold/[0.06] to-gold/[0.02] border border-dashed border-gold rounded-lg mt-4">
                            <div className="font-display text-base font-semibold text-gold-dark mb-4 flex items-center gap-2">
                                <Sparkles size={16} />
                                Discount settings
                            </div>

                            {form.promotion_type === 'percentage' && (
                                <div className="mb-6 last:mb-0">
                                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase after:content-['_*'] after:text-danger">
                                        Discount percentage
                                    </label>
                                    <input
                                        type="number"
                                        className={cn(
                                            'w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]',
                                            errors.discount_percentage && 'border-danger bg-[rgba(181,68,43,0.03)]'
                                        )}
                                        value={form.discount_percentage}
                                        onChange={(e) => updateField('discount_percentage', Number(e.target.value))}
                                        min={1}
                                        max={100}
                                    />
                                    {errors.discount_percentage && (
                                        <span className="text-xs text-danger mt-1.5 flex items-center gap-1">
                                            <Info size={12} />{errors.discount_percentage}
                                        </span>
                                    )}
                                </div>
                            )}

                            {form.promotion_type === 'fixed_amount' && (
                                <div className="mb-6 last:mb-0">
                                    <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase after:content-['_*'] after:text-danger">
                                        Discount amount (IDR)
                                    </label>
                                    <input
                                        type="number"
                                        className={cn(
                                            'w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]',
                                            errors.discount_amount && 'border-danger bg-[rgba(181,68,43,0.03)]'
                                        )}
                                        value={form.discount_amount}
                                        onChange={(e) => updateField('discount_amount', Number(e.target.value))}
                                        min={0}
                                        step={1000}
                                    />
                                    {errors.discount_amount && (
                                        <span className="text-xs text-danger mt-1.5 flex items-center gap-1">
                                            <Info size={12} />{errors.discount_amount}
                                        </span>
                                    )}
                                </div>
                            )}

                            {form.promotion_type === 'buy_x_get_y' && (
                                <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                                    <div className="mb-6 last:mb-0">
                                        <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase after:content-['_*'] after:text-danger">
                                            Buy (X)
                                        </label>
                                        <input
                                            type="number"
                                            className={cn(
                                                'w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]',
                                                errors.buy_quantity && 'border-danger bg-[rgba(181,68,43,0.03)]'
                                            )}
                                            value={form.buy_quantity}
                                            onChange={(e) => updateField('buy_quantity', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div className="mb-6 last:mb-0">
                                        <label className="block font-body text-sm font-semibold text-espresso mb-2 tracking-wide uppercase after:content-['_*'] after:text-danger">
                                            Get free (Y)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full py-3.5 px-4 font-body text-[0.95rem] text-charcoal bg-cream border-[1.5px] border-parchment rounded-lg transition-all duration-normal shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-gold focus:bg-flour focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15),inset_0_1px_3px_rgba(0,0,0,0.02)]"
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
                        <div className="col-span-full mt-4 relative bg-flour border border-parchment rounded-xl p-8 shadow-[0_2px_8px_rgba(45,42,36,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-gold before:via-gold-dark before:to-gold before:rounded-t-xl animate-sh-slide-up [animation-delay:0.3s]">
                            <div className="relative bg-flour border-2 border-dashed border-parchment rounded-xl p-8 text-center before:content-['\2726'] before:absolute before:top-1/2 before:left-6 before:-translate-y-1/2 before:text-2xl before:text-gold before:opacity-50 after:content-['\2726'] after:absolute after:top-1/2 after:right-6 after:-translate-y-1/2 after:text-2xl after:text-gold after:opacity-50">
                                <div className="inline-block px-6 py-2 bg-gold text-white font-display text-sm font-semibold rounded-full mb-4 uppercase tracking-widest">
                                    {form.code || 'CODE'}
                                </div>
                                <div className="font-display text-[2.5rem] font-bold text-charcoal mb-2">
                                    {getPreviewValue()}
                                </div>
                                <div className="font-display italic text-smoke text-lg">
                                    {form.name}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="sticky bottom-0 bg-gradient-to-b from-transparent via-cream/80 to-cream pt-8 pb-4 mt-8 flex justify-end gap-4 z-10 max-md:flex-col col-span-full">
                        <button
                            type="button"
                            className="py-3.5 px-7 font-body text-[0.95rem] font-semibold text-smoke bg-flour border-2 border-parchment rounded-lg cursor-pointer transition-all duration-normal flex items-center gap-2 hover:bg-kraft hover:border-smoke hover:text-charcoal max-md:w-full max-md:justify-center"
                            onClick={() => navigate('/products/promotions')}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="py-3.5 px-8 font-body text-[0.95rem] font-semibold text-white bg-gradient-to-b from-gold to-gold-dark border-none rounded-lg cursor-pointer transition-all duration-normal flex items-center gap-2 shadow-[0_2px_8px_rgba(201,165,92,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_16px_rgba(201,165,92,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:opacity-60 disabled:cursor-not-allowed max-md:w-full max-md:justify-center"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
