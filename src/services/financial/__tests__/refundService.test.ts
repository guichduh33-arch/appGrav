/**
 * Refund Service Tests
 *
 * Tests for refund operations, validation, and offline sync.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { IRefundInput } from '@/types/payment';

// Mock modules BEFORE importing anything that uses them
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
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: true, error: null })),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    offline_sync_queue: {
      add: vi.fn(() => Promise.resolve()),
    },
  },
}));

vi.mock('../auditService', () => ({
  logRefundOperation: vi.fn().mockResolvedValue('audit-log-456'),
}));

// Import after mocks
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

describe('refundService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('canRefundOrder (permission check)', () => {
    it('should return true when user has refund permission', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: true,
        error: null,
      } as never);

      const { canRefundOrder } = await import('../refundService');
      const result = await canRefundOrder('user-123');

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('user_has_permission', {
        p_user_id: 'user-123',
        p_permission_code: 'sales.refund',
      });
    });

    it('should return false when user lacks refund permission', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: false,
        error: null,
      } as never);

      const { canRefundOrder } = await import('../refundService');
      const result = await canRefundOrder('user-123');

      expect(result).toBe(false);
    });
  });

  describe('canOrderBeRefunded', () => {
    it('should return true for a completed order', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'order-123',
                total: 150000,
                status: 'completed',
                refund_amount: null,
                payment_method: 'cash',
              },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeRefunded } = await import('../refundService');
      const result = await canOrderBeRefunded('order-123', 50000);

      expect(result.canRefund).toBe(true);
      expect(result.order).toBeDefined();
    });

    it('should reject voided orders', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'order-123',
                total: 150000,
                status: 'voided',
                refund_amount: null,
                payment_method: 'cash',
              },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeRefunded } = await import('../refundService');
      const result = await canOrderBeRefunded('order-123', 50000);

      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe('Cannot refund a voided order');
    });

    it('should reject cancelled orders', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'order-123',
                total: 150000,
                status: 'cancelled',
                refund_amount: null,
                payment_method: 'cash',
              },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeRefunded } = await import('../refundService');
      const result = await canOrderBeRefunded('order-123', 50000);

      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe('Cannot refund a cancelled order');
    });

    it('should reject unpaid orders', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'order-123',
                total: 150000,
                status: 'pending',
                refund_amount: null,
                payment_method: 'cash',
              },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeRefunded } = await import('../refundService');
      const result = await canOrderBeRefunded('order-123', 50000);

      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe('Order must be completed before refunding');
    });

    it('should reject refund amount exceeding remaining', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'order-123',
                total: 150000,
                status: 'completed',
                refund_amount: 100000, // Already refunded 100k
                payment_method: 'cash',
              },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeRefunded } = await import('../refundService');
      // Trying to refund 100k when only 50k remaining
      const result = await canOrderBeRefunded('order-123', 100000);

      expect(result.canRefund).toBe(false);
      expect(result.reason).toContain('exceeds remaining refundable amount');
    });
  });

  describe('getMaxRefundableAmount', () => {
    it('should return full amount when no previous refunds', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { total: 150000, refund_amount: null },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { getMaxRefundableAmount } = await import('../refundService');
      const result = await getMaxRefundableAmount('order-123');

      expect(result).toBe(150000);
    });

    it('should return remaining amount after partial refund', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { total: 150000, refund_amount: 50000 },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { getMaxRefundableAmount } = await import('../refundService');
      const result = await getMaxRefundableAmount('order-123');

      expect(result).toBe(100000);
    });

    it('should return 0 when order not found', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' },
            })),
          })),
        })),
      }) as never);

      const { getMaxRefundableAmount } = await import('../refundService');
      const result = await getMaxRefundableAmount('order-123');

      expect(result).toBe(0);
    });
  });

  describe('refundOrder / processRefund', () => {
    it('should have processRefund as alias for refundOrder', async () => {
      const { processRefund, refundOrder } = await import('../refundService');
      expect(processRefund).toBe(refundOrder);
    });

    it('should queue operation when offline', async () => {
      // Mock to get order total for validation
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { total: 100000 },
              error: null,
            })),
          })),
        })),
      }) as never);

      const input: IRefundInput = {
        orderId: 'order-123',
        amount: 50000,
        reason: 'Product quality issue',
        reasonCode: 'product_quality',
        method: 'cash',
        refundedBy: 'user-123',
      };

      const { refundOrder } = await import('../refundService');
      const result = await refundOrder(input, true);

      expect(result.success).toBe(true);
      expect(result.operationId).toMatch(/^LOCAL-REFUND-/);
      expect(db.offline_sync_queue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'refund_operations',
          action: 'create',
          status: 'pending',
        })
      );
    });
  });

  describe('syncRefundOperation', () => {
    it('should reject when order not found on server', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' },
            })),
          })),
        })),
      }) as never);

      const operation = {
        id: 'LOCAL-REFUND-123',
        orderId: 'order-123',
        amount: 50000,
        reason: 'Test reason',
        reasonCode: 'product_quality',
        method: 'cash' as const,
        refundedBy: 'user-123',
        createdAt: new Date().toISOString(),
        synced: false,
      };

      const { syncRefundOperation } = await import('../refundService');
      const result = await syncRefundOperation(operation);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found on server');
    });

    it('should reject when server has newer updates (conflict)', async () => {
      const localOperationTime = new Date('2026-02-05T10:00:00Z');
      const serverUpdateTime = new Date('2026-02-05T11:00:00Z');

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'order-123',
                updated_at: serverUpdateTime.toISOString(),
                status: 'completed',
                refund_amount: null,
                total: 100000,
              },
              error: null,
            })),
          })),
        })),
      }) as never);

      const operation = {
        id: 'LOCAL-REFUND-123',
        orderId: 'order-123',
        amount: 50000,
        reason: 'Test reason',
        reasonCode: 'product_quality',
        method: 'cash' as const,
        refundedBy: 'user-123',
        createdAt: localOperationTime.toISOString(),
        synced: false,
      };

      const { syncRefundOperation } = await import('../refundService');
      const result = await syncRefundOperation(operation);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Conflict');
    });
  });
});
