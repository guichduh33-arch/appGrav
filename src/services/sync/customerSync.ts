/**
 * Customer Sync Service
 * Story 2.4 - Offline Customer Lookup
 *
 * Handles synchronization of customers between Supabase and IndexedDB.
 * Enables offline customer search for POS operations.
 */

import { supabase } from '@/lib/supabase';
import { offlineDb, IOfflineCustomer } from './offlineDb';

// Re-export interface for consumers
export type { IOfflineCustomer };

/**
 * Local storage key for sync timestamp
 */
const SYNC_TIMESTAMP_KEY = 'appgrav_customers_last_sync';

/**
 * Get last sync timestamp
 */
function getLastSyncTimestamp(): string | null {
  return localStorage.getItem(SYNC_TIMESTAMP_KEY);
}

/**
 * Set last sync timestamp
 */
function setLastSyncTimestamp(timestamp: string): void {
  localStorage.setItem(SYNC_TIMESTAMP_KEY, timestamp);
}

/**
 * Sync all customers from Supabase to IndexedDB
 * Uses incremental sync if last sync timestamp exists
 *
 * @returns Number of customers synced
 */
export async function syncCustomersToOffline(): Promise<number> {
  const lastSync = getLastSyncTimestamp();

  let query = supabase
    .from('customers')
    .select('id, phone, name, email, loyalty_points, category_id, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  // Incremental sync: only get customers updated since last sync
  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[CustomerSync] Error fetching customers:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('[CustomerSync] No new customers to sync');
    return 0;
  }

  // Transform to offline format
  const offlineCustomers: IOfflineCustomer[] = data.map((c) => ({
    id: c.id,
    phone: c.phone,
    name: c.name,
    email: c.email,
    loyalty_points: c.loyalty_points || 0,
    customer_category_slug: null, // Will be populated from category join if needed
    updated_at: c.updated_at || new Date().toISOString(),
  }));

  // Bulk upsert to IndexedDB
  await offlineDb.customers.bulkPut(offlineCustomers);

  // Update last sync timestamp
  const latestTimestamp = data[0].updated_at || new Date().toISOString();
  setLastSyncTimestamp(latestTimestamp);

  console.log(`[CustomerSync] Synced ${offlineCustomers.length} customers`);
  return offlineCustomers.length;
}

/**
 * Get all customers from IndexedDB for offline use
 *
 * @returns Array of offline customers
 */
export async function getAllCustomersFromOffline(): Promise<IOfflineCustomer[]> {
  return offlineDb.customers.toArray();
}

/**
 * Search customers by name or phone from IndexedDB
 *
 * @param searchTerm Search term to filter by
 * @returns Array of matching customers
 */
export async function searchCustomersOffline(
  searchTerm: string
): Promise<IOfflineCustomer[]> {
  if (!searchTerm.trim()) {
    // Return recent customers (by name alphabetically for simplicity)
    const customers = await offlineDb.customers.limit(10).toArray();
    return customers;
  }

  const term = searchTerm.toLowerCase();

  // Search by phone or name
  const allCustomers = await offlineDb.customers.toArray();

  return allCustomers.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(term);
    const phoneMatch = c.phone?.includes(term);
    const emailMatch = c.email?.toLowerCase().includes(term);
    return nameMatch || phoneMatch || emailMatch;
  });
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
  return offlineDb.customers.get(customerId);
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
  return offlineDb.customers.where('phone').equals(phone).first();
}

/**
 * Update customer loyalty points locally (for offline point accumulation)
 *
 * @param customerId Customer ID
 * @param pointsToAdd Points to add (can be negative for redemption)
 */
export async function updateCustomerPointsOffline(
  customerId: string,
  pointsToAdd: number
): Promise<void> {
  const customer = await offlineDb.customers.get(customerId);
  if (!customer) {
    console.warn(`[CustomerSync] Customer ${customerId} not found in offline DB`);
    return;
  }

  const newPoints = Math.max(0, customer.loyalty_points + pointsToAdd);
  await offlineDb.customers.update(customerId, {
    loyalty_points: newPoints,
  });

  console.log(`[CustomerSync] Updated customer ${customerId} points: ${customer.loyalty_points} -> ${newPoints}`);
}

/**
 * Check if offline customer data exists
 *
 * @returns true if customers are cached locally
 */
export async function hasOfflineCustomerData(): Promise<boolean> {
  const count = await offlineDb.customers.count();
  return count > 0;
}

/**
 * Get count of cached customers
 *
 * @returns Number of customers in offline DB
 */
export async function getOfflineCustomerCount(): Promise<number> {
  return offlineDb.customers.count();
}

/**
 * Clear all offline customer data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflineCustomerData(): Promise<void> {
  await offlineDb.customers.clear();
  localStorage.removeItem(SYNC_TIMESTAMP_KEY);
  console.log('[CustomerSync] Cleared all offline customer data');
}
