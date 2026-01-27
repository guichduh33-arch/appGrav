/**
 * Sync Engine Service
 * Story 2.5 - Sync Queue Management
 * Story 3.5 - Automatic Sync Engine
 *
 * Manages automatic synchronization of offline transactions when internet returns.
 * Processes queue items in FIFO order with exponential backoff for retries.
 * Provides background automatic sync at configurable intervals.
 */

import { supabase } from '@/lib/supabase';
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

let engineState: ISyncEngineState = {
  isRunning: false,
  lastSyncAt: null,
  itemsSynced: 0,
  itemsFailed: 0,
};

/**
 * Delay for starting sync after going online (per Story 2.5: 5 seconds)
 */
const SYNC_START_DELAY = 5000;

/**
 * Minimum delay between processing items
 */
const ITEM_PROCESS_DELAY = 100;

/**
 * Background sync interval in milliseconds (Story 3.5: every 30 seconds)
 */
const BACKGROUND_SYNC_INTERVAL = 30000;

/**
 * Interval ID for background sync timer
 */
let backgroundSyncIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Flag to track if auto-sync is enabled
 */
let autoSyncEnabled = true;

/**
 * Get current sync engine state
 */
export function getSyncEngineState(): ISyncEngineState {
  return { ...engineState };
}

/**
 * Sync a single order to Supabase
 */
async function syncOrder(item: ISyncQueueItem): Promise<void> {
  const orderPayload = item.payload as Record<string, unknown>;

  // Transform offline order to Supabase format
  // Using explicit type assertion for dynamic sync payload
  const orderData = {
    order_number: orderPayload.order_number as string,
    order_type: orderPayload.order_type as string,
    table_number: orderPayload.table_number as string | null,
    customer_id: orderPayload.customer_id as string | null,
    subtotal: orderPayload.subtotal as number,
    discount_amount: orderPayload.discount_amount as number | null,
    discount_type: orderPayload.discount_type as string | null,
    total: orderPayload.total as number,
    tax_amount: orderPayload.tax_amount as number | null,
    payment_status: orderPayload.payment_status as string,
    payment_method: orderPayload.payment_method as string | null,
    notes: orderPayload.notes as string | null,
    pos_terminal_id: orderPayload.pos_terminal_id as string | null,
  };

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to sync order: ${orderError.message}`);
  }

  // Insert order items
  const items = orderPayload.items as Array<Record<string, unknown>>;
  if (items && items.length > 0) {
    const orderItems = items.map((orderItem) => ({
      order_id: order.id,
      product_id: orderItem.product_id as string,
      product_name: orderItem.product_name as string,
      quantity: orderItem.quantity as number,
      unit_price: orderItem.unit_price as number,
      total_price: orderItem.total_price as number,
      modifiers: orderItem.modifiers as Record<string, unknown> | null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[SyncEngine] Error inserting order items:', itemsError);
      // Don't throw - order was created successfully
    }
  }

  // Mark the offline order as synced
  const offlineOrderId = orderPayload.id as string;
  if (offlineOrderId) {
    await markOrderSynced(offlineOrderId, order.id);
  }

  console.log(`[SyncEngine] Order ${orderPayload.order_number} synced as ${order.id}`);
}

/**
 * Sync a single payment to Supabase
 */
async function syncPayment(_item: ISyncQueueItem): Promise<void> {
  // Payment sync logic - would depend on payment structure
  // For now, payments are part of orders
  console.log('[SyncEngine] Payment sync not yet implemented (part of order sync)');
}

/**
 * Sync a single stock movement to Supabase
 */
async function syncStockMovement(item: ISyncQueueItem): Promise<void> {
  const movementPayload = item.payload as Record<string, unknown>;

  // stock_movements requires movement_id, stock_before, stock_after
  const movementId = `OFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { error } = await supabase.from('stock_movements').insert({
    movement_id: movementId,
    product_id: movementPayload.product_id as string,
    movement_type: movementPayload.movement_type as string,
    quantity: movementPayload.quantity as number,
    reason: movementPayload.reason as string | null,
    reference_id: movementPayload.reference_id as string | null,
    stock_before: (movementPayload.stock_before as number) ?? 0,
    stock_after: (movementPayload.stock_after as number) ?? 0,
  });

  if (error) {
    throw new Error(`Failed to sync stock movement: ${error.message}`);
  }

  console.log('[SyncEngine] Stock movement synced');
}

/**
 * Process a single sync queue item
 */
async function processItem(item: ISyncQueueItem): Promise<boolean> {
  try {
    await markSyncing(item.id);

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
      default:
        console.warn(`[SyncEngine] Unknown item type: ${item.type}`);
    }

    await markSynced(item.id);
    engineState.itemsSynced++;
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await markFailed(item.id, errorMessage);
    engineState.itemsFailed++;
    return false;
  }
}

/**
 * Run the sync engine
 * Processes all pending items in the queue
 */
