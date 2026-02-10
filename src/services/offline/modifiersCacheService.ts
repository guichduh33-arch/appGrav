/**
 * Modifiers Cache Service for Offline Support
 *
 * Provides offline caching for product modifiers to enable modifier selection
 * when the application is offline.
 *
 * Features:
 * - Cache all active modifiers from Supabase to IndexedDB
 * - Retrieve modifiers by product ID or category ID
 * - Resolve modifier inheritance (product > category)
 * - Group flat modifier rows into structured ModifierGroup[]
 * - Track cache freshness with sync metadata
 *
 * @see Story 2.3: Product Modifiers Offline Cache
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */

import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';
import { db } from '@/lib/db';
import type { IOfflineModifier, ISyncMeta } from '@/types/offline';
import type { ModifierGroup } from '@/hooks/products/useProductModifiers';

// =====================================================
// Constants
// =====================================================

/** Cache TTL: 24 hours */
const CACHE_TTL_HOURS = 24;

/** Refresh interval when online: 1 hour */
const REFRESH_INTERVAL_HOURS = 1;

// =====================================================
// Cache Operations
// =====================================================

/**
 * Fetches all active modifiers from Supabase and caches them in IndexedDB.
 *
 * This function:
 * 1. Queries all active modifiers from Supabase
 * 2. Transforms data to IOfflineModifier format with proper defaults
 * 3. Clears existing cache and bulk inserts new data
 * 4. Updates sync metadata
 *
 * @throws Error if Supabase query fails
 */
export async function cacheAllModifiers(): Promise<void> {
  const { data, error } = await supabase
    .from('product_modifiers')
    .select(`
      id, product_id, category_id, group_name, group_type, group_required,
      group_sort_order, option_id, option_label, option_icon,
      price_adjustment, is_default, option_sort_order, is_active, created_at
    `)
    .eq('is_active', true);

  if (error) throw error;

  // Transform to IOfflineModifier format with proper defaults
  const modifiers: IOfflineModifier[] = (data || []).map((m) => ({
    id: m.id,
    product_id: m.product_id,
    category_id: m.category_id,
    group_name: m.group_name,
    group_type: (m.group_type as 'single' | 'multiple') || 'single',
    group_required: Boolean(m.group_required),
    group_sort_order: m.group_sort_order ?? 0,
    option_id: m.option_id,
    option_label: m.option_label,
    option_icon: m.option_icon,
    price_adjustment: m.price_adjustment ?? 0,
    is_default: Boolean(m.is_default),
    option_sort_order: m.option_sort_order ?? 0,
    is_active: Boolean(m.is_active),
    created_at: m.created_at,
  }));

  // Clear and repopulate cache
  await db.offline_modifiers.clear();
  if (modifiers.length > 0) {
    await db.offline_modifiers.bulkAdd(modifiers);
  }

  // Update sync metadata
  await db.offline_sync_meta.put({
    entity: 'modifiers',
    lastSyncAt: new Date().toISOString(),
    recordCount: modifiers.length,
  });

  logger.debug(`[ModifiersCache] Cached ${modifiers.length} modifiers`);
}

/**
 * Retrieves cached modifiers for a specific product.
 *
 * @param productId - The product UUID
 * @returns Array of modifiers linked to this product
 */
export async function getCachedModifiersForProduct(
  productId: string
): Promise<IOfflineModifier[]> {
  try {
    const modifiers = await db.offline_modifiers
      .where('product_id')
      .equals(productId)
      .toArray();

    // Filter active modifiers (Dexie stores booleans as 0/1)
    return modifiers.filter((m) => Boolean(m.is_active));
  } catch (error) {
    console.error('[ModifiersCache] Error getting product modifiers:', error);
    return [];
  }
}

/**
 * Retrieves cached modifiers for a specific category.
 *
 * @param categoryId - The category UUID
 * @returns Array of modifiers linked to this category
 */
export async function getCachedModifiersForCategory(
  categoryId: string
): Promise<IOfflineModifier[]> {
  try {
    const modifiers = await db.offline_modifiers
      .where('category_id')
      .equals(categoryId)
      .toArray();

    // Filter active modifiers (Dexie stores booleans as 0/1)
    return modifiers.filter((m) => Boolean(m.is_active));
  } catch (error) {
    console.error('[ModifiersCache] Error getting category modifiers:', error);
    return [];
  }
}

/**
 * Retrieves a single modifier by its ID.
 *
 * @param modifierId - The modifier UUID
 * @returns The modifier or undefined if not found
 */
export async function getCachedModifierById(
  modifierId: string
): Promise<IOfflineModifier | undefined> {
  try {
    return await db.offline_modifiers.get(modifierId);
  } catch (error) {
    console.error('[ModifiersCache] Error getting modifier by ID:', error);
    return undefined;
  }
}

/**
 * Returns the count of cached modifiers.
 */
export async function getCachedModifiersCount(): Promise<number> {
  try {
    return await db.offline_modifiers.count();
  } catch (error) {
    console.error('[ModifiersCache] Error counting modifiers:', error);
    return 0;
  }
}

// =====================================================
// Modifier Resolution (Product > Category Inheritance)
// =====================================================

/**
 * Resolves modifiers for a product with proper inheritance.
 *
 * Resolution rules:
 * 1. Fetch product-specific modifiers
 * 2. Fetch category modifiers (if categoryId provided)
 * 3. Product groups override category groups with the same name
 * 4. Non-overridden category groups are inherited
 *
 * @param productId - The product UUID (optional)
 * @param categoryId - The category UUID (optional)
 * @returns Resolved and grouped modifiers ready for POS display
 */
