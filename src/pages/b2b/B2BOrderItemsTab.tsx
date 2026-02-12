import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/helpers'
import type { OrderItem } from './b2bOrderDetailTypes'

interface B2BOrderItemsTabProps {
    items: OrderItem[]
}

export default function B2BOrderItemsTab({ items }: B2BOrderItemsTabProps) {
    return (
        <div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Product</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Qty</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Unit Price</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Discount</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Total</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Delivered</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="[&:last-child>td]:border-b-0">
                            <td className="p-md text-sm border-b border-border">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{item.product_name}</span>
                                    {item.product_sku && (
                                        <span className="text-xs text-[var(--color-gris-chaud)]">{item.product_sku}</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-md text-sm border-b border-border">{item.quantity} {item.unit}</td>
                            <td className="p-md text-sm border-b border-border">{formatCurrency(item.unit_price)}</td>
                            <td className="p-md text-sm border-b border-border">
                                {item.discount_percentage > 0
                                    ? `${item.discount_percentage}%`
                                    : '-'
                                }
                            </td>
                            <td className="p-md text-sm border-b border-border"><strong>{formatCurrency(item.line_total)}</strong></td>
                            <td className="p-md text-sm border-b border-border">
                                <span className={cn(
                                    'inline-flex px-2 py-1 rounded-sm text-xs font-semibold',
                                    item.quantity_delivered >= item.quantity
                                        ? 'bg-[rgba(107,142,107,0.1)] text-success'
                                        : 'bg-[rgba(255,153,0,0.1)] text-[#cc7a00]'
                                )}>
                                    {item.quantity_delivered}/{item.quantity}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
