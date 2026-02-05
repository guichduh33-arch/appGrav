/**
 * Sync Engine V2 Tests (Story 3.6)
 *
 * Integration tests for the sync engine that processes queue items
 * in dependency order: Sessions → Orders → Payments.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { IOfflineSession, IOfflineOrder } from '@/types/offline';

// Mock Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    })),
  },
}));

// Mock Zustand stores
vi.mock('@/stores/syncStore', () => ({
  useSyncStore: {
    getState: vi.fn(() => ({
      setIsSyncing: vi.fn(),
      setSyncStatus: vi.fn(),
      setLastSyncAt: vi.fn(),
    })),
  },
}));

vi.mock('@/stores/networkStore', () => ({
  useNetworkStore: {
    getState: vi.fn(() => ({
      isOnline: true,
    })),
    subscribe: vi.fn(),
  },
}));

import {
  runSyncEngine,
  getSyncEngineState,
  initializeSyncEngine,
  stopBackgroundSync,
  setAutoSyncEnabled,
  isAutoSyncEnabled,
} from '../syncEngineV2';

describe('syncEngineV2', () => {
  beforeEach(async () => {
    // Clear all tables
    await db.offline_sessions.clear();
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_payments.clear();
    await db.offline_sync_queue.clear();

    // Reset mocks
    vi.clearAllMocks();

    // Stop background sync to prevent interference
    stopBackgroundSync();
  });

  afterEach(() => {
    stopBackgroundSync();
    vi.clearAllMocks();
  });

  describe('runSyncEngine', () => {
    it('should return early when no items to sync', async () => {
      const result = await runSyncEngine();

      expect(result.synced).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should sync session items first (dependency order)', async () => {
      // Setup: Create a local session
      const localSession: IOfflineSession = {
        id: 'LOCAL-SESSION-100',
        user_id: 'user-1',
        status: 'open',
        opening_amount: 500000,
        expected_totals: null,
        actual_totals: null,
        cash_variance: null,
        notes: null,
        opened_at: '2026-02-01T08:00:00Z',
        closed_at: null,
        sync_status: 'pending_sync',
      };
      await db.offline_sessions.add(localSession);

      // Add session to sync queue
      await db.offline_sync_queue.add({
        entity: 'pos_sessions',
        action: 'create',
        entityId: 'LOCAL-SESSION-100',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      });

      // Mock successful session sync
      mockSingle.mockResolvedValueOnce({
        data: { id: 'server-session-uuid-100' },
        error: null,
      });

      // Execute
      const result = await runSyncEngine();

      // Assert
      expect(result.synced).toBe(1);
      expect(result.failed).toBe(0);

      // Verify local session was updated
      const updatedSession = await db.offline_sessions.get('LOCAL-SESSION-100');
      expect(updatedSession?.server_id).toBe('server-session-uuid-100');
      expect(updatedSession?.sync_status).toBe('synced');
    });

    it('should sync orders after sessions (FK dependency)', async () => {
      // Setup: Create session and order
      const localSession: IOfflineSession = {
        id: 'LOCAL-SESSION-200',
        user_id: 'user-1',
        status: 'open',
        opening_amount: 500000,
        expected_totals: null,
        actual_totals: null,
        cash_variance: null,
        notes: null,
        opened_at: '2026-02-01T08:00:00Z',
        closed_at: null,
        sync_status: 'pending_sync',
      };
      await db.offline_sessions.add(localSession);

      const localOrder: IOfflineOrder = {
        id: 'LOCAL-ORDER-200',
        order_number: 'OFFLINE-20260201-200',
        status: 'completed',
        order_type: 'dine_in',
        subtotal: 100000,
        tax_amount: 10000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 110000,
        customer_id: null,
        table_number: 'T1',
        notes: null,
        user_id: 'user-1',
        session_id: 'LOCAL-SESSION-200',
        created_at: '2026-02-01T09:00:00Z',
        updated_at: '2026-02-01T09:00:00Z',
        sync_status: 'pending_sync',
      };
      await db.offline_orders.add(localOrder);

      // Add both to sync queue (order first to verify sorting)
      await db.offline_sync_queue.add({
        entity: 'orders',
        action: 'create',
        entityId: 'LOCAL-ORDER-200',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      });

      await db.offline_sync_queue.add({
        entity: 'pos_sessions',
        action: 'create',
        entityId: 'LOCAL-SESSION-200',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      });

      // Mock successful syncs (session first, then order)
      mockSingle
        .mockResolvedValueOnce({
          data: { id: 'server-session-uuid-200' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'server-order-uuid-200' },
          error: null,
        });

      // Execute
      const result = await runSyncEngine();

      // Assert - both should sync
      expect(result.synced).toBe(2);
      expect(result.failed).toBe(0);

      // Verify order session_id was remapped
      const updatedOrder = await db.offline_orders.get('LOCAL-ORDER-200');
      expect(updatedOrder?.server_id).toBe('server-order-uuid-200');
      expect(updatedOrder?.sync_status).toBe('synced');
    });

    it('should handle sync failures gracefully', async () => {
      // Setup: Create a local session
      const localSession: IOfflineSession = {
        id: 'LOCAL-SESSION-300',
        user_id: 'user-1',
        status: 'open',
        opening_amount: 500000,
        expected_totals: null,
        actual_totals: null,
        cash_variance: null,
        notes: null,
        opened_at: '2026-02-01T08:00:00Z',
        closed_at: null,
        sync_status: 'pending_sync',
      };
      await db.offline_sessions.add(localSession);

      // Add session to sync queue
      await db.offline_sync_queue.add({
        entity: 'pos_sessions',
        action: 'create',
        entityId: 'LOCAL-SESSION-300',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      });

      // Mock failed sync
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      // Execute
      const result = await runSyncEngine();

      // Assert
      expect(result.synced).toBe(0);
      expect(result.failed).toBe(1);

      // Verify queue item marked as failed
      const queueItem = await db.offline_sync_queue.toArray();
      expect(queueItem[0]?.status).toBe('failed');
      expect(queueItem[0]?.retries).toBe(1);
      expect(queueItem[0]?.lastError).toBe('Database error');
    });
  });

  describe('getSyncEngineState', () => {
    it('should return current engine state', () => {
      const state = getSyncEngineState();

      expect(state).toHaveProperty('isRunning');
      expect(state).toHaveProperty('lastSyncAt');
      expect(state).toHaveProperty('itemsSynced');
      expect(state).toHaveProperty('itemsFailed');
    });
  });

  describe('setAutoSyncEnabled', () => {
    it('should enable/disable auto-sync', () => {
      setAutoSyncEnabled(false);
      expect(isAutoSyncEnabled()).toBe(false);

      setAutoSyncEnabled(true);
      expect(isAutoSyncEnabled()).toBe(true);
    });
  });

  describe('initializeSyncEngine', () => {
    it('should recover orphaned syncing items', async () => {
      // Setup: Create an orphaned syncing item
      await db.offline_sync_queue.add({
        entity: 'pos_sessions',
        action: 'create',
        entityId: 'LOCAL-SESSION-ORPHAN',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'syncing', // Stuck in syncing state
        retries: 0,
      });

      // Execute
      await initializeSyncEngine();

      // Assert - item should be recovered to pending
      const items = await db.offline_sync_queue.toArray();
      expect(items[0]?.status).toBe('pending');
    });
  });
});
