import React from 'react'
import { Product } from '../../../types/database'

interface PricesTabProps {
    product: Product
    priceHistory: any[]
}

export const PricesTab: React.FC<PricesTabProps> = ({ product, priceHistory }) => {
    const formattedPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex justify-between items-center">Price History</h3>
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                    <span className="text-green-700 text-sm">Estimated current price: </span>
                    <span className="font-bold text-lg text-green-900 ml-2">{formattedPrice(product.cost_price || 0)}</span>
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse text-[0.95rem] [&_th]:text-left [&_th]:px-4 [&_th]:py-3 [&_th]:bg-gray-50 [&_th]:text-gray-600 [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_th]:border-b-2 [&_th]:border-gray-100 [&_td]:px-4 [&_td]:py-3 [&_td]:border-b [&_td]:border-gray-100 [&_td]:text-gray-700 [&_tbody_tr:hover_td]:bg-gray-50">
                    <thead>
                        <tr>
                            <th>Order Date</th>
                            <th>Supplier</th>
                            <th className="text-right">Quantity</th>
                            <th className="text-right">Unit Price</th>
                            <th className="text-right">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priceHistory.map((item, index) => {
                            const prevItem = priceHistory[index + 1]
                            const priceDiff = prevItem ? item.unit_price - prevItem.unit_price : 0

                            return (
                                <tr key={item.id}>
                                    <td className="text-gray-600">
                                        {new Date(item.purchase_order?.order_date || item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="font-medium text-gray-800">
                                        {item.purchase_order?.supplier?.name || 'Unknown Supplier'}
                                    </td>
                                    <td className="text-right font-mono">
                                        {item.quantity_ordered} {product.unit}
                                    </td>
                                    <td className="text-right font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {formattedPrice(item.unit_price)}
                                            {priceDiff !== 0 && (
                                                <span className={`text-xs ${priceDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    {priceDiff > 0 ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-right text-gray-500">
                                        {formattedPrice(item.total)}
                                    </td>
                                </tr>
                            )
                        })}
                        {priceHistory.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No purchase history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
