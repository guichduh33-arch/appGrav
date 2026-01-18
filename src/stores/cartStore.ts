import { create } from 'zustand'
import type { Product } from '../types/database'

export interface CartModifier {
    groupName: string
    optionId: string
    optionLabel: string
    priceAdjustment: number
}

export interface CartItem {
    id: string // Unique ID for this cart item
    product: Product
    quantity: number
    unitPrice: number // Base price
    modifiers: CartModifier[]
    modifiersTotal: number // Sum of modifier prices
    notes: string
    totalPrice: number // (unitPrice + modifiersTotal) * quantity
}

interface CartState {
    items: CartItem[]
    orderType: 'dine_in' | 'takeaway' | 'delivery'
    tableNumber: string | null
    customerId: string | null
    customerName: string | null
    discountType: 'percent' | 'amount' | null
    discountValue: number
    discountReason: string | null

    // Locked items tracking (items sent to kitchen)
    lockedItemIds: string[]
    activeOrderId: string | null
    activeOrderNumber: string | null

    // Computed
    subtotal: number
    discountAmount: number
    total: number
    itemCount: number

    // Actions
    addItem: (product: Product, quantity: number, modifiers: CartModifier[], notes: string) => void
    updateItem: (itemId: string, modifiers: CartModifier[], notes: string) => void
    updateItemQuantity: (itemId: string, quantity: number) => void
    removeItem: (itemId: string) => void
    clearCart: () => void
    setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void
    setTableNumber: (table: string | null) => void
    setCustomer: (id: string | null, name: string | null) => void
    setDiscount: (type: 'percent' | 'amount' | null, value: number, reason: string | null) => void

    // Locked items actions
    lockCurrentItems: () => void
    setActiveOrder: (orderId: string, orderNumber: string) => void
    isItemLocked: (itemId: string) => boolean
    removeLockedItem: (itemId: string) => void // Force remove (after PIN verification)
    clearActiveOrder: () => void
    getLockedItems: () => CartItem[]
    getUnlockedItems: () => CartItem[]
    // NEW: Restore full cart state
    restoreCartState: (
        items: CartItem[],
        lockedItemIds: string[],
        activeOrderId: string | null,
        activeOrderNumber: string | null
    ) => void
}

function calculateTotals(items: CartItem[], discountType: 'percent' | 'amount' | null, discountValue: number) {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    let discountAmount = 0

    if (discountType === 'percent') {
        discountAmount = Math.round(subtotal * (discountValue / 100))
    } else if (discountType === 'amount') {
        discountAmount = discountValue
    }

    const total = Math.max(0, subtotal - discountAmount)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return { subtotal, discountAmount, total, itemCount }
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    orderType: 'dine_in',
    tableNumber: null,
    customerId: null,
    customerName: null,
    discountType: null,
    discountValue: 0,
    discountReason: null,
    lockedItemIds: [],
    activeOrderId: null,
    activeOrderNumber: null,
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    itemCount: 0,

    addItem: (product, quantity, modifiers, notes) => {
        const modifiersTotal = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
        const unitPrice = product.retail_price || 0
        const totalPrice = (unitPrice + modifiersTotal) * quantity

        const newItem: CartItem = {
            id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            product,
            quantity,
            unitPrice,
            modifiers,
            modifiersTotal,
            notes,
            totalPrice,
        }

        set(state => {
            const newItems = [...state.items, newItem]
            const totals = calculateTotals(newItems, state.discountType, state.discountValue)
            return { items: newItems, ...totals }
        })
    },

    updateItem: (itemId, modifiers, notes) => {
        set(state => {
            const newItems = state.items.map(item => {
                if (item.id === itemId) {
                    const modifiersTotal = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
                    const totalPrice = (item.unitPrice + modifiersTotal) * item.quantity
                    return { ...item, modifiers, modifiersTotal, notes, totalPrice }
                }
                return item
            })
            const totals = calculateTotals(newItems, state.discountType, state.discountValue)
            return { items: newItems, ...totals }
        })
    },

    updateItemQuantity: (itemId, quantity) => {
        const state = get()
        const isLocked = state.lockedItemIds.includes(itemId)
        const currentItem = state.items.find(item => item.id === itemId)

        // If trying to reduce quantity of locked item, don't allow
        if (isLocked && currentItem && quantity < currentItem.quantity) {
            console.warn('Cannot reduce quantity of locked item without PIN')
            return
        }

        if (quantity <= 0) {
            get().removeItem(itemId)
            return
        }

        set(state => {
            const newItems = state.items.map(item => {
                if (item.id === itemId) {
                    const newTotalPrice = (item.unitPrice + item.modifiersTotal) * quantity
                    return { ...item, quantity, totalPrice: newTotalPrice }
                }
                return item
            })
            const totals = calculateTotals(newItems, state.discountType, state.discountValue)
            return { items: newItems, ...totals }
        })
    },

    removeItem: (itemId) => {
        const state = get()
        // Check if item is locked - if so, don't allow removal
        if (state.lockedItemIds.includes(itemId)) {
            console.warn('Cannot remove locked item without PIN verification')
            return
        }

        set(state => {
            const newItems = state.items.filter(item => item.id !== itemId)
            const totals = calculateTotals(newItems, state.discountType, state.discountValue)
            return { items: newItems, ...totals }
        })
    },

    clearCart: () => {
        set({
            items: [],
            tableNumber: null,
            customerId: null,
            customerName: null,
            discountType: null,
            discountValue: 0,
            discountReason: null,
            lockedItemIds: [],
            activeOrderId: null,
            activeOrderNumber: null,
            subtotal: 0,
            discountAmount: 0,
            total: 0,
            itemCount: 0,
        })
    },

    setOrderType: (orderType) => set({ orderType }),

    setTableNumber: (tableNumber) => set({ tableNumber }),

    setCustomer: (customerId, customerName) => set({ customerId, customerName }),

    setDiscount: (discountType, discountValue, discountReason) => {
        set(state => {
            const totals = calculateTotals(state.items, discountType, discountValue)
            return { discountType, discountValue, discountReason, ...totals }
        })
    },

    // Locked items actions
    lockCurrentItems: () => {
        set(state => ({
            lockedItemIds: [...state.lockedItemIds, ...state.items.map(item => item.id)]
        }))
    },

    setActiveOrder: (orderId, orderNumber) => {
        set({ activeOrderId: orderId, activeOrderNumber: orderNumber })
    },

    isItemLocked: (itemId) => {
        return get().lockedItemIds.includes(itemId)
    },

    removeLockedItem: (itemId) => {
        // Force remove - called after PIN verification
        set(state => {
            const newItems = state.items.filter(item => item.id !== itemId)
            const newLockedIds = state.lockedItemIds.filter(id => id !== itemId)
            const totals = calculateTotals(newItems, state.discountType, state.discountValue)
            return { items: newItems, lockedItemIds: newLockedIds, ...totals }
        })
    },

    clearActiveOrder: () => {
        set({
            lockedItemIds: [],
            activeOrderId: null,
            activeOrderNumber: null,
        })
    },

    getLockedItems: () => {
        const state = get()
        return state.items.filter(item => state.lockedItemIds.includes(item.id))
    },

    getUnlockedItems: () => {
        const state = get()
        return state.items.filter(item => !state.lockedItemIds.includes(item.id))
    },

    restoreCartState: (items, lockedItemIds, activeOrderId, activeOrderNumber) => {
        set(state => {
            const totals = calculateTotals(items, state.discountType, state.discountValue)
            return {
                items,
                lockedItemIds,
                activeOrderId,
                activeOrderNumber,
                ...totals
            }
        })
    },
}))

