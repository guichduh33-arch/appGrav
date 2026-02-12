import { memo } from 'react'
import { Tag, Percent } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore } from '@/stores/cartStore'

interface CartTotalsProps {
    subtotal: number
    discountAmount: number
    total: number
    onDiscountClick: () => void
}

export const CartTotals = memo(function CartTotals({ subtotal, discountAmount, total, onDiscountClick }: CartTotalsProps) {
    const promotionTotalDiscount = useCartStore(state => state.promotionTotalDiscount)
    const appliedPromotions = useCartStore(state => state.appliedPromotions)

    return (
        <div className="px-md py-sm bg-zinc-800 border-t border-zinc-700">
            {/* Subtotal row */}
            <div className="flex justify-between mb-1 text-xs text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
            </div>
            {/* Promotion discounts (Story 6.5) */}
            {promotionTotalDiscount > 0 && (
                <div className="flex justify-between mb-1 text-xs text-zinc-400">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontSize: '13px' }}>
                        <Percent size={12} />
                        Promo
                        {appliedPromotions.length === 1 && (
                            <span style={{ fontWeight: 400, fontSize: '11px' }}>({appliedPromotions[0].promotionName})</span>
                        )}
                    </span>
                    <span className="font-semibold" style={{ color: '#ea580c' }}>
                        -{formatPrice(promotionTotalDiscount)}
                    </span>
                </div>
            )}
            {/* Discount row */}
            <div className="flex justify-between mb-1 text-xs text-zinc-400">
                <button
                    type="button"
                    className="bg-transparent border-none p-0 text-zinc-400 text-sm cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:text-gold-light"
                    onClick={onDiscountClick}
                >
                    <Tag size={14} />
                    Discount
                </button>
                <span className="font-semibold text-white text-urgent">
                    {discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}
                </span>
            </div>
            {/* Grand total row */}
            <div className="flex justify-between mt-1.5 pt-1.5 border-t border-dashed border-zinc-600 mb-0">
                <span className="text-base font-bold text-white">TOTAL</span>
                <span className="text-xl font-extrabold text-gold-light">{formatPrice(total)}</span>
            </div>
        </div>
    )
})
