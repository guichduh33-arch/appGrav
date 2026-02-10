/**
 * Offline Settings Hook
 *
 * Provides transparent access to settings that works both online and offline.
 * When online, uses the Zustand settingsStore.
 * When offline, falls back to IndexedDB cache via Dexie.
 *
 * @see Story 1.5: Settings Offline Cache
 * @see ADR-001: Entités Synchronisées Offline
 */

import { useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSettingsStore } from '@/stores/settingsStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { db } from '@/lib/db';
import type { ISyncMeta } from '@/types/offline';
import type {
  IOfflineTaxRate,
  IOfflinePaymentMethod,
  IOfflineBusinessHours,
} from '@/types/offline';
import type { TaxRate, PaymentMethod, BusinessHours } from '@/types/settings';

// =====================================================
// Value Parser
// =====================================================

/**
 * Parse a setting value from JSONB format
 */
function parseSettingValue<T>(value: unknown): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
}

// =====================================================
// Type Converters
// =====================================================

/**
 * Convert IOfflineTaxRate to TaxRate format
 *
 * Note: Dexie stores booleans as 0/1 in IndexedDB, so is_active/is_default
 * may be numbers when read back. We coerce them to booleans here.
 */
function toTaxRate(offline: IOfflineTaxRate): TaxRate {
  // Use type assertion since offline cache has simplified schema
  return {
    id: offline.id,
    name_en: offline.name,
    name_fr: offline.name,
    name_id: offline.name,
    rate: offline.rate,
    is_default: Boolean(offline.is_default),
    is_active: Boolean(offline.is_active),
    created_at: offline.created_at,
    updated_at: offline.updated_at,
    code: offline.id.substring(0, 10), // Use ID prefix as fallback code
    applies_to: null,
    is_inclusive: true,
    valid_from: null,
    valid_until: null,
  } as TaxRate;
}

/**
 * Convert IOfflinePaymentMethod to PaymentMethod format
 *
 * Note: Dexie stores booleans as 0/1 in IndexedDB, so is_active/is_default
 * may be numbers when read back. We coerce them to booleans here.
 */
function toPaymentMethod(offline: IOfflinePaymentMethod): PaymentMethod {
  // Use type assertion since offline cache has simplified schema
  return {
    id: offline.id,
    name_en: offline.name,
    name_fr: offline.name,
    name_id: offline.name,
    code: offline.type, // Use type as code fallback
    payment_type: offline.type,
    is_default: Boolean(offline.is_default),
    is_active: Boolean(offline.is_active),
    sort_order: offline.sort_order,
    created_at: offline.created_at,
    updated_at: offline.updated_at,
    icon: null,
    requires_reference: false,
    settings: null,
  } as PaymentMethod;
}

/**
 * Convert IOfflineBusinessHours to BusinessHours format
 *
 * Note: Uses static placeholder timestamps since offline cache doesn't store
 * created_at/updated_at for business hours (they rarely change).
 * Dexie stores booleans as 0/1, so we coerce is_open to boolean.
 */
function toBusinessHours(offline: IOfflineBusinessHours): BusinessHours {
  // Use type assertion since offline cache has simplified schema
  // Note: Database uses is_closed (negated from is_open)
  return {
    id: `day-${offline.day_of_week}`,
    day_of_week: offline.day_of_week,
    open_time: offline.open_time,
    close_time: offline.close_time,
    is_closed: !offline.is_open, // Negate is_open to is_closed
    break_start: null,
    break_end: null,
    created_at: '1970-01-01T00:00:00.000Z',
    updated_at: '1970-01-01T00:00:00.000Z',
  } as BusinessHours;
}

// =====================================================
// Main Hook
// =====================================================

/**
 * Hook for accessing settings with automatic online/offline handling
 *
 * @returns Settings interface compatible with settingsStore
 *
 * @example
 * ```tsx
 * const { getSetting, taxRates, isOffline } = useSettingsOffline();
 *
 * const theme = getSetting<string>('appearance.theme');
 * const activeTaxes = taxRates.filter(t => t.is_active);
 * ```
 */
