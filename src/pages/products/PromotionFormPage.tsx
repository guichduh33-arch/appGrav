import { ArrowLeft, Save, Sparkles, Info, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROMOTION_TYPES } from './promotionFormConstants'
import { usePromotionForm } from './usePromotionForm'
import PromotionProductSearch from './PromotionProductSearch'
import PromotionConstraintsSection from './PromotionConstraintsSection'

export default function PromotionFormPage() {
    const {
        isEditing, loading, saving, form, errors,
        selectedProducts, freeProducts, showProductSearch, searchTerm, filteredProducts,
        navigate, updateField, toggleDay, addProduct, removeProduct,
        setShowProductSearch, setSearchTerm, handleSubmit, getPreviewValue
    } = usePromotionForm()

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--theme-bg-primary)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span className="font-display text-lg text-[var(--theme-text-muted)]">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white pt-8 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-[var(--theme-text-secondary)] hover:text-[var(--color-gold)] transition-all"
                        >
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[var(--color-gold)] group-hover:bg-[var(--color-gold)]/10 transition-all">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="font-body text-sm font-medium">Back to Promotions</span>
                        </button>
                        <div>
                            <h1 className="font-display text-4xl font-bold text-white leading-tight">
                                {isEditing ? 'Edit' : 'New'} Promotion
                            </h1>
                            <p className="font-body text-[var(--theme-text-secondary)] opacity-60 mt-2 max-w-xl">
                                {isEditing ? "Update the details of your promotion." : "Create a new promotional offer."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 font-body text-sm font-bold text-[var(--theme-text-secondary)] rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            form="promotion-form"
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-10 py-3 font-body text-sm font-bold rounded-xl bg-[var(--color-gold)] text-black shadow-[0_4px_12px_rgba(201,165,92,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(201,165,92,0.35)] transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {saving ? 'Saving...' : (isEditing ? 'Update Promotion' : 'Create Promotion')}
                        </button>
                    </div>
                </div>

                <form id="promotion-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Basic Info */}
                        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-2xl p-10 shadow-sm">
                            <h2 className="font-display text-2xl font-semibold text-white mb-8 flex items-center gap-3">
                                <Sparkles size={24} className="text-[var(--color-gold)]" />
                                Basic Information
                            </h2>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2">
                                        <label htmlFor="promo_name" className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-3 uppercase tracking-[0.2em]">
                                            Name
                                        </label>
                                        <input
                                            id="promo_name" type="text"
                                            className={cn(
                                                "w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white transition-all focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]",
                                                errors.name && "border-red-500/50"
                                            )}
                                            placeholder="e.g., Morning Special"
                                            value={form.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                        />
                                        {errors.name && <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5"><Info size={14} /> {errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="promo_code" className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-3 uppercase tracking-[0.2em]">
                                            Code
                                        </label>
                                        <input
                                            id="promo_code" type="text"
                                            className={cn(
                                                "w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white transition-all focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 uppercase placeholder:text-[var(--theme-text-muted)]",
                                                errors.code && "border-red-500/50"
                                            )}
                                            placeholder="PROMO24"
                                            value={form.code}
                                            onChange={(e) => updateField('code', e.target.value)}
                                        />
                                        {errors.code && <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5"><Info size={14} /> {errors.code}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="promo_desc" className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-3 uppercase tracking-[0.2em]">
                                        Description
                                    </label>
                                    <textarea
                                        id="promo_desc" rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white transition-all focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 resize-none placeholder:text-[var(--theme-text-muted)]"
                                        placeholder="Describe this promotion..."
                                        value={form.description || ''}
                                        onChange={(e) => updateField('description', e.target.value)}
                                    />
                                </div>

                                <div className="p-8 bg-black/20 rounded-xl border border-white/5 space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-4 uppercase tracking-[0.2em]">
                                            Type
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {PROMOTION_TYPES.map((type) => (
                                                <button
                                                    key={type.type} type="button"
                                                    onClick={() => updateField('promotion_type', type.type)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all text-center",
                                                        form.promotion_type === type.type
                                                            ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)] text-[var(--color-gold)]"
                                                            : "bg-white/[0.02] border-white/10 text-[var(--theme-text-secondary)] hover:border-white/20"
                                                    )}
                                                >
                                                    <type.icon size={24} />
                                                    <span className="font-body text-xs font-bold uppercase tracking-wider">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Type-specific fields */}
                                    <div className="pt-6 border-t border-dashed border-white/10">
                                        {form.promotion_type === 'percentage' && (
                                            <div>
                                                <label htmlFor="discount_percentage" className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-3 uppercase tracking-[0.2em]">Percentage</label>
                                                <div className="relative">
                                                    <input id="discount_percentage" type="number"
                                                        className={cn("w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white pr-12 focus:outline-none focus:border-[var(--color-gold)]", errors.discount_percentage && "border-red-500/50")}
                                                        value={form.discount_percentage} onChange={(e) => updateField('discount_percentage', Number(e.target.value))} />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-display text-2xl text-[var(--color-gold)] opacity-50">%</span>
                                                </div>
                                                {errors.discount_percentage && <p className="mt-2 text-sm text-red-400">{errors.discount_percentage}</p>}
                                            </div>
                                        )}
                                        {form.promotion_type === 'fixed_amount' && (
                                            <div>
                                                <label htmlFor="discount_amount" className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-3 uppercase tracking-[0.2em]">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-gold)] opacity-50">Rp</span>
                                                    <input id="discount_amount" type="number"
                                                        className={cn("w-full bg-black/40 border border-white/10 rounded-xl pl-16 pr-6 py-4 text-white focus:outline-none focus:border-[var(--color-gold)]", errors.discount_amount && "border-red-500/50")}
                                                        value={form.discount_amount} onChange={(e) => updateField('discount_amount', Number(e.target.value))} />
                                                </div>
                                                {errors.discount_amount && <p className="mt-2 text-sm text-red-400">{errors.discount_amount}</p>}
                                            </div>
                                        )}
                                        {form.promotion_type === 'buy_x_get_y' && (
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <label htmlFor="buy_quantity" className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-3 uppercase tracking-[0.2em]">Buy Quantity</label>
                                                    <input id="buy_quantity" type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--color-gold)]"
                                                        value={form.buy_quantity} onChange={(e) => updateField('buy_quantity', Number(e.target.value))} />
                                                </div>
                                                <div>
                                                    <label htmlFor="get_quantity" className="block text-[10px] font-bold text-[var(--theme-text-muted)] mb-3 uppercase tracking-[0.2em]">Get Free</label>
                                                    <input id="get_quantity" type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--color-gold)]"
                                                        value={form.get_quantity} onChange={(e) => updateField('get_quantity', Number(e.target.value))} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Free product selection */}
                        {form.promotion_type === 'free_product' && (
                            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-2xl p-8 shadow-sm">
                                <h2 className="font-display text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                                    <Tag size={24} className="text-[var(--color-gold)]" /> Gift Selection
                                </h2>
                                <PromotionProductSearch
                                    title="Free Products" subtitle="Choose the products to give away"
                                    emptyText="No free products selected yet" type="free"
                                    selectedProducts={freeProducts} filteredProducts={filteredProducts}
                                    showSearch={showProductSearch === 'free'} searchTerm={searchTerm}
                                    onSearchTermChange={setSearchTerm} onOpenSearch={() => setShowProductSearch('free')}
                                    onAddProduct={addProduct} onRemoveProduct={removeProduct}
                                />
                            </div>
                        )}

                        <PromotionConstraintsSection
                            form={form} errors={errors} selectedProducts={selectedProducts}
                            filteredProducts={filteredProducts} showProductSearch={showProductSearch}
                            searchTerm={searchTerm} updateField={updateField} toggleDay={toggleDay}
                            setShowProductSearch={setShowProductSearch} setSearchTerm={setSearchTerm}
                            addProduct={addProduct} removeProduct={removeProduct}
                        />
                    </div>

                    {/* Right Column: Preview */}
                    <div className="space-y-8">
                        <div className="sticky top-8 space-y-8">
                            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                                <div className="h-1.5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/60" />
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)] opacity-70">Preview</span>
                                        <div className={cn("w-3 h-3 rounded-full", form.is_active ? "bg-[var(--color-gold)] animate-pulse" : "bg-white/20")} />
                                    </div>
                                    <div className="text-center py-6 space-y-4">
                                        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
                                            <span className="font-display text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest">
                                                {form.code || 'CODE'}
                                            </span>
                                        </div>
                                        <h3 className="font-display text-4xl font-bold text-white">{getPreviewValue()}</h3>
                                        <p className="font-body text-[var(--theme-text-secondary)] italic">{form.name || 'Untitled'}</p>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-dashed border-white/10 space-y-4">
                                        <div className="flex items-center justify-between font-body text-xs">
                                            <span className="text-[var(--theme-text-muted)]">Status</span>
                                            <span className={cn("font-bold uppercase tracking-wider", form.is_active ? "text-[var(--color-gold)]" : "text-[var(--theme-text-muted)]")}>
                                                {form.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between font-body text-xs">
                                            <span className="text-[var(--theme-text-muted)]">Stackable</span>
                                            <span className="text-white font-medium">{form.is_stackable ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black/20 border border-white/5 rounded-xl p-6">
                                <h4 className="font-display text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Info size={16} className="text-[var(--color-gold)]" /> Note
                                </h4>
                                <p className="font-body text-xs text-[var(--theme-text-muted)] leading-relaxed">
                                    Ensure your promotion code is unique and memorable for your customers.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
