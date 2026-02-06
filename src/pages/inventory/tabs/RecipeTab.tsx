import React from 'react'
import { Plus, Trash2, Scale, Info } from 'lucide-react'
import { Product, Recipe } from '../../../types/database'

interface RecipeTabProps {
    recipeItems: (Recipe & { material: Product })[]
    allIngredients: Product[]
    showIngredientSearch: boolean
    setShowIngredientSearch: (show: boolean) => void
    onAddIngredient: (materialId: string) => void
    onRemoveIngredient: (recipeId: string) => void
    onUpdateQuantity: (recipeId: string, quantity: number, unit: string) => void
    productType?: 'finished' | 'semi_finished' | 'raw_material'
}

export const RecipeTab: React.FC<RecipeTabProps> = ({
    recipeItems,
    allIngredients,
    showIngredientSearch,
    setShowIngredientSearch,
    onAddIngredient,
    onRemoveIngredient,
    onUpdateQuantity,
    productType
}) => {
    // Calculate total weight of ingredients
    const totalWeight = recipeItems.reduce((sum, item) => {
        // Convert to grams for calculation (assuming kg, g, or units)
        const unit = (item.unit || item.material.unit || '').toLowerCase()
        let quantity = item.quantity || 0
        if (unit === 'kg') quantity *= 1000
        return sum + quantity
    }, 0)

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>Recipe Ingredients</h3>
                    {productType === 'semi_finished' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            padding: '0.75rem 1rem',
                            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                            borderRadius: '0.5rem',
                            border: '1px solid #FCD34D'
                        }}>
                            <Scale size={18} style={{ color: '#D97706' }} />
                            <div>
                                <span style={{ fontWeight: 600, color: '#92400E', fontSize: '0.875rem' }}>
                                    Calculation base: 1 kg of finished product
                                </span>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#B45309' }}>
                                    The quantities below are to produce 1 kg of this semi-finished product
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <button
                    className="btn-secondary flex items-center gap-2 text-sm"
                    onClick={() => setShowIngredientSearch(!showIngredientSearch)}
                >
                    <Plus size={14} /> Add an ingredient
                </button>
            </div>

            {showIngredientSearch && (
                <div className="mb-4">
                    <div className="ingredient-picker">
                        {allIngredients.map(ing => (
                            <button
                                key={ing.id}
                                className="ingredient-btn"
                                onClick={() => onAddIngredient(ing.id)}
                                title={`Add ${ing.name}`}
                            >
                                <div className="font-medium">{ing.name}</div>
                                <div className="text-xs text-gray-500">Stock: {ing.current_stock} {ing.unit}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                <table className="detail-table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipeItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div className="font-medium">{item.material.name}</div>
                                    <div className="text-xs text-gray-400">
                                        Base: {item.material.unit}
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        aria-label="Quantity"
                                        title="Quantity"
                                        placeholder="0"
                                        className="form-input w-24 text-right py-1"
                                        value={item.quantity}
                                        step="0.01"
                                        onChange={e => onUpdateQuantity(item.id, parseFloat(e.target.value), item.unit || item.material.unit || '')}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-input w-20 py-1"
                                        value={item.unit || ''}
                                        placeholder={item.material.unit ?? ''}
                                        title="Enter unit"
                                        onChange={e => onUpdateQuantity(item.id, item.quantity, e.target.value)}
                                    />
                                </td>
                                <td className="text-right">
                                    <button
                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                        onClick={() => onRemoveIngredient(item.id)}
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {recipeItems.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                                    No ingredients. Add raw materials to define the recipe.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {recipeItems.length > 0 && (
                        <tfoot>
                            <tr style={{ background: '#F9FAFB' }}>
                                <td style={{ fontWeight: 600, color: '#4A3728' }}>
                                    Total ({recipeItems.length} ingredient{recipeItems.length > 1 ? 's' : ''})
                                </td>
                                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, color: '#4A3728' }}>
                                    {totalWeight >= 1000
                                        ? `${(totalWeight / 1000).toFixed(2)} kg`
                                        : `${totalWeight.toFixed(0)} g`
                                    }
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Info box for costing */}
            {recipeItems.length > 0 && productType === 'semi_finished' && (
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#F0F9FF',
                    borderRadius: '0.5rem',
                    border: '1px solid #BAE6FD'
                }}>
                    <Info size={20} style={{ color: '#0284C7', flexShrink: 0, marginTop: '0.125rem' }} />
                    <div style={{ fontSize: '0.8125rem', color: '#0369A1' }}>
                        <strong>Cost calculation:</strong> The cost price of this semi-finished product will be calculated
                        by adding the cost of each ingredient. To produce a different quantity,
                        multiply the cost by the desired weight (e.g., 2.5 kg = cost × 2.5).
                    </div>
                </div>
            )}
        </div>
    )
}
