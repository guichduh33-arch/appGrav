/**
 * Sync Engine Service
 * Story 2.5 - Sync Queue Management
 * Story 3.5 - Automatic Sync Engine
 * Sprint 3 - Priority sorting, idempotency, conflict detection
 *
 * Manages automatic synchronization of offline transactions when internet returns.
 * Processes queue items sorted by priority with idempotency protection.
 * Detects conflicts and stores them for user resolution instead of failing silently.
 */

import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';
import {
  getSyncQueueItems,
  getRetryableItems,
  markSyncing,
  markSynced,
  markFailed,
  cleanupSyncedItems,
  ISyncQueueItem,
} from './syncQueue';
import { markOrderSynced } from './orderSync';
import { sortByPriority } from './syncPriority';
import { generateKey, wrapWithIdempotency } from './idempotencyService';
import { detectConflict, storeConflict, getPendingConflictCount } from './syncConflictService';
import { useSyncStore } from '../../stores/syncStore';
import { useNetworkStore } from '../../stores/networkStore';

/**
 * Sync engine state
 */
interface ISyncEngineState {
  isRunning: boolean;
  lastSyncAt: Date | null;
  itemsSynced: number;
  itemsFailed: number;
}

const engineState: ISyncEngineState = {
  isRunning: false,
  lastSyncAt: null,
  itemsSynced: 0,
  itemsFailed: 0,
};

const SYNC_START_DELAY = 5000;
const ITEM_PROCESS_DELAY = 100;
const BACKGROUND_SYNC_INTERVAL = 30000;

let backgroundSyncIntervalId: ReturnType<typeof setInterval> | null = null;
let startDelayTimeoutId: ReturnType<typeof setTimeout> | null = null;
let autoSyncEnabled = true;

export function getSyncEngineState(): ISyncEngineState {
  return { ...engineState };
}

// =====================================================
// Entity Sync Functions
// =====================================================

