import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Trash2, Tag, Lock, List, User, QrCode, Star, FileText, ChevronDown, ChevronUp, Building2 } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { PinVerificationModal, TableSelectionModal, DiscountModal, CustomerSearchModal } from './modals'
import { LoyaltyBadge } from './LoyaltyBadge'
import { CartItemRow, CartTotals, CartActions } from './cart-components'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import { useDisplayBroadcast } from '@/hooks/pos'
import { getTierColor } from '@/constants/loyalty'
import { cn } from '@/lib/utils'
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

function Cart({ onCheckout, onSendToKitchen, onShowPendingOrders, onItemClick }: CartProps) {
    const { isOffline } = useNetworkStatus()
    const {
        items, orderType, setOrderType, tableNumber, setTableNumber,
        subtotal, discountAmount, total, updateItemQuantity, removeItem, clearCart, setDiscount,
        lockedItemIds, activeOrderNumber, isItemLocked, removeLockedItem,
        customerId, customerName, customerCategorySlug, setCustomerWithCategorySlug,
        orderNotes, setOrderNotes,
    } = useCartStore()

    const [showPinModal, setShowPinModal] = useState(false)
    const [showTableModal, setShowTableModal] = useState(false)
    const [showDiscountModal, setShowDiscountModal] = useState(false)
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null)
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null)
    const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null)
    const [showOrderNotes, setShowOrderNotes] = useState(false)

    // Customer display broadcast
    const { broadcastCart } = useDisplayBroadcast()

    // Broadcast cart updates to customer display
    useEffect(() => {
        broadcastCart(items, subtotal, discountAmount, total)
    }, [items, subtotal, discountAmount, total, broadcastCart])

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
        <aside className="w-[460px] bg-zinc-800 border-l border-zinc-700 flex flex-col flex-shrink-0 z-[15] shadow-[-4px_0_24px_rgba(0,0,0,0.2)] text-white">
            {/* Pending Orders Button */}
            <div className="px-md py-sm bg-zinc-900 border-b border-zinc-700">
                <button
                    type="button"
                    className="w-full p-2.5 bg-zinc-700 border border-zinc-600 rounded-md text-white font-semibold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-zinc-600 hover:border-gold hover:text-gold-light"
                    onClick={onShowPendingOrders}
                >
                    <List size={18} /> Pending Orders
                </button>
            </div>

            {/* Header */}
            <div className="px-md py-sm bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center justify-between gap-sm">
                    {/* Order Type Selector */}
                    <div className="flex gap-1 flex-shrink-0">
                        {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={cn(
                                    'px-3 py-1.5 bg-zinc-700 border-2 border-transparent rounded-md text-xs font-bold text-zinc-300 cursor-pointer transition-all duration-200 uppercase tracking-wide whitespace-nowrap',
                                    'hover:bg-zinc-600 hover:text-white',
                                    orderType === type && 'bg-gold border-gold-light text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                                )}
                                onClick={() => handleOrderTypeChange(type)}
                            >
                                {type === 'dine_in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                            </button>
                        ))}
                    </div>
                    <span className="font-display text-base font-bold text-white tracking-tight flex items-center gap-1 flex-1 justify-center">
                        {displayOrderNumber}
                        {hasLockedItems && <Lock size={14} className="text-warning ml-1" />}
                    </span>
                    <button type="button" className="btn-icon btn-icon-sm" title="Clear cart" onClick={clearCart} disabled={items.length === 0}>
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* B2B mode indicator (Story 6.7) */}
                {customerCategorySlug === 'wholesale' && (
                    <div className="mt-1.5 px-2.5 py-1.5 bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] rounded-sm flex items-center gap-1.5 text-xs font-semibold text-[#a78bfa]">
                        <Building2 size={14} />
                        <span>B2B Mode</span>
                        <span className="ml-auto text-[10px] font-normal opacity-80">Store Credit Available</span>
                    </div>
                )}

                {orderType === 'dine_in' && tableNumber && (
                    <div className="mt-1.5 px-2.5 py-1.5 bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)] rounded-sm flex items-center justify-between text-xs text-gold-light">
                        <span>Table: {tableNumber}</span>
                        <button
                            type="button"
                            className="px-2 py-1 bg-transparent border border-gold rounded-sm text-gold-light text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-gold hover:text-white"
                            onClick={() => setShowTableModal(true)}
                        >
                            Change
                        </button>
                    </div>
                )}

                {/* Customer Selection */}
                <div className="mt-2">
                    {selectedCustomer || customerId ? (
                        <button type="button" className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-zinc-700 border-2 border-gold rounded-md cursor-pointer transition-all duration-200 hover:bg-zinc-600" onClick={() => setShowCustomerModal(true)} style={{ borderColor: selectedCustomer?.category?.color || getTierColor(selectedCustomer?.loyalty_tier || 'bronze') }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-[0.85rem] flex-shrink-0" style={{ backgroundColor: selectedCustomer?.category?.color || getTierColor(selectedCustomer?.loyalty_tier || 'bronze') }}>
                                {(selectedCustomer?.company_name || selectedCustomer?.name || customerName || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                                <span className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">{selectedCustomer?.company_name || selectedCustomer?.name || customerName}</span>
                                {selectedCustomer && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <LoyaltyBadge tier={selectedCustomer.loyalty_tier || 'bronze'} points={selectedCustomer.loyalty_points || 0} isOffline={isOffline} compact={true} />
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRedeemPointsClick() }} className="text-[10px] bg-transparent border-none underline px-1 py-0.5" style={{ color: isOffline ? '#9ca3af' : '#3b82f6', cursor: isOffline ? 'not-allowed' : 'pointer' }} title={isOffline ? 'Requires online connection' : 'Use loyalty points'}>
                                            <Star size={10} style={{ marginRight: '2px' }} />Use pts
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                {selectedCustomer?.category?.discount_percentage && selectedCustomer.category.discount_percentage > 0 && (
                                    <span className="px-2 py-1 rounded text-xs font-bold text-[#22c55e]" style={{ backgroundColor: '#3b82f6' }} title={`Category: ${selectedCustomer.category.name}`}>
                                        <Tag size={10} />-{selectedCustomer.category.discount_percentage}%
                                    </span>
                                )}
                            </div>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-700 border border-dashed border-zinc-500 rounded-md text-zinc-400 text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-zinc-600 hover:border-gold hover:text-gold-light"
                            onClick={() => setShowCustomerModal(true)}
                        >
                            <QrCode size={16} /><User size={16} /><span>Client</span>
                        </button>
                    )}
                </div>

                {/* Order Notes (F3.3) */}
                <div className="mt-sm pt-sm border-t border-zinc-700">
                    <button
                        type="button"
                        className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-300 text-sm cursor-pointer transition-all duration-200',
                            'hover:bg-zinc-600 hover:text-white',
                            (showOrderNotes || orderNotes) && 'text-gold-light border-gold',
                            '[&>svg:last-child]:ml-auto'
                        )}
                        onClick={() => setShowOrderNotes(!showOrderNotes)}
                    >
                        <FileText size={16} />
                        <span>{orderNotes ? 'Order Notes' : 'Add Notes'}</span>
                        {showOrderNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {showOrderNotes && (
                        <textarea
                            className="w-full mt-2 px-3 py-2.5 bg-zinc-900 border border-zinc-600 rounded-md text-white text-sm font-[inherit] resize-none transition-colors duration-200 focus:outline-none focus:border-gold placeholder:text-zinc-500"
                            placeholder="Add special instructions for this order..."
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            rows={2}
                        />
                    )}
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-md bg-zinc-900">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                        <span className="text-[48px] mb-md opacity-30">🛒</span>
                        <p>Your cart is empty. Select products.</p>
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

export default React.memo(Cart)
