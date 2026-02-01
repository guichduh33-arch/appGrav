/**
 * Sync Queue Helpers (Story 3.6)
 *
 * Helper functions for sync queue management using the new db.ts schema.
 * Replaces legacy syncQueue.ts functions that used offlineDb.
 *
 * @see ADR-002: Stratégie de Synchronisation
 */

import { db } from '@/lib/db';
import type { ISyncQueueItem, TSyncEntity, TSyncStatus } from '@/types/offline';
import { SYNC_MAX_RETRIES } from '@/types/offline';

// =====================================================
// Shared Types
// =====================================================

/**
 * Result of a sync operation
 */
export interface ISyncResult {
  success: boolean;
  serverId?: string;
  error?: string;
}

// =====================================================
// ID Utilities
// =====================================================

/**
 * Check if an ID was generated offline (has LOCAL- prefix)
 */
export function isLocalId(id: string | null | undefined): boolean {
  return id?.startsWith('LOCAL-') ?? false;
}

// =====================================================
// Constants
// =====================================================

/**
 * Backoff delays in milliseconds
 * 5s → 10s → 30s → 60s → 300s
 */
export const BACKOFF_DELAYS = [
  5000, // 5 seconds - 1st retry
  10000, // 10 seconds - 2nd retry
  30000, // 30 seconds - 3rd retry
  60000, // 1 minute - beyond max
  300000, // 5 minutes
];

/**
 * Entity priority for sync order
 * Lower number = higher priority = synced first
 */
export const ENTITY_PRIORITY: Record<TSyncEntity, number> = {
  pos_sessions: 1, // Sessions first (FK for orders)
  orders: 2, // Orders second
  order_items: 3, // Items with orders (usually bundled)
  payments: 4, // Payments last (FK to orders)
  customers: 0, // No dependency
  products: 0, // No dependency
  categories: 0, // No dependency
};

// =====================================================
// Backoff Functions
// =====================================================

/**
 * Get backoff delay based on retry count
 *
 * @param retries - Number of previous retries
 * @returns Delay in milliseconds
 */
export function getBackoffDelay(retries: number): number {
  return BACKOFF_DELAYS[Math.min(retries, BACKOFF_DELAYS.length - 1)];
}

/**
 * Check if an item should be retried now based on backoff
 *
 * @param item - Sync queue item
 * @returns true if enough time has passed since last attempt
 */
export function shouldRetryNow(item: ISyncQueueItem): boolean {
  if (item.status !== 'failed') return false;
  if (item.retries >= SYNC_MAX_RETRIES) return false;

  // Calculate time since item was created/last modified
  // Note: We use created_at as proxy for last attempt time
  const lastAttempt = new Date(item.created_at).getTime();
  const delay = getBackoffDelay(item.retries);
  return Date.now() - lastAttempt >= delay;
}

// =====================================================
// Queue Query Functions
// =====================================================

/**
 * Get pending sync queue items
 *
 * @returns Promise with array of pending items
 */
export async function getPendingItems(): Promise<ISyncQueueItem[]> {
  return db.offline_sync_queue.where('status').equals('pending').toArray();
}

/**
 * Get failed items that are ready for retry
 *
 * @returns Promise with array of retryable items
 */
export async function getRetryableItems(): Promise<ISyncQueueItem[]> {
  const failedItems = await db.offline_sync_queue
    .where('status')
    .equals('failed')
    .toArray();

  return failedItems.filter(
    (item) => item.retries < SYNC_MAX_RETRIES && shouldRetryNow(item)
  );
}

/**
 * Get all items that need syncing (pending + retryable failed)
 *
 * @returns Promise with array of items to sync
 */
export async function getItemsToSync(): Promise<ISyncQueueItem[]> {
  const pending = await getPendingItems();
  const retryable = await getRetryableItems();
  return [...pending, ...retryable];
}

/**
 * Sort queue items by entity dependency order
 *
 * Sessions → Orders → Payments
 *
 * @param items - Array of sync queue items
 * @returns Sorted array
 */
