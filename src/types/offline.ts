/**
 * Offline Types for AppGrav
 *
 * Type definitions for offline-first functionality including:
 * - User credential caching (Story 1.1)
 * - Sync queue management (foundation for Story 3.1)
 * - Error handling for offline operations
 *
 * Naming conventions:
 * - Interfaces: I{Name}
 * - Types: T{Name}
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

import type { Role, EffectivePermission } from './auth';

// =====================================================
// User Cache Types (Story 1.1)
// =====================================================

/**
 * Cached user data for offline PIN authentication
 *
 * Stored in Dexie table: offline_users
 * TTL: 24 hours from cached_at
 *
 * @see ADR-004: PIN Verification Offline
 * @see ADR-005: Permissions Offline
 */
export interface IOfflineUser {
  /** User UUID (primary key) */
  id: string;

  /** Bcrypt hash from server - NEVER store plaintext PIN */
  pin_hash: string;

  /** Cached user roles for permission checks */
  roles: Role[];

  /** Cached effective permissions with is_granted flags */
  permissions: EffectivePermission[];

  /** Display name for UI (nullable) */
  display_name: string | null;

  /** User's preferred language */
  preferred_language: 'fr' | 'en' | 'id';

  /** ISO 8601 timestamp of when data was cached */
  cached_at: string;
}

// =====================================================
// Offline Auth Types (Story 1.2)
// =====================================================

/**
 * Error codes for offline authentication
 * Used to return generic errors without revealing cache state
 */
export type TOfflineAuthError =
  | 'INVALID_PIN'       // PIN verification failed (also used for cache miss - security)
  | 'CACHE_EXPIRED'     // Cache older than 24h - online login required
  | 'RATE_LIMITED';     // Too many failed attempts

/**
 * Result of offline PIN verification
 * @see offlineAuthService.verifyPinOffline()
 */
export interface IOfflineAuthResult {
  /** Whether authentication succeeded */
  success: boolean;

  /** Error code if authentication failed */
  error?: TOfflineAuthError;

  /** Cached user data if authentication succeeded */
  user?: IOfflineUser;

  /** Seconds to wait if rate limited */
  waitSeconds?: number;
}

// =====================================================
// Sync Queue Types (Foundation for Story 3.1)
// =====================================================

/**
 * Entity types that can be synced offline
 * Defined in ADR-001
 */
export type TSyncEntity =
  | 'orders'
  | 'order_items'
  | 'payments'      // Story 3.4
  | 'pos_sessions'
  | 'customers'
  | 'products'
  | 'categories';

/**
 * CRUD actions for sync queue
 */
export type TSyncAction = 'create' | 'update' | 'delete';

/**
 * Sync queue item status
 */
export type TSyncStatus = 'pending' | 'syncing' | 'failed' | 'completed';

/**
 * Sync queue item structure
 *
 * Stored in Dexie table: offline_sync_queue
 * Processed FIFO when online
 *
 * @see ADR-002: Stratégie de Synchronisation
 */
export interface ISyncQueueItem {
  /** Auto-increment ID (Dexie) */
  id?: number;

  /** Target entity type */
  entity: TSyncEntity;

  /** CRUD action to perform */
  action: TSyncAction;

  /** UUID of the entity being synced */
  entityId: string;

  /** Full payload for the operation */
  payload: Record<string, unknown>;

  /** ISO 8601 timestamp when queued */
  created_at: string;

  /** Current sync status */
  status: TSyncStatus;

  /** Number of sync attempts */
  retries: number;

  /** Last error message if failed */
  lastError?: string;
}

// =====================================================
// Error Types
// =====================================================

/**
 * Error codes for offline operations
 * Used with OfflineError class
 */
export type TOfflineErrorCode =
  | 'SYNC_FAILED'       // Server sync operation failed
  | 'QUEUE_FULL'        // Sync queue reached capacity
  | 'STORAGE_FULL'      // IndexedDB quota exceeded
  | 'CONFLICT'          // Data conflict detected during sync
  | 'AUTH_EXPIRED'      // Offline session expired (24h TTL)
  | 'LAN_UNREACHABLE'   // LAN hub not reachable
  | 'CACHE_MISS';       // Requested data not in offline cache

/**
 * Custom error class for offline operations
 * Includes recovery hints and error codes
 */
