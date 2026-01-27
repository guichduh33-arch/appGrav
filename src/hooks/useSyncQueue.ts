/**
 * useSyncQueue Hook
 * Story 2.6 - Pending Transactions Counter
 *
 * Provides real-time sync queue monitoring for UI components.
 * Tracks pending transactions and sync status.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSyncStore } from '../stores/syncStore';
import { getQueueCounts, hasItemsToSync } from '../services/sync/syncQueue';

/**
 * Queue counts structure
 */
interface IQueueCounts {
  pending: number;
  syncing: number;
  failed: number;
  synced: number;
  total: number;
}

/**
 * Hook return type
 */
interface IUseSyncQueueReturn {
  /** Current queue counts by status */
  counts: IQueueCounts;
  /** Total items that need syncing (pending + failed) */
  pendingTotal: number;
  /** Is sync currently running */
  isSyncing: boolean;
  /** Current sync status */
  syncStatus: 'idle' | 'syncing' | 'error' | 'complete';
  /** Last sync timestamp */
  lastSyncAt: Date | null;
  /** Last error message */
  lastError: string | null;
  /** Manually refresh counts */
  refreshCounts: () => Promise<void>;
  /** Has any items that need syncing */
  hasItemsToSync: boolean;
}

/** Refresh interval in milliseconds */
const REFRESH_INTERVAL = 5000; // 5 seconds

/**
 * Hook for monitoring sync queue status
 *
 * Provides real-time updates on:
 * - Pending transaction count
 * - Sync status (idle, syncing, error, complete)
 * - Failed items count
 *
 * @example
 * ```tsx
 * const { pendingTotal, isSyncing, syncStatus } = useSyncQueue();
 *
 * if (pendingTotal > 0) {
 *   return <Badge>{pendingTotal} pending</Badge>;
 * }
 * ```
 */
export function useSyncQueue(): IUseSyncQueueReturn {
  const { syncStatus, lastSyncAt, lastError, isSyncing } = useSyncStore();

  const [counts, setCounts] = useState<IQueueCounts>({
    pending: 0,
    syncing: 0,
    failed: 0,
    synced: 0,
    total: 0,
  });

  const [hasItems, setHasItems] = useState(false);

  /**
   * Refresh queue counts from IndexedDB
   */
  const refreshCounts = useCallback(async () => {
    try {
      const queueCounts = await getQueueCounts();
      setCounts(queueCounts);

      const itemsToSync = await hasItemsToSync();
      setHasItems(itemsToSync);
    } catch (error) {
      console.error('[useSyncQueue] Error refreshing counts:', error);
    }
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    // Fetch immediately on mount
    refreshCounts();

    // Set up periodic refresh
    const interval = setInterval(refreshCounts, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshCounts]);

  // Refresh when sync status changes
  useEffect(() => {
    if (syncStatus === 'complete' || syncStatus === 'error') {
      refreshCounts();
    }
  }, [syncStatus, refreshCounts]);

  // Calculate pending total (items that need syncing)
  const pendingTotal = counts.pending + counts.failed;

  return {
    counts,
    pendingTotal,
    isSyncing,
    syncStatus,
    lastSyncAt,
    lastError,
    refreshCounts,
    hasItemsToSync: hasItems,
  };
}
