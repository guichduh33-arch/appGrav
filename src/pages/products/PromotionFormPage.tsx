import { ArrowLeft, Save, Sparkles, Info, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROMOTION_TYPES } from './promotionFormConstants'
import { usePromotionForm } from './usePromotionForm'
import PromotionProductSearch from './PromotionProductSearch'
import PromotionConstraintsSection from './PromotionConstraintsSection'

const GRAIN_TEXTURE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"

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
            <div className="relative min-h-screen bg-[var(--theme-bg-primary)] overflow-x-hidden flex items-center justify-center">
                <div
                    className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                    style={{ backgroundImage: GRAIN_TEXTURE }}
                />
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-[var(--color-gold-muted)] border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span className="font-display text-xl italic text-[var(--theme-text-secondary)] animate-pulse">
                        Summoning Artisan Data...
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-[var(--theme-bg-primary)] overflow-x-hidden pt-8 pb-24">
            {/* Background Texture */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{ backgroundImage: GRAIN_TEXTURE }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-[var(--theme-text-secondary)] hover:text-[var(--color-gold)] transition-all duration-300"
                        >
                            <div className="w-8 h-8 rounded-full border border-[var(--theme-border)] flex items-center justify-center group-hover:border-[var(--color-gold)] group-hover:bg-[var(--color-gold)]/10 transition-all">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="font-body text-sm font-medium tracking-wide">Return to Repertoire</span>
                        </button>

                        <div>
                            <h1 className="font-display text-5xl font-bold text-[var(--theme-text-primary)] leading-tight tracking-tight">
                                {isEditing ? 'Refine' : 'Curate New'} <span className="text-gradient-gold">Promotion</span>
                            </h1>
                            <p className="font-body text-[var(--theme-text-secondary)] opacity-60 mt-2 max-w-xl text-lg italic">
                                {isEditing
                                    ? "Perfecting the nuances of your promotional masterpiece."
                                    : "Designing a new celebration of artisanal excellence."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 font-body text-sm font-bold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-all duration-300 rounded-2xl border border-[var(--theme-border)] hover:bg-white/5"
                        >
                            Relinquish
                        </button>
                        <button
                            form="promotion-form"
                            type="submit"
                            disabled={saving}
                            className="relative group px-10 py-4 font-body text-sm font-bold text-white rounded-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-2xl shadow-[var(--color-gold)]/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold-dark)] to-[var(--color-gold)] group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative flex items-center gap-2">
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                {saving ? 'Curation in progress...' : (isEditing ? 'Update Masterpiece' : 'Invoke Promotion')}
                            </div>
                        </button>
                    </div>
                </div>

                <form id="promotion-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Core Identity */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Basic Info */}
                        <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-[2.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 blur-[80px] rounded-full" />

                            <h2 className="font-display text-2xl font-semibold text-[var(--theme-text-primary)] mb-8 flex items-center gap-3">
                                <Sparkles size={24} className="text-[var(--color-gold)]" />
                                Artisan Essence
                            </h2>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 group">
                                        <label htmlFor="promo_name" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-3 uppercase tracking-widest opacity-70 group-focus-within:opacity-100 transition-opacity">
                                            Collection Name
                                        </label>
                                        <input
                                            id="promo_name"
                                            type="text"
                                            className={cn(
                                                "w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-2xl px-6 py-5 font-body text-lg text-[var(--theme-text-primary)] transition-all duration-300",
                                                "focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]",
                                                errors.name && "border-red-500/50 bg-red-500/5"
                                            )}
                                            placeholder="e.g., Morning Mist Delicacy"
                                            value={form.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                        />
                                        {errors.name && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium">
                                                <Info size={14} /> {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="group">
                                        <label htmlFor="promo_code" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-3 uppercase tracking-widest opacity-70 group-focus-within:opacity-100 transition-opacity">
                                            Signature Code
                                        </label>
                                        <input
                                            id="promo_code"
                                            type="text"
                                            className={cn(
                                                "w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-2xl px-6 py-5 font-body text-lg text-[var(--theme-text-primary)] transition-all duration-300 uppercase",
                                                "focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]",
                                                errors.code && "border-red-500/50 bg-red-500/5"
                                            )}
                                            placeholder="LUXE24"
                                            value={form.code}
                                            onChange={(e) => updateField('code', e.target.value)}
                                        />
                                        {errors.code && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium">
                                                <Info size={14} /> {errors.code}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="group">
                                    <label htmlFor="promo_desc" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-3 uppercase tracking-widest opacity-70 group-focus-within:opacity-100 transition-opacity">
                                        Visionary Description
                                    </label>
                                    <textarea
                                        id="promo_desc"
                                        rows={3}
                                        className="w-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-2xl px-6 py-5 font-body text-base text-[var(--theme-text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] resize-none"
                                        placeholder="Describe the soul of this promotion..."
                                        value={form.description || ''}
                                        onChange={(e) => updateField('description', e.target.value)}
                                    />
                                </div>

                                <div className="p-8 bg-[var(--theme-bg-tertiary)] rounded-3xl border border-[var(--theme-border)] space-y-8">
                                    <div className="group">
                                        <label htmlFor="promo_type" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-4 uppercase tracking-widest opacity-70 group-focus-within:opacity-100 transition-opacity">
                                            Curation Type
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {PROMOTION_TYPES.map((type) => (
                                                <button
                                                    key={type.type}
                                                    type="button"
                                                    onClick={() => updateField('promotion_type', type.type)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-center group/btn",
                                                        form.promotion_type === type.type
                                                            ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)] text-[var(--color-gold)]"
                                                            : "bg-[var(--theme-bg-secondary)] border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:border-[var(--color-gold-muted)]"
                                                    )}
                                                >
                                                    <type.icon size={24} className={cn(
                                                        "transition-transform duration-300 group-hover/btn:scale-110",
                                                        form.promotion_type === type.type ? "text-[var(--color-gold)]" : "text-[var(--theme-text-secondary)]"
                                                    )} />
                                                    <span className="font-body text-xs font-bold uppercase tracking-wider">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Conditional fields based on promotion type */}
                                    <div className="pt-6 border-t border-dashed border-[var(--theme-border)]">
                                        {form.promotion_type === 'percentage' && (
                                            <div className="group">
                                                <label htmlFor="discount_percentage" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-3 uppercase tracking-widest opacity-70">
                                                    Gratitude Percentage
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="discount_percentage"
                                                        type="number"
                                                        className={cn(
                                                            "w-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-2xl px-6 py-5 font-body text-lg text-[var(--theme-text-primary)] pr-12 transition-all duration-300",
                                                            "focus:outline-none focus:border-[var(--color-gold)]",
                                                            errors.discount_percentage && "border-red-500/50"
                                                        )}
                                                        value={form.discount_percentage}
                                                        onChange={(e) => updateField('discount_percentage', Number(e.target.value))}
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-display text-2xl text-[var(--color-gold)] opacity-50">%</span>
                                                </div>
                                                {errors.discount_percentage && (
                                                    <p className="mt-2 text-sm text-red-500 font-medium">{errors.discount_percentage}</p>
                                                )}
                                            </div>
                                        )}

                                        {form.promotion_type === 'fixed_amount' && (
                                            <div className="group">
                                                <label htmlFor="discount_amount" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-3 uppercase tracking-widest opacity-70">
                                                    Token of Appreciation (Amount)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display text-lg text-[var(--color-gold)] opacity-50">Rp</span>
                                                    <input
                                                        id="discount_amount"
                                                        type="number"
                                                        className={cn(
                                                            "w-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-2xl pl-16 pr-6 py-5 font-body text-lg text-[var(--theme-text-primary)] transition-all duration-300",
                                                            "focus:outline-none focus:border-[var(--color-gold)]",
                                                            errors.discount_amount && "border-red-500/50"
                                                        )}
                                                        value={form.discount_amount}
                                                        onChange={(e) => updateField('discount_amount', Number(e.target.value))}
                                                    />
                                                </div>
                                                {errors.discount_amount && (
                                                    <p className="mt-2 text-sm text-red-500 font-medium">{errors.discount_amount}</p>
                                                )}
                                            </div>
                                        )}

                                        {form.promotion_type === 'buy_x_get_y' && (
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="group">
                                                    <label htmlFor="buy_quantity" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-3 uppercase tracking-widest opacity-70">
                                                        Purchase Quantity
                                                    </label>
                                                    <input
                                                        id="buy_quantity"
                                                        type="number"
                                                        className="w-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-2xl px-6 py-5 font-body text-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--color-gold)]"
                                                        value={form.buy_quantity}
                                                        onChange={(e) => updateField('buy_quantity', Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label htmlFor="get_quantity" className="block font-body text-xs font-bold text-[var(--color-gold)] mb-3 uppercase tracking-widest opacity-70">
                                                        Complimentary Quantity
                                                    </label>
                                                    <input
                                                        id="get_quantity"
                                                        type="number"
                                                        className="w-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-2xl px-6 py-5 font-body text-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--color-gold)]"
                                                        value={form.get_quantity}
                                                        onChange={(e) => updateField('get_quantity', Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Special handling for free product selection */}
                        {form.promotion_type === 'free_product' && (
                            <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-[2rem] p-8 shadow-xl">
                                <h2 className="font-display text-2xl font-semibold text-[var(--theme-text-primary)] mb-6 flex items-center gap-3">
                                    <Tag size={24} className="text-[var(--color-gold)]" />
                                    Gift Selection
                                </h2>
                                <PromotionProductSearch
                                    title="Complimentary Collections"
                                    subtitle="Choose the treasures to be bestowed"
                                    emptyText="No treasures nominated yet"
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
                            </div>
                        )}

                        {/* Constraints Section */}
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
                    </div>

                    {/* Right Column: Preview & Status */}
                    <div className="space-y-8">
                        {/* Live Preview Card */}
                        <div className="sticky top-8 space-y-8">
                            <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-[2rem] overflow-hidden shadow-2xl relative">
                                <div className="h-2 bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold-dark)] to-[var(--color-gold)]" />

                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)] opacity-70">
                                            Exclusivity Preview
                                        </span>
                                        <div className={cn(
                                            "w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(201,165,92,0.5)]",
                                            form.is_active ? "bg-[var(--color-gold)]" : "bg-[var(--theme-text-secondary)] opacity-30"
                                        )} />
                                    </div>

                                    <div className="text-center py-6 space-y-4">
                                        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
                                            <span className="font-display text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest">
                                                {form.code || 'CODE'}
                                            </span>
                                        </div>

                                        <h3 className="font-display text-4xl font-bold text-[var(--theme-text-primary)]">
                                            {getPreviewValue()}
                                        </h3>

                                        <p className="font-body text-[var(--theme-text-secondary)] italic">
                                            {form.name || 'Untitled Curation'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-dashed border-[var(--theme-border)] space-y-4">
                                        <div className="flex items-center justify-between font-body text-xs">
                                            <span className="text-[var(--theme-text-secondary)]">Status</span>
                                            <span className={cn(
                                                "font-bold uppercase tracking-wider",
                                                form.is_active ? "text-[var(--color-gold)]" : "text-[var(--theme-text-secondary)] opacity-40"
                                            )}>
                                                {form.is_active ? 'Active Essence' : 'Dormant'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between font-body text-xs">
                                            <span className="text-[var(--theme-text-secondary)]">Exclusivity</span>
                                            <span className="text-[var(--theme-text-primary)] font-medium">
                                                {form.is_stackable ? 'Layered' : 'Singular'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[var(--color-gold)]/5 p-4 text-center">
                                    <span className="font-body text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--color-gold)] opacity-60">
                                        Luxe Bakery Artisan System
                                    </span>
                                </div>
                            </div>

                            {/* Artisan's Note */}
                            <div className="bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-2xl p-6 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Info size={48} />
                                </div>
                                <h4 className="font-display text-sm font-bold text-[var(--theme-text-primary)] mb-3 flex items-center gap-2">
                                    <Info size={16} className="text-[var(--color-gold)]" />
                                    Artisan's Note
                                </h4>
                                <p className="font-body text-xs text-[var(--theme-text-secondary)] leading-relaxed opacity-70">
                                    Every promotion is a delicate balance. Ensure your <strong>Signature Code</strong> is memorable yet exclusive to your vision.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
