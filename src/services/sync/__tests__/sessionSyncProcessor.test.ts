/**
 * Session Sync Processor Tests (Story 3.6)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { ISyncQueueItem, IOfflineSession } from '@/types/offline';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: 'server-session-uuid' },
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}));

import {
  processSessionSync,
  updateOrdersWithSessionServerId,
} from '../sessionSyncProcessor';

describe('sessionSyncProcessor', () => {
  beforeEach(async () => {
    // Clear all relevant tables
    await db.offline_sessions.clear();
    await db.offline_orders.clear();
    await db.offline_sync_queue.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('processSessionSync', () => {
    it('should sync session to Supabase and update local record', async () => {
      // Setup: Create a local session
      const localSession: IOfflineSession = {
        id: 'LOCAL-SESSION-123',
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

      // Create sync queue item
      const syncItem: ISyncQueueItem = {
        id: 1,
        entity: 'pos_sessions',
        action: 'create',
        entityId: 'LOCAL-SESSION-123',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      };

      // Execute
      const result = await processSessionSync(syncItem);

      // Assert
      expect(result.success).toBe(true);
      expect(result.serverId).toBe('server-session-uuid');

      // Verify local session was updated
      const updatedSession = await db.offline_sessions.get('LOCAL-SESSION-123');
      expect(updatedSession?.server_id).toBe('server-session-uuid');
      expect(updatedSession?.sync_status).toBe('synced');
    });

    it('should return error when session not found', async () => {
      const syncItem: ISyncQueueItem = {
        id: 1,
        entity: 'pos_sessions',
        action: 'create',
        entityId: 'NON-EXISTENT-SESSION',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      };

      const result = await processSessionSync(syncItem);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('updateOrdersWithSessionServerId', () => {
    it('should update orders with local session_id to use server session_id', async () => {
      // Setup: Create orders with local session_id
      const order1 = {
        id: 'LOCAL-ORDER-1',
        order_number: 'OFFLINE-20260201-001',
        status: 'pending' as const,
        order_type: 'dine_in' as const,
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
        session_id: 'LOCAL-SESSION-123',
        created_at: '2026-02-01T08:00:00Z',
        updated_at: '2026-02-01T08:00:00Z',
        sync_status: 'pending_sync' as const,
      };

      const order2 = {
        id: 'LOCAL-ORDER-2',
        order_number: 'OFFLINE-20260201-002',
        status: 'pending' as const,
        order_type: 'takeaway' as const,
        subtotal: 50000,
        tax_amount: 5000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 55000,
        customer_id: null,
        table_number: null,
        notes: null,
        user_id: 'user-1',
        session_id: 'LOCAL-SESSION-123',
        created_at: '2026-02-01T08:30:00Z',
        updated_at: '2026-02-01T08:30:00Z',
        sync_status: 'pending_sync' as const,
      };

      await db.offline_orders.bulkAdd([order1, order2]);

      // Execute
      await updateOrdersWithSessionServerId(
        'LOCAL-SESSION-123',
        'server-session-uuid'
      );

      // Assert
      const updatedOrder1 = await db.offline_orders.get('LOCAL-ORDER-1');
      const updatedOrder2 = await db.offline_orders.get('LOCAL-ORDER-2');

      expect(updatedOrder1?.session_id).toBe('server-session-uuid');
      expect(updatedOrder2?.session_id).toBe('server-session-uuid');
    });

    it('should not affect orders with different session_id', async () => {
      const order = {
        id: 'LOCAL-ORDER-3',
        order_number: 'OFFLINE-20260201-003',
        status: 'pending' as const,
        order_type: 'dine_in' as const,
        subtotal: 100000,
        tax_amount: 10000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 110000,
        customer_id: null,
        table_number: null,
        notes: null,
        user_id: 'user-1',
        session_id: 'LOCAL-SESSION-OTHER',
        created_at: '2026-02-01T08:00:00Z',
        updated_at: '2026-02-01T08:00:00Z',
        sync_status: 'pending_sync' as const,
      };

      await db.offline_orders.add(order);

      // Execute
      await updateOrdersWithSessionServerId(
        'LOCAL-SESSION-123',
        'server-session-uuid'
      );

      // Assert - session_id should remain unchanged
      const updatedOrder = await db.offline_orders.get('LOCAL-ORDER-3');
      expect(updatedOrder?.session_id).toBe('LOCAL-SESSION-OTHER');
    });
  });
});
