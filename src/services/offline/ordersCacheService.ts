/**
 * Orders Cache Service (Story 3.1)
 *
 * Manages offline orders in IndexedDB via Dexie.
 * Handles order creation, retrieval, and sync queue integration.
 *
 * Key features:
 * - Generate LOCAL-prefixed UUIDs for offline orders
 * - Generate OFFLINE-YYYYMMDD-XXX order numbers
 * - Automatic sync queue entry on order creation
 * - Transaction support for data integrity
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */

import { db } from '@/lib/db';
import type {
  IOfflineOrder,
  IOfflineOrderItem,
  TOrderStatus,
  ISyncQueueItem,
  TSyncAction,
} from '@/types/offline';
import {
  LOCAL_ORDER_ID_PREFIX,
  OFFLINE_ORDER_NUMBER_PREFIX,
} from '@/types/offline';

// =====================================================
// ID and Number Generation
// =====================================================

/**
 * Generate a local UUID with LOCAL- prefix
 *
 * The prefix identifies orders created offline.
 * After successful sync, server_id will contain the actual server UUID.
 *
 * @returns UUID string with LOCAL- prefix (e.g., "LOCAL-550e8400-e29b-41d4-a716-446655440000")
 */
export function generateLocalOrderId(): string {
  return `${LOCAL_ORDER_ID_PREFIX}${crypto.randomUUID()}`;
}

/**
 * Check if an order ID was generated offline
 *
 * @param id - Order ID to check
 * @returns true if the ID has the LOCAL- prefix
 */
export function isLocalOrderId(id: string): boolean {
  return id.startsWith(LOCAL_ORDER_ID_PREFIX);
}

/**
 * Generate offline order number: OFFLINE-YYYYMMDD-XXX
 *
 * XXX is a sequential number for the day, zero-padded to 3 digits.
 * Example: OFFLINE-20260201-001, OFFLINE-20260201-002
 *
 * @returns Promise resolving to the generated order number
 */
export async function generateOfflineOrderNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const prefix = `${OFFLINE_ORDER_NUMBER_PREFIX}${dateStr}-`;

  // Count existing orders with same prefix today
  const existingCount = await db.offline_orders
    .where('order_number')
    .startsWith(prefix)
    .count();

  const sequence = (existingCount + 1).toString().padStart(3, '0');
  return `${prefix}${sequence}`;
}

// =====================================================
// Sync Queue Integration
// =====================================================

/**
 * Add an order operation to the sync queue
 *
 * Uses the existing offline_sync_queue table structure from db.ts.
 * Operations are processed FIFO when online.
 *
 * @param action - CRUD action (create, update, delete)
 * @param entityId - Order ID
 * @param payload - Operation payload
 */
async function addOrderToSyncQueue(
  action: TSyncAction,
  entityId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const item: Omit<ISyncQueueItem, 'id'> = {
    entity: 'orders',
    action,
    entityId,
    payload,
    created_at: new Date().toISOString(),
    status: 'pending',
    retries: 0,
  };

  await db.offline_sync_queue.add(item as ISyncQueueItem);
}

// =====================================================
// Order CRUD Operations
// =====================================================

/**
 * Input type for creating an offline order
 * Excludes auto-generated fields
 */
export type TCreateOfflineOrderInput = Omit<
  IOfflineOrder,
  'id' | 'order_number' | 'created_at' | 'updated_at' | 'sync_status'
>;

/**
 * Input type for creating an offline order item
 * Excludes auto-generated fields
 */
export type TCreateOfflineOrderItemInput = Omit<
  IOfflineOrderItem,
  'id' | 'order_id' | 'created_at'
>;

/**
 * Save an order with items to IndexedDB
 *
 * Automatically:
 * - Generates LOCAL-prefixed UUID
 * - Generates OFFLINE-YYYYMMDD-XXX order number
 * - Sets sync_status to 'pending_sync'
 * - Adds entry to sync queue
 *
 * All operations run in a transaction for data integrity.
 *
 * @param order - Order data (without auto-generated fields)
 * @param items - Order items (without auto-generated fields)
 * @returns Promise with created order and items
 */
