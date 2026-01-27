import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './cartStore'

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type OrderType = 'dine_in' | 'takeaway' | 'delivery'

export interface Order {
    id: string
    orderNumber: string
    items: CartItem[]
    orderType: OrderType
    tableNumber: string | null
    customerId: string | null
    customerName: string | null
    subtotal: number
    discountAmount: number
    total: number
    status: OrderStatus
    sentToKitchen: boolean
    kitchenSentAt: Date | null
    paidAt: Date | null
    createdAt: Date
    updatedAt: Date
    notes: string
}

export interface HeldOrder {
    id: string
    orderNumber: string
    items: CartItem[]
    orderType: OrderType
    tableNumber: string | null
    customerId: string | null
    customerName: string | null
    subtotal: number
    discountAmount: number
    total: number
    heldAt: Date
    reason: string
    // NEW: Track if order was sent to kitchen
    sentToKitchen: boolean
    kitchenSentAt: Date | null
    // NEW: IDs of items that have been sent (locked)
    lockedItemIds: string[]
}

interface OrderState {
    // Active orders (sent to kitchen)
    activeOrders: Order[]
    // Held orders (on hold until payment)
    heldOrders: HeldOrder[]
    // Order counter
    orderCounter: number

    // Actions
    generateOrderNumber: () => string
    sendToKitchen: (
        items: CartItem[],
        orderType: OrderType,
        tableNumber: string | null,
        customerId: string | null,
        customerName: string | null,
        subtotal: number,
        discountAmount: number,
        total: number,
        notes?: string
    ) => Order
    holdOrder: (
        items: CartItem[],
        orderType: OrderType,
        tableNumber: string | null,
        customerId: string | null,
        customerName: string | null,
        subtotal: number,
        discountAmount: number,
        total: number,
        reason?: string,
        // Optional params to preserve order identity
        existingOrderNumber?: string,
        existingId?: string,
        sentToKitchen?: boolean,
        lockedItemIds?: string[]
    ) => HeldOrder
    restoreHeldOrder: (heldOrderId: string) => HeldOrder | null
    removeHeldOrder: (heldOrderId: string) => void
    updateOrderStatus: (orderId: string, status: OrderStatus) => void
    markOrderPaid: (orderId: string) => void
    getActiveOrdersForKDS: () => Order[]
    getHeldOrdersCount: () => number
    // NEW: Send to kitchen as held order (stays in held orders list)
    sendToKitchenAsHeldOrder: (
        items: CartItem[],
        orderType: OrderType,
        tableNumber: string | null,
        customerId: string | null,
        customerName: string | null,
        subtotal: number,
        discountAmount: number,
        total: number
    ) => HeldOrder
    // NEW: Update kitchen held order
    updateKitchenHeldOrder: (heldOrderId: string, items: CartItem[], subtotal: number, discountAmount: number, total: number) => void
    // NEW: Add items to an existing held order
    addItemsToHeldOrder: (heldOrderId: string, newItems: CartItem[], newSubtotal: number, newTotal: number) => void
    // NEW: Remove item from held order (for PIN-verified deletion)
    removeItemFromHeldOrder: (heldOrderId: string, itemId: string) => void
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            activeOrders: [],
            heldOrders: [],
            orderCounter: 1000,

            generateOrderNumber: () => {
                const counter = get().orderCounter + 1
                set({ orderCounter: counter })
                return `#${counter}`
            },

            sendToKitchen: (
                items,
                orderType,
                tableNumber,
                customerId,
                customerName,
                subtotal,
                discountAmount,
                total,
                notes = ''
            ) => {
                const orderNumber = get().generateOrderNumber()
                const now = new Date()

                const order: Order = {
                    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    orderNumber,
                    items: [...items],
                    orderType,
                    tableNumber,
                    customerId,
                    customerName,
                    subtotal,
                    discountAmount,
                    total,
                    status: 'pending',
                    sentToKitchen: true,
                    kitchenSentAt: now,
                    paidAt: null,
                    createdAt: now,
                    updatedAt: now,
                    notes,
                }

                set(state => ({
                    activeOrders: [...state.activeOrders, order]
                }))

                return order
            },

