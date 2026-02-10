/**
 * Sync Queue Service
 * Story 2.5 - Sync Queue Management
 *
 * Manages the synchronization queue for offline transactions.
 * Implements FIFO processing with exponential backoff for retries.
 *
 * @migration Uses db.ts (unified schema) instead of legacy offlineDb.ts
 */

import { db } from '@/lib/db';
import logger from '@/utils/logger';
import type {
  ILegacySyncQueueItem,
  TLegacySyncQueueType,
  TLegacySyncQueueStatus,
} from '@/types/offline';
import { OFFLINE_CONSTANTS } from '../../constants/offline';

// Re-export types for backward compatibility
export type ISyncQueueItem = ILegacySyncQueueItem;
export type TSyncQueueType = TLegacySyncQueueType;
export type TSyncQueueStatus = TLegacySyncQueueStatus;

/**
 * Exponential backoff delays in milliseconds
 * 5s → 10s → 30s → 1min → 5min (per Story 2.5 requirements)
 */
export const BACKOFF_DELAYS = [
  5000,    // 5 seconds
  10000,   // 10 seconds
  30000,   // 30 seconds
  60000,   // 1 minute
  300000,  // 5 minutes
];

/**
 * Get backoff delay based on retry count
 */
export function getBackoffDelay(attempts: number): number {
  const index = Math.min(attempts, BACKOFF_DELAYS.length - 1);
  return BACKOFF_DELAYS[index];
}

/**
 * Add an item to the sync queue
 * @param type - Type of transaction (order, payment, stock_movement)
 * @param payload - Transaction data to sync
 * @returns The ID of the created queue item
 * @throws Error if queue is full (NFR-R4: 500 max)
 */
export async function addToSyncQueue(
  type: TSyncQueueType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
): Promise<string> {
  const queueCount = await db.offline_legacy_sync_queue.count();

  // Story 2.5: Clean up synced items if queue is near capacity
  if (queueCount >= OFFLINE_CONSTANTS.MAX_QUEUE_SIZE) {
    const cleaned = await cleanupSyncedItems();
    const newCount = await db.offline_legacy_sync_queue.count();
    if (newCount >= OFFLINE_CONSTANTS.MAX_QUEUE_SIZE) {
      throw new Error(`Sync queue full (max: ${OFFLINE_CONSTANTS.MAX_QUEUE_SIZE})`);
    }
    logger.debug(`[SyncQueue] Cleaned ${cleaned} items, queue now has ${newCount} items`);
  }

  const item: ISyncQueueItem = {
    id: crypto.randomUUID(),
    type,
    payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null
  };

  await db.offline_legacy_sync_queue.add(item);
  logger.debug(`[SyncQueue] Added ${type} item: ${item.id}`);
  return item.id;
}

/**
 * Get sync queue items, optionally filtered by status
 * @param status - Optional status filter
 * @returns Array of sync queue items
 */
export async function getSyncQueueItems(
  status?: TSyncQueueStatus
): Promise<ISyncQueueItem[]> {
  if (status) {
    return db.offline_legacy_sync_queue.where('status').equals(status).toArray();
  }
  return db.offline_legacy_sync_queue.toArray();
}

/**
 * Update a sync queue item
 * @param id - Item ID to update
 * @param updates - Partial updates (status, attempts, lastError)
 */
export async function updateSyncQueueItem(
  id: string,
  updates: Partial<Omit<ISyncQueueItem, 'id' | 'type' | 'payload' | 'createdAt'>>
): Promise<void> {
  await db.offline_legacy_sync_queue.update(id, updates);
}

/**
 * Remove a sync queue item
 * @param id - Item ID to remove
 */
export async function removeSyncQueueItem(id: string): Promise<void> {
  await db.offline_legacy_sync_queue.delete(id);
}

/**
 * Get count of pending items in sync queue
 * Used for displaying pending transaction counter (FR5)
 * @returns Count of items with 'pending' status
 */