export class OfflineError extends Error {
  constructor(
    message: string,
    public code: TOfflineErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}

// =====================================================
// Cache Meta Types
// =====================================================

/**
 * Sync metadata for tracking entity cache freshness
 * Stored in Dexie table: offline_sync_meta
 */
export interface ISyncMeta {
  /** Entity name (e.g., 'products', 'customers') */
  entity: string;

  /** ISO 8601 timestamp of last successful sync */
  lastSyncAt: string;

  /** Number of records in cache */
  recordCount: number;
}

// =====================================================
// Constants
// =====================================================

/** Cache TTL for offline user credentials (24 hours in ms) */
export const OFFLINE_USER_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Maximum retry attempts for sync queue items */
export const SYNC_MAX_RETRIES = 3;

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
 * @see ADR-001: Entités Synchronisées Offline
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

// =====================================================
// Products Cache Types (Story 2.1)
// =====================================================

/**
 * Cached product for offline POS access
 *
 * Stored in Dexie table: offline_products
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineProduct {
  /** Product UUID (primary key) */
  id: string;

  /** FK to categories.id */
  category_id: string | null;

  /** Stock Keeping Unit */
  sku: string | null;

  /** Product name */
  name: string;

  /** Product type: finished, semi_finished, raw_material */
  product_type: string | null;

  /** Retail price in IDR */
  retail_price: number;

  /** Wholesale price in IDR (for B2B customers) */
  wholesale_price: number | null;

  /** Cost price for margin calculation */
  cost_price: number | null;

  /** Product image URL */
  image_url: string | null;

  /** Whether product is active */
  is_active: boolean;

  /** Whether product is visible in POS */
  pos_visible: boolean;

  /** Whether product is available for sale */
  available_for_sale: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/** Cache TTL for products (24 hours in ms) */
export const PRODUCTS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for products when online (1 hour in ms) */
export const PRODUCTS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Categories Cache Types (Story 2.2)
// =====================================================

/**
 * Dispatch station for KDS routing
 * Re-exported from database enums for consistency
 */
export type TDispatchStation = import('./database.generated').Database['public']['Enums']['dispatch_station'];

/**
 * Cached category for offline POS access
 *
 * Stored in Dexie table: offline_categories
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineCategory {
  /** Category UUID (primary key) */
  id: string;

  /** Category name */
  name: string;

  /** Icon identifier (Lucide icon name) */
  icon: string | null;

  /** Color for UI display (hex or named color) */
  color: string | null;

  /** Sort order for display */
  sort_order: number | null;

  /** Dispatch station for KDS routing: barista, kitchen, display, none */
  dispatch_station: TDispatchStation | null;

  /** Whether category is active */
  is_active: boolean;

  /** Whether category is for raw materials (excluded from POS) */
  is_raw_material: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string | null;
}

/** Cache TTL for categories (24 hours in ms) - same as products */
export const CATEGORIES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for categories when online (1 hour in ms) - same as products */
export const CATEGORIES_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Modifiers Cache Types (Story 2.3)
// =====================================================

/**
 * Modifier group type: single selection (radio) or multiple (checkbox)
 */
export type TModifierGroupType = 'single' | 'multiple';

/**
 * Cached product modifier for offline POS access
 *
 * Stored in Dexie table: offline_modifiers
 * TTL: 24 hours, refresh every hour when online
 *
 * Modifiers can be linked to either a product OR a category:
 * - Product modifiers: Override category modifiers for specific products
 * - Category modifiers: Default modifiers for all products in that category
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineModifier {
  /** Modifier UUID (primary key) */
  id: string;

  /** FK to products.id (null if category-level modifier) */
  product_id: string | null;

  /** FK to categories.id (null if product-level modifier) */
  category_id: string | null;

  /** Group name for grouping options (e.g., "Size", "Temperature") */
  group_name: string;

  /** Group type: single (radio) or multiple (checkbox) */
  group_type: TModifierGroupType;

  /** Whether selection in this group is required */
  group_required: boolean;

  /** Sort order for the group */
  group_sort_order: number;

  /** Option identifier within the group */
  option_id: string;

  /** Display label for the option */
  option_label: string;

  /** Emoji icon for the option */
  option_icon: string | null;

  /** Price adjustment in IDR (can be negative) */
  price_adjustment: number;

  /** Whether this option is selected by default */
  is_default: boolean;

  /** Sort order for the option within the group */
  option_sort_order: number;

  /** Whether modifier is active */
  is_active: boolean;

  /** ISO 8601 timestamp of creation */
  created_at: string | null;
}

