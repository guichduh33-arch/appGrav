/**
 * Settings Cache Service for Offline Support
 *
 * This service handles caching settings data from Supabase to IndexedDB (Dexie)
 * for offline access. Implements read-only cache with sync at startup.
 *
 * @see Story 1.5: Settings Offline Cache
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type {
  IOfflineSetting,
  IOfflineTaxRate,
  IOfflinePaymentMethod,
  IOfflineBusinessHours,
  ISyncMeta,
} from '@/types/offline';

// =====================================================
// Settings Cache Functions
// =====================================================

/**
 * Cache all settings from Supabase to IndexedDB
 *
 * Clears existing cache and replaces with fresh data.
 * Updates sync metadata with timestamp and record count.
 *
 * @throws Error if Supabase query fails
 */
export async function cacheAllSettings(): Promise<void> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value, category_id, value_type, updated_at');

  if (error) throw error;

  // Transform to IOfflineSetting format
  const settings: IOfflineSetting[] = (data || []).map((row) => ({
    key: row.key,
    value: row.value,
    category_id: row.category_id,
    value_type: row.value_type || 'string',
    updated_at: row.updated_at,
  }));

  // Clear and populate
  await db.offline_settings.clear();
  if (settings.length > 0) {
    await db.offline_settings.bulkAdd(settings);
  }

  // Update sync meta
  await updateSyncMeta('settings', settings.length);
}

/**
 * Get all cached settings from IndexedDB
 *
 * @returns Array of cached settings or empty array if none
 */
export async function getCachedSettings(): Promise<IOfflineSetting[]> {
  return db.offline_settings.toArray();
}

/**
 * Get a specific cached setting by key
 *
 * @param key - Setting key to retrieve
 * @returns Cached setting or undefined if not found
 */
export async function getCachedSetting(
  key: string
): Promise<IOfflineSetting | undefined> {
  return db.offline_settings.get(key);
}

/**
 * Get the timestamp of the last settings sync
 *
 * @returns ISO 8601 timestamp string or null if never synced
 */
export async function getLastSettingsSyncAt(): Promise<string | null> {
  const meta = await db.offline_sync_meta.get('settings');
  return meta?.lastSyncAt ?? null;
}

// =====================================================
// Tax Rates Cache Functions
// =====================================================

/**
 * Cache all tax rates from Supabase to IndexedDB
 *
 * @throws Error if Supabase query fails
 */
export async function cacheTaxRates(): Promise<void> {
  const { data, error } = await supabase
    .from('tax_rates')
    .select('id, name, rate, is_default, is_active, created_at, updated_at');

  if (error) throw error;

  const taxRates: IOfflineTaxRate[] = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    rate: row.rate,
    is_default: row.is_default ?? false,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  await db.offline_tax_rates.clear();
  if (taxRates.length > 0) {
    await db.offline_tax_rates.bulkAdd(taxRates);
  }

  await updateSyncMeta('tax_rates', taxRates.length);
}

/**
 * Get all cached tax rates from IndexedDB
 */
export async function getCachedTaxRates(): Promise<IOfflineTaxRate[]> {
  return db.offline_tax_rates.toArray();
}

/**
 * Get active cached tax rates from IndexedDB
 */
export async function getCachedActiveTaxRates(): Promise<IOfflineTaxRate[]> {
  return db.offline_tax_rates.where('is_active').equals(1).toArray();
}

/**
 * Get the default cached tax rate
 */
export async function getCachedDefaultTaxRate(): Promise<
  IOfflineTaxRate | undefined
> {
  return db.offline_tax_rates
    .where({ is_active: 1, is_default: 1 })
    .first();
}

// =====================================================
// Payment Methods Cache Functions
// =====================================================

/**
 * Cache all payment methods from Supabase to IndexedDB
 *
 * @throws Error if Supabase query fails
 */
