import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  offlineDb,
  AppGravOfflineDb,
  IOfflineProduct,
  IOfflineCategory,
  IOfflineProductModifier,
  IOfflineCustomer,
  IOfflineFloorPlanItem,
  ISyncQueueItem
} from './offlineDb';

describe('offlineDb', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await offlineDb.products.clear();
    await offlineDb.categories.clear();
    await offlineDb.product_modifiers.clear();
    await offlineDb.customers.clear();
    await offlineDb.floor_plan_items.clear();
    await offlineDb.sync_queue.clear();
  });

  afterEach(async () => {
    // Clean up after tests
    await offlineDb.products.clear();
    await offlineDb.categories.clear();
    await offlineDb.product_modifiers.clear();
    await offlineDb.customers.clear();
    await offlineDb.floor_plan_items.clear();
    await offlineDb.sync_queue.clear();
  });

  describe('Database initialization', () => {
    it('should be an instance of AppGravOfflineDb', () => {
      expect(offlineDb).toBeInstanceOf(AppGravOfflineDb);
    });

    it('should have database name AppGravOffline', () => {
      expect(offlineDb.name).toBe('AppGravOffline');
    });

    it('should have all required tables', () => {
      expect(offlineDb.tables.map(t => t.name).sort()).toEqual([
        'categories',
        'customers',
        'floor_plan_items',
        'product_modifiers',
        'products',
        'sync_queue'
      ]);
    });
  });

  describe('products table', () => {
    const sampleProduct: IOfflineProduct = {
      id: 'prod-1',
      category_id: 'cat-1',
      name: 'Croissant',
      sku: 'CRO-001',
      price: 15000,
      is_active: true,
      image_url: null,
      updated_at: '2026-01-27T10:00:00.000Z'
    };

    it('should add a product', async () => {
      await offlineDb.products.add(sampleProduct);
      const result = await offlineDb.products.get('prod-1');
      expect(result).toEqual(sampleProduct);
    });

    it('should update a product', async () => {
      await offlineDb.products.add(sampleProduct);
      await offlineDb.products.update('prod-1', { price: 18000 });
      const result = await offlineDb.products.get('prod-1');
      expect(result?.price).toBe(18000);
    });

    it('should delete a product', async () => {
      await offlineDb.products.add(sampleProduct);
      await offlineDb.products.delete('prod-1');
      const result = await offlineDb.products.get('prod-1');
      expect(result).toBeUndefined();
    });

    it('should query products by category_id', async () => {
      await offlineDb.products.bulkAdd([
        sampleProduct,
        { ...sampleProduct, id: 'prod-2', name: 'Pain au chocolat' },
        { ...sampleProduct, id: 'prod-3', category_id: 'cat-2', name: 'Baguette' }
      ]);

      const catProducts = await offlineDb.products
        .where('category_id')
        .equals('cat-1')
        .toArray();

      expect(catProducts).toHaveLength(2);
      expect(catProducts.map(p => p.name).sort()).toEqual(['Croissant', 'Pain au chocolat']);
    });

    it('should query products by name', async () => {
      await offlineDb.products.bulkAdd([
        sampleProduct,
        { ...sampleProduct, id: 'prod-2', name: 'Pain au chocolat' }
      ]);

      const result = await offlineDb.products
        .where('name')
        .equals('Croissant')
        .first();

      expect(result?.id).toBe('prod-1');
    });
  });

  describe('categories table', () => {
    const sampleCategory: IOfflineCategory = {
      id: 'cat-1',
      name: 'Viennoiseries',
      display_order: 1,
      is_active: true
    };

    it('should add a category', async () => {
      await offlineDb.categories.add(sampleCategory);
      const result = await offlineDb.categories.get('cat-1');
      expect(result).toEqual(sampleCategory);
    });

    it('should query categories by name', async () => {
      await offlineDb.categories.add(sampleCategory);
      const result = await offlineDb.categories
        .where('name')
        .equals('Viennoiseries')
        .first();
      expect(result?.id).toBe('cat-1');
    });
  });

  describe('product_modifiers table', () => {
    const sampleModifier: IOfflineProductModifier = {
      id: 'mod-1',
      product_id: 'prod-1',
      name: 'Extra butter',
      price_adjustment: 2000
    };

    it('should add a modifier', async () => {
      await offlineDb.product_modifiers.add(sampleModifier);
      const result = await offlineDb.product_modifiers.get('mod-1');
      expect(result).toEqual(sampleModifier);
    });

    it('should query modifiers by product_id', async () => {
      await offlineDb.product_modifiers.bulkAdd([
        sampleModifier,
        { ...sampleModifier, id: 'mod-2', name: 'Gluten free' },
        { ...sampleModifier, id: 'mod-3', product_id: 'prod-2', name: 'Size L' }
      ]);

      const prodModifiers = await offlineDb.product_modifiers
        .where('product_id')
        .equals('prod-1')
        .toArray();

      expect(prodModifiers).toHaveLength(2);
    });
  });

  describe('customers table', () => {
    const sampleCustomer: IOfflineCustomer = {
      id: 'cust-1',
      phone: '+62812345678',
      name: 'John Doe',
      email: 'john@example.com',
      loyalty_points: 150,
      customer_category_slug: 'retail',
      updated_at: '2026-01-27T10:00:00.000Z'
    };

    it('should add a customer', async () => {
      await offlineDb.customers.add(sampleCustomer);
      const result = await offlineDb.customers.get('cust-1');
      expect(result).toEqual(sampleCustomer);
    });

    it('should query customers by phone prefix', async () => {
      await offlineDb.customers.bulkAdd([
        sampleCustomer,
        { ...sampleCustomer, id: 'cust-2', phone: '+62812999999', name: 'Jane Doe' },
        { ...sampleCustomer, id: 'cust-3', phone: '+62899000000', name: 'Bob Smith' }
      ]);

      const results = await offlineDb.customers
        .where('phone')
        .startsWith('+62812')
        .toArray();

      expect(results).toHaveLength(2);
    });

    it('should query customers by name', async () => {
      await offlineDb.customers.add(sampleCustomer);
      const result = await offlineDb.customers
        .where('name')
        .equals('John Doe')
        .first();
      expect(result?.id).toBe('cust-1');
    });
  });

  describe('floor_plan_items table', () => {
    const sampleFloorPlan: IOfflineFloorPlanItem = {
      id: 'floor-1',
      table_number: 1,
      label: 'Table 1',
      capacity: 4,
      position_x: 100,
      position_y: 200
    };

    it('should add a floor plan item', async () => {
      await offlineDb.floor_plan_items.add(sampleFloorPlan);
      const result = await offlineDb.floor_plan_items.get('floor-1');
      expect(result).toEqual(sampleFloorPlan);
    });

    it('should query by table_number', async () => {
      await offlineDb.floor_plan_items.bulkAdd([
        sampleFloorPlan,
        { ...sampleFloorPlan, id: 'floor-2', table_number: 2, label: 'Table 2' }
      ]);

      const result = await offlineDb.floor_plan_items
        .where('table_number')
        .equals(1)
        .first();

      expect(result?.label).toBe('Table 1');
    });
  });

  describe('sync_queue table', () => {
    const sampleSyncItem: ISyncQueueItem = {
      id: 'sync-1',
      type: 'order',
      payload: { orderId: 'ord-1', items: [] },
      status: 'pending',
      createdAt: '2026-01-27T10:00:00.000Z',
      attempts: 0,
      lastError: null
    };

    it('should add a sync queue item', async () => {
      await offlineDb.sync_queue.add(sampleSyncItem);
      const result = await offlineDb.sync_queue.get('sync-1');
      expect(result).toEqual(sampleSyncItem);
    });

    it('should query by type', async () => {
      await offlineDb.sync_queue.bulkAdd([
        sampleSyncItem,
        { ...sampleSyncItem, id: 'sync-2', type: 'payment' },
        { ...sampleSyncItem, id: 'sync-3', type: 'order' }
      ]);

      const orderItems = await offlineDb.sync_queue
        .where('type')
        .equals('order')
        .toArray();

      expect(orderItems).toHaveLength(2);
    });

    it('should query by status', async () => {
      await offlineDb.sync_queue.bulkAdd([
        sampleSyncItem,
        { ...sampleSyncItem, id: 'sync-2', status: 'synced' },
        { ...sampleSyncItem, id: 'sync-3', status: 'pending' }
      ]);

      const pendingItems = await offlineDb.sync_queue
        .where('status')
        .equals('pending')
        .toArray();

      expect(pendingItems).toHaveLength(2);
    });

    it('should update sync queue item status', async () => {
      await offlineDb.sync_queue.add(sampleSyncItem);
      await offlineDb.sync_queue.update('sync-1', {
        status: 'syncing',
        attempts: 1
      });

      const result = await offlineDb.sync_queue.get('sync-1');
      expect(result?.status).toBe('syncing');
      expect(result?.attempts).toBe(1);
    });
  });

  describe('Schema versioning', () => {
    it('should have version 1', () => {
      expect(offlineDb.verno).toBe(1);
    });

    it('should be ready for future migrations', async () => {
      // This test documents that we can add version 2 later
      // For now, just verify the current schema works
      const product: IOfflineProduct = {
        id: 'test-prod',
        category_id: null,
        name: 'Test Product',
        sku: null,
        price: 10000,
        is_active: true,
        image_url: null,
        updated_at: new Date().toISOString()
      };

      await offlineDb.products.add(product);
      const result = await offlineDb.products.get('test-prod');
      expect(result).toBeDefined();
    });
  });
});