/** Cache TTL for modifiers (24 hours in ms) - same as products */
export const MODIFIERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for modifiers when online (1 hour in ms) - same as products */
export const MODIFIERS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Recipes Cache Types (Story 2.4)
// =====================================================

/**
 * Cached recipe ingredient for offline costing display
 *
 * Stored in Dexie table: offline_recipes
 * TTL: 24 hours, refresh every hour when online
 *
 * Recipes store the ingredient links for a product's cost calculation.
 * Material cost_price comes from the offline_products table.
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineRecipe {
  /** Recipe UUID (primary key) */
  id: string;

  /** FK to products.id - The finished/semi-finished product */
  product_id: string;

  /** FK to products.id - The ingredient/material */
  material_id: string;

  /** Quantity of material per 1kg of product */
  quantity: number;

  /** Unit display string (e.g., "kg", "L", "pcs") */
  unit: string | null;

  /** Whether this recipe ingredient is active */
  is_active: boolean;

  /** ISO 8601 timestamp of creation */
  created_at: string | null;

  /** ISO 8601 timestamp of last update */
  updated_at: string | null;
}

/**
 * Recipe with joined material data for costing display
 * Used when rendering the CostingTab offline
 */
export interface IOfflineRecipeWithMaterial extends IOfflineRecipe {
  material: {
    id: string;
    name: string;
    sku: string | null;
    unit: string | null;
    cost_price: number | null;
    current_stock?: number;
  } | null;
}

/** Cache TTL for recipes (24 hours in ms) - same as products */
export const RECIPES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for recipes when online (1 hour in ms) - same as products */
export const RECIPES_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Production Reminders Types (Story 2.5)
// =====================================================

/**
 * Production item stored in a reminder
 * Mirrors the ProductionItem interface from useProduction
 */
export interface IProductionReminderItem {
  productId: string;
  name: string;
  category: string;
  icon: string;
  unit: string;
  quantity: number;
  wasted: number;
  wasteReason: string;
}

/**
 * Production reminder for offline mode
 *
 * Stored in localStorage (not Dexie) because:
 * - Simple structure, no complex queries needed
 * - Expected < 10 reminders at any time
 * - localStorage is simpler for this use case
 *
 * @see Story 2.5: Production Records (Online-Only with Deferred Sync)
 */
export interface IProductionReminder {
  /** UUID of the reminder */
  id: string;

  /** FK to sections.id */
  sectionId: string;

  /** Section name for display */
  sectionName: string;

  /** Intended production date (ISO 8601) */
  productionDate: string;

  /** Items to produce */
  items: IProductionReminderItem[];

  /** ISO 8601 timestamp when reminder was created */
  createdAt: string;

  /** Optional note from user */
  note?: string;
}

/** localStorage key for production reminders */
export const PRODUCTION_REMINDERS_STORAGE_KEY = 'offline_production_reminders';

// =====================================================
// Orders Cache Types (Story 3.1)
// =====================================================

/**
 * Order status for POS operations
 * Tracks order lifecycle from creation to completion
 * NOTE: Must match database enum 'order_status'
 */
export type TOrderStatus =
  | 'new'         // New order, not yet sent to kitchen
  | 'preparing'   // Sent to kitchen, being prepared
  | 'ready'       // Ready for pickup/serve
  | 'served'      // Served to customer
  | 'completed'   // Paid and done
  | 'cancelled'   // Order cancelled
  | 'voided';     // Order voided (added via migration)

/**
 * Order type for POS operations
 * Determines pricing, workflow, and display behavior
 */
export type TOrderType =
  | 'dine_in'     // Table service
  | 'takeaway'    // Take away order
  | 'delivery'    // Delivery order
  | 'b2b';        // B2B wholesale order

/**
 * Sync status for offline order tracking
 * Used to determine if order needs synchronization
 */
export type TOfflineOrderSyncStatus =
  | 'local'         // Created locally, not queued for sync
  | 'pending_sync'  // Queued for synchronization
  | 'synced'        // Successfully synced with server
  | 'conflict';     // Sync conflict detected

