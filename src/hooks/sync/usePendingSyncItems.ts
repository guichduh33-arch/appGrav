/**
 * usePendingSyncItems Hook (Story 3.8)
 *
 * Provides sync queue items grouped by entity type for display in the panel.
 * Supports manual refresh and automatic updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { ISyncQueueItem } from '@/types/offline';
import {
  retryFailedItem,
  deleteQueueItem,
} from '@/services/sync/syncQueueHelpers';

/**
 * Grouped items by entity type
 */
export interface IGroupedSyncItems {
  pos_sessions: ISyncQueueItem[];
  orders: ISyncQueueItem[];
  order_items: ISyncQueueItem[];
  payments: ISyncQueueItem[];
  customers: ISyncQueueItem[];
  products: ISyncQueueItem[];
  categories: ISyncQueueItem[];
}

/**
 * Hook return type
 */
interface IUsePendingSyncItemsReturn {
  /** All items from the sync queue */
  items: ISyncQueueItem[];
  /** Items grouped by entity type */
  groupedItems: IGroupedSyncItems;
  /** Total count of items */
  totalCount: number;
  /** Count of items by status */
  statusCounts: {
    pending: number;
    syncing: number;
    failed: number;
  };
  /** Whether data is loading */
  isLoading: boolean;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
  /** Retry a failed item */
  retry: (itemId: number) => Promise<boolean>;
  /** Delete an item from the queue */
  remove: (itemId: number) => Promise<boolean>;
}

/** Refresh interval in milliseconds */
const REFRESH_INTERVAL = 5000; // 5 seconds

/**
 * Empty grouped items constant
 */
const EMPTY_GROUPED: IGroupedSyncItems = {
  pos_sessions: [],
  orders: [],
  order_items: [],
  payments: [],
  customers: [],
  products: [],
  categories: [],
};

/**
 * Hook for accessing sync queue items with grouping and actions
 *
 * @example
 * ```tsx
 * const { groupedItems, refresh, retry, remove } = usePendingSyncItems();
 *
 * // Display items by entity
 * Object.entries(groupedItems).map(([entity, items]) => (
 *   <EntityGroup key={entity} items={items} />
 * ));
 *
 * // Retry a failed item
 * await retry(itemId);
 * ```
 */
export function usePendingSyncItems(): IUsePendingSyncItemsReturn {
  const [items, setItems] = useState<ISyncQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load items from IndexedDB and group by entity
   */
  const loadItems = useCallback(async () => {
    try {
      const allItems = await db.offline_sync_queue.toArray();
      setItems(allItems);
    } catch (error) {
      console.error('[usePendingSyncItems] Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadItems();
  }, [loadItems]);

  /**
   * Retry a failed item
   */
  const retry = useCallback(async (itemId: number): Promise<boolean> => {
    const success = await retryFailedItem(itemId);
    if (success) {
      await loadItems();
    }
    return success;
  }, [loadItems]);

  /**
   * Delete an item from the queue
   */
  const remove = useCallback(async (itemId: number): Promise<boolean> => {
    const success = await deleteQueueItem(itemId);
    if (success) {
      await loadItems();
    }
    return success;
  }, [loadItems]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    loadItems();

    const interval = setInterval(loadItems, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadItems]);

  // Group items by entity
  const groupedItems = items.reduce<IGroupedSyncItems>((acc, item) => {
    const entity = item.entity as keyof IGroupedSyncItems;
    if (acc[entity]) {
      acc[entity].push(item);
    }
    return acc;
  }, { ...EMPTY_GROUPED });

  // Calculate status counts
  const statusCounts = {
    pending: items.filter((i) => i.status === 'pending').length,
    syncing: items.filter((i) => i.status === 'syncing').length,
    failed: items.filter((i) => i.status === 'failed').length,
  };

  return {
    items,
    groupedItems,
    totalCount: items.length,
    statusCounts,
    isLoading,
    refresh,
    retry,
    remove,
  };
}
