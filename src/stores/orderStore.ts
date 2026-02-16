import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './cartStore'
import { heldOrdersService } from '@/services/offline/heldOrdersService'
import { useAuthStore } from './authStore'
import { useTerminalStore } from './terminalStore'
import logger from '@/utils/logger'

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
    // NEW: Remove item from held order (for PIN-verified deletion)
    removeItemFromHeldOrder: (heldOrderId: string, itemId: string) => void
    // NEW: Sync with IndexedDB
    syncHeldOrders: () => Promise<void>
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

                set(state => {
                    const exists = state.heldOrders.some(o => o.id === heldOrder.id)
                    return {
                        heldOrders: exists
                            ? state.heldOrders.map(o => o.id === heldOrder.id ? heldOrder : o)
                            : [...state.heldOrders, heldOrder]
                    }
                })

                // Persist to IndexedDB
                const user = useAuthStore.getState().user
                const deviceId = useTerminalStore.getState().deviceId
                const sessionId = useAuthStore.getState().sessionId

                if (user && deviceId) {
                    heldOrdersService.saveHeldOrder({
                        id: heldOrder.id,
                        order_number: heldOrder.orderNumber,
                        order_type: heldOrder.orderType as any,
                        table_number: heldOrder.tableNumber,
                        customer_id: heldOrder.customerId,
                        customer_name: heldOrder.customerName,
                        items: heldOrder.items,
                        subtotal: heldOrder.subtotal,
                        discount_amount: heldOrder.discountAmount,
                        total: heldOrder.total,
                        notes: reason,
                        created_by: user.id,
                        terminal_id: deviceId,
                        session_id: sessionId
                    }).catch(err => logger.error('[POS] Failed to persist held order to IndexedDB:', err))
                }

                return heldOrder
            },

            restoreHeldOrder: (heldOrderId) => {
                const heldOrder = get().heldOrders.find(o => o.id === heldOrderId)
                if (heldOrder) {
                    set(state => ({
                        heldOrders: state.heldOrders.filter(o => o.id !== heldOrderId)
                    }))
                    // Remove from IndexedDB
                    heldOrdersService.deleteHeldOrder(heldOrderId)
                        .catch(err => logger.error('[POS] Failed to delete restored held order from IndexedDB:', err))
                    return heldOrder
                }
                return null
            },

            removeHeldOrder: (heldOrderId) => {
                set(state => ({
                    heldOrders: state.heldOrders.filter(o => o.id !== heldOrderId)
                }))
                // Remove from IndexedDB
                heldOrdersService.deleteHeldOrder(heldOrderId)
                    .catch(err => logger.error('[POS] Failed to remove held order from IndexedDB:', err))
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

                // Persist to IndexedDB
                const user = useAuthStore.getState().user
                const deviceId = useTerminalStore.getState().deviceId
                const sessionId = useAuthStore.getState().sessionId

                if (user && deviceId) {
                    heldOrdersService.saveHeldOrder({
                        id: heldOrder.id,
                        order_number: heldOrder.orderNumber,
                        order_type: heldOrder.orderType as any,
                        table_number: heldOrder.tableNumber,
                        customer_id: heldOrder.customerId,
                        customer_name: heldOrder.customerName,
                        items: heldOrder.items,
                        subtotal: heldOrder.subtotal,
                        discount_amount: heldOrder.discountAmount,
                        total: heldOrder.total,
                        notes: 'En cuisine',
                        created_by: user.id,
                        terminal_id: deviceId,
                        session_id: sessionId
                    }).catch(err => logger.error('[POS] Failed to persist held order to IndexedDB:', err))
                }

                return heldOrder
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

            syncHeldOrders: async () => {
                const deviceId = useTerminalStore.getState().deviceId
                if (!deviceId) return

                try {
                    const offlineHeldOrders = await heldOrdersService.getHeldOrders(deviceId)
                    if (offlineHeldOrders.length > 0) {
                        const mappedHeldOrders: HeldOrder[] = offlineHeldOrders.map(o => ({
                            id: o.id,
                            orderNumber: o.order_number,
                            items: o.items,
                            orderType: o.order_type as any,
                            tableNumber: o.table_number || null,
                            customerId: o.customer_id || null,
                            customerName: o.customer_name || null,
                            subtotal: o.subtotal,
                            discountAmount: o.discount_amount,
                            total: o.total,
                            heldAt: new Date(o.created_at),
                            reason: o.notes || '',
                            sentToKitchen: false, // Default for restored offline orders
                            kitchenSentAt: null,
                            lockedItemIds: []
                        }))

                        set(state => {
                            // Merge with existing held orders, prioritizing IndexedDB
                            const existingIds = new Set(state.heldOrders.map(ho => ho.id))
                            const newHeldOrders = [...state.heldOrders]

                            mappedHeldOrders.forEach(mho => {
                                if (!existingIds.has(mho.id)) {
                                    newHeldOrders.push(mho)
                                }
                            })

                            return { heldOrders: newHeldOrders }
                        })
                    }
                } catch (error) {
                    logger.error('[POS] Failed to sync held orders:', error)
                }
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