/**
 * Item status for KDS (Kitchen Display System) tracking
 * NOTE: Must match database enum 'item_status'
 */
export type TOrderItemStatus = 'new' | 'preparing' | 'ready' | 'served';

/**
 * Cached order for offline POS operations
 *
 * Stored in Dexie table: offline_orders
 * Synced to server when online via offline_sync_queue
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */
export interface IOfflineOrder {
  /** Order UUID - préfixé LOCAL- si créé offline */
  id: string;

  /** Order number for display: OFFLINE-YYYYMMDD-XXX */
  order_number: string;

  /** Order status in the workflow */
  status: TOrderStatus;

  /** Order type (dine_in, takeaway, etc.) */
  order_type: TOrderType;

  /** Subtotal before tax and discounts (IDR) */
  subtotal: number;

  /** Tax amount - 10% included in prices (IDR) */
  tax_amount: number;

  /** Discount amount applied (IDR) */
  discount_amount: number;

  /** Discount type if applied */
  discount_type: 'percentage' | 'amount' | null;

  /** Discount value (percentage or amount) */
  discount_value: number | null;

  /** Final total after tax and discounts (IDR) */
  total: number;

  /** FK to customers.id (nullable for anonymous orders) */
  customer_id: string | null;

  /** Table number for dine_in orders */
  table_number: string | null;

  /** Order notes from cashier */
  notes: string | null;

  /** FK to user_profiles.id - who created the order */
  user_id: string;

  /** FK to pos_sessions.id - active POS session */
  session_id: string | null;

  /** ISO 8601 timestamp of order creation */
  created_at: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;

  /** Sync status for offline tracking */
  sync_status: TOfflineOrderSyncStatus;

  /** Server ID after successful sync (replaces LOCAL- id) */
  server_id?: string;

  // ---- Kitchen Dispatch Fields (Story 3.7) ----

  /** Kitchen dispatch status for KDS delivery */
  dispatch_status?: TDispatchStatus;

  /** ISO 8601 timestamp when dispatched to KDS */
  dispatched_at?: string;

  /** Last dispatch error message if failed */
  dispatch_error?: string;
}

/**
 * Modifier applied to an order item
 * Stored as JSON array in IOfflineOrderItem.modifiers
 */
export interface IOfflineOrderItemModifier {
  /** Modifier option ID */
  option_id: string;

  /** Group name (e.g., "Size", "Temperature") */
  group_name: string;

  /** Option label (e.g., "Large", "Iced") */
  option_label: string;

  /** Price adjustment in IDR (can be negative) */
  price_adjustment: number;
}

/**
 * Cached order item for offline POS operations
 *
 * Stored in Dexie table: offline_order_items
 * Linked to orders via order_id
 *
 * @see ADR-001: Entités Synchronisées Offline
 */
export interface IOfflineOrderItem {
  /** Item UUID (auto-generated) */
  id: string;

  /** FK to offline_orders.id */
  order_id: string;

  /** FK to products.id */
  product_id: string;

  /** Product name at time of order (denormalized for offline display) */
  product_name: string;

  /** Product SKU at time of order */
  product_sku: string | null;

  /** Quantity ordered */
  quantity: number;

  /** Unit price at time of order (IDR) */
  unit_price: number;

  /** Line subtotal: (quantity * unit_price) + modifiers total (IDR) */
  subtotal: number;

  /** Applied modifiers as JSON array */
  modifiers: IOfflineOrderItemModifier[];

  /** Item-specific notes */
  notes: string | null;

  /** Dispatch station for KDS routing */
  dispatch_station: TDispatchStation | null;

  /** Item status for KDS tracking */
  item_status: TOrderItemStatus;

  /** ISO 8601 timestamp of creation */
  created_at: string;
}

/** Cache TTL for orders (7 days in ms) - longer than products for history */
export const ORDERS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Local order ID prefix for identifying offline-created orders */
export const LOCAL_ORDER_ID_PREFIX = 'LOCAL-';

/** Offline order number prefix */
export const OFFLINE_ORDER_NUMBER_PREFIX = 'OFFLINE-';

// =====================================================
// Payments Cache Types (Story 3.4)
// =====================================================

