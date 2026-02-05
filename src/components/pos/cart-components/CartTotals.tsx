import { Tag } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'

interface CartTotalsProps {
    subtotal: number
    discountAmount: number
    total: number
    onDiscountClick: () => void
}

export function CartTotals({ subtotal, discountAmount, total, onDiscountClick }: CartTotalsProps) {
    return (
        <div className="pos-cart__totals">
            <div className="cart-total-row">
                <span className="cart-total-row__label">Subtotal</span>
                <span className="cart-total-row__value">{formatPrice(subtotal)}</span>
            </div>
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
