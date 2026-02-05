/**
 * useOfflinePayment Hook (Story 3.4)
 *
 * Hook for processing payments with automatic online/offline routing.
 * Handles the complete flow: cart → order → payment → clear.
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */

import { useCallback, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStatus } from './useNetworkStatus';
import { createOfflineOrder } from '@/services/offline/offlineOrderService';
import {
  saveOfflinePayment,
  saveOfflinePayments,
  calculateChange,
} from '@/services/offline/offlinePaymentService';
import { dispatchOrderToKitchen } from '@/services/offline/kitchenDispatchService';
import type {
  IOfflineOrder,
  IOfflineOrderItem,
  IOfflinePayment,
  TPaymentMethod,
  TKitchenStation,
} from '@/types/offline';

/**
 * Input for processing a payment
 */
export interface IPaymentInput {
  /** Payment method type */
  method: TPaymentMethod;
  /** Payment amount in IDR */
  amount: number;
  /** Cash received from customer (for cash payments) */
  cashReceived?: number;
  /** Reference number for card/QRIS/transfer */
  reference?: string;
}

/**
 * Result of processing a payment
 */
export interface IPaymentResult {
  /** Created order */
  order: IOfflineOrder;
  /** Created order items */
  items: IOfflineOrderItem[];
  /** Created payment */
  payment: IOfflinePayment;
  /** Change to give back (for cash payments) */
  change: number;
  /** Stations dispatched to KDS */
  dispatchedStations: TKitchenStation[];
  /** Stations queued for later dispatch */
  queuedStations: TKitchenStation[];
}

/**
 * Result of processing split payments
 */
export interface ISplitPaymentResult {
  /** Created order */
  order: IOfflineOrder;
  /** Created order items */
  items: IOfflineOrderItem[];
  /** Created payments */
  payments: IOfflinePayment[];
  /** Total change to give back (for cash payments) */
  change: number;
  /** Stations dispatched to KDS */
  dispatchedStations: TKitchenStation[];
  /** Stations queued for later dispatch */
  queuedStations: TKitchenStation[];
}

/**
 * Return type for useOfflinePayment hook
 */
export interface IUseOfflinePaymentResult {
  /** Process single payment and create order */
  processPayment: (input: IPaymentInput) => Promise<IPaymentResult | null>;
  /** Process split payments and create order */
  processSplitPayment: (inputs: IPaymentInput[]) => Promise<ISplitPaymentResult | null>;
  /** Whether the network is offline */
  isOffline: boolean;
  /** Whether payment processing is in progress */
  isProcessing: boolean;
  /** Error message if payment failed */
  error: string | null;
  /** Clear the error state */
  clearError: () => void;
}

