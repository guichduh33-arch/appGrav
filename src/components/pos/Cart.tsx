import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Tag, Lock, List, User, QrCode, Star } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { PinVerificationModal, TableSelectionModal, DiscountModal, CustomerSearchModal } from './modals'
import { LoyaltyBadge } from './LoyaltyBadge'
import { CartItemRow, CartTotals, CartActions } from './cart-components'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import { getTierColor } from '@/constants/loyalty'
import './Cart.css'
import type { CartItem } from '../../stores/cartStore'

interface SelectedCustomer {
    id: string
    name: string
    company_name: string | null
    loyalty_points: number
    loyalty_tier: string
    category?: { name: string; slug: string; color: string; discount_percentage: number | null }
}

interface CartProps {
    onCheckout: () => void
    onSendToKitchen?: () => void
    onShowPendingOrders?: () => void
    onItemClick?: (item: CartItem) => void
}

export default function Cart({ onCheckout, onSendToKitchen, onShowPendingOrders, onItemClick }: CartProps) {
    const { isOffline } = useNetworkStatus()
    const {
        items, orderType, setOrderType, tableNumber, setTableNumber,
        subtotal, discountAmount, total, updateItemQuantity, removeItem, clearCart, setDiscount,
        lockedItemIds, activeOrderNumber, isItemLocked, removeLockedItem,
        customerId, customerName, setCustomerWithCategorySlug,
    } = useCartStore()

    const [showPinModal, setShowPinModal] = useState(false)
    const [showTableModal, setShowTableModal] = useState(false)
    const [showDiscountModal, setShowDiscountModal] = useState(false)
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null)
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null)
    const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null)

    const displayOrderNumber = activeOrderNumber || `#${String(Date.now()).slice(-4)}`
    const hasLockedItems = lockedItemIds.length > 0
    const hasUnlockedItems = items.some(item => !lockedItemIds.includes(item.id))

    const handleOrderTypeChange = (type: 'dine_in' | 'takeaway' | 'delivery') => {
        if (type === 'dine_in') {
            setShowTableModal(true)
        }
        // Clear table for non-dine-in orders
        if (type !== 'dine_in') {
            setTableNumber(null)
        }
        setOrderType(type)
    }

    const handleDeleteClick = (itemId: string) => {
        if (isItemLocked(itemId)) {
            setPendingDeleteItemId(itemId)
            setShowPinModal(true)
        } else {
            removeItem(itemId)
        }
    }

    const handlePinVerify = (verified: boolean) => {
        if (verified && pendingDeleteItemId) removeLockedItem(pendingDeleteItemId)
        setPendingDeleteItemId(null)
    }

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        const item = items.find(i => i.id === itemId)
        if (!item) return
        if (isItemLocked(itemId) && newQuantity < item.quantity) {
            setPendingDeleteItemId(itemId)
            setShowPinModal(true)
            return
        }
        updateItemQuantity(itemId, newQuantity)
    }

    const handleSelectCustomer = (customer: SelectedCustomer | null) => {
        if (customer) {
            setSelectedCustomer(customer)
            setCustomerWithCategorySlug(customer.id, customer.company_name || customer.name, customer.category?.slug ?? null)
        } else {
            setSelectedCustomer(null)
            setCustomerWithCategorySlug(null, null, null)
        }
    }

    const handleRedeemPointsClick = () => {
        if (isOffline) {
            toast.warning('Points redemption requires online connection', { description: 'Please connect to the internet to use loyalty points', duration: 3000 })
        } else {
            toast.info('Points redemption coming soon', { description: 'This feature will be available in a future update', duration: 2000 })
        }
    }

    return (
        <aside className="pos-cart">
            <div className="pos-cart__pending-button">
                <button type="button" className="btn btn-pending-orders" onClick={onShowPendingOrders}>
                    <List size={18} /> Pending Orders
                </button>
            </div>

            <div className="pos-cart__header">
                <div className="pos-cart__header-row">
                    <div className="pos-cart__types">
                        {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
                            <button key={type} type="button" className={`order-type-btn ${orderType === type ? 'is-active' : ''}`} onClick={() => handleOrderTypeChange(type)}>
                                {type === 'dine_in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                            </button>
                        ))}
                    </div>
                    <span className="pos-cart__order-number">
                        {displayOrderNumber}
                        {hasLockedItems && <Lock size={14} className="order-lock-icon" />}
                    </span>
                    <button type="button" className="btn-icon btn-icon-sm" title="Clear cart" onClick={clearCart} disabled={items.length === 0}>
                        <Trash2 size={18} />
                    </button>
                </div>

                {orderType === 'dine_in' && tableNumber && (
                    <div className="pos-cart__table-info">
                        <span>Table: {tableNumber}</span>
                        <button type="button" className="btn-change-table" onClick={() => setShowTableModal(true)}>Change</button>
                    </div>
                )}

                <div className="pos-cart__customer">
                    {selectedCustomer || customerId ? (
                        <button type="button" className="customer-badge" onClick={() => setShowCustomerModal(true)} style={{ borderColor: selectedCustomer?.category?.color || getTierColor(selectedCustomer?.loyalty_tier || 'bronze') }}>
                            <div className="customer-badge__avatar" style={{ backgroundColor: selectedCustomer?.category?.color || getTierColor(selectedCustomer?.loyalty_tier || 'bronze') }}>
                                {(selectedCustomer?.company_name || selectedCustomer?.name || customerName || '?')[0].toUpperCase()}
                            </div>
                            <div className="customer-badge__info">
                                <span className="customer-badge__name">{selectedCustomer?.company_name || selectedCustomer?.name || customerName}</span>
                                {selectedCustomer && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <LoyaltyBadge tier={selectedCustomer.loyalty_tier || 'bronze'} points={selectedCustomer.loyalty_points || 0} isOffline={isOffline} compact={true} />
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRedeemPointsClick() }} className="customer-badge__use-points" style={{ fontSize: '10px', color: isOffline ? '#9ca3af' : '#3b82f6', background: 'none', border: 'none', cursor: isOffline ? 'not-allowed' : 'pointer', textDecoration: 'underline', padding: '2px 4px' }} title={isOffline ? 'Requires online connection' : 'Use loyalty points'}>
                                            <Star size={10} style={{ marginRight: '2px' }} />Use pts
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="customer-badge__discounts">
                                {selectedCustomer?.category?.discount_percentage && selectedCustomer.category.discount_percentage > 0 && (
                                    <span className="customer-badge__discount customer-badge__discount--category" title={`Category: ${selectedCustomer.category.name}`} style={{ backgroundColor: '#3b82f6' }}>
                                        <Tag size={10} />-{selectedCustomer.category.discount_percentage}%
                                    </span>
                                )}
                            </div>
                        </button>
                    ) : (
                        <button type="button" className="btn-add-customer" onClick={() => setShowCustomerModal(true)}>
                            <QrCode size={16} /><User size={16} /><span>Client</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="pos-cart__items">
                {items.length === 0 ? (
                    <div className="pos-cart__empty">
                        <span className="pos-cart__empty-icon">🛒</span>
                        <p className="pos-cart__empty-text">Your cart is empty. Select products.</p>
                    </div>
                ) : (
                    items.map(item => (
                        <CartItemRow
                            key={item.id}
                            item={item}
                            isLocked={isItemLocked(item.id)}
                            onItemClick={onItemClick}
                            onQuantityChange={handleQuantityChange}
                            onDeleteClick={handleDeleteClick}
                            onDiscountClick={(item: CartItem) => { setSelectedItemForDiscount(item); setShowDiscountModal(true) }}
                        />
                    ))
                )}
            </div>

            {items.length > 0 && (
                <CartTotals subtotal={subtotal} discountAmount={discountAmount} total={total} onDiscountClick={() => setShowDiscountModal(true)} />
            )}

            <CartActions hasLockedItems={hasLockedItems} hasUnlockedItems={hasUnlockedItems} itemCount={items.length} onSendToKitchen={onSendToKitchen} onCheckout={onCheckout} />

            {showPinModal && (
                <PinVerificationModal title="Item removal" message="This item is in the kitchen. Manager PIN required." onVerify={handlePinVerify} onClose={() => { setShowPinModal(false); setPendingDeleteItemId(null) }} />
            )}
            {showTableModal && <TableSelectionModal onSelectTable={(t) => { setTableNumber(t); setShowTableModal(false) }} onClose={() => setShowTableModal(false)} />}
            {showDiscountModal && (
                <DiscountModal itemName={selectedItemForDiscount?.type === 'combo' ? selectedItemForDiscount?.combo?.name : selectedItemForDiscount?.product?.name} itemPrice={selectedItemForDiscount?.totalPrice} totalPrice={selectedItemForDiscount ? selectedItemForDiscount.totalPrice : total} onApplyDiscount={(_, type, value) => setDiscount(type === 'percentage' ? 'percent' : 'amount', value, null)} onClose={() => { setShowDiscountModal(false); setSelectedItemForDiscount(null) }} />
            )}
            {showCustomerModal && <CustomerSearchModal selectedCustomerId={customerId} onSelectCustomer={handleSelectCustomer} onClose={() => setShowCustomerModal(false)} />}
        </aside>
    )
}
