/**
 * Payment Sync Processor Tests (Story 3.6)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { ISyncQueueItem, IOfflinePayment, IOfflineOrder } from '@/types/offline';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: 'server-payment-uuid' },
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}));

import { processPaymentSync, markPaymentSynced } from '../paymentSyncProcessor';

describe('paymentSyncProcessor', () => {
  beforeEach(async () => {
    await db.offline_payments.clear();
    await db.offline_orders.clear();
    await db.offline_sync_queue.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('processPaymentSync', () => {
    it('should sync standalone payment to Supabase', async () => {
      // Setup: Create a local payment with already-synced order
      const localPayment: IOfflinePayment = {
        id: 'LOCAL-PAY-STANDALONE',
        order_id: 'server-order-uuid', // Already has server ID
        method: 'cash',
        amount: 110000,
        cash_received: 150000,
        change_given: 40000,
        reference: null,
        user_id: 'user-1',
        session_id: null,
        created_at: '2026-02-01T10:00:00Z',
        sync_status: 'pending_sync',
      };
      await db.offline_payments.add(localPayment);

      // Create sync queue item
      const syncItem: ISyncQueueItem = {
        id: 1,
        entity: 'payments',
        action: 'create',
        entityId: 'LOCAL-PAY-STANDALONE',
        payload: {},
        created_at: '2026-02-01T10:00:00Z',
        status: 'pending',
        retries: 0,
      };

      // Execute
      const orderIdMap = new Map<string, string>();
      const result = await processPaymentSync(syncItem, orderIdMap);

      // Assert
      expect(result.success).toBe(true);
      expect(result.serverId).toBe('server-payment-uuid');

      // Verify local payment was updated
      const updatedPayment = await db.offline_payments.get('LOCAL-PAY-STANDALONE');
      expect(updatedPayment?.server_id).toBe('server-payment-uuid');
      expect(updatedPayment?.sync_status).toBe('synced');
    });

    it('should remap local order_id using orderIdMap', async () => {
      const localPayment: IOfflinePayment = {
        id: 'LOCAL-PAY-2',
        order_id: 'LOCAL-ORDER-999', // Local order ID
        method: 'card',
        amount: 75000,
        cash_received: null,
        change_given: null,
        reference: 'TXN-12345',
        user_id: 'user-1',
        session_id: null,
        created_at: '2026-02-01T11:00:00Z',
        sync_status: 'pending_sync',
      };
      await db.offline_payments.add(localPayment);

      const syncItem: ISyncQueueItem = {
        id: 2,
        entity: 'payments',
        action: 'create',
        entityId: 'LOCAL-PAY-2',
        payload: {},
        created_at: '2026-02-01T11:00:00Z',
        status: 'pending',
        retries: 0,
      };

      // Order ID mapping from prior order sync
      const orderIdMap = new Map<string, string>();
      orderIdMap.set('LOCAL-ORDER-999', 'server-order-xyz');

      const result = await processPaymentSync(syncItem, orderIdMap);

      expect(result.success).toBe(true);
      // The payment insert would use server-order-xyz for order_id
    });

    it('should lookup server_id from offline_orders if not in map', async () => {
      // Create an order that was already synced
      const syncedOrder: IOfflineOrder = {
        id: 'LOCAL-ORDER-SYNCED',
        order_number: 'OFFLINE-20260201-099',
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
        sync_status: 'synced',
        server_id: 'server-order-already-synced', // Already has server_id
      };
      await db.offline_orders.add(syncedOrder);

      const localPayment: IOfflinePayment = {
        id: 'LOCAL-PAY-3',
        order_id: 'LOCAL-ORDER-SYNCED', // Local order ID
        method: 'qris',
        amount: 110000,
        cash_received: null,
        change_given: null,
        reference: 'QRIS-ABC123',
        user_id: 'user-1',
        session_id: null,
        created_at: '2026-02-01T12:00:00Z',
        sync_status: 'pending_sync',
      };
      await db.offline_payments.add(localPayment);

      const syncItem: ISyncQueueItem = {
        id: 3,
        entity: 'payments',
        action: 'create',
        entityId: 'LOCAL-PAY-3',
        payload: {},
        created_at: '2026-02-01T12:00:00Z',
        status: 'pending',
        retries: 0,
      };

      // Empty map - should look up from offline_orders
      const orderIdMap = new Map<string, string>();
      const result = await processPaymentSync(syncItem, orderIdMap);

      expect(result.success).toBe(true);
    });

    it('should return error when order not yet synced', async () => {
      // Create an order that is NOT synced yet
      const unsyncedOrder: IOfflineOrder = {
        id: 'LOCAL-ORDER-UNSYNCED',
        order_number: 'OFFLINE-20260201-100',
        status: 'new',
        order_type: 'dine_in',
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
        session_id: null,
        created_at: '2026-02-01T08:00:00Z',
        updated_at: '2026-02-01T08:00:00Z',
        guest_count: null,
        sync_status: 'pending_sync', // NOT synced
        // No server_id
      };
      await db.offline_orders.add(unsyncedOrder);

      const localPayment: IOfflinePayment = {
        id: 'LOCAL-PAY-4',
        order_id: 'LOCAL-ORDER-UNSYNCED',
        method: 'cash',
        amount: 55000,
        cash_received: 60000,
        change_given: 5000,
        reference: null,
        user_id: 'user-1',
        session_id: null,
        created_at: '2026-02-01T13:00:00Z',
        sync_status: 'pending_sync',
      };
      await db.offline_payments.add(localPayment);

      const syncItem: ISyncQueueItem = {
        id: 4,
        entity: 'payments',
        action: 'create',
        entityId: 'LOCAL-PAY-4',
        payload: {},
        created_at: '2026-02-01T13:00:00Z',
        status: 'pending',
        retries: 0,
      };

      const orderIdMap = new Map<string, string>();
      const result = await processPaymentSync(syncItem, orderIdMap);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not yet synced');
    });

    it('should return error when payment not found', async () => {
      const syncItem: ISyncQueueItem = {
        id: 5,
        entity: 'payments',
        action: 'create',
        entityId: 'NON-EXISTENT-PAYMENT',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      };

      const result = await processPaymentSync(syncItem, new Map());

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should skip already synced payments', async () => {
      const alreadySyncedPayment: IOfflinePayment = {
        id: 'LOCAL-PAY-ALREADY-SYNCED',
        order_id: 'server-order-uuid',
        method: 'cash',
        amount: 100000,
        cash_received: 100000,
        change_given: 0,
        reference: null,
        user_id: 'user-1',
        session_id: null,
        created_at: '2026-02-01T08:00:00Z',
        sync_status: 'synced', // Already synced
        server_id: 'existing-server-payment-id',
      };
      await db.offline_payments.add(alreadySyncedPayment);

      const syncItem: ISyncQueueItem = {
        id: 6,
        entity: 'payments',
        action: 'create',
        entityId: 'LOCAL-PAY-ALREADY-SYNCED',
        payload: {},
        created_at: '2026-02-01T08:00:00Z',
        status: 'pending',
        retries: 0,
      };

      const result = await processPaymentSync(syncItem, new Map());

      expect(result.success).toBe(true);
      expect(result.serverId).toBe('existing-server-payment-id');
    });
  });

  describe('markPaymentSynced', () => {
    it('should update payment with server_id and sync_status', async () => {
      const localPayment: IOfflinePayment = {
        id: 'LOCAL-PAY-MARK',
        order_id: 'order-123',
        method: 'cash',
        amount: 50000,
        cash_received: 50000,
        change_given: 0,
        reference: null,
        user_id: 'user-1',
        session_id: null,
        created_at: '2026-02-01T08:00:00Z',
        sync_status: 'pending_sync',
      };
      await db.offline_payments.add(localPayment);

      await markPaymentSynced('LOCAL-PAY-MARK', 'server-pay-xyz');

      const updated = await db.offline_payments.get('LOCAL-PAY-MARK');
      expect(updated?.server_id).toBe('server-pay-xyz');
      expect(updated?.sync_status).toBe('synced');
    });
  });
});
