import { memo } from 'react'
import { Tag, Percent } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore } from '@/stores/cartStore'
import { cn } from '@/lib/utils'

interface CartTotalsProps {
    subtotal: number
    discountAmount: number
    total: number
    onDiscountClick: () => void
}

export const CartTotals = memo(function CartTotals({ subtotal, discountAmount, total, onDiscountClick }: CartTotalsProps) {
    const promotionTotalDiscount = useCartStore(state => state.promotionTotalDiscount)

    // Tax = total * 10/110 (10% included)
    const taxAmount = Math.round(total * 10 / 110)

    return (
        <div className="px-8 py-6 bg-black/20 border-t border-[#cab06d]/20">
            {/* Subtotal row */}
            <div className="flex justify-between mb-2 text-xs text-[var(--muted-smoke)] uppercase tracking-wider font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-white tracking-normal">{formatPrice(subtotal)}</span>
            </div>
            {/* Promotion discounts */}
            {promotionTotalDiscount > 0 && (
                <div className="flex justify-between mb-2 text-xs text-[#8E8E93] uppercase tracking-wider font-medium">
                    <span className="flex items-center gap-1.5 text-[#10B981]">
                        <Percent size={12} strokeWidth={2.5} />
                        Promo Sav.
                    </span>
                    <span className="font-bold text-[#10B981] tracking-normal">
                        -{formatPrice(promotionTotalDiscount)}
                    </span>
                </div>
            )}
            {/* Discount row */}
            <div className="flex justify-between mb-2 text-xs text-[#8E8E93] uppercase tracking-wider font-medium">
                <button
                    type="button"
                    className="bg-transparent border-none p-0 text-[#8E8E93] text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:text-[#cab06d]"
                    onClick={onDiscountClick}
                >
                    <Tag size={12} />
                    Apply Discount
                </button>
                <span className={cn("font-bold tracking-normal", discountAmount > 0 ? "text-[#10B981]" : "text-white")}>
                    {discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}
                </span>
            </div>
            {/* Tax row */}
            <div className="flex justify-between mb-4 text-[10px] text-[var(--muted-smoke)] uppercase tracking-widest font-medium opacity-50">
                <span>Tax Included (10%)</span>
                <span>{formatPrice(taxAmount)}</span>
            </div>
            {/* Grand total row */}
            <div className="flex justify-between mt-4 pt-4 border-t border-white/10 mb-0">
                <span className="text-sm font-bold text-white tracking-[0.2em] font-display uppercase">Total Amount</span>
                <span className="text-xl font-semibold text-[#cab06d] font-display tracking-tight">{formatPrice(total)}</span>
            </div>
        </div>
    )
})
