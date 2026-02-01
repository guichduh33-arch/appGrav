/**
 * Cart Persistence Service (Story 3.2)
 *
 * Manages cart state persistence in localStorage for offline recovery.
 * Allows the cart to survive app crashes/restarts without losing orders in progress.
 *
 * Key features:
 * - Save/load cart state to localStorage
 * - Validate cart items against current product catalog
 * - Silent failure handling (persistence errors don't break the app)
 *
 * Note: This is LOCAL ONLY persistence for recovery, NOT server sync.
 * Cart is transient state and is NOT added to sync queue.
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */

import type { CartItem } from '@/stores/cartStore';
import { db } from '@/lib/db';

// =====================================================
// Constants
// =====================================================

/** localStorage key for cart state */
export const CART_PERSISTENCE_KEY = 'appgrav_cart_state';

// =====================================================
// Types
// =====================================================

/**
 * Persisted cart state structure
 * Stored in localStorage as JSON
 *
 * Note: Does NOT include computed values (subtotal, total, etc.)
 * These are recalculated on load via calculateTotals()
 */
export interface IPersistedCartState {
  /** Cart items with products, modifiers, variants */
  items: CartItem[];

  /** IDs of items sent to kitchen (locked) */
  lockedItemIds: string[];

  /** Active order ID if cart is linked to an existing order */
  activeOrderId: string | null;

  /** Active order number for display */
  activeOrderNumber: string | null;

  /** Order type */
  orderType: 'dine_in' | 'takeaway' | 'delivery';

  /** Table number for dine_in */
  tableNumber: string | null;

  /** Associated customer ID */
  customerId: string | null;

  /** Customer display name */
  customerName: string | null;

  /** Discount type if applied */
  discountType: 'percent' | 'amount' | null;

  /** Discount value */
  discountValue: number;

  /** Reason for discount */
  discountReason: string | null;

  /** Timestamp when cart was saved (ISO 8601, for debugging) */
  savedAt: string;
}

/**
 * Input type for saveCart (without savedAt which is auto-generated)
 */
export type TSaveCartInput = Omit<IPersistedCartState, 'savedAt'>;

// =====================================================
// Core CRUD Operations
// =====================================================

/**
 * Save cart state to localStorage
 *
 * Called on every cart mutation (should be debounced by caller).
 * Failures are logged but don't throw - persistence errors shouldn't break the app.
 *
 * @param state - Cart state to persist (without savedAt)
 */
export function saveCart(state: TSaveCartInput): void {
  try {
    const persistedState: IPersistedCartState = {
      ...state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(CART_PERSISTENCE_KEY, JSON.stringify(persistedState));
  } catch (error) {
    // Silent failure - log but don't throw
    // Persistence failure shouldn't break the app
    console.error('[CartPersistence] Failed to save cart:', error);
  }
}

/**
 * Load cart state from localStorage
 *
 * Returns null if:
 * - No cart found in localStorage
 * - Invalid JSON data
 * - Missing required fields
 *
 * @returns Persisted cart state or null
 */
export function loadCart(): IPersistedCartState | null {
  try {
    const stored = localStorage.getItem(CART_PERSISTENCE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as IPersistedCartState;

    // Basic validation - items array must exist
    if (!parsed.items || !Array.isArray(parsed.items)) {
      return null;
    }

    // Ensure required fields have defaults
    return {
      items: parsed.items,
      lockedItemIds: parsed.lockedItemIds ?? [],
      activeOrderId: parsed.activeOrderId ?? null,
      activeOrderNumber: parsed.activeOrderNumber ?? null,
      orderType: parsed.orderType ?? 'dine_in',
      tableNumber: parsed.tableNumber ?? null,
      customerId: parsed.customerId ?? null,
      customerName: parsed.customerName ?? null,
      discountType: parsed.discountType ?? null,
      discountValue: parsed.discountValue ?? 0,
      discountReason: parsed.discountReason ?? null,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    // Silent failure - log but return null
    console.error('[CartPersistence] Failed to load cart:', error);
    return null;
  }
}

/**
 * Clear persisted cart from localStorage
 *
 * Called when order is completed/paid or cart is explicitly cleared.
 * Failures are logged but don't throw.
 */
export function clearPersistedCart(): void {
  try {
    localStorage.removeItem(CART_PERSISTENCE_KEY);
  } catch (error) {
    // Silent failure - log but don't throw
    console.error('[CartPersistence] Failed to clear cart:', error);
  }
}

/**
 * Check if a persisted cart exists in localStorage
 *
 * @returns true if a persisted cart exists
 */
export function hasPersistedCart(): boolean {
  try {
    return localStorage.getItem(CART_PERSISTENCE_KEY) !== null;
  } catch {
    return false;
  }
}

// =====================================================
// Validation Operations
// =====================================================

/**
 * Validate cart items against current product catalog
 *
 * Removes items whose products no longer exist in offline cache or are inactive.
 * This prevents errors when the product catalog has changed since the cart was saved.
 *
 * @param items - Cart items to validate
 * @returns Object with validItems array and removedNames array for notification
 */
export async function validateAndFilterCartItems(
  items: CartItem[]
): Promise<{ validItems: CartItem[]; removedNames: string[] }> {
  const validItems: CartItem[] = [];
  const removedNames: string[] = [];

  for (const item of items) {
    if (item.type === 'product' && item.product) {
      // Check if product exists in offline cache and is active, visible, and available
      const product = await db.offline_products.get(item.product.id);
      const isValid =
        product &&
        Boolean(product.is_active) &&
        Boolean(product.pos_visible) &&
        Boolean(product.available_for_sale);

      if (isValid) {
        validItems.push(item);
      } else {
        removedNames.push(item.product.name);
      }
    } else if (item.type === 'combo' && item.combo) {
      // Combos: for MVP, assume valid if combo object exists
      // TODO: validate combo still exists in offline cache when combos are cached
      validItems.push(item);
    }
  }

  return { validItems, removedNames };
}