export async function saveOfflineOrder(
  order: TCreateOfflineOrderInput,
  items: TCreateOfflineOrderItemInput[]
): Promise<{ order: IOfflineOrder; items: IOfflineOrderItem[] }> {
  // Input validation
  if (!order.user_id) {
    throw new Error('Order must have a user_id');
  }
  if (order.total < 0) {
    throw new Error('Order total cannot be negative');
  }
  for (const item of items) {
    if (item.quantity <= 0) {
      throw new Error(`Item quantity must be positive: ${item.product_name}`);
    }
    if (!item.product_id) {
      throw new Error('Item must have a product_id');
    }
  }

  const orderId = generateLocalOrderId();
  const orderNumber = await generateOfflineOrderNumber();
  const now = new Date().toISOString();

  const fullOrder: IOfflineOrder = {
    ...order,
    id: orderId,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
    sync_status: 'pending_sync',
  };

  const fullItems: IOfflineOrderItem[] = items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    order_id: orderId,
    created_at: now,
  }));

  // Transaction: save order, items, and add to sync queue
  await db.transaction(
    'rw',
    [db.offline_orders, db.offline_order_items, db.offline_sync_queue],
    async () => {
      await db.offline_orders.add(fullOrder);
      await db.offline_order_items.bulkAdd(fullItems);

      // Add to sync queue for server synchronization
      await addOrderToSyncQueue('create', orderId, {
        order: fullOrder,
        items: fullItems,
      });
    }
  );

  return { order: fullOrder, items: fullItems };
}

/**
 * Get all offline orders, sorted by created_at descending (newest first)
 *
 * @returns Promise with array of orders
 */
export async function getOfflineOrders(): Promise<IOfflineOrder[]> {
  return db.offline_orders
    .orderBy('created_at')
    .reverse()
    .toArray();
}

/**
 * Get a specific order by ID
 *
 * @param id - Order ID (can be LOCAL- prefixed or server ID)
 * @returns Promise with order or undefined if not found
 */
export async function getOfflineOrderById(
  id: string
): Promise<IOfflineOrder | undefined> {
  return db.offline_orders.get(id);
}

/**
 * Get a specific order by order number
 *
 * @param orderNumber - Order number (e.g., "OFFLINE-20260201-001")
 * @returns Promise with order or undefined if not found
 */
export async function getOfflineOrderByNumber(
  orderNumber: string
): Promise<IOfflineOrder | undefined> {
  return db.offline_orders.where('order_number').equals(orderNumber).first();
}

/**
 * Get items for a specific order
 *
 * @param orderId - Order ID
 * @returns Promise with array of order items
 */
export async function getOfflineOrderItems(
  orderId: string
): Promise<IOfflineOrderItem[]> {
  return db.offline_order_items.where('order_id').equals(orderId).toArray();
}

/**
 * Get an order with its items
 *
 * @param orderId - Order ID
 * @returns Promise with order and items, or null if not found
 */
export async function getOfflineOrderWithItems(
  orderId: string
): Promise<{ order: IOfflineOrder; items: IOfflineOrderItem[] } | null> {
  const order = await getOfflineOrderById(orderId);
  if (!order) return null;

  const items = await getOfflineOrderItems(orderId);
  return { order, items };
}

// =====================================================
// Order Status Operations
// =====================================================

/**
 * Update order status
 *
 * Also adds an update entry to the sync queue.
 *
 * @param id - Order ID
 * @param status - New status
 */
export async function updateOfflineOrderStatus(
  id: string,
  status: TOrderStatus
): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction(
    'rw',
    [db.offline_orders, db.offline_sync_queue],
    async () => {
      await db.offline_orders.update(id, {
        status,
        updated_at: now,
      });

      // Add update to sync queue
      await addOrderToSyncQueue('update', id, { status, updated_at: now });
    }
  );

}

