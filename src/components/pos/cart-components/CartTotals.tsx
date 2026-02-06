import { Tag, Percent } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore } from '@/stores/cartStore'

interface CartTotalsProps {
    subtotal: number
    discountAmount: number
    total: number
    onDiscountClick: () => void
}

export function CartTotals({ subtotal, discountAmount, total, onDiscountClick }: CartTotalsProps) {
    const promotionTotalDiscount = useCartStore(state => state.promotionTotalDiscount)
    const appliedPromotions = useCartStore(state => state.appliedPromotions)

    return (
        <div className="pos-cart__totals">
            <div className="cart-total-row">
                <span className="cart-total-row__label">Subtotal</span>
                <span className="cart-total-row__value">{formatPrice(subtotal)}</span>
            </div>
            {/* Promotion discounts (Story 6.5) */}
            {promotionTotalDiscount > 0 && (
                <div className="cart-total-row">
                    <span className="cart-total-row__label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontSize: '13px' }}>
                        <Percent size={12} />
                        Promo
                        {appliedPromotions.length === 1 && (
                            <span style={{ fontWeight: 400, fontSize: '11px' }}>({appliedPromotions[0].promotionName})</span>
                        )}
                    </span>
                    <span className="cart-total-row__value" style={{ color: '#ea580c' }}>
                        -{formatPrice(promotionTotalDiscount)}
                    </span>
                </div>
            )}
            <div className="cart-total-row">
                <button
                    type="button"
                    className="btn-discount-link"
                    onClick={onDiscountClick}
                >
                    <Tag size={14} />
                    Discount
                </button>
                <span className="cart-total-row__value text-urgent">
                    {discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}
                </span>
            </div>
            <div className="cart-total-row is-grand-total">
                <span className="cart-total-row__label">TOTAL</span>
                <span className="cart-total-row__value">{formatPrice(total)}</span>
            </div>
        </div>
    )
}
