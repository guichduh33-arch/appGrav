import React, { useState } from 'react'
import { AlertTriangle, Scale, Calculator, TrendingUp } from 'lucide-react'
import { Product, Recipe } from '../../../types/database'

interface CostingTabProps {
    product: Product
    recipeItems: (Recipe & { material: Product })[]
}

export const CostingTab: React.FC<CostingTabProps> = ({ product, recipeItems }) => {
    const [targetQuantity, setTargetQuantity] = useState<number>(1)

    const formattedPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const costPerKg = recipeItems.reduce((total, item) => {
        const cost = item.material.cost_price || 0
        return total + (cost * item.quantity)
    }, 0)

    const calculatedCost = costPerKg * targetQuantity

    const margin = product?.retail_price
        ? ((product.retail_price - costPerKg) / product.retail_price) * 100
        : 0

    const isSemiFinished = product.product_type === 'semi_finished'

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cost Breakdown Table */}
            <div className="lg:col-span-8 space-y-6">
                {/* Semi-finished banner */}
                {isSemiFinished && (
                    <div className="flex items-center gap-4 p-5 bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                            <Scale size={24} className="text-[var(--color-gold)]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-[var(--color-gold)] m-0">Cost per kilogram</h3>
                            <p className="text-xs text-[var(--color-gold)]/70 mt-0.5 m-0">
                                Costs below are calculated for <strong>1 kg</strong> of this semi-finished product.
                            </p>
                        </div>
                        <div className="text-right bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                            <div className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-wider font-bold">Cost / KG</div>
                            <div className="text-xl font-bold text-[var(--color-gold)]">{formattedPrice(costPerKg)}</div>
                        </div>
                    </div>
                )}

                {/* Quantity Calculator */}
                {isSemiFinished && (
                    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <Calculator size={18} className="text-[var(--color-gold)]" />
                            <span className="font-semibold text-white text-sm">Cost calculator:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--theme-text-secondary)] text-sm">For</span>
                                <input
                                    type="number"
                                    value={targetQuantity}
                                    onChange={(e) => setTargetQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                                    step="0.1"
                                    min="0.1"
                                    className="w-20 bg-black/40 border border-[var(--color-gold)]/30 rounded-lg text-center font-semibold text-white text-sm py-2 focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none"
                                />
                                <span className="text-[var(--theme-text-secondary)] text-sm">kg</span>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <TrendingUp size={16} className="text-[var(--color-gold)]" />
                                <span className="text-lg font-bold text-[var(--color-gold)]">
                                    {formattedPrice(calculatedCost)}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {[0.5, 1, 2, 2.5, 5, 10].map(qty => (
                                <button
                                    key={qty}
                                    onClick={() => setTargetQuantity(qty)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                        targetQuantity === qty
                                            ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30'
                                            : 'bg-white/5 text-[var(--theme-text-muted)] border border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {qty} kg
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cost Breakdown Table */}
                <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
                            Cost Breakdown
                            {isSemiFinished && <span className="text-[var(--theme-text-muted)] font-normal ml-2 text-sm">(for 1 kg)</span>}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-[var(--muted-smoke)]">
                                    <th className="px-6 py-4 font-medium">Ingredient</th>
                                    <th className="px-6 py-4 font-medium text-right">Qty Used</th>
                                    <th className="px-6 py-4 font-medium text-center">Unit</th>
                                    <th className="px-6 py-4 font-medium text-right">Unit Cost</th>
                                    <th className="px-6 py-4 font-medium text-right">Subtotal</th>
                                    <th className="px-6 py-4 font-medium text-right">% of Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recipeItems.map(item => {
                                    const unitCost = item.material.cost_price || 0
                                    const lineCost = unitCost * item.quantity
                                    const percentage = costPerKg > 0 ? (lineCost / costPerKg) * 100 : 0
                                    return (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{item.material.name}</div>
                                                <div className="text-[10px] text-[var(--color-gold)]/50 uppercase tracking-tighter">{item.material.sku}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-[var(--stone-text)]">{item.quantity}</td>
                                            <td className="px-6 py-4 text-center text-[var(--theme-text-muted)] font-light">{item.unit || item.material.unit}</td>
                                            <td className="px-6 py-4 text-right text-[var(--theme-text-muted)] font-light">{formattedPrice(unitCost)}</td>
                                            <td className="px-6 py-4 text-right font-medium text-[var(--color-gold)]">{formattedPrice(lineCost)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[var(--color-gold)] transition-all duration-500"
                                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-[var(--theme-text-muted)] w-12 text-right">{percentage.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {recipeItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--theme-text-muted)] italic text-sm">
                                            No ingredients defined. Add ingredients to the recipe to see cost breakdown.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {recipeItems.length > 0 && (
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <span className="text-sm text-[var(--stone-text)]">
                                Base Material Cost
                                {isSemiFinished && <span className="text-[var(--theme-text-muted)]"> (1 kg)</span>}
                            </span>
                            <span className="text-2xl font-semibold text-[var(--stone-text)]">{formattedPrice(costPerKg)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Financial Analysis */}
            <aside className="lg:col-span-4 sticky top-24 space-y-6">
                {/* Financial Summary Card */}
                <div className="bg-[var(--onyx-surface)] border border-[var(--color-gold)]/20 rounded-xl overflow-hidden shadow-2xl relative">
                    <div className="p-8">
                        <h2 className="text-xl font-medium text-white mb-8">Financial Analysis</h2>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--theme-text-muted)]">
                                        Material Cost
                                        {isSemiFinished && <span className="text-xs"> / kg</span>}
                                    </span>
                                    <span className="text-[var(--stone-text)] font-medium">{formattedPrice(costPerKg)}</span>
                                </div>
                                {!isSemiFinished && (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[var(--theme-text-muted)]">Selling Price</span>
                                            <span className="text-[var(--stone-text)] font-medium">{formattedPrice(product.retail_price || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[var(--theme-text-muted)]">Gross Profit</span>
                                            <span className={`font-medium ${(product.retail_price || 0) - costPerKg < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {formattedPrice((product.retail_price || 0) - costPerKg)}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-[var(--stone-text)] font-semibold">
                                        {isSemiFinished ? 'Total Cost / kg' : 'Gross Margin'}
                                    </span>
                                    <span className="text-xl font-bold text-[var(--color-gold)]">
                                        {isSemiFinished ? formattedPrice(costPerKg) : `${margin.toFixed(1)}%`}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/20 to-transparent" />

                            {/* Margin bar for finished products */}
                            {!isSemiFinished && (
                                <div>
                                    <div className="flex justify-between mb-2 text-[10px] uppercase text-[var(--theme-text-muted)] font-bold tracking-wider">
                                        <span>0%</span>
                                        <span className="text-[var(--color-gold)]">30% threshold</span>
                                        <span>100%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${margin < 0 ? 'bg-red-400' : margin < 30 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                            style={{ width: `${Math.max(0, Math.min(margin, 100))}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pricing Card */}
                            {!isSemiFinished && (
                                <div className="bg-black/40 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[var(--theme-text-muted)]">Current Retail Price</span>
                                        <span className="text-[var(--stone-text)] font-medium">{formattedPrice(product.retail_price || 0)}</span>
                                    </div>
                                    {margin < 0 && (
                                        <div className="flex items-center gap-2 text-[11px] text-red-400 bg-red-400/10 p-2 rounded-lg">
                                            <AlertTriangle size={14} />
                                            This product is sold at a loss!
                                        </div>
                                    )}
                                    {margin >= 0 && margin < 30 && (
                                        <div className="flex items-center gap-2 text-[11px] text-amber-400 bg-amber-400/10 p-2 rounded-lg">
                                            <AlertTriangle size={14} />
                                            Low margin! Consider adjusting the selling price.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Semi-finished info */}
                            {isSemiFinished && (
                                <div className="p-3 bg-[var(--color-gold)]/5 rounded border border-[var(--color-gold)]/20 text-[11px] text-[var(--color-gold)]/80 italic">
                                    Semi-finished products are generally not sold directly.
                                    The cost is used to calculate the cost of finished products that use it.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-white mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-[var(--color-gold)]/5 rounded-lg border border-[var(--color-gold)]/10">
                            <div className="text-2xl font-bold text-[var(--color-gold)]">{recipeItems.length}</div>
                            <div className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Ingredients</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="text-xl font-bold text-[var(--stone-text)]">
                                {recipeItems.length > 0 ? formattedPrice(costPerKg / recipeItems.length) : '-'}
                            </div>
                            <div className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Avg. Cost</div>
                        </div>
                    </div>
                    {isSemiFinished && (
                        <div className="grid grid-cols-2 gap-4 text-center mt-4">
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-lg font-bold text-[var(--stone-text)]">{formattedPrice(costPerKg / 10)}</div>
                                <div className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Cost / 100g</div>
                            </div>
                            <div className="p-4 bg-[var(--color-gold)]/5 rounded-lg border border-[var(--color-gold)]/10">
                                <div className="text-lg font-bold text-[var(--color-gold)]">{formattedPrice(costPerKg * targetQuantity)}</div>
                                <div className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Cost for {targetQuantity} kg</div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    )
}