export async function getPendingSyncCount(): Promise<number> {
  return db.offline_legacy_sync_queue.where('status').equals('pending').count();
}

/**
 * Clear all items from the sync queue
 * Used for testing and recovery scenarios
 */
export async function clearSyncQueue(): Promise<void> {
  await db.offline_legacy_sync_queue.clear();
  logger.debug('[SyncQueue] Queue cleared');
}

/**
 * Clean up synced items from the queue (Story 2.5)
 * Keeps the queue size manageable
 */
export async function cleanupSyncedItems(): Promise<number> {
  const syncedItems = await db.offline_legacy_sync_queue
    .where('status')
    .equals('synced')
    .toArray();

  if (syncedItems.length === 0) return 0;

  const ids = syncedItems.map((item) => item.id);
  await db.offline_legacy_sync_queue.bulkDelete(ids);

  logger.debug(`[SyncQueue] Cleaned up ${ids.length} synced items`);
  return ids.length;
}

/**
 * Mark an item as syncing (in progress)
 */
export async function markSyncing(itemId: string): Promise<void> {
  await db.offline_legacy_sync_queue.update(itemId, {
    status: 'syncing' as TSyncQueueStatus,
  });
}

/**
 * Mark an item as successfully synced
 */
export async function markSynced(itemId: string): Promise<void> {
  await db.offline_legacy_sync_queue.update(itemId, {
    status: 'synced' as TSyncQueueStatus,
  });
  logger.debug(`[SyncQueue] Item ${itemId} synced successfully`);
}

/**
 * Mark an item as failed with error message (Story 2.5)
 * Increments attempts counter for backoff calculation
 */
export async function markFailed(itemId: string, error: string): Promise<void> {
  const item = await db.offline_legacy_sync_queue.get(itemId);
  if (!item) return;

  await db.offline_legacy_sync_queue.update(itemId, {
    status: 'failed' as TSyncQueueStatus,
    attempts: item.attempts + 1,
    lastError: error,
  });
  logger.debug(`[SyncQueue] Item ${itemId} failed (attempt ${item.attempts + 1}): ${error}`);
}

/**
 * Get items that are ready to retry (failed items past their backoff delay)
 */
export async function getRetryableItems(): Promise<ISyncQueueItem[]> {
  const failedItems = await db.offline_legacy_sync_queue
    .where('status')
    .equals('failed')
    .toArray();

  const now = Date.now();
  return failedItems.filter((item) => {
    const backoffDelay = getBackoffDelay(item.attempts);
    const lastAttemptTime = new Date(item.createdAt).getTime();
    return now - lastAttemptTime >= backoffDelay;
  });
}

/**
 * Get queue counts by status
 */
export async function getQueueCounts(): Promise<{
  pending: number;
  syncing: number;
  failed: number;
  synced: number;
  total: number;
}> {
  const items = await db.offline_legacy_sync_queue.toArray();

  return {
    pending: items.filter((i) => i.status === 'pending').length,
    syncing: items.filter((i) => i.status === 'syncing').length,
    failed: items.filter((i) => i.status === 'failed').length,
    synced: items.filter((i) => i.status === 'synced').length,
    total: items.length,
  };
}

/**
 * Check if queue has any pending or failed items that need syncing
 */
export async function hasItemsToSync(): Promise<boolean> {
  const pendingCount = await db.offline_legacy_sync_queue
    .where('status')
    .equals('pending')
    .count();

  if (pendingCount > 0) return true;

  const failedCount = await db.offline_legacy_sync_queue
    .where('status')
    .equals('failed')
    .count();

  return failedCount > 0;
}

/**
 * Reset a failed item back to pending for immediate retry
 */
export async function resetToPending(itemId: string): Promise<void> {
  await db.offline_legacy_sync_queue.update(itemId, {
    status: 'pending' as TSyncQueueStatus,
    lastError: null,
  });
  logger.debug(`[SyncQueue] Item ${itemId} reset to pending`);
}
