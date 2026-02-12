/**
 * Recipes Cache Service (Story 2.4)
 *
 * Manages offline caching of recipes for costing display.
 * Follows patterns established in productsCacheService (Story 2.1).
 *
 * Cache Policy (ADR-003):
 * - TTL: 24 hours max
 * - Refresh: At startup + every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type {
  IOfflineRecipe,
  IOfflineRecipeWithMaterial,
  ISyncMeta,
} from '@/types/offline';
import {
  RECIPES_CACHE_TTL_MS,
  RECIPES_REFRESH_INTERVAL_MS,
} from '@/types/offline';
import { logError } from '@/utils/logger'

// =====================================================
// Cache Operations
// =====================================================

/**
 * Cache all active recipes from Supabase to IndexedDB
 *
 * Fetches recipes with all fields needed for costing display
 * and stores them in offline_recipes table.
 *
 * @throws Error if Supabase query fails
 */
export async function cacheAllRecipes(): Promise<void> {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      'id, product_id, material_id, quantity, unit, is_active, created_at, updated_at'
    )
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from recipes query');
  }

  // Map data to ensure proper boolean coercion for is_active
  const recipes: IOfflineRecipe[] = data.map((r) => ({
    id: r.id,
    product_id: r.product_id,
    material_id: r.material_id,
    quantity: r.quantity,
    unit: r.unit,
    is_active: Boolean(r.is_active),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  // Clear existing cache and replace with fresh data
  await db.offline_recipes.clear();
  await db.offline_recipes.bulkAdd(recipes);

  // Update sync metadata
  await db.offline_sync_meta.put({
    entity: 'recipes',
    lastSyncAt: new Date().toISOString(),
    recordCount: data.length,
  });
}

// =====================================================
// Read Operations
// =====================================================

/**
 * Get cached recipes for a specific product
 *
 * Returns all active recipe ingredients for costing calculation.
 *
 * Note: Dexie stores booleans as 0/1 in indexes, so we filter in memory.
 *
 * @param productId - Product UUID
 * @returns Array of recipe ingredients
 */
export async function getCachedRecipesForProduct(
  productId: string
): Promise<IOfflineRecipe[]> {
  try {
    const allRecipes = await db.offline_recipes
      .where('product_id')
      .equals(productId)
      .toArray();

    // Filter for active recipes (boolean coercion for Dexie 0/1 storage)
    return allRecipes.filter((r) => Boolean(r.is_active));
  } catch (error) {
    logError('Error reading cached recipes:', error);
    return [];
  }
}

/**
 * Get cached recipes with joined material data for costing display
 *
 * Joins recipe data with offline_products to get material cost_price.
 * This is the main function used by the CostingTab component.
 *
 * @param productId - Product UUID
 * @returns Array of recipes with material details
 */
export async function getCachedRecipesWithMaterials(
  productId: string
): Promise<IOfflineRecipeWithMaterial[]> {
  try {
    const recipes = await getCachedRecipesForProduct(productId);

    if (recipes.length === 0) {
      return [];
    }

    // Get all material IDs
    const materialIds = recipes.map((r) => r.material_id);

    // Fetch materials from offline_products cache
    const materials = await db.offline_products
      .where('id')
      .anyOf(materialIds)
      .toArray();

    // Create lookup map
    const materialMap = new Map(materials.map((m) => [m.id, m]));

    // Join recipes with materials
    return recipes.map((recipe) => {
      const material = materialMap.get(recipe.material_id);
      return {
        ...recipe,
        material: material
          ? {
              id: material.id,
              name: material.name,
              sku: material.sku,
              unit: null, // Unit comes from recipe or material
              cost_price: material.cost_price,
            }
          : null,
      };
    });
  } catch (error) {
    logError('Error reading cached recipes with materials:', error);
    return [];
  }
}

/**
 * Get a single cached recipe by ID
 *
 * @param id - Recipe UUID
 * @returns Recipe or undefined if not found
 */
export async function getCachedRecipeById(
  id: string
): Promise<IOfflineRecipe | undefined> {
  try {
    return await db.offline_recipes.get(id);
  } catch (error) {
    logError('Error reading cached recipe:', error);
    return undefined;
  }
}

/**
 * Get all cached recipes (for debugging/admin purposes)
 *
 * @returns Array of all cached recipes
 */
export async function getAllCachedRecipes(): Promise<IOfflineRecipe[]> {
  try {
    const allRecipes = await db.offline_recipes.toArray();
    return allRecipes.filter((r) => Boolean(r.is_active));
  } catch (error) {
    logError('Error reading all cached recipes:', error);
    return [];
  }
}

// =====================================================
// Sync Metadata Operations
// =====================================================

/**
 * Get the timestamp of the last recipes sync
 *
 * @returns ISO 8601 timestamp or null if never synced
 */
export async function getLastRecipesSyncAt(): Promise<string | null> {
  try {
    const meta = await db.offline_sync_meta.get('recipes');
    return meta?.lastSyncAt ?? null;
  } catch (error) {
    logError('Error reading recipes sync meta:', error);
    return null;
  }
}

/**
 * Get full sync metadata for recipes
 *
 * @returns Sync metadata or undefined if not synced
 */
export async function getRecipesSyncMeta(): Promise<ISyncMeta | undefined> {
  try {
    return await db.offline_sync_meta.get('recipes');
  } catch (error) {
    logError('Error reading recipes sync meta:', error);
    return undefined;
  }
}

/**
 * Get the count of cached recipes
 *
 * @returns Number of recipes in cache
 */
export async function getCachedRecipesCount(): Promise<number> {
  try {
    return await db.offline_recipes.count();
  } catch (error) {
    logError('Error counting cached recipes:', error);
    return 0;
  }
}

// =====================================================
// Cache Refresh Logic
// =====================================================

/**
 * Check if recipes cache needs refresh due to TTL expiration (24h)
 *
 * @returns true if cache is stale or doesn't exist
 */
export async function shouldRefreshRecipes(): Promise<boolean> {
  const meta = await getRecipesSyncMeta();
  if (!meta) return true;

  const lastSync = new Date(meta.lastSyncAt).getTime();
  const now = Date.now();

  return now - lastSync >= RECIPES_CACHE_TTL_MS;
}

/**
 * Check if recipes cache should be refreshed due to hourly interval
 *
 * @returns true if more than 1 hour since last sync
 */
export async function shouldRefreshRecipesHourly(): Promise<boolean> {
  const meta = await getRecipesSyncMeta();
  if (!meta) return true;

  const lastSync = new Date(meta.lastSyncAt).getTime();
  const now = Date.now();

  return now - lastSync >= RECIPES_REFRESH_INTERVAL_MS;
}

/**
 * Refresh recipes cache if needed (respects TTL/interval)
 *
 * Call at app startup or periodically when online.
 *
 * @param force - If true, refresh regardless of TTL
 * @returns true if cache was refreshed, false if skipped
 */
export async function refreshRecipesCacheIfNeeded(
  force = false
): Promise<boolean> {
  if (!force) {
    const needsRefresh = await shouldRefreshRecipes();
    if (!needsRefresh) {
      return false;
    }
  }

  await cacheAllRecipes();
  return true;
}

/**
 * Clear the recipes cache
 *
 * Use when logging out or resetting app state.
 */
export async function clearRecipesCache(): Promise<void> {
  await db.offline_recipes.clear();
  await db.offline_sync_meta.delete('recipes');
}
