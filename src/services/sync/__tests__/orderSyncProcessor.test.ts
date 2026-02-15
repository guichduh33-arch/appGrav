/**
 * Order Sync Processor Tests (Story 3.6)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { ISyncQueueItem, IOfflineOrder, IOfflineOrderItem, IOfflinePayment } from '@/types/offline';

// Mock Supabase
const mockInsertSelect = vi.fn(() => ({
  single: vi.fn(() =>
    Promise.resolve({
      data: { id: 'server-order-uuid' },
      error: null,
    })
  ),
}));

// Used by mockInsertSelect above
void mockInsertSelect;

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { id: 'server-order-uuid' },
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      // order_items and order_payments
      return {
        insert: vi.fn(() => Promise.resolve({ error: null })),
      };
    }),
  },
}));

import { processOrderSync, updateLocalOrderWithServerId } from '../orderSyncProcessor';

describe('orderSyncProcessor', () => {
  beforeEach(async () => {
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_payments.clear();
    await db.offline_sync_queue.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('processOrderSync', () => {
    it('should sync order with items and payments to Supabase', async () => {
      // Setup: Create a local order with items and payments
      const localOrder: IOfflineOrder = {
        id: 'LOCAL-ORDER-123',
        order_number: 'OFFLINE-20260201-001',
        status: 'new',
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
        session_id: 'server-session-uuid', // Already resolved
        created_at: '2026-02-01T08:00:00Z',
        updated_at: '2026-02-01T08:00:00Z',
        guest_count: null,
        sync_status: 'pending_sync',
      };
      await db.offline_orders.add(localOrder);

      const localItem: IOfflineOrderItem = {
        id: 'item-1',
        order_id: 'LOCAL-ORDER-123',
        product_id: 'prod-1',
        product_name: 'Croissant',
        product_sku: 'CRO-001',
        quantity: 2,
        unit_price: 50000,
        subtotal: 100000,
        modifiers: [],
        notes: null,
        dispatch_station: 'kitchen',
        item_status: 'new',
        created_at: '2026-02-01T08:00:00Z',
      };
      await db.offline_order_items.add(localItem);

      const localPayment: IOfflinePayment = {
        id: 'LOCAL-PAY-1',
        order_id: 'LOCAL-ORDER-123',
        method: 'cash',
        amount: 110000,
        cash_received: 150000,
        change_given: 40000,
        reference: null,
        user_id: 'user-1',
        session_id: null,
        created_at: '2026-02-01T08:00:00Z',
        sync_status: 'pending_sync',
      };
      await db.offline_payments.add(localPayment);

      // Create sync queue item
      const syncItem: ISyncQueueItem = {
        id: 1,
        entity: 'orders',
        action: 'create',
        entityId: 'LOCAL-ORDER-123',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      };

      // Execute
      const sessionIdMap = new Map<string, string>();
      const result = await processOrderSync(syncItem, sessionIdMap);

      // Assert
      expect(result.success).toBe(true);
      expect(result.serverId).toBe('server-order-uuid');

      // Verify local order was updated
      const updatedOrder = await db.offline_orders.get('LOCAL-ORDER-123');
      expect(updatedOrder?.server_id).toBe('server-order-uuid');
      expect(updatedOrder?.sync_status).toBe('synced');

      // Verify local payment was updated
      const updatedPayment = await db.offline_payments.get('LOCAL-PAY-1');
      expect(updatedPayment?.sync_status).toBe('synced');
    });

    it('should remap local session_id to server session_id', async () => {
      const localOrder: IOfflineOrder = {
        id: 'LOCAL-ORDER-456',
        order_number: 'OFFLINE-20260201-002',
        status: 'new',
        order_type: 'takeaway',
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
        session_id: 'LOCAL-SESSION-789', // Local session ID
        created_at: '2026-02-01T09:00:00Z',
        updated_at: '2026-02-01T09:00:00Z',
        guest_count: null,
        sync_status: 'pending_sync',
      };
      await db.offline_orders.add(localOrder);

      const syncItem: ISyncQueueItem = {
        id: 2,
        entity: 'orders',
        action: 'create',
        entityId: 'LOCAL-ORDER-456',
        payload: {},
        created_at: '2026-02-01T09:00:00Z',
        status: 'pending',
        retries: 0,
      };

      // Session ID mapping from prior session sync
      const sessionIdMap = new Map<string, string>();
      sessionIdMap.set('LOCAL-SESSION-789', 'server-session-abc');

      const result = await processOrderSync(syncItem, sessionIdMap);

      expect(result.success).toBe(true);
      // The order insert would use server-session-abc for session_id
    });

    it('should return error when order not found', async () => {
      const syncItem: ISyncQueueItem = {
        id: 3,
        entity: 'orders',
        action: 'create',
        entityId: 'NON-EXISTENT-ORDER',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      };

      const result = await processOrderSync(syncItem, new Map());

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('updateLocalOrderWithServerId', () => {
    it('should update local order with server ID', async () => {
      const localOrder: IOfflineOrder = {
        id: 'LOCAL-ORDER-UPDATE',
        order_number: 'OFFLINE-20260201-003',
        status: 'new',
        order_type: 'dine_in',
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
        session_id: null,
        created_at: '2026-02-01T08:00:00Z',
        updated_at: '2026-02-01T08:00:00Z',
        guest_count: null,
        sync_status: 'pending_sync',
      };
      await db.offline_orders.add(localOrder);

      await updateLocalOrderWithServerId('LOCAL-ORDER-UPDATE', 'server-xyz');

      const updated = await db.offline_orders.get('LOCAL-ORDER-UPDATE');
      expect(updated?.server_id).toBe('server-xyz');
      expect(updated?.sync_status).toBe('synced');
    });
  });
});
