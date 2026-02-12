import { formatCurrency } from '../../utils/helpers'
import type { B2BOrder } from './b2bOrderDetailTypes'

interface B2BOrderSummaryProps {
    order: B2BOrder
}

export default function B2BOrderSummary({ order }: B2BOrderSummaryProps) {
    return (
        <div className="sticky top-lg">
            <div className="bg-white rounded-lg shadow p-lg">
                <h3 className="text-lg font-semibold text-[var(--color-brun-chocolat)] mb-lg">Summary</h3>

                <div className="flex justify-between py-sm text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discount_amount > 0 && (
                    <div className="flex justify-between py-sm text-sm text-success">
                        <span>Discount {order.discount_type === 'percentage' ? `(${order.discount_value}%)` : ''}</span>
                        <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                )}

                <div className="flex justify-between py-sm text-sm">
                    <span>Tax ({order.tax_rate}%)</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                </div>

                <div className="h-px bg-border my-md"></div>

                <div className="flex justify-between text-xl font-bold text-[var(--color-brun-chocolat)]">
                    <span>Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                </div>

                {order.notes && (
                    <div className="mt-lg pt-md border-t border-border">
                        <h4 className="text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide mb-xs">Notes</h4>
                        <p className="text-sm text-[var(--color-brun-chocolat)]">{order.notes}</p>
                    </div>
                )}

                {order.internal_notes && (
                    <div className="mt-md -mx-lg px-lg py-md bg-[rgba(234,192,134,0.1)]">
                        <h4 className="text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide mb-xs">Internal Notes</h4>
                        <p className="text-sm text-[var(--color-brun-chocolat)]">{order.internal_notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