async function syncOrder(item: ISyncQueueItem): Promise<void> {
  const orderPayload = item.payload as Record<string, unknown>;

  const orderData = {
    order_number: orderPayload.order_number as string,
    order_type: orderPayload.order_type as 'dine_in' | 'takeaway' | 'delivery' | 'b2b',
    table_number: orderPayload.table_number as string | null,
    customer_id: orderPayload.customer_id as string | null,
    subtotal: orderPayload.subtotal as number,
    discount_amount: orderPayload.discount_amount as number | null,
    discount_type: orderPayload.discount_type as 'percentage' | 'fixed' | 'free' | null,
    total: orderPayload.total as number,
    tax_amount: orderPayload.tax_amount as number | null,
    payment_status: orderPayload.payment_status as 'pending' | 'paid' | 'partial' | 'refunded',
    payment_method: orderPayload.payment_method as string | null,
    notes: orderPayload.notes as string | null,
    pos_terminal_id: orderPayload.pos_terminal_id as string | null,
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData as never)
    .select('id')
    .single();

  if (orderError) {
    throw new Error(`Failed to sync order: ${orderError.message}`);
  }

  const items = orderPayload.items as Array<Record<string, unknown>>;
  if (items && items.length > 0) {
    const orderItems = items.map((orderItem) => ({
      order_id: order.id,
      product_id: orderItem.product_id as string,
      product_name: orderItem.product_name as string,
      quantity: orderItem.quantity as number,
      unit_price: orderItem.unit_price as number,
      total_price: orderItem.total_price as number,
      modifiers: orderItem.modifiers ?? null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems as never);

    if (itemsError) {
      logger.error('[SyncEngine] Error inserting order items:', itemsError);
    }
  }

  const offlineOrderId = orderPayload.id as string;
  if (offlineOrderId) {
    await markOrderSynced(offlineOrderId, order.id);
  }

  logger.debug(`[SyncEngine] Order ${orderPayload.order_number} synced as ${order.id}`);
}

async function syncPayment(_item: ISyncQueueItem): Promise<void> {
  logger.debug('[SyncEngine] Payment sync not yet implemented (part of order sync)');
}

async function syncStockMovement(item: ISyncQueueItem): Promise<void> {
  const movementPayload = item.payload as Record<string, unknown>;
  const movementId = `OFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  type MovementType = 'transfer' | 'purchase' | 'production_in' | 'production_out' | 'sale_pos' | 'sale_b2b' | 'adjustment_in' | 'adjustment_out' | 'waste';
  const { error } = await supabase.from('stock_movements').insert({
    movement_id: movementId,
    product_id: movementPayload.product_id as string,
    movement_type: (movementPayload.movement_type || 'adjustment_out') as MovementType,
    quantity: movementPayload.quantity as number,
    reason: movementPayload.reason as string | null,
    reference_id: movementPayload.reference_id as string | null,
    stock_before: (movementPayload.stock_before as number) ?? 0,
    stock_after: (movementPayload.stock_after as number) ?? 0,
    unit: (movementPayload.unit as string) || 'pcs',
  });

  if (error) {
    throw new Error(`Failed to sync stock movement: ${error.message}`);
  }

  logger.debug('[SyncEngine] Stock movement synced');
}

async function syncProduct(item: ISyncQueueItem): Promise<void> {
  const { error } = await supabase.from('products').upsert(item.payload as never);
  if (error) {
    throw new Error(`Failed to sync product: ${error.message}`);
  }
  logger.debug(`[SyncEngine] Product ${item.entityId || 'unknown'} synced`);
}

async function syncCategory(item: ISyncQueueItem): Promise<void> {
  const { error } = await supabase.from('categories').upsert(item.payload as never);
  if (error) {
    throw new Error(`Failed to sync category: ${error.message}`);
  }
  logger.debug(`[SyncEngine] Category ${item.entityId || 'unknown'} synced`);
}

async function syncProductCategoryPrice(item: ISyncQueueItem): Promise<void> {
  const { error } = await supabase.from('product_category_prices').upsert(item.payload as never);
  if (error) {
    throw new Error(`Failed to sync product category price: ${error.message}`);
  }
  logger.debug(`[SyncEngine] Product category price ${item.entityId || 'unknown'} synced`);
}

// =====================================================
// Core sync dispatch
// =====================================================

async function dispatchSync(item: ISyncQueueItem): Promise<void> {
  switch (item.type) {
    case 'order':
      await syncOrder(item);
      break;
    case 'payment':
      await syncPayment(item);
      break;
    case 'stock_movement':
      await syncStockMovement(item);
      break;
    case 'product':
      await syncProduct(item);
      break;
    case 'category':
      await syncCategory(item);
      break;
    case 'product_category_price':
      await syncProductCategoryPrice(item);
      break;
    default:
      logger.warn(`[SyncEngine] Unknown item type: ${item.type}`);
  }
}

/**
 * Process a single sync queue item with idempotency + conflict detection
 */
async function processItem(item: ISyncQueueItem): Promise<boolean> {
  try {
    await markSyncing(item.id);

    // Generate idempotency key from item metadata
    const idempotencyKey =
      item.idempotency_key ??
      generateKey(item.type, item.entityId ?? item.id, item.action ?? 'create');

    const { skipped } = await wrapWithIdempotency(
      idempotencyKey,
      item.type,
      item.entityId ?? item.id,
      () => dispatchSync(item)
    );

    if (skipped) {
      logger.debug(`[SyncEngine] Item ${item.id} skipped (idempotent duplicate)`);
    }

    await markSynced(item.id);
    engineState.itemsSynced++;
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Try to detect and store conflict instead of just failing
    const conflict = detectConflict(item, error);
    if (conflict) {
      await storeConflict(conflict);
      logger.debug(`[SyncEngine] Conflict detected for ${item.type}:${item.entityId}`);
    }

    await markFailed(item.id, errorMessage);
    engineState.itemsFailed++;
    return false;
  }
}

// =====================================================
// Engine Run
// =====================================================

/**
 * Run the sync engine.
 * Items are sorted by priority before processing.
 */
export async function runSyncEngine(): Promise<{
  synced: number;
  failed: number;
}> {
  if (engineState.isRunning) {
    logger.debug('[SyncEngine] Already running');
    return { synced: 0, failed: 0 };
  }

  engineState.isRunning = true;
  engineState.itemsSynced = 0;
  engineState.itemsFailed = 0;

  const syncStore = useSyncStore.getState();
  syncStore.setIsSyncing(true);
  syncStore.setSyncStatus('syncing');

  logger.debug('[SyncEngine] Starting sync...');

  try {
    // Get pending + retryable items and sort by priority
    const pendingItems = await getSyncQueueItems('pending');
    const retryableItems = await getRetryableItems();
    const allItems = sortByPriority([...pendingItems, ...retryableItems]);

    const totalItems = allItems.length;
    logger.debug(`[SyncEngine] Processing ${totalItems} items (priority-sorted)`);

    // Update progress
    syncStore.setSyncProgress({ current: 0, total: totalItems });

    for (let i = 0; i < allItems.length; i++) {
      await processItem(allItems[i]);
      syncStore.setSyncProgress({ current: i + 1, total: totalItems });
      await new Promise((resolve) => setTimeout(resolve, ITEM_PROCESS_DELAY));
    }

    // Cleanup synced items
    await cleanupSyncedItems();

    // Update conflict count in store
    const conflictCount = await getPendingConflictCount();
    syncStore.setConflictCount(conflictCount);

    engineState.lastSyncAt = new Date();

    const finalStatus = engineState.itemsFailed > 0 ? 'error' : 'complete';
    syncStore.setSyncStatus(finalStatus);
    syncStore.setLastSyncAt(engineState.lastSyncAt);
    syncStore.setSyncProgress(null);

    logger.debug(
      `[SyncEngine] Sync complete: ${engineState.itemsSynced} synced, ${engineState.itemsFailed} failed, ${conflictCount} conflicts`
    );

    return {
      synced: engineState.itemsSynced,
      failed: engineState.itemsFailed,
    };
  } catch (error) {
    logger.error('[SyncEngine] Error during sync:', error);
    syncStore.setSyncStatus('error');
    syncStore.setSyncProgress(null);
    throw error;
  } finally {
    engineState.isRunning = false;
    syncStore.setIsSyncing(false);
  }
}

// =====================================================
// Lifecycle
// =====================================================

export function startSyncWithDelay(): void {
  if (startDelayTimeoutId) {
    clearTimeout(startDelayTimeoutId);
  }

  logger.debug(`[SyncEngine] Will start sync in ${SYNC_START_DELAY / 1000}s`);
  startDelayTimeoutId = setTimeout(() => {
    startDelayTimeoutId = null;
    runSyncEngine().catch((err) => {
      logger.error('[SyncEngine] Error during sync:', err);
    });
  }, SYNC_START_DELAY);
}

export function stopSyncEngine(): void {
  if (startDelayTimeoutId) {
    clearTimeout(startDelayTimeoutId);
    startDelayTimeoutId = null;
  }
  stopBackgroundSync();
  engineState.isRunning = false;
  logger.debug('[SyncEngine] Stopped');
}

export function setAutoSyncEnabled(enabled: boolean): void {
  autoSyncEnabled = enabled;
  logger.debug(`[SyncEngine] Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
  if (enabled) {
    startBackgroundSync();
  } else {
    stopBackgroundSync();
  }
}

export function isAutoSyncEnabled(): boolean {
  return autoSyncEnabled;
}

export function startBackgroundSync(): void {
  if (backgroundSyncIntervalId) {
    logger.debug('[SyncEngine] Background sync already running');
    return;
  }

  logger.debug(`[SyncEngine] Starting background sync (every ${BACKGROUND_SYNC_INTERVAL / 1000}s)`);

  backgroundSyncIntervalId = setInterval(async () => {
    const isOnline = useNetworkStore.getState().isOnline;
    if (!isOnline || !autoSyncEnabled || engineState.isRunning) return;

    const pendingItems = await getSyncQueueItems('pending');
    if (pendingItems.length === 0) return;

    logger.debug(`[SyncEngine] Background sync triggered - ${pendingItems.length} pending items`);
    await runSyncEngine();
  }, BACKGROUND_SYNC_INTERVAL);
}

export function stopBackgroundSync(): void {
  if (backgroundSyncIntervalId) {
    clearInterval(backgroundSyncIntervalId);
    backgroundSyncIntervalId = null;
    logger.debug('[SyncEngine] Background sync stopped');
  }
}

export function initializeSyncEngine(): void {
  logger.debug('[SyncEngine] Initializing...');
  startBackgroundSync();

  useNetworkStore.subscribe((state, prevState) => {
    if (state.isOnline && !prevState.isOnline) {
      logger.debug('[SyncEngine] Network restored - scheduling sync');
      startSyncWithDelay();
    }
  });

  logger.debug('[SyncEngine] Initialized');
}