            holdOrder: (
                items,
                orderType,
                tableNumber,
                customerId,
                customerName,
                subtotal,
                discountAmount,
                total,
                reason = '',
                existingOrderNumber,
                existingId,
                sentToKitchen = false,
                lockedItemIds = []
            ) => {
                const orderNumber = existingOrderNumber || get().generateOrderNumber()

                const heldOrder: HeldOrder = {
                    id: existingId || `held-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    orderNumber,
                    items: [...items],
                    orderType,
                    tableNumber,
                    customerId,
                    customerName,
                    subtotal,
                    discountAmount,
                    total,
                    heldAt: new Date(),
                    reason,
                    sentToKitchen,
                    kitchenSentAt: sentToKitchen ? new Date() : null,
                    lockedItemIds,
                }

                set(state => ({
                    heldOrders: [...state.heldOrders, heldOrder]
                }))

                return heldOrder
            },

            restoreHeldOrder: (heldOrderId) => {
                const heldOrder = get().heldOrders.find(o => o.id === heldOrderId)
                if (heldOrder) {
                    set(state => ({
                        heldOrders: state.heldOrders.filter(o => o.id !== heldOrderId)
                    }))
                    return heldOrder
                }
                return null
            },

            removeHeldOrder: (heldOrderId) => {
                set(state => ({
                    heldOrders: state.heldOrders.filter(o => o.id !== heldOrderId)
                }))
            },

            updateOrderStatus: (orderId, status) => {
                set(state => ({
                    activeOrders: state.activeOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status, updatedAt: new Date() }
                            : order
                    )
                }))
            },

            markOrderPaid: (orderId) => {
                set(state => ({
                    activeOrders: state.activeOrders.map(order =>
                        order.id === orderId
                            ? { ...order, paidAt: new Date(), status: 'completed' as OrderStatus, updatedAt: new Date() }
                            : order
                    )
                }))
            },

            getActiveOrdersForKDS: () => {
                return get().activeOrders.filter(
                    o => o.sentToKitchen && o.status !== 'completed' && o.status !== 'cancelled'
                )
            },

            getHeldOrdersCount: () => {
                return get().heldOrders.length
            },

            // Send to kitchen as a held order (stays in held orders list with locked items)
            sendToKitchenAsHeldOrder: (
                items,
                orderType,
                tableNumber,
                customerId,
                customerName,
                subtotal,
                discountAmount,
                total
            ) => {
                const orderNumber = get().generateOrderNumber()
                const itemIds = items.map(item => item.id)

                const heldOrder: HeldOrder = {
                    id: `held-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    orderNumber,
                    items: [...items],
                    orderType,
                    tableNumber,
                    customerId,
                    customerName,
                    subtotal,
                    discountAmount,
                    total,
                    heldAt: new Date(),
                    reason: 'En cuisine',
                    sentToKitchen: true,
                    kitchenSentAt: new Date(),
                    lockedItemIds: itemIds, // All items are locked when first sent
                }

                set(state => ({
                    heldOrders: [...state.heldOrders, heldOrder]
                }))

                return heldOrder
            },

            // Update a kitchen held order (replace items with new state, lock everything)
            updateKitchenHeldOrder: (heldOrderId, items, subtotal, discountAmount, total) => {
                set(state => ({
                    heldOrders: state.heldOrders.map(order => {
                        if (order.id !== heldOrderId) return order

                        const itemIds = items.map(item => item.id)
                        return {
                            ...order,
                            items: [...items],
                            lockedItemIds: itemIds, // Lock all items
                            subtotal,
                            discountAmount,
                            total,
                            kitchenSentAt: new Date(), // Update sent time
                        }
                    })
                }))
            },

            // Add new items to an existing held order
            addItemsToHeldOrder: (heldOrderId, newItems, newSubtotal, newTotal) => {
                set(state => ({
                    heldOrders: state.heldOrders.map(order =>
                        order.id === heldOrderId
                            ? {
                                ...order,
                                items: [...order.items, ...newItems],
                                lockedItemIds: [...order.lockedItemIds, ...newItems.map(i => i.id)],
                                subtotal: newSubtotal,
                                total: newTotal,
                            }
                            : order
                    )
                }))
            },

            // Remove a single item from a held order (for PIN-verified deletion)
            removeItemFromHeldOrder: (heldOrderId, itemId) => {
                set(state => ({
                    heldOrders: state.heldOrders.map(order => {
                        if (order.id !== heldOrderId) return order

                        const newItems = order.items.filter(item => item.id !== itemId)
                        const newLockedIds = order.lockedItemIds.filter(id => id !== itemId)
                        const newSubtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0)

                        // Recalculate discount based on new subtotal
                        // If original discount was percentage-based, we need to preserve that ratio
                        const originalDiscountRatio = order.subtotal > 0 ? order.discountAmount / order.subtotal : 0
                        const newDiscountAmount = Math.round(newSubtotal * originalDiscountRatio)
                        const newTotal = Math.max(0, newSubtotal - newDiscountAmount)

                        return {
                            ...order,
                            items: newItems,
                            lockedItemIds: newLockedIds,
                            subtotal: newSubtotal,
                            discountAmount: newDiscountAmount,
                            total: newTotal,
                        }
                    })
                }))
            },
        }),
        {
            name: 'breakery-orders',
            partialize: (state) => ({
                activeOrders: state.activeOrders,
                heldOrders: state.heldOrders,
                orderCounter: state.orderCounter,
            }),
        }
    )
)
