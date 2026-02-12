/**
 * Recipes Cache Service Tests (Story 2.4)
 *
 * Tests for offline recipes caching functionality for costing display.
 * Uses fake-indexeddb for Dexie mocking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import {
  cacheAllRecipes,
  getCachedRecipesForProduct,
  getCachedRecipesWithMaterials,
  getCachedRecipeById,
  getAllCachedRecipes,
  getLastRecipesSyncAt,
  getRecipesSyncMeta,
  getCachedRecipesCount,
  shouldRefreshRecipes,
  shouldRefreshRecipesHourly,
  refreshRecipesCacheIfNeeded,
  clearRecipesCache,
} from '../recipesCacheService';
import type { IOfflineRecipe, IOfflineProduct } from '@/types/offline';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

// Sample recipe data
const mockRecipes: IOfflineRecipe[] = [
  {
    id: 'recipe-1',
    product_id: 'prod-croissant',
    material_id: 'mat-flour',
    quantity: 0.5,
    unit: 'kg',
    is_active: true,
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'recipe-2',
    product_id: 'prod-croissant',
    material_id: 'mat-butter',
    quantity: 0.25,
    unit: 'kg',
    is_active: true,
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'recipe-3',
    product_id: 'prod-croissant',
    material_id: 'mat-sugar',
    quantity: 0.1,
    unit: 'kg',
    is_active: true,
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'recipe-4',
    product_id: 'prod-baguette',
    material_id: 'mat-flour',
    quantity: 0.8,
    unit: 'kg',
    is_active: true,
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'recipe-5',
    product_id: 'prod-croissant',
    material_id: 'mat-yeast',
    quantity: 0.02,
    unit: 'kg',
    is_active: false, // Inactive recipe ingredient
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
  },
];

// Sample material products for join testing
const mockMaterials: IOfflineProduct[] = [
  {
    id: 'mat-flour',
    category_id: 'cat-materials',
    sku: 'MAT-FLOUR',
    name: 'Flour T55',
    product_type: 'raw_material',
    retail_price: 0,
    wholesale_price: null,
    cost_price: 15000, // 15,000 IDR per kg
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: false,
    available_for_sale: false,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'mat-butter',
    category_id: 'cat-materials',
    sku: 'MAT-BUTTER',
    name: 'Butter',
    product_type: 'raw_material',
    retail_price: 0,
    wholesale_price: null,
    cost_price: 120000, // 120,000 IDR per kg
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: false,
    available_for_sale: false,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'mat-sugar',
    category_id: 'cat-materials',
    sku: 'MAT-SUGAR',
    name: 'Sugar',
    product_type: 'raw_material',
    retail_price: 0,
    wholesale_price: null,
    cost_price: 18000, // 18,000 IDR per kg
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: false,
    available_for_sale: false,
    updated_at: '2026-01-30T10:00:00Z',
  },
];

// Setup mock Supabase response for recipes
function setupSupabaseMock(recipes: IOfflineRecipe[] = mockRecipes) {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  };

  // Final call returns data
  mockChain.eq.mockResolvedValue({ data: recipes, error: null });

  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);
  return mockChain;
}

describe('recipesCacheService', () => {
  beforeEach(async () => {
    // Clear all Dexie tables before each test
    await db.offline_recipes.clear();
    await db.offline_products.clear();
    await db.offline_sync_meta.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // =====================================================
  // cacheAllRecipes Tests
  // =====================================================

  describe('cacheAllRecipes', () => {
    it('should fetch recipes from Supabase and store in Dexie', async () => {
      setupSupabaseMock();

      await cacheAllRecipes();

      const cachedRecipes = await db.offline_recipes.toArray();
      expect(cachedRecipes).toHaveLength(mockRecipes.length);
      expect(cachedRecipes[0].product_id).toBe('prod-croissant');
    });

    it('should update sync metadata after caching', async () => {
      setupSupabaseMock();

      await cacheAllRecipes();

      const meta = await db.offline_sync_meta.get('recipes');
      expect(meta).toBeDefined();
      expect(meta?.entity).toBe('recipes');
      expect(meta?.recordCount).toBe(mockRecipes.length);
      expect(meta?.lastSyncAt).toBeDefined();
    });

    it('should clear existing cache before adding new recipes', async () => {
      // Pre-populate with old data
      await db.offline_recipes.add({
        id: 'old-recipe',
        product_id: 'old-prod',
        material_id: 'old-mat',
        quantity: 1,
        unit: 'kg',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      });

      setupSupabaseMock();
      await cacheAllRecipes();

      const cachedRecipes = await db.offline_recipes.toArray();
      expect(cachedRecipes).toHaveLength(mockRecipes.length);
      expect(cachedRecipes.find((r) => r.id === 'old-recipe')).toBeUndefined();
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

      await expect(cacheAllRecipes()).rejects.toThrow(
        'Failed to fetch recipes: Database connection failed'
      );
    });
  });

  // =====================================================
  // getCachedRecipesForProduct Tests
  // =====================================================

  describe('getCachedRecipesForProduct', () => {
    beforeEach(async () => {
      await db.offline_recipes.bulkAdd(mockRecipes);
    });

    it('should return only active recipes for a product', async () => {
      const recipes = await getCachedRecipesForProduct('prod-croissant');

      // Should return 3 active recipes (not the inactive one)
      expect(recipes).toHaveLength(3);
      expect(recipes.every((r) => Boolean(r.is_active))).toBe(true);
      expect(recipes.every((r) => r.product_id === 'prod-croissant')).toBe(true);
    });

    it('should return empty array for product with no recipes', async () => {
      const recipes = await getCachedRecipesForProduct('prod-nonexistent');

      expect(recipes).toHaveLength(0);
    });

    it('should filter out inactive recipes', async () => {
      const recipes = await getCachedRecipesForProduct('prod-croissant');

      // mat-yeast is inactive, should not be included
      const yeastRecipe = recipes.find((r) => r.material_id === 'mat-yeast');
      expect(yeastRecipe).toBeUndefined();
    });
  });

  // =====================================================
  // getCachedRecipesWithMaterials Tests
  // =====================================================

  describe('getCachedRecipesWithMaterials', () => {
    beforeEach(async () => {
      await db.offline_recipes.bulkAdd(mockRecipes);
      await db.offline_products.bulkAdd(mockMaterials);
    });

    it('should return recipes with joined material data', async () => {
      const recipes = await getCachedRecipesWithMaterials('prod-croissant');

      expect(recipes).toHaveLength(3);

      // Check that materials are properly joined
      const flourRecipe = recipes.find((r) => r.material_id === 'mat-flour');
      expect(flourRecipe).toBeDefined();
      expect(flourRecipe?.material).toBeDefined();
      expect(flourRecipe?.material?.name).toBe('Flour T55');
      expect(flourRecipe?.material?.cost_price).toBe(15000);
    });

    it('should calculate correct cost from joined data', async () => {
      const recipes = await getCachedRecipesWithMaterials('prod-croissant');

      // Calculate total cost per kg
      // Flour: 0.5kg * 15000 = 7500
      // Butter: 0.25kg * 120000 = 30000
      // Sugar: 0.1kg * 18000 = 1800
      // Total: 39300 IDR per kg
      const totalCost = recipes.reduce((sum, r) => {
        const materialCost = r.material?.cost_price || 0;
        return sum + (materialCost * r.quantity);
      }, 0);

      expect(totalCost).toBe(39300);
    });

    it('should handle missing materials gracefully', async () => {
      // Clear materials to simulate missing data
      await db.offline_products.clear();

      const recipes = await getCachedRecipesWithMaterials('prod-croissant');

      expect(recipes).toHaveLength(3);
      recipes.forEach((r) => {
        expect(r.material).toBeNull();
      });
    });

    it('should return empty array for product with no recipes', async () => {
      const recipes = await getCachedRecipesWithMaterials('prod-nonexistent');

      expect(recipes).toHaveLength(0);
    });
  });

  // =====================================================
  // getCachedRecipeById Tests
  // =====================================================

  describe('getCachedRecipeById', () => {
    beforeEach(async () => {
      await db.offline_recipes.bulkAdd(mockRecipes);
    });

    it('should return recipe by ID', async () => {
      const recipe = await getCachedRecipeById('recipe-1');

      expect(recipe).toBeDefined();
      expect(recipe?.material_id).toBe('mat-flour');
    });

    it('should return undefined for non-existent ID', async () => {
      const recipe = await getCachedRecipeById('nonexistent');

      expect(recipe).toBeUndefined();
    });
  });

  // =====================================================
  // getAllCachedRecipes Tests
  // =====================================================

  describe('getAllCachedRecipes', () => {
    beforeEach(async () => {
      await db.offline_recipes.bulkAdd(mockRecipes);
    });

    it('should return only active recipes', async () => {
      const recipes = await getAllCachedRecipes();

      // 4 active recipes in mock data
      expect(recipes).toHaveLength(4);
      expect(recipes.every((r) => Boolean(r.is_active))).toBe(true);
    });
  });

  // =====================================================
  // Sync Metadata Tests
  // =====================================================

  describe('sync metadata', () => {
    it('getLastRecipesSyncAt should return null when no sync', async () => {
      const lastSync = await getLastRecipesSyncAt();

      expect(lastSync).toBeNull();
    });

    it('getLastRecipesSyncAt should return timestamp after sync', async () => {
      setupSupabaseMock();
      await cacheAllRecipes();

      const lastSync = await getLastRecipesSyncAt();

      expect(lastSync).toBeDefined();
      expect(new Date(lastSync!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('getRecipesSyncMeta should return full metadata', async () => {
      setupSupabaseMock();
      await cacheAllRecipes();

      const meta = await getRecipesSyncMeta();

      expect(meta).toBeDefined();
      expect(meta?.entity).toBe('recipes');
      expect(meta?.recordCount).toBe(mockRecipes.length);
      expect(meta?.lastSyncAt).toBeDefined();
    });

    it('getCachedRecipesCount should return correct count', async () => {
      await db.offline_recipes.bulkAdd(mockRecipes);

      const count = await getCachedRecipesCount();

      expect(count).toBe(mockRecipes.length);
    });
  });

  // =====================================================
  // Cache Refresh Logic Tests
  // =====================================================

  describe('cache refresh logic', () => {
    it('shouldRefreshRecipes should return true when no cache exists', async () => {
      const needsRefresh = await shouldRefreshRecipes();

      expect(needsRefresh).toBe(true);
    });

    it('shouldRefreshRecipes should return false when cache is fresh', async () => {
      await db.offline_sync_meta.put({
        entity: 'recipes',
        lastSyncAt: new Date().toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshRecipes();

      expect(needsRefresh).toBe(false);
    });

    it('shouldRefreshRecipes should return true when cache is stale (24h)', async () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await db.offline_sync_meta.put({
        entity: 'recipes',
        lastSyncAt: oldDate.toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshRecipes();

      expect(needsRefresh).toBe(true);
    });

    it('shouldRefreshRecipesHourly should return true when > 1 hour', async () => {
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      await db.offline_sync_meta.put({
        entity: 'recipes',
        lastSyncAt: oldDate.toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshRecipesHourly();

      expect(needsRefresh).toBe(true);
    });

    it('shouldRefreshRecipesHourly should return false when < 1 hour', async () => {
      const recentDate = new Date(Date.now() - 30 * 60 * 1000);
      await db.offline_sync_meta.put({
        entity: 'recipes',
        lastSyncAt: recentDate.toISOString(),
        recordCount: 10,
      });

      const needsRefresh = await shouldRefreshRecipesHourly();

      expect(needsRefresh).toBe(false);
    });

    it('refreshRecipesCacheIfNeeded should skip refresh when cache is fresh', async () => {
      setupSupabaseMock();

      await db.offline_sync_meta.put({
        entity: 'recipes',
        lastSyncAt: new Date().toISOString(),
        recordCount: 10,
      });

      const refreshed = await refreshRecipesCacheIfNeeded();

      expect(refreshed).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('refreshRecipesCacheIfNeeded should refresh when forced', async () => {
      setupSupabaseMock();

      await db.offline_sync_meta.put({
        entity: 'recipes',
        lastSyncAt: new Date().toISOString(),
        recordCount: 10,
      });

      const refreshed = await refreshRecipesCacheIfNeeded(true);

      expect(refreshed).toBe(true);
      expect(supabase.from).toHaveBeenCalled();
    });
  });

  // =====================================================
  // clearRecipesCache Tests
  // =====================================================

  describe('clearRecipesCache', () => {
    it('should clear all recipes and metadata', async () => {
      await db.offline_recipes.bulkAdd(mockRecipes);
      await db.offline_sync_meta.put({
        entity: 'recipes',
        lastSyncAt: new Date().toISOString(),
        recordCount: mockRecipes.length,
      });

      await clearRecipesCache();

      const recipes = await db.offline_recipes.toArray();
      const meta = await db.offline_sync_meta.get('recipes');

      expect(recipes).toHaveLength(0);
      expect(meta).toBeUndefined();
    });
  });

  // =====================================================
  // Costing Calculation Tests
  // =====================================================

  describe('costing calculations', () => {
    beforeEach(async () => {
      await db.offline_recipes.bulkAdd(mockRecipes);
      await db.offline_products.bulkAdd(mockMaterials);
    });

    it('should enable margin calculation from cached data', async () => {
      const recipes = await getCachedRecipesWithMaterials('prod-croissant');

      // Simulate margin calculation (as done in CostingTab)
      const costPerKg = recipes.reduce((sum, r) => {
        const materialCost = r.material?.cost_price || 0;
        return sum + (materialCost * r.quantity);
      }, 0);

      // Croissant retail price would be ~50000 IDR
      const retailPrice = 50000;
      const margin = ((retailPrice - costPerKg) / retailPrice) * 100;

      // Expected: (50000 - 39300) / 50000 * 100 = 21.4%
      expect(margin).toBeCloseTo(21.4, 1);
    });

    it('should calculate percentage of cost per ingredient', async () => {
      const recipes = await getCachedRecipesWithMaterials('prod-croissant');

      const costPerKg = recipes.reduce((sum, r) => {
        const materialCost = r.material?.cost_price || 0;
        return sum + (materialCost * r.quantity);
      }, 0);

      // Calculate percentage for butter (most expensive ingredient)
      const butterRecipe = recipes.find((r) => r.material_id === 'mat-butter');
      const butterCost = (butterRecipe?.material?.cost_price || 0) * (butterRecipe?.quantity || 0);
      const butterPercentage = (butterCost / costPerKg) * 100;

      // Butter: 30000 / 39300 * 100 = 76.3%
      expect(butterPercentage).toBeCloseTo(76.3, 1);
    });
  });
});
