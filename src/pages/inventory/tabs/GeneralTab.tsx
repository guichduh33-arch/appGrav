import React from 'react'
import { Product, Category, Section } from '../../../types/database'
import { Star } from 'lucide-react'

interface GeneralTabProps {
    product: Product
    categories: Category[]
    sections: Section[]
    selectedSections: string[]
    primarySectionId: string | null
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
    onSectionsChange,
    onPrimarySectionChange,
    onChange
}) => {
    const handleSectionToggle = (sectionId: string) => {
        if (selectedSections.includes(sectionId)) {
            // Remove section
            const newSections = selectedSections.filter(id => id !== sectionId)
            onSectionsChange(newSections)
            // If removed section was primary, set new primary
            if (primarySectionId === sectionId) {
                onPrimarySectionChange(newSections[0] || null)
            }
        } else {
            // Add section
            const newSections = [...selectedSections, sectionId]
            onSectionsChange(newSections)
            // If no primary set, make this the primary
            if (!primarySectionId) {
                onPrimarySectionChange(sectionId)
            }
        }
    }

    const handlePrimaryChange = (sectionId: string) => {
        onPrimarySectionChange(sectionId)
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

                    {/* Multi-Section Selection */}
                    <div className="form-group">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Sections d'utilisation
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Sélectionnez les sections où ce produit peut être utilisé. L'étoile indique la section principale (stock déduit lors d'une vente).
                        </p>
                        <div className="space-y-2">
                            {sections?.map(section => {
                                const isSelected = selectedSections.includes(section.id)
                                const isPrimary = primarySectionId === section.id
                                return (
                                    <div
                                        key={section.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                            isSelected
                                                ? 'border-rose-300 bg-rose-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleSectionToggle(section.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded accent-rose-500"
                                            checked={isSelected}
                                            onChange={() => {}}
                                        />
                                        <div className="flex-1">
                                            <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {section.name}
                                            </span>
                                            <div className="flex gap-2 mt-1">
                                                {section.is_production_point && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Production</span>
                                                )}
                                                {section.is_sales_point && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Vente</span>
                                                )}
                                                {section.is_warehouse && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Entrepôt</span>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <button
                                                type="button"
                                                className={`p-2 rounded-full transition-colors ${
                                                    isPrimary
                                                        ? 'bg-amber-100 text-amber-600'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePrimaryChange(section.id)
                                                }}
                                                title={isPrimary ? 'Section principale' : 'Définir comme section principale'}
                                            >
                                                <Star size={16} fill={isPrimary ? 'currentColor' : 'none'} />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        {sections?.length === 0 && (
                            <p className="text-sm text-gray-500 italic">Aucune section configurée. Créez des sections dans les paramètres.</p>
                        )}
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
                            <label htmlFor="prod-cost">Coût Fixe</label>
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
                                checked={product.pos_visible}
                                onChange={e => onChange({ ...product, pos_visible: e.target.checked })}
                            />
                            <div>
                                <span className="font-medium text-gray-900">Visible sur le POS</span>
                                <p className="text-xs text-gray-500 mt-1">Si décoché, le produit ne sera pas proposé aux vendeurs.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