export function sortQueueByDependency(items: ISyncQueueItem[]): ISyncQueueItem[] {
  return items.sort((a, b) => {
    const priorityA = ENTITY_PRIORITY[a.entity] ?? 99;
    const priorityB = ENTITY_PRIORITY[b.entity] ?? 99;

    // First sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Then by created_at (FIFO within same entity type)
    return (
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });
}

// =====================================================
// Queue Status Functions
// =====================================================

/**
 * Mark an item as syncing (in progress)
 *
 * @param itemId - Queue item ID
 */
export async function markSyncing(itemId: number): Promise<void> {
  await db.offline_sync_queue.update(itemId, {
    status: 'syncing' as TSyncStatus,
  });
}

/**
 * Mark an item as successfully synced
 *
 * @param itemId - Queue item ID
 */
export async function markSynced(itemId: number): Promise<void> {
  await db.offline_sync_queue.update(itemId, {
    status: 'completed' as TSyncStatus,
  });
}

/**
 * Mark an item as failed with error message
 * Increments retry counter
 *
 * @param itemId - Queue item ID
 * @param error - Error message
 */
export async function markFailed(itemId: number, error: string): Promise<void> {
  const item = await db.offline_sync_queue.get(itemId);
  if (!item) return;

  const newRetries = (item.retries ?? 0) + 1;

  await db.offline_sync_queue.update(itemId, {
    status: 'failed' as TSyncStatus,
    retries: newRetries,
    lastError: error,
  });
}

/**
 * Reset a failed item back to pending for immediate retry
 *
 * @param itemId - Queue item ID
 */
export async function resetToPending(itemId: number): Promise<void> {
  await db.offline_sync_queue.update(itemId, {
    status: 'pending' as TSyncStatus,
    lastError: undefined,
  });
}

// =====================================================
// Queue Count Functions
// =====================================================

/**
 * Get count of pending items in sync queue
 *
 * @returns Promise with count
 */
export async function getPendingSyncCount(): Promise<number> {
  return db.offline_sync_queue.where('status').equals('pending').count();
}

/**
 * Get queue counts by status
 *
 * @returns Promise with counts object
 */
export async function getQueueCounts(): Promise<{
  pending: number;
  syncing: number;
  failed: number;
  completed: number;
  total: number;
}> {
  const items = await db.offline_sync_queue.toArray();

  return {
    pending: items.filter((i) => i.status === 'pending').length,
    syncing: items.filter((i) => i.status === 'syncing').length,
    failed: items.filter((i) => i.status === 'failed').length,
    completed: items.filter((i) => i.status === 'completed').length,
    total: items.length,
  };
}

/**
 * Check if there are items that need syncing
 *
 * @returns Promise with boolean
 */
export async function hasItemsToSync(): Promise<boolean> {
  const pendingCount = await getPendingSyncCount();
  if (pendingCount > 0) return true;

  const retryable = await getRetryableItems();
  return retryable.length > 0;
}

// =====================================================
// Cleanup Functions
// =====================================================

/**
 * Remove completed/synced items from the queue
 *
 * @returns Promise with count of removed items
 */
export async function cleanupCompletedItems(): Promise<number> {
  const completed = await db.offline_sync_queue
    .where('status')
    .equals('completed')
    .toArray();

  if (completed.length === 0) return 0;

  const ids = completed.map((item) => item.id).filter((id): id is number => id !== undefined);
  await db.offline_sync_queue.bulkDelete(ids);

  return ids.length;
}

/**
 * Recover orphaned 'syncing' items back to 'pending'
 *
 * Called at startup to handle items stuck in syncing state
 * due to app crash or unexpected termination.
 *
 * @returns Promise with count of recovered items
 */
export async function recoverOrphanedSyncingItems(): Promise<number> {
  const syncing = await db.offline_sync_queue
    .where('status')
    .equals('syncing')
    .toArray();

  if (syncing.length === 0) return 0;

  for (const item of syncing) {
    if (item.id !== undefined) {
      await db.offline_sync_queue.update(item.id, {
        status: 'pending' as TSyncStatus,
      });
    }
  }

  return syncing.length;
}

/**
 * Clear all items from the sync queue
 *
 * Used for testing and recovery scenarios
 */
export async function clearSyncQueue(): Promise<void> {
  await db.offline_sync_queue.clear();
}

// =====================================================
// Story 3.8: Pending Sync Counter Display
// =====================================================

/**
 * Get all sync queue items (for display in panel)
 *
 * @returns Promise with array of all items
 */
export async function getAllQueueItems(): Promise<ISyncQueueItem[]> {
  return db.offline_sync_queue.toArray();
}

/**
 * Get sync queue items grouped by entity type
 *
 * @returns Promise with items grouped by entity
 */
export async function getQueueItemsGroupedByEntity(): Promise<
  Record<TSyncEntity, ISyncQueueItem[]>
> {
  const items = await db.offline_sync_queue.toArray();

  // Initialize all entity types with empty arrays
  const grouped: Record<TSyncEntity, ISyncQueueItem[]> = {
    pos_sessions: [],
    orders: [],
    order_items: [],
    payments: [],
    customers: [],
    products: [],
    categories: [],
  };

  for (const item of items) {
    if (grouped[item.entity]) {
      grouped[item.entity].push(item);
    }
  }

  return grouped;
}

/**
 * Retry a failed item by resetting its status to pending
 * Also resets the retry counter to give it a fresh start
 *
 * @param itemId - Queue item ID
 * @returns true if item was found and reset
 */
export async function retryFailedItem(itemId: number): Promise<boolean> {
  const item = await db.offline_sync_queue.get(itemId);
  if (!item) return false;

  await db.offline_sync_queue.update(itemId, {
    status: 'pending' as TSyncStatus,
    retries: 0,
    lastError: undefined,
  });

  return true;
}

/**
 * Delete an item from the sync queue
 *
 * WARNING: This permanently removes the item. Use with caution.
 *
 * @param itemId - Queue item ID
 * @returns true if item was found and deleted
 */
export async function deleteQueueItem(itemId: number): Promise<boolean> {
  const item = await db.offline_sync_queue.get(itemId);
  if (!item) return false;

  await db.offline_sync_queue.delete(itemId);
  return true;
}