/**
 * Sync status for offline payment tracking
 */
export type TOfflinePaymentSyncStatus =
  | 'pending_sync'       // Queued for synchronization (cash)
  | 'pending_validation' // Card/QRIS needs online validation
  | 'synced'             // Successfully synced with server
  | 'conflict';          // Sync conflict detected

/**
 * Payment method types - re-exported from payment.ts (single source of truth)
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */
import type { TPaymentMethod } from './payment';
export type { TPaymentMethod } from './payment';

/**
 * Cached payment for offline POS operations
 *
 * Stored in Dexie table: offline_payments
 * Synced to server when online via offline_sync_queue
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */
export interface IOfflinePayment {
  /** Payment UUID - préfixé LOCAL-PAY- si créé offline */
  id: string;

  /** FK to offline_orders.id */
  order_id: string;

  /** Payment method type */
  method: TPaymentMethod;

  /** Payment amount in IDR */
  amount: number;

  /** Cash received (for cash payments only) */
  cash_received: number | null;

  /** Change given (for cash payments only) */
  change_given: number | null;

  /** Reference number for card/QRIS/transfer */
  reference: string | null;

  /** FK to user_profiles.id - who processed the payment */
  user_id: string;

  /** FK to pos_sessions.id */
  session_id: string | null;

  /** ISO 8601 timestamp of payment */
  created_at: string;

  /** Sync status for offline tracking */
  sync_status: TOfflinePaymentSyncStatus;

  /** Server ID after successful sync */
  server_id?: string;
}

/** Local payment ID prefix for identifying offline-created payments */
export const LOCAL_PAYMENT_ID_PREFIX = 'LOCAL-PAY-';

// =====================================================
// Sessions Cache Types (Story 3.5)
// =====================================================

/**
 * Session status for POS session tracking
 */
export type TSessionStatus = 'open' | 'closed';

/**
 * Sync status for offline session tracking
 */
export type TOfflineSessionSyncStatus =
  | 'pending_sync'  // Queued for synchronization
  | 'synced'        // Successfully synced with server
  | 'conflict';     // Sync conflict detected

/**
 * Payment totals by method for session summary
 */
export interface ISessionPaymentTotals {
  /** Total cash received in IDR */
  cash: number;
  /** Total card payments in IDR */
  card: number;
  /** Total QRIS payments in IDR */
  qris: number;
  /** Total EDC payments in IDR */
  edc: number;
  /** Total transfer payments in IDR */
  transfer: number;
  /** Grand total of all payment methods in IDR */
  total: number;
}

/**
 * Closing data input for session closure
 */
export interface ISessionClosingData {
  /** Actual cash counted at close */
  actual_cash: number;
  /** Actual card total at close */
  actual_card: number;
  /** Actual QRIS total at close */
  actual_qris: number;
  /** Actual EDC total at close */
  actual_edc: number;
  /** Actual transfer total at close */
  actual_transfer: number;
  /** Notes explaining any variance */
  notes?: string;
}

/**
 * Cached POS session for offline operations
 *
 * Stored in Dexie table: offline_sessions
 * Synced to server when online via offline_sync_queue
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */
export interface IOfflineSession {
  /** Session UUID - préfixé LOCAL-SESSION- si créé offline */
  id: string;

  /** FK to user_profiles.id - who opened the session */
  user_id: string;

  /** Session status: open or closed */
  status: TSessionStatus;

  /** Opening cash amount in IDR */
  opening_amount: number;

  /** Expected totals calculated from orders/payments */
  expected_totals: ISessionPaymentTotals | null;

  /** Actual totals entered at close */
  actual_totals: ISessionPaymentTotals | null;

  /** Cash variance (actual - expected) - positive = surplus, negative = shortage */
  cash_variance: number | null;

  /** Notes explaining variance */
  notes: string | null;

  /** ISO 8601 timestamp of session open */
  opened_at: string;

  /** ISO 8601 timestamp of session close (null if open) */
  closed_at: string | null;

  /** Sync status for offline tracking */
  sync_status: TOfflineSessionSyncStatus;

  /** Server ID after successful sync */
  server_id?: string;
}

/** Local session ID prefix for identifying offline-created sessions */
export const LOCAL_SESSION_ID_PREFIX = 'LOCAL-SESSION-';

