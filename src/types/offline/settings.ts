/**
 * Offline Settings Types
 *
 * Type definitions for offline settings caching including:
 * - Settings cache (Story 1.5)
 * - Tax rates
 * - Payment methods
 * - Business hours
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

// =====================================================
// Settings Cache Types (Story 1.5)
// =====================================================

/**
 * IMPORTANT: Dexie/IndexedDB Boolean Storage
 *
 * IndexedDB stores boolean values as 0 (false) or 1 (true) when used in indexes.
 * This means:
 * - Queries must use `.equals(1)` instead of `.equals(true)`
 * - Values read back may be 0/1 instead of true/false
 * - Type definitions use `boolean` for API compatibility, but runtime values may be numbers
 * - Converter functions (toTaxRate, toPaymentMethod, etc.) use Boolean() to coerce values
 */

/**
 * Cached setting for offline access
 *
 * Stored in Dexie table: offline_settings
 * TTL: Unlimited (settings rarely change)
 *
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineSetting {
  /** Setting key (primary key) */
  key: string;

  /** JSONB value from settings table */
  value: unknown;

  /** FK to settings_categories.id */
  category_id: string;

  /** Value type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'file' */
  value_type: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Cached tax rate for offline access
 *
 * Stored in Dexie table: offline_tax_rates
 */
export interface IOfflineTaxRate {
  /** Tax rate UUID (primary key) */
  id: string;

  /** Tax rate name */
  name: string;

  /** Tax rate percentage (e.g., 10 for 10%) */
  rate: number;

  /** Whether this is the default tax rate */
  is_default: boolean;

  /** Whether this tax rate is active */
  is_active: boolean;

  /** ISO 8601 timestamp of creation */
  created_at: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Cached payment method for offline access
 *
 * Stored in Dexie table: offline_payment_methods
 */
export interface IOfflinePaymentMethod {
  /** Payment method UUID (primary key) */
  id: string;

  /** Payment method name */
  name: string;

  /** Payment type: 'cash' | 'card' | 'transfer' | 'ewallet' | 'other' */
  type: string;

  /** Whether this is the default payment method */
  is_default: boolean;

  /** Whether this payment method is active */
  is_active: boolean;

  /** Sort order for display */
  sort_order: number;

  /** ISO 8601 timestamp of creation */
  created_at: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Cached business hours for offline access
 *
 * Stored in Dexie table: offline_business_hours
 */
export interface IOfflineBusinessHours {
  /** Day of week (0 = Sunday, 6 = Saturday) */
  day_of_week: number;

  /** Opening time (HH:mm format) */
  open_time: string | null;

  /** Closing time (HH:mm format) */
  close_time: string | null;

  /** Whether the business is open this day */
  is_open: boolean;
}
