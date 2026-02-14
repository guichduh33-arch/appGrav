import { formatCurrency } from '../../utils/helpers'
import type { B2BOrder } from './b2bOrderDetailTypes'

interface B2BOrderSummaryProps {
    order: B2BOrder
}

export default function B2BOrderSummary({ order }: B2BOrderSummaryProps) {
    return (
        <div className="sticky top-6">
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Summary</h3>

                <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-[var(--theme-text-muted)]">Subtotal</span>
                    <span className="text-white">{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discount_amount > 0 && (
                    <div className="flex justify-between py-2.5 text-sm text-emerald-400">
                        <span>Discount {order.discount_type === 'percentage' ? `(${order.discount_value}%)` : ''}</span>
                        <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                )}

                <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-[var(--theme-text-muted)]">Tax ({order.tax_rate}%)</span>
                    <span className="text-white">{formatCurrency(order.tax_amount)}</span>
                </div>

                <div className="h-px bg-white/5 my-4"></div>

                <div className="flex justify-between text-xl font-bold text-[var(--color-gold)]">
                    <span>Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                </div>

                {order.notes && (
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Notes</h4>
                        <p className="text-sm text-white">{order.notes}</p>
                    </div>
                )}

                {order.internal_notes && (
                    <div className="mt-4 -mx-6 px-6 py-4 bg-amber-500/5 border-t border-amber-500/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Internal Notes</h4>
                        <p className="text-sm text-white">{order.internal_notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
