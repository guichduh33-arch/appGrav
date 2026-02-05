/**
 * Orders Cache Service Tests (Story 3.1)
 *
 * Tests for offline order management including:
 * - Local ID generation with LOCAL- prefix
 * - Offline order number generation (OFFLINE-YYYYMMDD-XXX)
 * - Order and item CRUD operations
 * - Sync queue integration
 * - Transaction integrity
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/lib/db';
import {
  generateLocalOrderId,
  isLocalOrderId,
  generateOfflineOrderNumber,
  saveOfflineOrder,
  getOfflineOrders,
  getOfflineOrderById,
  getOfflineOrderByNumber,
  getOfflineOrderItems,
  getOfflineOrderWithItems,
  updateOfflineOrderStatus,
  getOfflineOrdersByStatus,
  getOfflineOrdersBySyncStatus,
  updateOfflineOrderItemStatus,
  markOrderSynced,
  markOrderConflict,
  getPendingSyncOrdersCount,
  getOfflineOrdersCount,
  clearOfflineOrders,
  deleteOfflineOrder,
  type TCreateOfflineOrderInput,
  type TCreateOfflineOrderItemInput,
} from '../ordersCacheService';
import { LOCAL_ORDER_ID_PREFIX, OFFLINE_ORDER_NUMBER_PREFIX } from '@/types/offline';

// Mock console.log to reduce test output noise
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('ordersCacheService', () => {
  // Clear database before each test
  beforeEach(async () => {
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_sync_queue.clear();
  });

  // Close database after tests
  afterEach(async () => {
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_sync_queue.clear();
  });

  // =====================================================
  // ID Generation Tests
  // =====================================================

  describe('generateLocalOrderId', () => {
    it('should return a UUID with LOCAL- prefix', () => {
      const id = generateLocalOrderId();

      expect(id).toMatch(/^LOCAL-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(id.startsWith(LOCAL_ORDER_ID_PREFIX)).toBe(true);
    });

    it('should generate unique IDs', () => {
      const id1 = generateLocalOrderId();
      const id2 = generateLocalOrderId();
      const id3 = generateLocalOrderId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('isLocalOrderId', () => {
    it('should return true for LOCAL- prefixed IDs', () => {
      expect(isLocalOrderId('LOCAL-550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isLocalOrderId(generateLocalOrderId())).toBe(true);
    });

    it('should return false for non-LOCAL- IDs', () => {
      expect(isLocalOrderId('550e8400-e29b-41d4-a716-446655440000')).toBe(false);
      expect(isLocalOrderId('server-id-123')).toBe(false);
      expect(isLocalOrderId('')).toBe(false);
    });
  });

  // =====================================================
  // Order Number Generation Tests
  // =====================================================

  describe('generateOfflineOrderNumber', () => {
    it('should generate order number in correct format', async () => {
      const orderNumber = await generateOfflineOrderNumber();

      // Format: OFFLINE-YYYYMMDD-XXX
      expect(orderNumber).toMatch(/^OFFLINE-\d{8}-\d{3}$/);
      expect(orderNumber.startsWith(OFFLINE_ORDER_NUMBER_PREFIX)).toBe(true);
    });

    it('should include current date in order number', async () => {
      const orderNumber = await generateOfflineOrderNumber();
      const today = new Date();
      const expectedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

      expect(orderNumber).toContain(expectedDate);
    });

    it('should increment sequence number for same day', async () => {
      const orderNumber1 = await generateOfflineOrderNumber();
      expect(orderNumber1).toMatch(/-001$/);

      // Save an order to increment the count
      await saveOfflineOrder(createMockOrderInput(), []);

      const orderNumber2 = await generateOfflineOrderNumber();
      expect(orderNumber2).toMatch(/-002$/);

      await saveOfflineOrder(createMockOrderInput(), []);

      const orderNumber3 = await generateOfflineOrderNumber();
      expect(orderNumber3).toMatch(/-003$/);
    });
  });

  // =====================================================
  // saveOfflineOrder Tests
  // =====================================================

  describe('saveOfflineOrder', () => {
    it('should throw error for missing user_id', async () => {
      const input = createMockOrderInput({ user_id: '' });
      await expect(saveOfflineOrder(input, [])).rejects.toThrow('Order must have a user_id');
    });

    it('should throw error for negative total', async () => {
      const input = createMockOrderInput({ total: -100 });
      await expect(saveOfflineOrder(input, [])).rejects.toThrow('Order total cannot be negative');
    });

    it('should throw error for item with zero quantity', async () => {
      const input = createMockOrderInput();
      const items = [createMockItemInput({ quantity: 0 })];
      await expect(saveOfflineOrder(input, items)).rejects.toThrow('Item quantity must be positive');
    });

    it('should throw error for item without product_id', async () => {
      const input = createMockOrderInput();
      const items = [createMockItemInput({ product_id: '' })];
      await expect(saveOfflineOrder(input, items)).rejects.toThrow('Item must have a product_id');
    });

    it('should save an order with generated ID and order number', async () => {
      const input = createMockOrderInput();
      const items = [createMockItemInput()];

      const result = await saveOfflineOrder(input, items);

      expect(result.order.id).toMatch(/^LOCAL-/);
      expect(result.order.order_number).toMatch(/^OFFLINE-/);
      expect(result.order.status).toBe(input.status);
      expect(result.order.total).toBe(input.total);
      expect(result.order.sync_status).toBe('pending_sync');
    });

    it('should set timestamps on order', async () => {
      const beforeSave = new Date().toISOString();
      const result = await saveOfflineOrder(createMockOrderInput(), []);
      const afterSave = new Date().toISOString();

      expect(result.order.created_at).toBeDefined();
      expect(result.order.updated_at).toBeDefined();
      expect(result.order.created_at >= beforeSave).toBe(true);
      expect(result.order.created_at <= afterSave).toBe(true);
    });

    it('should save order items with generated IDs', async () => {
      const items = [
        createMockItemInput({ product_name: 'Croissant' }),
        createMockItemInput({ product_name: 'Baguette' }),
      ];

      const result = await saveOfflineOrder(createMockOrderInput(), items);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBeDefined();
      expect(result.items[1].id).toBeDefined();
      expect(result.items[0].id).not.toBe(result.items[1].id);
      expect(result.items[0].order_id).toBe(result.order.id);
      expect(result.items[1].order_id).toBe(result.order.id);
    });

    it('should add entry to sync queue', async () => {
      await saveOfflineOrder(createMockOrderInput(), []);

      const queueItems = await db.offline_sync_queue.toArray();
      expect(queueItems).toHaveLength(1);
      expect(queueItems[0].entity).toBe('orders');
      expect(queueItems[0].action).toBe('create');
      expect(queueItems[0].status).toBe('pending');
    });

    it('should persist order to database', async () => {
      const result = await saveOfflineOrder(createMockOrderInput(), []);

      const savedOrder = await db.offline_orders.get(result.order.id);
      expect(savedOrder).toBeDefined();
      expect(savedOrder?.order_number).toBe(result.order.order_number);
    });

    it('should persist items to database', async () => {
      const items = [createMockItemInput(), createMockItemInput()];
      const result = await saveOfflineOrder(createMockOrderInput(), items);

      const savedItems = await db.offline_order_items
        .where('order_id')
        .equals(result.order.id)
        .toArray();
      expect(savedItems).toHaveLength(2);
    });
  });

  // =====================================================
  // Read Operations Tests
  // =====================================================

  describe('getOfflineOrders', () => {
    it('should return empty array when no orders exist', async () => {
      const orders = await getOfflineOrders();
      expect(orders).toEqual([]);
    });

    it('should return orders sorted by created_at descending', async () => {
      await saveOfflineOrder(createMockOrderInput(), []);
      await new Promise((r) => setTimeout(r, 10)); // Small delay for different timestamps
      await saveOfflineOrder(createMockOrderInput(), []);
      await new Promise((r) => setTimeout(r, 10));
      await saveOfflineOrder(createMockOrderInput(), []);

      const orders = await getOfflineOrders();
      expect(orders).toHaveLength(3);

      // Verify descending order (newest first)
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i - 1].created_at >= orders[i].created_at).toBe(true);
      }
    });
  });

  describe('getOfflineOrderById', () => {
    it('should return undefined for non-existent ID', async () => {
      const order = await getOfflineOrderById('non-existent-id');
      expect(order).toBeUndefined();
    });

    it('should return order by ID', async () => {
      const { order: savedOrder } = await saveOfflineOrder(createMockOrderInput(), []);

      const order = await getOfflineOrderById(savedOrder.id);
      expect(order).toBeDefined();
      expect(order?.id).toBe(savedOrder.id);
    });
  });

  describe('getOfflineOrderByNumber', () => {
    it('should return undefined for non-existent order number', async () => {
      const order = await getOfflineOrderByNumber('OFFLINE-99991231-999');
      expect(order).toBeUndefined();
    });

    it('should return order by order number', async () => {
      const { order: savedOrder } = await saveOfflineOrder(createMockOrderInput(), []);

      const order = await getOfflineOrderByNumber(savedOrder.order_number);
      expect(order).toBeDefined();
      expect(order?.order_number).toBe(savedOrder.order_number);
    });
  });

  describe('getOfflineOrderItems', () => {
    it('should return empty array for order with no items', async () => {
      const { order } = await saveOfflineOrder(createMockOrderInput(), []);

      const items = await getOfflineOrderItems(order.id);
      expect(items).toEqual([]);
    });

    it('should return items for order', async () => {
      const mockItems = [
        createMockItemInput({ product_name: 'Croissant' }),
        createMockItemInput({ product_name: 'Baguette' }),
      ];
      const { order } = await saveOfflineOrder(createMockOrderInput(), mockItems);

      const items = await getOfflineOrderItems(order.id);
      expect(items).toHaveLength(2);
    });

    it('should only return items for specified order', async () => {
      const { order: order1 } = await saveOfflineOrder(createMockOrderInput(), [
        createMockItemInput(),
      ]);
      const { order: order2 } = await saveOfflineOrder(createMockOrderInput(), [
        createMockItemInput(),
        createMockItemInput(),
      ]);

      const items1 = await getOfflineOrderItems(order1.id);
      const items2 = await getOfflineOrderItems(order2.id);

      expect(items1).toHaveLength(1);
      expect(items2).toHaveLength(2);
    });
  });

  describe('getOfflineOrderWithItems', () => {
    it('should return null for non-existent order', async () => {
      const result = await getOfflineOrderWithItems('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return order with items', async () => {
      const mockItems = [createMockItemInput(), createMockItemInput()];
      const { order } = await saveOfflineOrder(createMockOrderInput(), mockItems);

      const result = await getOfflineOrderWithItems(order.id);
      expect(result).not.toBeNull();
      expect(result?.order.id).toBe(order.id);
      expect(result?.items).toHaveLength(2);
    });
  });

  // =====================================================
  // Status Update Tests
  // =====================================================

  describe('updateOfflineOrderStatus', () => {
    it('should update order status', async () => {
      const { order } = await saveOfflineOrder(
        createMockOrderInput({ status: 'new' }),
        []
      );

      await updateOfflineOrderStatus(order.id, 'preparing');

      const updatedOrder = await getOfflineOrderById(order.id);
      expect(updatedOrder?.status).toBe('preparing');
    });

    it('should update updated_at timestamp', async () => {
      const { order } = await saveOfflineOrder(createMockOrderInput(), []);
      const originalUpdatedAt = order.updated_at;

      await new Promise((r) => setTimeout(r, 10)); // Ensure different timestamp
      await updateOfflineOrderStatus(order.id, 'ready');

      const updatedOrder = await getOfflineOrderById(order.id);
      expect(updatedOrder?.updated_at).not.toBe(originalUpdatedAt);
    });

    it('should add update entry to sync queue', async () => {
      const { order } = await saveOfflineOrder(createMockOrderInput(), []);

      // Clear sync queue from order creation
      await db.offline_sync_queue.clear();

      await updateOfflineOrderStatus(order.id, 'completed');

      const queueItems = await db.offline_sync_queue.toArray();
      expect(queueItems).toHaveLength(1);
      expect(queueItems[0].action).toBe('update');
    });
  });

  describe('getOfflineOrdersByStatus', () => {
    it('should filter orders by status', async () => {
      await saveOfflineOrder(createMockOrderInput({ status: 'new' }), []);
      await saveOfflineOrder(createMockOrderInput({ status: 'new' }), []);
      await saveOfflineOrder(createMockOrderInput({ status: 'completed' }), []);

      const newOrders = await getOfflineOrdersByStatus('new');
      const completedOrders = await getOfflineOrdersByStatus('completed');

      expect(newOrders).toHaveLength(2);
      expect(completedOrders).toHaveLength(1);
    });
  });

  describe('getOfflineOrdersBySyncStatus', () => {
    it('should filter orders by sync status', async () => {
      await saveOfflineOrder(createMockOrderInput(), []);
      const { order } = await saveOfflineOrder(createMockOrderInput(), []);
      await markOrderSynced(order.id, 'server-id-123');

      const pendingSync = await getOfflineOrdersBySyncStatus('pending_sync');
      const synced = await getOfflineOrdersBySyncStatus('synced');

      expect(pendingSync).toHaveLength(1);
      expect(synced).toHaveLength(1);
    });
  });

  // =====================================================
  // Item Status Tests
  // =====================================================

  describe('updateOfflineOrderItemStatus', () => {
    it('should update item status', async () => {
      const { items } = await saveOfflineOrder(createMockOrderInput(), [
        createMockItemInput({ item_status: 'new' }),
      ]);

      await updateOfflineOrderItemStatus(items[0].id, 'preparing');

      const updatedItems = await db.offline_order_items.get(items[0].id);
      expect(updatedItems?.item_status).toBe('preparing');
    });
  });

  // =====================================================
  // Sync Status Tests
  // =====================================================

  describe('markOrderSynced', () => {
    it('should update sync status and server_id', async () => {
      const { order } = await saveOfflineOrder(createMockOrderInput(), []);
      const serverId = 'server-550e8400-e29b-41d4-a716-446655440000';

      await markOrderSynced(order.id, serverId);

      const updatedOrder = await getOfflineOrderById(order.id);
      expect(updatedOrder?.sync_status).toBe('synced');
      expect(updatedOrder?.server_id).toBe(serverId);
    });
  });

  describe('markOrderConflict', () => {
    it('should update sync status to conflict', async () => {
      const { order } = await saveOfflineOrder(createMockOrderInput(), []);

      await markOrderConflict(order.id);

      const updatedOrder = await getOfflineOrderById(order.id);
      expect(updatedOrder?.sync_status).toBe('conflict');
    });
  });

  // =====================================================
  // Statistics Tests
  // =====================================================

  describe('getPendingSyncOrdersCount', () => {
    it('should return 0 when no pending orders', async () => {
      const count = await getPendingSyncOrdersCount();
      expect(count).toBe(0);
    });

    it('should count pending sync orders', async () => {
      await saveOfflineOrder(createMockOrderInput(), []);
      await saveOfflineOrder(createMockOrderInput(), []);
      const { order } = await saveOfflineOrder(createMockOrderInput(), []);
      await markOrderSynced(order.id, 'server-id');

      const count = await getPendingSyncOrdersCount();
      expect(count).toBe(2);
    });
  });

  describe('getOfflineOrdersCount', () => {
    it('should return total order count', async () => {
      await saveOfflineOrder(createMockOrderInput(), []);
      await saveOfflineOrder(createMockOrderInput(), []);

      const count = await getOfflineOrdersCount();
      expect(count).toBe(2);
    });
  });

  // =====================================================
  // Cleanup Tests
  // =====================================================

  describe('clearOfflineOrders', () => {
    it('should remove all orders and items', async () => {
      await saveOfflineOrder(createMockOrderInput(), [createMockItemInput()]);
      await saveOfflineOrder(createMockOrderInput(), [createMockItemInput()]);

      await clearOfflineOrders();

      const orders = await getOfflineOrders();
      const items = await db.offline_order_items.toArray();

      expect(orders).toHaveLength(0);
      expect(items).toHaveLength(0);
    });

    it('should not clear sync queue', async () => {
      await saveOfflineOrder(createMockOrderInput(), []);

      await clearOfflineOrders();

      const queueItems = await db.offline_sync_queue.toArray();
      expect(queueItems.length).toBeGreaterThan(0);
    });
  });

  describe('deleteOfflineOrder', () => {
    it('should delete specific order and its items', async () => {
      const { order: order1 } = await saveOfflineOrder(createMockOrderInput(), [
        createMockItemInput(),
      ]);
      const { order: order2 } = await saveOfflineOrder(createMockOrderInput(), [
        createMockItemInput(),
      ]);

      await deleteOfflineOrder(order1.id);

      const remainingOrders = await getOfflineOrders();
      const deletedOrder = await getOfflineOrderById(order1.id);
      const deletedItems = await getOfflineOrderItems(order1.id);

      expect(remainingOrders).toHaveLength(1);
      expect(remainingOrders[0].id).toBe(order2.id);
      expect(deletedOrder).toBeUndefined();
      expect(deletedItems).toHaveLength(0);
    });
  });
});

// =====================================================
// Test Helpers
// =====================================================

function createMockOrderInput(
  overrides: Partial<TCreateOfflineOrderInput> = {}
): TCreateOfflineOrderInput {
  return {
    status: 'new',
    order_type: 'dine_in',
    subtotal: 50000,
    tax_amount: 5000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    total: 55000,
    customer_id: null,
    table_number: 'T1',
    notes: null,
    user_id: 'user-123',
    session_id: 'session-123',
    ...overrides,
  };
}

function createMockItemInput(
  overrides: Partial<TCreateOfflineOrderItemInput> = {}
): TCreateOfflineOrderItemInput {
  return {
    product_id: 'product-123',
    product_name: 'Croissant',
    product_sku: 'CRO-001',
    quantity: 1,
    unit_price: 25000,
    subtotal: 25000,
    modifiers: [],
    notes: null,
    dispatch_station: 'kitchen',
    item_status: 'new',
    ...overrides,
  };
}
