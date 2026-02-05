/**
 * Products Cache Service Tests (Story 2.1)
 *
 * Tests for offline products caching functionality.
 * Uses fake-indexeddb for Dexie mocking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import {
  cacheAllProducts,
  getCachedProducts,
  getCachedProductById,
  searchCachedProducts,
  getLastProductsSyncAt,
  getProductsSyncMeta,
  getCachedProductsCount,
  shouldRefreshProducts,
  shouldRefreshProductsHourly,
  refreshProductsCacheIfNeeded,
  clearProductsCache,
} from '../productsCacheService';
import type { IOfflineProduct } from '@/types/offline';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

// Sample product data
const mockProducts: IOfflineProduct[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    sku: 'SKU001',
    name: 'Croissant',
    product_type: 'finished',
    retail_price: 15000,
    wholesale_price: 12000,
    cost_price: 8000,
    current_stock: null,
    image_url: 'https://example.com/croissant.jpg',
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'prod-2',
    category_id: 'cat-1',
    sku: 'SKU002',
    name: 'Pain au Chocolat',
    product_type: 'finished',
    retail_price: 18000,
    wholesale_price: 14000,
    cost_price: 9000,
    current_stock: null,
    image_url: 'https://example.com/pain-choco.jpg',
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'prod-3',
    category_id: 'cat-2',
    sku: 'SKU003',
    name: 'Baguette',
    product_type: 'finished',
    retail_price: 12000,
    wholesale_price: 10000,
    cost_price: 6000,
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'prod-4',
    category_id: 'cat-1',
    sku: 'SKU004',
    name: 'Inactive Product',
    product_type: 'finished',
    retail_price: 10000,
    wholesale_price: 8000,
    cost_price: 5000,
    current_stock: null,
    image_url: null,
    is_active: false,
    pos_visible: true,
    available_for_sale: true,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'prod-5',
    category_id: 'cat-1',
    sku: 'SKU005',
    name: 'Non-POS Product',
    product_type: 'raw_material',
    retail_price: 5000,
    wholesale_price: 4000,
    cost_price: 3000,
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: false,
    available_for_sale: true,
    updated_at: '2026-01-30T10:00:00Z',
  },
];

// Setup mock Supabase response
function setupSupabaseMock(products: IOfflineProduct[] = mockProducts) {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  };

  // Final call returns data
  mockChain.eq.mockResolvedValue({ data: products, error: null });

  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);
  return mockChain;
}

describe('productsCacheService', () => {
  beforeEach(async () => {
    // Clear all Dexie tables before each test
    await db.offline_products.clear();
    await db.offline_sync_meta.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // =====================================================
  // cacheAllProducts Tests
  // =====================================================

  describe('cacheAllProducts', () => {
    it('should fetch products from Supabase and store in Dexie', async () => {
      setupSupabaseMock();

      await cacheAllProducts();

      const cachedProducts = await db.offline_products.toArray();
      expect(cachedProducts).toHaveLength(mockProducts.length);
      expect(cachedProducts[0].name).toBe('Croissant');
    });

    it('should update sync metadata after caching', async () => {
      setupSupabaseMock();

      await cacheAllProducts();

      const meta = await db.offline_sync_meta.get('products');
      expect(meta).toBeDefined();
      expect(meta?.entity).toBe('products');
      expect(meta?.recordCount).toBe(mockProducts.length);
      expect(meta?.lastSyncAt).toBeDefined();
    });

    it('should clear existing cache before adding new products', async () => {
      // Pre-populate with old data
      await db.offline_products.add({
        id: 'old-prod',
        category_id: 'old-cat',
        sku: 'OLD001',
        name: 'Old Product',
        product_type: 'finished',
        retail_price: 1000,
        wholesale_price: 800,
        cost_price: 500,
        current_stock: null,
        image_url: null,
        is_active: true,
        pos_visible: true,
        available_for_sale: true,
        updated_at: '2026-01-01T00:00:00Z',
      });

      setupSupabaseMock();
      await cacheAllProducts();

      const cachedProducts = await db.offline_products.toArray();
      expect(cachedProducts).toHaveLength(mockProducts.length);
      expect(cachedProducts.find((p) => p.id === 'old-prod')).toBeUndefined();
    });

    it('should throw error when Supabase query fails', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      };
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      await expect(cacheAllProducts()).rejects.toThrow(
        'Failed to fetch products: Database connection failed'
      );
    });
  });

  // =====================================================
  // getCachedProducts Tests
  // =====================================================

  describe('getCachedProducts', () => {
    beforeEach(async () => {
      // Populate cache with mock data
      await db.offline_products.bulkAdd(mockProducts);
    });

    it('should return only active, POS-visible, available products', async () => {
      const products = await getCachedProducts();

      // Should only return products where all three flags are true
      expect(products).toHaveLength(3);
      expect(products.every((p) => Boolean(p.is_active))).toBe(true);
      expect(products.every((p) => Boolean(p.pos_visible))).toBe(true);
      expect(products.every((p) => Boolean(p.available_for_sale))).toBe(true);
    });

    it('should filter by category when provided', async () => {
      const products = await getCachedProducts('cat-1');

      // cat-1 has Croissant and Pain au Chocolat (active, visible, available)
      expect(products).toHaveLength(2);
      expect(products.every((p) => p.category_id === 'cat-1')).toBe(true);
    });

    it('should return empty array when category has no products', async () => {
      const products = await getCachedProducts('cat-nonexistent');

      expect(products).toHaveLength(0);
    });

    it('should return all qualifying products when no category provided', async () => {
      const products = await getCachedProducts(null);

      expect(products).toHaveLength(3);
    });
  });

  // =====================================================
  // getCachedProductById Tests
  // =====================================================

  describe('getCachedProductById', () => {
    beforeEach(async () => {
      await db.offline_products.bulkAdd(mockProducts);
    });

    it('should return product by ID', async () => {
      const product = await getCachedProductById('prod-1');

      expect(product).toBeDefined();
      expect(product?.name).toBe('Croissant');
    });

    it('should return undefined for non-existent ID', async () => {
      const product = await getCachedProductById('nonexistent');

      expect(product).toBeUndefined();
    });
  });

  // =====================================================
  // searchCachedProducts Tests
  // =====================================================

  describe('searchCachedProducts', () => {
    beforeEach(async () => {
      await db.offline_products.bulkAdd(mockProducts);
    });

    it('should search by product name (case-insensitive)', async () => {
      const results = await searchCachedProducts('croissant');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Croissant');
    });

    it('should search by product name with uppercase', async () => {
      const results = await searchCachedProducts('PAIN');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Pain au Chocolat');
    });

    it('should search by SKU', async () => {
      const results = await searchCachedProducts('SKU003');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Baguette');
    });

    it('should search by partial SKU', async () => {
      const results = await searchCachedProducts('SKU00');

      // Should match all active, visible products with SKU00x
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should return all products for empty search', async () => {
      const results = await searchCachedProducts('');

      expect(results).toHaveLength(3); // Active, visible, available only
    });

    it('should return empty array for no matches', async () => {
      const results = await searchCachedProducts('xyz123nonexistent');

      expect(results).toHaveLength(0);
    });

    it('should only search within active, visible, available products', async () => {
      // "Inactive Product" should not appear in results
      const results = await searchCachedProducts('Inactive');

      expect(results).toHaveLength(0);
    });
  });

  // =====================================================
  // Sync Metadata Tests
  // =====================================================

  describe('sync metadata', () => {
    it('getLastProductsSyncAt should return null when no sync', async () => {
      const lastSync = await getLastProductsSyncAt();

      expect(lastSync).toBeNull();
    });

    it('getLastProductsSyncAt should return timestamp after sync', async () => {
      setupSupabaseMock();
      await cacheAllProducts();

      const lastSync = await getLastProductsSyncAt();

      expect(lastSync).toBeDefined();
      expect(new Date(lastSync!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('getProductsSyncMeta should return full metadata', async () => {
      setupSupabaseMock();
      await cacheAllProducts();

      const meta = await getProductsSyncMeta();

      expect(meta).toBeDefined();
      expect(meta?.entity).toBe('products');
      expect(meta?.recordCount).toBe(mockProducts.length);
      expect(meta?.lastSyncAt).toBeDefined();
    });

    it('getCachedProductsCount should return correct count', async () => {
      await db.offline_products.bulkAdd(mockProducts);

      const count = await getCachedProductsCount();

      expect(count).toBe(mockProducts.length);
    });
  });

  // =====================================================
  // Cache Refresh Logic Tests
  // =====================================================

  describe('cache refresh logic', () => {
    it('shouldRefreshProducts should return true when no cache exists', async () => {
      const needsRefresh = await shouldRefreshProducts();

      expect(needsRefresh).toBe(true);
    });

    it('shouldRefreshProducts should return false when cache is fresh', async () => {
      // Set recent sync metadata
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: new Date().toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshProducts();

      expect(needsRefresh).toBe(false);
    });

    it('shouldRefreshProducts should return true when cache is stale (24h)', async () => {
      // Set old sync metadata (25 hours ago)
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: oldDate.toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshProducts();

      expect(needsRefresh).toBe(true);
    });

    it('shouldRefreshProductsHourly should return true when > 1 hour', async () => {
      // Set sync metadata 2 hours ago
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: oldDate.toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshProductsHourly();

      expect(needsRefresh).toBe(true);
    });

    it('shouldRefreshProductsHourly should return false when < 1 hour', async () => {
      // Set sync metadata 30 minutes ago
      const recentDate = new Date(Date.now() - 30 * 60 * 1000);
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: recentDate.toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshProductsHourly();

      expect(needsRefresh).toBe(false);
    });

    it('refreshProductsCacheIfNeeded should skip refresh when cache is fresh', async () => {
      setupSupabaseMock();

      // Set recent sync metadata
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: new Date().toISOString(),
        recordCount: 10,
      });

      const refreshed = await refreshProductsCacheIfNeeded();

      expect(refreshed).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('refreshProductsCacheIfNeeded should refresh when forced', async () => {
      setupSupabaseMock();

      // Set recent sync metadata
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: new Date().toISOString(),
        recordCount: 10,
      });

      const refreshed = await refreshProductsCacheIfNeeded(true);

      expect(refreshed).toBe(true);
      expect(supabase.from).toHaveBeenCalled();
    });
  });

  // =====================================================
  // clearProductsCache Tests
  // =====================================================

  describe('clearProductsCache', () => {
    it('should clear all products and metadata', async () => {
      // Populate cache
      await db.offline_products.bulkAdd(mockProducts);
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: new Date().toISOString(),
        recordCount: mockProducts.length,
      });

      await clearProductsCache();

      const products = await db.offline_products.toArray();
      const meta = await db.offline_sync_meta.get('products');

      expect(products).toHaveLength(0);
      expect(meta).toBeUndefined();
    });
  });
});
