/**
 * usePendingSyncItems Hook Tests (Story 3.8)
 *
 * Tests for the hook that provides pending sync items data
 * for the PendingSyncPanel component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { TSyncEntity } from '@/types/offline';
import { usePendingSyncItems } from '../usePendingSyncItems';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('usePendingSyncItems', () => {
  beforeEach(async () => {
    // Clear all tables to ensure clean state
    await db.offline_sync_queue.clear();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    // Clear after each test
    await db.offline_sync_queue.clear();
  });

  it('should return empty state when queue is empty', async () => {
    const { result, unmount } = renderHook(() => usePendingSyncItems());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    expect(result.current.totalCount).toBe(0);
    expect(result.current.items).toEqual([]);

    unmount();
  });

  it('should return items from the queue', async () => {
    await db.offline_sync_queue.bulkAdd([
      {
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'test-order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      },
      {
        entity: 'payments' as TSyncEntity,
        action: 'create',
        entityId: 'test-payment-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'failed',
        retries: 2,
        lastError: 'Connection error',
      },
    ]);

    const { result, unmount } = renderHook(() => usePendingSyncItems());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(result.current.totalCount).toBe(2);
    }, { timeout: 10000 });

    expect(result.current.items.length).toBe(2);
    expect(result.current.groupedItems.orders.length).toBe(1);
    expect(result.current.groupedItems.payments.length).toBe(1);

    unmount();
  });

  it('should return correct status counts', async () => {
    await db.offline_sync_queue.bulkAdd([
      {
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'status-order-1',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      },
      {
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'status-order-2',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'syncing',
        retries: 0,
      },
      {
        entity: 'orders' as TSyncEntity,
        action: 'create',
        entityId: 'status-order-3',
        payload: {},
        created_at: new Date().toISOString(),
        status: 'failed',
        retries: 2,
      },
    ]);

    const { result, unmount } = renderHook(() => usePendingSyncItems());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(result.current.statusCounts.pending).toBe(1);
    }, { timeout: 10000 });

    expect(result.current.statusCounts.syncing).toBe(1);
    expect(result.current.statusCounts.failed).toBe(1);

    unmount();
  });

  it('should refresh data when refresh is called', async () => {
    const { result, unmount } = renderHook(() => usePendingSyncItems());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    expect(result.current.totalCount).toBe(0);

    // Add item after initial load
    await db.offline_sync_queue.add({
      entity: 'orders' as TSyncEntity,
      action: 'create',
      entityId: 'refresh-order-1',
      payload: {},
      created_at: new Date().toISOString(),
      status: 'pending',
      retries: 0,
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.totalCount).toBe(1);
    }, { timeout: 10000 });

    unmount();
  });

  it('should retry failed item successfully', async () => {
    const id = await db.offline_sync_queue.add({
      entity: 'orders' as TSyncEntity,
      action: 'create',
      entityId: 'retry-order-1',
      payload: {},
      created_at: new Date().toISOString(),
      status: 'failed',
      retries: 3,
      lastError: 'Connection timeout',
    });

    const { result, unmount } = renderHook(() => usePendingSyncItems());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    // Retry the item
    await act(async () => {
      await result.current.retry(id);
    });

    // Verify item was reset
    const item = await db.offline_sync_queue.get(id);
    expect(item?.status).toBe('pending');
    expect(item?.retries).toBe(0);

    unmount();
  });

  it('should remove item when remove is called', async () => {
    const id = await db.offline_sync_queue.add({
      entity: 'orders' as TSyncEntity,
      action: 'create',
      entityId: 'remove-order-1',
      payload: {},
      created_at: new Date().toISOString(),
      status: 'failed',
      retries: 3,
    });

    const { result, unmount } = renderHook(() => usePendingSyncItems());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(result.current.totalCount).toBe(1);
    }, { timeout: 10000 });

    // Remove the item
    await act(async () => {
      await result.current.remove(id);
    });

    // Verify list is updated
    await waitFor(() => {
      expect(result.current.totalCount).toBe(0);
    }, { timeout: 10000 });

    // Verify item is removed from DB
    const item = await db.offline_sync_queue.get(id);
    expect(item).toBeUndefined();

    unmount();
  });
});
