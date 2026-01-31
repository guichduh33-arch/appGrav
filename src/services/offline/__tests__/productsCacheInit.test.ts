/**
 * Products/Categories/Modifiers/Recipes Cache Initialization Tests (Story 2.1 + 2.2 + 2.3 + 2.4)
 *
 * Tests for data cache initialization and hourly refresh functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';

// Mock the cache services
vi.mock('../productsCacheService', () => ({
  cacheAllProducts: vi.fn(),
  shouldRefreshProducts: vi.fn(),
  shouldRefreshProductsHourly: vi.fn(),
  getLastProductsSyncAt: vi.fn(),
}));

vi.mock('../categoriesCacheService', () => ({
  cacheAllCategories: vi.fn(),
  shouldRefreshCategories: vi.fn(),
  shouldRefreshCategoriesHourly: vi.fn(),
  getLastCategoriesSyncAt: vi.fn(),
}));

vi.mock('../modifiersCacheService', () => ({
  cacheAllModifiers: vi.fn(),
  shouldRefreshModifiers: vi.fn(),
  shouldRefreshModifiersHourly: vi.fn(),
  getLastModifiersSyncAt: vi.fn(),
}));

vi.mock('../recipesCacheService', () => ({
  cacheAllRecipes: vi.fn(),
  shouldRefreshRecipes: vi.fn(),
  shouldRefreshRecipesHourly: vi.fn(),
  getLastRecipesSyncAt: vi.fn(),
}));

import {
  cacheAllProducts,
  shouldRefreshProducts,
  shouldRefreshProductsHourly,
  getLastProductsSyncAt,
} from '../productsCacheService';
import {
  cacheAllCategories,
  shouldRefreshCategories,
  shouldRefreshCategoriesHourly,
  getLastCategoriesSyncAt,
} from '../categoriesCacheService';
import {
  cacheAllModifiers,
  shouldRefreshModifiers,
  shouldRefreshModifiersHourly,
  getLastModifiersSyncAt,
} from '../modifiersCacheService';
import {
  cacheAllRecipes,
  shouldRefreshRecipes,
  shouldRefreshRecipesHourly,
  getLastRecipesSyncAt,
} from '../recipesCacheService';
import {
  initProductsCache,
  stopProductsCacheRefresh,
  isProductsCacheInitialized,
} from '../productsCacheInit';

describe('productsCacheInit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset module state
    stopProductsCacheRefresh();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    stopProductsCacheRefresh();
  });

  describe('initProductsCache', () => {
    it('should refresh all entities when all are stale', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(true);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(true);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(true);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(true);
      vi.mocked(cacheAllProducts).mockResolvedValue();
      vi.mocked(cacheAllCategories).mockResolvedValue();
      vi.mocked(cacheAllModifiers).mockResolvedValue();
      vi.mocked(cacheAllRecipes).mockResolvedValue();

      const result = await initProductsCache();

      expect(result).toBe(true);
      expect(cacheAllProducts).toHaveBeenCalledTimes(1);
      expect(cacheAllCategories).toHaveBeenCalledTimes(1);
      expect(cacheAllModifiers).toHaveBeenCalledTimes(1);
      expect(cacheAllRecipes).toHaveBeenCalledTimes(1);
    });

    it('should only refresh products when others are fresh', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(true);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(cacheAllProducts).mockResolvedValue();
      vi.mocked(getLastCategoriesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      const result = await initProductsCache();

      expect(result).toBe(true);
      expect(cacheAllProducts).toHaveBeenCalledTimes(1);
      expect(cacheAllCategories).not.toHaveBeenCalled();
      expect(cacheAllModifiers).not.toHaveBeenCalled();
      expect(cacheAllRecipes).not.toHaveBeenCalled();
    });

    it('should only refresh categories when products are fresh', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(true);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(cacheAllCategories).mockResolvedValue();
      vi.mocked(getLastProductsSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      const result = await initProductsCache();

      expect(result).toBe(true);
      expect(cacheAllProducts).not.toHaveBeenCalled();
      expect(cacheAllCategories).toHaveBeenCalledTimes(1);
      expect(cacheAllModifiers).not.toHaveBeenCalled();
      expect(cacheAllRecipes).not.toHaveBeenCalled();
    });

    it('should skip refresh when all caches are fresh', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(getLastProductsSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastCategoriesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      const result = await initProductsCache();

      expect(result).toBe(false);
      expect(cacheAllProducts).not.toHaveBeenCalled();
      expect(cacheAllCategories).not.toHaveBeenCalled();
      expect(cacheAllModifiers).not.toHaveBeenCalled();
      expect(cacheAllRecipes).not.toHaveBeenCalled();
    });

    it('should force refresh all when force option is true', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(cacheAllProducts).mockResolvedValue();
      vi.mocked(cacheAllCategories).mockResolvedValue();
      vi.mocked(cacheAllModifiers).mockResolvedValue();
      vi.mocked(cacheAllRecipes).mockResolvedValue();

      const result = await initProductsCache({ force: true });

      expect(result).toBe(true);
      expect(cacheAllProducts).toHaveBeenCalledTimes(1);
      expect(cacheAllCategories).toHaveBeenCalledTimes(1);
      expect(cacheAllModifiers).toHaveBeenCalledTimes(1);
      expect(cacheAllRecipes).toHaveBeenCalledTimes(1);
    });

    it('should return false on error without throwing', async () => {
      vi.mocked(shouldRefreshProducts).mockRejectedValue(new Error('DB error'));

      const result = await initProductsCache();

      expect(result).toBe(false);
    });

    it('should set initialized state after first call', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(getLastProductsSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastCategoriesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      expect(isProductsCacheInitialized()).toBe(false);
      await initProductsCache();
      expect(isProductsCacheInitialized()).toBe(true);
    });
  });

  describe('stopProductsCacheRefresh', () => {
    it('should reset initialized state', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(getLastProductsSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastCategoriesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      await initProductsCache();
      expect(isProductsCacheInitialized()).toBe(true);

      stopProductsCacheRefresh();
      expect(isProductsCacheInitialized()).toBe(false);
    });
  });

  describe('hourly refresh', () => {
    it('should trigger hourly refresh for stale entities', async () => {
      // Setup initial state
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(getLastProductsSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastCategoriesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true,
      });

      await initProductsCache();

      // Setup for hourly refresh
      vi.mocked(shouldRefreshProductsHourly).mockResolvedValue(true);
      vi.mocked(shouldRefreshCategoriesHourly).mockResolvedValue(true);
      vi.mocked(shouldRefreshModifiersHourly).mockResolvedValue(true);
      vi.mocked(shouldRefreshRecipesHourly).mockResolvedValue(true);
      vi.mocked(cacheAllProducts).mockResolvedValue();
      vi.mocked(cacheAllCategories).mockResolvedValue();
      vi.mocked(cacheAllModifiers).mockResolvedValue();
      vi.mocked(cacheAllRecipes).mockResolvedValue();

      // Advance time by 1 hour
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

      expect(shouldRefreshProductsHourly).toHaveBeenCalled();
      expect(shouldRefreshCategoriesHourly).toHaveBeenCalled();
      expect(shouldRefreshModifiersHourly).toHaveBeenCalled();
      expect(shouldRefreshRecipesHourly).toHaveBeenCalled();
      expect(cacheAllProducts).toHaveBeenCalled();
      expect(cacheAllCategories).toHaveBeenCalled();
      expect(cacheAllModifiers).toHaveBeenCalled();
      expect(cacheAllRecipes).toHaveBeenCalled();
    });

    it('should skip hourly refresh when offline', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(getLastProductsSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastCategoriesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      // Mock navigator.onLine as offline
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });

      await initProductsCache();

      vi.clearAllMocks();

      // Advance time by 1 hour
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

      expect(shouldRefreshProductsHourly).not.toHaveBeenCalled();
      expect(shouldRefreshCategoriesHourly).not.toHaveBeenCalled();
      expect(shouldRefreshModifiersHourly).not.toHaveBeenCalled();
      expect(shouldRefreshRecipesHourly).not.toHaveBeenCalled();
    });

    it('should only refresh entities that need refresh', async () => {
      vi.mocked(shouldRefreshProducts).mockResolvedValue(false);
      vi.mocked(shouldRefreshCategories).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiers).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipes).mockResolvedValue(false);
      vi.mocked(getLastProductsSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastCategoriesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastModifiersSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');
      vi.mocked(getLastRecipesSyncAt).mockResolvedValue('2026-01-30T10:00:00Z');

      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true,
      });

      await initProductsCache();

      // Only products and recipes need refresh
      vi.mocked(shouldRefreshProductsHourly).mockResolvedValue(true);
      vi.mocked(shouldRefreshCategoriesHourly).mockResolvedValue(false);
      vi.mocked(shouldRefreshModifiersHourly).mockResolvedValue(false);
      vi.mocked(shouldRefreshRecipesHourly).mockResolvedValue(true);
      vi.mocked(cacheAllProducts).mockResolvedValue();
      vi.mocked(cacheAllRecipes).mockResolvedValue();

      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

      expect(cacheAllProducts).toHaveBeenCalled();
      expect(cacheAllCategories).not.toHaveBeenCalled();
      expect(cacheAllModifiers).not.toHaveBeenCalled();
      expect(cacheAllRecipes).toHaveBeenCalled();
    });
  });
});