/**
 * Hook for processing payments with offline-first architecture
 *
 * **Design Note:** This hook always uses offline services (createOfflineOrder,
 * saveOfflinePayment) regardless of network status. The sync queue will handle
 * synchronization when online. This simplifies the code and ensures consistent
 * behavior. The `isOffline` flag is exposed for UI purposes only (e.g., showing
 * "pending validation" badge for card/QRIS payments when offline).
 *
 * Handles the complete payment flow:
 * 1. Create order from cart (via createOfflineOrder)
 * 2. Save payment linked to order
 * 3. Clear cart
 *
 * @example
 * ```tsx
 * function PaymentButton() {
 *   const { processPayment, isProcessing, isOffline, error } = useOfflinePayment();
 *   const { total } = useCartStore();
 *
 *   const handlePayment = async () => {
 *     const result = await processPayment({
 *       method: 'cash',
 *       amount: total,
 *       cashReceived: 200000,
 *     });
 *
 *     if (result) {
 *       toast.success(`Payment complete! Change: ${result.change}`);
 *     }
 *   };
 *
 *   return (
 *     <Button onClick={handlePayment} disabled={isProcessing}>
 *       {isProcessing ? 'Processing...' : 'Pay'}
 *       {isOffline && ' (Offline)'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useOfflinePayment(): IUseOfflinePaymentResult {
  const { isOnline } = useNetworkStatus();
  const cartState = useCartStore();
  const { user, sessionId } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processPayment = useCallback(
    async (input: IPaymentInput): Promise<IPaymentResult | null> => {
      // Validate user is authenticated
      if (!user?.id) {
        setError('User must be authenticated to process payments');
        return null;
      }

      // Validate cart has items
      if (cartState.items.length === 0) {
        setError('Cart is empty');
        return null;
      }

      // Validate payment amount
      if (input.amount <= 0) {
        setError('Payment amount must be positive');
        return null;
      }

      // Validate payment amount matches cart total (prevent partial payments without split)
      if (Math.abs(input.amount - cartState.total) > 1) {
        // Allow 1 IDR tolerance for rounding
        setError('Payment amount must match cart total');
        return null;
      }

      // For cash payments, validate cash received
      if (input.method === 'cash') {
        if (!input.cashReceived || input.cashReceived < input.amount) {
          setError('Cash received must be at least the payment amount');
          return null;
        }
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Calculate change for cash payments
        const change =
          input.method === 'cash' && input.cashReceived
            ? calculateChange(input.amount, input.cashReceived)
            : 0;

        // 1. Create order from cart
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

        const { order, items } = await createOfflineOrder(
          cart,
          user.id,
          sessionId ?? null
        );

        // 2. Save payment linked to order
        const payment = await saveOfflinePayment({
          order_id: order.id,
          method: input.method,
          amount: input.amount,
          cash_received: input.cashReceived,
          change_given: change > 0 ? change : undefined,
          reference: input.reference,
          user_id: user.id,
          session_id: sessionId ?? null,
        });

        // 3. Dispatch order to kitchen (Story 3.7)
        // This happens AFTER payment is confirmed
        // Dispatch will queue locally if LAN is unavailable
        const { dispatched, queued } = await dispatchOrderToKitchen(order, items);

        // 4. Clear cart after successful creation
        // clearCart() also clears the persisted cart (Story 3.2)
        cartState.clearCart();

        return {
          order,
          items,
          payment,
          change,
          dispatchedStations: dispatched,
          queuedStations: queued,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to process payment';
        setError(message);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [cartState, user, sessionId]
  );

  /**
   * Process multiple split payments for an order
   */
  const processSplitPayment = useCallback(
    async (inputs: IPaymentInput[]): Promise<ISplitPaymentResult | null> => {
      // Validate user is authenticated
      if (!user?.id) {
        setError('User must be authenticated to process payments');
        return null;
      }

      // Validate cart has items
      if (cartState.items.length === 0) {
        setError('Cart is empty');
        return null;
      }

      // Validate at least one payment
      if (inputs.length === 0) {
        setError('At least one payment is required');
        return null;
      }

      // Validate total payment amount matches cart total (allow 1 IDR tolerance)
      const totalPayments = inputs.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPayments - cartState.total) > 1) {
        setError('Total payments must match cart total');
        return null;
      }

      // Validate each payment
      for (const input of inputs) {
        if (input.amount <= 0) {
          setError('Each payment amount must be positive');
          return null;
        }
        if (input.method === 'cash' && input.cashReceived && input.cashReceived < input.amount) {
          setError('Cash received must be at least the payment amount');
          return null;
        }
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Calculate total change for cash payments
        const totalChange = inputs.reduce((sum, input) => {
          if (input.method === 'cash' && input.cashReceived) {
            return sum + calculateChange(input.amount, input.cashReceived);
          }
          return sum;
        }, 0);

        // 1. Create order from cart
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

        const { order, items } = await createOfflineOrder(
          cart,
          user.id,
          sessionId ?? null
        );

        // 2. Save all payments linked to order
        const paymentInputs = inputs.map((input) => ({
          method: input.method,
          amount: input.amount,
          cash_received: input.cashReceived,
          change_given:
            input.method === 'cash' && input.cashReceived
              ? calculateChange(input.amount, input.cashReceived)
              : undefined,
          reference: input.reference,
          user_id: user.id,
          session_id: sessionId ?? null,
        }));

        const payments = await saveOfflinePayments(order.id, paymentInputs);

        // 3. Dispatch order to kitchen
        const { dispatched, queued } = await dispatchOrderToKitchen(order, items);

        // 4. Clear cart after successful creation
        cartState.clearCart();

        return {
          order,
          items,
          payments,
          change: totalChange,
          dispatchedStations: dispatched,
          queuedStations: queued,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to process split payment';
        setError(message);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [cartState, user, sessionId]
  );

  return {
    processPayment,
    processSplitPayment,
    isOffline: !isOnline,
    isProcessing,
    error,
    clearError,
  };
}
