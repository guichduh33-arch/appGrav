/**
 * useOfflineOrder Hook (Story 3.3)
 *
 * Hook for creating orders with automatic online/offline routing.
 * Detects network status and routes to appropriate backend.
 *
 * @see ADR-001: Entités Synchronisées Offline
 */

import { useCallback, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStatus } from './useNetworkStatus';
import { createOfflineOrder } from '@/services/offline/offlineOrderService';
import type { IOfflineOrder, IOfflineOrderItem } from '@/types/offline';

/**
 * Result of creating an order
 */
export interface ICreateOrderResult {
  order: IOfflineOrder;
  items: IOfflineOrderItem[];
}

/**
 * Return type for useOfflineOrder hook
 */
export interface IUseOfflineOrderResult {
  /** Create an order from current cart state */
  createOrder: () => Promise<ICreateOrderResult | null>;
  /** Whether the network is offline */
  isOffline: boolean;
  /** Whether order creation is in progress */
  isCreating: boolean;
  /** Error message if order creation failed */
  error: string | null;
  /** Clear the error state */
  clearError: () => void;
}

/**
 * Hook for creating orders with automatic online/offline routing
 *
 * Automatically detects network status and routes to:
 * - Online: Creates order locally, then synced to Supabase via sync engine
 * - Offline: IndexedDB via offlineOrderService
 *
 * @example
 * ```tsx
 * function CheckoutButton() {
 *   const { createOrder, isCreating, isOffline, error } = useOfflineOrder();
 *
 *   const handleCheckout = async () => {
 *     const result = await createOrder();
 *     if (result) {
 *       toast.success(`Order ${result.order.order_number} created`);
 *     }
 *   };
 *
 *   return (
 *     <Button onClick={handleCheckout} disabled={isCreating}>
 *       {isCreating ? 'Creating...' : 'Checkout'}
 *       {isOffline && ' (Offline)'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useOfflineOrder(): IUseOfflineOrderResult {
  const { isOnline } = useNetworkStatus();
  const cartState = useCartStore();
  const { user } = useAuthStore();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createOrder = useCallback(async (): Promise<ICreateOrderResult | null> => {
    // Validate user is authenticated
    if (!user?.id) {
      setError('User must be authenticated to create orders');
      return null;
    }

    // Validate cart has items
    if (cartState.items.length === 0) {
      setError('Cart is empty');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Extract relevant cart state
      const cart = {
        items: cartState.items,
        orderType: cartState.orderType,
        tableNumber: cartState.tableNumber,
        customerId: cartState.customerId,
        discountType: cartState.discountType,
        discountValue: cartState.discountValue,
        discountReason: cartState.discountReason,
        subtotal: cartState.subtotal,
        discountAmount: cartState.discountAmount,
        total: cartState.total,
      };

      // POST-LAUNCH: Wire up session ID from useOfflineSession hook when POS checkout uses this hook
      const sessionId: string | null = null;

      // Offline-first: Always save to IndexedDB first, sync engine handles server upload
      const result = await createOfflineOrder(cart, user.id, sessionId);

      // Clear cart after successful creation
      // clearCart() also clears the persisted cart (Story 3.2)
      cartState.clearCart();

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [isOnline, cartState, user]);

  return {
    createOrder,
    isOffline: !isOnline,
    isCreating,
    error,
    clearError,
  };
}
