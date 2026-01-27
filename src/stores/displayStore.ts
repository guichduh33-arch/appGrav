/**
 * Display Store
 * Story 5.2 - Cart Broadcast to Display
 *
 * Manages state for customer display devices.
 */

import { create } from 'zustand';
import type { ICartDisplayPayload, IDisplayCartItem, IOrderStatusPayload } from '@/services/display/displayBroadcast';

/**
 * Order in queue
 */
export interface IQueuedOrder {
  orderId: string;
  orderNumber: string;
  status: 'preparing' | 'ready' | 'called' | 'completed';
  receivedAt: string;
  readyAt: string | null;
  calledAt: string | null;
}

/**
 * Display state
 */
interface DisplayState {
  // Cart display
  cart: {
    items: IDisplayCartItem[];
    subtotal: number;
    discountAmount: number;
    total: number;
    itemCount: number;
    customerName: string | null;
    orderType: 'dine_in' | 'takeaway' | 'delivery';
    tableNumber: string | null;
  };
  lastCartUpdate: string | null;

  // Order queue
  orderQueue: IQueuedOrder[];
  readyOrders: IQueuedOrder[];

  // Display mode
  isIdle: boolean;
  idleTimeout: number; // seconds
  lastActivity: string;

  // Promo rotation
  currentPromoIndex: number;
  promoRotationInterval: number; // seconds

  // Connection status
  isConnected: boolean;

  // Actions
  updateCart: (payload: ICartDisplayPayload) => void;
  clearCart: () => void;
  updateOrderStatus: (payload: IOrderStatusPayload) => void;
  removeReadyOrder: (orderId: string) => void;
  setConnected: (connected: boolean) => void;
  setIdleTimeout: (seconds: number) => void;
  setPromoInterval: (seconds: number) => void;
  nextPromo: () => void;
  resetPromoIndex: () => void;
  checkIdle: () => void;
}

// Duration for ready orders to remain visible (5 minutes)
const READY_ORDER_VISIBLE_DURATION = 5 * 60 * 1000;

export const useDisplayStore = create<DisplayState>((set, get) => ({
  // Initial cart state
  cart: {
    items: [],
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    itemCount: 0,
    customerName: null,
    orderType: 'dine_in',
    tableNumber: null,
  },
  lastCartUpdate: null,

  // Order queue
  orderQueue: [],
  readyOrders: [],

  // Display mode
  isIdle: true,
  idleTimeout: 30,
  lastActivity: new Date().toISOString(),

  // Promo rotation
  currentPromoIndex: 0,
  promoRotationInterval: 10,

  // Connection status
  isConnected: false,

  /**
   * Update cart from broadcast
   */
  updateCart: (payload) => {
    set({
      cart: {
        items: payload.items,
        subtotal: payload.subtotal,
        discountAmount: payload.discountAmount,
        total: payload.total,
        itemCount: payload.itemCount,
        customerName: payload.customerName,
        orderType: payload.orderType,
        tableNumber: payload.tableNumber,
      },
      lastCartUpdate: payload.timestamp,
      lastActivity: new Date().toISOString(),
      isIdle: payload.items.length === 0,
    });
  },

  /**
   * Clear cart display
   */
  clearCart: () => {
    set({
      cart: {
        items: [],
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        itemCount: 0,
        customerName: null,
        orderType: 'dine_in',
        tableNumber: null,
      },
      lastCartUpdate: new Date().toISOString(),
      isIdle: true,
    });
  },

  /**
   * Update order status from broadcast
   */
  updateOrderStatus: (payload) => {
    const { orderQueue, readyOrders } = get();
    const now = new Date().toISOString();

    if (payload.status === 'preparing') {
      // Add to queue if not already there
      const existing = orderQueue.find((o) => o.orderId === payload.orderId);
      if (!existing) {
        set({
          orderQueue: [
            ...orderQueue,
            {
              orderId: payload.orderId,
              orderNumber: payload.orderNumber,
              status: 'preparing',
              receivedAt: now,
              readyAt: null,
              calledAt: null,
            },
          ],
          lastActivity: now,
        });
      }
    } else if (payload.status === 'ready') {
      // Move from queue to ready
      const order = orderQueue.find((o) => o.orderId === payload.orderId);
      if (order) {
        set({
          orderQueue: orderQueue.filter((o) => o.orderId !== payload.orderId),
          readyOrders: [
            {
              ...order,
              status: 'ready',
              readyAt: now,
            },
            ...readyOrders,
          ],
          lastActivity: now,
        });
      } else {
        // Directly add to ready if not in queue
        set({
          readyOrders: [
            {
              orderId: payload.orderId,
              orderNumber: payload.orderNumber,
              status: 'ready',
              receivedAt: now,
              readyAt: now,
              calledAt: null,
            },
            ...readyOrders,
          ],
          lastActivity: now,
        });
      }

      // Schedule removal after 5 minutes
      setTimeout(() => {
        get().removeReadyOrder(payload.orderId);
      }, READY_ORDER_VISIBLE_DURATION);
    } else if (payload.status === 'called') {
      // Update order as called
      set({
        readyOrders: readyOrders.map((o) =>
          o.orderId === payload.orderId
            ? { ...o, status: 'called', calledAt: now }
            : o
        ),
        lastActivity: now,
      });
    } else if (payload.status === 'completed') {
      // Remove from both queues
      set({
        orderQueue: orderQueue.filter((o) => o.orderId !== payload.orderId),
        readyOrders: readyOrders.filter((o) => o.orderId !== payload.orderId),
        lastActivity: now,
      });
    }
  },

  /**
   * Remove ready order (after timeout)
   */
  removeReadyOrder: (orderId) => {
    set({
      readyOrders: get().readyOrders.filter((o) => o.orderId !== orderId),
    });
  },

  /**
   * Set connection status
   */
  setConnected: (connected) => {
    set({ isConnected: connected });
  },

  /**
   * Set idle timeout
   */
  setIdleTimeout: (seconds) => {
    set({ idleTimeout: seconds });
  },

  /**
   * Set promo rotation interval
   */
  setPromoInterval: (seconds) => {
    set({ promoRotationInterval: seconds });
  },

  /**
   * Move to next promotion
   */
  nextPromo: () => {
    set({ currentPromoIndex: get().currentPromoIndex + 1 });
  },

  /**
   * Reset promo index
   */
  resetPromoIndex: () => {
    set({ currentPromoIndex: 0 });
  },

  /**
   * Check if display should be idle
   */
  checkIdle: () => {
    const { cart, lastActivity, idleTimeout } = get();
    const now = Date.now();
    const lastActivityTime = new Date(lastActivity).getTime();
    const elapsed = (now - lastActivityTime) / 1000;

    if (cart.items.length === 0 && elapsed > idleTimeout) {
      set({ isIdle: true });
    } else if (cart.items.length > 0) {
      set({ isIdle: false });
    }
  },
}));
