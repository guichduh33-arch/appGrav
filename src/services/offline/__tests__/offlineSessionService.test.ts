/**
 * Tests for Offline Session Service
 *
 * @see Story 3.5: POS Session Management Offline
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@/lib/db';
import {
  generateLocalSessionId,
  getActiveSession,
  hasActiveSession,
  openSession,
  closeSession,
  calculateSessionTotals,
  getSessionById,
  getSessionsByUserId,
} from '../offlineSessionService';
import { LOCAL_SESSION_ID_PREFIX } from '@/types/offline';
import type { IOfflineOrder, IOfflinePayment } from '@/types/offline';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234-5678-9abc-def012345678',
});

describe('offlineSessionService', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.offline_sessions.clear();
    await db.offline_sync_queue.clear();
    await db.offline_orders.clear();
    await db.offline_payments.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateLocalSessionId', () => {
    it('should generate ID with LOCAL-SESSION- prefix', () => {
      const id = generateLocalSessionId();
      expect(id).toMatch(new RegExp(`^${LOCAL_SESSION_ID_PREFIX}`));
    });

    it('should include UUID after prefix', () => {
      const id = generateLocalSessionId();
      expect(id).toBe(`${LOCAL_SESSION_ID_PREFIX}test-uuid-1234-5678-9abc-def012345678`);
    });
  });

  describe('openSession', () => {
    it('should create a new session with correct properties', async () => {
      const userId = 'user-123';
      const openingAmount = 500000;

      const session = await openSession(userId, openingAmount);

      expect(session.id).toMatch(new RegExp(`^${LOCAL_SESSION_ID_PREFIX}`));
      expect(session.user_id).toBe(userId);
      expect(session.status).toBe('open');
      expect(session.opening_amount).toBe(openingAmount);
      expect(session.sync_status).toBe('pending_sync');
      expect(session.opened_at).toBeDefined();
      expect(session.closed_at).toBeNull();
      expect(session.expected_totals).toBeNull();
      expect(session.actual_totals).toBeNull();
      expect(session.cash_variance).toBeNull();
      expect(session.notes).toBeNull();
    });

    it('should save session to IndexedDB', async () => {
      const userId = 'user-123';
      const session = await openSession(userId, 500000);

      const saved = await db.offline_sessions.get(session.id);
      expect(saved).toBeDefined();
      expect(saved?.user_id).toBe(userId);
    });

    it('should add entry to sync queue', async () => {
      const userId = 'user-123';
      const session = await openSession(userId, 500000);

      const syncItems = await db.offline_sync_queue.toArray();
      expect(syncItems.length).toBe(1);
      expect(syncItems[0].entity).toBe('pos_sessions');
      expect(syncItems[0].action).toBe('create');
      expect(syncItems[0].entityId).toBe(session.id);
      expect(syncItems[0].status).toBe('pending');
    });

    it('should throw error if session already active', async () => {
      const userId = 'user-123';
      await openSession(userId, 500000);

      await expect(openSession(userId, 500000)).rejects.toThrow(
        'Session already active'
      );
    });

    it('should allow different users to have sessions', async () => {
      const session1 = await openSession('user-1', 500000);

      // Reset UUID mock for second session
      vi.stubGlobal('crypto', {
        randomUUID: () => 'test-uuid-2222-3333-4444-555566667777',
      });

      const session2 = await openSession('user-2', 600000);

      expect(session1.id).not.toBe(session2.id);
      expect(session1.user_id).toBe('user-1');
      expect(session2.user_id).toBe('user-2');
    });
  });

  describe('hasActiveSession', () => {
    it('should return false when no session exists', async () => {
      const result = await hasActiveSession('user-123');
      expect(result).toBe(false);
    });

    it('should return true when active session exists', async () => {
      await openSession('user-123', 500000);
      const result = await hasActiveSession('user-123');
      expect(result).toBe(true);
    });

    it('should return false for different user', async () => {
      await openSession('user-123', 500000);
      const result = await hasActiveSession('user-456');
      expect(result).toBe(false);
    });
  });

  describe('getActiveSession', () => {
    it('should return null when no session exists', async () => {
      const result = await getActiveSession('user-123');
      expect(result).toBeNull();
    });

    it('should return active session', async () => {
      const created = await openSession('user-123', 500000);
      const result = await getActiveSession('user-123');
      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
    });

    it('should return null for different user', async () => {
      await openSession('user-123', 500000);
      const result = await getActiveSession('user-456');
      expect(result).toBeNull();
    });
  });

  describe('calculateSessionTotals', () => {
    it('should return zeros for session with no orders', async () => {
      const session = await openSession('user-123', 500000);
      const totals = await calculateSessionTotals(session.id);

      expect(totals.cash).toBe(0);
      expect(totals.card).toBe(0);
      expect(totals.qris).toBe(0);
      expect(totals.transfer).toBe(0);
      expect(totals.edc).toBe(0);
      expect(totals.total).toBe(0);
    });

    it('should aggregate payments by method', async () => {
      const session = await openSession('user-123', 500000);

      // Create test orders and payments
      const orderId1 = 'order-1';
      const orderId2 = 'order-2';

      const testOrder1: IOfflineOrder = {
        id: orderId1,
        order_number: 'OFFLINE-20260201-001',
        status: 'completed',
        order_type: 'dine_in',
        subtotal: 100000,
        tax_amount: 10000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 100000,
        customer_id: null,
        table_number: '1',
        notes: null,
        user_id: 'user-123',
        session_id: session.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      };

      const testOrder2: IOfflineOrder = {
        ...testOrder1,
        id: orderId2,
        order_number: 'OFFLINE-20260201-002',
        total: 50000,
      };

      await db.offline_orders.bulkAdd([testOrder1, testOrder2]);

      // Add payments
      const payments: IOfflinePayment[] = [
        {
          id: 'pay-1',
          order_id: orderId1,
          method: 'cash',
          amount: 50000,
          cash_received: 50000,
          change_given: 0,
          reference: null,
          user_id: 'user-123',
          session_id: session.id,
          created_at: new Date().toISOString(),
          sync_status: 'pending_sync',
        },
        {
          id: 'pay-2',
          order_id: orderId1,
          method: 'card',
          amount: 50000,
          cash_received: null,
          change_given: null,
          reference: 'REF-001',
          user_id: 'user-123',
          session_id: session.id,
          created_at: new Date().toISOString(),
          sync_status: 'pending_validation',
        },
        {
          id: 'pay-3',
          order_id: orderId2,
          method: 'qris',
          amount: 30000,
          cash_received: null,
          change_given: null,
          reference: 'QRIS-001',
          user_id: 'user-123',
          session_id: session.id,
          created_at: new Date().toISOString(),
          sync_status: 'pending_validation',
        },
        {
          id: 'pay-4',
          order_id: orderId2,
          method: 'edc',
          amount: 20000,
          cash_received: null,
          change_given: null,
          reference: 'EW-001',
          user_id: 'user-123',
          session_id: session.id,
          created_at: new Date().toISOString(),
          sync_status: 'pending_validation',
        },
      ];

      await db.offline_payments.bulkAdd(payments);

      const totals = await calculateSessionTotals(session.id);

      expect(totals.cash).toBe(50000);
      expect(totals.card).toBe(50000);
      expect(totals.qris).toBe(30000);
      expect(totals.edc).toBe(20000);
      expect(totals.transfer).toBe(0);
      expect(totals.total).toBe(150000);
    });

    it('should ignore orders from other sessions', async () => {
      const session1 = await openSession('user-123', 500000);

      // Create order for different session
      const testOrder: IOfflineOrder = {
        id: 'order-other',
        order_number: 'OFFLINE-20260201-001',
        status: 'completed',
        order_type: 'dine_in',
        subtotal: 100000,
        tax_amount: 10000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 100000,
        customer_id: null,
        table_number: '1',
        notes: null,
        user_id: 'user-123',
        session_id: 'different-session-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      };

      await db.offline_orders.add(testOrder);
      await db.offline_payments.add({
        id: 'pay-other',
        order_id: 'order-other',
        method: 'cash',
        amount: 100000,
        cash_received: 100000,
        change_given: 0,
        reference: null,
        user_id: 'user-123',
        session_id: 'different-session-id',
        created_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      });

      const totals = await calculateSessionTotals(session1.id);
      expect(totals.total).toBe(0);
    });
  });

  describe('closeSession', () => {
    it('should close session with correct properties', async () => {
      const session = await openSession('user-123', 500000);

      const closingData = {
        actual_cash: 550000,
        actual_card: 0,
        actual_qris: 0,
        actual_transfer: 0,
        actual_edc: 0,
        notes: 'End of shift',
      };

      const closed = await closeSession(session.id, closingData);

      expect(closed.status).toBe('closed');
      expect(closed.closed_at).toBeDefined();
      expect(closed.notes).toBe('End of shift');
      expect(closed.sync_status).toBe('pending_sync');
    });

    it('should calculate expected totals', async () => {
      const session = await openSession('user-123', 500000);

      // Add some orders and payments
      await db.offline_orders.add({
        id: 'order-1',
        order_number: 'OFFLINE-001',
        status: 'completed',
        order_type: 'dine_in',
        subtotal: 100000,
        tax_amount: 10000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 100000,
        customer_id: null,
        table_number: '1',
        notes: null,
        user_id: 'user-123',
        session_id: session.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      });

      await db.offline_payments.add({
        id: 'pay-1',
        order_id: 'order-1',
        method: 'cash',
        amount: 100000,
        cash_received: 100000,
        change_given: 0,
        reference: null,
        user_id: 'user-123',
        session_id: session.id,
        created_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      });

      const closingData = {
        actual_cash: 600000,
        actual_card: 0,
        actual_qris: 0,
        actual_transfer: 0,
        actual_edc: 0,
      };

      const closed = await closeSession(session.id, closingData);

      expect(closed.expected_totals).toBeDefined();
      expect(closed.expected_totals?.cash).toBe(100000);
      expect(closed.expected_totals?.total).toBe(100000);
    });

    it('should calculate cash variance correctly (surplus)', async () => {
      const session = await openSession('user-123', 500000);

      await db.offline_orders.add({
        id: 'order-1',
        order_number: 'OFFLINE-001',
        status: 'completed',
        order_type: 'dine_in',
        subtotal: 100000,
        tax_amount: 10000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 100000,
        customer_id: null,
        table_number: '1',
        notes: null,
        user_id: 'user-123',
        session_id: session.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      });

      await db.offline_payments.add({
        id: 'pay-1',
        order_id: 'order-1',
        method: 'cash',
        amount: 100000,
        cash_received: 100000,
        change_given: 0,
        reference: null,
        user_id: 'user-123',
        session_id: session.id,
        created_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      });

      // Expected cash = opening (500000) + cash payments (100000) = 600000
      // Actual cash = 620000
      // Variance = 620000 - 600000 = +20000 (surplus)
      const closed = await closeSession(session.id, {
        actual_cash: 620000,
        actual_card: 0,
        actual_qris: 0,
        actual_transfer: 0,
        actual_edc: 0,
      });

      expect(closed.cash_variance).toBe(20000);
    });

    it('should calculate cash variance correctly (shortage)', async () => {
      const session = await openSession('user-123', 500000);

      await db.offline_orders.add({
        id: 'order-1',
        order_number: 'OFFLINE-001',
        status: 'completed',
        order_type: 'dine_in',
        subtotal: 100000,
        tax_amount: 10000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        total: 100000,
        customer_id: null,
        table_number: '1',
        notes: null,
        user_id: 'user-123',
        session_id: session.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      });

      await db.offline_payments.add({
        id: 'pay-1',
        order_id: 'order-1',
        method: 'cash',
        amount: 100000,
        cash_received: 100000,
        change_given: 0,
        reference: null,
        user_id: 'user-123',
        session_id: session.id,
        created_at: new Date().toISOString(),
        sync_status: 'pending_sync',
      });

      // Expected cash = opening (500000) + cash payments (100000) = 600000
      // Actual cash = 580000
      // Variance = 580000 - 600000 = -20000 (shortage)
      const closed = await closeSession(session.id, {
        actual_cash: 580000,
        actual_card: 0,
        actual_qris: 0,
        actual_transfer: 0,
        actual_edc: 0,
      });

      expect(closed.cash_variance).toBe(-20000);
    });

    it('should add update entry to sync queue', async () => {
      const session = await openSession('user-123', 500000);

      await closeSession(session.id, {
        actual_cash: 500000,
        actual_card: 0,
        actual_qris: 0,
        actual_transfer: 0,
        actual_edc: 0,
      });

      const syncItems = await db.offline_sync_queue.toArray();
      // First entry is from openSession, second from closeSession
      expect(syncItems.length).toBe(2);
      expect(syncItems[1].action).toBe('update');
    });

    it('should throw error for non-existent session', async () => {
      await expect(
        closeSession('non-existent', {
          actual_cash: 0,
          actual_card: 0,
          actual_qris: 0,
          actual_transfer: 0,
          actual_edc: 0,
        })
      ).rejects.toThrow('Session not found');
    });

    it('should throw error for already closed session', async () => {
      const session = await openSession('user-123', 500000);

      await closeSession(session.id, {
        actual_cash: 500000,
        actual_card: 0,
        actual_qris: 0,
        actual_transfer: 0,
        actual_edc: 0,
      });

      await expect(
        closeSession(session.id, {
          actual_cash: 500000,
          actual_card: 0,
          actual_qris: 0,
          actual_transfer: 0,
          actual_edc: 0,
        })
      ).rejects.toThrow('Session is not open');
    });
  });

  describe('getSessionById', () => {
    it('should return null for non-existent session', async () => {
      const result = await getSessionById('non-existent');
      expect(result).toBeNull();
    });

    it('should return session by ID', async () => {
      const session = await openSession('user-123', 500000);
      const result = await getSessionById(session.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(session.id);
    });
  });

  describe('getSessionsByUserId', () => {
    it('should return empty array when no sessions', async () => {
      const result = await getSessionsByUserId('user-123');
      expect(result).toEqual([]);
    });

    it('should return sessions for user', async () => {
      // Create first session
      const session1 = await openSession('user-123', 500000);

      // Close first session to allow opening second
      await db.offline_sessions.update(session1.id, { status: 'closed' });

      // Create second session with different UUID
      let callCount = 0;
      vi.stubGlobal('crypto', {
        randomUUID: () => {
          callCount++;
          return `test-uuid-session-${callCount}-${Date.now()}`;
        },
      });

      await openSession('user-123', 600000);

      const result = await getSessionsByUserId('user-123');
      expect(result.length).toBe(2);
    });
  });
});
