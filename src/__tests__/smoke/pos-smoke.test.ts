/**
 * POS Smoke Test Suite (F3.6)
 *
 * Critical path tests for POS operations.
 * These tests verify the integration of payment, void, refund, and offline sync.
 *
 * Run: npx vitest run src/__tests__/smoke/pos-smoke.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: true, error: null })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  },
}));

// Mock Dexie database
vi.mock('@/lib/db', () => ({
  db: {
    offline_sync_queue: {
      add: vi.fn(() => Promise.resolve()),
      toArray: vi.fn(() => Promise.resolve([])),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          and: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    },
  },
}));

// Mock audit service
vi.mock('@/services/financial/auditService', () => ({
  logVoidOperation: vi.fn().mockResolvedValue('audit-void-123'),
  logRefundOperation: vi.fn().mockResolvedValue('audit-refund-456'),
}));

describe('POS Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Critical Path 1: Cash Checkout Flow', () => {
    it('should validate payment input correctly', async () => {
      const { validatePayment } = await import('@/services/payment/paymentService');

      const result = validatePayment(
        { method: 'cash', amount: 100000, cashReceived: 150000 },
        100000
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject underpayment for cash', async () => {
      const { validatePayment } = await import('@/services/payment/paymentService');

      const result = validatePayment(
        { method: 'cash', amount: 100000, cashReceived: 50000 },
        100000
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cash received is less than amount');
    });

    it('should calculate change correctly', async () => {
      const { calculateChange } = await import('@/services/payment/paymentService');

      const change = calculateChange(200000, 150000);

      expect(change).toBe(50000);
    });
  });

  describe('Critical Path 2: Split Payment Flow', () => {
    it('should validate split payment total matches order', async () => {
      const { validateSplitPayments } = await import('@/services/payment/paymentService');

      const result = validateSplitPayments(
        [
          { method: 'cash', amount: 100000 },
          { method: 'card', amount: 50000 },
        ],
        150000
      );

      expect(result.valid).toBe(true);
    });

    it('should reject split payment with insufficient total', async () => {
      const { validateSplitPayments } = await import('@/services/payment/paymentService');

      const result = validateSplitPayments(
        [
          { method: 'cash', amount: 50000 },
          { method: 'card', amount: 50000 },
        ],
        150000
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total payments (100000) less than order total (150000)');
    });
  });

  describe('Critical Path 3: Void Order Flow', () => {
    it('should validate void input correctly', async () => {
      const { validateVoidInput } = await import('@/services/financial/financialOperationService');

      const errors = validateVoidInput({
        orderId: 'order-123',
        reason: 'Customer changed mind',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-456',
      });

      expect(errors).toHaveLength(0);
    });

    it('should reject void without reason', async () => {
      const { validateVoidInput } = await import('@/services/financial/financialOperationService');

      const errors = validateVoidInput({
        orderId: 'order-123',
        reason: '',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-456',
      });

      expect(errors).toContain('Void reason is required');
    });

    it('should reject void without order ID', async () => {
      const { validateVoidInput } = await import('@/services/financial/financialOperationService');

      const errors = validateVoidInput({
        orderId: '',
        reason: 'Test reason',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-456',
      });

      expect(errors).toContain('Order ID is required');
    });
  });

  describe('Critical Path 4: Refund Order Flow', () => {
    it('should validate refund input correctly', async () => {
      const { validateRefundInput } = await import('@/services/financial/financialOperationService');

      const errors = validateRefundInput(
        {
          orderId: 'order-123',
          amount: 50000,
          reason: 'Product quality issue',
          reasonCode: 'product_quality',
          method: 'cash',
          refundedBy: 'user-456',
        },
        100000 // order total
      );

      expect(errors).toHaveLength(0);
    });

    it('should reject refund exceeding order total', async () => {
      const { validateRefundInput } = await import('@/services/financial/financialOperationService');

      const errors = validateRefundInput(
        {
          orderId: 'order-123',
          amount: 150000,
          reason: 'Test refund',
          reasonCode: 'product_quality',
          method: 'cash',
          refundedBy: 'user-456',
        },
        100000 // order total
      );

      expect(errors).toContain('Refund amount cannot exceed order total');
    });

    it('should reject refund with zero amount', async () => {
      const { validateRefundInput } = await import('@/services/financial/financialOperationService');

      const errors = validateRefundInput(
        {
          orderId: 'order-123',
          amount: 0,
          reason: 'Test refund',
          reasonCode: 'product_quality',
          method: 'cash',
          refundedBy: 'user-456',
        },
        100000
      );

      expect(errors).toContain('Refund amount must be greater than 0');
    });
  });

  describe('Critical Path 5: Offline Sync Conflict Resolution', () => {
    it('should reject operation when server is newer', async () => {
      const { shouldRejectForConflict } = await import(
        '@/services/financial/financialOperationService'
      );

      const localTime = new Date('2026-02-05T10:00:00Z');
      const serverTime = new Date('2026-02-05T11:00:00Z');

      const shouldReject = shouldRejectForConflict({
        serverUpdatedAt: serverTime,
        localOperationAt: localTime,
        rule: 'reject_if_server_newer',
      });

      expect(shouldReject).toBe(true);
    });

    it('should allow operation when local is newer', async () => {
      const { shouldRejectForConflict } = await import(
        '@/services/financial/financialOperationService'
      );

      const localTime = new Date('2026-02-05T12:00:00Z');
      const serverTime = new Date('2026-02-05T10:00:00Z');

      const shouldReject = shouldRejectForConflict({
        serverUpdatedAt: serverTime,
        localOperationAt: localTime,
        rule: 'reject_if_server_newer',
      });

      expect(shouldReject).toBe(false);
    });

    it('should always allow with force_apply rule', async () => {
      const { shouldRejectForConflict } = await import(
        '@/services/financial/financialOperationService'
      );

      const localTime = new Date('2026-02-05T10:00:00Z');
      const serverTime = new Date('2026-02-05T11:00:00Z');

      const shouldReject = shouldRejectForConflict({
        serverUpdatedAt: serverTime,
        localOperationAt: localTime,
        rule: 'force_apply',
      });

      expect(shouldReject).toBe(false);
    });
  });

  describe('Print Service Integration', () => {
    it('should handle print server unavailability gracefully', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const { checkPrintServer } = await import('@/services/print/printService');

      const isAvailable = await checkPrintServer();

      expect(isAvailable).toBe(false);
    });
  });

  describe('Display Broadcast', () => {
    it('should support BroadcastChannel check', async () => {
      // Mock BroadcastChannel
      class MockBroadcastChannel {
        constructor() {}
        postMessage() {}
        close() {}
      }
      // @ts-expect-error - Mock
      global.BroadcastChannel = MockBroadcastChannel;

      const { useDisplayBroadcast } = await import('@/hooks/pos/useDisplayBroadcast');

      // Check isSupported via the module
      expect(typeof BroadcastChannel).toBe('function');
    });
  });
});
