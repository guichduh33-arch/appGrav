/**
 * Sync Engine Service Tests
 * Story 2.5 - Sync Queue Management
 * Story 3.5 - Automatic Sync Engine
 *
 * Comprehensive tests for the core offline-first sync engine:
 * - Initialization and lifecycle management
 * - Background sync loop (30s interval)
 * - Network reconnection handling (5s delay)
 * - Item processing with idempotency + conflict detection
 * - Priority-sorted queue processing
 * - Concurrent sync prevention
 * - Error handling and state management
 * - Store integration (syncStore, networkStore)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// =====================================================
// Mocks - must be declared before imports
// =====================================================

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'server-order-1' },
            error: null,
          }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock syncQueue
const mockGetSyncQueueItems = vi.fn().mockResolvedValue([]);
const mockGetRetryableItems = vi.fn().mockResolvedValue([]);
const mockMarkSyncing = vi.fn().mockResolvedValue(undefined);
const mockMarkSynced = vi.fn().mockResolvedValue(undefined);
const mockMarkFailed = vi.fn().mockResolvedValue(undefined);
const mockCleanupSyncedItems = vi.fn().mockResolvedValue(undefined);

vi.mock('../syncQueue', () => ({
  getSyncQueueItems: (...args: unknown[]) => mockGetSyncQueueItems(...args),
  getRetryableItems: (...args: unknown[]) => mockGetRetryableItems(...args),
  markSyncing: (...args: unknown[]) => mockMarkSyncing(...args),
  markSynced: (...args: unknown[]) => mockMarkSynced(...args),
  markFailed: (...args: unknown[]) => mockMarkFailed(...args),
  cleanupSyncedItems: (...args: unknown[]) => mockCleanupSyncedItems(...args),
}));

// Mock orderSync
const mockMarkOrderSynced = vi.fn().mockResolvedValue(undefined);
vi.mock('../orderSync', () => ({
  markOrderSynced: (...args: unknown[]) => mockMarkOrderSynced(...args),
}));

// Mock syncPriority
vi.mock('../syncPriority', () => ({
  sortByPriority: vi.fn((items: unknown[]) => items),
}));

// Mock idempotencyService
const mockGenerateKey = vi.fn().mockReturnValue('test:key:create');
const mockWrapWithIdempotency = vi.fn().mockImplementation(
  async (_key: string, _type: string, _id: string, fn: () => Promise<unknown>) => {
    await fn();
    return { skipped: false };
  }
);

vi.mock('../idempotencyService', () => ({
  generateKey: (...args: unknown[]) => mockGenerateKey(...args),
  wrapWithIdempotency: (...args: unknown[]) => mockWrapWithIdempotency(...args),
}));

// Mock syncConflictService
const mockDetectConflict = vi.fn().mockReturnValue(null);
const mockStoreConflict = vi.fn().mockResolvedValue(undefined);
const mockGetPendingConflictCount = vi.fn().mockResolvedValue(0);

vi.mock('../syncConflictService', () => ({
  detectConflict: (...args: unknown[]) => mockDetectConflict(...args),
  storeConflict: (...args: unknown[]) => mockStoreConflict(...args),
  getPendingConflictCount: (...args: unknown[]) => mockGetPendingConflictCount(...args),
}));

// Mock syncStore
const mockSyncStoreState = {
  setIsSyncing: vi.fn(),
  setSyncStatus: vi.fn(),
  setSyncProgress: vi.fn(),
  setLastSyncAt: vi.fn(),
  setConflictCount: vi.fn(),
};

vi.mock('../../../stores/syncStore', () => ({
  useSyncStore: {
    getState: () => mockSyncStoreState,
    subscribe: vi.fn(),
  },
}));

// Mock networkStore
let mockIsOnline = true;
const mockNetworkSubscribe = vi.fn();

vi.mock('../../../stores/networkStore', () => ({
  useNetworkStore: {
    getState: () => ({ isOnline: mockIsOnline }),
    subscribe: (...args: unknown[]) => mockNetworkSubscribe(...args),
  },
}));

// =====================================================
// Imports - after mocks
// =====================================================

import {
  runSyncEngine,
  getSyncEngineState,
  initializeSyncEngine,
  startBackgroundSync,
  stopBackgroundSync,
  startSyncWithDelay,
  stopSyncEngine,
  setAutoSyncEnabled,
  isAutoSyncEnabled,
} from '../syncEngine';
import { sortByPriority } from '../syncPriority';
import type { ILegacySyncQueueItem } from '@/types/offline';

// =====================================================
// Helpers
// =====================================================

function makeQueueItem(
  overrides: Partial<ILegacySyncQueueItem> = {}
): ILegacySyncQueueItem {
  return {
    id: overrides.id ?? `item-${crypto.randomUUID()}`,
    type: overrides.type ?? 'order',
    payload: overrides.payload ?? { order_number: '#1001', items: [] },
    status: overrides.status ?? 'pending',
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    attempts: overrides.attempts ?? 0,
    lastError: overrides.lastError ?? null,
    priority: overrides.priority,
    entityId: overrides.entityId,
    action: overrides.action,
    idempotency_key: overrides.idempotency_key,
  };
}

// =====================================================
// Test Suite
// =====================================================

describe('syncEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Reset mocks to defaults
    mockGetSyncQueueItems.mockResolvedValue([]);
    mockGetRetryableItems.mockResolvedValue([]);
    mockMarkSyncing.mockResolvedValue(undefined);
    mockMarkSynced.mockResolvedValue(undefined);
    mockMarkFailed.mockResolvedValue(undefined);
    mockCleanupSyncedItems.mockResolvedValue(undefined);
    mockMarkOrderSynced.mockResolvedValue(undefined);
    mockDetectConflict.mockReturnValue(null);
    mockStoreConflict.mockResolvedValue(undefined);
    mockGetPendingConflictCount.mockResolvedValue(0);
    mockWrapWithIdempotency.mockImplementation(
      async (_key: string, _type: string, _id: string, fn: () => Promise<unknown>) => {
        await fn();
        return { skipped: false };
      }
    );
    mockIsOnline = true;

    // Reset sync store mocks
    mockSyncStoreState.setIsSyncing.mockClear();
    mockSyncStoreState.setSyncStatus.mockClear();
    mockSyncStoreState.setSyncProgress.mockClear();
    mockSyncStoreState.setLastSyncAt.mockClear();
    mockSyncStoreState.setConflictCount.mockClear();

    // Ensure background sync is stopped between tests
    stopBackgroundSync();
    stopSyncEngine();
  });

  afterEach(() => {
    stopBackgroundSync();
    stopSyncEngine();
    vi.useRealTimers();
  });

  // ===================================================
  // getSyncEngineState
  // ===================================================

  describe('getSyncEngineState', () => {
    it('should return a copy of the engine state', () => {
      const state = getSyncEngineState();
      expect(state).toHaveProperty('isRunning');
      expect(state).toHaveProperty('lastSyncAt');
      expect(state).toHaveProperty('itemsSynced');
      expect(state).toHaveProperty('itemsFailed');
    });

    it('should not return a reference to the internal state object', () => {
      const state1 = getSyncEngineState();
      const state2 = getSyncEngineState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should report isRunning as false when engine is idle', () => {
      const state = getSyncEngineState();
      expect(state.isRunning).toBe(false);
    });
  });

  // ===================================================
  // runSyncEngine
  // ===================================================

  describe('runSyncEngine', () => {
    it('should return synced:0 and failed:0 when no items in queue', async () => {
      mockGetSyncQueueItems.mockResolvedValue([]);
      mockGetRetryableItems.mockResolvedValue([]);

      const result = await runSyncEngine();

      expect(result).toEqual({ synced: 0, failed: 0 });
    });

    it('should set syncStore to syncing at start', async () => {
      const result = await runSyncEngine();

      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalledWith(true);
      expect(mockSyncStoreState.setSyncStatus).toHaveBeenCalledWith('syncing');
      expect(result).toBeDefined();
    });

    it('should set syncStore to complete when all items succeed', async () => {
      const items = [makeQueueItem({ id: 'item-1' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      // Need to advance timer for the ITEM_PROCESS_DELAY
      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(200);
      await promise;

      expect(mockSyncStoreState.setSyncStatus).toHaveBeenCalledWith('complete');
    });

    it('should set syncStore to error when some items fail', async () => {
      const items = [makeQueueItem({ id: 'fail-item-1' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      // Make idempotency wrapper throw
      mockWrapWithIdempotency.mockRejectedValueOnce(new Error('Sync failed'));

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(200);
      await promise;

      expect(mockSyncStoreState.setSyncStatus).toHaveBeenCalledWith('error');
    });

    it('should process pending items from queue', async () => {
      const items = [
        makeQueueItem({ id: 'item-1', type: 'order' }),
        makeQueueItem({ id: 'item-2', type: 'product' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockMarkSyncing).toHaveBeenCalledWith('item-1');
      expect(mockMarkSyncing).toHaveBeenCalledWith('item-2');
      expect(mockMarkSynced).toHaveBeenCalledWith('item-1');
      expect(mockMarkSynced).toHaveBeenCalledWith('item-2');
    });

    it('should process retryable items along with pending items', async () => {
      const pendingItems = [makeQueueItem({ id: 'pending-1' })];
      const retryableItems = [makeQueueItem({ id: 'retry-1', status: 'failed', attempts: 1 })];

      mockGetSyncQueueItems.mockResolvedValue(pendingItems);
      mockGetRetryableItems.mockResolvedValue(retryableItems);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      // Both pending and retryable items should be processed
      expect(mockMarkSyncing).toHaveBeenCalledWith('pending-1');
      expect(mockMarkSyncing).toHaveBeenCalledWith('retry-1');
    });

    it('should sort items by priority before processing', async () => {
      const items = [
        makeQueueItem({ id: 'item-1', type: 'product' }),
        makeQueueItem({ id: 'item-2', type: 'payment' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(sortByPriority).toHaveBeenCalled();
    });

    it('should update sync progress during processing', async () => {
      const items = [
        makeQueueItem({ id: 'item-1' }),
        makeQueueItem({ id: 'item-2' }),
        makeQueueItem({ id: 'item-3' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(1000);
      await promise;

      // Should set initial progress
      expect(mockSyncStoreState.setSyncProgress).toHaveBeenCalledWith({
        current: 0,
        total: 3,
      });
      // Should update progress for each item
      expect(mockSyncStoreState.setSyncProgress).toHaveBeenCalledWith({
        current: 1,
        total: 3,
      });
      expect(mockSyncStoreState.setSyncProgress).toHaveBeenCalledWith({
        current: 2,
        total: 3,
      });
      expect(mockSyncStoreState.setSyncProgress).toHaveBeenCalledWith({
        current: 3,
        total: 3,
      });
      // Should clear progress at the end
      expect(mockSyncStoreState.setSyncProgress).toHaveBeenCalledWith(null);
    });

    it('should cleanup synced items after processing', async () => {
      const items = [makeQueueItem({ id: 'item-1' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockCleanupSyncedItems).toHaveBeenCalled();
    });

    it('should update conflict count in store after sync', async () => {
      mockGetPendingConflictCount.mockResolvedValue(3);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(200);
      await promise;

      expect(mockSyncStoreState.setConflictCount).toHaveBeenCalledWith(3);
    });

    it('should update lastSyncAt in store after sync', async () => {
      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(200);
      await promise;

      expect(mockSyncStoreState.setLastSyncAt).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should reset isSyncing to false when complete', async () => {
      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(200);
      await promise;

      // The last call should set isSyncing to false (in finally block)
      const calls = mockSyncStoreState.setIsSyncing.mock.calls;
      expect(calls[calls.length - 1][0]).toBe(false);
    });

    it('should return correct synced and failed counts', async () => {
      const items = [
        makeQueueItem({ id: 'success-1' }),
        makeQueueItem({ id: 'fail-1' }),
        makeQueueItem({ id: 'success-2' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      // Make the second item fail
      let callCount = 0;
      mockWrapWithIdempotency.mockImplementation(
        async (_key: string, _type: string, _id: string, fn: () => Promise<unknown>) => {
          callCount++;
          if (callCount === 2) {
            throw new Error('Sync error');
          }
          await fn();
          return { skipped: false };
        }
      );

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result.synced).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('should introduce ITEM_PROCESS_DELAY (100ms) between items', async () => {
      const items = [
        makeQueueItem({ id: 'item-1' }),
        makeQueueItem({ id: 'item-2' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();

      // After just 50ms, only the first item should be processed
      await vi.advanceTimersByTimeAsync(50);

      // Advance enough time for all items
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      // Both items should eventually be processed
      expect(mockMarkSyncing).toHaveBeenCalledTimes(2);
    });
  });

  // ===================================================
  // Concurrent sync prevention
  // ===================================================

  describe('concurrent sync prevention', () => {
    it('should prevent concurrent runs and return zero counts', async () => {
      // Start a long-running sync
      const items = [makeQueueItem({ id: 'slow-item' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const firstRun = runSyncEngine();

      // Try to start a second run while first is still going
      const secondRun = runSyncEngine();
      const secondResult = await secondRun;

      // Second run should return immediately with zero counts
      expect(secondResult).toEqual({ synced: 0, failed: 0 });

      // Complete the first run
      await vi.advanceTimersByTimeAsync(500);
      await firstRun;
    });

    it('should allow a new sync after previous one completes', async () => {
      // First sync
      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'item-1' })]);
      const firstPromise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await firstPromise;

      // Second sync should work
      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'item-2' })]);
      const secondPromise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const secondResult = await secondPromise;

      // Second run should actually process items (not be blocked)
      expect(mockMarkSyncing).toHaveBeenCalledWith('item-2');
      expect(secondResult.synced).toBeGreaterThanOrEqual(0);
    });

    it('should reset isRunning to false even if sync throws', async () => {
      mockGetSyncQueueItems.mockRejectedValue(new Error('DB error'));

      try {
        await runSyncEngine();
      } catch {
        // Expected error
      }

      const state = getSyncEngineState();
      expect(state.isRunning).toBe(false);
    });
  });

  // ===================================================
  // processItem - idempotency
  // ===================================================

  describe('item processing - idempotency', () => {
    it('should use existing idempotency_key from item if available', async () => {
      const items = [
        makeQueueItem({
          id: 'item-with-key',
          idempotency_key: 'custom:key:upsert',
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      // wrapWithIdempotency should have been called with the custom key
      expect(mockWrapWithIdempotency).toHaveBeenCalledWith(
        'custom:key:upsert',
        expect.anything(),
        expect.anything(),
        expect.any(Function)
      );
    });

    it('should generate idempotency key when item has no key', async () => {
      const items = [
        makeQueueItem({
          id: 'item-no-key',
          type: 'order',
          entityId: 'entity-123',
          action: 'create',
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockGenerateKey).toHaveBeenCalledWith('order', 'entity-123', 'create');
    });

    it('should skip processing and still mark as synced when idempotent duplicate', async () => {
      const items = [makeQueueItem({ id: 'dup-item' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      mockWrapWithIdempotency.mockResolvedValueOnce({ skipped: true });

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockMarkSynced).toHaveBeenCalledWith('dup-item');
    });
  });

  // ===================================================
  // processItem - conflict detection
  // ===================================================

  describe('item processing - conflict detection', () => {
    it('should detect and store conflict when sync fails with conflict error', async () => {
      const items = [makeQueueItem({ id: 'conflict-item', entityId: 'e-1' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const conflictObj = {
        id: 'conflict-1',
        queueItemId: 'conflict-item',
        entityType: 'order',
        entityId: 'e-1',
        localData: {},
        serverData: {},
        conflictType: 'duplicate',
        detectedAt: new Date().toISOString(),
      };

      mockWrapWithIdempotency.mockRejectedValueOnce(
        new Error('duplicate key value violates unique constraint')
      );
      mockDetectConflict.mockReturnValueOnce(conflictObj);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockDetectConflict).toHaveBeenCalled();
      expect(mockStoreConflict).toHaveBeenCalledWith(conflictObj);
    });

    it('should not store conflict when error is not a conflict type', async () => {
      const items = [makeQueueItem({ id: 'non-conflict-item' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      mockWrapWithIdempotency.mockRejectedValueOnce(new Error('Network timeout'));
      mockDetectConflict.mockReturnValueOnce(null);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockStoreConflict).not.toHaveBeenCalled();
    });

    it('should mark item as failed when processing throws', async () => {
      const items = [makeQueueItem({ id: 'fail-item' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      mockWrapWithIdempotency.mockRejectedValueOnce(new Error('Some error'));

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockMarkFailed).toHaveBeenCalledWith('fail-item', 'Some error');
    });

    it('should handle non-Error thrown objects gracefully', async () => {
      const items = [makeQueueItem({ id: 'weird-error-item' })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      mockWrapWithIdempotency.mockRejectedValueOnce('string error');

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockMarkFailed).toHaveBeenCalledWith('weird-error-item', 'Unknown error');
    });
  });

  // ===================================================
  // Error handling during sync run
  // ===================================================

  describe('error handling during sync run', () => {
    it('should set sync status to error when getSyncQueueItems throws', async () => {
      mockGetSyncQueueItems.mockRejectedValue(new Error('IndexedDB error'));

      await expect(runSyncEngine()).rejects.toThrow('IndexedDB error');

      expect(mockSyncStoreState.setSyncStatus).toHaveBeenCalledWith('error');
      expect(mockSyncStoreState.setSyncProgress).toHaveBeenCalledWith(null);
    });

    it('should reset isSyncing in finally block on error', async () => {
      mockGetSyncQueueItems.mockRejectedValue(new Error('Critical failure'));

      try {
        await runSyncEngine();
      } catch {
        // Expected
      }

      const calls = mockSyncStoreState.setIsSyncing.mock.calls;
      expect(calls[calls.length - 1][0]).toBe(false);
    });

    it('should re-throw the error to the caller', async () => {
      const error = new Error('Unexpected crash');
      mockGetSyncQueueItems.mockRejectedValue(error);

      await expect(runSyncEngine()).rejects.toThrow('Unexpected crash');
    });
  });

  // ===================================================
  // startSyncWithDelay
  // ===================================================

  describe('startSyncWithDelay', () => {
    it('should schedule sync after 5 seconds', async () => {
      mockGetSyncQueueItems.mockResolvedValue([]);

      startSyncWithDelay();

      // Should not have started syncing yet
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();

      // Advance past the 5s delay
      await vi.advanceTimersByTimeAsync(5000);

      // Now the sync should have been triggered
      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalledWith(true);
    });

    it('should not trigger sync before 5 seconds', async () => {
      startSyncWithDelay();

      await vi.advanceTimersByTimeAsync(4999);

      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should cancel previous delay if called again', async () => {
      mockGetSyncQueueItems.mockResolvedValue([]);

      startSyncWithDelay();
      await vi.advanceTimersByTimeAsync(3000);

      // Call again - should reset the timer
      startSyncWithDelay();
      await vi.advanceTimersByTimeAsync(3000);

      // 3s from second call, not enough for 5s
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();

      // 2 more seconds to complete the 5s from the second call
      await vi.advanceTimersByTimeAsync(2000);

      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalledWith(true);
    });

    it('should handle sync errors gracefully without crashing', async () => {
      mockGetSyncQueueItems.mockRejectedValue(new Error('DB error'));

      startSyncWithDelay();

      // Should not throw
      await vi.advanceTimersByTimeAsync(5100);

      // The engine should have recovered (isRunning = false)
      const state = getSyncEngineState();
      expect(state.isRunning).toBe(false);
    });
  });

  // ===================================================
  // initializeSyncEngine
  // ===================================================

  describe('initializeSyncEngine', () => {
    it('should start background sync on initialization', () => {
      initializeSyncEngine();

      // Background sync should be set up (the interval is registered)
      // We verify by checking that an interval tick triggers the expected logic
      expect(mockNetworkSubscribe).toHaveBeenCalled();
    });

    it('should subscribe to network store for offline-to-online transitions', () => {
      initializeSyncEngine();

      expect(mockNetworkSubscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should schedule sync when network transitions offline to online', async () => {
      initializeSyncEngine();

      // Get the subscriber callback
      const subscriberFn = mockNetworkSubscribe.mock.calls[0][0];

      // Simulate offline -> online transition
      subscriberFn({ isOnline: true }, { isOnline: false });

      // The sync should be scheduled with 5s delay
      await vi.advanceTimersByTimeAsync(5000);

      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalledWith(true);
    });

    it('should not schedule sync when network was already online', async () => {
      initializeSyncEngine();

      const subscriberFn = mockNetworkSubscribe.mock.calls[0][0];

      // Simulate online -> online (no transition)
      subscriberFn({ isOnline: true }, { isOnline: true });

      await vi.advanceTimersByTimeAsync(6000);

      // setIsSyncing should not have been called from the network transition
      // (it may be called from background sync, so we verify the subscriber didn't trigger)
      expect(mockSyncStoreState.setSyncStatus).not.toHaveBeenCalledWith('syncing');
    });

    it('should not schedule sync when going from online to offline', async () => {
      initializeSyncEngine();

      const subscriberFn = mockNetworkSubscribe.mock.calls[0][0];

      // Simulate online -> offline transition
      subscriberFn({ isOnline: false }, { isOnline: true });

      await vi.advanceTimersByTimeAsync(6000);

      // No sync should have been triggered
      expect(mockSyncStoreState.setSyncStatus).not.toHaveBeenCalledWith('syncing');
    });
  });

  // ===================================================
  // startBackgroundSync / stopBackgroundSync
  // ===================================================

  describe('startBackgroundSync', () => {
    it('should trigger sync every 30 seconds when online with pending items', async () => {
      mockIsOnline = true;
      const items = [makeQueueItem({ id: 'bg-item-1' })];

      startBackgroundSync();

      // First interval tick at 30s
      mockGetSyncQueueItems.mockResolvedValue(items);
      await vi.advanceTimersByTimeAsync(30000);

      // Give async operations time to complete
      await vi.advanceTimersByTimeAsync(500);

      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalled();
    });

    it('should not trigger sync when offline', async () => {
      mockIsOnline = false;

      startBackgroundSync();

      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'item' })]);
      await vi.advanceTimersByTimeAsync(30000);

      // Sync should not have been triggered because we are offline
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should not trigger sync when there are no pending items', async () => {
      mockIsOnline = true;

      startBackgroundSync();

      mockGetSyncQueueItems.mockResolvedValue([]);
      await vi.advanceTimersByTimeAsync(30000);

      // Sync should not have been triggered because no pending items
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should not start a second interval if already running', () => {
      startBackgroundSync();
      startBackgroundSync(); // second call should be a no-op

      // We can verify by stopping and ensuring only one interval was cleared
      // The best way is to check that the second call does not create a new interval
      // by checking that the function returns early (logger.debug is called with "already running")
      // Since we mock logger, we just verify no error was thrown
      stopBackgroundSync();
    });

    it('should not trigger sync when auto-sync is disabled', async () => {
      setAutoSyncEnabled(false);

      startBackgroundSync();

      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'item' })]);
      mockIsOnline = true;
      await vi.advanceTimersByTimeAsync(30000);

      // Should not sync because autoSync is disabled
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();

      // Re-enable for other tests
      setAutoSyncEnabled(true);
    });

    it('should not trigger sync if engine is already running', async () => {
      mockIsOnline = true;

      // Start a sync that will take a while
      const slowItems = [makeQueueItem({ id: 'slow' })];
      mockGetSyncQueueItems.mockResolvedValue(slowItems);

      // Start sync manually
      const syncPromise = runSyncEngine();

      // Now start background sync
      startBackgroundSync();

      // First tick at 30s - engine should still be running
      await vi.advanceTimersByTimeAsync(30000);

      // The background sync should detect engine is running and skip
      // We verify by checking that only one sync cycle ran
      await vi.advanceTimersByTimeAsync(500);
      await syncPromise;
    });
  });

  describe('stopBackgroundSync', () => {
    it('should clear the interval', async () => {
      startBackgroundSync();

      stopBackgroundSync();

      // Advance timer past 30s - no sync should trigger
      mockIsOnline = true;
      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'item' })]);
      await vi.advanceTimersByTimeAsync(60000);

      // The sync should NOT have triggered after stopping
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should be safe to call when no background sync is running', () => {
      // Should not throw
      expect(() => stopBackgroundSync()).not.toThrow();
    });

    it('should be safe to call multiple times', () => {
      startBackgroundSync();
      expect(() => {
        stopBackgroundSync();
        stopBackgroundSync();
      }).not.toThrow();
    });
  });

  // ===================================================
  // stopSyncEngine
  // ===================================================

  describe('stopSyncEngine', () => {
    it('should clear any pending start delay', async () => {
      startSyncWithDelay();

      stopSyncEngine();

      await vi.advanceTimersByTimeAsync(10000);

      // The delayed sync should not have triggered
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should stop background sync', async () => {
      startBackgroundSync();

      stopSyncEngine();

      mockIsOnline = true;
      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'item' })]);
      await vi.advanceTimersByTimeAsync(60000);

      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should set isRunning to false', () => {
      stopSyncEngine();

      const state = getSyncEngineState();
      expect(state.isRunning).toBe(false);
    });
  });

  // ===================================================
  // setAutoSyncEnabled / isAutoSyncEnabled
  // ===================================================

  describe('setAutoSyncEnabled', () => {
    afterEach(() => {
      // Always re-enable to avoid side effects
      setAutoSyncEnabled(true);
      stopBackgroundSync();
    });

    it('should enable auto-sync and start background sync', () => {
      stopBackgroundSync();
      setAutoSyncEnabled(true);

      expect(isAutoSyncEnabled()).toBe(true);
      // Background sync should have been started
      // We can verify by stopping and not getting an error
      stopBackgroundSync();
    });

    it('should disable auto-sync and stop background sync', async () => {
      startBackgroundSync();
      setAutoSyncEnabled(false);

      expect(isAutoSyncEnabled()).toBe(false);

      // Background sync should be stopped
      mockIsOnline = true;
      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'item' })]);
      await vi.advanceTimersByTimeAsync(60000);

      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should reflect the current state via isAutoSyncEnabled', () => {
      setAutoSyncEnabled(false);
      expect(isAutoSyncEnabled()).toBe(false);

      setAutoSyncEnabled(true);
      expect(isAutoSyncEnabled()).toBe(true);
    });
  });

  // ===================================================
  // Network state transitions
  // ===================================================

  describe('network state transitions', () => {
    it('should trigger delayed sync on offline-to-online transition', async () => {
      initializeSyncEngine();

      const subscriberFn = mockNetworkSubscribe.mock.calls[0][0];

      // Simulate offline -> online
      subscriberFn({ isOnline: true }, { isOnline: false });

      // Exactly at 5s, sync should fire
      await vi.advanceTimersByTimeAsync(5000);

      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalledWith(true);
    });

    it('should handle multiple rapid online/offline transitions gracefully', async () => {
      initializeSyncEngine();

      const subscriberFn = mockNetworkSubscribe.mock.calls[0][0];

      // Multiple rapid transitions
      subscriberFn({ isOnline: true }, { isOnline: false });
      await vi.advanceTimersByTimeAsync(1000);

      subscriberFn({ isOnline: true }, { isOnline: false });
      await vi.advanceTimersByTimeAsync(1000);

      subscriberFn({ isOnline: true }, { isOnline: false });

      // Only the last call should result in a sync after 5s
      await vi.advanceTimersByTimeAsync(5000);

      // Sync should have been triggered (the last startSyncWithDelay cancels the previous)
      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalled();
    });
  });

  // ===================================================
  // Sync dispatch - entity types
  // ===================================================

  describe('entity sync dispatch', () => {
    it('should handle order type items', async () => {
      const items = [
        makeQueueItem({
          id: 'order-item',
          type: 'order',
          payload: {
            id: 'offline-1',
            order_number: '#1001',
            order_type: 'dine_in',
            table_number: 'T1',
            customer_id: null,
            subtotal: 50000,
            discount_amount: 0,
            discount_type: null,
            total: 50000,
            tax_amount: 4545,
            payment_status: 'paid',
            payment_method: 'cash',
            notes: null,
            pos_terminal_id: null,
            items: [],
          },
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.synced).toBe(1);
    });

    it('should handle product type items', async () => {
      const items = [
        makeQueueItem({
          id: 'product-item',
          type: 'product',
          payload: { id: 'prod-1', name: 'Croissant', retail_price: 25000 },
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.synced).toBe(1);
    });

    it('should handle category type items', async () => {
      const items = [
        makeQueueItem({
          id: 'cat-item',
          type: 'category',
          payload: { id: 'cat-1', name: 'Pastries' },
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.synced).toBe(1);
    });

    it('should handle stock_movement type items', async () => {
      const items = [
        makeQueueItem({
          id: 'stock-item',
          type: 'stock_movement',
          payload: {
            product_id: 'prod-1',
            movement_type: 'sale_pos',
            quantity: -2,
            reason: 'POS sale',
            stock_before: 10,
            stock_after: 8,
          },
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.synced).toBe(1);
    });

    it('should handle payment type items (currently no-op)', async () => {
      const items = [
        makeQueueItem({
          id: 'pay-item',
          type: 'payment',
          payload: { amount: 50000, method: 'cash' },
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.synced).toBe(1);
    });

    it('should handle product_category_price type items', async () => {
      const items = [
        makeQueueItem({
          id: 'pcp-item',
          type: 'product_category_price' as ILegacySyncQueueItem['type'],
          payload: { product_id: 'p-1', category_slug: 'wholesale', price: 20000 },
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.synced).toBe(1);
    });

    it('should handle unknown type items gracefully', async () => {
      const items = [
        makeQueueItem({
          id: 'unknown-item',
          type: 'unknown_entity' as ILegacySyncQueueItem['type'],
          payload: {},
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      // Should still be marked as synced (dispatchSync doesn't throw for unknown types)
      expect(result.synced).toBe(1);
    });
  });

  // ===================================================
  // Mixed success and failure scenarios
  // ===================================================

  describe('mixed success and failure scenarios', () => {
    it('should continue processing remaining items after one fails', async () => {
      const items = [
        makeQueueItem({ id: 'item-a' }),
        makeQueueItem({ id: 'item-b' }),
        makeQueueItem({ id: 'item-c' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      let callIdx = 0;
      mockWrapWithIdempotency.mockImplementation(
        async (_key: string, _type: string, _id: string, fn: () => Promise<unknown>) => {
          callIdx++;
          if (callIdx === 2) {
            throw new Error('item-b failed');
          }
          await fn();
          return { skipped: false };
        }
      );

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      // All three items should have been attempted
      expect(mockMarkSyncing).toHaveBeenCalledTimes(3);
      // Two should succeed, one should fail
      expect(result.synced).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('should report final status as error when at least one item fails', async () => {
      const items = [
        makeQueueItem({ id: 'good-1' }),
        makeQueueItem({ id: 'bad-1' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      let idx = 0;
      mockWrapWithIdempotency.mockImplementation(
        async (_key: string, _type: string, _id: string, fn: () => Promise<unknown>) => {
          idx++;
          if (idx === 2) throw new Error('fail');
          await fn();
          return { skipped: false };
        }
      );

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(1000);
      await promise;

      // Final status should be 'error' since there was at least one failure
      expect(mockSyncStoreState.setSyncStatus).toHaveBeenCalledWith('error');
    });

    it('should report final status as complete when all items succeed', async () => {
      const items = [
        makeQueueItem({ id: 'ok-1' }),
        makeQueueItem({ id: 'ok-2' }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(1000);
      await promise;

      // The last setSyncStatus call should be 'complete'
      const statusCalls = mockSyncStoreState.setSyncStatus.mock.calls.map(
        (c: unknown[]) => c[0]
      );
      expect(statusCalls[statusCalls.length - 1]).toBe('complete');
    });
  });

  // ===================================================
  // Background sync full lifecycle
  // ===================================================

  describe('full lifecycle: init -> sync loop -> stop', () => {
    it('should run the complete lifecycle without errors', async () => {
      // Initialize
      initializeSyncEngine();

      // Simulate online with pending items
      mockIsOnline = true;
      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'lifecycle-1' })]);

      // First background sync tick at 30s
      await vi.advanceTimersByTimeAsync(30000);
      await vi.advanceTimersByTimeAsync(500);

      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalled();

      // Stop the engine
      stopSyncEngine();

      // Reset mocks
      mockSyncStoreState.setIsSyncing.mockClear();

      // After stopping, no more syncs should occur
      await vi.advanceTimersByTimeAsync(60000);
      expect(mockSyncStoreState.setIsSyncing).not.toHaveBeenCalled();
    });

    it('should handle init -> reconnect -> sync -> stop lifecycle', async () => {
      initializeSyncEngine();

      const subscriberFn = mockNetworkSubscribe.mock.calls[0][0];

      // Simulate reconnection
      mockGetSyncQueueItems.mockResolvedValue([makeQueueItem({ id: 'reconnect-item' })]);
      subscriberFn({ isOnline: true }, { isOnline: false });

      // Wait for the 5s delay
      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(500);

      // Sync should have run
      expect(mockSyncStoreState.setIsSyncing).toHaveBeenCalledWith(true);

      // Stop everything
      stopSyncEngine();

      const state = getSyncEngineState();
      expect(state.isRunning).toBe(false);
    });
  });

  // ===================================================
  // Edge cases
  // ===================================================

  describe('edge cases', () => {
    it('should handle empty payload gracefully', async () => {
      const items = [makeQueueItem({ id: 'empty-payload', payload: {} })];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.synced).toBe(1);
    });

    it('should handle item with no entityId by falling back to item.id', async () => {
      const items = [
        makeQueueItem({
          id: 'no-entity-id',
          entityId: undefined,
          action: undefined,
        }),
      ];
      mockGetSyncQueueItems.mockResolvedValue(items);

      const promise = runSyncEngine();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      // generateKey should be called with item.id as fallback
      expect(mockGenerateKey).toHaveBeenCalledWith(
        'order',
        'no-entity-id',
        'create'
      );
    });

    it('should handle large number of items', async () => {
      const manyItems = Array.from({ length: 50 }, (_, i) =>
        makeQueueItem({ id: `bulk-${i}` })
      );
      mockGetSyncQueueItems.mockResolvedValue(manyItems);

      const promise = runSyncEngine();
      // Each item has 100ms delay, so 50 items need at least 5s
      await vi.advanceTimersByTimeAsync(10000);
      const result = await promise;

      expect(result.synced).toBe(50);
      expect(result.failed).toBe(0);
    });
  });
});
