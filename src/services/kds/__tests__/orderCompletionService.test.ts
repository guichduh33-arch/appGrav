/**
 * Order Completion Service Tests
 * Story 4.6 - Order Completion & Auto-Remove
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeOrder } from '../orderCompletionService';
import { supabase } from '@/lib/supabase';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

// Mock lanClient
vi.mock('@/services/lan/lanClient', () => ({
  lanClient: {
    isActive: vi.fn(),
    send: vi.fn(),
  },
}));

describe('orderCompletionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('completeOrder', () => {
    it('should update order status to ready in Supabase', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);
      vi.mocked(lanClient.isActive).mockReturnValue(false);

      const result = await completeOrder('order-123', 'ORD-001', 'kitchen');

      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ready',
          completed_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'order-123');
      expect(result.success).toBe(true);
    });

    it('should send ORDER_COMPLETE via LAN when connected', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);
      vi.mocked(lanClient.isActive).mockReturnValue(true);
      vi.mocked(lanClient.send).mockResolvedValue(undefined);

      const result = await completeOrder('order-123', 'ORD-001', 'kitchen');

      expect(lanClient.send).toHaveBeenCalledWith(
        LAN_MESSAGE_TYPES.ORDER_COMPLETE,
        expect.objectContaining({
          order_id: 'order-123',
          order_number: 'ORD-001',
          station: 'kitchen',
          completed_at: expect.any(String),
          timestamp: expect.any(String),
        })
      );
      expect(result.lanSent).toBe(true);
    });

    it('should set lanSent to false when LAN is not active', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);
      vi.mocked(lanClient.isActive).mockReturnValue(false);

      const result = await completeOrder('order-123', 'ORD-001', 'kitchen');

      expect(lanClient.send).not.toHaveBeenCalled();
      expect(result.lanSent).toBe(false);
    });

    it('should return error when Supabase update fails', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Database error' } });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);
      vi.mocked(lanClient.isActive).mockReturnValue(false);

      const result = await completeOrder('order-123', 'ORD-001', 'kitchen');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await completeOrder('order-123', 'ORD-001', 'kitchen');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected error');
    });
  });
});
