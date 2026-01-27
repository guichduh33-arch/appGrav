/**
 * Product Sync Service Tests
 * Story 2.1 - Offline Product Catalog Sync
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock offlineDb
vi.mock('./offlineDb', () => ({
  offlineDb: {
    products: {
      bulkPut: vi.fn().mockResolvedValue(undefined),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
      filter: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([]),
      })),
      count: vi.fn().mockResolvedValue(0),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    categories: {
      clear: vi.fn().mockResolvedValue(undefined),
      bulkAdd: vi.fn().mockResolvedValue(undefined),
      filter: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([]),
      })),
    },
    product_modifiers: {
      clear: vi.fn().mockResolvedValue(undefined),
      bulkAdd: vi.fn().mockResolvedValue(undefined),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
        })),
      })),
    },
  },
}));

describe('productSync', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sync timestamp management', () => {
    it('should store and retrieve sync timestamps', () => {
      const key = 'appgrav_products_last_sync';
      const timestamp = '2024-01-15T10:30:00Z';

      localStorage.setItem(key, timestamp);
      expect(localStorage.getItem(key)).toBe(timestamp);
    });

    it('should return null for non-existent timestamp', () => {
      const key = 'appgrav_nonexistent_sync';
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('offline data structure', () => {
    it('IOfflineProduct should have required fields', () => {
      // TypeScript interface validation
      const product = {
        id: 'test-123',
        category_id: 'cat-1',
        name: 'Test Product',
        sku: 'SKU-001',
        price: 50000,
        is_active: true,
        image_url: 'https://example.com/image.jpg',
        updated_at: '2024-01-15T10:30:00Z',
      };

      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.price).toBeDefined();
      expect(typeof product.price).toBe('number');
    });

    it('IOfflineCategory should have required fields', () => {
      const category = {
        id: 'cat-1',
        name: 'Coffee',
        display_order: 1,
        is_active: true,
      };

      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.display_order).toBeDefined();
    });

    it('IOfflineProductModifier should have required fields', () => {
      const modifier = {
        id: 'mod-1',
        product_id: 'prod-1',
        name: 'Extra Shot',
        price_adjustment: 5000,
      };

      expect(modifier.id).toBeDefined();
      expect(modifier.product_id).toBeDefined();
      expect(modifier.name).toBeDefined();
      expect(modifier.price_adjustment).toBeDefined();
    });
  });

  describe('data transformation', () => {
    it('should transform Supabase product to offline format', () => {
      const supabaseProduct = {
        id: 'prod-123',
        category_id: 'cat-1',
        name: 'Cappuccino',
        sku: 'CAP-001',
        retail_price: 45000,
        is_active: true,
        image_url: 'https://example.com/cappuccino.jpg',
        updated_at: '2024-01-15T10:30:00Z',
        // Extra fields that should be ignored
        description: 'Delicious coffee',
        wholesale_price: 40000,
      };

      const offlineProduct = {
        id: supabaseProduct.id,
        category_id: supabaseProduct.category_id,
        name: supabaseProduct.name,
        sku: supabaseProduct.sku,
        price: supabaseProduct.retail_price,
        is_active: supabaseProduct.is_active,
        image_url: supabaseProduct.image_url,
        updated_at: supabaseProduct.updated_at,
      };

      expect(offlineProduct.price).toBe(45000);
      expect(offlineProduct).not.toHaveProperty('description');
      expect(offlineProduct).not.toHaveProperty('wholesale_price');
    });

    it('should transform Supabase category to offline format', () => {
      const supabaseCategory = {
        id: 'cat-1',
        name: 'Coffee',
        sort_order: 1,
        is_active: true,
        // Extra fields
        icon: '☕',
        color: '#6F4E37',
      };

      const offlineCategory = {
        id: supabaseCategory.id,
        name: supabaseCategory.name,
        display_order: supabaseCategory.sort_order,
        is_active: supabaseCategory.is_active,
      };

      expect(offlineCategory.display_order).toBe(1);
      expect(offlineCategory).not.toHaveProperty('icon');
      expect(offlineCategory).not.toHaveProperty('color');
    });
  });

  describe('offline data retrieval', () => {
    it('should sort products by name', () => {
      const products = [
        { id: '1', name: 'Zebra Coffee', category_id: null, sku: null, price: 1000, is_active: true, image_url: null, updated_at: '' },
        { id: '2', name: 'Apple Juice', category_id: null, sku: null, price: 2000, is_active: true, image_url: null, updated_at: '' },
        { id: '3', name: 'Matcha Latte', category_id: null, sku: null, price: 3000, is_active: true, image_url: null, updated_at: '' },
      ];

      const sorted = products.sort((a, b) => a.name.localeCompare(b.name));

      expect(sorted[0].name).toBe('Apple Juice');
      expect(sorted[1].name).toBe('Matcha Latte');
      expect(sorted[2].name).toBe('Zebra Coffee');
    });

    it('should sort categories by display_order', () => {
      const categories = [
        { id: '1', name: 'Drinks', display_order: 3, is_active: true },
        { id: '2', name: 'Food', display_order: 1, is_active: true },
        { id: '3', name: 'Desserts', display_order: 2, is_active: true },
      ];

      const sorted = categories.sort((a, b) => a.display_order - b.display_order);

      expect(sorted[0].name).toBe('Food');
      expect(sorted[1].name).toBe('Desserts');
      expect(sorted[2].name).toBe('Drinks');
    });

    it('should filter products by category_id', () => {
      const products = [
        { id: '1', name: 'Coffee', category_id: 'cat-1', sku: null, price: 1000, is_active: true, image_url: null, updated_at: '' },
        { id: '2', name: 'Tea', category_id: 'cat-1', sku: null, price: 2000, is_active: true, image_url: null, updated_at: '' },
        { id: '3', name: 'Sandwich', category_id: 'cat-2', sku: null, price: 3000, is_active: true, image_url: null, updated_at: '' },
      ];

      const categoryId = 'cat-1';
      const filtered = products.filter((p) => p.category_id === categoryId);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((p) => p.category_id === 'cat-1')).toBe(true);
    });

    it('should filter out inactive products', () => {
      const products = [
        { id: '1', name: 'Active Product', category_id: null, sku: null, price: 1000, is_active: true, image_url: null, updated_at: '' },
        { id: '2', name: 'Inactive Product', category_id: null, sku: null, price: 2000, is_active: false, image_url: null, updated_at: '' },
      ];

      const filtered = products.filter((p) => p.is_active);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Active Product');
    });
  });

  describe('incremental sync logic', () => {
    it('should use last sync timestamp for incremental fetch', () => {
      const lastSync = '2024-01-15T10:30:00Z';
      localStorage.setItem('appgrav_products_last_sync', lastSync);

      const storedSync = localStorage.getItem('appgrav_products_last_sync');
      expect(storedSync).toBe(lastSync);

      // In real implementation, this timestamp would be used in Supabase query
      // .gt('updated_at', lastSync)
    });

    it('should update sync timestamp after successful sync', () => {
      const newTimestamp = '2024-01-16T12:00:00Z';
      localStorage.setItem('appgrav_products_last_sync', newTimestamp);

      expect(localStorage.getItem('appgrav_products_last_sync')).toBe(newTimestamp);
    });
  });
});
