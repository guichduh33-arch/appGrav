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
                        {['Product', 'Qty', 'Unit Price', 'Discount', 'Total', 'Delivered'].map(th => (
                            <th key={th} className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] border-b border-white/5">{th}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="border-b border-white/5 [&:last-child]:border-b-0">
                            <td className="p-4 text-sm">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium text-white">{item.product_name}</span>
                                    {item.product_sku && (
                                        <span className="text-xs text-[var(--theme-text-muted)]">{item.product_sku}</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-sm text-white">{item.quantity} {item.unit}</td>
                            <td className="p-4 text-sm text-[var(--theme-text-muted)]">{formatCurrency(item.unit_price)}</td>
                            <td className="p-4 text-sm text-[var(--theme-text-muted)]">
                                {item.discount_percentage > 0
                                    ? `${item.discount_percentage}%`
                                    : '-'
                                }
                            </td>
                            <td className="p-4 text-sm"><strong className="text-[var(--color-gold)]">{formatCurrency(item.line_total)}</strong></td>
                            <td className="p-4 text-sm">
                                <span className={cn(
                                    'inline-flex px-2 py-1 rounded-full text-xs font-semibold border',
                                    item.quantity_delivered >= item.quantity
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
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
