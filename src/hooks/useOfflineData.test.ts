import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import {
  useOfflineProducts,
  useOfflineProductsByCategory,
  useOfflineCategories,
  useOfflineCustomers,
  useOfflineCustomerById,
  useOfflineFloorPlan,
  useOfflineSyncQueueCount,
  useOfflineSyncQueue
} from './useOfflineData';

/**
 * Test suite for useOfflineData hooks
 * @migration Uses db.ts (unified schema) instead of legacy offlineDb.ts
 */
describe('useOfflineData hooks', () => {
  beforeEach(async () => {
    await db.offline_products.clear();
    await db.offline_categories.clear();
    await db.offline_customers.clear();
    await db.offline_legacy_sync_queue.clear();
  });

  afterEach(async () => {
    await db.offline_products.clear();
    await db.offline_categories.clear();
    await db.offline_customers.clear();
    await db.offline_legacy_sync_queue.clear();
  });

  describe('useOfflineProducts', () => {
    it('should return undefined initially while loading', () => {
      const { result } = renderHook(() => useOfflineProducts());
      // useLiveQuery returns undefined while loading
      expect(result.current).toBeUndefined();
    });

    it('should return empty array when no products', async () => {
      const { result } = renderHook(() => useOfflineProducts());

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current).toEqual([]);
    });

    it('should return only active products', async () => {
      await db.offline_products.bulkAdd([
        { id: 'p1', category_id: 'c1', name: 'Active', sku: null, product_type: 'finished', retail_price: 1000, wholesale_price: null, cost_price: null, current_stock: null, is_active: true, pos_visible: true, available_for_sale: true, track_inventory: true, image_url: null, updated_at: '' },
        { id: 'p2', category_id: 'c1', name: 'Inactive', sku: null, product_type: 'finished', retail_price: 2000, wholesale_price: null, cost_price: null, current_stock: null, is_active: false, pos_visible: true, available_for_sale: true, track_inventory: true, image_url: null, updated_at: '' }
      ]);

      const { result } = renderHook(() => useOfflineProducts());

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });

      expect(result.current?.[0].name).toBe('Active');
    });

    it('should update reactively when products change', async () => {
      const { result } = renderHook(() => useOfflineProducts());

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current).toHaveLength(0);

      // Add a product
      await db.offline_products.add({
        id: 'new-p1',
        category_id: null,
        name: 'New Product',
        sku: null,
        product_type: 'finished',
        retail_price: 5000,
        wholesale_price: null,
        cost_price: null,
        current_stock: null,
        is_active: true,
        pos_visible: true,
        available_for_sale: true,
        track_inventory: true,
        image_url: null,
        updated_at: ''
      });

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });

      expect(result.current?.[0].name).toBe('New Product');
    });
  });

  describe('useOfflineProductsByCategory', () => {
    beforeEach(async () => {
      await db.offline_products.bulkAdd([
        { id: 'p1', category_id: 'cat-1', name: 'Product 1', sku: null, product_type: 'finished', retail_price: 1000, wholesale_price: null, cost_price: null, current_stock: null, is_active: true, pos_visible: true, available_for_sale: true, track_inventory: true, image_url: null, updated_at: '' },
        { id: 'p2', category_id: 'cat-1', name: 'Product 2', sku: null, product_type: 'finished', retail_price: 2000, wholesale_price: null, cost_price: null, current_stock: null, is_active: true, pos_visible: true, available_for_sale: true, track_inventory: true, image_url: null, updated_at: '' },
        { id: 'p3', category_id: 'cat-2', name: 'Product 3', sku: null, product_type: 'finished', retail_price: 3000, wholesale_price: null, cost_price: null, current_stock: null, is_active: true, pos_visible: true, available_for_sale: true, track_inventory: true, image_url: null, updated_at: '' },
        { id: 'p4', category_id: 'cat-1', name: 'Inactive', sku: null, product_type: 'finished', retail_price: 4000, wholesale_price: null, cost_price: null, current_stock: null, is_active: false, pos_visible: true, available_for_sale: true, track_inventory: true, image_url: null, updated_at: '' }
      ]);
    });

    it('should filter products by category', async () => {
      const { result } = renderHook(() => useOfflineProductsByCategory('cat-1'));

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
      });

      expect(result.current?.every(p => p.category_id === 'cat-1')).toBe(true);
    });

    it('should return all active products when categoryId is null', async () => {
      const { result } = renderHook(() => useOfflineProductsByCategory(null));

      await waitFor(() => {
        expect(result.current).toHaveLength(3);
      });
    });

    it('should update when category changes', async () => {
      const { result, rerender } = renderHook(
        ({ categoryId }) => useOfflineProductsByCategory(categoryId),
        { initialProps: { categoryId: 'cat-1' as string | null } }
      );

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
      });

      rerender({ categoryId: 'cat-2' });

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });

      expect(result.current?.[0].name).toBe('Product 3');
    });
  });

  describe('useOfflineCategories', () => {
    it('should return categories sorted by sort_order', async () => {
      await db.offline_categories.bulkAdd([
        { id: 'c3', name: 'Third', sort_order: 3, is_active: true, is_raw_material: false, dispatch_station: 'none', color: null, icon: null, updated_at: null },
        { id: 'c1', name: 'First', sort_order: 1, is_active: true, is_raw_material: false, dispatch_station: 'none', color: null, icon: null, updated_at: null },
        { id: 'c2', name: 'Second', sort_order: 2, is_active: true, is_raw_material: false, dispatch_station: 'none', color: null, icon: null, updated_at: null }
      ]);

      const { result } = renderHook(() => useOfflineCategories());

      await waitFor(() => {
        expect(result.current).toHaveLength(3);
      });

      expect(result.current?.map(c => c.name)).toEqual(['First', 'Second', 'Third']);
    });

    it('should return only active categories', async () => {
      await db.offline_categories.bulkAdd([
        { id: 'c1', name: 'Active', sort_order: 1, is_active: true, is_raw_material: false, dispatch_station: 'none', color: null, icon: null, updated_at: null },
        { id: 'c2', name: 'Inactive', sort_order: 2, is_active: false, is_raw_material: false, dispatch_station: 'none', color: null, icon: null, updated_at: null }
      ]);

      const { result } = renderHook(() => useOfflineCategories());

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });

      expect(result.current?.[0].name).toBe('Active');
    });
  });

  describe('useOfflineCustomers', () => {
    beforeEach(async () => {
      await db.offline_customers.bulkAdd([
        { id: 'cust-1', phone: '+62812345678', name: 'John', email: null, category_slug: null, loyalty_tier: null, points_balance: 100, updated_at: '' },
        { id: 'cust-2', phone: '+62812999999', name: 'Jane', email: null, category_slug: null, loyalty_tier: null, points_balance: 200, updated_at: '' },
        { id: 'cust-3', phone: '+62899000000', name: 'Bob', email: null, category_slug: null, loyalty_tier: null, points_balance: 50, updated_at: '' }
      ]);
    });

    it('should return all customers when no search', async () => {
      const { result } = renderHook(() => useOfflineCustomers());

      await waitFor(() => {
        expect(result.current).toHaveLength(3);
      });
    });

    it('should filter customers by phone prefix', async () => {
      const { result } = renderHook(() => useOfflineCustomers('+62812'));

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
      });

      expect(result.current?.map(c => c.name).sort()).toEqual(['Jane', 'John']);
    });

    it('should update when search changes', async () => {
      const { result, rerender } = renderHook(
        ({ search }) => useOfflineCustomers(search),
        { initialProps: { search: undefined as string | undefined } }
      );

      await waitFor(() => {
        expect(result.current).toHaveLength(3);
      });

      rerender({ search: '+62899' });

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });

      expect(result.current?.[0].name).toBe('Bob');
    });
  });

  describe('useOfflineCustomerById', () => {
    beforeEach(async () => {
      await db.offline_customers.add({
        id: 'cust-lookup',
        phone: '+62812345678',
        name: 'Lookup Test',
        email: 'test@example.com',
        category_slug: 'retail',
        loyalty_tier: 'Bronze',
        points_balance: 500,
        updated_at: ''
      });
    });

    it('should return customer by ID', async () => {
      const { result } = renderHook(() => useOfflineCustomerById('cust-lookup'));

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current?.name).toBe('Lookup Test');
      expect(result.current?.points_balance).toBe(500);
    });

    it('should return undefined when ID is null', async () => {
      const { result } = renderHook(() => useOfflineCustomerById(null));

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it('should return undefined when customer not found', async () => {
      const { result } = renderHook(() => useOfflineCustomerById('non-existent'));

      // Wait a bit for the query to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBeUndefined();
    });
  });

  describe('useOfflineFloorPlan', () => {
    it('should return empty array (deprecated feature)', async () => {
      const { result } = renderHook(() => useOfflineFloorPlan());

      // useOfflineFloorPlan is deprecated - returns empty array
      expect(result.current).toEqual([]);
    });
  });

  describe('useOfflineSyncQueueCount', () => {
    it('should return 0 when queue is empty', async () => {
      const { result } = renderHook(() => useOfflineSyncQueueCount());

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });

    it('should return count of pending items only', async () => {
      await db.offline_legacy_sync_queue.bulkAdd([
        { id: 's1', type: 'order', payload: {}, status: 'pending', createdAt: '', attempts: 0, lastError: null },
        { id: 's2', type: 'order', payload: {}, status: 'pending', createdAt: '', attempts: 0, lastError: null },
        { id: 's3', type: 'order', payload: {}, status: 'synced', createdAt: '', attempts: 1, lastError: null }
      ]);

      const { result } = renderHook(() => useOfflineSyncQueueCount());

      await waitFor(() => {
        expect(result.current).toBe(2);
      });
    });

    it('should update reactively when items are added', async () => {
      const { result } = renderHook(() => useOfflineSyncQueueCount());

      await waitFor(() => {
        expect(result.current).toBe(0);
      });

      await db.offline_legacy_sync_queue.add({
        id: 'new-sync',
        type: 'order',
        payload: {},
        status: 'pending',
        createdAt: '',
        attempts: 0,
        lastError: null
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });
  });

  describe('useOfflineSyncQueue', () => {
    it('should return all sync queue items', async () => {
      await db.offline_legacy_sync_queue.bulkAdd([
        { id: 's1', type: 'order', payload: {}, status: 'pending', createdAt: '', attempts: 0, lastError: null },
        { id: 's2', type: 'payment', payload: {}, status: 'synced', createdAt: '', attempts: 1, lastError: null },
        { id: 's3', type: 'stock_movement', payload: {}, status: 'failed', createdAt: '', attempts: 5, lastError: 'Error' }
      ]);

      const { result } = renderHook(() => useOfflineSyncQueue());

      await waitFor(() => {
        expect(result.current).toHaveLength(3);
      });
    });
  });
});