export function useSettingsOffline() {
  const { isOnline } = useNetworkStatus();
  const store = useSettingsStore();

  // ===== Offline Settings Query =====
  // Note: useLiveQuery returns undefined while loading, null/[] on empty
  const offlineSettings = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await db.offline_settings.toArray();
      } catch (error) {
        console.warn('[useSettingsOffline] Failed to read offline_settings:', error);
        return [];
      }
    },
    [isOnline]
  );

  // ===== Offline Tax Rates Query =====
  const offlineTaxRates = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await db.offline_tax_rates.toArray();
      } catch (error) {
        console.warn('[useSettingsOffline] Failed to read offline_tax_rates:', error);
        return [];
      }
    },
    [isOnline]
  );

  // ===== Offline Payment Methods Query =====
  const offlinePaymentMethods = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await db.offline_payment_methods.orderBy('sort_order').toArray();
      } catch (error) {
        console.warn('[useSettingsOffline] Failed to read offline_payment_methods:', error);
        return [];
      }
    },
    [isOnline]
  );

  // ===== Offline Business Hours Query =====
  const offlineBusinessHours = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await db.offline_business_hours.orderBy('day_of_week').toArray();
      } catch (error) {
        console.warn('[useSettingsOffline] Failed to read offline_business_hours:', error);
        return [];
      }
    },
    [isOnline]
  );

  // ===== Sync Metadata Query (all entities) =====
  const allSyncMeta = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await db.offline_sync_meta.toArray();
      } catch (error) {
        console.warn('[useSettingsOffline] Failed to read offline_sync_meta:', error);
        return [];
      }
    },
    [isOnline]
  );

  // Helper to get sync meta for a specific entity
  const getSyncMetaFor = useCallback(
    (entity: string): ISyncMeta | undefined => {
      return allSyncMeta?.find((m) => m.entity === entity);
    },
    [allSyncMeta]
  );

  // ===== Memoized Getters =====

  /**
   * Get a setting value by key
   */
  const getSetting = useMemo(() => {
    return <T = unknown>(key: string): T | null => {
      if (isOnline) {
        return store.getSetting<T>(key);
      }

      const setting = offlineSettings?.find((s) => s.key === key);
      if (!setting) return null;

      return parseSettingValue<T>(setting.value);
    };
  }, [isOnline, store, offlineSettings]);

  /**
   * Get all tax rates (converted to standard format)
   */
  const taxRates = useMemo((): TaxRate[] => {
    if (isOnline) {
      return store.taxRates;
    }
    return (offlineTaxRates || []).map(toTaxRate);
  }, [isOnline, store.taxRates, offlineTaxRates]);

  /**
   * Get active tax rates
   */
  const activeTaxRates = useMemo((): TaxRate[] => {
    if (isOnline) {
      return store.getActiveTaxRates();
    }
    return taxRates.filter((t) => t.is_active);
  }, [isOnline, store, taxRates]);

  /**
   * Get default tax rate
   */
  const defaultTaxRate = useMemo((): TaxRate | null => {
    if (isOnline) {
      return store.getDefaultTaxRate();
    }
    return taxRates.find((t) => t.is_active && t.is_default) || null;
  }, [isOnline, store, taxRates]);

  /**
   * Get all payment methods (converted to standard format)
   */
  const paymentMethods = useMemo((): PaymentMethod[] => {
    if (isOnline) {
      return store.paymentMethods;
    }
    return (offlinePaymentMethods || []).map(toPaymentMethod);
  }, [isOnline, store.paymentMethods, offlinePaymentMethods]);

  /**
   * Get active payment methods
   */
  const activePaymentMethods = useMemo((): PaymentMethod[] => {
    if (isOnline) {
      return store.getActivePaymentMethods();
    }
    return paymentMethods.filter((p) => p.is_active);
  }, [isOnline, store, paymentMethods]);

  /**
   * Get default payment method
   */
  const defaultPaymentMethod = useMemo((): PaymentMethod | null => {
    if (isOnline) {
      return store.getDefaultPaymentMethod();
    }
    return paymentMethods.find((p) => p.is_active && p.is_default) || null;
  }, [isOnline, store, paymentMethods]);

  /**
   * Get all business hours (converted to standard format)
   */
  const businessHours = useMemo((): BusinessHours[] => {
    if (isOnline) {
      return store.businessHours;
    }
    return (offlineBusinessHours || []).map(toBusinessHours);
  }, [isOnline, store.businessHours, offlineBusinessHours]);

  /**
   * Get last sync timestamp for settings (primary entity)
   */
  const lastSyncAt = useMemo((): string | null => {
    if (isOnline) {
      return null; // Online doesn't track sync timestamp
    }
    return getSyncMetaFor('settings')?.lastSyncAt ?? null;
  }, [isOnline, getSyncMetaFor]);

  /**
   * Get oldest sync timestamp across all cached entities
   * Useful to show "Data as of {timestamp}" message
   */
  const oldestSyncAt = useMemo((): string | null => {
    if (isOnline || !allSyncMeta?.length) return null;
    const timestamps = allSyncMeta
      .map((m) => m.lastSyncAt)
      .filter(Boolean)
      .sort();
    return timestamps[0] ?? null;
  }, [isOnline, allSyncMeta]);

  return {
    // State indicators
    isOffline: !isOnline,
    isOnline,
    lastSyncAt,
    oldestSyncAt,

    // Settings getter
    getSetting,

    // Tax rates
    taxRates,
    activeTaxRates,
    defaultTaxRate,

    // Payment methods
    paymentMethods,
    activePaymentMethods,
    defaultPaymentMethod,

    // Business hours
    businessHours,

    // Sync metadata access (for detailed cache info)
    getSyncMetaFor,

    // Loading states (for compatibility)
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
  };
}

export default useSettingsOffline;
