/**
 * Kitchen Dispatch Service Tests (Story 3.7)
 *
 * Tests for kitchen dispatch functionality including:
 * - Station filtering
 * - Queue management
 * - Dispatch processing
 * - ACK handling
 *
 * @see _bmad-output/implementation-artifacts/3-7-kitchen-dispatch-via-lan-offline.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import {
  filterItemsByStation,
  getCategoryDispatchStation,
  addToDispatchQueue,
  dispatchOrderToKitchen,
  markStationDispatched,
  processDispatchQueue,
  updateOrderDispatchStatus,
  getPendingDispatchCount,
  getFailedDispatchCount,
  getOrderDispatchQueue,
  getRetryDelay,
} from '../kitchenDispatchService';
import type {
  IOfflineOrder,
  IOfflineOrderItem,
  IOfflineCategory,
  IOfflineProduct,
  TKitchenStation,
} from '@/types/offline';

// Mock the lanHub
vi.mock('@/services/lan/lanHub', () => ({
  lanHub: {
    isActive: vi.fn(() => false),
    broadcast: vi.fn(),
  },
}));

// Mock the lanStore
vi.mock('@/stores/lanStore', () => ({
  useLanStore: {
    getState: () => ({
      connectionStatus: 'disconnected',
    }),
  },
}));

// Import mocked modules
import { lanHub } from '@/services/lan/lanHub';

// Helper to create a mock order
function createMockOrder(overrides?: Partial<IOfflineOrder>): IOfflineOrder {
  const now = new Date().toISOString();
  return {
    id: `LOCAL-${crypto.randomUUID()}`,
    order_number: `OFFLINE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
    status: 'new',
    order_type: 'dine_in',
    subtotal: 100000,
    tax_amount: 9091,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    total: 100000,
    customer_id: null,
    table_number: '5',
    notes: null,
    user_id: 'user-123',
    session_id: 'session-123',
    created_at: now,
    updated_at: now,
    guest_count: null,
    sync_status: 'local',
    ...overrides,
  };
}

// Helper to create mock order items
function createMockOrderItem(
  orderId: string,
  productId: string,
  overrides?: Partial<IOfflineOrderItem>
): IOfflineOrderItem {
  return {
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: productId,
    product_name: 'Test Product',
    product_sku: 'SKU-001',
    quantity: 1,
    unit_price: 25000,
    subtotal: 25000,
    modifiers: [],
    notes: null,
    dispatch_station: 'kitchen',
    item_status: 'new',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// Helper to create mock category
function createMockCategory(
  station: TKitchenStation,
  overrides?: Partial<IOfflineCategory>
): IOfflineCategory {
  return {
    id: crypto.randomUUID(),
    name: 'Test Category',
    icon: null,
    color: null,
    sort_order: 0,
    dispatch_station: station,
    is_active: true,
    is_raw_material: false,
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// Helper to create mock product
function createMockProduct(
  categoryId: string,
  overrides?: Partial<IOfflineProduct>
): IOfflineProduct {
  return {
    id: crypto.randomUUID(),
    category_id: categoryId,
    sku: 'SKU-001',
    name: 'Test Product',
    product_type: 'finished',
    retail_price: 25000,
    wholesale_price: null,
    cost_price: null,
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('kitchenDispatchService', () => {
  beforeEach(async () => {
    // Clear test data
    await db.offline_dispatch_queue.clear();
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_categories.clear();
    await db.offline_products.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up after tests
    await db.offline_dispatch_queue.clear();
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_categories.clear();
    await db.offline_products.clear();
  });

  describe('getCategoryDispatchStation', () => {
    it('should return dispatch station for a category', async () => {
      const category = createMockCategory('kitchen');
      await db.offline_categories.add(category);

      const station = await getCategoryDispatchStation(category.id);
      expect(station).toBe('kitchen');
    });

    it('should return "none" for unknown category', async () => {
      const station = await getCategoryDispatchStation('non-existent-id');
      expect(station).toBe('none');
    });

    it('should return "none" for null category id', async () => {
      const station = await getCategoryDispatchStation(null);
      expect(station).toBe('none');
    });
  });

  describe('filterItemsByStation', () => {
    it('should filter items by kitchen station', async () => {
      // Create categories
      const kitchenCategory = createMockCategory('kitchen');
      const baristaCategory = createMockCategory('barista');
      await db.offline_categories.bulkAdd([kitchenCategory, baristaCategory]);

      // Create products
      const kitchenProduct = createMockProduct(kitchenCategory.id);
      const baristaProduct = createMockProduct(baristaCategory.id);
      await db.offline_products.bulkAdd([kitchenProduct, baristaProduct]);

      // Create order items
      const order = createMockOrder();
      const kitchenItem = createMockOrderItem(order.id, kitchenProduct.id);
      const baristaItem = createMockOrderItem(order.id, baristaProduct.id);

      // Filter for kitchen
      const kitchenItems = await filterItemsByStation([kitchenItem, baristaItem], 'kitchen');
      expect(kitchenItems).toHaveLength(1);
      expect(kitchenItems[0].product_id).toBe(kitchenProduct.id);
    });

    it('should return empty array if no items for station', async () => {
      const category = createMockCategory('barista');
      await db.offline_categories.add(category);

      const product = createMockProduct(category.id);
      await db.offline_products.add(product);

      const order = createMockOrder();
      const item = createMockOrderItem(order.id, product.id);

      const kitchenItems = await filterItemsByStation([item], 'kitchen');
      expect(kitchenItems).toHaveLength(0);
    });

    it('should return empty array for empty items', async () => {
      const items = await filterItemsByStation([], 'kitchen');
      expect(items).toHaveLength(0);
    });
  });

  describe('addToDispatchQueue', () => {
    it('should add item to dispatch queue', async () => {
      const order = createMockOrder();
      await db.offline_orders.add(order);

      const category = createMockCategory('kitchen');
      await db.offline_categories.add(category);

      const product = createMockProduct(category.id);
      await db.offline_products.add(product);

      const item = createMockOrderItem(order.id, product.id);
      await db.offline_order_items.add(item);

      const queueItem = await addToDispatchQueue(order, 'kitchen', [item]);

      expect(queueItem).toBeDefined();
      expect(queueItem.id).toBeDefined();
      expect(queueItem.order_id).toBe(order.id);
      expect(queueItem.station).toBe('kitchen');
      expect(queueItem.status).toBe('pending');
      expect(queueItem.attempts).toBe(0);
    });

    it('should store items in correct format', async () => {
      const order = createMockOrder();
      await db.offline_orders.add(order);

      const item = createMockOrderItem(order.id, 'product-1', {
        product_name: 'Test Coffee',
        quantity: 2,
        modifiers: [
          { option_id: 'mod-1', group_name: 'Size', option_label: 'Large', price_adjustment: 5000 },
        ],
        notes: 'Extra hot',
      });

      const queueItem = await addToDispatchQueue(order, 'barista', [item]);

      expect(queueItem.items).toHaveLength(1);
      expect(queueItem.items[0].name).toBe('Test Coffee');
      expect(queueItem.items[0].quantity).toBe(2);
      expect(queueItem.items[0].modifiers).toContain('Large');
      expect(queueItem.items[0].notes).toBe('Extra hot');
    });
  });

  describe('dispatchOrderToKitchen', () => {
    it('should queue items when LAN is disconnected', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(false);

      // Setup categories and products
      const kitchenCategory = createMockCategory('kitchen');
      await db.offline_categories.add(kitchenCategory);

      const product = createMockProduct(kitchenCategory.id);
      await db.offline_products.add(product);

      const order = createMockOrder();
      await db.offline_orders.add(order);

      const item = createMockOrderItem(order.id, product.id);

      const result = await dispatchOrderToKitchen(order, [item]);

      expect(result.dispatched).toHaveLength(0);
      expect(result.queued).toContain('kitchen');

      const pendingCount = await getPendingDispatchCount();
      expect(pendingCount).toBe(1);
    });

    it('should dispatch when LAN is connected', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(true);
      vi.mocked(lanHub.broadcast).mockResolvedValue(undefined);

      // Setup categories and products
      const kitchenCategory = createMockCategory('kitchen');
      await db.offline_categories.add(kitchenCategory);

      const product = createMockProduct(kitchenCategory.id);
      await db.offline_products.add(product);

      const order = createMockOrder();
      await db.offline_orders.add(order);

      const item = createMockOrderItem(order.id, product.id);

      const result = await dispatchOrderToKitchen(order, [item]);

      expect(result.dispatched).toContain('kitchen');
      expect(result.queued).toHaveLength(0);
      expect(lanHub.broadcast).toHaveBeenCalled();
    });

    it('should skip stations with no items', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(true);

      // Only barista category, no kitchen items
      const baristaCategory = createMockCategory('barista');
      await db.offline_categories.add(baristaCategory);

      const product = createMockProduct(baristaCategory.id);
      await db.offline_products.add(product);

      const order = createMockOrder();
      await db.offline_orders.add(order);

      const item = createMockOrderItem(order.id, product.id);

      const result = await dispatchOrderToKitchen(order, [item]);

      // Kitchen station should not be dispatched (no items)
      expect(result.dispatched.includes('kitchen')).toBe(false);
      // Barista should be dispatched
      expect(result.dispatched).toContain('barista');
    });

    it('should queue on broadcast error', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(true);
      vi.mocked(lanHub.broadcast).mockRejectedValue(new Error('Network error'));

      const kitchenCategory = createMockCategory('kitchen');
      await db.offline_categories.add(kitchenCategory);

      const product = createMockProduct(kitchenCategory.id);
      await db.offline_products.add(product);

      const order = createMockOrder();
      await db.offline_orders.add(order);

      const item = createMockOrderItem(order.id, product.id);

      const result = await dispatchOrderToKitchen(order, [item]);

      expect(result.dispatched).toHaveLength(0);
      expect(result.queued).toContain('kitchen');
    });
  });

  describe('markStationDispatched', () => {
    it('should remove item from queue', async () => {
      const order = createMockOrder();
      await db.offline_orders.add(order);

      // Add to queue
      await db.offline_dispatch_queue.add({
        order_id: order.id,
        station: 'kitchen',
        items: [],
        created_at: new Date().toISOString(),
        attempts: 0,
        last_error: null,
        last_attempt_at: null,
        status: 'pending',
      });

      expect(await getPendingDispatchCount()).toBe(1);

      await markStationDispatched(order.id, 'kitchen');

      expect(await getPendingDispatchCount()).toBe(0);
    });

    it('should update order status when all stations done', async () => {
      const order = createMockOrder({ dispatch_status: 'pending' });
      await db.offline_orders.add(order);

      // Add only one station to queue
      await db.offline_dispatch_queue.add({
        order_id: order.id,
        station: 'kitchen',
        items: [],
        created_at: new Date().toISOString(),
        attempts: 0,
        last_error: null,
        last_attempt_at: null,
        status: 'pending',
      });

      await markStationDispatched(order.id, 'kitchen');

      const updatedOrder = await db.offline_orders.get(order.id);
      expect(updatedOrder?.dispatch_status).toBe('dispatched');
      expect(updatedOrder?.dispatched_at).toBeDefined();
    });

    it('should not update order status if other stations pending', async () => {
      const order = createMockOrder({ dispatch_status: 'pending' });
      await db.offline_orders.add(order);

      // Add two stations to queue
      await db.offline_dispatch_queue.bulkAdd([
        {
          order_id: order.id,
          station: 'kitchen',
          items: [],
          created_at: new Date().toISOString(),
          attempts: 0,
          last_error: null,
          last_attempt_at: null,
          status: 'pending',
        },
        {
          order_id: order.id,
          station: 'barista',
          items: [],
          created_at: new Date().toISOString(),
          attempts: 0,
          last_error: null,
          last_attempt_at: null,
          status: 'pending',
        },
      ]);

      await markStationDispatched(order.id, 'kitchen');

      // Still one station pending
      expect(await getPendingDispatchCount()).toBe(1);

      // Order should still be pending
      const updatedOrder = await db.offline_orders.get(order.id);
      expect(updatedOrder?.dispatch_status).toBe('pending');
    });
  });

  describe('processDispatchQueue', () => {
    it('should not process when LAN disconnected', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(false);

      const order = createMockOrder();
      await db.offline_orders.add(order);

      await db.offline_dispatch_queue.add({
        order_id: order.id,
        station: 'kitchen',
        items: [],
        created_at: new Date().toISOString(),
        attempts: 0,
        last_error: null,
        last_attempt_at: null,
        status: 'pending',
      });

      const result = await processDispatchQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
      expect(await getPendingDispatchCount()).toBe(1);
    });

    it('should process pending items when LAN connected', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(true);
      vi.mocked(lanHub.broadcast).mockResolvedValue(undefined);

      const order = createMockOrder();
      await db.offline_orders.add(order);

      await db.offline_dispatch_queue.add({
        order_id: order.id,
        station: 'kitchen',
        items: [{ id: '1', product_id: 'p1', name: 'Item', quantity: 1, modifiers: [], notes: null, category_id: 'c1' }],
        created_at: new Date().toISOString(),
        attempts: 0,
        last_error: null,
        last_attempt_at: null,
        status: 'pending',
      });

      const result = await processDispatchQueue();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(await getPendingDispatchCount()).toBe(0);
    });

    it('should remove items for non-existent orders', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(true);

      // Add queue item for order that doesn't exist
      await db.offline_dispatch_queue.add({
        order_id: 'non-existent-order',
        station: 'kitchen',
        items: [],
        created_at: new Date().toISOString(),
        attempts: 0,
        last_error: null,
        last_attempt_at: null,
        status: 'pending',
      });

      await processDispatchQueue();

      expect(await getPendingDispatchCount()).toBe(0);
    });

    it('should mark as failed after max retries', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(true);
      vi.mocked(lanHub.broadcast).mockRejectedValue(new Error('Network error'));

      const order = createMockOrder();
      await db.offline_orders.add(order);

      // Add item already at max attempts - 1
      await db.offline_dispatch_queue.add({
        order_id: order.id,
        station: 'kitchen',
        items: [],
        created_at: new Date().toISOString(),
        attempts: 2, // Will become 3 after this attempt
        last_error: null,
        last_attempt_at: null,
        status: 'pending',
      });

      const result = await processDispatchQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);

      // Check item is marked as failed
      const failedCount = await getFailedDispatchCount();
      expect(failedCount).toBe(1);

      // Check order status updated
      const updatedOrder = await db.offline_orders.get(order.id);
      expect(updatedOrder?.dispatch_status).toBe('failed');
    });

    it('should increment attempts on retry', async () => {
      vi.mocked(lanHub.isActive).mockReturnValue(true);
      vi.mocked(lanHub.broadcast).mockRejectedValue(new Error('Network error'));

      const order = createMockOrder();
      await db.offline_orders.add(order);

      const queueId = await db.offline_dispatch_queue.add({
        order_id: order.id,
        station: 'kitchen',
        items: [],
        created_at: new Date().toISOString(),
        attempts: 0,
        last_error: null,
        last_attempt_at: null,
        status: 'pending',
      });

      await processDispatchQueue();

      const item = await db.offline_dispatch_queue.get(queueId);
      expect(item?.attempts).toBe(1);
      expect(item?.last_error).toBe('Network error');
      expect(item?.status).toBe('pending'); // Still pending for retry
    });
  });

  describe('updateOrderDispatchStatus', () => {
    it('should update order dispatch status', async () => {
      const order = createMockOrder();
      await db.offline_orders.add(order);

      const now = new Date().toISOString();
      await updateOrderDispatchStatus(order.id, 'dispatched', now);

      const updated = await db.offline_orders.get(order.id);
      expect(updated?.dispatch_status).toBe('dispatched');
      expect(updated?.dispatched_at).toBe(now);
    });

    it('should update dispatch error', async () => {
      const order = createMockOrder();
      await db.offline_orders.add(order);

      await updateOrderDispatchStatus(order.id, 'failed', null, 'LAN unavailable');

      const updated = await db.offline_orders.get(order.id);
      expect(updated?.dispatch_status).toBe('failed');
      expect(updated?.dispatch_error).toBe('LAN unavailable');
    });
  });

  describe('getOrderDispatchQueue', () => {
    it('should return queue items for order', async () => {
      const order1 = createMockOrder();
      const order2 = createMockOrder();

      await db.offline_dispatch_queue.bulkAdd([
        {
          order_id: order1.id,
          station: 'kitchen',
          items: [],
          created_at: new Date().toISOString(),
          attempts: 0,
          last_error: null,
          last_attempt_at: null,
          status: 'pending',
        },
        {
          order_id: order1.id,
          station: 'barista',
          items: [],
          created_at: new Date().toISOString(),
          attempts: 0,
          last_error: null,
          last_attempt_at: null,
          status: 'pending',
        },
        {
          order_id: order2.id,
          station: 'kitchen',
          items: [],
          created_at: new Date().toISOString(),
          attempts: 0,
          last_error: null,
          last_attempt_at: null,
          status: 'pending',
        },
      ]);

      const queue1 = await getOrderDispatchQueue(order1.id);
      expect(queue1).toHaveLength(2);

      const queue2 = await getOrderDispatchQueue(order2.id);
      expect(queue2).toHaveLength(1);
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate exponential backoff', () => {
      // Base is 2000ms
      expect(getRetryDelay(0)).toBe(2000); // 2s
      expect(getRetryDelay(1)).toBe(4000); // 4s
      expect(getRetryDelay(2)).toBe(8000); // 8s
      expect(getRetryDelay(3)).toBe(16000); // 16s
    });
  });
});
