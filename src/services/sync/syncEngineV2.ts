/**
 * Sync Engine V2 (Story 3.6)
 *
 * Refactored sync engine using db.ts (offline_sync_queue) instead of legacy offlineDb.
 * Processes sync queue items in dependency order: Sessions → Orders → Payments.
 *
 * Features:
 * - FIFO processing with dependency ordering
 * - Exponential backoff for retries
 * - ID remapping for FK relationships
 * - Background polling every 30 seconds
 * - Automatic start after network reconnection (5s delay)
 *
 * @see ADR-002: Stratégie de Synchronisation
 * @see Story 3.6: Sync Queue Processing
 */

import { useSyncStore } from '@/stores/syncStore';
import { useNetworkStore } from '@/stores/networkStore';
import type { ISyncQueueItem, TSyncEntity } from '@/types/offline';

import {
  getItemsToSync,
  sortQueueByDependency,
  markSyncing,
  markSynced,
  markFailed,
  cleanupCompletedItems,
  recoverOrphanedSyncingItems,
  getPendingSyncCount,
} from './syncQueueHelpers';

import { processSessionSync, updateOrdersWithSessionServerId } from './sessionSyncProcessor';
import { processOrderSync } from './orderSyncProcessor';
import { processPaymentSync } from './paymentSyncProcessor';
import { syncStockLevelsToOffline } from './stockSync';
import { syncPromotionsToOffline } from './promotionSync';

// =====================================================
// Constants
// =====================================================

/** Delay before starting sync after going online (5 seconds) */
const SYNC_START_DELAY = 5000;

/** Minimum delay between processing items */
const ITEM_PROCESS_DELAY = 100;

/** Background sync interval (30 seconds) */
const BACKGROUND_SYNC_INTERVAL = 30000;

// =====================================================
// Engine State
// =====================================================

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

let backgroundSyncIntervalId: ReturnType<typeof setInterval> | null = null;
/** C-5: Store delay timeout ID for cleanup */
let startDelayTimeoutId: ReturnType<typeof setTimeout> | null = null;
let autoSyncEnabled = true;

// ID mappings for FK resolution during batch sync
const sessionIdMap: Map<string, string> = new Map();
const orderIdMap: Map<string, string> = new Map();

// =====================================================
// Engine State Accessors
// =====================================================

/**
 * Get current sync engine state
 */
export function getSyncEngineState(): ISyncEngineState {
  return { ...engineState };
}

/**
 * Check if auto-sync is enabled
 */
export function isAutoSyncEnabled(): boolean {
  return autoSyncEnabled;
}

// =====================================================
// Item Processing
// =====================================================

/**
 * Process a single sync queue item based on its entity type
 *
 * Routes to the appropriate processor and updates ID mappings.
 *
 * @param item - Sync queue item to process
 * @returns true if sync succeeded
 */
