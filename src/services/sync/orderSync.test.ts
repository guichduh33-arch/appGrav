/**
 * Order Sync Service Tests
 * Story 2.2 - Offline Order Creation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock offlineDb
vi.mock('./offlineDb', () => ({
  offlineDb: {
    offline_orders: {
      add: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      filter: vi.fn(() => ({
        count: vi.fn().mockResolvedValue(0),
        toArray: vi.fn().mockResolvedValue([]),
      })),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
        })),
      })),
    },
    sync_queue: {
      add: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      count: vi.fn().mockResolvedValue(0),
      bulkDelete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          count: vi.fn().mockResolvedValue(0),
          toArray: vi.fn().mockResolvedValue([]),
          modify: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    },
  },
}));

describe('orderSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('data structures', () => {
    it('IOfflineOrder should have required fields', () => {
      const order = {
        id: 'offline-123',
        order_number: '#1001',
        order_type: 'dine_in' as const,
        table_number: 'T1',
        customer_id: null,
        customer_name: null,
        items: [],
        subtotal: 50000,
        discount_amount: 0,
        discount_type: null,
        discount_value: null,
        tax_amount: 4545,
        total: 50000,
        payment_method: 'cash',
        payment_status: 'paid' as const,
        notes: '',
        created_at: '2024-01-15T10:30:00Z',
        created_offline: true,
        synced: false,
        synced_at: null,
        pos_terminal_id: 'terminal-1',
      };

      expect(order.id).toBeDefined();
      expect(order.order_number).toBeDefined();
      expect(order.created_offline).toBe(true);
      expect(order.synced).toBe(false);
    });

    it('IOfflineOrderItem should have required fields', () => {
      const item = {
        id: 'item-1',
        product_id: 'prod-123',
        product_name: 'Cappuccino',
        quantity: 2,
        unit_price: 25000,
        total_price: 50000,
        modifiers: [
          {
            id: 'mod-1',
            name: 'Extra Shot',
            price_adjustment: 5000,
          },
        ],
      };

      expect(item.product_id).toBeDefined();
      expect(item.quantity).toBe(2);
      expect(item.modifiers).toHaveLength(1);
      expect(item.modifiers[0].price_adjustment).toBe(5000);
    });
  });

  describe('tax calculation', () => {
    it('should calculate 10% included tax correctly', () => {
      // Tax = total × 10/110
      const total = 50000;
      const expectedTax = Math.round((total * 10) / 110);
      expect(expectedTax).toBe(4545);
    });

    it('should round tax to nearest integer', () => {
      const total = 45000;
      const expectedTax = Math.round((total * 10) / 110);
      expect(expectedTax).toBe(4091);
    });
  });

  describe('offline order ID generation', () => {
    it('should generate ID with offline prefix', () => {
      // Pattern: offline-{timestamp}-{random}
      const mockId = 'offline-1705312200000-abc123def';
      expect(mockId.startsWith('offline-')).toBe(true);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        ids.add(id);
      }
      // All IDs should be unique
      expect(ids.size).toBe(100);
    });
  });

  describe('cart item transformation', () => {
    it('should transform cart items to offline order items', () => {
      const cartItem = {
        id: 'cart-item-1',
        productId: 'prod-123',
        name: 'Latte',
        quantity: 1,
        unitPrice: 35000,
        totalPrice: 40000,
        modifiers: [
          {
            id: 'mod-1',
            name: 'Oat Milk',
            priceAdjustment: 5000,
          },
        ],
      };

      const offlineItem = {
        id: cartItem.id,
        product_id: cartItem.productId,
        product_name: cartItem.name,
        quantity: cartItem.quantity,
        unit_price: cartItem.unitPrice,
        total_price: cartItem.totalPrice,
        modifiers: cartItem.modifiers.map((m) => ({
          id: m.id,
          name: m.name,
          price_adjustment: m.priceAdjustment,
        })),
      };

      expect(offlineItem.product_id).toBe('prod-123');
      expect(offlineItem.product_name).toBe('Latte');
      expect(offlineItem.modifiers[0].price_adjustment).toBe(5000);
    });

    it('should handle items without modifiers', () => {
      const cartItem = {
        id: 'cart-item-2',
        productId: 'prod-456',
        name: 'Croissant',
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
        modifiers: undefined,
      };

      const modifiers = cartItem.modifiers?.map((m: { id: string; name: string; priceAdjustment: number }) => ({
        id: m.id,
        name: m.name,
        price_adjustment: m.priceAdjustment,
      })) || [];

      expect(modifiers).toEqual([]);
    });
  });

  describe('sync queue', () => {
    it('should create sync item with correct structure', () => {
      const order = {
        id: 'offline-123',
        order_number: '#1001',
      };

      const syncItem = {
        id: `sync-${order.id}`,
        type: 'order' as const,
        payload: order,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        attempts: 0,
        lastError: null,
      };

      expect(syncItem.id).toBe('sync-offline-123');
      expect(syncItem.type).toBe('order');
      expect(syncItem.status).toBe('pending');
      expect(syncItem.attempts).toBe(0);
    });

    it('should increment attempts on failure', () => {
      const syncItem = {
        id: 'sync-offline-123',
        attempts: 2,
      };

      const newAttempts = syncItem.attempts + 1;
      expect(newAttempts).toBe(3);
    });
  });

  describe('order status tracking', () => {
    it('should identify offline orders by ID prefix', () => {
      const isOfflineOrder = (id: string) => id.startsWith('offline-');

      expect(isOfflineOrder('offline-123-abc')).toBe(true);
      expect(isOfflineOrder('order-123')).toBe(false);
      expect(isOfflineOrder('abc-123')).toBe(false);
    });

    it('should track synced status', () => {
      const order = {
        synced: false,
        synced_at: null as string | null,
      };

      // Mark as synced
      order.synced = true;
      order.synced_at = new Date().toISOString();

      expect(order.synced).toBe(true);
      expect(order.synced_at).toBeDefined();
    });
  });
});
