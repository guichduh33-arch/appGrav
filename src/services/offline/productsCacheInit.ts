/**
 * Data Cache Initialization (Story 2.1 + 2.2 + 2.3 + 2.4)
 *
 * Handles products, categories, modifiers, and recipes cache initialization at app startup
 * and automatic refresh every hour when online.
 *
 * Usage:
 * - Call initProductsCache() after user authentication
 * - The service manages its own refresh intervals
 *
 * @see ADR-003: Politique de Cache
 */

import {
  cacheAllProducts,
  shouldRefreshProducts,
  shouldRefreshProductsHourly,
  getLastProductsSyncAt,
} from './productsCacheService';
import {
  cacheAllCategories,
  shouldRefreshCategories,
  shouldRefreshCategoriesHourly,
  getLastCategoriesSyncAt,
} from './categoriesCacheService';
import {
  cacheAllModifiers,
  shouldRefreshModifiers,
  shouldRefreshModifiersHourly,
  getLastModifiersSyncAt,
} from './modifiersCacheService';
import {
  cacheAllRecipes,
  shouldRefreshRecipes,
  shouldRefreshRecipesHourly,
  getLastRecipesSyncAt,
} from './recipesCacheService';
import { PRODUCTS_REFRESH_INTERVAL_MS } from '@/types/offline';
import logger from '@/utils/logger';
import { logError } from '@/utils/logger'

let refreshIntervalId: ReturnType<typeof setInterval> | null = null;
let isInitialized = false;

/**
 * Initialize the products cache
 *
 * Call this after successful authentication when online.
 * Sets up automatic hourly refresh while online.
 *
 * @param options.force - Force refresh even if cache is fresh
 * @returns true if cache was refreshed, false if skipped
 */
export async function initProductsCache(
  options: { force?: boolean } = {}
): Promise<boolean> {
  const { force = false } = options;

  try {
    // Check if we need to refresh products
    const needsProductsRefresh = force || (await shouldRefreshProducts());
    // Check if we need to refresh categories
    const needsCategoriesRefresh = force || (await shouldRefreshCategories());
    // Check if we need to refresh modifiers
    const needsModifiersRefresh = force || (await shouldRefreshModifiers());
    // Check if we need to refresh recipes (Story 2.4)
    const needsRecipesRefresh = force || (await shouldRefreshRecipes());

    const refreshPromises: Promise<void>[] = [];

    if (needsProductsRefresh) {
      logger.debug('[DataCache] Refreshing products cache...');
      refreshPromises.push(cacheAllProducts());
    } else {
      const lastSync = await getLastProductsSyncAt();
      logger.debug(`[DataCache] Products cache is fresh (last sync: ${lastSync})`);
    }

    if (needsCategoriesRefresh) {
      logger.debug('[DataCache] Refreshing categories cache...');
      refreshPromises.push(cacheAllCategories());
    } else {
      const lastSync = await getLastCategoriesSyncAt();
      logger.debug(`[DataCache] Categories cache is fresh (last sync: ${lastSync})`);
    }

    if (needsModifiersRefresh) {
      logger.debug('[DataCache] Refreshing modifiers cache...');
      refreshPromises.push(cacheAllModifiers());
    } else {
      const lastSync = await getLastModifiersSyncAt();
      logger.debug(`[DataCache] Modifiers cache is fresh (last sync: ${lastSync})`);
    }

    if (needsRecipesRefresh) {
      logger.debug('[DataCache] Refreshing recipes cache...');
      refreshPromises.push(cacheAllRecipes());
    } else {
      const lastSync = await getLastRecipesSyncAt();
      logger.debug(`[DataCache] Recipes cache is fresh (last sync: ${lastSync})`);
    }

    // Refresh all in parallel - use allSettled to handle partial failures
    if (refreshPromises.length > 0) {
      const results = await Promise.allSettled(refreshPromises);
      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

      if (failures.length > 0) {
        failures.forEach((failure, idx) => {
          logError(`[DataCache] Cache refresh failed for entity ${idx}:`, failure.reason);
        });
        logger.debug(`[DataCache] Cache refresh completed with ${failures.length} failure(s)`);
      } else {
        logger.debug('[DataCache] Cache refresh completed successfully');
      }
    }

    // Start hourly refresh if not already started
    if (!isInitialized) {
      startHourlyRefresh();
      isInitialized = true;
    }

    return needsProductsRefresh || needsCategoriesRefresh || needsModifiersRefresh || needsRecipesRefresh;
  } catch (error) {
    logError('[DataCache] Failed to initialize cache:', error);
    // Don't throw - cache failure shouldn't block app startup
    return false;
  }
}

/**
 * Start automatic hourly refresh when online
 *
 * The interval checks if we're online before refreshing.
 * If offline, it skips until next interval.
 */
function startHourlyRefresh(): void {
  // Clear any existing interval
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  refreshIntervalId = setInterval(async () => {
    try {
      // Check if we're online (navigator.onLine)
      if (!navigator.onLine) {
        logger.debug('[DataCache] Offline, skipping hourly refresh');
        return;
      }

      // Check if enough time has passed for each entity
      const needsProductsRefresh = await shouldRefreshProductsHourly();
      const needsCategoriesRefresh = await shouldRefreshCategoriesHourly();
      const needsModifiersRefresh = await shouldRefreshModifiersHourly();
      const needsRecipesRefresh = await shouldRefreshRecipesHourly();

      if (!needsProductsRefresh && !needsCategoriesRefresh && !needsModifiersRefresh && !needsRecipesRefresh) {
        return;
      }

      const refreshPromises: Promise<void>[] = [];

      if (needsProductsRefresh) {
        logger.debug('[DataCache] Hourly products refresh triggered');
        refreshPromises.push(cacheAllProducts());
      }

      if (needsCategoriesRefresh) {
        logger.debug('[DataCache] Hourly categories refresh triggered');
        refreshPromises.push(cacheAllCategories());
      }

      if (needsModifiersRefresh) {
        logger.debug('[DataCache] Hourly modifiers refresh triggered');
        refreshPromises.push(cacheAllModifiers());
      }

      if (needsRecipesRefresh) {
        logger.debug('[DataCache] Hourly recipes refresh triggered');
        refreshPromises.push(cacheAllRecipes());
      }

      const results = await Promise.allSettled(refreshPromises);
      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

      if (failures.length > 0) {
        failures.forEach((failure) => {
          logError('[DataCache] Hourly refresh failed for entity:', failure.reason);
        });
        logger.debug(`[DataCache] Hourly refresh completed with ${failures.length} failure(s)`);
      } else {
        logger.debug('[DataCache] Hourly refresh completed successfully');
      }
    } catch (error) {
      logError('[DataCache] Hourly refresh error:', error);
    }
  }, PRODUCTS_REFRESH_INTERVAL_MS);

  logger.debug('[DataCache] Hourly refresh scheduled');
}

/**
 * Stop automatic refresh
 *
 * Call when logging out or cleaning up.
 */
export function stopProductsCacheRefresh(): void {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
  isInitialized = false;
  logger.debug('[DataCache] Refresh stopped');
}

/**
 * Check if products cache is initialized
 */
export function isProductsCacheInitialized(): boolean {
  return isInitialized;
}