async function processItem(item: ISyncQueueItem): Promise<boolean> {
  if (item.id === undefined) return false;

  try {
    await markSyncing(item.id);

    let result;
    const entity = item.entity as TSyncEntity;

    switch (entity) {
      case 'pos_sessions':
        result = await processSessionSync(item);
        if (result.success && result.serverId) {
          sessionIdMap.set(item.entityId, result.serverId);
          // Update orders that reference this session
          await updateOrdersWithSessionServerId(item.entityId, result.serverId);
        }
        break;

      case 'orders':
        result = await processOrderSync(item, sessionIdMap);
        if (result.success && result.serverId) {
          orderIdMap.set(item.entityId, result.serverId);
        }
        break;

      case 'payments':
        result = await processPaymentSync(item, orderIdMap);
        break;

      default:
        console.warn(`[SyncEngineV2] Unknown entity type: ${entity}`);
        result = { success: false, error: `Unknown entity type: ${entity}` };
    }

    if (result.success) {
      await markSynced(item.id);
      engineState.itemsSynced++;
      return true;
    } else {
      await markFailed(item.id, result.error || 'Unknown error');
      engineState.itemsFailed++;
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (item.id !== undefined) {
      await markFailed(item.id, errorMessage);
    }
    engineState.itemsFailed++;
    return false;
  }
}

// =====================================================
// Main Sync Engine
// =====================================================

/**
 * Run the sync engine
 *
 * Processes all pending and retryable items in dependency order.
 * Updates sync store with progress.
 *
 * @returns Promise with sync results
 */
export async function runSyncEngine(): Promise<{
  synced: number;
  failed: number;
}> {
  if (engineState.isRunning) {
    console.log('[SyncEngineV2] Already running');
    return { synced: 0, failed: 0 };
  }

  engineState.isRunning = true;
  engineState.itemsSynced = 0;
  engineState.itemsFailed = 0;

  // Reset ID mappings for this batch
  sessionIdMap.clear();
  orderIdMap.clear();

  // Update sync store status
  const syncStore = useSyncStore.getState();
  syncStore.setIsSyncing(true);
  syncStore.setSyncStatus('syncing');

  console.log('[SyncEngineV2] Starting sync...');

  try {
    // Get all items that need syncing
    const items = await getItemsToSync();

    if (items.length === 0) {
      console.log('[SyncEngineV2] No items to sync');
      return { synced: 0, failed: 0 };
    }

    // Sort by dependency (sessions → orders → payments)
    const sortedItems = sortQueueByDependency(items);
    console.log(`[SyncEngineV2] Processing ${sortedItems.length} items`);

    // Process items in order
    for (const item of sortedItems) {
      await processItem(item);
      // Small delay between items to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, ITEM_PROCESS_DELAY));
    }

    // Cleanup completed items
    const cleaned = await cleanupCompletedItems();
    if (cleaned > 0) {
      console.log(`[SyncEngineV2] Cleaned ${cleaned} completed items`);
    }

    engineState.lastSyncAt = new Date();

    // Update sync store with results
    const finalStatus = engineState.itemsFailed > 0 ? 'error' : 'complete';
    syncStore.setSyncStatus(finalStatus);
    syncStore.setLastSyncAt(engineState.lastSyncAt);

    console.log(
      `[SyncEngineV2] Sync complete: ${engineState.itemsSynced} synced, ${engineState.itemsFailed} failed`
    );

    return {
      synced: engineState.itemsSynced,
      failed: engineState.itemsFailed,
    };
  } catch (error) {
    console.error('[SyncEngineV2] Error during sync:', error);
    syncStore.setSyncStatus('error');
    throw error;
  } finally {
    engineState.isRunning = false;
    syncStore.setIsSyncing(false);
  }
}

// =====================================================
// Auto-Sync Control
// =====================================================

/**
 * Start sync engine with delay (called when going online)
 *
 * Per Story requirements: Starts automatically within 5 seconds
 */
export function startSyncWithDelay(): void {
  // C-5: Clear any existing delay timeout before starting new one
  if (startDelayTimeoutId) {
    clearTimeout(startDelayTimeoutId);
  }

  console.log(`[SyncEngineV2] Will start sync in ${SYNC_START_DELAY / 1000}s`);
  startDelayTimeoutId = setTimeout(() => {
    startDelayTimeoutId = null;
    runSyncEngine().catch((err) => {
      console.error('[SyncEngineV2] Error during sync:', err);
    });
  }, SYNC_START_DELAY);
}

/**
 * Stop the sync engine
 *
 * C-5: Properly cleans up all timers before stopping
 */
export function stopSyncEngine(): void {
  // C-5: Clear delay timeout if pending
  if (startDelayTimeoutId) {
    clearTimeout(startDelayTimeoutId);
    startDelayTimeoutId = null;
  }

  // Stop background sync
  stopBackgroundSync();

  engineState.isRunning = false;
  console.log('[SyncEngineV2] Stopped');
}

/**
 * Enable or disable automatic sync
 *
 * @param enabled - Whether to enable auto-sync
 */
export function setAutoSyncEnabled(enabled: boolean): void {
  autoSyncEnabled = enabled;
  console.log(`[SyncEngineV2] Auto-sync ${enabled ? 'enabled' : 'disabled'}`);

  if (enabled) {
    startBackgroundSync();
  } else {
    stopBackgroundSync();
  }
}

// =====================================================
// Background Sync
// =====================================================

/**
 * Start background sync interval
 *
 * Runs sync automatically every BACKGROUND_SYNC_INTERVAL ms when online.
 */
export function startBackgroundSync(): void {
  if (backgroundSyncIntervalId) {
    console.log('[SyncEngineV2] Background sync already running');
    return;
  }

  console.log(
    `[SyncEngineV2] Starting background sync (every ${BACKGROUND_SYNC_INTERVAL / 1000}s)`
  );

  backgroundSyncIntervalId = setInterval(async () => {
    // Only sync if online and auto-sync is enabled
    const isOnline = useNetworkStore.getState().isOnline;

    if (!isOnline) {
      return; // Silent skip when offline
    }

    if (!autoSyncEnabled) {
      return; // Silent skip when disabled
    }

    if (engineState.isRunning) {
      return; // Silent skip when already running
    }

    // Check if there are pending items before running
    const pendingCount = await getPendingSyncCount();
    if (pendingCount === 0) {
      return; // No pending items
    }

    console.log(
      `[SyncEngineV2] Background sync triggered - ${pendingCount} pending items`
    );
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
    console.log('[SyncEngineV2] Background sync stopped');
  }
}

// =====================================================
// Initialization
// =====================================================

/**
 * Initialize the sync engine
 *
 * Should be called once when the app starts.
 * - Recovers orphaned 'syncing' items
 * - Starts background sync
 * - Subscribes to network changes
 */
export async function initializeSyncEngine(): Promise<void> {
  console.log('[SyncEngineV2] Initializing...');

  // Recover any items stuck in 'syncing' state from previous session
  const recovered = await recoverOrphanedSyncingItems();
  if (recovered > 0) {
    console.log(`[SyncEngineV2] Recovered ${recovered} orphaned items`);
  }

  // Start background sync
  startBackgroundSync();

  // Subscribe to network changes
  useNetworkStore.subscribe((state, prevState) => {
    if (state.isOnline && !prevState.isOnline) {
      // Coming back online
      console.log('[SyncEngineV2] Network restored - scheduling sync');
      startSyncWithDelay();

      // Refresh read-only caches (stock levels per Story 5.1)
      refreshReadOnlyCaches().catch((err) => {
        console.error('[SyncEngineV2] Error refreshing caches:', err);
      });
    }
  });

  console.log('[SyncEngineV2] Initialized');
}

/**
 * Refresh read-only caches when coming back online
 *
 * Called after network reconnection to update cached data.
 * Per Story 5.1: Stock levels auto-refresh on reconnect.
 * Per Story 6.4: Promotions auto-refresh on reconnect.
 */
async function refreshReadOnlyCaches(): Promise<void> {
  console.log('[SyncEngineV2] Refreshing read-only caches...');

  try {
    // Stock levels (Story 5.1)
    const stockCount = await syncStockLevelsToOffline();
    console.log(`[SyncEngineV2] Stock levels refreshed: ${stockCount} items`);
  } catch (error) {
    console.error('[SyncEngineV2] Error refreshing stock levels:', error);
  }

  try {
    // Promotions (Story 6.4)
    const promotionCount = await syncPromotionsToOffline();
    console.log(`[SyncEngineV2] Promotions refreshed: ${promotionCount} items`);
  } catch (error) {
    console.error('[SyncEngineV2] Error refreshing promotions:', error);
  }
}