/**
 * Get orders by status
 *
 * @param status - Order status to filter by
 * @returns Promise with array of orders
 */
export async function getOfflineOrdersByStatus(
  status: TOrderStatus
): Promise<IOfflineOrder[]> {
  return db.offline_orders.where('status').equals(status).toArray();
}

/**
 * Get orders by sync status
 *
 * @param syncStatus - Sync status to filter by
 * @returns Promise with array of orders
 */
export async function getOfflineOrdersBySyncStatus(
  syncStatus: IOfflineOrder['sync_status']
): Promise<IOfflineOrder[]> {
  return db.offline_orders.where('sync_status').equals(syncStatus).toArray();
}

// =====================================================
// Order Item Status Operations
// =====================================================

/**
 * Update an order item's status (for KDS)
 *
 * @param itemId - Item ID
 * @param status - New item status
 */
export async function updateOfflineOrderItemStatus(
  itemId: string,
  status: IOfflineOrderItem['item_status']
): Promise<void> {
  await db.offline_order_items.update(itemId, { item_status: status });
}

// =====================================================
// Sync Status Operations
// =====================================================

/**
 * Mark an order as synced with the server
 *
 * Called after successful server synchronization.
 *
 * @param localId - Local order ID (LOCAL-prefixed)
 * @param serverId - Server-assigned UUID
 */
export async function markOrderSynced(
  localId: string,
  serverId: string
): Promise<void> {
  const now = new Date().toISOString();

  await db.offline_orders.update(localId, {
    sync_status: 'synced',
    server_id: serverId,
    updated_at: now,
  });

}

/**
 * Mark an order with a sync conflict
 *
 * Called when server sync detects a conflict.
 *
 * @param id - Order ID
 */
export async function markOrderConflict(id: string): Promise<void> {
  const now = new Date().toISOString();

  await db.offline_orders.update(id, {
    sync_status: 'conflict',
    updated_at: now,
  });

}

// =====================================================
// Statistics and Counts
// =====================================================

/**
 * Get count of orders pending synchronization
 *
 * Used for sync indicator in UI.
 *
 * @returns Promise with count of pending orders
 */
export async function getPendingSyncOrdersCount(): Promise<number> {
  return db.offline_orders.where('sync_status').equals('pending_sync').count();
}

/**
 * Get total count of offline orders
 *
 * @returns Promise with total order count
 */
export async function getOfflineOrdersCount(): Promise<number> {
  return db.offline_orders.count();
}

/**
 * Get orders for a specific session
 *
 * @param sessionId - POS session ID
 * @returns Promise with array of orders
 */
export async function getOfflineOrdersBySession(
  sessionId: string
): Promise<IOfflineOrder[]> {
  return db.offline_orders.where('session_id').equals(sessionId).toArray();
}

/**
 * Get orders for a specific customer
 *
 * @param customerId - Customer ID
 * @returns Promise with array of orders
 */
export async function getOfflineOrdersByCustomer(
  customerId: string
): Promise<IOfflineOrder[]> {
  return db.offline_orders.where('customer_id').equals(customerId).toArray();
}

// =====================================================
// Cleanup Operations
// =====================================================

/**
 * Clear all offline orders and items
 *
 * Used for testing and recovery scenarios.
 * Does NOT clear the sync queue.
 */
export async function clearOfflineOrders(): Promise<void> {
  await db.transaction('rw', [db.offline_orders, db.offline_order_items], async () => {
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
  });

}

/**
 * Delete a specific order and its items
 *
 * @param orderId - Order ID to delete
 */
export async function deleteOfflineOrder(orderId: string): Promise<void> {
  await db.transaction('rw', [db.offline_orders, db.offline_order_items], async () => {
    await db.offline_order_items.where('order_id').equals(orderId).delete();
    await db.offline_orders.delete(orderId);
  });

}
