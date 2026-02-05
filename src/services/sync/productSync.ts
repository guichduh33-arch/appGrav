/**
 * Product Sync Service
 * Story 2.1 - Offline Product Catalog Sync
 *
 * Handles synchronization of products and categories between Supabase and IndexedDB.
 * Enables offline product browsing for POS operations.
 *
 * @migration Uses db.ts (unified schema) instead of legacy offlineDb.ts
 * Note: This service uses simplified schemas. For full-featured cache,
 * use productsCacheService.ts and categoriesCacheService.ts instead.
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { IOfflineModifier as IOfficialModifier } from '@/types/offline';

/**
 * Legacy product interface for this sync service
 * Maps to official IOfflineProduct with field adaptations
 */
export interface IOfflineProduct {
  id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  price: number;
  is_active: boolean;
  image_url: string | null;
  updated_at: string;
}

/**
 * Legacy category interface for this sync service
 */
export interface IOfflineCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

/**
 * Legacy modifier interface for this sync service
 */
export interface IOfflineProductModifier {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
}

// Internal legacy type aliases for clarity
type ILegacyProduct = IOfflineProduct;
type ILegacyCategory = IOfflineCategory;
type ILegacyModifier = IOfflineProductModifier;

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

  // Transform to official offline format with field mapping
  const now = new Date().toISOString();
  const officialProducts = data.map((p) => ({
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    sku: p.sku,
    product_type: 'finished' as const,
    retail_price: p.retail_price ?? 0,
    wholesale_price: null,
    cost_price: null,
    current_stock: null,
    image_url: p.image_url,
    is_active: p.is_active ?? true,
    pos_visible: true,
    available_for_sale: true,
    updated_at: p.updated_at ?? now,
  }));

  // Bulk upsert to IndexedDB using official table
  await db.offline_products.bulkPut(officialProducts);

  // Update last sync timestamp
  const latestTimestamp = data[0].updated_at ?? new Date().toISOString();
  setLastSyncTimestamp(SYNC_TIMESTAMPS.PRODUCTS, latestTimestamp);

  console.log(`[ProductSync] Synced ${officialProducts.length} products`);
  return officialProducts.length;
}

/**
 * Get all products from IndexedDB for offline use
 *
 * @param categoryId Optional category filter
 * @returns Array of offline products
 */
export async function getProductsFromOffline(
  categoryId?: string | null
): Promise<ILegacyProduct[]> {
  let officialProducts;

  if (categoryId) {
    officialProducts = await db.offline_products
      .where('category_id')
      .equals(categoryId)
      .filter((p) => Boolean(p.is_active))
      .toArray();
  } else {
    officialProducts = await db.offline_products
      .filter((p) => Boolean(p.is_active))
      .toArray();
  }

  // Map to legacy format and sort by name
  return officialProducts
    .map((p) => ({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      sku: p.sku,
      price: p.retail_price,
      is_active: Boolean(p.is_active),
      image_url: p.image_url,
      updated_at: p.updated_at,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
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

  // Transform to official format
  const now = new Date().toISOString();
  const officialCategories = data.map((c) => ({
    id: c.id,
    name: c.name,
    sort_order: c.sort_order ?? 0,
    is_active: c.is_active ?? true,
    is_raw_material: false,
    dispatch_station: 'none' as const,
    color: null,
    icon: null,
    updated_at: now,
  }));

  // Clear and replace all categories (they're small enough)
  await db.offline_categories.clear();
  await db.offline_categories.bulkAdd(officialCategories);

  // Update last sync timestamp
  setLastSyncTimestamp(SYNC_TIMESTAMPS.CATEGORIES, new Date().toISOString());

  console.log(`[ProductSync] Synced ${officialCategories.length} categories`);
  return officialCategories.length;
}

/**
 * Get all categories from IndexedDB for offline use
 *
 * @returns Array of offline categories sorted by display order
 */
export async function getCategoriesFromOffline(): Promise<ILegacyCategory[]> {
  const officialCategories = await db.offline_categories
    .filter((c) => Boolean(c.is_active))
    .toArray();

  // Map to legacy format and sort
  return officialCategories
    .map((c) => ({
      id: c.id,
      name: c.name,
      display_order: c.sort_order ?? 0,
      is_active: Boolean(c.is_active),
    }))
    .sort((a, b) => a.display_order - b.display_order);
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

  // Transform to official format with all required fields
  const now = new Date().toISOString();
  const officialModifiers: IOfficialModifier[] = data.map((m) => ({
    id: m.id,
    product_id: m.product_id ?? null,
    category_id: null,
    group_name: 'Default',
    group_type: 'single' as const,
    group_required: false,
    group_sort_order: 0,
    option_id: m.id,
    option_label: m.option_label,
    option_icon: null,
    price_adjustment: m.price_adjustment ?? 0,
    is_default: false,
    option_sort_order: 0,
    is_active: true,
    created_at: now,
  }));

  // Clear and replace all modifiers
  await db.offline_modifiers.clear();
  await db.offline_modifiers.bulkAdd(officialModifiers);

  setLastSyncTimestamp(SYNC_TIMESTAMPS.MODIFIERS, new Date().toISOString());

  console.log(`[ProductSync] Synced ${officialModifiers.length} modifiers`);
  return officialModifiers.length;
}

/**
 * Get modifiers for a specific product from IndexedDB
 *
 * @param productId Product ID to get modifiers for
 * @returns Array of product modifiers
 */
export async function getModifiersFromOffline(
  productId: string
): Promise<ILegacyModifier[]> {
  const officialModifiers = await db.offline_modifiers
    .where('product_id')
    .equals(productId)
    .toArray();

  // Map to legacy format
  return officialModifiers.map((m) => ({
    id: m.id,
    product_id: m.product_id ?? '',
    name: m.option_label,
    price_adjustment: m.price_adjustment,
  }));
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
  const count = await db.offline_products.count();
  return count > 0;
}

/**
 * Clear all offline product data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflineProductData(): Promise<void> {
  await Promise.all([
    db.offline_products.clear(),
    db.offline_categories.clear(),
    db.offline_modifiers.clear(),
  ]);

  localStorage.removeItem(SYNC_TIMESTAMPS.PRODUCTS);
  localStorage.removeItem(SYNC_TIMESTAMPS.CATEGORIES);
  localStorage.removeItem(SYNC_TIMESTAMPS.MODIFIERS);

  console.log('[ProductSync] Cleared all offline product data');
}