export async function cachePaymentMethods(): Promise<void> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select(
      'id, name, type, is_default, is_active, sort_order, created_at, updated_at'
    );

  if (error) throw error;

  const paymentMethods: IOfflinePaymentMethod[] = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    is_default: row.is_default ?? false,
    is_active: row.is_active ?? true,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  await db.offline_payment_methods.clear();
  if (paymentMethods.length > 0) {
    await db.offline_payment_methods.bulkAdd(paymentMethods);
  }

  await updateSyncMeta('payment_methods', paymentMethods.length);
}

/**
 * Get all cached payment methods from IndexedDB
 */
export async function getCachedPaymentMethods(): Promise<
  IOfflinePaymentMethod[]
> {
  return db.offline_payment_methods.orderBy('sort_order').toArray();
}

/**
 * Get active cached payment methods from IndexedDB
 */
export async function getCachedActivePaymentMethods(): Promise<
  IOfflinePaymentMethod[]
> {
  return db.offline_payment_methods
    .where('is_active')
    .equals(1)
    .sortBy('sort_order');
}

/**
 * Get the default cached payment method
 */
export async function getCachedDefaultPaymentMethod(): Promise<
  IOfflinePaymentMethod | undefined
> {
  return db.offline_payment_methods
    .where({ is_active: 1, is_default: 1 })
    .first();
}

// =====================================================
// Business Hours Cache Functions
// =====================================================

/**
 * Cache all business hours from Supabase to IndexedDB
 *
 * @throws Error if Supabase query fails
 */
export async function cacheBusinessHours(): Promise<void> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('day_of_week, open_time, close_time, is_open');

  if (error) throw error;

  const businessHours: IOfflineBusinessHours[] = (data || []).map((row) => ({
    day_of_week: row.day_of_week,
    open_time: row.open_time,
    close_time: row.close_time,
    is_open: row.is_open ?? true,
  }));

  await db.offline_business_hours.clear();
  if (businessHours.length > 0) {
    await db.offline_business_hours.bulkAdd(businessHours);
  }

  await updateSyncMeta('business_hours', businessHours.length);
}

/**
 * Get all cached business hours from IndexedDB
 */
export async function getCachedBusinessHours(): Promise<
  IOfflineBusinessHours[]
> {
  return db.offline_business_hours.orderBy('day_of_week').toArray();
}

// =====================================================
// Orchestration Function
// =====================================================

/**
 * Cache all settings-related data in parallel
 *
 * Caches settings, tax rates, payment methods, and business hours.
 * Uses Promise.allSettled to continue even if one cache fails.
 *
 * @returns Object with success status and any errors
 */
export async function cacheAllSettingsData(): Promise<{
  success: boolean;
  errors: string[];
  lastSyncAt: string;
}> {
  const errors: string[] = [];
  const lastSyncAt = new Date().toISOString();

  const results = await Promise.allSettled([
    cacheAllSettings(),
    cacheTaxRates(),
    cachePaymentMethods(),
    cacheBusinessHours(),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const entityNames = [
        'settings',
        'tax_rates',
        'payment_methods',
        'business_hours',
      ];
      errors.push(`Failed to cache ${entityNames[index]}: ${result.reason}`);
    }
  });

  return {
    success: errors.length === 0,
    errors,
    lastSyncAt,
  };
}

// =====================================================
// Sync Metadata Helpers
// =====================================================

/**
 * Update sync metadata for an entity
 */
async function updateSyncMeta(
  entity: string,
  recordCount: number
): Promise<void> {
  const meta: ISyncMeta = {
    entity,
    lastSyncAt: new Date().toISOString(),
    recordCount,
  };
  await db.offline_sync_meta.put(meta);
}

/**
 * Get sync metadata for an entity
 */
export async function getSyncMeta(entity: string): Promise<ISyncMeta | undefined> {
  return db.offline_sync_meta.get(entity);
}

/**
 * Get all sync metadata
 */
export async function getAllSyncMeta(): Promise<ISyncMeta[]> {
  return db.offline_sync_meta.toArray();
}
