/**
 * Stock Sync Service
 * Story 5.1 - Offline Stock Levels Cache (Read-Only)
 *
 * Handles synchronization of stock levels between Supabase and IndexedDB.
 * Enables offline stock level viewing for inventory management.
 *
 * Mode: READ-ONLY (modifications remain online-only per ADR-001)
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { IOfflineStockLevel } from '@/types/offline';

// Re-export interface for consumers
export type { IOfflineStockLevel };

/**
 * Legacy localStorage key (kept for migration)
 * @deprecated Use offline_sync_meta table instead
 */
const LEGACY_SYNC_TIMESTAMP_KEY = 'appgrav_stock_levels_last_sync';

/**
 * Sync meta entity name for stock levels
 */
const STOCK_SYNC_META_ENTITY = 'stock_levels';

/**
 * Get last sync timestamp for stock levels from IndexedDB
 * Falls back to localStorage for migration
 */
export async function getLastStockSyncTime(): Promise<string | null> {
  try {
    const meta = await db.offline_sync_meta.get(STOCK_SYNC_META_ENTITY);
    if (meta?.lastSyncAt) {
      return meta.lastSyncAt;
    }
    // Fallback to legacy localStorage (migration path)
    return localStorage.getItem(LEGACY_SYNC_TIMESTAMP_KEY);
  } catch (error) {
    console.error('[StockSync] Error reading sync meta:', error);
    return localStorage.getItem(LEGACY_SYNC_TIMESTAMP_KEY);
  }
}

/**
 * Get last sync timestamp synchronously (for non-async contexts)
 * @deprecated Prefer async getLastStockSyncTime()
 */
export function getLastStockSyncTimeSync(): string | null {
  return localStorage.getItem(LEGACY_SYNC_TIMESTAMP_KEY);
}

/**
 * Set last sync timestamp for stock levels in IndexedDB
 * Also updates localStorage for backwards compatibility
 */
async function setLastStockSyncTime(timestamp: string, recordCount: number): Promise<void> {
  // Update IndexedDB (primary storage - enables useLiveQuery reactivity)
  await db.offline_sync_meta.put({
    entity: STOCK_SYNC_META_ENTITY,
    lastSyncAt: timestamp,
    recordCount,
  });
  // Also update localStorage for backwards compatibility
  localStorage.setItem(LEGACY_SYNC_TIMESTAMP_KEY, timestamp);
}

/**
 * Sync all stock levels from Supabase to IndexedDB
 * Fetches from products table (current_stock, min_stock_level)
 *
 * @returns Number of stock levels synced
 */
export async function syncStockLevelsToOffline(): Promise<number> {
  const { data, error } = await supabase
    .from('products')
    .select('id, current_stock, min_stock_level, updated_at')
    .in('product_type', ['finished', 'semi_finished', 'raw_material'])
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[StockSync] Error fetching stock levels:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('[StockSync] No stock levels to sync');
    return 0;
  }

  // Transform to offline format
  const offlineData: IOfflineStockLevel[] = data.map((p) => ({
    id: p.id, // product_id is primary key
    product_id: p.id,
    location_id: null, // Single location for MVP
    quantity: p.current_stock ?? 0,
    min_stock_level: p.min_stock_level ?? 0,
    last_updated: p.updated_at ?? new Date().toISOString(),
  }));

  // Bulk upsert to IndexedDB
  await db.offline_stock_levels.bulkPut(offlineData);

  // Update last sync timestamp (in IndexedDB for useLiveQuery reactivity)
  await setLastStockSyncTime(new Date().toISOString(), offlineData.length);

  console.log(`[StockSync] Synced ${offlineData.length} stock levels`);
  return offlineData.length;
}

/**
 * Get all stock levels from IndexedDB for offline use
 *
 * @param productIds Optional array of product IDs to filter
 * @returns Array of offline stock levels
 */
export async function getStockLevelsFromOffline(
  productIds?: string[]
): Promise<IOfflineStockLevel[]> {
  if (productIds && productIds.length > 0) {
    return db.offline_stock_levels
      .where('product_id')
      .anyOf(productIds)
      .toArray();
  }

  return db.offline_stock_levels.toArray();
}

/**
 * Get a single stock level by product ID
 *
 * @param productId Product ID to look up
 * @returns Stock level or undefined if not found
 */
export async function getStockLevelByProductId(
  productId: string
): Promise<IOfflineStockLevel | undefined> {
  return db.offline_stock_levels.get(productId);
}

/**
 * Check if offline stock data exists
 *
 * @returns true if stock levels are cached locally
 */
export async function hasOfflineStockData(): Promise<boolean> {
  const count = await db.offline_stock_levels.count();
  return count > 0;
}

/**
 * Get count of cached stock levels
 *
 * @returns Number of stock levels in cache
 */
export async function getOfflineStockCount(): Promise<number> {
  return db.offline_stock_levels.count();
}

/**
 * Clear all offline stock data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflineStockData(): Promise<void> {
  await db.offline_stock_levels.clear();
  await db.offline_sync_meta.delete(STOCK_SYNC_META_ENTITY);
  localStorage.removeItem(LEGACY_SYNC_TIMESTAMP_KEY);
  console.log('[StockSync] Cleared all offline stock data');
}
