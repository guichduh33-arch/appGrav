import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Tag, CreditCard, Plus, Minus, SendHorizontal, Lock, List, User, QrCode, Star, Crown } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { formatPrice } from '../../utils/helpers'
import {
    PinVerificationModal,
    TableSelectionModal,
    DiscountModal,
    CustomerSearchModal,
} from './modals'
import './Cart.css'

import type { CartItem } from '../../stores/cartStore'

interface SelectedCustomer {
    id: string
    name: string
    company_name: string | null
    loyalty_points: number
    loyalty_tier: string
    category?: {
        name: string
        color: string
        discount_percentage: number | null
    }
}

interface CartProps {
    onCheckout: () => void
    onSendToKitchen?: () => void
    onShowPendingOrders?: () => void
    onItemClick?: (item: CartItem) => void
}

export default function Cart({ onCheckout, onSendToKitchen, onShowPendingOrders, onItemClick }: CartProps) {
    const { t } = useTranslation()
    const {
        items,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        subtotal,
        discountAmount,
        total,
        updateItemQuantity,
        removeItem,
        clearCart,
        setDiscount,
        // Locked items state
        lockedItemIds,
        activeOrderNumber,
        isItemLocked,
        removeLockedItem,
        // Customer state
        customerId,
        customerName,
        setCustomer,
    } = useCartStore()

    // Modal states
    const [showPinModal, setShowPinModal] = useState(false)
    const [showTableModal, setShowTableModal] = useState(false)
    const [showDiscountModal, setShowDiscountModal] = useState(false)
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null)
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null)
    const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null)

    // Use active order number if available, otherwise generate temp number
    const displayOrderNumber = activeOrderNumber || `#${String(Date.now()).slice(-4)}`

    // Check if there are any locked items (sent to kitchen)
    const hasLockedItems = lockedItemIds.length > 0
    const hasUnlockedItems = items.some(item => !lockedItemIds.includes(item.id))

    // Handle order type change - show table modal if dine_in selected
    const handleOrderTypeChange = (type: 'dine_in' | 'takeaway' | 'delivery') => {
        if (type === 'dine_in') {
            // For dine_in, ALWAYS show table modal to force selection
            setShowTableModal(true)
            setOrderType(type)
        } else {
            // For takeaway/delivery, no table needed
            setTableNumber(null)
            setOrderType(type)
        }
    }

    // Handle table selection
    const handleTableSelect = (table: string) => {
        setTableNumber(table)
        setShowTableModal(false)
    }

    // Handle discount apply
    const handleApplyDiscount = (_amount: number, type: 'percentage' | 'fixed', value: number) => {
        setDiscount(type === 'percentage' ? 'percent' : 'amount', value, null)
    }

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

    // Handle customer selection
    const handleSelectCustomer = (customer: SelectedCustomer | null) => {
        if (customer) {
            setSelectedCustomer(customer)
            setCustomer(customer.id, customer.company_name || customer.name)
        } else {
            setSelectedCustomer(null)
            setCustomer(null, null)
        }
    }

    // Get tier color
    const getTierColor = (tier: string) => {
        const colors: Record<string, string> = {
            bronze: '#cd7f32',
            silver: '#c0c0c0',
            gold: '#ffd700',
            platinum: '#e5e4e2'
        }
        return colors[tier] || '#6366f1'
    }

    return (
        <aside className="pos-cart">
            {/* Pending Orders Button - Above Cart */}
            <div className="pos-cart__pending-button">
                <button
                    type="button"
                    className="btn btn-pending-orders"
                    onClick={onShowPendingOrders}
                >
                    <List size={18} />
                    Pending Orders
                </button>
            </div>

            {/* Header */}
            <div className="pos-cart__header">
                <div className="pos-cart__header-row">
                    {/* Order Type Selector */}
                    <div className="pos-cart__types">
                        {(['dine_in', 'takeaway'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`order-type-btn ${orderType === type ? 'is-active' : ''}`}
                                onClick={() => handleOrderTypeChange(type)}
                            >
                                {t(`pos.header.${type}`)}
                            </button>
                        ))}
                    </div>

                    {/* Order Number */}
                    <span className="pos-cart__order-number">
                        {displayOrderNumber}
                        {hasLockedItems && <Lock size={14} className="order-lock-icon" />}
                    </span>

                    {/* Clear Cart Button */}
                    <button
                        type="button"
                        className="btn-icon btn-icon-sm"
                        title={t('cart.clear_title')}
                        onClick={clearCart}
                        disabled={items.length === 0}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Show table number if dine_in and table selected */}
                {orderType === 'dine_in' && tableNumber && (
                    <div className="pos-cart__table-info">
                        <span>Table: {tableNumber}</span>
                        <button
                            type="button"
                            className="btn-change-table"
                            onClick={() => setShowTableModal(true)}
                        >
                            Changer
                        </button>
                    </div>
                )}

                {/* Customer Selection */}
                <div className="pos-cart__customer">
                    {selectedCustomer || customerId ? (
                        <button
                            type="button"
                            className="customer-badge"
                            onClick={() => setShowCustomerModal(true)}
                            style={{
                                borderColor: selectedCustomer?.category?.color || getTierColor(selectedCustomer?.loyalty_tier || 'bronze')
                            }}
                        >
                            <div
                                className="customer-badge__avatar"
                                style={{
                                    backgroundColor: selectedCustomer?.category?.color || getTierColor(selectedCustomer?.loyalty_tier || 'bronze')
                                }}
                            >
                                {(selectedCustomer?.company_name || selectedCustomer?.name || customerName || '?')[0].toUpperCase()}
                            </div>
                            <div className="customer-badge__info">
                                <span className="customer-badge__name">
                                    {selectedCustomer?.company_name || selectedCustomer?.name || customerName}
                                </span>
                                <span className="customer-badge__points">
                                    <Star size={10} />
                                    {selectedCustomer?.loyalty_points?.toLocaleString() || 0} pts
                                    {selectedCustomer?.loyalty_tier && selectedCustomer.loyalty_tier !== 'bronze' && (
                                        <Crown size={10} style={{ color: getTierColor(selectedCustomer.loyalty_tier) }} />
                                    )}
                                </span>
                            </div>
                            {selectedCustomer?.category?.discount_percentage && selectedCustomer.category.discount_percentage > 0 && (
                                <span className="customer-badge__discount">
                                    -{selectedCustomer.category.discount_percentage}%
                                </span>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-add-customer"
                            onClick={() => setShowCustomerModal(true)}
                        >
                            <QrCode size={16} />
                            <User size={16} />
                            <span>Client</span>
                        </button>
                    )}
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
                                            type="button"
                                            className="qty-btn"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleQuantityChange(item.id, item.quantity - 1, item.quantity)
                                            }}
                                            disabled={isLocked}
                                            title={isLocked ? t('cart.qty_pin_required') : t('cart.qty_decrease')}
                                            aria-label={t('cart.qty_decrease')}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            type="button"
                                            className="qty-btn"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleQuantityChange(item.id, item.quantity + 1, item.quantity)
                                            }}
                                            title={t('cart.qty_increase')}
                                            aria-label={t('cart.qty_increase')}
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
                                                setSelectedItemForDiscount(item)
                                                setShowDiscountModal(true)
                                            }}
                                            title="Ajouter une remise"
                                        >
                                            <Tag size={14} />
                                        </button>

                                        <div className="cart-item__price">
                                            {formatPrice(item.totalPrice)}
                                        </div>

                                        <button
                                            type="button"
                                            className={`cart-item__remove ${isLocked ? 'requires-pin' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteClick(item.id)
                                            }}
                                            title={isLocked ? t('cart.remove_pin_required') : t('cart.remove')}
                                        >
                                            {isLocked ? <Lock size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
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
                    <div className="cart-total-row">
                        <button
                            type="button"
                            className="btn-discount-link"
                            onClick={() => setShowDiscountModal(true)}
                        >
                            <Tag size={14} />
                            {t('cart.discount')}
                        </button>
                        <span className="cart-total-row__value text-urgent">
                            {discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}
                        </span>
                    </div>
                    <div className="cart-total-row is-grand-total">
                        <span className="cart-total-row__label">{t('cart.total')}</span>
                        <span className="cart-total-row__value">{formatPrice(total)}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons - Simplified */}
            <div className="pos-cart__buttons">
                <button
                    type="button"
                    className={`btn ${hasLockedItems ? 'btn-kitchen-add' : 'btn-kitchen'}`}
                    onClick={onSendToKitchen}
                    disabled={!hasUnlockedItems && !items.length}
                >
                    <SendHorizontal size={18} />
                    {hasLockedItems ? t('cart.add_to_order') : t('cart.send_to_kitchen')}
                </button>

                <button
                    type="button"
                    className="btn-checkout"
                    onClick={onCheckout}
                    disabled={items.length === 0}
                >
                    <CreditCard size={18} />
                    {t('cart.checkout')}
                </button>
            </div>

            {/* Modals */}
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

            {showTableModal && (
                <TableSelectionModal
                    onSelectTable={handleTableSelect}
                    onClose={() => setShowTableModal(false)}
                />
            )}

            {showDiscountModal && (
                <DiscountModal
                    itemName={selectedItemForDiscount?.product.name}
                    itemPrice={selectedItemForDiscount?.totalPrice}
                    totalPrice={selectedItemForDiscount ? selectedItemForDiscount.totalPrice : total}
                    onApplyDiscount={handleApplyDiscount}
                    onClose={() => {
                        setShowDiscountModal(false)
                        setSelectedItemForDiscount(null)
                    }}
                />
            )}

            {showCustomerModal && (
                <CustomerSearchModal
                    selectedCustomerId={customerId}
                    onSelectCustomer={handleSelectCustomer}
                    onClose={() => setShowCustomerModal(false)}
                />
            )}
        </aside>
    )
}
