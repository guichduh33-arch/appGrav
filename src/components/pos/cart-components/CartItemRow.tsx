import { Trash2, Tag, Plus, Minus, Lock } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import type { CartItem } from '@/stores/cartStore'

interface CartItemRowProps {
    item: CartItem
    isLocked: boolean
    onItemClick?: (item: CartItem) => void
    onQuantityChange: (itemId: string, newQuantity: number) => void
    onDeleteClick: (itemId: string) => void
    onDiscountClick: (item: CartItem) => void
}

export function CartItemRow({
    item,
    isLocked,
    onItemClick,
    onQuantityChange,
    onDeleteClick,
    onDiscountClick,
}: CartItemRowProps) {
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
                {item.modifiers.length > 0 && (
                    <div className="cart-item__mods">
                        {item.modifiers.map(m => m.optionLabel).join(', ')}
                    </div>
                )}
                {item.notes && (
                    <div className="cart-item__notes">{item.notes}</div>
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
                        {formatPrice(item.totalPrice)}
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
}
