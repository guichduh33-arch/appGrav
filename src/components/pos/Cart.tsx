import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, User, Tag, CreditCard, Plus, Minus, SendHorizontal, Clock, Lock } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { formatPrice } from '../../utils/helpers'
import PinVerificationModal from './PinVerificationModal'
import './Cart.css'

import type { CartItem } from '../../stores/cartStore'

interface CartProps {
    onCheckout: () => void
    onSendToKitchen?: () => void
    onHoldOrder?: () => void
    onItemClick?: (item: CartItem) => void
}

export default function Cart({ onCheckout, onSendToKitchen, onHoldOrder, onItemClick }: CartProps) {
    const { t } = useTranslation()
    const {
        items,
        orderType,
        setOrderType,
        tableNumber,
        subtotal,
        discountAmount,
        total,
        updateItemQuantity,
        removeItem,
        clearCart,
        // Locked items state
        lockedItemIds,
        activeOrderNumber,
        isItemLocked,
        removeLockedItem,
    } = useCartStore()

    // PIN verification state
    const [showPinModal, setShowPinModal] = useState(false)
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null)

    // Use active order number if available, otherwise generate temp number
    const displayOrderNumber = activeOrderNumber || `#${String(Date.now()).slice(-4)}`

    // Check if there are any locked items (sent to kitchen)
    const hasLockedItems = lockedItemIds.length > 0
    const hasUnlockedItems = items.some(item => !lockedItemIds.includes(item.id))

    // Handle delete click - check if item is locked
    const handleDeleteClick = (itemId: string) => {
        if (isItemLocked(itemId)) {
            // Item is locked, show PIN modal
            setPendingDeleteItemId(itemId)
            setShowPinModal(true)
        } else {
            // Item is not locked, delete normally
            removeItem(itemId)
        }
    }

    // Handle PIN verification result
    const handlePinVerify = (verified: boolean) => {
        if (verified && pendingDeleteItemId) {
            removeLockedItem(pendingDeleteItemId)
        }
        setPendingDeleteItemId(null)
    }

    // Handle quantity change - only allow decrease on unlocked items
    const handleQuantityChange = (itemId: string, newQuantity: number, currentQuantity: number) => {
        if (isItemLocked(itemId) && newQuantity < currentQuantity) {
            // Trying to reduce locked item quantity - show PIN modal
            setPendingDeleteItemId(itemId)
            setShowPinModal(true)
            return
        }
        updateItemQuantity(itemId, newQuantity)
    }

    return (
        <aside className="pos-cart">
            {/* Header */}
            <div className="pos-cart__header">
                <div className="pos-cart__header-top">
                    <span className="pos-cart__order-number">
                        {displayOrderNumber}
                        {hasLockedItems && <Lock size={14} className="order-lock-icon" />}
                    </span>
                    <button
                        className="btn-icon btn-icon-sm"
                        title={t('cart.clear_title')}
                        onClick={clearCart}
                        disabled={items.length === 0}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Order Type Selector */}
                <div className="pos-cart__types">
                    {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
                        <button
                            key={type}
                            className={`order-type-btn ${orderType === type ? 'is-active' : ''}`}
                            onClick={() => setOrderType(type)}
                        >
                            {t(`pos.header.${type}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Items */}
            <div className="pos-cart__items">
                {items.length === 0 ? (
                    <div className="pos-cart__empty">
                        <span className="pos-cart__empty-icon">🛒</span>
                        <p className="pos-cart__empty-text">
                            {t('cart.empty_text')}
                        </p>
                    </div>
                ) : (
                    items.map(item => {
                        const isLocked = isItemLocked(item.id)
                        return (
                            <div
                                key={item.id}
                                className={`cart-item ${isLocked ? 'is-locked' : ''}`}
                                onClick={() => !isLocked && onItemClick?.(item)}
                            >
                                <div className="cart-item__info">
                                    <div className="cart-item__name">
                                        {isLocked && <Lock size={12} className="cart-item__lock-icon" />}
                                        <span className="cart-item__qty">{item.quantity}{t('cart.qty_prefix')}</span>
                                        {item.product.name}
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
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.quantity)}
                                            disabled={isLocked}
                                            title={isLocked ? t('cart.qty_pin_required') : t('cart.qty_decrease')}
                                            aria-label={t('cart.qty_decrease')}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.quantity)}
                                            title={t('cart.qty_increase')}
                                            aria-label={t('cart.qty_increase')}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div className="cart-item__price">
                                        {formatPrice(item.totalPrice)}
                                    </div>

                                    <button
                                        className={`cart-item__remove ${isLocked ? 'requires-pin' : ''}`}
                                        onClick={() => handleDeleteClick(item.id)}
                                        title={isLocked ? t('cart.remove_pin_required') : t('cart.remove')}
                                    >
                                        {isLocked ? <Lock size={16} /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Totals */}
            {items.length > 0 && (
                <div className="pos-cart__totals">
                    <div className="cart-total-row">
                        <span className="cart-total-row__label">{t('cart.subtotal')}</span>
                        <span className="cart-total-row__value">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="cart-total-row">
                            <span className="cart-total-row__label">{t('cart.discount')}</span>
                            <span className="cart-total-row__value text-urgent">-{formatPrice(discountAmount)}</span>
                        </div>
                    )}
                    <div className="cart-total-row is-grand-total">
                        <span className="cart-total-row__label">{t('cart.total')}</span>
                        <span className="cart-total-row__value">{formatPrice(total)}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="pos-cart__buttons">
                <div className="pos-cart__secondary-actions">
                    <button className="btn btn-secondary">
                        <User size={18} />
                        {t('cart.client')}
                    </button>
                    <button className="btn btn-secondary">
                        <Tag size={18} />
                        {t('pos.footer.on_hold')}
                    </button>
                </div>

                {/* Kitchen & Hold Buttons */}
                <div className="pos-cart__workflow-actions">
                    <button
                        className={`btn ${hasLockedItems ? 'btn-kitchen-add' : 'btn-kitchen'}`}
                        onClick={onSendToKitchen}
                        disabled={!hasUnlockedItems && !items.length}
                    >
                        <SendHorizontal size={18} />
                        {hasLockedItems ? t('cart.add_to_order') : t('cart.send_to_kitchen')}
                    </button>
                    <button
                        className="btn btn-hold"
                        onClick={onHoldOrder}
                        disabled={items.length === 0 || hasLockedItems}
                        title={hasLockedItems ? t('cart.hold_error_locked') : undefined}
                    >
                        <Clock size={18} />
                        {t('cart.hold')}
                    </button>
                </div>

                <button
                    className="btn-checkout"
                    onClick={onCheckout}
                    disabled={items.length === 0}
                >
                    <span className="btn-checkout__label">
                        <CreditCard size={18} />
                        {t('cart.checkout')}
                    </span>
                    <span className="btn-checkout__amount">{formatPrice(total)}</span>
                </button>
            </div>

            {/* PIN Verification Modal */}
            {showPinModal && (
                <PinVerificationModal
                    title={t('cart.pin_modal_title')}
                    message={t('cart.pin_modal_message')}
                    onVerify={handlePinVerify}
                    onClose={() => {
                        setShowPinModal(false)
                        setPendingDeleteItemId(null)
                    }}
                />
            )}
        </aside>
    )
}

