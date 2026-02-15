import React from 'react'
import { Product } from '../../../types/database'
import { useProductPriceHistory, type IProductPriceChange } from '@/hooks/products/useProductPriceHistory'

interface PricesTabProps {
    product: Product
    priceHistory: any[]
}

const FIELD_LABELS: Record<string, string> = {
    retail_price: 'Retail Price',
    cost_price: 'Cost Price',
    wholesale_price: 'Wholesale Price',
}

export const PricesTab: React.FC<PricesTabProps> = ({ product, priceHistory }) => {
    const { data: priceChanges = [] } = useProductPriceHistory(product.id)

    const formattedPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            {/* Automatic Price Change Tracking */}
            {priceChanges.length > 0 && (
                <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-semibold text-white">Price Change Log</h3>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1">Automatic tracking of all price modifications</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-[var(--muted-smoke)]">
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Field</th>
                                    <th className="px-6 py-4 font-medium text-right">Old Value</th>
                                    <th className="px-6 py-4 font-medium text-right">New Value</th>
                                    <th className="px-6 py-4 font-medium text-right">Change</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {priceChanges.map((change: IProductPriceChange) => {
                                    const diff = (change.new_value ?? 0) - (change.old_value ?? 0)
                                    return (
                                        <tr key={change.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                                                {new Date(change.changed_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-white">
                                                {FIELD_LABELS[change.field_changed] || change.field_changed}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-[var(--theme-text-muted)]">
                                                {change.old_value != null ? formattedPrice(change.old_value) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-[var(--color-gold)]">
                                                {change.new_value != null ? formattedPrice(change.new_value) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                {diff !== 0 && (
                                                    <span className={diff > 0 ? 'text-red-400' : 'text-emerald-400'}>
                                                        {diff > 0 ? '+' : ''}{formattedPrice(diff)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Purchase Order Price History (existing) */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Purchase History</h3>
                    <div className="bg-[var(--color-gold)]/10 px-4 py-2 rounded border border-[var(--color-gold)]/20">
                        <span className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-wider font-bold">Estimated current: </span>
                        <span className="font-bold text-lg text-[var(--color-gold)] ml-2">{formattedPrice(product.cost_price || 0)}</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-[var(--muted-smoke)]">
                                <th className="px-6 py-4 font-medium">Order Date</th>
                                <th className="px-6 py-4 font-medium">Supplier</th>
                                <th className="px-6 py-4 font-medium text-right">Quantity</th>
                                <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                                <th className="px-6 py-4 font-medium text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {priceHistory.map((item: any, index: number) => {
                                const prevItem = priceHistory[index + 1]
                                const priceDiff = prevItem ? item.unit_price - prevItem.unit_price : 0

                                return (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                                            {new Date(item.purchase_order?.order_date || item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {item.purchase_order?.supplier?.name || 'Unknown Supplier'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-mono text-[var(--stone-text)]">
                                            {item.quantity_ordered} {product.unit}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="font-medium text-[var(--color-gold)]">{formattedPrice(item.unit_price)}</span>
                                                {priceDiff !== 0 && (
                                                    <span className={`text-xs ${priceDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {priceDiff > 0 ? '\u25B2' : '\u25BC'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-[var(--theme-text-muted)]">
                                            {formattedPrice(item.total)}
                                        </td>
                                    </tr>
                                )
                            })}
                            {priceHistory.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-[var(--theme-text-muted)] italic text-sm">
                                        No purchase history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
