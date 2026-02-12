/**
 * Display Broadcast Service
 * Story 5.2 - Cart Broadcast to Display
 *
 * Handles real-time cart updates to customer display devices.
 * Uses LAN communication (BroadcastChannel + Supabase Realtime).
 */

import { useCartStore, type CartItem } from '@/stores/cartStore';
import { lanHub } from '@/services/lan/lanHub';
import { lanClient } from '@/services/lan/lanClient';
import { useLanStore } from '@/stores/lanStore';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import logger from '@/utils/logger';
import { logError } from '@/utils/logger'

/**
 * Cart update payload for display
 */
export interface ICartDisplayPayload {
  items: IDisplayCartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  customerName: string | null;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber: string | null;
  timestamp: string;
}

/**
 * Simplified cart item for display
 */
export interface IDisplayCartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers: string[];
  notes: string;
}

/**
 * Order status payload
 */
export interface IOrderStatusPayload {
  orderId: string;
  orderNumber: string;
  status: 'preparing' | 'ready' | 'called' | 'completed';
  timestamp: string;
}

/**
 * Convert cart items to display format
 */
function mapCartItemsToDisplay(items: CartItem[]): IDisplayCartItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.type === 'combo'
      ? item.combo?.name || 'Combo'
      : item.product?.name || 'Product',
    quantity: item.quantity,
    unitPrice: item.unitPrice + item.modifiersTotal,
    totalPrice: item.totalPrice,
    modifiers: item.type === 'combo'
      ? item.comboSelections?.map((s) => s.product_name) || []
      : item.modifiers.map((m) => m.optionLabel),
    notes: item.notes,
  }));
}

/**
 * Get current cart state for display
 */
function getCurrentCartPayload(): ICartDisplayPayload {
  const state = useCartStore.getState();

  return {
    items: mapCartItemsToDisplay(state.items),
    subtotal: state.subtotal,
    discountAmount: state.discountAmount,
    total: state.total,
    itemCount: state.itemCount,
    customerName: state.customerName,
    orderType: state.orderType,
    tableNumber: state.tableNumber,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Broadcast cart update to all connected displays
 */
export async function broadcastCartUpdate(): Promise<void> {
  const payload = getCurrentCartPayload();
  const lanStore = useLanStore.getState();

  // If this device is the hub (POS), broadcast via lanHub
  if (lanStore.isHub) {
    await lanHub.broadcast(LAN_MESSAGE_TYPES.CART_UPDATE, payload);
  } else {
    // If this device is a client, send via lanClient
    await lanClient.send(LAN_MESSAGE_TYPES.CART_UPDATE, payload);
  }
}

/**
 * Broadcast order status update
 */
export async function broadcastOrderStatus(
  orderId: string,
  orderNumber: string,
  status: 'preparing' | 'ready' | 'called' | 'completed'
): Promise<void> {
  const payload: IOrderStatusPayload = {
    orderId,
    orderNumber,
    status,
    timestamp: new Date().toISOString(),
  };

  const lanStore = useLanStore.getState();

  if (lanStore.isHub) {
    await lanHub.broadcast(LAN_MESSAGE_TYPES.ORDER_STATUS, payload);
  } else {
    await lanClient.send(LAN_MESSAGE_TYPES.ORDER_STATUS, payload);
  }
}

/**
 * Clear display (when order is completed or cart is cleared)
 */
export async function clearDisplay(): Promise<void> {
  const emptyPayload: ICartDisplayPayload = {
    items: [],
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    itemCount: 0,
    customerName: null,
    orderType: 'dine_in',
    tableNumber: null,
    timestamp: new Date().toISOString(),
  };

  const lanStore = useLanStore.getState();

  if (lanStore.isHub) {
    await lanHub.broadcast(LAN_MESSAGE_TYPES.CART_UPDATE, emptyPayload);
  } else {
    await lanClient.send(LAN_MESSAGE_TYPES.CART_UPDATE, emptyPayload);
  }
}

// Track subscription
let unsubscribeFromCart: (() => void) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Start listening to cart changes and broadcasting updates
 */
export function startCartBroadcast(): void {
  if (unsubscribeFromCart) {
    logger.debug('[DisplayBroadcast] Already broadcasting');
    return;
  }

  // Subscribe to cart store changes
  unsubscribeFromCart = useCartStore.subscribe(
    (state, prevState) => {
      // Only broadcast if items, totals, or customer changed
      const hasChanged =
        state.items !== prevState.items ||
        state.total !== prevState.total ||
        state.customerName !== prevState.customerName ||
        state.tableNumber !== prevState.tableNumber;

      if (hasChanged) {
        // Debounce to avoid too many broadcasts
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          broadcastCartUpdate().catch((error) => {
            logError('[DisplayBroadcast] Error broadcasting cart:', error);
          });
        }, 100); // 100ms debounce for NFR-P1 (<500ms latency)
      }
    }
  );

  logger.debug('[DisplayBroadcast] Started cart broadcasting');
}

/**
 * Stop broadcasting cart updates
 */
export function stopCartBroadcast(): void {
  if (unsubscribeFromCart) {
    unsubscribeFromCart();
    unsubscribeFromCart = null;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  logger.debug('[DisplayBroadcast] Stopped cart broadcasting');
}

/**
 * Check if currently broadcasting
 */
export function isBroadcasting(): boolean {
  return unsubscribeFromCart !== null;
}
