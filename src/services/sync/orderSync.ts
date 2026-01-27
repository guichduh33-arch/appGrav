/**
 * Order Sync Service
 * Story 2.2 - Offline Order Creation
 *
 * Handles saving and managing orders created during offline mode.
 */

import { offlineDb, IOfflineOrder, IOfflineOrderItem, ISyncQueueItem } from './offlineDb';
import type { CartItem } from '@/stores/cartStore';
import type { OrderType } from '@/stores/orderStore';

// Re-export interfaces for consumers
export type { IOfflineOrder, IOfflineOrderItem };

/**
 * Generate a unique offline order ID
 */
function generateOfflineOrderId(): string {
  return `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate tax amount from total (10% included)
 * Tax = total × 10/110
 */
function calculateTax(total: number): number {
  return Math.round((total * 10) / 110);
}

/**
 * Transform cart items to offline order items
 */
function transformCartItems(items: CartItem[]): IOfflineOrderItem[] {
  return items.map((item) => ({
    id: item.id,
    product_id: item.type === 'combo' ? item.combo?.id : item.product?.id,
    product_name: item.type === 'combo' ? item.combo?.name : item.product?.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    modifiers: item.modifiers?.map((m) => ({
      id: m.optionId,
      name: m.optionLabel,
      price_adjustment: m.priceAdjustment,
    })) || [],
  }));
}

/**
 * Save an order to IndexedDB when offline
 */
export async function saveOrderOffline(params: {
  orderNumber: string;
  orderType: OrderType;
  tableNumber: string | null;
  customerId: string | null;
  customerName: string | null;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountType: string | null;
  discountValue: number | null;
  total: number;
  paymentMethod: string;
  notes?: string;
  posTerminalId?: string | null;
}): Promise<IOfflineOrder> {
  const {
    orderNumber,
    orderType,
    tableNumber,
    customerId,
    customerName,
    items,
    subtotal,
    discountAmount,
    discountType,
    discountValue,
    total,
    paymentMethod,
    notes = '',
    posTerminalId = null,
  } = params;

  const orderId = generateOfflineOrderId();
  const now = new Date().toISOString();
  const taxAmount = calculateTax(total);

  const offlineOrder: IOfflineOrder = {
    id: orderId,
    order_number: orderNumber,
    order_type: orderType,
    table_number: tableNumber,
    customer_id: customerId,
    customer_name: customerName,
    items: transformCartItems(items),
    subtotal,
    discount_amount: discountAmount,
    discount_type: discountType,
    discount_value: discountValue,
    tax_amount: taxAmount,
    total,
    payment_method: paymentMethod,
    payment_status: 'paid',
    notes,
    created_at: now,
    created_offline: true,
    synced: false,
    synced_at: null,
    pos_terminal_id: posTerminalId,
  };

  // Save to IndexedDB
  await offlineDb.offline_orders.add(offlineOrder);

  // Add to sync queue
  await addToSyncQueue(offlineOrder);

  console.log(`[OrderSync] Order ${orderNumber} saved offline`);
  return offlineOrder;
}

/**
 * Add an offline order to the sync queue
 */
async function addToSyncQueue(order: IOfflineOrder): Promise<void> {
  const syncItem: ISyncQueueItem = {
    id: `sync-${order.id}`,
    type: 'order',
    payload: order,
    status: 'pending',
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
  };

  await offlineDb.sync_queue.add(syncItem);
  console.log(`[OrderSync] Added order ${order.order_number} to sync queue`);
}

/**
 * Get all offline orders that haven't been synced
 */
export async function getOfflineOrders(): Promise<IOfflineOrder[]> {
  return offlineDb.offline_orders
    .filter((order) => !order.synced)
    .toArray();
}

/**
 * Get all offline orders (including synced)
 */
export async function getAllOfflineOrders(): Promise<IOfflineOrder[]> {
  return offlineDb.offline_orders
    .orderBy('created_at')
    .reverse()
    .toArray();
}

/**
 * Get offline order by ID
 */
export async function getOfflineOrderById(orderId: string): Promise<IOfflineOrder | undefined> {
  return offlineDb.offline_orders.get(orderId);
}

/**
 * Mark an offline order as synced
 */
export async function markOrderSynced(orderId: string, serverOrderId?: string): Promise<void> {
  await offlineDb.offline_orders.update(orderId, {
    synced: true,
    synced_at: new Date().toISOString(),
    server_order_id: serverOrderId,
  });

  // Update sync queue item status
  await offlineDb.sync_queue
    .where('id')
    .equals(`sync-${orderId}`)
    .modify({ status: 'synced' });

  console.log(`[OrderSync] Order ${orderId} marked as synced`);
}

/**
 * Get count of pending (unsynced) orders
 */
export async function getPendingOrdersCount(): Promise<number> {
  return offlineDb.offline_orders
    .filter((order) => !order.synced)
    .count();
}

/**
 * Get all items from sync queue
 */
export async function getSyncQueueItems(): Promise<ISyncQueueItem[]> {
  return offlineDb.sync_queue
    .where('status')
    .equals('pending')
    .toArray();
}

/**
 * Get sync queue count by status
 */
export async function getSyncQueueCount(status?: 'pending' | 'syncing' | 'failed' | 'synced'): Promise<number> {
  if (status) {
    return offlineDb.sync_queue
      .where('status')
      .equals(status)
      .count();
  }
  return offlineDb.sync_queue.count();
}

/**
 * Update sync queue item status
 */
export async function updateSyncQueueStatus(
  syncId: string,
  status: 'pending' | 'syncing' | 'failed' | 'synced',
  error?: string
): Promise<void> {
  const updates: Partial<ISyncQueueItem> = { status };
  if (error) {
    updates.lastError = error;
  }
  if (status === 'failed') {
    // Increment attempts on failure
    const item = await offlineDb.sync_queue.get(syncId);
    if (item) {
      updates.attempts = item.attempts + 1;
    }
  }
  await offlineDb.sync_queue.update(syncId, updates);
}

/**
 * Clear synced items from the queue (cleanup)
 */
export async function clearSyncedItems(): Promise<number> {
  const synced = await offlineDb.sync_queue
    .where('status')
    .equals('synced')
    .toArray();

  const ids = synced.map((item) => item.id);
  await offlineDb.sync_queue.bulkDelete(ids);

  console.log(`[OrderSync] Cleared ${ids.length} synced items from queue`);
  return ids.length;
}

/**
 * Check if there are any pending offline orders
 */
export async function hasPendingOfflineOrders(): Promise<boolean> {
  const count = await getPendingOrdersCount();
  return count > 0;
}
