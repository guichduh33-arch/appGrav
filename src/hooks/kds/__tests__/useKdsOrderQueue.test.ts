/**
 * Tests for useKdsOrderQueue Hook
 * Story 4.4 - KDS Order Queue Display
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKdsOrderQueue, IKdsOrder } from '../useKdsOrderQueue';

// Helper to create test orders
const createTestOrder = (
  id: string,
  orderNumber: string,
  createdAt: Date = new Date()
): IKdsOrder => ({
  id,
  order_number: orderNumber,
  order_type: 'dine_in',
  table_name: 'Table 1',
  items: [
    {
      id: `${id}-item-1`,
      product_name: 'Test Product',
      quantity: 1,
      item_status: 'new',
      dispatch_station: 'kitchen',
      is_held: false,
    },
  ],
  created_at: createdAt.toISOString(),
  status: 'new',
  source: 'pos',
});

describe('useKdsOrderQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('setOrders', () => {
    it('should sort orders by created_at (FIFO)', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      const now = new Date();
      const order1 = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 60000)); // 1 min ago
      const order2 = createTestOrder('2', 'ORD-002', new Date(now.getTime() - 120000)); // 2 min ago
      const order3 = createTestOrder('3', 'ORD-003', now); // now

      act(() => {
        result.current.setOrders([order3, order1, order2]);
      });

      expect(result.current.orders).toHaveLength(3);
      expect(result.current.orders[0].id).toBe('2'); // Oldest first
      expect(result.current.orders[1].id).toBe('1');
      expect(result.current.orders[2].id).toBe('3'); // Newest last
    });
  });

  describe('addOrder', () => {
    it('should add order and maintain FIFO sort', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      const now = new Date();
      const order1 = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 60000));
      const order2 = createTestOrder('2', 'ORD-002', new Date(now.getTime() - 30000));

      act(() => {
        result.current.addOrder(order2);
      });

      act(() => {
        result.current.addOrder(order1);
      });

      expect(result.current.orders).toHaveLength(2);
      expect(result.current.orders[0].id).toBe('1'); // Older order first
      expect(result.current.orders[1].id).toBe('2');
    });

    it('should detect and ignore duplicates', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      const order = createTestOrder('1', 'ORD-001');

      act(() => {
        result.current.addOrder(order);
      });

      act(() => {
        result.current.addOrder(order); // Same order again
      });

      expect(result.current.orders).toHaveLength(1);
    });
  });

  describe('updateOrder', () => {
    it('should update order properties', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      const order = createTestOrder('1', 'ORD-001');

      act(() => {
        result.current.addOrder(order);
      });

      act(() => {
        result.current.updateOrder('1', { status: 'preparing' });
      });

      expect(result.current.orders[0].status).toBe('preparing');
    });
  });

  describe('updateOrderItem', () => {
    it('should update a specific item within an order', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      const order = createTestOrder('1', 'ORD-001');

      act(() => {
        result.current.addOrder(order);
      });

      act(() => {
        result.current.updateOrderItem('1', '1-item-1', { item_status: 'preparing' });
      });

      expect(result.current.orders[0].items[0].item_status).toBe('preparing');
    });
  });

  describe('removeOrder', () => {
    it('should remove order from queue', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      const order1 = createTestOrder('1', 'ORD-001');
      const order2 = createTestOrder('2', 'ORD-002');

      act(() => {
        result.current.setOrders([order1, order2]);
      });

      expect(result.current.orders).toHaveLength(2);

      act(() => {
        result.current.removeOrder('1');
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].id).toBe('2');
    });
  });

  describe('clearOrders', () => {
    it('should remove all orders', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      act(() => {
        result.current.setOrders([
          createTestOrder('1', 'ORD-001'),
          createTestOrder('2', 'ORD-002'),
        ]);
      });

      expect(result.current.orders).toHaveLength(2);

      act(() => {
        result.current.clearOrders();
      });

      expect(result.current.orders).toHaveLength(0);
    });
  });

  describe('urgentOrders separation', () => {
    it('should separate orders > 10 min as urgent', () => {
      const { result } = renderHook(() => useKdsOrderQueue({ urgentThresholdSeconds: 600 }));

      const now = new Date();
      const urgentOrder = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 700000)); // 11.67 min ago
      const normalOrder = createTestOrder('2', 'ORD-002', new Date(now.getTime() - 60000)); // 1 min ago

      act(() => {
        result.current.setOrders([urgentOrder, normalOrder]);
      });

      expect(result.current.urgentOrders).toHaveLength(1);
      expect(result.current.urgentOrders[0].id).toBe('1');
      expect(result.current.normalOrders).toHaveLength(1);
      expect(result.current.normalOrders[0].id).toBe('2');
      expect(result.current.urgentCount).toBe(1);
    });

    it('should use custom urgentThresholdSeconds', () => {
      const { result } = renderHook(() => useKdsOrderQueue({ urgentThresholdSeconds: 300 })); // 5 min

      const now = new Date();
      const urgentOrder = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 400000)); // 6.67 min ago

      act(() => {
        result.current.addOrder(urgentOrder);
      });

      expect(result.current.urgentOrders).toHaveLength(1);
    });

    it('should return empty arrays when no orders', () => {
      const { result } = renderHook(() => useKdsOrderQueue());

      expect(result.current.orders).toHaveLength(0);
      expect(result.current.urgentOrders).toHaveLength(0);
      expect(result.current.normalOrders).toHaveLength(0);
      expect(result.current.urgentCount).toBe(0);
    });
  });

  describe('onOrderBecameUrgent callback', () => {
    it('should call callback when adding an already urgent order', () => {
      const onOrderBecameUrgent = vi.fn();
      const { result } = renderHook(() =>
        useKdsOrderQueue({ urgentThresholdSeconds: 600, onOrderBecameUrgent })
      );

      const now = new Date();
      // Order created 11 min ago - already urgent
      const urgentOrder = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 700000)); // 11.67 min ago

      act(() => {
        result.current.addOrder(urgentOrder);
      });

      // Should be urgent immediately
      expect(result.current.urgentOrders).toHaveLength(1);
      expect(onOrderBecameUrgent).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    });

    it('should not call callback for non-urgent orders', () => {
      const onOrderBecameUrgent = vi.fn();
      const { result } = renderHook(() =>
        useKdsOrderQueue({ urgentThresholdSeconds: 600, onOrderBecameUrgent })
      );

      const now = new Date();
      // Order created 1 min ago - not urgent
      const normalOrder = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 60000));

      act(() => {
        result.current.addOrder(normalOrder);
      });

      expect(result.current.urgentOrders).toHaveLength(0);
      expect(onOrderBecameUrgent).not.toHaveBeenCalled();
    });
  });

  describe('dynamic urgent transition', () => {
    it('should recalculate urgency when orders are updated', () => {
      const onOrderBecameUrgent = vi.fn();
      const { result } = renderHook(() =>
        useKdsOrderQueue({ urgentThresholdSeconds: 600, onOrderBecameUrgent })
      );

      const now = new Date();
      // Order created 9 min ago - not urgent yet
      const order = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 540000));

      act(() => {
        result.current.addOrder(order);
      });

      // Initially should be normal (9 min < 10 min threshold)
      expect(result.current.normalOrders).toHaveLength(1);
      expect(result.current.urgentOrders).toHaveLength(0);
      expect(onOrderBecameUrgent).not.toHaveBeenCalled();

      // Simulate order being refreshed with same data but older timestamp (simulating time passing)
      // This is what happens in real usage when fetchOrders is called periodically
      const olderOrder = createTestOrder('1', 'ORD-001', new Date(now.getTime() - 700000)); // 11.67 min ago

      act(() => {
        result.current.setOrders([olderOrder]);
      });

      // Now should be urgent
      expect(result.current.urgentOrders).toHaveLength(1);
      expect(result.current.normalOrders).toHaveLength(0);
      expect(onOrderBecameUrgent).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    });
  });
});
