import { memo } from 'react'
import { Trash2, Tag, Plus, Minus, Lock, Percent } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore, type CartItem } from '@/stores/cartStore'
import type { IItemPromotionDiscount } from '@/services/pos/promotionEngine'

interface CartItemRowProps {
    item: CartItem
    isLocked: boolean
    onItemClick?: (item: CartItem) => void
    onQuantityChange: (itemId: string, newQuantity: number) => void
    onDeleteClick: (itemId: string) => void
    onDiscountClick: (item: CartItem) => void
}

export const CartItemRow = memo(function CartItemRow({
    item,
    isLocked,
    onItemClick,
    onQuantityChange,
    onDeleteClick,
    onDiscountClick,
}: CartItemRowProps) {
    const itemPromotions = useCartStore(state => state.promotionDiscounts.filter(d => d.itemId === item.id))
    const totalPromoDiscount = itemPromotions.reduce((sum, d) => sum + d.discountAmount, 0)

    return (
        <div
            className={`cart-item ${isLocked ? 'is-locked' : ''}`}
            onClick={() => !isLocked && onItemClick?.(item)}
        >
            <div className="cart-item__info">
                <div className="cart-item__name">
                    {isLocked && <Lock size={12} className="cart-item__lock-icon" />}
                    <span className="cart-item__qty">{item.quantity}x</span>
                    {item.type === 'combo' ? item.combo?.name : item.product?.name}
                </div>
                {/* Combo selections (Story 6.6) */}
                {item.type === 'combo' && item.comboSelections && item.comboSelections.length > 0 && (
                    <div className="cart-item__combo-selections">
                        {item.comboSelections.map((sel) => (
                            <div key={sel.item_id} className="cart-item__combo-sel">
                                <span className="cart-item__combo-sel-name">{sel.product_name}</span>
                                {sel.price_adjustment !== 0 && (
                                    <span className="cart-item__combo-sel-adj">
                                        {sel.price_adjustment > 0 ? '+' : ''}{formatPrice(sel.price_adjustment)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {item.modifiers.length > 0 && (
                    <div className="cart-item__mods">
                        {item.modifiers.map(m => m.optionLabel).join(', ')}
                    </div>
                )}
                {item.notes && (
                    <div className="cart-item__notes">{item.notes}</div>
                )}
                {/* Promotion badges (Story 6.5) */}
                {itemPromotions.length > 0 && (
                    <div className="cart-item__promos">
                        {itemPromotions.map((promo) => (
                            <PromotionBadge key={promo.promotionId} discount={promo} />
                        ))}
                    </div>
                )}
            </div>

            <div className="cart-item__controls">
                <div className="cart-item__quantity">
                    <button
                        type="button"
                        className="qty-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            onQuantityChange(item.id, item.quantity - 1)
                        }}
                        disabled={isLocked}
                        title={isLocked ? 'PIN required' : 'Decrease quantity'}
                        aria-label="Decrease quantity"
                    >
                        <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                        type="button"
                        className="qty-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            onQuantityChange(item.id, item.quantity + 1)
                        }}
                        title="Increase quantity"
                        aria-label="Increase quantity"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="cart-item__actions">
                    <button
                        type="button"
                        className="cart-item__discount-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDiscountClick(item)
                        }}
                        title="Add discount"
                    >
                        <Tag size={14} />
                    </button>

                    <div className="cart-item__price">
                        {totalPromoDiscount > 0 ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '11px' }}>
                                    {formatPrice(item.totalPrice)}
                                </span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>
                                    {formatPrice(item.totalPrice - totalPromoDiscount)}
                                </span>
                            </>
                        ) : (
                            formatPrice(item.totalPrice)
                        )}
                        {item.appliedPriceType && item.appliedPriceType !== 'retail' && (
                            <span
                                className="cart-item__price-type"
                                style={{
                                    display: 'block',
                                    fontSize: '9px',
                                    color: item.appliedPriceType === 'wholesale' ? '#059669' :
                                           item.appliedPriceType === 'discount' ? '#3b82f6' :
                                           item.appliedPriceType === 'custom' ? '#8b5cf6' : '#64748b',
                                    fontWeight: 500,
                                }}
                            >
                                {item.appliedPriceType === 'wholesale' && 'Wholesale'}
                                {item.appliedPriceType === 'discount' && 'VIP'}
                                {item.appliedPriceType === 'custom' && 'Custom'}
                            </span>
                        )}
                        {item.savingsAmount && item.savingsAmount > 0 && (
                            <span
                                className="cart-item__savings"
                                style={{
                                    display: 'block',
                                    fontSize: '9px',
                                    color: '#059669',
                                }}
                            >
                                Save {formatPrice(item.savingsAmount)}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className={`cart-item__remove ${isLocked ? 'requires-pin' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteClick(item.id)
                        }}
                        title={isLocked ? 'PIN required to remove' : 'Remove'}
                    >
                        {isLocked ? <Lock size={16} /> : <Trash2 size={16} />}
                    </button>
                </div>
            </div>
        </div>
    )
})

const PromotionBadge = memo(function PromotionBadge({ discount }: { discount: IItemPromotionDiscount }) {
    return (
        <span
            className="cart-item__promo-badge"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '9px',
                fontWeight: 600,
                color: '#ea580c',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '4px',
                padding: '1px 5px',
                marginRight: '4px',
            }}
            title={`${discount.promotionName}: -${formatPrice(discount.discountAmount)}`}
        >
            <Percent size={8} />
            {discount.description}
        </span>
    )
})
