import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { offlineDb } from './offlineDb';
import {
  addToSyncQueue,
  getSyncQueueItems,
  updateSyncQueueItem,
  removeSyncQueueItem,
  getPendingSyncCount,
  clearSyncQueue
} from './syncQueue';
import { OFFLINE_CONSTANTS } from '../../constants/offline';

describe('syncQueue', () => {
  beforeEach(async () => {
    await offlineDb.sync_queue.clear();
  });

  afterEach(async () => {
    await offlineDb.sync_queue.clear();
  });

  describe('addToSyncQueue', () => {
    it('should add an order to the sync queue', async () => {
      const payload = { orderId: 'ord-1', items: [], total: 50000 };
      const id = await addToSyncQueue('order', payload);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      const item = await offlineDb.sync_queue.get(id);
      expect(item).toBeDefined();
      expect(item?.type).toBe('order');
      expect(item?.payload).toEqual(payload);
      expect(item?.status).toBe('pending');
      expect(item?.attempts).toBe(0);
      expect(item?.lastError).toBeNull();
    });

    it('should add a payment to the sync queue', async () => {
      const payload = { paymentId: 'pay-1', amount: 50000, method: 'cash' };
      const id = await addToSyncQueue('payment', payload);

      const item = await offlineDb.sync_queue.get(id);
      expect(item?.type).toBe('payment');
      expect(item?.payload).toEqual(payload);
    });

    it('should add a stock_movement to the sync queue', async () => {
      const payload = { productId: 'prod-1', quantity: -5, type: 'sale' };
      const id = await addToSyncQueue('stock_movement', payload);

      const item = await offlineDb.sync_queue.get(id);
      expect(item?.type).toBe('stock_movement');
    });

    it('should set createdAt to ISO 8601 format', async () => {
      const beforeAdd = new Date().toISOString();
      const id = await addToSyncQueue('order', {});
      const afterAdd = new Date().toISOString();

      const item = await offlineDb.sync_queue.get(id);
      expect(item?.createdAt).toBeDefined();
      expect(item!.createdAt >= beforeAdd).toBe(true);
      expect(item!.createdAt <= afterAdd).toBe(true);
    });

    it('should throw error when queue is full (NFR-R4)', async () => {
      // Fill the queue to max capacity
      const promises = [];
      for (let i = 0; i < OFFLINE_CONSTANTS.MAX_QUEUE_SIZE; i++) {
        promises.push(offlineDb.sync_queue.add({
          id: `item-${i}`,
          type: 'order',
          payload: {},
          status: 'pending',
          createdAt: new Date().toISOString(),
          attempts: 0,
          lastError: null
        }));
      }
      await Promise.all(promises);

      // Try to add one more
      await expect(addToSyncQueue('order', {})).rejects.toThrow(
        `Sync queue full (max: ${OFFLINE_CONSTANTS.MAX_QUEUE_SIZE})`
      );
    });

    it('should generate unique IDs', async () => {
      const id1 = await addToSyncQueue('order', {});
      const id2 = await addToSyncQueue('order', {});
      const id3 = await addToSyncQueue('order', {});

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('getSyncQueueItems', () => {
    beforeEach(async () => {
      await offlineDb.sync_queue.bulkAdd([
        { id: 'item-1', type: 'order', payload: {}, status: 'pending', createdAt: '2026-01-27T10:00:00Z', attempts: 0, lastError: null },
        { id: 'item-2', type: 'payment', payload: {}, status: 'synced', createdAt: '2026-01-27T10:01:00Z', attempts: 1, lastError: null },
        { id: 'item-3', type: 'order', payload: {}, status: 'pending', createdAt: '2026-01-27T10:02:00Z', attempts: 0, lastError: null },
        { id: 'item-4', type: 'stock_movement', payload: {}, status: 'failed', createdAt: '2026-01-27T10:03:00Z', attempts: 5, lastError: 'Network error' }
      ]);
    });

    it('should return all items when no status filter', async () => {
      const items = await getSyncQueueItems();
      expect(items).toHaveLength(4);
    });

    it('should filter by pending status', async () => {
      const items = await getSyncQueueItems('pending');
      expect(items).toHaveLength(2);
      expect(items.every(i => i.status === 'pending')).toBe(true);
    });

    it('should filter by synced status', async () => {
      const items = await getSyncQueueItems('synced');
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('item-2');
    });

    it('should filter by failed status', async () => {
      const items = await getSyncQueueItems('failed');
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('item-4');
    });

    it('should return empty array when no items match', async () => {
      const items = await getSyncQueueItems('syncing');
      expect(items).toHaveLength(0);
    });
  });

  describe('updateSyncQueueItem', () => {
    beforeEach(async () => {
      await offlineDb.sync_queue.add({
        id: 'update-test',
        type: 'order',
        payload: { data: 'test' },
        status: 'pending',
        createdAt: '2026-01-27T10:00:00Z',
        attempts: 0,
        lastError: null
      });
    });

    it('should update status', async () => {
      await updateSyncQueueItem('update-test', { status: 'syncing' });

      const item = await offlineDb.sync_queue.get('update-test');
      expect(item?.status).toBe('syncing');
    });

    it('should update attempts', async () => {
      await updateSyncQueueItem('update-test', { attempts: 3 });

      const item = await offlineDb.sync_queue.get('update-test');
      expect(item?.attempts).toBe(3);
    });

    it('should update lastError', async () => {
      await updateSyncQueueItem('update-test', { lastError: 'Connection timeout' });

      const item = await offlineDb.sync_queue.get('update-test');
      expect(item?.lastError).toBe('Connection timeout');
    });

    it('should update multiple fields at once', async () => {
      await updateSyncQueueItem('update-test', {
        status: 'failed',
        attempts: 5,
        lastError: 'Max retries exceeded'
      });

      const item = await offlineDb.sync_queue.get('update-test');
      expect(item?.status).toBe('failed');
      expect(item?.attempts).toBe(5);
      expect(item?.lastError).toBe('Max retries exceeded');
    });

    it('should preserve immutable fields', async () => {
      const originalItem = await offlineDb.sync_queue.get('update-test');

      await updateSyncQueueItem('update-test', { status: 'synced' });

      const updatedItem = await offlineDb.sync_queue.get('update-test');
      expect(updatedItem?.id).toBe(originalItem?.id);
      expect(updatedItem?.type).toBe(originalItem?.type);
      expect(updatedItem?.payload).toEqual(originalItem?.payload);
      expect(updatedItem?.createdAt).toBe(originalItem?.createdAt);
    });
  });

  describe('removeSyncQueueItem', () => {
    beforeEach(async () => {
      await offlineDb.sync_queue.bulkAdd([
        { id: 'remove-1', type: 'order', payload: {}, status: 'synced', createdAt: '2026-01-27T10:00:00Z', attempts: 1, lastError: null },
        { id: 'remove-2', type: 'payment', payload: {}, status: 'pending', createdAt: '2026-01-27T10:01:00Z', attempts: 0, lastError: null }
      ]);
    });

    it('should remove an item', async () => {
      await removeSyncQueueItem('remove-1');

      const item = await offlineDb.sync_queue.get('remove-1');
      expect(item).toBeUndefined();
    });

    it('should not affect other items', async () => {
      await removeSyncQueueItem('remove-1');

      const remaining = await offlineDb.sync_queue.toArray();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('remove-2');
    });

    it('should not throw when removing non-existent item', async () => {
      await expect(removeSyncQueueItem('non-existent')).resolves.not.toThrow();
    });
  });

  describe('getPendingSyncCount', () => {
    it('should return 0 when queue is empty', async () => {
      const count = await getPendingSyncCount();
      expect(count).toBe(0);
    });

    it('should return correct count of pending items', async () => {
      await offlineDb.sync_queue.bulkAdd([
        { id: 'p1', type: 'order', payload: {}, status: 'pending', createdAt: '', attempts: 0, lastError: null },
        { id: 'p2', type: 'order', payload: {}, status: 'pending', createdAt: '', attempts: 0, lastError: null },
        { id: 's1', type: 'order', payload: {}, status: 'synced', createdAt: '', attempts: 1, lastError: null },
        { id: 'f1', type: 'order', payload: {}, status: 'failed', createdAt: '', attempts: 5, lastError: 'Error' }
      ]);

      const count = await getPendingSyncCount();
      expect(count).toBe(2);
    });

    it('should not count syncing items', async () => {
      await offlineDb.sync_queue.bulkAdd([
        { id: 'p1', type: 'order', payload: {}, status: 'pending', createdAt: '', attempts: 0, lastError: null },
        { id: 'syncing1', type: 'order', payload: {}, status: 'syncing', createdAt: '', attempts: 1, lastError: null }
      ]);

      const count = await getPendingSyncCount();
      expect(count).toBe(1);
    });
  });

  describe('clearSyncQueue', () => {
    it('should remove all items from queue', async () => {
      await offlineDb.sync_queue.bulkAdd([
        { id: 'c1', type: 'order', payload: {}, status: 'pending', createdAt: '', attempts: 0, lastError: null },
        { id: 'c2', type: 'payment', payload: {}, status: 'synced', createdAt: '', attempts: 1, lastError: null },
        { id: 'c3', type: 'stock_movement', payload: {}, status: 'failed', createdAt: '', attempts: 5, lastError: 'Error' }
      ]);

      expect(await offlineDb.sync_queue.count()).toBe(3);

      await clearSyncQueue();

      expect(await offlineDb.sync_queue.count()).toBe(0);
    });

    it('should not throw when queue is already empty', async () => {
      await expect(clearSyncQueue()).resolves.not.toThrow();
    });
  });
});
