/**
 * Kitchen Dispatch Service
 * Story 3.7 - Kitchen Dispatch via LAN (Offline)
 *
 * Handles dispatching orders to KDS stations via LAN.
 * Supports offline queueing when LAN is unavailable.
 *
 * @see _bmad-output/implementation-artifacts/3-7-kitchen-dispatch-via-lan-offline.md
 */

import { db } from '@/lib/db';
import logger from '@/utils/logger';
import { lanHub } from '@/services/lan/lanHub';
import { useLanStore } from '@/stores/lanStore';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import type {
  IOfflineOrder,
  IOfflineOrderItem,
  IDispatchQueueItem,
  IKdsNewOrderPayload,
  IKdsOrderItem,
  TKitchenStation,
  TDispatchStatus,
  IOfflineOrderItemModifier,
} from '@/types/offline';
import {
  DISPATCH_MAX_ATTEMPTS,
  DISPATCH_RETRY_BACKOFF_MS,
} from '@/types/offline';

/**
 * Get dispatch station for a category from offline cache
 */
export async function getCategoryDispatchStation(
  categoryId: string | null
): Promise<TKitchenStation> {
  if (!categoryId) return 'none';

  const category = await db.offline_categories.get(categoryId);
  return (category?.dispatch_station as TKitchenStation) || 'none';
}

/**
 * Filter order items by dispatch station
 * Returns items that belong to the specified station
 */
export async function filterItemsByStation(
  items: IOfflineOrderItem[],
  station: TKitchenStation
): Promise<IOfflineOrderItem[]> {
  const result: IOfflineOrderItem[] = [];

  for (const item of items) {
    // Get category from item's product
    const product = await db.offline_products.get(item.product_id);
    const itemStation = await getCategoryDispatchStation(product?.category_id ?? null);

    if (itemStation === station) {
      result.push(item);
    }
  }

  return result;
}

/**
 * Convert order items to KDS payload format
 */
function toKdsOrderItems(items: IOfflineOrderItem[]): IKdsOrderItem[] {
  return items.map((item) => ({
    id: item.id,
    product_id: item.product_id,
    name: item.product_name,
    quantity: item.quantity,
    modifiers: item.modifiers?.map((m: IOfflineOrderItemModifier) => m.option_label) || [],
    notes: item.notes || null,
    category_id: item.dispatch_station || '',
  }));
}

/**
 * Check if LAN hub is connected and active
 */
function isLanConnected(): boolean {
  return lanHub.isActive() || useLanStore.getState().connectionStatus === 'connected';
}

/**
 * Add order to dispatch queue (when LAN unavailable)
 */
export async function addToDispatchQueue(
  order: IOfflineOrder,
  station: TKitchenStation,
  items: IOfflineOrderItem[]
): Promise<IDispatchQueueItem> {
  const now = new Date().toISOString();

  const queueItem: Omit<IDispatchQueueItem, 'id'> = {
    order_id: order.id,
    station,
    items: toKdsOrderItems(items),
    created_at: now,
    attempts: 0,
    last_error: null,
    last_attempt_at: null, // C-7: Track last attempt for backoff
    status: 'pending',
  };

  const id = await db.offline_dispatch_queue.add(queueItem as IDispatchQueueItem);
  return { ...queueItem, id } as IDispatchQueueItem;
}

/**
 * Update order dispatch status in offline database
 */
export async function updateOrderDispatchStatus(
  orderId: string,
  status: TDispatchStatus,
  dispatchedAt: string | null,
  error?: string
): Promise<void> {
  await db.offline_orders.update(orderId, {
    dispatch_status: status,
    dispatched_at: dispatchedAt ?? undefined,
    dispatch_error: error ?? undefined,
  });
}

/**
 * Dispatch order to kitchen stations
 * Filters items by station and sends to appropriate KDS
 * Queues locally if LAN is unavailable
 *
 * @returns Object with dispatched and queued stations
 */
export async function dispatchOrderToKitchen(
  order: IOfflineOrder,
  items: IOfflineOrderItem[]
): Promise<{
  dispatched: TKitchenStation[];
  queued: TKitchenStation[];
}> {
  const stations: TKitchenStation[] = ['kitchen', 'barista'];
  const dispatched: TKitchenStation[] = [];
  const queued: TKitchenStation[] = [];

  for (const station of stations) {
    const stationItems = await filterItemsByStation(items, station);

    // Skip if no items for this station
    if (stationItems.length === 0) {
      continue;
    }

    const payload: IKdsNewOrderPayload = {
      order_id: order.id,
      order_number: order.order_number,
      table_number: order.table_number ? parseInt(order.table_number, 10) : null,
      order_type: order.order_type,
      items: toKdsOrderItems(stationItems),
      station,
      timestamp: new Date().toISOString(),
    };

    if (isLanConnected()) {
      try {
        await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);
        dispatched.push(station);
        logger.debug(`[kitchenDispatch] Dispatched to ${station}:`, order.order_number);
      } catch (error) {
        console.error(`[kitchenDispatch] Failed to dispatch to ${station}:`, error);
        await addToDispatchQueue(order, station, stationItems);
        queued.push(station);
      }
    } else {
      // LAN not connected, queue for later
      await addToDispatchQueue(order, station, stationItems);
      queued.push(station);
      logger.debug(`[kitchenDispatch] Queued for ${station} (LAN unavailable):`, order.order_number);
    }
  }

  // Update order dispatch status based on result
  const status: TDispatchStatus = queued.length > 0 ? 'pending' : 'dispatched';
  const dispatchedAt = queued.length === 0 ? new Date().toISOString() : null;
  await updateOrderDispatchStatus(order.id, status, dispatchedAt);

  return { dispatched, queued };
}

