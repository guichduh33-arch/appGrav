/**
 * Void Service Tests
 *
 * Tests for void operations, validation, and offline sync.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { IVoidInput } from '@/types/payment';

// Mock modules BEFORE importing anything that uses them
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
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
  logVoidOperation: vi.fn().mockResolvedValue('audit-log-123'),
}));

// Import after mocks
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

describe('voidService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('canVoidOrder (permission check)', () => {
    it('should return true when user has void permission', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: true,
        error: null,
      } as never);

      const { canVoidOrder } = await import('../voidService');
      const result = await canVoidOrder('user-123');

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('user_has_permission', {
        p_user_id: 'user-123',
        p_permission_code: 'sales.void',
      });
    });

    it('should return false when user lacks void permission', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: false,
        error: null,
      } as never);

      const { canVoidOrder } = await import('../voidService');
      const result = await canVoidOrder('user-123');

      expect(result).toBe(false);
    });

    it('should return false on permission check error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      } as never);

      const { canVoidOrder } = await import('../voidService');
      const result = await canVoidOrder('user-123');

      expect(result).toBe(false);
    });
  });

  describe('canOrderBeVoided', () => {
    it('should return true for a voidable order', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'order-123', status: 'pending', refund_amount: null },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeVoided } = await import('../voidService');
      const result = await canOrderBeVoided('order-123');

      expect(result.canVoid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject already voided orders', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'order-123', status: 'voided', refund_amount: null },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeVoided } = await import('../voidService');
      const result = await canOrderBeVoided('order-123');

      expect(result.canVoid).toBe(false);
      expect(result.reason).toBe('Order is already voided');
    });

    it('should reject orders with refunds', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'order-123', status: 'pending', refund_amount: 50000 },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeVoided } = await import('../voidService');
      const result = await canOrderBeVoided('order-123');

      expect(result.canVoid).toBe(false);
      expect(result.reason).toBe('Order has been refunded');
    });

    it('should reject completed orders (should refund instead)', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'order-123', status: 'completed', refund_amount: null },
              error: null,
            })),
          })),
        })),
      }) as never);

      const { canOrderBeVoided } = await import('../voidService');
      const result = await canOrderBeVoided('order-123');

      expect(result.canVoid).toBe(false);
      expect(result.reason).toBe('Completed orders should be refunded, not voided');
    });

    it('should return false when order not found', async () => {
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

      const { canOrderBeVoided } = await import('../voidService');
      const result = await canOrderBeVoided('order-123');

      expect(result.canVoid).toBe(false);
      expect(result.reason).toBe('Order not found');
    });
  });

  describe('voidOrder', () => {
    it('should reject invalid input', async () => {
      const input: IVoidInput = {
        orderId: '',
        reason: '',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const { voidOrder } = await import('../voidService');
      const result = await voidOrder(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order ID is required');
    });

    it('should queue operation when offline', async () => {
      const input: IVoidInput = {
        orderId: 'order-123',
        reason: 'Customer changed their mind',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const { voidOrder } = await import('../voidService');
      const result = await voidOrder(input, true);

      expect(result.success).toBe(true);
      expect(result.operationId).toMatch(/^LOCAL-VOID-/);
      expect(db.offline_sync_queue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'void_operations',
          action: 'create',
          status: 'pending',
        })
      );
    });

    it('should apply void when online and order is voidable', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'order-123', status: 'pending', refund_amount: null },
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }) as never);

      const input: IVoidInput = {
        orderId: 'order-123',
        reason: 'Customer changed their mind',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const { voidOrder } = await import('../voidService');
      const result = await voidOrder(input, false);

      expect(result.success).toBe(true);
      expect(result.auditLogId).toBe('audit-log-123');
    });

    it('should fail when order cannot be voided', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'order-123', status: 'voided', refund_amount: null },
              error: null,
            })),
          })),
        })),
      }) as never);

      const input: IVoidInput = {
        orderId: 'order-123',
        reason: 'Customer changed their mind',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const { voidOrder } = await import('../voidService');
      const result = await voidOrder(input, false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order is already voided');
    });
  });

  describe('syncVoidOperation', () => {
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
        id: 'LOCAL-VOID-123',
        orderId: 'order-123',
        reason: 'Test reason',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
        createdAt: new Date().toISOString(),
        synced: false,
      };

      const { syncVoidOperation } = await import('../voidService');
      const result = await syncVoidOperation(operation);

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
                status: 'pending',
              },
              error: null,
            })),
          })),
        })),
      }) as never);

      const operation = {
        id: 'LOCAL-VOID-123',
        orderId: 'order-123',
        reason: 'Test reason',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
        createdAt: localOperationTime.toISOString(),
        synced: false,
      };

      const { syncVoidOperation } = await import('../voidService');
      const result = await syncVoidOperation(operation);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Conflict');
    });
  });
});
