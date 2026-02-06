/**
 * Categories Cache Service Tests (Story 2.2)
 *
 * Tests for offline categories caching functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';

// Mock Supabase BEFORE importing the service
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import {
  cacheAllCategories,
  getCachedCategories,
  getAllCachedCategories,
  getCachedCategoryById,
  getCachedCategoriesCount,
  getLastCategoriesSyncAt,
  getCategoriesSyncMeta,
  shouldRefreshCategories,
  shouldRefreshCategoriesHourly,
  refreshCategoriesCacheIfNeeded,
  clearCategoriesCache,
} from '../categoriesCacheService';
import type { IOfflineCategory } from '@/types/offline';

// Test data
const mockCategories: IOfflineCategory[] = [
  {
    id: 'cat-1',
    name: 'Viennoiseries',
    icon: 'croissant',
    color: '#F5DEB3',
    sort_order: 1,
    dispatch_station: 'kitchen',
    is_active: true,
    is_raw_material: false,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Boissons',
    icon: 'coffee',
    color: '#8B4513',
    sort_order: 2,
    dispatch_station: 'barista',
    is_active: true,
    is_raw_material: false,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Matières Premières',
    icon: 'wheat',
    color: '#DAA520',
    sort_order: 3,
    dispatch_station: null,
    is_active: true,
    is_raw_material: true, // Should be filtered out
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Ancienne Catégorie',
    icon: 'archive',
    color: '#808080',
    sort_order: 4,
    dispatch_station: 'display',
    is_active: false, // Should be filtered out
    is_raw_material: false,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Pâtisseries',
    icon: 'cake',
    color: '#FFB6C1',
    sort_order: 0, // Lowest sort_order, should be first
    dispatch_station: 'kitchen',
    is_active: true,
    is_raw_material: false,
    updated_at: '2026-01-30T10:00:00Z',
  },
];

// Helper to setup Supabase mock
function setupSupabaseMock(data: IOfflineCategory[] | null, error: { message: string } | null = null) {
  const mockSelect = vi.fn().mockResolvedValue({ data, error });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
  vi.mocked(supabase.from).mockImplementation(mockFrom);
  return { mockFrom, mockSelect };
}

describe('categoriesCacheService', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.offline_categories.clear();
    await db.offline_sync_meta.delete('categories');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cacheAllCategories', () => {
    it('should fetch categories from Supabase and store in Dexie', async () => {
      setupSupabaseMock(mockCategories);

      await cacheAllCategories();

      const cached = await db.offline_categories.toArray();
      expect(cached).toHaveLength(5);
      expect(cached.map(c => c.id)).toEqual(expect.arrayContaining(['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5']));
    });

    it('should update sync metadata after caching', async () => {
      setupSupabaseMock(mockCategories);

      await cacheAllCategories();

      const meta = await db.offline_sync_meta.get('categories');
      expect(meta).toBeDefined();
      expect(meta?.entity).toBe('categories');
      expect(meta?.recordCount).toBe(5);
      expect(meta?.lastSyncAt).toBeDefined();
    });

    it('should clear existing cache before adding new data', async () => {
      // Pre-populate with old data
      await db.offline_categories.add({
        id: 'old-cat',
        name: 'Old Category',
        icon: null,
        color: null,
        sort_order: 99,
        dispatch_station: null,
        is_active: true,
        is_raw_material: false,
        updated_at: '2025-01-01T00:00:00Z',
      });

      setupSupabaseMock(mockCategories);

      await cacheAllCategories();

      const cached = await db.offline_categories.toArray();
      expect(cached).toHaveLength(5);
      expect(cached.find(c => c.id === 'old-cat')).toBeUndefined();
    });

    it('should throw error if Supabase query fails', async () => {
      setupSupabaseMock(null, { message: 'Network error' });

      await expect(cacheAllCategories()).rejects.toThrow('Failed to fetch categories: Network error');
    });

    it('should throw error if no data returned', async () => {
      setupSupabaseMock(null);

      await expect(cacheAllCategories()).rejects.toThrow('No data returned from categories query');
    });
  });

  describe('getCachedCategories', () => {
    beforeEach(async () => {
      // Populate test data
      await db.offline_categories.bulkAdd(mockCategories);
    });

    it('should return only active non-raw-material categories', async () => {
      const categories = await getCachedCategories();

      expect(categories).toHaveLength(3); // cat-1, cat-2, cat-5
      expect(categories.every(c => Boolean(c.is_active))).toBe(true);
      expect(categories.every(c => !c.is_raw_material)).toBe(true);
    });

    it('should sort categories by sort_order', async () => {
      const categories = await getCachedCategories();

      expect(categories[0].id).toBe('cat-5'); // sort_order: 0
      expect(categories[1].id).toBe('cat-1'); // sort_order: 1
      expect(categories[2].id).toBe('cat-2'); // sort_order: 2
    });

    it('should return empty array if no categories', async () => {
      await db.offline_categories.clear();

      const categories = await getCachedCategories();

      expect(categories).toEqual([]);
    });
  });

  describe('getAllCachedCategories', () => {
    beforeEach(async () => {
      await db.offline_categories.bulkAdd(mockCategories);
    });

    it('should return all categories including inactive and raw materials', async () => {
      const categories = await getAllCachedCategories();

      expect(categories).toHaveLength(5);
    });

    it('should sort by sort_order', async () => {
      const categories = await getAllCachedCategories();

      expect(categories[0].sort_order).toBe(0);
      expect(categories[1].sort_order).toBe(1);
    });
  });

  describe('getCachedCategoryById', () => {
    beforeEach(async () => {
      await db.offline_categories.bulkAdd(mockCategories);
    });

    it('should return category by ID', async () => {
      const category = await getCachedCategoryById('cat-2');

      expect(category).toBeDefined();
      expect(category?.name).toBe('Boissons');
      expect(category?.dispatch_station).toBe('barista');
    });

    it('should return undefined for non-existent ID', async () => {
      const category = await getCachedCategoryById('non-existent');

      expect(category).toBeUndefined();
    });
  });

  describe('getCachedCategoriesCount', () => {
    it('should return correct count', async () => {
      await db.offline_categories.bulkAdd(mockCategories);

      const count = await getCachedCategoriesCount();

      expect(count).toBe(5);
    });

    it('should return 0 for empty cache', async () => {
      const count = await getCachedCategoriesCount();

      expect(count).toBe(0);
    });
  });

  describe('getLastCategoriesSyncAt', () => {
    it('should return last sync timestamp', async () => {
      const syncTime = '2026-01-30T12:00:00Z';
      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: syncTime,
        recordCount: 5,
      });

      const lastSync = await getLastCategoriesSyncAt();

      expect(lastSync).toBe(syncTime);
    });

    it('should return null if never synced', async () => {
      const lastSync = await getLastCategoriesSyncAt();

      expect(lastSync).toBeNull();
    });
  });

  describe('getCategoriesSyncMeta', () => {
    it('should return full sync metadata', async () => {
      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: '2026-01-30T12:00:00Z',
        recordCount: 10,
      });

      const meta = await getCategoriesSyncMeta();

      expect(meta).toBeDefined();
      expect(meta?.entity).toBe('categories');
      expect(meta?.recordCount).toBe(10);
    });

    it('should return undefined if never synced', async () => {
      const meta = await getCategoriesSyncMeta();

      expect(meta).toBeUndefined();
    });
  });

  describe('shouldRefreshCategories (24h TTL)', () => {
    it('should return true if never synced', async () => {
      const shouldRefresh = await shouldRefreshCategories();

      expect(shouldRefresh).toBe(true);
    });

    it('should return true if cache is older than 24 hours', async () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);

      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: oldDate.toISOString(),
        recordCount: 5,
      });

      const shouldRefresh = await shouldRefreshCategories();

      expect(shouldRefresh).toBe(true);
    });

    it('should return false if cache is fresh', async () => {
      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: new Date().toISOString(),
        recordCount: 5,
      });

      const shouldRefresh = await shouldRefreshCategories();

      expect(shouldRefresh).toBe(false);
    });
  });

  describe('shouldRefreshCategoriesHourly', () => {
    it('should return true if never synced', async () => {
      const shouldRefresh = await shouldRefreshCategoriesHourly();

      expect(shouldRefresh).toBe(true);
    });

    it('should return true if cache is older than 1 hour', async () => {
      const oldDate = new Date();
      oldDate.setMinutes(oldDate.getMinutes() - 61);

      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: oldDate.toISOString(),
        recordCount: 5,
      });

      const shouldRefresh = await shouldRefreshCategoriesHourly();

      expect(shouldRefresh).toBe(true);
    });

    it('should return false if synced within the hour', async () => {
      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: new Date().toISOString(),
        recordCount: 5,
      });

      const shouldRefresh = await shouldRefreshCategoriesHourly();

      expect(shouldRefresh).toBe(false);
    });
  });

  describe('refreshCategoriesCacheIfNeeded', () => {
    it('should refresh if cache is stale', async () => {
      setupSupabaseMock(mockCategories);

      const refreshed = await refreshCategoriesCacheIfNeeded();

      expect(refreshed).toBe(true);
      const cached = await db.offline_categories.count();
      expect(cached).toBe(5);
    });

    it('should not refresh if cache is fresh', async () => {
      setupSupabaseMock(mockCategories);

      // First sync
      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: new Date().toISOString(),
        recordCount: 5,
      });

      const refreshed = await refreshCategoriesCacheIfNeeded();

      expect(refreshed).toBe(false);
    });

    it('should refresh if force flag is true', async () => {
      setupSupabaseMock(mockCategories);

      // Fresh cache
      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: new Date().toISOString(),
        recordCount: 5,
      });

      const refreshed = await refreshCategoriesCacheIfNeeded(true);

      expect(refreshed).toBe(true);
    });
  });

  describe('clearCategoriesCache', () => {
    it('should clear all categories and sync meta', async () => {
      await db.offline_categories.bulkAdd(mockCategories);
      await db.offline_sync_meta.put({
        entity: 'categories',
        lastSyncAt: new Date().toISOString(),
        recordCount: 5,
      });

      await clearCategoriesCache();

      const count = await db.offline_categories.count();
      const meta = await db.offline_sync_meta.get('categories');

      expect(count).toBe(0);
      expect(meta).toBeUndefined();
    });
  });

  describe('dispatch_station preservation', () => {
    it('should preserve dispatch_station values', async () => {
      await db.offline_categories.bulkAdd(mockCategories);

      const categories = await getAllCachedCategories();

      const kitchen = categories.find(c => c.id === 'cat-1');
      const barista = categories.find(c => c.id === 'cat-2');
      const display = categories.find(c => c.id === 'cat-4');

      expect(kitchen?.dispatch_station).toBe('kitchen');
      expect(barista?.dispatch_station).toBe('barista');
      expect(display?.dispatch_station).toBe('display');
    });

    it('should handle null dispatch_station', async () => {
      await db.offline_categories.bulkAdd(mockCategories);

      const category = await getCachedCategoryById('cat-3');

      expect(category?.dispatch_station).toBeNull();
    });
  });
});
