import React from 'react'
import { Product, Category, Section } from '../../../types/database'
import { Star, Factory, ShoppingCart, Warehouse, Check, Layers } from 'lucide-react'

interface ProductUOM {
    id: string
    product_id: string
    unit_name: string
    conversion_factor: number
    is_purchase_unit?: boolean | null
    is_consumption_unit?: boolean | null
    is_stock_opname_unit?: boolean | null
}

interface GeneralTabProps {
    product: Product
    categories: Category[]
    sections: Section[]
    selectedSections: string[]
    primarySectionId: string | null
    uoms?: ProductUOM[]
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
    // Get the purchase unit for cost display
    const purchaseUnit = uoms.find(u => u.is_purchase_unit) || uoms[0]
    const costUnitLabel = purchaseUnit?.unit_name || product.unit || 'unité'
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
        // Use section_type (new schema) with fallback to old boolean flags
        const sectionType = (section as any).section_type
        if (sectionType === 'production' || (section as any).is_production_point) return <Factory size={20} />
        if (sectionType === 'sales' || (section as any).is_sales_point) return <ShoppingCart size={20} />
        if (sectionType === 'warehouse' || (section as any).is_warehouse) return <Warehouse size={20} />
        return <Layers size={20} />
    }

    const getSectionColor = (section: Section) => {
        // Use section_type (new schema) with fallback to old boolean flags
        const sectionType = (section as any).section_type
        if (sectionType === 'production' || (section as any).is_production_point) return { bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' }
        if (sectionType === 'sales' || (section as any).is_sales_point) return { bg: '#D1FAE5', color: '#059669', border: '#6EE7B7' }
        if (sectionType === 'warehouse' || (section as any).is_warehouse) return { bg: '#DBEAFE', color: '#2563EB', border: '#93C5FD' }
        return { bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB' }
    }

    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="card">
                <h3 className="card-title">Identité du Produit</h3>
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="prod-name">Nom du produit</label>
                        <input
                            id="prod-name"
                            className="form-input"
                            value={product.name}
                            onChange={e => onChange({ ...product, name: e.target.value })}
                            placeholder="Ex: Baguette Tradition"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="prod-sku">SKU</label>
                            <input
                                id="prod-sku"
                                className="form-input font-mono"
                                value={product.sku}
                                onChange={e => onChange({ ...product, sku: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prod-cat">Catégorie</label>
                            <select
                                id="prod-cat"
                                className="form-select"
                                value={product.category_id || ''}
                                onChange={e => onChange({ ...product, category_id: e.target.value })}
                            >
                                <option value="">Sélectionner...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="prod-desc">Description</label>
                        <textarea
                            id="prod-desc"
                            className="form-textarea"
                            rows={3}
                            value={product.description || ''}
                            onChange={e => onChange({ ...product, description: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Finance & POS</h3>
                <div className="form-section">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="prod-price">Prix de Vente</label>
                            <div className="form-input-prefix">
                                <span>Rp</span>
                                <input
                                    id="prod-price"
                                    type="number"
                                    className="form-input"
                                    value={product.retail_price || 0}
                                    onChange={e => onChange({ ...product, retail_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="prod-cost">Coût Fixe <span className="label-unit-suffix">/ {costUnitLabel}</span></label>
                            <div className="form-input-prefix">
                                <span>Rp</span>
                                <input
                                    id="prod-cost"
                                    type="number"
                                    className="form-input"
                                    value={product.cost_price || 0}
                                    onChange={e => onChange({ ...product, cost_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="form-group">
                        <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 rounded"
                                checked={product.pos_visible ?? false}
                                onChange={e => onChange({ ...product, pos_visible: e.target.checked })}
                            />
                            <div>
                                <span className="font-medium text-gray-900">Visible sur le POS</span>
                                <p className="text-xs text-gray-500 mt-1">Si décoché, le produit ne sera pas proposé aux vendeurs.</p>
                            </div>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 rounded"
                                checked={product.deduct_ingredients ?? false}
                                onChange={e => onChange({ ...product, deduct_ingredients: e.target.checked })}
                            />
                            <div>
                                <span className="font-medium text-gray-900">Déduire les ingrédients à la vente</span>
                                <p className="text-xs text-gray-500 mt-1">Pour les produits faits à la demande (café, sandwiches, etc.). Les ingrédients de la recette seront automatiquement déduits du stock lors de chaque vente.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Sections Card - Full Width */}
            <div className="card col-span-2">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                        <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>Sections d'utilisation</h3>
                        <p style={{ fontSize: '0.8125rem', color: '#8B7355', margin: 0 }}>
                            Sélectionnez où ce produit peut être utilisé. Cliquez sur l'étoile pour définir la section principale.
                        </p>
                    </div>
                    {selectedSections.length > 0 && (
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #BA90A2 0%, #D4A5B5 100%)',
                            borderRadius: '2rem',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600
                        }}>
                            {selectedSections.length} section{selectedSections.length > 1 ? 's' : ''} sélectionnée{selectedSections.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {sections?.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: '#F9FAFB',
                        borderRadius: '0.75rem',
                        border: '2px dashed #E5E7EB'
                    }}>
                        <Layers size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6B7280', margin: 0 }}>Aucune section configurée.</p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Créez des sections dans Paramètres → Sections
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {sections?.map(section => {
                            const isSelected = selectedSections.includes(section.id)
                            const isPrimary = primarySectionId === section.id
                            const colors = getSectionColor(section)

                            return (
                                <div
                                    key={section.id}
                                    onClick={() => handleSectionToggle(section.id)}
                                    style={{
                                        position: 'relative',
                                        padding: '1.25rem',
                                        borderRadius: '1rem',
                                        border: `2px solid ${isSelected ? '#BA90A2' : '#E5E7EB'}`,
                                        background: isSelected ? 'linear-gradient(135deg, rgba(186,144,162,0.08) 0%, rgba(212,165,181,0.08) 100%)' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: isSelected ? '0 4px 12px rgba(186,144,162,0.2)' : 'none'
                                    }}
                                >
                                    {/* Selection indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        border: `2px solid ${isSelected ? '#BA90A2' : '#D1D5DB'}`,
                                        background: isSelected ? '#BA90A2' : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                                    </div>

                                    {/* Icon */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: colors.bg,
                                        color: colors.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {getSectionIcon(section)}
                                    </div>

                                    {/* Name */}
                                    <h4 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: '#4A3728'
                                    }}>
                                        {section.name}
                                    </h4>

                                    {/* Type badges - using section_type */}
                                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                        {((section as any).section_type === 'production' || (section as any).is_production_point) && (
                                            <span style={{
                                                fontSize: '0.625rem',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '1rem',
                                                background: '#FEF3C7',
                                                color: '#D97706',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.025em'
                                            }}>Production</span>
                                        )}
                                        {((section as any).section_type === 'sales' || (section as any).is_sales_point) && (
                                            <span style={{
                                                fontSize: '0.625rem',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '1rem',
                                                background: '#D1FAE5',
                                                color: '#059669',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.025em'
                                            }}>Vente</span>
                                        )}
                                        {((section as any).section_type === 'warehouse' || (section as any).is_warehouse) && (
                                            <span style={{
                                                fontSize: '0.625rem',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '1rem',
                                                background: '#DBEAFE',
                                                color: '#2563EB',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.025em'
                                            }}>Entrepôt</span>
                                        )}
                                    </div>

                                    {/* Primary star button */}
                                    {isSelected && (
                                        <button
                                            type="button"
                                            onClick={(e) => handlePrimaryChange(section.id, e)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                background: isPrimary ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' : '#F3F4F6',
                                                color: isPrimary ? 'white' : '#6B7280',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                width: '100%',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Star size={14} fill={isPrimary ? 'white' : 'none'} />
                                            {isPrimary ? 'Section Principale' : 'Définir comme principale'}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
