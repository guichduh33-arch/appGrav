/**
 * KDS Status Service Tests
 * Story 4.5 - KDS Item Status Update
 *
 * Tests for marking items as preparing/ready and notifying via LAN
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules BEFORE importing anything that uses them
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        in: vi.fn(() => Promise.resolve({ data: null, error: null })),
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

vi.mock('@/services/lan/lanClient', () => ({
  lanClient: {
    isActive: vi.fn(() => true),
    send: vi.fn(() => Promise.resolve()),
  },
}));

// Import after mocks are set up
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import { supabase } from '@/lib/supabase';
import { lanClient } from '@/services/lan/lanClient';

describe('LAN_MESSAGE_TYPES - KDS Status Events', () => {
  it('should have KDS_ITEM_PREPARING message type', () => {
    expect(LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING).toBe('kds_item_preparing');
  });

  it('should have KDS_ITEM_READY message type', () => {
    expect(LAN_MESSAGE_TYPES.KDS_ITEM_READY).toBe('kds_item_ready');
  });
});

describe('kdsStatusService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    vi.mocked(lanClient.isActive).mockReturnValue(true);
    vi.mocked(supabase.from).mockImplementation(() => ({
      update: vi.fn(() => ({
        in: vi.fn(() => Promise.resolve({ data: null, error: null })),
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    }) as unknown as ReturnType<typeof supabase.from>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('markItemsPreparing', () => {
    it('should update items to preparing status in Supabase', async () => {
      const { markItemsPreparing } = await import('../kdsStatusService');

      const result = await markItemsPreparing(
        'order-123',
        'ORD-001',
        ['item-1', 'item-2'],
        'kitchen'
      );

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('order_items');
    });

    it('should send KDS_ITEM_PREPARING via LAN when connected', async () => {
      vi.mocked(lanClient.isActive).mockReturnValue(true);
      const { markItemsPreparing } = await import('../kdsStatusService');

      const result = await markItemsPreparing(
        'order-123',
        'ORD-001',
        ['item-1', 'item-2'],
        'kitchen'
      );

      expect(result.success).toBe(true);
      expect(result.lanSent).toBe(true);
      expect(lanClient.send).toHaveBeenCalledWith(
        LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING,
        expect.objectContaining({
          order_id: 'order-123',
          order_number: 'ORD-001',
          item_ids: ['item-1', 'item-2'],
          station: 'kitchen',
        })
      );
    });

    it('should return lanSent=false when LAN is disconnected', async () => {
      vi.mocked(lanClient.isActive).mockReturnValue(false);
      const { markItemsPreparing } = await import('../kdsStatusService');

      const result = await markItemsPreparing(
        'order-123',
        'ORD-001',
        ['item-1'],
        'barista'
      );

      expect(result.success).toBe(true);
      expect(result.lanSent).toBe(false);
      expect(lanClient.send).not.toHaveBeenCalled();
    });

    it('should handle Supabase errors gracefully', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        update: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
          eq: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      }) as unknown as ReturnType<typeof supabase.from>);

      const { markItemsPreparing } = await import('../kdsStatusService');

      const result = await markItemsPreparing(
        'order-123',
        'ORD-001',
        ['item-1'],
        'kitchen'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });

    it('should update order status to preparing when all items are preparing', async () => {
      // Setup mock to track all calls
      const updateMock = vi.fn();
      const selectEqMock = vi.fn(() => Promise.resolve({
        data: [
          { id: 'item-1', item_status: 'preparing' },
          { id: 'item-2', item_status: 'preparing' },
        ],
        error: null,
      }));

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'order_items') {
          return {
            update: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: null, error: null })),
              eq: updateMock.mockReturnValue(Promise.resolve({ data: null, error: null })),
            })),
            select: vi.fn(() => ({
              eq: selectEqMock,
            })),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'orders') {
          return {
            update: vi.fn(() => ({
              eq: updateMock.mockReturnValue(Promise.resolve({ data: null, error: null })),
            })),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        return {
          update: vi.fn(() => ({
            in: vi.fn(() => Promise.resolve({ data: null, error: null })),
            eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        } as unknown as ReturnType<typeof supabase.from>;
      });

      const { markItemsPreparing } = await import('../kdsStatusService');

      const result = await markItemsPreparing(
        'order-123',
        'ORD-001',
        ['item-1', 'item-2'],
        'kitchen'
      );

      expect(result.success).toBe(true);
      // Verify supabase.from was called for both order_items and orders tables
      expect(supabase.from).toHaveBeenCalledWith('order_items');
      expect(supabase.from).toHaveBeenCalledWith('orders');
    });
  });

  describe('markItemsReady', () => {
    it('should update items to ready status with prepared_at timestamp', async () => {
      const { markItemsReady } = await import('../kdsStatusService');

      const result = await markItemsReady(
        'order-456',
        'ORD-002',
        ['item-3', 'item-4'],
        'barista'
      );

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('order_items');
    });

    it('should send KDS_ITEM_READY via LAN when connected', async () => {
      vi.mocked(lanClient.isActive).mockReturnValue(true);
      const { markItemsReady } = await import('../kdsStatusService');

      const result = await markItemsReady(
        'order-456',
        'ORD-002',
        ['item-3'],
        'barista'
      );

      expect(result.success).toBe(true);
      expect(result.lanSent).toBe(true);
      expect(lanClient.send).toHaveBeenCalledWith(
        LAN_MESSAGE_TYPES.KDS_ITEM_READY,
        expect.objectContaining({
          order_id: 'order-456',
          order_number: 'ORD-002',
          item_ids: ['item-3'],
          station: 'barista',
          prepared_at: expect.any(String),
        })
      );
    });

    it('should return lanSent=false when LAN is disconnected', async () => {
      vi.mocked(lanClient.isActive).mockReturnValue(false);
      const { markItemsReady } = await import('../kdsStatusService');

      const result = await markItemsReady(
        'order-456',
        'ORD-002',
        ['item-3'],
        'kitchen'
      );

      expect(result.success).toBe(true);
      expect(result.lanSent).toBe(false);
    });
  });
});
