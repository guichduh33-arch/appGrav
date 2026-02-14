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
    const totalWeight = recipeItems.reduce((sum, item) => {
        const unit = (item.unit || item.material.unit || '').toLowerCase()
        let quantity = item.quantity || 0
        if (unit === 'kg') quantity *= 1000
        return sum + quantity
    }, 0)

    return (
        <div className="space-y-6">
            {/* Semi-finished banner */}
            {productType === 'semi_finished' && (
                <div className="flex items-center gap-4 p-5 bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 rounded-xl">
                    <Scale size={18} className="text-[var(--color-gold)]" />
                    <div>
                        <span className="font-semibold text-[var(--color-gold)] text-sm">
                            Calculation base: 1 kg of finished product
                        </span>
                        <p className="text-xs text-[var(--color-gold)]/70 mt-0.5">
                            The quantities below are to produce 1 kg of this semi-finished product
                        </p>
                    </div>
                </div>
            )}

            {/* Main Recipe Card */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden shadow-2xl shadow-black/40">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        Recipe Components
                    </h2>
                    <div className="flex items-center gap-3">
                        {recipeItems.length > 0 && (
                            <span className="text-xs text-[var(--theme-text-muted)] bg-white/5 px-2 py-1 rounded">
                                {recipeItems.length} ingredient{recipeItems.length > 1 ? 's' : ''}
                            </span>
                        )}
                        <button
                            className="bg-transparent border border-white/10 text-white hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] px-4 py-2 rounded-sm flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
                            onClick={() => setShowIngredientSearch(!showIngredientSearch)}
                        >
                            <Plus size={14} /> Add Ingredient
                        </button>
                    </div>
                </div>

                {/* Ingredient Search Dropdown */}
                {showIngredientSearch && (
                    <div className="p-4 border-b border-white/5 bg-black/20">
                        <div className="max-h-[300px] overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
                            {allIngredients.map(ing => (
                                <button
                                    key={ing.id}
                                    className="text-left p-3 border border-white/5 rounded-sm bg-[var(--onyx-surface)] transition-all duration-200 hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-gold)]/5"
                                    onClick={() => onAddIngredient(ing.id)}
                                    title={`Add ${ing.name}`}
                                >
                                    <div className="font-medium text-white text-sm">{ing.name}</div>
                                    <div className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-wider mt-0.5">
                                        Stock: {ing.current_stock} {ing.unit}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recipe Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-[var(--muted-smoke)]">
                                <th className="px-6 py-4 font-medium">Ingredient</th>
                                <th className="px-6 py-4 font-medium">Quantity</th>
                                <th className="px-6 py-4 font-medium">Unit</th>
                                <th className="px-6 py-4 font-medium text-right w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recipeItems.map(item => (
                                <tr key={item.id} className="hover:bg-white/[0.02] group transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{item.material.name}</div>
                                        <div className="text-[10px] text-[var(--color-gold)]/50 uppercase tracking-tighter">
                                            Base: {item.material.unit}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            aria-label="Quantity"
                                            title="Quantity"
                                            placeholder="0"
                                            className="w-20 bg-black/40 border border-white/10 rounded-md text-sm text-white text-right py-1.5 px-2 focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                                            value={item.quantity}
                                            step="0.01"
                                            onChange={e => onUpdateQuantity(item.id, parseFloat(e.target.value), item.unit || item.material.unit || '')}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            className="w-20 bg-black/40 border border-white/10 rounded-md text-sm text-[var(--theme-text-secondary)] py-1.5 px-2 focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                                            value={item.unit || ''}
                                            placeholder={item.material.unit ?? ''}
                                            title="Enter unit"
                                            onChange={e => onUpdateQuantity(item.id, item.quantity, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="opacity-0 group-hover:opacity-100 text-[var(--theme-text-muted)] hover:text-red-400 transition-all p-1"
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
                                    <td colSpan={4} className="p-8 text-center text-[var(--theme-text-muted)] italic text-sm">
                                        No ingredients. Add raw materials to define the recipe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer with total or add button */}
                {recipeItems.length > 0 ? (
                    <div className="p-6 bg-white/[0.01] flex items-center justify-between border-t border-white/5">
                        <span className="text-sm font-semibold text-[var(--stone-text)]">
                            Total ({recipeItems.length} ingredient{recipeItems.length > 1 ? 's' : ''})
                        </span>
                        <span className="text-sm font-semibold text-[var(--stone-text)]">
                            {totalWeight >= 1000
                                ? `${(totalWeight / 1000).toFixed(2)} kg`
                                : `${totalWeight.toFixed(0)} g`
                            }
                        </span>
                    </div>
                ) : (
                    <div className="p-6 bg-white/[0.01]">
                        <button
                            onClick={() => setShowIngredientSearch(true)}
                            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/10 rounded-xl text-[var(--theme-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] transition-all group font-medium bg-transparent cursor-pointer"
                        >
                            <Plus size={18} className="group-hover:scale-110 transition-transform" />
                            Add Ingredient
                        </button>
                    </div>
                )}
            </div>

            {/* Info box for costing (semi-finished) */}
            {recipeItems.length > 0 && productType === 'semi_finished' && (
                <div className="flex items-start gap-3 p-4 bg-[var(--color-gold)]/5 rounded-xl border border-[var(--color-gold)]/20">
                    <Info size={20} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                    <div className="text-xs text-[var(--color-gold)]/80">
                        <strong>Cost calculation:</strong> The cost price of this semi-finished product will be calculated
                        by adding the cost of each ingredient. To produce a different quantity,
                        multiply the cost by the desired weight (e.g., 2.5 kg = cost x 2.5).
                    </div>
                </div>
            )}
        </div>
    )
}
