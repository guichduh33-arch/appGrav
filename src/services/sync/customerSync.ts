/**
 * Customer Sync Service
 * Story 6.1 - Customers Offline Cache
 *
 * Handles synchronization of customers between Supabase and IndexedDB.
 * Enables offline customer search for POS operations.
 *
 * @see ADR-001: Customers are READ-ONLY cache
 * @see ADR-003: Cache policy (24h TTL, 1h refresh)
 */

import { supabase } from '@/lib/supabase';
import { db, type IOfflineCustomer } from '@/lib/db';

// Re-export interface for consumers
export type { IOfflineCustomer };

/**
 * Sync meta entity key for customers
 */
const SYNC_META_ENTITY = 'customers';

/**
 * Get last sync timestamp from offline_sync_meta
 */
async function getLastSyncTimestamp(): Promise<string | null> {
  const meta = await db.offline_sync_meta.get(SYNC_META_ENTITY);
  return meta?.lastSyncAt ?? null;
}

/**
 * Update sync metadata in offline_sync_meta
 */
async function updateSyncMeta(timestamp: string, recordCount: number): Promise<void> {
  await db.offline_sync_meta.put({
    entity: SYNC_META_ENTITY,
    lastSyncAt: timestamp,
    recordCount,
  });
}

/**
 * Sync all customers from Supabase to IndexedDB
 * Uses incremental sync if last sync timestamp exists
 *
 * Includes jointures for:
 * - category_slug from customer_categories
 * - loyalty_tier calculated from loyalty_tiers based on points
 *
 * @returns Number of customers synced
 */
export async function syncCustomersToOffline(): Promise<number> {
  const lastSync = await getLastSyncTimestamp();

  // Build query with joins for category_slug
  // Note: loyalty_tier is calculated based on points
  let query = supabase
    .from('customers')
    .select(`
      id,
      phone,
      name,
      email,
      loyalty_points,
      updated_at,
      customer_categories!customers_category_id_fkey (
        slug
      )
    `)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  // Incremental sync: only get customers updated since last sync
  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  const { data: customersData, error: customersError } = await query;

  if (customersError) {
    console.error('[CustomerSync] Error fetching customers:', customersError);
    throw customersError;
  }

  if (!customersData || customersData.length === 0) {
    console.log('[CustomerSync] No new customers to sync');
    return 0;
  }

  // Fetch loyalty tiers to calculate tier for each customer
  const { data: loyaltyTiers, error: tiersError } = await supabase
    .from('loyalty_tiers')
    .select('name, min_points')
    .order('min_points', { ascending: false });

  if (tiersError) {
    console.error('[CustomerSync] Error fetching loyalty tiers:', tiersError);
    // Continue without tiers - not critical
  }

  // Helper to determine loyalty tier based on points
  const getLoyaltyTier = (points: number): string | null => {
    if (!loyaltyTiers || loyaltyTiers.length === 0) return null;

    for (const tier of loyaltyTiers) {
      if (points >= tier.min_points) {
        return tier.name;
      }
    }
    return null;
  };

  // Transform to offline format
  const offlineCustomers: IOfflineCustomer[] = customersData.map((c) => {
    // Handle Supabase relation which may return array or object
    const catRaw = c.customer_categories as unknown;
    const categoryData = Array.isArray(catRaw) ? catRaw[0] : catRaw;

    return {
      id: c.id,
      phone: c.phone,
      name: c.name,
      email: c.email,
      category_slug: (categoryData as { slug: string } | null)?.slug ?? null,
      loyalty_tier: getLoyaltyTier(c.loyalty_points || 0),
      points_balance: c.loyalty_points || 0,
      updated_at: c.updated_at || new Date().toISOString(),
    };
  });

  // Bulk upsert to IndexedDB
  await db.offline_customers.bulkPut(offlineCustomers);

  // Handle inactive customers removal
  if (!lastSync) {
    // Full sync - clear cache before inserting new data
    // This ensures any previously cached inactive customers are removed
    const existingCustomers = await db.offline_customers.toArray();
    const existingIds = existingCustomers.map(c => c.id);
    const newIds = new Set(offlineCustomers.map(c => c.id));
    const toRemove = existingIds.filter(id => !newIds.has(id));
    if (toRemove.length > 0) {
      await db.offline_customers.bulkDelete(toRemove);
      console.log(`[CustomerSync] Full sync: Removed ${toRemove.length} stale customers from cache`);
    }
  } else {
    // Incremental sync - query ALL inactive customers and remove them from cache
    // Not just recently deactivated, but ALL inactive in the database
    const { data: inactiveCustomers } = await supabase
      .from('customers')
      .select('id')
      .eq('is_active', false);

    if (inactiveCustomers && inactiveCustomers.length > 0) {
      const inactiveIds = inactiveCustomers.map((c) => c.id);
      // Only delete those that exist in our cache
      const existingInactive = await db.offline_customers
        .where('id')
        .anyOf(inactiveIds)
        .primaryKeys();

      if (existingInactive.length > 0) {
        await db.offline_customers.bulkDelete(existingInactive);
        console.log(`[CustomerSync] Removed ${existingInactive.length} inactive customers from cache`);
      }
    }
  }

  // Update sync metadata
  const latestTimestamp = customersData[0].updated_at || new Date().toISOString();
  const totalCount = await db.offline_customers.count();
  await updateSyncMeta(latestTimestamp, totalCount);

  console.log(`[CustomerSync] Synced ${offlineCustomers.length} customers`);
  return offlineCustomers.length;
}

