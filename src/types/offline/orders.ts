/**
 * Offline Order Types
 *
 * Type definitions for offline order management including:
 * - Orders cache (Story 3.1)
 * - Order items
 * - Payments (Story 3.4)
 * - Sessions (Story 3.5)
 * - Kitchen dispatch (Story 3.7)
 * - Legacy order types (backward compatibility)
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

import type { TDispatchStation } from './products';

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
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-002: Strategie de Synchronisation
 */
export interface IOfflineOrder {
  /** Order UUID - prefixed LOCAL- if created offline */
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
 * @see ADR-001: Entites Synchronisees Offline
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
import type { TPaymentMethod } from '../payment';
export type { TPaymentMethod } from '../payment';

/**
 * Cached payment for offline POS operations
 *
 * Stored in Dexie table: offline_payments
 * Synced to server when online via offline_sync_queue
 *
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-002: Strategie de Synchronisation
 */
export interface IOfflinePayment {
  /** Payment UUID - prefixed LOCAL-PAY- if created offline */
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
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-002: Strategie de Synchronisation
 */
export interface IOfflineSession {
  /** Session UUID - prefixed LOCAL-SESSION- if created offline */
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
  | 'pending'     // Waiting to be sent (LAN down or not yet sent)
  | 'dispatched'  // Sent and confirmed by KDS
  | 'failed';     // Failed after max retries

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

  /** C-7: ISO 8601 timestamp of last attempt (for backoff) */
  last_attempt_at: string | null;

  /** Queue status */
  status: TDispatchQueueStatus;
}

/** Max retry attempts for dispatch queue items */
export const DISPATCH_MAX_ATTEMPTS = 3;

/** Retry backoff base in ms (2s -> 4s -> 8s) */
export const DISPATCH_RETRY_BACKOFF_MS = 2000;

// =====================================================
// Legacy Order Types (for orderSync.ts compatibility)
// =====================================================

/**
 * Legacy offline order item structure
 * Used by orderSync.ts for embedded items array
 *
 * @deprecated Use IOfflineOrderItem with separate table
 */
export interface ILegacyOfflineOrderItem {
  /** Item UUID */
  id: string;

  /** FK to products.id */
  product_id: string;

  /** Product name for display */
  product_name: string;

  /** Quantity ordered */
  quantity: number;

  /** Unit price (IDR) */
  unit_price: number;

  /** Total price for this line (IDR) */
  total_price: number;

  /** Applied modifiers */
  modifiers: Array<{
    id: string;
    name: string;
    price_adjustment: number;
  }>;
}

/**
 * Legacy offline order structure with embedded items
 * Used by orderSync.ts for backward compatibility
 *
 * @deprecated Use IOfflineOrder with separate order_items table
 */
export interface ILegacyOfflineOrder {
  /** Order UUID (prefixed with offline-) */
  id: string;

  /** Order number for display */
  order_number: string;

  /** Order type */
  order_type: 'dine_in' | 'takeaway' | 'delivery';

  /** Table number for dine_in */
  table_number: string | null;

  /** FK to customers.id */
  customer_id: string | null;

  /** Customer name for display */
  customer_name: string | null;

  /** Embedded order items (legacy format) */
  items: ILegacyOfflineOrderItem[];

  /** Subtotal before discounts (IDR) */
  subtotal: number;

  /** Discount amount applied (IDR) */
  discount_amount: number;

  /** Discount type */
  discount_type: string | null;

  /** Discount value */
  discount_value: number | null;

  /** Tax amount (IDR) */
  tax_amount: number;

  /** Final total (IDR) */
  total: number;

  /** Payment method used */
  payment_method: string;

  /** Payment status */
  payment_status: 'pending' | 'paid';

  /** Order notes */
  notes: string;

  /** ISO 8601 creation timestamp */
  created_at: string;

  /** Whether order was created offline */
  created_offline: boolean;

  /** Whether order has been synced */
  synced: boolean;

  /** ISO 8601 sync timestamp */
  synced_at: string | null;

  /** POS terminal ID */
  pos_terminal_id: string | null;

  /** Server order ID after sync */
  server_order_id?: string;
}