/**
 * Mark order as dispatched for a specific station (called on ACK)
 */
export async function markStationDispatched(
  orderId: string,
  station: TKitchenStation
): Promise<void> {
  // Remove from queue if present
  await db.offline_dispatch_queue
    .where({ order_id: orderId, station })
    .delete();

  // Check if all stations are done (no more pending items for this order)
  const remaining = await db.offline_dispatch_queue
    .where('order_id')
    .equals(orderId)
    .count();

  if (remaining === 0) {
    await updateOrderDispatchStatus(orderId, 'dispatched', new Date().toISOString());
  }

  logger.debug(`[kitchenDispatch] Station ${station} acknowledged order ${orderId}`);
}

/**
 * Process pending dispatch queue
 * Called when LAN connection is restored
 *
 * C-7: Now respects exponential backoff between retries
 *
 * @returns Number of processed and failed items
 */
export async function processDispatchQueue(): Promise<{
  processed: number;
  failed: number;
  skipped: number;
}> {
  if (!isLanConnected()) {
    return { processed: 0, failed: 0, skipped: 0 };
  }

  const pending = await db.offline_dispatch_queue
    .where('status')
    .equals('pending')
    .sortBy('created_at');

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of pending) {
    // C-7: Check if item is ready for retry based on backoff delay
    if (!isReadyForRetry(item)) {
      skipped++;
      continue;
    }

    const now = new Date().toISOString();

    // Update status to sending and record attempt time
    await db.offline_dispatch_queue.update(item.id!, {
      status: 'sending',
      last_attempt_at: now,
    });

    try {
      const order = await db.offline_orders.get(item.order_id);
      if (!order) {
        // Order no longer exists, remove from queue
        await db.offline_dispatch_queue.delete(item.id!);
        continue;
      }

      const payload: IKdsNewOrderPayload = {
        order_id: item.order_id,
        order_number: order.order_number,
        table_number: order.table_number ? parseInt(order.table_number, 10) : null,
        order_type: order.order_type,
        items: item.items,
        station: item.station,
        timestamp: now,
      };

      await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);

      // Remove from queue on successful send
      await db.offline_dispatch_queue.delete(item.id!);
      processed++;

      logger.debug(`[kitchenDispatch] Processed queued dispatch for ${order.order_number} to ${item.station}`);
    } catch (error) {
      const attempts = item.attempts + 1;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      if (attempts >= DISPATCH_MAX_ATTEMPTS) {
        // Mark as failed after max retries
        await db.offline_dispatch_queue.update(item.id!, {
          status: 'failed',
          attempts,
          last_error: errorMsg,
        });

        // Update order status to failed
        await updateOrderDispatchStatus(item.order_id, 'failed', null, errorMsg);
        failed++;

        console.error(`[kitchenDispatch] Dispatch failed after ${DISPATCH_MAX_ATTEMPTS} attempts:`, errorMsg);
      } else {
        // Reset to pending for retry with exponential backoff
        await db.offline_dispatch_queue.update(item.id!, {
          status: 'pending',
          attempts,
          last_error: errorMsg,
        });

        const nextDelay = getRetryDelay(attempts);
        console.warn(`[kitchenDispatch] Dispatch attempt ${attempts} failed, will retry in ${nextDelay}ms:`, errorMsg);
      }
    }
  }

  return { processed, failed, skipped };
}

/**
 * Get retry delay with exponential backoff
 */
export function getRetryDelay(attempts: number): number {
  return DISPATCH_RETRY_BACKOFF_MS * Math.pow(2, attempts);
}

/**
 * C-7: Check if item is ready for retry based on backoff delay
 */
export function isReadyForRetry(item: IDispatchQueueItem): boolean {
  // First attempt (never tried before)
  if (item.attempts === 0 || !item.last_attempt_at) {
    return true;
  }

  const lastAttempt = new Date(item.last_attempt_at).getTime();
  const backoffDelay = getRetryDelay(item.attempts - 1); // attempts is already incremented
  const now = Date.now();

  return now - lastAttempt >= backoffDelay;
}

/**
 * Get pending dispatch count
 */
export async function getPendingDispatchCount(): Promise<number> {
  return db.offline_dispatch_queue
    .where('status')
    .equals('pending')
    .count();
}

/**
 * Get failed dispatch count
 */
export async function getFailedDispatchCount(): Promise<number> {
  return db.offline_dispatch_queue
    .where('status')
    .equals('failed')
    .count();
}

/**
 * Get dispatch queue items for an order
 */
export async function getOrderDispatchQueue(
  orderId: string
): Promise<IDispatchQueueItem[]> {
  return db.offline_dispatch_queue
    .where('order_id')
    .equals(orderId)
    .toArray();
}

/**
 * Get all pending dispatch queue items
 */
export async function getPendingDispatchItems(): Promise<IDispatchQueueItem[]> {
  return db.offline_dispatch_queue
    .where('status')
    .equals('pending')
    .sortBy('created_at');
}

/**
 * Clear failed dispatch items for an order
 * Used when user wants to dismiss failed dispatches
 */
export async function clearFailedDispatchItems(orderId: string): Promise<void> {
  await db.offline_dispatch_queue
    .where({ order_id: orderId, status: 'failed' })
    .delete();
}

/**
 * Retry failed dispatch items for an order
 */
export async function retryFailedDispatchItems(orderId: string): Promise<void> {
  await db.offline_dispatch_queue
    .where({ order_id: orderId, status: 'failed' })
    .modify({ status: 'pending', attempts: 0, last_error: null });

  // Update order status back to pending
  await updateOrderDispatchStatus(orderId, 'pending', null);
}