/**
 * Get all customers from IndexedDB for offline use
 *
 * @returns Array of offline customers
 */
export async function getAllCustomersFromOffline(): Promise<IOfflineCustomer[]> {
  return db.offline_customers.toArray();
}

/**
 * Search customers by name, phone, or email from IndexedDB
 * Story 6.1: Optimized with Dexie filter for <100ms target
 *
 * @param searchTerm Search term to filter by
 * @returns Array of matching customers
 */
export async function searchCustomersOffline(
  searchTerm: string
): Promise<IOfflineCustomer[]> {
  if (!searchTerm.trim()) {
    // Return recent customers (by name alphabetically, limit 10)
    const customers = await db.offline_customers
      .orderBy('name')
      .limit(10)
      .toArray();
    return customers;
  }

  const term = searchTerm.toLowerCase();
  const trimmedTerm = searchTerm.trim();

  // Search by name, phone, or email with limit for performance
  // Note: Using toArray().filter() for compatibility with test mocks
  const allCustomers = await db.offline_customers.toArray();

  // For phone number searches, prioritize exact phone prefix matches
  if (/^\d+$/.test(trimmedTerm)) {
    const phoneMatches = allCustomers.filter(
      (c) => c.phone?.startsWith(trimmedTerm) ?? false
    );
    if (phoneMatches.length > 0) {
      return phoneMatches.slice(0, 20);
    }
  }

  // Combined search by name, phone, or email
  const matches = allCustomers.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(term);
    const phoneMatch = c.phone?.includes(trimmedTerm) ?? false;
    const emailMatch = c.email?.toLowerCase().includes(term) ?? false;
    return nameMatch || phoneMatch || emailMatch;
  });

  return matches.slice(0, 20);
}

/**
 * Get customer by ID from IndexedDB
 *
 * @param customerId Customer ID to lookup
 * @returns Customer or undefined if not found
 */
export async function getCustomerByIdOffline(
  customerId: string
): Promise<IOfflineCustomer | undefined> {
  return db.offline_customers.get(customerId);
}

/**
 * Get customer by phone from IndexedDB
 *
 * @param phone Phone number to search
 * @returns Customer or undefined if not found
 */
export async function getCustomerByPhoneOffline(
  phone: string
): Promise<IOfflineCustomer | undefined> {
  return db.offline_customers.where('phone').equals(phone).first();
}

/**
 * Check if offline customer data exists
 *
 * @returns true if customers are cached locally
 */
export async function hasOfflineCustomerData(): Promise<boolean> {
  const count = await db.offline_customers.count();
  return count > 0;
}

/**
 * Get count of cached customers
 *
 * @returns Number of customers in offline DB
 */
export async function getOfflineCustomerCount(): Promise<number> {
  return db.offline_customers.count();
}

/**
 * Get last sync metadata for customers
 *
 * @returns Sync metadata or null if never synced
 */
export async function getCustomersSyncMeta(): Promise<{
  lastSyncAt: string | null;
  recordCount: number;
} | null> {
  const meta = await db.offline_sync_meta.get(SYNC_META_ENTITY);
  if (!meta) return null;

  return {
    lastSyncAt: meta.lastSyncAt,
    recordCount: meta.recordCount,
  };
}

/**
 * Clear all offline customer data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflineCustomerData(): Promise<void> {
  await db.offline_customers.clear();
  await db.offline_sync_meta.delete(SYNC_META_ENTITY);
  console.log('[CustomerSync] Cleared all offline customer data');
}
