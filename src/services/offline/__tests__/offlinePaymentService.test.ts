/**
 * Tests for offlinePaymentService (Story 3.4)
 *
 * Tests cover:
 * - Payment creation with different methods
 * - Sync status determination
 * - Change calculation
 * - Split payments
 * - Sync queue integration
 * - Payment retrieval
 */

import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db';
import {
  generateLocalPaymentId,
  isLocalPaymentId,
  calculateChange,
  saveOfflinePayment,
  saveOfflinePayments,
  getPaymentsByOrderId,
  getOfflinePaymentById,
  getOrderPaidAmount,
  getPaymentsBySyncStatus,
  getPendingSyncPaymentsCount,
  markPaymentSynced,
  markPaymentConflict,
  deletePaymentsByOrderId,
  clearOfflinePayments,
} from '../offlinePaymentService';
import type { TPaymentMethod } from '@/types/offline';

// Mock crypto.randomUUID with incrementing counter for unique IDs
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}-5678-90ab-cdef12345678`,
});

describe('offlinePaymentService', () => {
  beforeEach(async () => {
    // Reset UUID counter for each test
    uuidCounter = 0;
    // Clear all tables before each test
    await db.offline_payments.clear();
    await db.offline_sync_queue.clear();
  });

  describe('generateLocalPaymentId', () => {
    it('should generate ID with LOCAL-PAY- prefix', () => {
      const id = generateLocalPaymentId();
      expect(id).toMatch(/^LOCAL-PAY-/);
      expect(id).toMatch(/^LOCAL-PAY-test-uuid-\d+-5678-90ab-cdef12345678$/);
    });
  });

  describe('isLocalPaymentId', () => {
    it('should return true for local payment IDs', () => {
      expect(isLocalPaymentId('LOCAL-PAY-abc123')).toBe(true);
    });

    it('should return false for server IDs', () => {
      expect(isLocalPaymentId('abc-123-def-456')).toBe(false);
      expect(isLocalPaymentId('')).toBe(false);
    });
  });

  describe('calculateChange', () => {
    it('should calculate correct change when cashReceived > total', () => {
      expect(calculateChange(100000, 150000)).toBe(50000);
      expect(calculateChange(85000, 100000)).toBe(15000);
    });

    it('should return 0 when cashReceived equals total', () => {
      expect(calculateChange(100000, 100000)).toBe(0);
    });

    it('should return 0 when cashReceived < total (no negative change)', () => {
      expect(calculateChange(100000, 50000)).toBe(0);
      expect(calculateChange(100000, 0)).toBe(0);
    });
  });

  describe('saveOfflinePayment', () => {
    const baseInput = {
      order_id: 'LOCAL-order-123',
      method: 'cash' as TPaymentMethod,
      amount: 100000,
      user_id: 'user-123',
    };

    it('should create cash payment with pending_sync status', async () => {
      const payment = await saveOfflinePayment(baseInput);

      expect(payment.id).toMatch(/^LOCAL-PAY-/);
      expect(payment.order_id).toBe('LOCAL-order-123');
      expect(payment.method).toBe('cash');
      expect(payment.amount).toBe(100000);
      expect(payment.sync_status).toBe('pending_sync');
      expect(payment.user_id).toBe('user-123');
    });

    it('should create card payment with pending_validation status', async () => {
      const payment = await saveOfflinePayment({
        ...baseInput,
        method: 'card',
      });

      expect(payment.sync_status).toBe('pending_validation');
    });

    it('should create QRIS payment with pending_validation status', async () => {
      const payment = await saveOfflinePayment({
        ...baseInput,
        method: 'qris',
      });

      expect(payment.sync_status).toBe('pending_validation');
    });

    it('should create transfer payment with pending_validation status', async () => {
      const payment = await saveOfflinePayment({
        ...baseInput,
        method: 'transfer',
      });

      expect(payment.sync_status).toBe('pending_validation');
    });

    it('should create ewallet payment with pending_validation status', async () => {
      const payment = await saveOfflinePayment({
        ...baseInput,
        method: 'ewallet',
      });

      expect(payment.sync_status).toBe('pending_validation');
    });

    it('should store cash_received and change_given for cash payments', async () => {
      const payment = await saveOfflinePayment({
        ...baseInput,
        cash_received: 150000,
        change_given: 50000,
      });

      expect(payment.cash_received).toBe(150000);
      expect(payment.change_given).toBe(50000);
    });

    it('should store reference for card payments', async () => {
      const payment = await saveOfflinePayment({
        ...baseInput,
        method: 'card',
        reference: 'TXN-12345',
      });

      expect(payment.reference).toBe('TXN-12345');
    });

    it('should store session_id when provided', async () => {
      const payment = await saveOfflinePayment({
        ...baseInput,
        session_id: 'session-456',
      });

      expect(payment.session_id).toBe('session-456');
    });

    it('should add entry to sync queue', async () => {
      await saveOfflinePayment(baseInput);

      const syncItems = await db.offline_sync_queue.toArray();
      expect(syncItems).toHaveLength(1);
      expect(syncItems[0].entity).toBe('payments');
      expect(syncItems[0].action).toBe('create');
      expect(syncItems[0].status).toBe('pending');
    });

    it('should throw error for missing order_id', async () => {
      await expect(
        saveOfflinePayment({
          ...baseInput,
          order_id: '',
        })
      ).rejects.toThrow('Payment must have an order_id');
    });

    it('should throw error for missing user_id', async () => {
      await expect(
        saveOfflinePayment({
          ...baseInput,
          user_id: '',
        })
      ).rejects.toThrow('Payment must have a user_id');
    });

    it('should throw error for non-positive amount', async () => {
      await expect(
        saveOfflinePayment({
          ...baseInput,
          amount: 0,
        })
      ).rejects.toThrow('Payment amount must be positive');

      await expect(
        saveOfflinePayment({
          ...baseInput,
          amount: -100,
        })
      ).rejects.toThrow('Payment amount must be positive');
    });
  });

  describe('saveOfflinePayments (split payments)', () => {
    const orderId = 'LOCAL-order-split';

    it('should create multiple payments for split payment', async () => {
      const payments = await saveOfflinePayments(orderId, [
        {
          method: 'cash',
          amount: 50000,
          cash_received: 50000,
          user_id: 'user-123',
        },
        {
          method: 'card',
          amount: 50000,
          reference: 'TXN-123',
          user_id: 'user-123',
        },
      ]);

      expect(payments).toHaveLength(2);
      expect(payments[0].method).toBe('cash');
      expect(payments[0].sync_status).toBe('pending_sync');
      expect(payments[1].method).toBe('card');
      expect(payments[1].sync_status).toBe('pending_validation');
    });

    it('should link all payments to same order', async () => {
      const payments = await saveOfflinePayments(orderId, [
        { method: 'cash', amount: 30000, user_id: 'user-123' },
        { method: 'card', amount: 70000, user_id: 'user-123' },
      ]);

      expect(payments[0].order_id).toBe(orderId);
      expect(payments[1].order_id).toBe(orderId);
    });

    it('should create single sync queue entry for all payments', async () => {
      await saveOfflinePayments(orderId, [
        { method: 'cash', amount: 30000, user_id: 'user-123' },
        { method: 'card', amount: 70000, user_id: 'user-123' },
      ]);

      const syncItems = await db.offline_sync_queue.toArray();
      expect(syncItems).toHaveLength(1);
      expect(syncItems[0].entityId).toBe(orderId);
      expect((syncItems[0].payload as { payments: unknown[] }).payments).toHaveLength(2);
    });

    it('should throw error for empty payments array', async () => {
      await expect(saveOfflinePayments(orderId, [])).rejects.toThrow(
        'At least one payment is required'
      );
    });

    it('should throw error for missing orderId', async () => {
      await expect(
        saveOfflinePayments('', [
          { method: 'cash', amount: 100000, user_id: 'user-123' },
        ])
      ).rejects.toThrow('orderId is required');
    });
  });

  describe('getPaymentsByOrderId', () => {
    it('should retrieve all payments for an order', async () => {
      const orderId = 'LOCAL-order-get';

      await saveOfflinePayment({
        order_id: orderId,
        method: 'cash',
        amount: 50000,
        user_id: 'user-123',
      });
      await saveOfflinePayment({
        order_id: orderId,
        method: 'card',
        amount: 50000,
        user_id: 'user-123',
      });
      await saveOfflinePayment({
        order_id: 'other-order',
        method: 'cash',
        amount: 100000,
        user_id: 'user-123',
      });

      const payments = await getPaymentsByOrderId(orderId);
      expect(payments).toHaveLength(2);
      expect(payments.every((p) => p.order_id === orderId)).toBe(true);
    });

    it('should return empty array for non-existent order', async () => {
      const payments = await getPaymentsByOrderId('non-existent');
      expect(payments).toHaveLength(0);
    });
  });

  describe('getOfflinePaymentById', () => {
    it('should retrieve payment by ID', async () => {
      const created = await saveOfflinePayment({
        order_id: 'LOCAL-order-123',
        method: 'cash',
        amount: 100000,
        user_id: 'user-123',
      });

      const payment = await getOfflinePaymentById(created.id);
      expect(payment).toBeDefined();
      expect(payment?.id).toBe(created.id);
    });

    it('should return undefined for non-existent ID', async () => {
      const payment = await getOfflinePaymentById('non-existent');
      expect(payment).toBeUndefined();
    });
  });

  describe('getOrderPaidAmount', () => {
    it('should calculate total paid amount for order', async () => {
      const orderId = 'LOCAL-order-total';

      await saveOfflinePayments(orderId, [
        { method: 'cash', amount: 30000, user_id: 'user-123' },
        { method: 'card', amount: 50000, user_id: 'user-123' },
        { method: 'qris', amount: 20000, user_id: 'user-123' },
      ]);

      const total = await getOrderPaidAmount(orderId);
      expect(total).toBe(100000);
    });

    it('should return 0 for order with no payments', async () => {
      const total = await getOrderPaidAmount('no-payments');
      expect(total).toBe(0);
    });
  });

  describe('getPaymentsBySyncStatus', () => {
    it('should filter payments by sync status', async () => {
      await saveOfflinePayment({
        order_id: 'order-1',
        method: 'cash',
        amount: 100000,
        user_id: 'user-123',
      });
      await saveOfflinePayment({
        order_id: 'order-2',
        method: 'card',
        amount: 100000,
        user_id: 'user-123',
      });

      const pendingSync = await getPaymentsBySyncStatus('pending_sync');
      const pendingValidation = await getPaymentsBySyncStatus('pending_validation');

      expect(pendingSync).toHaveLength(1);
      expect(pendingSync[0].method).toBe('cash');
      expect(pendingValidation).toHaveLength(1);
      expect(pendingValidation[0].method).toBe('card');
    });
  });

  describe('getPendingSyncPaymentsCount', () => {
    it('should count payments needing sync', async () => {
      await saveOfflinePayment({
        order_id: 'order-1',
        method: 'cash',
        amount: 100000,
        user_id: 'user-123',
      });
      await saveOfflinePayment({
        order_id: 'order-2',
        method: 'card',
        amount: 100000,
        user_id: 'user-123',
      });
      await saveOfflinePayment({
        order_id: 'order-3',
        method: 'qris',
        amount: 100000,
        user_id: 'user-123',
      });

      const count = await getPendingSyncPaymentsCount();
      expect(count).toBe(3); // 1 pending_sync + 2 pending_validation
    });
  });

  describe('markPaymentSynced', () => {
    it('should update payment sync status and server_id', async () => {
      const created = await saveOfflinePayment({
        order_id: 'LOCAL-order-123',
        method: 'cash',
        amount: 100000,
        user_id: 'user-123',
      });

      await markPaymentSynced(created.id, 'server-uuid-123');

      const payment = await getOfflinePaymentById(created.id);
      expect(payment?.sync_status).toBe('synced');
      expect(payment?.server_id).toBe('server-uuid-123');
    });
  });

  describe('markPaymentConflict', () => {
    it('should update payment sync status to conflict', async () => {
      const created = await saveOfflinePayment({
        order_id: 'LOCAL-order-123',
        method: 'cash',
        amount: 100000,
        user_id: 'user-123',
      });

      await markPaymentConflict(created.id);

      const payment = await getOfflinePaymentById(created.id);
      expect(payment?.sync_status).toBe('conflict');
    });
  });

  describe('deletePaymentsByOrderId', () => {
    it('should delete all payments for an order', async () => {
      const orderId = 'LOCAL-order-delete';

      await saveOfflinePayments(orderId, [
        { method: 'cash', amount: 50000, user_id: 'user-123' },
        { method: 'card', amount: 50000, user_id: 'user-123' },
      ]);

      await deletePaymentsByOrderId(orderId);

      const payments = await getPaymentsByOrderId(orderId);
      expect(payments).toHaveLength(0);
    });
  });

  describe('clearOfflinePayments', () => {
    it('should clear all payments', async () => {
      await saveOfflinePayment({
        order_id: 'order-1',
        method: 'cash',
        amount: 100000,
        user_id: 'user-123',
      });
      await saveOfflinePayment({
        order_id: 'order-2',
        method: 'card',
        amount: 100000,
        user_id: 'user-123',
      });

      await clearOfflinePayments();

      const count = await db.offline_payments.count();
      expect(count).toBe(0);
    });
  });
});
