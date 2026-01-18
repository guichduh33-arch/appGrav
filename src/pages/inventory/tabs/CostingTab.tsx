import React, { useState } from 'react'
import { AlertTriangle, Scale, Calculator, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Product, Recipe } from '../../../types/database'

interface CostingTabProps {
    product: Product
    recipeItems: (Recipe & { material: Product })[]
}

export const CostingTab: React.FC<CostingTabProps> = ({ product, recipeItems }) => {
    const { t } = useTranslation()
    const [targetQuantity, setTargetQuantity] = useState<number>(1)

    const formattedPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    // Cost per 1 kg (base calculation)
    const costPerKg = recipeItems.reduce((total, item) => {
        const cost = item.material.cost_price || 0
        return total + (cost * item.quantity)
    }, 0)

    // Cost for target quantity
    const calculatedCost = costPerKg * targetQuantity

    const margin = product?.retail_price
        ? ((product.retail_price - costPerKg) / product.retail_price) * 100
        : 0

    const isSemiFinished = product.product_type === 'semi_finished'

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Banner for semi-finished products */}
            {isSemiFinished && (
                <div className="lg:col-span-2" style={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem 1.5rem',
                    border: '1px solid #FCD34D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <Scale size={24} style={{ color: '#D97706' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#92400E' }}>
                            Coût de revient par kilogramme
                        </h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#B45309' }}>
                            Les coûts ci-dessous sont calculés pour <strong>1 kg</strong> de ce semi-produit.
                            Utilisez le calculateur pour estimer le coût d'une quantité différente.
                        </p>
                    </div>
                    <div style={{
                        textAlign: 'right',
                        background: 'white',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 500 }}>COÛT / KG</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706' }}>
                            {formattedPrice(costPerKg)}
                        </div>
                    </div>
                </div>
            )}

            {/* Quantity Calculator for semi-finished */}
            {isSemiFinished && (
                <div className="lg:col-span-2 card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Calculator size={20} style={{ color: '#16A34A' }} />
                        <span style={{ fontWeight: 600, color: '#166534' }}>Calculateur de coût :</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#166534' }}>Pour</span>
                            <input
                                type="number"
                                value={targetQuantity}
                                onChange={(e) => setTargetQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                                step="0.1"
                                min="0.1"
                                style={{
                                    width: '80px',
                                    padding: '0.5rem',
                                    border: '2px solid #86EFAC',
                                    borderRadius: '0.5rem',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                }}
                            />
                            <span style={{ color: '#166534' }}>kg</span>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={18} style={{ color: '#16A34A' }} />
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>
                                {formattedPrice(calculatedCost)}
                            </span>
                        </div>
                    </div>
                    {/* Quick quantity buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {[0.5, 1, 2, 2.5, 5, 10].map(qty => (
                            <button
                                key={qty}
                                onClick={() => setTargetQuantity(qty)}
                                style={{
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '0.375rem',
                                    border: targetQuantity === qty ? '2px solid #16A34A' : '1px solid #D1D5DB',
                                    background: targetQuantity === qty ? '#DCFCE7' : 'white',
                                    color: targetQuantity === qty ? '#166534' : '#6B7280',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {qty} kg
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="card lg:col-span-2">
                <h3 className="card-title">
                    {t('product_detail.costing.detail_title')}
                    {isSemiFinished && <span style={{ fontWeight: 400, color: '#8B7355', marginLeft: '0.5rem' }}>(pour 1 kg)</span>}
                </h3>
                <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                    <table className="detail-table">
                        <thead>
                            <tr>
                                <th>{t('product_detail.costing.ingredient')}</th>
                                <th className="text-right">{t('product_detail.costing.qty_used')}</th>
                                <th>{t('product_detail.recipe.unit')}</th>
                                <th className="text-right">{t('product_detail.costing.unit_cost')}</th>
                                <th className="text-right">{t('product_detail.costing.subtotal')}</th>
                                <th className="text-right">{t('product_detail.costing.pct_of_cost')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recipeItems.map(item => {
                                const unitCost = item.material.cost_price || 0
                                const lineCost = unitCost * item.quantity
                                const percentage = costPerKg > 0 ? (lineCost / costPerKg) * 100 : 0
                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="font-medium">{item.material.name}</div>
                                            <div className="text-xs text-gray-400">{item.material.sku}</div>
                                        </td>
                                        <td className="text-right font-mono">{item.quantity}</td>
                                        <td className="text-gray-600">{item.unit || item.material.unit}</td>
                                        <td className="text-right text-gray-600">{formattedPrice(unitCost)}</td>
                                        <td className="text-right font-semibold">{formattedPrice(lineCost)}</td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 progress-bar-container">
                                                    <div
                                                        className="progress-bar-fill bg-blue-500"
                                                        style={{ '--progress-width': `${Math.min(percentage, 100)}%` } as React.CSSProperties}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {recipeItems.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                        {t('product_detail.costing.no_ingredients_costing')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {recipeItems.length > 0 && (
                            <tfoot className="bg-gray-50 font-semibold">
                                <tr>
                                    <td colSpan={4} className="text-right py-3 pr-4">
                                        {t('product_detail.costing.total_material_cost')}
                                        {isSemiFinished && <span style={{ fontWeight: 400, color: '#8B7355' }}> (1 kg)</span>}
                                    </td>
                                    <td className="text-right py-3 pr-4 text-lg">{formattedPrice(costPerKg)}</td>
                                    <td className="text-right py-3 pr-4 text-gray-500">100%</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">{t('product_detail.costing.financial_summary')}</h3>
                <div className="my-4 space-y-3">
                    <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                        <span className="text-gray-600">
                            {t('product_detail.costing.material_cost')}
                            {isSemiFinished && <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}> / kg</span>}
                        </span>
                        <span className="font-bold">{formattedPrice(costPerKg)}</span>
                    </div>
                    {!isSemiFinished && (
                        <>
                            <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                                <span className="text-gray-600">{t('product_detail.costing.selling_price')}</span>
                                <span className="font-bold">{formattedPrice(product.retail_price || 0)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                                <span className="text-gray-600">{t('product_detail.costing.gross_profit')}</span>
                                <span className={`font-bold ${(product.retail_price || 0) - costPerKg < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {formattedPrice((product.retail_price || 0) - costPerKg)}
                                </span>
                            </div>
                            <div className="flex justify-between py-4 bg-gray-50 px-4 rounded-lg mt-4">
                                <span className="font-medium">{t('product_detail.costing.gross_margin')}</span>
                                <span className={`font-bold text-lg ${margin < 30 ? 'text-red-500' : 'text-green-600'}`}>
                                    {margin.toFixed(2)} %
                                </span>
                            </div>
                        </>
                    )}
                    {isSemiFinished && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: '#EFF6FF',
                            borderRadius: '0.5rem',
                            border: '1px solid #BFDBFE'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#1E40AF' }}>
                                <strong>Note :</strong> Les semi-produits ne sont généralement pas vendus directement.
                                Le coût de revient est utilisé pour calculer le coût des produits finis qui l'utilisent.
                            </p>
                        </div>
                    )}
                </div>
                {!isSemiFinished && margin < 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
                        <AlertTriangle size={16} /> <strong>{t('product_detail.costing.warning_loss')}</strong>
                    </div>
                )}
                {!isSemiFinished && margin >= 0 && margin < 30 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex gap-2">
                        <AlertTriangle size={16} /> <strong>{t('product_detail.costing.warning_low_margin')}</strong>
                    </div>
                )}
            </div>

            <div className="card">
                <h3 className="card-title">{isSemiFinished ? 'Analyse du coût' : t('product_detail.costing.margin_analysis')}</h3>
                {!isSemiFinished && (
                    <div className="mt-4">
                        <div className="progress-bar-container h-8">
                            <div
                                className={`progress-bar-fill ${margin < 0 ? 'bg-red-500' : margin < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ '--progress-width': `${Math.max(0, Math.min(margin, 100))}%` } as React.CSSProperties}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>0%</span>
                            <span className="text-yellow-600 font-medium">30% ({t('product_detail.costing.threshold')})</span>
                            <span>100%</span>
                        </div>
                        <div className="text-center mt-2 font-bold text-lg">
                            {margin.toFixed(1)}%
                        </div>
                    </div>
                )}
                <div className={`${isSemiFinished ? 'mt-4' : 'mt-6'} grid grid-cols-2 gap-4 text-center`}>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{recipeItems.length}</div>
                        <div className="text-xs text-blue-500 font-medium">{t('product_detail.costing.ingredients_count')}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                            {recipeItems.length > 0 ? formattedPrice(costPerKg / recipeItems.length) : '-'}
                        </div>
                        <div className="text-xs text-purple-500 font-medium">{t('product_detail.costing.avg_cost_per_ingredient')}</div>
                    </div>
                </div>
                {isSemiFinished && (
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-amber-50 rounded-lg">
                            <div className="text-xl font-bold text-amber-600">{formattedPrice(costPerKg / 10)}</div>
                            <div className="text-xs text-amber-500 font-medium">Coût / 100g</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">{formattedPrice(costPerKg * targetQuantity)}</div>
                            <div className="text-xs text-green-500 font-medium">Coût pour {targetQuantity} kg</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