// =====================================================
// Kitchen Dispatch Types (Story 3.7)
// =====================================================

/**
 * Dispatch status for kitchen orders
 * Tracks whether order has been sent to KDS
 */
export type TDispatchStatus =
  | 'pending'     // En attente d'envoi (LAN down ou pas encore envoyé)
  | 'dispatched'  // Envoyé et confirmé par KDS
  | 'failed';     // Échec après max retries

/**
 * Kitchen station types for KDS routing
 * Maps to categories.dispatch_station column
 */
export type TKitchenStation = 'kitchen' | 'barista' | 'display' | 'none';

/**
 * Dispatch queue item status
 */
export type TDispatchQueueStatus = 'pending' | 'sending' | 'failed';

/**
 * KDS order item payload for dispatch
 * Simplified format for transmission over LAN
 */
export interface IKdsOrderItem {
  /** Order item ID */
  id: string;
  /** Product ID */
  product_id: string;
  /** Product name */
  name: string;
  /** Quantity */
  quantity: number;
  /** Modifiers applied (option labels) */
  modifiers: string[];
  /** Special notes */
  notes: string | null;
  /** Category ID for station filtering */
  category_id: string;
}

/**
 * KDS new order payload for LAN broadcast
 * Sent from POS to KDS stations
 */
export interface IKdsNewOrderPayload {
  /** Order ID */
  order_id: string;
  /** Order number for display */
  order_number: string;
  /** Table number if dine-in */
  table_number: number | null;
  /** Order type */
  order_type: TOrderType;
  /** Items for this specific station */
  items: IKdsOrderItem[];
  /** Station this payload is for */
  station: TKitchenStation;
  /** ISO 8601 timestamp */
  timestamp: string;
}

/**
 * KDS order ACK payload
 * Sent from KDS back to POS to confirm receipt
 */
export interface IKdsOrderAckPayload {
  /** Order ID being acknowledged */
  order_id: string;
  /** Station acknowledging */
  station: TKitchenStation;
  /** Device ID of KDS */
  device_id: string;
  /** ISO 8601 timestamp of ACK */
  timestamp: string;
}

/**
 * Dispatch queue item for offline kitchen dispatch
 * Used when LAN is unavailable - queued for retry
 *
 * Stored in Dexie table: offline_dispatch_queue
 */
export interface IDispatchQueueItem {
  /** Auto-increment ID (Dexie) */
  id?: number;

  /** Order ID to dispatch */
  order_id: string;

  /** Target station (kitchen, barista, display) */
  station: TKitchenStation;

  /** Items filtered for this station */
  items: IKdsOrderItem[];

  /** ISO 8601 timestamp of queue add */
  created_at: string;

  /** Number of dispatch attempts */
  attempts: number;

  /** Last error message */
  last_error: string | null;

  /** Queue status */
  status: TDispatchQueueStatus;
}

/** Max retry attempts for dispatch queue items */
export const DISPATCH_MAX_ATTEMPTS = 3;

/** Retry backoff base in ms (2s → 4s → 8s) */
export const DISPATCH_RETRY_BACKOFF_MS = 2000;

// =====================================================
// Stock Levels Cache Types (Story 5.1)
// =====================================================

/**
 * Cached stock level for offline inventory access
 *
 * Stored in Dexie table: offline_stock_levels
 * TTL: 24 hours, refresh every hour when online
 * Mode: READ-ONLY (modifications online-only per ADR-001)
 *
 * @see Epic 5: Stock & Approvisionnement
 */
export interface IOfflineStockLevel {
  /** Primary key = product_id (single location for MVP) */
  id: string;

  /** FK to products.id */
  product_id: string;

  /** FK to locations.id - null for single location MVP */
  location_id: string | null;

  /** Current stock quantity */
  quantity: number;

  /** Minimum stock level for alerts */
  min_stock_level: number;

  /** ISO 8601 timestamp of last stock update */
  last_updated: string;
}

/** Cache TTL for stock levels (24 hours in ms) */
export const STOCK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for stock when online (1 hour in ms) */
export const STOCK_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Stock Alerts Types (Story 5.2)
// =====================================================

/**
 * Stock alert level for display
 * Note: TStockStatus is exported from useStockLevelsOffline hook
 * This type alias ensures consistency
 */
