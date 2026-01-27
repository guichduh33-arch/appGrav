/**
 * Product Sync Service
 * Story 2.1 - Offline Product Catalog Sync
 *
 * Handles synchronization of products and categories between Supabase and IndexedDB.
 * Enables offline product browsing for POS operations.
 */

import { supabase } from '@/lib/supabase';
import {
  offlineDb,
  IOfflineProduct,
  IOfflineCategory,
  IOfflineProductModifier,
} from './offlineDb';

// Re-export interfaces for consumers
export type { IOfflineProduct, IOfflineCategory, IOfflineProductModifier };

/**
 * Local storage keys for sync timestamps
 */
const SYNC_TIMESTAMPS = {
  PRODUCTS: 'appgrav_products_last_sync',
  CATEGORIES: 'appgrav_categories_last_sync',
  MODIFIERS: 'appgrav_modifiers_last_sync',
} as const;

/**
 * Get last sync timestamp for a given key
 */
function getLastSyncTimestamp(key: string): string | null {
  return localStorage.getItem(key);
}

/**
 * Set last sync timestamp for a given key
 */
function setLastSyncTimestamp(key: string, timestamp: string): void {
  localStorage.setItem(key, timestamp);
}

/**
 * Sync all products from Supabase to IndexedDB
 * Uses incremental sync if last sync timestamp exists
 *
 * @returns Number of products synced
 */
export async function syncProductsToOffline(): Promise<number> {
  const lastSync = getLastSyncTimestamp(SYNC_TIMESTAMPS.PRODUCTS);

  let query = supabase
    .from('products')
    .select('id, category_id, name, sku, retail_price, is_active, image_url, updated_at')
    .eq('is_active', true)
    .eq('pos_visible', true)
    .eq('available_for_sale', true)
    .order('updated_at', { ascending: false });

  // Incremental sync: only get products updated since last sync
  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ProductSync] Error fetching products:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('[ProductSync] No new products to sync');
    return 0;
  }

  // Transform to offline format
  const offlineProducts: IOfflineProduct[] = data.map((p) => ({
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    sku: p.sku,
    price: p.retail_price ?? 0,
    is_active: p.is_active ?? true,
    image_url: p.image_url,
    updated_at: p.updated_at ?? new Date().toISOString(),
  }));

  // Bulk upsert to IndexedDB
  await offlineDb.products.bulkPut(offlineProducts);

  // Update last sync timestamp
  const latestTimestamp = data[0].updated_at ?? new Date().toISOString();
  setLastSyncTimestamp(SYNC_TIMESTAMPS.PRODUCTS, latestTimestamp);

  console.log(`[ProductSync] Synced ${offlineProducts.length} products`);
  return offlineProducts.length;
}

/**
 * Get all products from IndexedDB for offline use
 *
 * @param categoryId Optional category filter
 * @returns Array of offline products
 */
export async function getProductsFromOffline(
  categoryId?: string | null
): Promise<IOfflineProduct[]> {
  let products: IOfflineProduct[];

  if (categoryId) {
    products = await offlineDb.products
      .where('category_id')
      .equals(categoryId)
      .filter((p) => p.is_active)
      .toArray();
  } else {
    products = await offlineDb.products
      .filter((p) => p.is_active)
      .toArray();
  }

  // Sort by name
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sync all categories from Supabase to IndexedDB
 *
 * @returns Number of categories synced
 */
export async function syncCategoriesToOffline(): Promise<number> {
  // Note: lastSync not currently used for categories (full refresh)
  // const lastSync = getLastSyncTimestamp(SYNC_TIMESTAMPS.CATEGORIES);

  const query = supabase
    .from('categories')
    .select('id, name, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order');

  const { data, error } = await query;

  if (error) {
    console.error('[ProductSync] Error fetching categories:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('[ProductSync] No categories to sync');
    return 0;
  }

  // Transform to offline format
  const offlineCategories: IOfflineCategory[] = data.map((c) => ({
    id: c.id,
    name: c.name,
    display_order: c.sort_order ?? 0,
    is_active: c.is_active ?? true,
  }));

  // Clear and replace all categories (they're small enough)
  await offlineDb.categories.clear();
  await offlineDb.categories.bulkAdd(offlineCategories);

  // Update last sync timestamp
  setLastSyncTimestamp(SYNC_TIMESTAMPS.CATEGORIES, new Date().toISOString());

  console.log(`[ProductSync] Synced ${offlineCategories.length} categories`);
  return offlineCategories.length;
}

/**
 * Get all categories from IndexedDB for offline use
 *
 * @returns Array of offline categories sorted by display order
 */
export async function getCategoriesFromOffline(): Promise<IOfflineCategory[]> {
  const categories = await offlineDb.categories
    .filter((c) => c.is_active)
    .toArray();

  return categories.sort((a, b) => a.display_order - b.display_order);
}

/**
 * Sync product modifiers from Supabase to IndexedDB
 *
 * @returns Number of modifiers synced
 */
export async function syncModifiersToOffline(): Promise<number> {
  const { data, error } = await supabase
    .from('product_modifiers')
    .select('id, product_id, option_label, price_adjustment')
    .eq('is_active', true);

  if (error) {
    console.error('[ProductSync] Error fetching modifiers:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('[ProductSync] No modifiers to sync');
    return 0;
  }

  // Transform to offline format
  const offlineModifiers: IOfflineProductModifier[] = data.map((m) => ({
    id: m.id,
    product_id: m.product_id ?? '',
    name: m.option_label,
    price_adjustment: m.price_adjustment ?? 0,
  }));

  // Clear and replace all modifiers
  await offlineDb.product_modifiers.clear();
  await offlineDb.product_modifiers.bulkAdd(offlineModifiers);

  setLastSyncTimestamp(SYNC_TIMESTAMPS.MODIFIERS, new Date().toISOString());

  console.log(`[ProductSync] Synced ${offlineModifiers.length} modifiers`);
  return offlineModifiers.length;
}

/**
 * Get modifiers for a specific product from IndexedDB
 *
 * @param productId Product ID to get modifiers for
 * @returns Array of product modifiers
 */
export async function getModifiersFromOffline(
  productId: string
): Promise<IOfflineProductModifier[]> {
  return offlineDb.product_modifiers
    .where('product_id')
    .equals(productId)
    .toArray();
}

/**
 * Perform full sync of all product-related data
 * Call this on app startup or when reconnecting after offline period
 *
 * @returns Object with counts of synced items
 */
export async function syncAllProductData(): Promise<{
  products: number;
  categories: number;
  modifiers: number;
}> {
  const [products, categories, modifiers] = await Promise.all([
    syncProductsToOffline(),
    syncCategoriesToOffline(),
    syncModifiersToOffline(),
  ]);

  return { products, categories, modifiers };
}

/**
 * Check if offline product data exists
 *
 * @returns true if products are cached locally
 */
export async function hasOfflineProductData(): Promise<boolean> {
  const count = await offlineDb.products.count();
  return count > 0;
}

/**
 * Clear all offline product data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflineProductData(): Promise<void> {
  await Promise.all([
    offlineDb.products.clear(),
    offlineDb.categories.clear(),
    offlineDb.product_modifiers.clear(),
  ]);

  localStorage.removeItem(SYNC_TIMESTAMPS.PRODUCTS);
  localStorage.removeItem(SYNC_TIMESTAMPS.CATEGORIES);
  localStorage.removeItem(SYNC_TIMESTAMPS.MODIFIERS);

  console.log('[ProductSync] Cleared all offline product data');
}
