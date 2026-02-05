/**
 * Offline Order Service (Story 3.3)
 *
 * Converts cart state to offline orders and saves them to IndexedDB.
 * Uses ordersCacheService for persistence and sync queue management.
 *
 * Key features:
 * - Convert CartItem[] to IOfflineOrderItem[]
 * - Calculate tax (10% included in prices)
 * - Preserve customer and table associations
 * - Automatic sync queue integration via ordersCacheService
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */

import type { CartItem, CartModifier, ComboSelectedItem } from '@/stores/cartStore';
import type {
  IOfflineOrder,
  IOfflineOrderItem,
  IOfflineOrderItemModifier,
  TOrderType,
  TDispatchStation,
} from '@/types/offline';
import {
  saveOfflineOrder,
  type TCreateOfflineOrderInput,
  type TCreateOfflineOrderItemInput,
} from './ordersCacheService';
import { db } from '@/lib/db';

// =====================================================
// Cart State Type (for type safety)
// =====================================================

/**
 * Cart state required for order creation
 * Extracted from cartStore to avoid circular dependencies
 */
export interface ICartStateForOrder {
  items: CartItem[];
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber: string | null;
  customerId: string | null;
  discountType: 'percent' | 'amount' | null;
  discountValue: number;
  discountReason: string | null;
  subtotal: number;
  discountAmount: number;
  total: number;
}

// =====================================================
// Tax Calculation (CRITICAL BUSINESS RULE)
// =====================================================

/**
 * Calculate tax amount from total (10% included)
 *
 * Business rule: Tax is INCLUDED in prices, not added.
 * Formula: tax = total × 10/110
 *
 * @example
 * // total = 110,000 IDR
 * // tax_amount = 110000 * 10 / 110 = 10,000 IDR
 *
 * @param total - Total amount with tax included
 * @returns Tax amount rounded to nearest IDR
 */
export function calculateTaxAmount(total: number): number {
  return Math.round(total * 10 / 110);
}

// =====================================================
// Type Mapping Functions
// =====================================================

/**
 * Convert cart discount type to order discount type
 *
 * Cart uses 'percent', order uses 'percentage' for consistency
 * with database schema
 */
function mapDiscountType(
  cartType: 'percent' | 'amount' | null
): 'percentage' | 'amount' | null {
  if (cartType === 'percent') return 'percentage';
  return cartType;
}

/**
 * Convert CartModifier to IOfflineOrderItemModifier
 */
function convertModifier(mod: CartModifier): IOfflineOrderItemModifier {
  return {
    option_id: mod.optionId,
    group_name: mod.groupName,
    option_label: mod.optionLabel,
    price_adjustment: mod.priceAdjustment,
  };
}

/**
 * Convert ComboSelectedItem to IOfflineOrderItemModifier
 * Combo selections are stored as modifiers on the order item
 */
function convertComboSelection(sel: ComboSelectedItem): IOfflineOrderItemModifier {
  return {
    option_id: sel.item_id,
    group_name: sel.group_name,
    option_label: sel.product_name,
    price_adjustment: sel.price_adjustment,
  };
}

// =====================================================
// Dispatch Station Resolution
// =====================================================

/**
 * Get dispatch station for a product from its category
 *
 * Reads from offline_categories cache to get the KDS routing station
 *
 * @param categoryId - Product's category ID
 * @returns Dispatch station or null if not found
 */
async function getDispatchStation(
  categoryId: string | null
): Promise<TDispatchStation | null> {
  if (!categoryId) return null;

  const category = await db.offline_categories.get(categoryId);
  return (category?.dispatch_station as TDispatchStation) ?? null;
}

// =====================================================
// Cart Item Conversion
// =====================================================

/**
 * Convert a cart item to an offline order item
 *
 * Handles both product and combo items with their respective
 * modifiers/selections.
 *
 * @param cartItem - Cart item to convert
 * @returns Order item input ready for saveOfflineOrder
 * @throws Error if cart item has neither product nor combo
 */