export type TStockAlertLevel = 'ok' | 'warning' | 'critical' | 'out_of_stock';

/** Threshold for considering stock data stale (1 hour in ms) */
export const STALE_DATA_THRESHOLD_MS = 60 * 60 * 1000;

/**
 * Check if cached data is considered stale
 * Data is stale if more than STALE_DATA_THRESHOLD_MS has elapsed since last sync
 *
 * @param lastSyncAt - ISO 8601 timestamp of last sync, or null if never synced
 * @returns true if data is stale or never synced
 *
 * @example
 * ```typescript
 * const { lastSyncAt } = useStockLevelsOffline();
 * if (isDataStale(lastSyncAt)) {
 *   // Show stale data warning
 * }
 * ```
 */
export function isDataStale(lastSyncAt: string | null): boolean {
  if (!lastSyncAt) return true;

  const lastSyncTime = new Date(lastSyncAt).getTime();
  const elapsed = Date.now() - lastSyncTime;

  return elapsed > STALE_DATA_THRESHOLD_MS;
}

// =====================================================
// Customers Cache Types (Story 6.1)
// =====================================================

/**
 * Cached customer for offline POS access
 *
 * Stored in Dexie table: offline_customers
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineCustomer {
  /** Customer UUID (primary key) */
  id: string;

  /** Phone number for search and identification */
  phone: string | null;

  /** Customer name */
  name: string;

  /** Email address */
  email: string | null;

  /** Customer category slug: 'retail', 'wholesale', 'discount_percentage', 'custom' */
  category_slug: string | null;

  /** Current loyalty tier name: 'Bronze', 'Silver', 'Gold', 'Platinum' */
  loyalty_tier: string | null;

  /** Current loyalty points balance */
  points_balance: number;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/** Cache TTL for customers (24 hours in ms) */
export const CUSTOMERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for customers when online (1 hour in ms) */
export const CUSTOMERS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Deferred Adjustment Notes Types (Story 5.3)
// =====================================================

/**
 * Type of stock adjustment for deferred notes
 * Matches the existing stock adjustment types
 */
export type TStockAdjustmentType = 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out';

/**
 * Deferred adjustment note for offline mode
 *
 * Stored in Dexie table: offline_adjustment_notes
 * Used when user tries to make stock adjustment while offline
 * Notes are persisted locally and can be processed when online
 *
 * @see Story 5.3: Stock Adjustment (Online-Only)
 * @see ADR-001: Stock adjustments are online-only for traceability
 */
export interface IDeferredAdjustmentNote {
  /** Auto-increment ID (Dexie) */
  id?: number;

  /** FK to products.id (optional - note may not be linked to specific product) */
  product_id?: string;

  /** Product name for display (denormalized for offline access) */
  product_name?: string;

  /** Free-form note text describing the intended adjustment */
  note: string;

  /** Suggested adjustment type (optional) */
  adjustment_type?: TStockAdjustmentType;

  /** Suggested quantity to adjust (optional) */
  suggested_quantity?: number;

  /** ISO 8601 timestamp when note was created */
  created_at: string;

  /** User ID who created the note (if available offline) */
  created_by?: string;
}

// =====================================================
// Customer Category Pricing Types (Story 6.2)
// =====================================================

/**
 * Price type applied to cart item
 * Indicates which pricing strategy was used
 */
export type TPriceType = 'retail' | 'wholesale' | 'discount' | 'custom';

/**
 * Cached customer category for offline pricing calculation
 *
 * Stored in Dexie table: offline_customer_categories
 * Used to determine pricing logic for customers
 *
 * @see Story 6.2: Customer Category Pricing Offline
 * @see ADR-001: Entités Synchronisées Offline
 */
export interface IOfflineCustomerCategory {
  /** Category UUID (primary key) */
  id: string;

  /** Category slug: 'retail', 'wholesale', 'discount_percentage', 'custom' */
  slug: string;

  /** Display name */
  name: string;

  /** Price modifier type (same as slug for now) */
  price_modifier_type: string;

  /** Discount percentage for 'discount_percentage' type (null for other types) */
  discount_percentage: number | null;

  /** Whether category is active */
  is_active: boolean;
}

