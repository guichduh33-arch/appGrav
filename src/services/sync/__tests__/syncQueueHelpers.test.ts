/**
 * Sync Queue Helpers Tests (Story 3.6)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { ISyncQueueItem, TSyncEntity } from '@/types/offline';
import { SYNC_MAX_RETRIES } from '@/types/offline';

import {
  getBackoffDelay,
  shouldRetryNow,
  getPendingItems,
  // getRetryableItems - available but not directly tested
  // getItemsToSync - available but not directly tested
  sortQueueByDependency,
  markSyncing,
  markSynced,
  markFailed,
  resetToPending,
  getPendingSyncCount,
  getQueueCounts,
  hasItemsToSync,
  cleanupCompletedItems,
  recoverOrphanedSyncingItems,
  clearSyncQueue,
  getAllQueueItems,
  getQueueItemsGroupedByEntity,
  retryFailedItem,
  deleteQueueItem,
  BACKOFF_DELAYS,
  ENTITY_PRIORITY,
} from '../syncQueueHelpers';

describe('syncQueueHelpers', () => {
  beforeEach(async () => {
    await db.offline_sync_queue.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getBackoffDelay', () => {
    it('should return correct delay for each retry level', () => {
      expect(getBackoffDelay(0)).toBe(BACKOFF_DELAYS[0]); // 5000ms
      expect(getBackoffDelay(1)).toBe(BACKOFF_DELAYS[1]); // 10000ms
      expect(getBackoffDelay(2)).toBe(BACKOFF_DELAYS[2]); // 30000ms
      expect(getBackoffDelay(3)).toBe(BACKOFF_DELAYS[3]); // 60000ms
      expect(getBackoffDelay(4)).toBe(BACKOFF_DELAYS[4]); // 300000ms
    });

    it('should cap at max delay for high retry counts', () => {
      expect(getBackoffDelay(10)).toBe(BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1]);
      expect(getBackoffDelay(100)).toBe(BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1]);
    });
  });

  describe('shouldRetryNow', () => {
    it('should return false for non-failed items', () => {
      const item: ISyncQueueItem = {
        id: 1,
        entity: 'orders',
        action: 'create',
        entityId: 'LOCAL-ORDER-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      };
      expect(shouldRetryNow(item)).toBe(false);
    });

    it('should return false when max retries reached', () => {
      const item: ISyncQueueItem = {
        id: 1,
        entity: 'orders',
        action: 'create',
        entityId: 'LOCAL-ORDER-1',
        payload: {},
        created_at: new Date(Date.now() - 60000).toISOString(), // 1 min ago
        status: 'failed',
        retries: SYNC_MAX_RETRIES,
      };
      expect(shouldRetryNow(item)).toBe(false);
    });

    it('should return false when not enough time has passed', () => {
      const item: ISyncQueueItem = {
        id: 1,
        entity: 'orders',
        action: 'create',
        entityId: 'LOCAL-ORDER-1',
        payload: {},
        created_at: new Date().toISOString(), // Just now
        status: 'failed',
        retries: 0,
      };
      expect(shouldRetryNow(item)).toBe(false);
    });

    it('should return true when enough time has passed for retry', () => {
      const item: ISyncQueueItem = {
        id: 1,
        entity: 'orders',
        action: 'create',
        entityId: 'LOCAL-ORDER-1',
        payload: {},
        created_at: new Date(Date.now() - 10000).toISOString(), // 10s ago
        status: 'failed',
        retries: 0, // 5s backoff
      };
      expect(shouldRetryNow(item)).toBe(true);
    });
  });

  describe('sortQueueByDependency', () => {
    it('should sort sessions before orders before payments', () => {
      const items: ISyncQueueItem[] = [
        {
          id: 1,
          entity: 'payments',
          action: 'create',
          entityId: 'pay-1',
          payload: {},
          created_at: '2026-02-01T08:00:00Z',
          status: 'pending',
          retries: 0,
        },
        {
          id: 2,
          entity: 'orders',
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: '2026-02-01T08:01:00Z',
          status: 'pending',
          retries: 0,
        },
        {
          id: 3,
          entity: 'pos_sessions',
          action: 'create',
          entityId: 'session-1',
          payload: {},
          created_at: '2026-02-01T08:02:00Z',
          status: 'pending',
          retries: 0,
        },
      ];

      const sorted = sortQueueByDependency(items);

      expect(sorted[0].entity).toBe('pos_sessions');
      expect(sorted[1].entity).toBe('orders');
      expect(sorted[2].entity).toBe('payments');
    });

    it('should maintain FIFO order within same entity type', () => {
      const items: ISyncQueueItem[] = [
        {
          id: 1,
          entity: 'orders',
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: '2026-02-01T08:30:00Z',
          status: 'pending',
          retries: 0,
        },
        {
          id: 2,
          entity: 'orders',
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: '2026-02-01T08:00:00Z',
          status: 'pending',
          retries: 0,
        },
        {
          id: 3,
          entity: 'orders',
          action: 'create',
          entityId: 'order-3',
          payload: {},
          created_at: '2026-02-01T09:00:00Z',
          status: 'pending',
          retries: 0,
        },
      ];

      const sorted = sortQueueByDependency(items);

      expect(sorted[0].entityId).toBe('order-1'); // Earliest
      expect(sorted[1].entityId).toBe('order-2');
      expect(sorted[2].entityId).toBe('order-3'); // Latest
    });

    it('should handle mixed entity types correctly', () => {
      const items: ISyncQueueItem[] = [
        {
          id: 1,
          entity: 'orders',
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: '2026-02-01T08:00:00Z',
          status: 'pending',
          retries: 0,
        },
        {
          id: 2,
          entity: 'pos_sessions',
          action: 'create',
          entityId: 'session-1',
          payload: {},
          created_at: '2026-02-01T08:00:00Z',
          status: 'pending',
          retries: 0,
        },
        {
          id: 3,
          entity: 'orders',
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: '2026-02-01T08:01:00Z',
          status: 'pending',
          retries: 0,
        },
        {
          id: 4,
          entity: 'payments',
          action: 'create',
          entityId: 'pay-1',
          payload: {},
          created_at: '2026-02-01T08:00:00Z',
          status: 'pending',
          retries: 0,
        },
      ];

      const sorted = sortQueueByDependency(items);

      // Sessions first
      expect(sorted[0].entity).toBe('pos_sessions');
      // Then orders in FIFO
      expect(sorted[1].entity).toBe('orders');
      expect(sorted[1].entityId).toBe('order-1');
      expect(sorted[2].entity).toBe('orders');
      expect(sorted[2].entityId).toBe('order-2');
      // Then payments
      expect(sorted[3].entity).toBe('payments');
    });
  });

  describe('ENTITY_PRIORITY', () => {
    it('should have sessions with lowest priority number', () => {
      expect(ENTITY_PRIORITY['pos_sessions']).toBeLessThan(ENTITY_PRIORITY['orders']);
      expect(ENTITY_PRIORITY['orders']).toBeLessThan(ENTITY_PRIORITY['payments']);
    });
  });

  describe('getPendingItems', () => {
    it('should return only pending items', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'failed',
          retries: 1,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-3',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'completed',
          retries: 0,
        },
      ]);

      const pending = await getPendingItems();

      expect(pending.length).toBe(1);
      expect(pending[0].entityId).toBe('order-1');
    });
  });

  describe('markSyncing', () => {
    it('should update item status to syncing', async () => {
      const id = await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      });

      await markSyncing(id);

      const item = await db.offline_sync_queue.get(id);
      expect(item?.status).toBe('syncing');
    });
  });

  describe('markSynced', () => {
    it('should update item status to completed', async () => {
      const id = await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'syncing',
        retries: 0,
      });

      await markSynced(id);

      const item = await db.offline_sync_queue.get(id);
      expect(item?.status).toBe('completed');
    });
  });

  describe('markFailed', () => {
    it('should increment retries and set error', async () => {
      const id = await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'syncing',
        retries: 0,
      });

      await markFailed(id, 'Connection timeout');

      const item = await db.offline_sync_queue.get(id);
      expect(item?.status).toBe('failed');
      expect(item?.retries).toBe(1);
      expect(item?.lastError).toBe('Connection timeout');
    });

    it('should keep incrementing retries on subsequent failures', async () => {
      const id = await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'syncing',
        retries: 2,
      });

      await markFailed(id, 'Server error');

      const item = await db.offline_sync_queue.get(id);
      expect(item?.retries).toBe(3);
      expect(item?.status).toBe('failed');
    });
  });

  describe('resetToPending', () => {
    it('should reset failed item to pending', async () => {
      const id = await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'failed',
        retries: 2,
        lastError: 'Previous error',
      });

      await resetToPending(id);

      const item = await db.offline_sync_queue.get(id);
      expect(item?.status).toBe('pending');
      expect(item?.lastError).toBeUndefined();
    });
  });

  describe('getPendingSyncCount', () => {
    it('should return count of pending items', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-3',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'failed',
          retries: 1,
        },
      ]);

      const count = await getPendingSyncCount();

      expect(count).toBe(2);
    });
  });

  describe('getQueueCounts', () => {
    it('should return counts by status', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'syncing',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-3',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'failed',
          retries: 1,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-4',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'completed',
          retries: 0,
        },
      ]);

      const counts = await getQueueCounts();

      expect(counts.pending).toBe(1);
      expect(counts.syncing).toBe(1);
      expect(counts.failed).toBe(1);
      expect(counts.completed).toBe(1);
      expect(counts.total).toBe(4);
    });
  });

  describe('hasItemsToSync', () => {
    it('should return true when pending items exist', async () => {
      await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      });

      const hasItems = await hasItemsToSync();

      expect(hasItems).toBe(true);
    });

    it('should return false when queue is empty', async () => {
      const hasItems = await hasItemsToSync();

      expect(hasItems).toBe(false);
    });
  });

  describe('cleanupCompletedItems', () => {
    it('should remove completed items from queue', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'completed',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'completed',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-3',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
      ]);

      const removed = await cleanupCompletedItems();

      expect(removed).toBe(2);

      const remaining = await db.offline_sync_queue.toArray();
      expect(remaining.length).toBe(1);
      expect(remaining[0].entityId).toBe('order-3');
    });

    it('should return 0 when no completed items', async () => {
      await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      });

      const removed = await cleanupCompletedItems();

      expect(removed).toBe(0);
    });
  });

  describe('recoverOrphanedSyncingItems', () => {
    it('should reset syncing items back to pending', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'syncing',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'syncing',
          retries: 1,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-3',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
      ]);

      const recovered = await recoverOrphanedSyncingItems();

      expect(recovered).toBe(2);

      const items = await db.offline_sync_queue.toArray();
      const syncingItems = items.filter((i) => i.status === 'syncing');
      const pendingItems = items.filter((i) => i.status === 'pending');

      expect(syncingItems.length).toBe(0);
      expect(pendingItems.length).toBe(3);
    });

    it('should return 0 when no syncing items', async () => {
      const recovered = await recoverOrphanedSyncingItems();

      expect(recovered).toBe(0);
    });
  });

  describe('clearSyncQueue', () => {
    it('should remove all items from queue', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'failed',
          retries: 2,
        },
      ]);

      await clearSyncQueue();

      const items = await db.offline_sync_queue.toArray();
      expect(items.length).toBe(0);
    });
  });

  // Story 3.8: Pending Sync Counter Display - New Tests
  describe('getAllQueueItems (Story 3.8)', () => {
    it('should return all items in the queue', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'pos_sessions' as TSyncEntity,
          action: 'create',
          entityId: 'session-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'failed',
          retries: 2,
        },
        {
          entity: 'payments' as TSyncEntity,
          action: 'create',
          entityId: 'payment-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'syncing',
          retries: 0,
        },
      ]);

      const items = await getAllQueueItems();

      expect(items.length).toBe(3);
    });

    it('should return empty array when queue is empty', async () => {
      const items = await getAllQueueItems();

      expect(items).toEqual([]);
    });
  });

  describe('getQueueItemsGroupedByEntity (Story 3.8)', () => {
    it('should group items by entity type', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'pos_sessions' as TSyncEntity,
          action: 'create',
          entityId: 'session-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'failed',
          retries: 2,
        },
        {
          entity: 'payments' as TSyncEntity,
          action: 'create',
          entityId: 'payment-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'syncing',
          retries: 0,
        },
      ]);

      const grouped = await getQueueItemsGroupedByEntity();

      expect(grouped.orders.length).toBe(2);
      expect(grouped.pos_sessions.length).toBe(1);
      expect(grouped.payments.length).toBe(1);
    });

    it('should return empty arrays for entities with no items', async () => {
      await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      });

      const grouped = await getQueueItemsGroupedByEntity();

      expect(grouped.orders.length).toBe(1);
      expect(grouped.pos_sessions.length).toBe(0);
      expect(grouped.payments.length).toBe(0);
    });
  });

  describe('retryFailedItem (Story 3.8)', () => {
    it('should reset failed item to pending with 0 retries', async () => {
      const id = await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'failed',
        retries: 3,
        lastError: 'Connection timeout',
      });

      const result = await retryFailedItem(id);

      expect(result).toBe(true);

      const item = await db.offline_sync_queue.get(id);
      expect(item?.status).toBe('pending');
      expect(item?.retries).toBe(0);
      expect(item?.lastError).toBeUndefined();
    });

    it('should return false for non-existent item', async () => {
      const result = await retryFailedItem(99999);

      expect(result).toBe(false);
    });
  });

  describe('deleteQueueItem (Story 3.8)', () => {
    it('should remove item from queue', async () => {
      const id = await db.offline_sync_queue.add({
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'failed',
        retries: 3,
        lastError: 'Connection timeout',
      });

      const result = await deleteQueueItem(id);

      expect(result).toBe(true);

      const item = await db.offline_sync_queue.get(id);
      expect(item).toBeUndefined();
    });

    it('should return false for non-existent item', async () => {
      const result = await deleteQueueItem(99999);

      expect(result).toBe(false);
    });

    it('should only remove specified item', async () => {
      await db.offline_sync_queue.bulkAdd([
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-1',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          entity: 'orders' as TSyncEntity,
          action: 'create',
          entityId: 'order-2',
          payload: {},
          created_at: new Date().toISOString(),
          status: 'failed',
          retries: 2,
        },
      ]);

      const items = await db.offline_sync_queue.toArray();
      const itemToDelete = items.find((i) => i.entityId === 'order-2');

      await deleteQueueItem(itemToDelete!.id!);

      const remaining = await db.offline_sync_queue.toArray();
      expect(remaining.length).toBe(1);
      expect(remaining[0].entityId).toBe('order-1');
    });
  });
});