export async function convertCartItemToOrderItem(
  cartItem: CartItem
): Promise<TCreateOfflineOrderItemInput> {
  // Handle product type
  if (cartItem.type === 'product' && cartItem.product) {
    const product = cartItem.product;
    const dispatchStation = await getDispatchStation(product.category_id ?? null);

    return {
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku ?? null,
      quantity: cartItem.quantity,
      unit_price: cartItem.unitPrice,
      subtotal: cartItem.totalPrice,
      modifiers: cartItem.modifiers.map(convertModifier),
      notes: cartItem.notes || null,
      dispatch_station: dispatchStation,
      item_status: 'new',
    };
  }

  // Handle combo type
  if (cartItem.type === 'combo' && cartItem.combo) {
    const combo = cartItem.combo;

    return {
      product_id: combo.id,
      product_name: combo.name,
      product_sku: null,
      quantity: cartItem.quantity,
      unit_price: cartItem.unitPrice,
      subtotal: cartItem.totalPrice,
      modifiers: (cartItem.comboSelections || []).map(convertComboSelection),
      notes: cartItem.notes || null,
      dispatch_station: null, // Combos are dispatched based on their individual items
      item_status: 'new',
    };
  }

  throw new Error('Invalid cart item: must have product or combo');
}

// =====================================================
// Main Order Creation Function
// =====================================================

/**
 * Create an offline order from cart state
 *
 * Converts cart state to order format, calculates tax,
 * and saves to IndexedDB with automatic sync queue entry.
 *
 * @param cartState - Current cart state from useCartStore
 * @param userId - Current authenticated user ID
 * @param sessionId - Current POS session ID (optional)
 * @returns Created order with items
 * @throws Error if cart is empty or userId is missing
 *
 * @example
 * ```typescript
 * const cart = useCartStore.getState();
 * const { order, items } = await createOfflineOrder(
 *   {
 *     items: cart.items,
 *     orderType: cart.orderType,
 *     tableNumber: cart.tableNumber,
 *     customerId: cart.customerId,
 *     discountType: cart.discountType,
 *     discountValue: cart.discountValue,
 *     discountReason: cart.discountReason,
 *     subtotal: cart.subtotal,
 *     discountAmount: cart.discountAmount,
 *     total: cart.total,
 *   },
 *   user.id,
 *   sessionId
 * );
 * ```
 */
export async function createOfflineOrder(
  cartState: ICartStateForOrder,
  userId: string,
  sessionId: string | null
): Promise<{ order: IOfflineOrder; items: IOfflineOrderItem[] }> {
  // Validate inputs
  if (!userId) {
    throw new Error('User ID is required to create an order');
  }

  if (cartState.items.length === 0) {
    throw new Error('Cannot create order with empty cart');
  }

  // Calculate tax (10% included in prices)
  const taxAmount = calculateTaxAmount(cartState.total);

  // Build order input
  const orderInput: TCreateOfflineOrderInput = {
    status: 'new',
    order_type: cartState.orderType as TOrderType,
    subtotal: cartState.subtotal,
    tax_amount: taxAmount,
    discount_amount: cartState.discountAmount,
    discount_type: mapDiscountType(cartState.discountType),
    discount_value: cartState.discountValue || null,
    total: cartState.total,
    customer_id: cartState.customerId,
    table_number: cartState.tableNumber,
    notes: cartState.discountReason, // Store discount reason as order note
    user_id: userId,
    session_id: sessionId,
  };

  // Convert cart items to order items
  const itemInputs: TCreateOfflineOrderItemInput[] = await Promise.all(
    cartState.items.map(item => convertCartItemToOrderItem(item))
  );

  // Save order (handles ID generation, order number, and sync queue)
  // saveOfflineOrder from ordersCacheService (Story 3.1) handles:
  // - LOCAL- prefixed UUID generation
  // - OFFLINE-YYYYMMDD-XXX order number
  // - Automatic sync queue entry
  // - Transaction safety
  return saveOfflineOrder(orderInput, itemInputs);
}
