import React, { useState, useEffect } from 'react'
import { Trash2, Lock, User, FileText, ShoppingCart } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { PinVerificationModal, TableSelectionModal, DiscountModal, CustomerSearchModal } from './modals'
import { CartItemRow, CartTotals, CartActions } from './cart-components'
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
    onItemClick?: (item: CartItem) => void
}

function Cart({ onCheckout, onSendToKitchen, onItemClick }: CartProps) {
    const {
        items, orderType, setOrderType, setTableNumber,
        subtotal, discountAmount, total, updateItemQuantity, removeItem, clearCart, setDiscount,
        lockedItemIds, activeOrderNumber, isItemLocked, removeLockedItem,
        customerId, customerName, setCustomerWithCategorySlug,
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

    return (
        <aside className="w-[480px] bg-[#1C1C1E] border-l border-white/5 flex flex-col flex-shrink-0 z-[15] shadow-[-8px_0_32px_rgba(0,0,0,0.5)] text-[#E5E7EB]">
            {/* Header / Active Order Info */}
            <div className="p-6 border-b border-white/5 bg-[var(--onyx-surface)]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-white uppercase tracking-[0.15em]">Active Order</h2>
                        <span className="px-3 py-1 rounded-full bg-[#cab06d]/10 text-[#cab06d] text-xs font-bold tracking-wide">
                            {displayOrderNumber}
                        </span>
                        {hasLockedItems && <Lock size={14} className="text-warning opacity-80" />}
                    </div>
                    <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-[#8E8E93] hover:text-white hover:bg-white/10 transition-all border-none cursor-pointer"
                        title="Clear cart"
                        onClick={clearCart}
                        disabled={items.length === 0}
                    >
                        <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                </div>
                {/* Order type subtitle */}
                <p className="text-[11px] text-[#8E8E93] tracking-wide mb-3">
                    {orderType === 'dine_in' ? 'Dine-in' : orderType === 'takeaway' ? 'Take-out' : 'Delivery'}
                </p>

                {/* Order Type Selector */}
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 mb-4">
                    {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={cn(
                                'flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all duration-300 border-none cursor-pointer',
                                orderType === type
                                    ? 'bg-[#cab06d] text-black shadow-lg shadow-[#cab06d]/10'
                                    : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                            )}
                            onClick={() => handleOrderTypeChange(type)}
                        >
                            {type === 'dine_in' ? 'Dine In' : type === 'takeaway' ? 'Take-out' : 'Delivery'}
                        </button>
                    ))}
                </div>

                {/* Customer Selection */}
                <div>
                    {selectedCustomer || customerId ? (
                        <button
                            type="button"
                            className="w-full flex items-center gap-4 px-4 py-3 bg-white/5 border border-[#cab06d]/30 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/10 group"
                            onClick={() => setShowCustomerModal(true)}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner"
                                style={{ backgroundColor: selectedCustomer?.category?.color || getTierColor(selectedCustomer?.loyalty_tier || 'bronze') }}
                            >
                                {(selectedCustomer?.company_name || selectedCustomer?.name || customerName || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col text-left">
                                <span className="text-sm font-semibold text-white truncate">{selectedCustomer?.company_name || selectedCustomer?.name || customerName}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#8E8E93] group-hover:text-[#cab06d] transition-colors">VIP Client</span>
                                    {selectedCustomer?.loyalty_points && (
                                        <span className="text-[10px] text-success font-bold">· {selectedCustomer.loyalty_points} pts</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-3 py-4 bg-transparent border-2 border-dashed border-white/10 rounded-xl text-[#8E8E93] text-[10px] uppercase tracking-[0.2em] font-black cursor-pointer transition-all duration-300 hover:border-[#cab06d]/50 hover:text-white hover:bg-white/5"
                            onClick={() => setShowCustomerModal(true)}
                        >
                            <User size={14} strokeWidth={2.5} />
                            Add Client
                        </button>
                    )}
                </div>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 min-h-[120px] overflow-y-auto px-6 py-3 custom-scrollbar bg-transparent">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <ShoppingCart size={48} strokeWidth={1} className="mb-4" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Empty Bag</span>
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

            {/* Order Notes / Meta */}
            {items.length > 0 && (
                <div className="px-6 py-3 border-t border-white/5">
                    <button
                        type="button"
                        className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-[#8E8E93] text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-all border-none',
                            (showOrderNotes || orderNotes) && 'text-[#cab06d] bg-[#cab06d]/5'
                        )}
                        onClick={() => setShowOrderNotes(!showOrderNotes)}
                    >
                        <FileText size={14} />
                        <span>{orderNotes ? 'Special Instructions added' : 'Add special instructions'}</span>
                    </button>
                    {showOrderNotes && (
                        <textarea
                            className="w-full mt-3 px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm font-[inherit] resize-none focus:outline-none focus:border-[#cab06d]/50 placeholder:text-[#8E8E93]/50"
                            placeholder="Type instructions here..."
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            rows={2}
                        />
                    )}
                </div>
            )}

            {items.length > 0 && (
                <CartTotals subtotal={subtotal} discountAmount={discountAmount} total={total} onDiscountClick={() => setShowDiscountModal(true)} />
            )}

            <CartActions hasLockedItems={hasLockedItems} hasUnlockedItems={hasUnlockedItems} itemCount={items.length} total={total} onSendToKitchen={onSendToKitchen} onCheckout={onCheckout} />

            {showPinModal && (
                <PinVerificationModal title="Secure access" message="Manager PIN required to modify kitchen items." onVerify={handlePinVerify} onClose={() => { setShowPinModal(false); setPendingDeleteItemId(null) }} />
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
