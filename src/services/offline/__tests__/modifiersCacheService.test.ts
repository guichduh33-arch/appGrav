/**
 * Tests for modifiersCacheService
 *
 * @see Story 2.3: Product Modifiers Offline Cache
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { IOfflineModifier } from '@/types/offline';

// Mock Supabase - must be before imports that use it
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
      }),
    }),
  },
}));

import {
  cacheAllModifiers,
  getCachedModifiersForProduct,
  getCachedModifiersForCategory,
  getCachedModifierById,
  getCachedModifiersCount,
  resolveOfflineModifiers,
  groupOfflineModifiers,
  getLastModifiersSyncAt,
  getModifiersSyncMeta,
  shouldRefreshModifiers,
  shouldRefreshModifiersHourly,
  refreshModifiersCacheIfNeeded,
  clearModifiersCache,
} from '../modifiersCacheService';
import { supabase } from '@/lib/supabase';

// =====================================================
// Test Data
// =====================================================

const mockProductModifiers: Partial<IOfflineModifier>[] = [
  {
    id: 'mod-1',
    product_id: 'product-1',
    category_id: null,
    group_name: 'Size',
    group_type: 'single',
    group_required: true,
    group_sort_order: 0,
    option_id: 'small',
    option_label: 'Small',
    option_icon: null,
    price_adjustment: 0,
    is_default: true,
    option_sort_order: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mod-2',
    product_id: 'product-1',
    category_id: null,
    group_name: 'Size',
    group_type: 'single',
    group_required: true,
    group_sort_order: 0,
    option_id: 'large',
    option_label: 'Large',
    option_icon: null,
    price_adjustment: 5000,
    is_default: false,
    option_sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockCategoryModifiers: Partial<IOfflineModifier>[] = [
  {
    id: 'mod-3',
    product_id: null,
    category_id: 'category-1',
    group_name: 'Temperature',
    group_type: 'single',
    group_required: false,
    group_sort_order: 1,
    option_id: 'hot',
    option_label: 'Hot',
    option_icon: '🔥',
    price_adjustment: 0,
    is_default: true,
    option_sort_order: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mod-4',
    product_id: null,
    category_id: 'category-1',
    group_name: 'Temperature',
    group_type: 'single',
    group_required: false,
    group_sort_order: 1,
    option_id: 'iced',
    option_label: 'Iced',
    option_icon: '❄️',
    price_adjustment: 2000,
    is_default: false,
    option_sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockMultipleSelectModifiers: Partial<IOfflineModifier>[] = [
  {
    id: 'mod-5',
    product_id: 'product-2',
    category_id: null,
    group_name: 'Extras',
    group_type: 'multiple',
    group_required: false,
    group_sort_order: 2,
    option_id: 'extra-shot',
    option_label: 'Extra Shot',
    option_icon: null,
    price_adjustment: 3000,
    is_default: false,
    option_sort_order: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mod-6',
    product_id: 'product-2',
    category_id: null,
    group_name: 'Extras',
    group_type: 'multiple',
    group_required: false,
    group_sort_order: 2,
    option_id: 'whipped-cream',
    option_label: 'Whipped Cream',
    option_icon: null,
    price_adjustment: 2000,
    is_default: false,
    option_sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockInactiveModifier: Partial<IOfflineModifier> = {
  id: 'mod-inactive',
  product_id: 'product-1',
  category_id: null,
  group_name: 'Deprecated',
  group_type: 'single',
  group_required: false,
  group_sort_order: 99,
  option_id: 'old',
  option_label: 'Old Option',
  option_icon: null,
  price_adjustment: 0,
  is_default: false,
  option_sort_order: 0,
  is_active: false,
  created_at: '2024-01-01T00:00:00Z',
};

// =====================================================
// Setup & Teardown
// =====================================================

beforeEach(async () => {
  // Clear database tables
  await db.offline_modifiers.clear();
  await db.offline_sync_meta.clear();

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// =====================================================
// Tests: cacheAllModifiers
// =====================================================

describe('cacheAllModifiers', () => {
  it('should cache modifiers from Supabase', async () => {
    const allModifiers = [...mockProductModifiers, ...mockCategoryModifiers];

    // Mock Supabase response
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: allModifiers, error: null }),
      }),
    } as any);

    await cacheAllModifiers();

    const cached = await db.offline_modifiers.toArray();
    expect(cached).toHaveLength(4);
  });

  it('should clear existing cache before inserting new data', async () => {
    // Pre-populate with old data
    await db.offline_modifiers.add(mockInactiveModifier as IOfflineModifier);

    // Mock Supabase response with new data
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [mockProductModifiers[0]],
          error: null,
        }),
      }),
    } as any);

    await cacheAllModifiers();

    const cached = await db.offline_modifiers.toArray();
    expect(cached).toHaveLength(1);
    expect(cached[0].id).toBe('mod-1');
  });

  it('should update sync metadata', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockProductModifiers,
          error: null,
        }),
      }),
    } as any);

    await cacheAllModifiers();

    const meta = await db.offline_sync_meta.get('modifiers');
    expect(meta).toBeDefined();
    expect(meta?.entity).toBe('modifiers');
    expect(meta?.recordCount).toBe(2);
    expect(meta?.lastSyncAt).toBeDefined();
  });

  it('should throw error on Supabase failure', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Network error' },
        }),
      }),
    } as any);

    await expect(cacheAllModifiers()).rejects.toThrow();
  });

  it('should apply default values for nullable fields', async () => {
    const modifierWithNulls = {
      id: 'mod-null',
      product_id: 'product-1',
      category_id: null,
      group_name: 'Test',
      group_type: null, // should default to 'single'
      group_required: null, // should default to false
      group_sort_order: null, // should default to 0
      option_id: 'test',
      option_label: 'Test',
      option_icon: null,
      price_adjustment: null, // should default to 0
      is_default: null, // should default to false
      option_sort_order: null, // should default to 0
      is_active: true,
      created_at: null,
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [modifierWithNulls],
          error: null,
        }),
      }),
    } as any);

    await cacheAllModifiers();

    const cached = await db.offline_modifiers.get('mod-null');
    expect(cached?.group_type).toBe('single');
    expect(cached?.group_required).toBe(false);
    expect(cached?.group_sort_order).toBe(0);
    expect(cached?.price_adjustment).toBe(0);
    expect(cached?.is_default).toBe(false);
    expect(cached?.option_sort_order).toBe(0);
  });
});

// =====================================================
// Tests: getCachedModifiersForProduct
// =====================================================

describe('getCachedModifiersForProduct', () => {
  beforeEach(async () => {
    await db.offline_modifiers.bulkAdd(
      [...mockProductModifiers, ...mockCategoryModifiers] as IOfflineModifier[]
    );
  });

  it('should return only modifiers for the specified product', async () => {
    const modifiers = await getCachedModifiersForProduct('product-1');

    expect(modifiers).toHaveLength(2);
    expect(modifiers.every((m) => m.product_id === 'product-1')).toBe(true);
  });

  it('should return empty array for unknown product', async () => {
    const modifiers = await getCachedModifiersForProduct('unknown-product');

    expect(modifiers).toHaveLength(0);
  });

  it('should filter out inactive modifiers', async () => {
    await db.offline_modifiers.add(mockInactiveModifier as IOfflineModifier);

    const modifiers = await getCachedModifiersForProduct('product-1');

    expect(modifiers.every((m) => Boolean(m.is_active))).toBe(true);
    expect(modifiers.some((m) => m.id === 'mod-inactive')).toBe(false);
  });
});

// =====================================================
// Tests: getCachedModifiersForCategory
// =====================================================

describe('getCachedModifiersForCategory', () => {
  beforeEach(async () => {
    await db.offline_modifiers.bulkAdd(
      [...mockProductModifiers, ...mockCategoryModifiers] as IOfflineModifier[]
    );
  });

  it('should return only modifiers for the specified category', async () => {
    const modifiers = await getCachedModifiersForCategory('category-1');

    expect(modifiers).toHaveLength(2);
    expect(modifiers.every((m) => m.category_id === 'category-1')).toBe(true);
  });

  it('should return empty array for unknown category', async () => {
    const modifiers = await getCachedModifiersForCategory('unknown-category');

    expect(modifiers).toHaveLength(0);
  });
});

// =====================================================
// Tests: getCachedModifierById
// =====================================================

describe('getCachedModifierById', () => {
  beforeEach(async () => {
    await db.offline_modifiers.bulkAdd(mockProductModifiers as IOfflineModifier[]);
  });

  it('should return modifier by ID', async () => {
    const modifier = await getCachedModifierById('mod-1');

    expect(modifier).toBeDefined();
    expect(modifier?.id).toBe('mod-1');
    expect(modifier?.option_label).toBe('Small');
  });

  it('should return undefined for unknown ID', async () => {
    const modifier = await getCachedModifierById('unknown-id');

    expect(modifier).toBeUndefined();
  });
});

// =====================================================
// Tests: getCachedModifiersCount
// =====================================================

describe('getCachedModifiersCount', () => {
  it('should return correct count', async () => {
    await db.offline_modifiers.bulkAdd(mockProductModifiers as IOfflineModifier[]);

    const count = await getCachedModifiersCount();

    expect(count).toBe(2);
  });

  it('should return 0 for empty cache', async () => {
    const count = await getCachedModifiersCount();

    expect(count).toBe(0);
  });
});

// =====================================================
// Tests: groupOfflineModifiers
// =====================================================

describe('groupOfflineModifiers', () => {
  it('should group modifiers by group_name', () => {
    const groups = groupOfflineModifiers(mockProductModifiers as IOfflineModifier[]);

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Size');
    expect(groups[0].options).toHaveLength(2);
  });

  it('should sort options by option_sort_order', () => {
    const groups = groupOfflineModifiers(mockProductModifiers as IOfflineModifier[]);

    expect(groups[0].options[0].id).toBe('small');
    expect(groups[0].options[1].id).toBe('large');
  });

  it('should preserve group properties', () => {
    const groups = groupOfflineModifiers(mockProductModifiers as IOfflineModifier[]);

    expect(groups[0].type).toBe('single');
    expect(groups[0].required).toBe(true);
    expect(groups[0].sortOrder).toBe(0);
  });

  it('should mark groups as inherited when specified', () => {
    const groups = groupOfflineModifiers(mockCategoryModifiers as IOfflineModifier[], true);

    expect(groups[0].isInherited).toBe(true);
  });

  it('should handle multiple groups', () => {
    const allModifiers = [
      ...mockProductModifiers,
      ...mockMultipleSelectModifiers,
    ] as IOfflineModifier[];

    const groups = groupOfflineModifiers(allModifiers);

    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  it('should preserve price adjustment in options', () => {
    const groups = groupOfflineModifiers(mockProductModifiers as IOfflineModifier[]);

    const largeOption = groups[0].options.find((o) => o.id === 'large');
    expect(largeOption?.priceAdjustment).toBe(5000);
  });

  it('should handle multiple-select groups', () => {
    const groups = groupOfflineModifiers(mockMultipleSelectModifiers as IOfflineModifier[]);

    expect(groups[0].type).toBe('multiple');
    expect(groups[0].options).toHaveLength(2);
  });

  it('should filter out inactive modifiers', () => {
    const modifiersWithInactive = [
      ...mockProductModifiers,
      mockInactiveModifier,
    ] as IOfflineModifier[];

    const groups = groupOfflineModifiers(modifiersWithInactive);

    // Should not include the 'Deprecated' group from inactive modifier
    expect(groups.every((g) => g.name !== 'Deprecated')).toBe(true);
  });
});

// =====================================================
// Tests: resolveOfflineModifiers
// =====================================================

describe('resolveOfflineModifiers', () => {
  beforeEach(async () => {
    await db.offline_modifiers.bulkAdd([
      ...mockProductModifiers,
      ...mockCategoryModifiers,
    ] as IOfflineModifier[]);
  });

  it('should return product modifiers when available', async () => {
    const groups = await resolveOfflineModifiers('product-1', 'category-1');

    const productGroup = groups.find((g) => g.name === 'Size');
    expect(productGroup).toBeDefined();
    expect(productGroup?.isInherited).toBeFalsy();
  });

  it('should inherit category modifiers when product has none', async () => {
    const groups = await resolveOfflineModifiers('product-1', 'category-1');

    const categoryGroup = groups.find((g) => g.name === 'Temperature');
    expect(categoryGroup).toBeDefined();
    expect(categoryGroup?.isInherited).toBe(true);
  });

  it('should prioritize product groups over category groups with same name', async () => {
    // Add a category modifier with same group name as product
    const conflictingCategoryModifier: IOfflineModifier = {
      id: 'mod-conflict',
      product_id: null,
      category_id: 'category-1',
      group_name: 'Size', // Same as product modifier
      group_type: 'single',
      group_required: false, // Different from product
      group_sort_order: 0,
      option_id: 'category-size',
      option_label: 'Category Size',
      option_icon: null,
      price_adjustment: 9999,
      is_default: false,
      option_sort_order: 0,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    await db.offline_modifiers.add(conflictingCategoryModifier);

    const groups = await resolveOfflineModifiers('product-1', 'category-1');

    // Size group should come from product, not category
    const sizeGroup = groups.find((g) => g.name === 'Size');
    expect(sizeGroup?.required).toBe(true); // Product has required: true
    expect(sizeGroup?.isInherited).toBeFalsy();
    expect(sizeGroup?.options.every((o) => o.id !== 'category-size')).toBe(true);
  });

  it('should sort groups by sortOrder', async () => {
    const groups = await resolveOfflineModifiers('product-1', 'category-1');

    // Size (sortOrder: 0) should come before Temperature (sortOrder: 1)
    const sizeIndex = groups.findIndex((g) => g.name === 'Size');
    const tempIndex = groups.findIndex((g) => g.name === 'Temperature');
    expect(sizeIndex).toBeLessThan(tempIndex);
  });

  it('should return empty array when no product or category specified', async () => {
    const groups = await resolveOfflineModifiers(undefined, undefined);

    expect(groups).toHaveLength(0);
  });

  it('should return only category modifiers when product has none', async () => {
    const groups = await resolveOfflineModifiers('unknown-product', 'category-1');

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Temperature');
    expect(groups[0].isInherited).toBe(true);
  });
});

// =====================================================
// Tests: Sync Metadata
// =====================================================

describe('getLastModifiersSyncAt', () => {
  it('should return null when no sync has occurred', async () => {
    const timestamp = await getLastModifiersSyncAt();

    expect(timestamp).toBeNull();
  });

  it('should return timestamp after sync', async () => {
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: '2024-01-15T10:00:00Z',
      recordCount: 10,
    });

    const timestamp = await getLastModifiersSyncAt();

    expect(timestamp).toBe('2024-01-15T10:00:00Z');
  });
});

describe('getModifiersSyncMeta', () => {
  it('should return null when no sync has occurred', async () => {
    const meta = await getModifiersSyncMeta();

    expect(meta).toBeNull();
  });

  it('should return full metadata after sync', async () => {
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: '2024-01-15T10:00:00Z',
      recordCount: 25,
    });

    const meta = await getModifiersSyncMeta();

    expect(meta).toEqual({
      entity: 'modifiers',
      lastSyncAt: '2024-01-15T10:00:00Z',
      recordCount: 25,
    });
  });
});

// =====================================================
// Tests: Cache Freshness
// =====================================================

describe('shouldRefreshModifiers', () => {
  it('should return true when no cache exists', async () => {
    const shouldRefresh = await shouldRefreshModifiers();

    expect(shouldRefresh).toBe(true);
  });

  it('should return true when cache is older than 24 hours', async () => {
    const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: oldDate.toISOString(),
      recordCount: 10,
    });

    const shouldRefresh = await shouldRefreshModifiers();

    expect(shouldRefresh).toBe(true);
  });

  it('should return false when cache is fresh', async () => {
    const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: recentDate.toISOString(),
      recordCount: 10,
    });

    const shouldRefresh = await shouldRefreshModifiers();

    expect(shouldRefresh).toBe(false);
  });
});

describe('shouldRefreshModifiersHourly', () => {
  it('should return true when no cache exists', async () => {
    const shouldRefresh = await shouldRefreshModifiersHourly();

    expect(shouldRefresh).toBe(true);
  });

  it('should return true when cache is older than 1 hour', async () => {
    const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: oldDate.toISOString(),
      recordCount: 10,
    });

    const shouldRefresh = await shouldRefreshModifiersHourly();

    expect(shouldRefresh).toBe(true);
  });

  it('should return false when cache is less than 1 hour old', async () => {
    const recentDate = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: recentDate.toISOString(),
      recordCount: 10,
    });

    const shouldRefresh = await shouldRefreshModifiersHourly();

    expect(shouldRefresh).toBe(false);
  });
});

// =====================================================
// Tests: Cache Management
// =====================================================

describe('refreshModifiersCacheIfNeeded', () => {
  it('should refresh when force is true', async () => {
    // Setup fresh cache
    const recentDate = new Date(Date.now() - 30 * 60 * 1000);
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: recentDate.toISOString(),
      recordCount: 10,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockProductModifiers,
          error: null,
        }),
      }),
    } as any);

    const refreshed = await refreshModifiersCacheIfNeeded(true);

    expect(refreshed).toBe(true);
  });

  it('should not refresh when cache is fresh', async () => {
    const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000);
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: recentDate.toISOString(),
      recordCount: 10,
    });

    const refreshed = await refreshModifiersCacheIfNeeded();

    expect(refreshed).toBe(false);
  });
});

describe('clearModifiersCache', () => {
  it('should clear all cached modifiers', async () => {
    await db.offline_modifiers.bulkAdd(mockProductModifiers as IOfflineModifier[]);
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: new Date().toISOString(),
      recordCount: 2,
    });

    await clearModifiersCache();

    const count = await db.offline_modifiers.count();
    const meta = await db.offline_sync_meta.get('modifiers');

    expect(count).toBe(0);
    expect(meta).toBeUndefined();
  });
});