export async function runSyncEngine(): Promise<{
  synced: number;
  failed: number;
}> {
  if (engineState.isRunning) {
    console.log('[SyncEngine] Already running');
    return { synced: 0, failed: 0 };
  }

  engineState.isRunning = true;
  engineState.itemsSynced = 0;
  engineState.itemsFailed = 0;

  // Update sync store status (Story 3.5)
  const syncStore = useSyncStore.getState();
  syncStore.setIsSyncing(true);
  syncStore.setSyncStatus('syncing');

  console.log('[SyncEngine] Starting sync...');

  try {
    // Get pending items
    const pendingItems = await getSyncQueueItems('pending');
    console.log(`[SyncEngine] Found ${pendingItems.length} pending items`);

    // Process pending items
    for (const item of pendingItems) {
      await processItem(item);
      // Small delay between items to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, ITEM_PROCESS_DELAY));
    }

    // Get retryable failed items
    const retryableItems = await getRetryableItems();
    console.log(`[SyncEngine] Found ${retryableItems.length} retryable items`);

    // Process retryable items
    for (const item of retryableItems) {
      await processItem(item);
      await new Promise((resolve) => setTimeout(resolve, ITEM_PROCESS_DELAY));
    }

    // Cleanup synced items
    await cleanupSyncedItems();

    engineState.lastSyncAt = new Date();

    // Update sync store with results (Story 3.5)
    const finalStatus = engineState.itemsFailed > 0 ? 'error' : 'complete';
    syncStore.setSyncStatus(finalStatus);
    syncStore.setLastSyncAt(engineState.lastSyncAt);

    console.log(
      `[SyncEngine] Sync complete: ${engineState.itemsSynced} synced, ${engineState.itemsFailed} failed`
    );

    return {
      synced: engineState.itemsSynced,
      failed: engineState.itemsFailed,
    };
  } catch (error) {
    console.error('[SyncEngine] Error during sync:', error);
    syncStore.setSyncStatus('error');
    throw error;
  } finally {
    engineState.isRunning = false;
    syncStore.setIsSyncing(false);
  }
}

/**
 * Start sync engine with delay (called when going online)
 * Per Story 2.5: Starts automatically within 5 seconds
 */
export function startSyncWithDelay(): void {
  console.log(`[SyncEngine] Will start sync in ${SYNC_START_DELAY / 1000}s`);
  setTimeout(() => {
    runSyncEngine().catch((err) => {
      console.error('[SyncEngine] Error during sync:', err);
    });
  }, SYNC_START_DELAY);
}

/**
 * Stop the sync engine
 */
export function stopSyncEngine(): void {
  engineState.isRunning = false;
  console.log('[SyncEngine] Stopped');
}

/**
 * Enable or disable automatic sync (Story 3.5)
 */
export function setAutoSyncEnabled(enabled: boolean): void {
  autoSyncEnabled = enabled;
  console.log(`[SyncEngine] Auto-sync ${enabled ? 'enabled' : 'disabled'}`);

  if (enabled) {
    startBackgroundSync();
  } else {
    stopBackgroundSync();
  }
}

/**
 * Check if auto-sync is enabled
 */
export function isAutoSyncEnabled(): boolean {
  return autoSyncEnabled;
}

/**
 * Start background sync interval (Story 3.5)
 * Runs sync automatically every BACKGROUND_SYNC_INTERVAL ms when online
 */
export function startBackgroundSync(): void {
  if (backgroundSyncIntervalId) {
    console.log('[SyncEngine] Background sync already running');
    return;
  }

  console.log(`[SyncEngine] Starting background sync (every ${BACKGROUND_SYNC_INTERVAL / 1000}s)`);

  backgroundSyncIntervalId = setInterval(async () => {
    // Only sync if online and auto-sync is enabled
    const isOnline = useNetworkStore.getState().isOnline;

    if (!isOnline) {
      console.log('[SyncEngine] Skipping background sync - offline');
      return;
    }

    if (!autoSyncEnabled) {
      console.log('[SyncEngine] Skipping background sync - disabled');
      return;
    }

    if (engineState.isRunning) {
      console.log('[SyncEngine] Skipping background sync - already running');
      return;
    }

    // Check if there are pending items before running
    const pendingItems = await getSyncQueueItems('pending');
    if (pendingItems.length === 0) {
      // No pending items, no need to sync
      return;
    }

    console.log(`[SyncEngine] Background sync triggered - ${pendingItems.length} pending items`);
    await runSyncEngine();
  }, BACKGROUND_SYNC_INTERVAL);
}

/**
 * Stop background sync interval
 */
export function stopBackgroundSync(): void {
  if (backgroundSyncIntervalId) {
    clearInterval(backgroundSyncIntervalId);
    backgroundSyncIntervalId = null;
    console.log('[SyncEngine] Background sync stopped');
  }
}

/**
 * Initialize the sync engine (Story 3.5)
 * Should be called once when the app starts
 */
export function initializeSyncEngine(): void {
  console.log('[SyncEngine] Initializing...');

  // Start background sync
  startBackgroundSync();

  // Subscribe to network changes
  useNetworkStore.subscribe((state, prevState) => {
    if (state.isOnline && !prevState.isOnline) {
      // Coming back online
      console.log('[SyncEngine] Network restored - scheduling sync');
      startSyncWithDelay();
    }
  });

  console.log('[SyncEngine] Initialized');
}