export async function resolveOfflineModifiers(
  productId: string | undefined,
  categoryId: string | undefined
): Promise<ModifierGroup[]> {
  // Fetch product-specific modifiers
  const productModifiers = productId
    ? await getCachedModifiersForProduct(productId)
    : [];

  // Fetch category modifiers
  const categoryModifiers = categoryId
    ? await getCachedModifiersForCategory(categoryId)
    : [];

  // Group modifiers
  const productGroups = groupOfflineModifiers(productModifiers, false);
  const categoryGroups = groupOfflineModifiers(categoryModifiers, true);

  // Get names of product-specific groups
  const productGroupNames = new Set(productGroups.map((g) => g.name));

  // Keep category groups that don't have product overrides
  const inheritedGroups = categoryGroups.filter(
    (g) => !productGroupNames.has(g.name)
  );

  // Combine: product groups + non-overridden category groups
  const combined = [...productGroups, ...inheritedGroups];

  // Sort by sortOrder
  combined.sort((a, b) => a.sortOrder - b.sortOrder);

  return combined;
}

/**
 * Groups flat modifier rows into structured ModifierGroup array.
 *
 * This function transforms the flat database structure where each row
 * represents a single option into a hierarchical structure where
 * options are grouped by group_name.
 *
 * @param modifiers - Flat array of offline modifiers
 * @param isInherited - Whether these modifiers are from category (inherited)
 * @returns Array of grouped modifiers
 */
export function groupOfflineModifiers(
  modifiers: IOfflineModifier[],
  isInherited: boolean = false
): ModifierGroup[] {
  const groupMap = new Map<string, ModifierGroup>();

  for (const mod of modifiers) {
    // Skip inactive modifiers
    if (!mod.is_active) continue;

    if (!groupMap.has(mod.group_name)) {
      groupMap.set(mod.group_name, {
        name: mod.group_name,
        type: mod.group_type,
        required: mod.group_required,
        sortOrder: mod.group_sort_order,
        options: [],
        isInherited,
      });
    }

    const group = groupMap.get(mod.group_name)!;
    group.options.push({
      id: mod.option_id,
      dbId: mod.id,
      label: mod.option_label,
      icon: mod.option_icon || undefined,
      priceAdjustment: mod.price_adjustment,
      isDefault: mod.is_default,
      sortOrder: mod.option_sort_order,
    });
  }

  // Sort options within each group by sortOrder
  for (const group of groupMap.values()) {
    group.options.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return Array.from(groupMap.values());
}

// =====================================================
// Sync Metadata
// =====================================================

/**
 * Returns the timestamp of the last modifiers sync.
 *
 * @returns ISO 8601 timestamp or null if never synced
 */
export async function getLastModifiersSyncAt(): Promise<string | null> {
  try {
    const meta = await db.offline_sync_meta.get('modifiers');
    return meta?.lastSyncAt ?? null;
  } catch (error) {
    console.error('[ModifiersCache] Error getting sync timestamp:', error);
    return null;
  }
}

/**
 * Returns the full sync metadata for modifiers.
 *
 * @returns Sync metadata or null if never synced
 */
export async function getModifiersSyncMeta(): Promise<ISyncMeta | null> {
  try {
    const meta = await db.offline_sync_meta.get('modifiers');
    return meta ?? null;
  } catch (error) {
    console.error('[ModifiersCache] Error getting sync metadata:', error);
    return null;
  }
}

// =====================================================
// Cache Freshness Checks
// =====================================================

/**
 * Checks if the modifiers cache needs to be refreshed (24h TTL).
 *
 * @returns true if cache is stale or doesn't exist
 */
export async function shouldRefreshModifiers(): Promise<boolean> {
  try {
    const meta = await db.offline_sync_meta.get('modifiers');
    if (!meta) return true;

    const lastSync = new Date(meta.lastSyncAt);
    const hoursSinceSync =
      (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync >= CACHE_TTL_HOURS;
  } catch (error) {
    console.error('[ModifiersCache] Error checking cache freshness:', error);
    return true;
  }
}

/**
 * Checks if the modifiers cache should be refreshed based on hourly interval.
 *
 * This is a softer check than shouldRefreshModifiers - it triggers refresh
 * more frequently (every hour) when online to keep data fresh.
 *
 * @returns true if more than 1 hour since last sync
 */
export async function shouldRefreshModifiersHourly(): Promise<boolean> {
  try {
    const meta = await db.offline_sync_meta.get('modifiers');
    if (!meta) return true;

    const lastSync = new Date(meta.lastSyncAt);
    const hoursSinceSync =
      (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync >= REFRESH_INTERVAL_HOURS;
  } catch (error) {
    console.error('[ModifiersCache] Error checking hourly refresh:', error);
    return true;
  }
}

/**
 * Refreshes the modifiers cache if needed.
 *
 * @param force - If true, refresh regardless of TTL
 * @returns true if refresh was performed
 */
export async function refreshModifiersCacheIfNeeded(
  force: boolean = false
): Promise<boolean> {
  try {
    const needsRefresh = force || (await shouldRefreshModifiers());
    if (needsRefresh) {
      await cacheAllModifiers();
      return true;
    }
    return false;
  } catch (error) {
    console.error('[ModifiersCache] Error refreshing cache:', error);
    return false;
  }
}

// =====================================================
// Cache Management
// =====================================================

/**
 * Clears all cached modifiers and sync metadata.
 */
export async function clearModifiersCache(): Promise<void> {
  try {
    await db.offline_modifiers.clear();
    await db.offline_sync_meta.delete('modifiers');
    logger.debug('[ModifiersCache] Cache cleared');
  } catch (error) {
    console.error('[ModifiersCache] Error clearing cache:', error);
  }
}