/**
 * Cached product-specific price for a customer category
 * Used when category has price_modifier_type = 'custom'
 *
 * Stored in Dexie table: offline_product_category_prices
 * Only prices where is_active = true are cached
 *
 * @see Story 6.2: Customer Category Pricing Offline
 */
export interface IOfflineProductCategoryPrice {
  /** Price entry UUID (primary key) */
  id: string;

  /** Product UUID */
  product_id: string;

  /** Customer category UUID */
  customer_category_id: string;

  /** Custom price for this product/category combination (IDR) */
  price: number;

  /** Whether this price is active */
  is_active: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Result of customer pricing calculation
 * Returned by getCustomerProductPriceOffline
 */
export interface ICustomerPriceResult {
  /** Calculated price in IDR */
  price: number;

  /** Type of pricing applied */
  priceType: TPriceType;

  /** Savings compared to retail price (IDR) */
  savings: number;

  /** Category name for display (null if retail) */
  categoryName: string | null;
}

/** Cache TTL for customer categories (24 hours in ms) */
export const CUSTOMER_CATEGORIES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Cache TTL for product category prices (24 hours in ms) */
export const PRODUCT_CATEGORY_PRICES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// =====================================================
// Promotions Cache Types (Story 6.4)
// =====================================================

/**
 * Promotion type for offline evaluation
 */
export type TPromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product';

/**
 * Cached promotion for offline use
 *
 * Stored in Dexie table: offline_promotions
 * TTL: 24 hours, refresh every hour when online
 *
 * @see Story 6.4: Promotions Offline Cache
 * @see ADR-001: Promotions are READ-ONLY cache
 */
export interface IOfflinePromotion {
  /** Promotion UUID (primary key) */
  id: string;

  /** Unique promotion code */
  code: string;

  /** Promotion display name */
  name: string;

  /** Optional description */
  description: string | null;

  /** Promotion type: percentage, fixed_amount, buy_x_get_y, free_product */
  promotion_type: TPromotionType;

  /** Discount percentage for 'percentage' type (e.g., 10 for 10%) */
  discount_percentage: number | null;

  /** Discount amount for 'fixed_amount' type (IDR) */
  discount_amount: number | null;

  /** Buy quantity for 'buy_x_get_y' type */
  buy_quantity: number | null;

  /** Get quantity for 'buy_x_get_y' type */
  get_quantity: number | null;

  /** Start date (ISO date string) - null means no start restriction */
  start_date: string | null;

  /** End date (ISO date string) - null means no end restriction */
  end_date: string | null;

  /** Start time restriction (HH:MM format) */
  time_start: string | null;

  /** End time restriction (HH:MM format) */
  time_end: string | null;

  /** Days of week restriction (0=Sunday, 6=Saturday), null means all days */
  days_of_week: number[] | null;

  /** Minimum purchase amount to activate (IDR) */
  min_purchase_amount: number | null;

  /** Minimum product quantity to activate */
  min_quantity: number | null;

  /** Whether promotion is active */
  is_active: boolean;

  /** Whether promotion can stack with others */
  is_stackable: boolean;

  /** Priority for conflict resolution (higher = applied first) */
  priority: number;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Promotion-product association for targeted promotions
 *
 * Stored in Dexie table: offline_promotion_products
 * Links promotions to specific products or categories
 *
 * @see Story 6.4: Promotions Offline Cache
 */
export interface IOfflinePromotionProduct {
  /** Association UUID (primary key) */
  id: string;

  /** FK to promotions.id */
  promotion_id: string;

  /** FK to products.id - specific product, OR null if category */
  product_id: string | null;

  /** FK to categories.id - entire category, OR null if specific product */
  category_id: string | null;
}

/**
 * Free product for buy_x_get_y and free_product promotions
 *
 * Stored in Dexie table: offline_promotion_free_products
 * Defines what products are given free with a promotion
 *
 * @see Story 6.4: Promotions Offline Cache
 */
export interface IOfflinePromotionFreeProduct {
  /** Association UUID (primary key) */
  id: string;

  /** FK to promotions.id */
  promotion_id: string;

  /** FK to products.id - the free product given */
  free_product_id: string;

  /** Quantity of free product given */
  quantity: number;
}

/** Cache TTL for promotions (24 hours in ms) */
export const PROMOTIONS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for promotions when online (1 hour in ms) */
export const PROMOTIONS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
