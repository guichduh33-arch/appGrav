/**
 * useRecipesOffline Hook (Story 2.4)
 *
 * Provides transparent online/offline access to recipes for costing display.
 * Automatically switches between Supabase (online) and Dexie (offline).
 *
 * Follows patterns established in useProductsOffline (Story 2.1).
 *
 * @see ADR-001: Entités Synchronisées Offline
 */

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { logError } from '@/utils/logger';
import { useNetworkStatus } from './useNetworkStatus';
import { useProductRecipe, IRecipeIngredient } from '../inventory/useProductRecipe';
import {
  getCachedRecipesWithMaterials,
  getLastRecipesSyncAt,
  getRecipesSyncMeta,
} from '@/services/offline/recipesCacheService';
import type { IOfflineRecipeWithMaterial, ISyncMeta } from '@/types/offline';
import type { Product, Recipe } from '@/types/database';

/**
 * Return type for useRecipesOffline hook
 */
export interface IUseRecipesOfflineReturn {
  /** Array of recipe ingredients (from Supabase or cache) */
  data: (Recipe & { material: Product })[];

  /** Whether data is currently loading */
  isLoading: boolean;

  /** Whether we're in offline mode */
  isOffline: boolean;

  /** Error if any occurred (online mode only) */
  error: Error | null;

  /** ISO timestamp of last cache sync (offline mode info) */
  lastSyncAt: string | null;

  /** Sync metadata for cache status display */
  syncMeta: ISyncMeta | undefined;
}

/**
 * Map offline recipe with material to the format expected by CostingTab
 *
 * Converts IOfflineRecipeWithMaterial to (Recipe & { material: Product })
 */
function mapToRecipeWithMaterial(
  recipe: IOfflineRecipeWithMaterial
): Recipe & { material: Product } {
  return {
    id: recipe.id,
    product_id: recipe.product_id,
    material_id: recipe.material_id,
    quantity: recipe.quantity,
    unit: recipe.unit,
    is_active: Boolean(recipe.is_active),
    created_at: recipe.created_at,
    updated_at: recipe.updated_at,
    material: recipe.material
      ? ({
          id: recipe.material.id,
          name: recipe.material.name,
          sku: recipe.material.sku,
          unit: recipe.material.unit || recipe.unit,
          cost_price: recipe.material.cost_price,
          current_stock: recipe.material.current_stock ?? 0,
        } as unknown as Product)
      : ({
          id: recipe.material_id,
          name: 'Unknown Material',
          sku: null,
          unit: recipe.unit,
          cost_price: 0,
          current_stock: 0,
        } as unknown as Product),
  } as Recipe & { material: Product };
}

/**
 * Hook for accessing recipes with automatic online/offline switching
 *
 * @param productId - Product UUID to fetch recipes for
 * @returns Recipes data with loading/offline status
 *
 * @example
 * ```tsx
 * function CostingDisplay({ productId }: { productId: string }) {
 *   const { data, isLoading, isOffline, lastSyncAt } = useRecipesOffline(productId);
 *
 *   if (isOffline && lastSyncAt) {
 *     return (
 *       <>
 *         <OfflineBanner syncTime={lastSyncAt} />
 *         <CostingTab recipeItems={data} />
 *       </>
 *     );
 *   }
 *
 *   return <CostingTab recipeItems={data} />;
 * }
 * ```
 */
export function useRecipesOffline(
  productId: string | null
): IUseRecipesOfflineReturn {
  const { isOnline } = useNetworkStatus();

  // Online: use existing useProductRecipe hook (Supabase via React Query)
  const onlineResult = useProductRecipe(productId);

  // Offline: use Dexie with live updates
  const offlineRecipes = useLiveQuery(
    async () => {
      if (isOnline || !productId) return null;
      try {
        return await getCachedRecipesWithMaterials(productId);
      } catch (error) {
        logError('Error loading offline recipes', error);
        return [];
      }
    },
    [isOnline, productId]
  );

  // Get sync metadata for offline mode
  const syncMeta = useLiveQuery(
    async () => {
      if (isOnline) return undefined;
      try {
        return await getRecipesSyncMeta();
      } catch (error) {
        logError('Error loading recipes sync meta', error);
        return undefined;
      }
    },
    [isOnline]
  );

  // Get last sync timestamp
  const lastSyncAt = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await getLastRecipesSyncAt();
      } catch (error) {
        logError('Error loading last recipes sync time', error);
        return null;
      }
    },
    [isOnline]
  );

  // Convert offline recipes to expected format
  const offlineData = useMemo(() => {
    if (!offlineRecipes) return [];
    return offlineRecipes.map(mapToRecipeWithMaterial);
  }, [offlineRecipes]);

  // Convert online data to match expected format
  const onlineData = useMemo(() => {
    if (!onlineResult.data) return [];
    // Map IRecipeIngredient to Recipe & { material: Product }
    return onlineResult.data.map((item: IRecipeIngredient) => ({
      id: item.id,
      product_id: item.product_id,
      material_id: item.material_id,
      quantity: item.quantity,
      unit: null,
      is_active: item.is_active,
      created_at: null,
      updated_at: null,
      material: item.material
        ? ({
            id: item.material.id,
            name: item.material.name,
            sku: null,
            unit: item.material.unit,
            cost_price: item.material.cost_price ?? null,
            current_stock: item.material.current_stock,
          } as unknown as Product)
        : ({
            id: item.material_id,
            name: 'Unknown',
            sku: null,
            unit: null,
            cost_price: null,
            current_stock: 0,
          } as unknown as Product),
    })) as (Recipe & { material: Product })[];
  }, [onlineResult.data]);

  // Determine loading state
  const isLoading = isOnline
    ? onlineResult.isLoading
    : offlineRecipes === undefined;

  // Determine data source
  const data = isOnline ? onlineData : offlineData;

  // Error only from online mode
  const error = isOnline ? (onlineResult.error as Error | null) : null;

  return {
    data,
    isLoading,
    isOffline: !isOnline,
    error,
    lastSyncAt: lastSyncAt ?? null,
    syncMeta,
  };
}

/**
 * Hook variant that returns raw offline recipes (not mapped)
 *
 * Use this when you need direct access to IOfflineRecipeWithMaterial interface,
 * such as for custom costing calculations.
 */
export function useOfflineRecipesRaw(productId: string | null): {
  recipes: IOfflineRecipeWithMaterial[];
  isLoading: boolean;
  syncMeta: ISyncMeta | undefined;
} {
  const recipes = useLiveQuery(
    async () => {
      if (!productId) return [];
      try {
        return await getCachedRecipesWithMaterials(productId);
      } catch (error) {
        logError('Error loading offline recipes', error);
        return [];
      }
    },
    [productId]
  );

  const syncMeta = useLiveQuery(
    async () => {
      try {
        return await getRecipesSyncMeta();
      } catch (error) {
        logError('Error loading recipes sync meta', error);
        return undefined;
      }
    },
    []
  );

  return {
    recipes: recipes ?? [],
    isLoading: recipes === undefined,
    syncMeta,
  };
}
