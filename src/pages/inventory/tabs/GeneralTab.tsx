import React from 'react'
import { Product, Category, Section } from '../../../types/database'
import { Star, Factory, ShoppingCart, Warehouse, Check, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

// Extended ProductUOM with UI-specific fields
interface ProductUOMLocal {
    id: string
    product_id: string
    uom_name: string
    uom_code?: string
    conversion_factor: number
    is_purchase_uom?: boolean | null
    is_sale_uom?: boolean | null
}

interface GeneralTabProps {
    product: Product
    categories: Category[]
    sections: Section[]
    selectedSections: string[]
    primarySectionId: string | null
    uoms?: ProductUOMLocal[]
    onSectionsChange: (sectionIds: string[]) => void
    onPrimarySectionChange: (sectionId: string | null) => void
    onChange: (product: Product) => void
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
    product,
    categories,
    sections,
    selectedSections,
    primarySectionId,
    uoms = [],
    onSectionsChange,
    onPrimarySectionChange,
    onChange
}) => {
    const purchaseUnit = uoms.find(u => u.is_purchase_uom) || uoms[0]
    const costUnitLabel = purchaseUnit?.uom_name || product.unit || 'unit'

    const handleSectionToggle = (sectionId: string) => {
        if (selectedSections.includes(sectionId)) {
            const newSections = selectedSections.filter(id => id !== sectionId)
            onSectionsChange(newSections)
            if (primarySectionId === sectionId) {
                onPrimarySectionChange(newSections[0] || null)
            }
        } else {
            const newSections = [...selectedSections, sectionId]
            onSectionsChange(newSections)
            if (!primarySectionId) {
                onPrimarySectionChange(sectionId)
            }
        }
    }

    const handlePrimaryChange = (sectionId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onPrimarySectionChange(sectionId)
    }

    const getSectionIcon = (section: Section) => {
        if (section.section_type === 'production') return <Factory size={20} />
        if (section.section_type === 'sales') return <ShoppingCart size={20} />
        if (section.section_type === 'warehouse') return <Warehouse size={20} />
        return <Layers size={20} />
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Product Identity */}
                <section className="lg:col-span-3 bg-[var(--onyx-surface)] border border-white/5 rounded-sm shadow-2xl">
                    <div className="p-8 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">Product Identity</h3>
                    </div>
                    <div className="p-8 space-y-8">
                        <div>
                            <label htmlFor="prod-name" className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-3">
                                Product Name
                            </label>
                            <input
                                id="prod-name"
                                className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                                value={product.name}
                                onChange={e => onChange({ ...product, name: e.target.value })}
                                placeholder="Ex: Tradition Baguette"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="prod-sku" className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-3">
                                    SKU Code
                                </label>
                                <input
                                    id="prod-sku"
                                    className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white font-mono placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                                    value={product.sku}
                                    onChange={e => onChange({ ...product, sku: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="prod-cat" className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-3">
                                    Category
                                </label>
                                <select
                                    id="prod-cat"
                                    className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                                    value={product.category_id || ''}
                                    onChange={e => onChange({ ...product, category_id: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="prod-desc" className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-3">
                                Product Description
                            </label>
                            <textarea
                                id="prod-desc"
                                className="w-full bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all resize-none"
                                rows={4}
                                value={product.description || ''}
                                onChange={e => onChange({ ...product, description: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Finance & POS */}
                <section className="lg:col-span-2 flex flex-col gap-8">
                    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-sm shadow-2xl h-full flex flex-col">
                        <div className="p-8 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white">Finance & POS</h3>
                        </div>
                        <div className="p-8 flex-1 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label htmlFor="prod-price" className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-3">
                                        Retail Price (IDR)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-xs font-mono">Rp</span>
                                        <input
                                            id="prod-price"
                                            type="number"
                                            className="w-full bg-black/40 border border-white/10 rounded-sm pl-12 pr-4 py-3 text-sm font-semibold text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                                            value={product.retail_price || 0}
                                            onChange={e => onChange({ ...product, retail_price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="prod-cost" className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-3">
                                        Fixed Production Cost <span className="font-normal text-[var(--theme-text-muted)]">/ {costUnitLabel}</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-xs font-mono">Rp</span>
                                        <input
                                            id="prod-cost"
                                            type="number"
                                            className="w-full bg-black/40 border border-white/10 rounded-sm pl-12 pr-4 py-3 text-sm font-semibold text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                                            value={product.cost_price || 0}
                                            onChange={e => onChange({ ...product, cost_price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <label className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-sm cursor-pointer group hover:border-[var(--color-gold)]/40 transition-colors">
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">Visible on POS</p>
                                        <p className="text-[9px] text-[var(--theme-text-muted)] mt-1">Include this item in active sales menu</p>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={product.pos_visible ?? false}
                                            onChange={e => onChange({ ...product, pos_visible: e.target.checked })}
                                        />
                                        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--theme-text-muted)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-gold)] peer-checked:after:bg-black" />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-sm cursor-pointer group hover:border-[var(--color-gold)]/40 transition-colors">
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">Deduct Ingredients</p>
                                        <p className="text-[9px] text-[var(--theme-text-muted)] mt-1">Real-time inventory subtraction on sale</p>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={product.deduct_ingredients ?? false}
                                            onChange={e => onChange({ ...product, deduct_ingredients: e.target.checked })}
                                        />
                                        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--theme-text-muted)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-gold)] peer-checked:after:bg-black" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Usage Sections */}
            <section className="bg-[var(--onyx-surface)] border border-white/5 rounded-sm shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">Usage Sections</h3>
                        <p className="text-[10px] text-[var(--theme-text-muted)] mt-1 uppercase tracking-widest italic">
                            Departmental availability for production and inventory
                        </p>
                    </div>
                    {selectedSections.length > 0 && (
                        <span className="text-[10px] font-bold text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-3 py-1.5 border border-[var(--color-gold)]/20 rounded uppercase tracking-wider">
                            {selectedSections.length} section{selectedSections.length > 1 ? 's' : ''} selected
                        </span>
                    )}
                </div>
                <div className="p-8">
                    {sections?.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-sm">
                            <Layers size={48} className="mx-auto mb-4 text-white/10" />
                            <p className="text-[var(--theme-text-muted)] text-sm">No sections configured.</p>
                            <p className="text-[var(--theme-text-muted)] text-xs mt-2 opacity-60">
                                Create sections in Settings &rarr; Sections
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {sections?.map(section => {
                                const isSelected = selectedSections.includes(section.id)
                                const isPrimary = primarySectionId === section.id

                                return (
                                    <div
                                        key={section.id}
                                        onClick={() => handleSectionToggle(section.id)}
                                        className={cn(
                                            'relative cursor-pointer rounded-sm p-6 flex flex-col items-center text-center transition-all group',
                                            isSelected
                                                ? 'border-2 border-[var(--color-gold)] bg-[var(--color-gold)]/5 shadow-[0_0_20px_rgba(202,176,109,0.1)]'
                                                : 'border border-white/5 bg-black/20 hover:border-white/10'
                                        )}
                                    >
                                        {/* Selection check */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-4 h-4 bg-[var(--color-gold)] rounded-full flex items-center justify-center">
                                                    <Check size={10} className="text-black" strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}

                                        <div className={cn(
                                            'mb-4',
                                            isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--theme-text-muted)] group-hover:text-[var(--stone-text)]'
                                        )}>
                                            {getSectionIcon(section)}
                                        </div>
                                        <span className={cn(
                                            'text-xs font-bold uppercase tracking-widest',
                                            isSelected ? 'text-white' : 'text-[var(--theme-text-muted)]'
                                        )}>
                                            {section.name}
                                        </span>
                                        <span className={cn(
                                            'text-[8px] uppercase font-bold mt-1',
                                            isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--theme-text-muted)] opacity-60'
                                        )}>
                                            {section.section_type}
                                        </span>

                                        {/* Primary badge */}
                                        {isSelected && isPrimary && (
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--color-gold)] text-black px-3 py-1 rounded-sm flex items-center gap-1.5 whitespace-nowrap shadow-lg">
                                                <Star size={10} fill="black" />
                                                <span className="text-[8px] font-black uppercase tracking-tighter">Primary</span>
                                            </div>
                                        )}

                                        {/* Set as primary button */}
                                        {isSelected && !isPrimary && (
                                            <button
                                                type="button"
                                                onClick={(e) => handlePrimaryChange(section.id, e)}
                                                className="mt-3 flex items-center gap-1 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider bg-white/5 text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors border-none cursor-pointer"
                                            >
                                                <Star size={10} />
                                                Set primary
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
