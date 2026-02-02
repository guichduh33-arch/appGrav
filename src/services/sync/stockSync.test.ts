/**
 * Stock Sync Service Tests
 * Story 5.1 - Offline Stock Levels Cache
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  syncStockLevelsToOffline,
  getStockLevelsFromOffline,
  getStockLevelByProductId,
  getLastStockSyncTime,
  hasOfflineStockData,
  getOfflineStockCount,
  clearOfflineStockData,
} from './stockSync';
import { db } from '@/lib/db';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                {
                  id: 'product-1',
                  current_stock: 50,
                  min_stock_level: 10,
                  updated_at: '2026-02-02T10:00:00Z',
                },
                {
                  id: 'product-2',
                  current_stock: 25,
                  min_stock_level: 5,
                  updated_at: '2026-02-02T09:00:00Z',
                },
                {
                  id: 'product-3',
                  current_stock: 0,
                  min_stock_level: 20,
                  updated_at: '2026-02-02T08:00:00Z',
                },
              ],
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('stockSync', () => {
  beforeEach(async () => {
    // Clear IndexedDB and localStorage before each test
    await db.offline_stock_levels.clear();
    await db.offline_sync_meta.clear();
    localStorage.removeItem('appgrav_stock_levels_last_sync');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('syncStockLevelsToOffline', () => {
    it('should sync stock levels from Supabase to IndexedDB', async () => {
      const count = await syncStockLevelsToOffline();

      expect(count).toBe(3);

      // Verify data in IndexedDB
      const stored = await db.offline_stock_levels.toArray();
      expect(stored).toHaveLength(3);

      // Check first record
      const product1 = stored.find((s) => s.product_id === 'product-1');
      expect(product1).toBeDefined();
      expect(product1?.quantity).toBe(50);
      expect(product1?.min_stock_level).toBe(10);
      expect(product1?.location_id).toBeNull(); // Single location MVP
    });

    it('should set last sync timestamp', async () => {
      await syncStockLevelsToOffline();

      const timestamp = await getLastStockSyncTime();
      expect(timestamp).toBeDefined();
      expect(new Date(timestamp!).getTime()).toBeLessThanOrEqual(Date.now());

      // Also verify it's stored in offline_sync_meta
      const meta = await db.offline_sync_meta.get('stock_levels');
      expect(meta).toBeDefined();
      expect(meta?.recordCount).toBe(3);
    });

    it('should handle zero stock correctly', async () => {
      await syncStockLevelsToOffline();

      const product3 = await getStockLevelByProductId('product-3');
      expect(product3).toBeDefined();
      expect(product3?.quantity).toBe(0);
      expect(product3?.min_stock_level).toBe(20);
    });
  });

  describe('getStockLevelsFromOffline', () => {
    beforeEach(async () => {
      // Pre-populate test data
      await db.offline_stock_levels.bulkPut([
        {
          id: 'p1',
          product_id: 'p1',
          location_id: null,
          quantity: 100,
          min_stock_level: 10,
          last_updated: '2026-02-02T10:00:00Z',
        },
        {
          id: 'p2',
          product_id: 'p2',
          location_id: null,
          quantity: 50,
          min_stock_level: 5,
          last_updated: '2026-02-02T09:00:00Z',
        },
        {
          id: 'p3',
          product_id: 'p3',
          location_id: null,
          quantity: 0,
          min_stock_level: 20,
          last_updated: '2026-02-02T08:00:00Z',
        },
      ]);
    });

    it('should return all stock levels when no filter provided', async () => {
      const levels = await getStockLevelsFromOffline();

      expect(levels).toHaveLength(3);
    });

    it('should filter by product IDs when provided', async () => {
      const levels = await getStockLevelsFromOffline(['p1', 'p3']);

      expect(levels).toHaveLength(2);
      expect(levels.some((l) => l.product_id === 'p1')).toBe(true);
      expect(levels.some((l) => l.product_id === 'p3')).toBe(true);
      expect(levels.some((l) => l.product_id === 'p2')).toBe(false);
    });

    it('should return empty array for non-existent product IDs', async () => {
      const levels = await getStockLevelsFromOffline(['non-existent']);

      expect(levels).toHaveLength(0);
    });
  });

  describe('getStockLevelByProductId', () => {
    beforeEach(async () => {
      await db.offline_stock_levels.put({
        id: 'test-product',
        product_id: 'test-product',
        location_id: null,
        quantity: 42,
        min_stock_level: 10,
        last_updated: '2026-02-02T10:00:00Z',
      });
    });

    it('should return stock level for existing product', async () => {
      const level = await getStockLevelByProductId('test-product');

      expect(level).toBeDefined();
      expect(level?.quantity).toBe(42);
    });

    it('should return undefined for non-existent product', async () => {
      const level = await getStockLevelByProductId('non-existent');

      expect(level).toBeUndefined();
    });
  });

  describe('hasOfflineStockData', () => {
    it('should return false when no data exists', async () => {
      const hasData = await hasOfflineStockData();

      expect(hasData).toBe(false);
    });

    it('should return true when data exists', async () => {
      await db.offline_stock_levels.put({
        id: 'test',
        product_id: 'test',
        location_id: null,
        quantity: 10,
        min_stock_level: 5,
        last_updated: '2026-02-02T10:00:00Z',
      });

      const hasData = await hasOfflineStockData();

      expect(hasData).toBe(true);
    });
  });

  describe('getOfflineStockCount', () => {
    it('should return 0 when no data exists', async () => {
      const count = await getOfflineStockCount();

      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      await db.offline_stock_levels.bulkPut([
        {
          id: 'p1',
          product_id: 'p1',
          location_id: null,
          quantity: 10,
          min_stock_level: 5,
          last_updated: '2026-02-02T10:00:00Z',
        },
        {
          id: 'p2',
          product_id: 'p2',
          location_id: null,
          quantity: 20,
          min_stock_level: 10,
          last_updated: '2026-02-02T09:00:00Z',
        },
      ]);

      const count = await getOfflineStockCount();

      expect(count).toBe(2);
    });
  });

  describe('clearOfflineStockData', () => {
    it('should clear all stock data and timestamp', async () => {
      // Add some data
      await db.offline_stock_levels.put({
        id: 'test',
        product_id: 'test',
        location_id: null,
        quantity: 10,
        min_stock_level: 5,
        last_updated: '2026-02-02T10:00:00Z',
      });
      await db.offline_sync_meta.put({
        entity: 'stock_levels',
        lastSyncAt: '2026-02-02T10:00:00Z',
        recordCount: 1,
      });
      localStorage.setItem(
        'appgrav_stock_levels_last_sync',
        '2026-02-02T10:00:00Z'
      );

      await clearOfflineStockData();

      const count = await db.offline_stock_levels.count();
      const timestamp = await getLastStockSyncTime();
      const meta = await db.offline_sync_meta.get('stock_levels');

      expect(count).toBe(0);
      expect(timestamp).toBeNull();
      expect(meta).toBeUndefined();
    });
  });
});
