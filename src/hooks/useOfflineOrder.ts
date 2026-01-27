/**
 * Offline Order Hook
 * Story 2.2 - Offline Order Creation
 *
 * Hook for managing offline order operations.
 */

import { useState, useCallback } from 'react';
import { useNetworkStore } from '@/stores/networkStore';
import { useTerminalStore } from '@/stores/terminalStore';
import {
  saveOrderOffline,
  getOfflineOrders,
  getPendingOrdersCount,
  IOfflineOrder,
} from '@/services/sync/orderSync';
import type { CartItem } from '@/stores/cartStore';
import type { OrderType } from '@/stores/orderStore';

interface IUseOfflineOrderReturn {
  /**
   * Whether the system is currently offline
   */
  isOffline: boolean;

  /**
   * Number of pending (unsynced) offline orders
   */
  pendingCount: number;

  /**
   * Save an order when offline
   */
  createOfflineOrder: (params: {
    orderNumber: string;
    orderType: OrderType;
    tableNumber: string | null;
    customerId: string | null;
    customerName: string | null;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    discountType: string | null;
    discountValue: number | null;
    total: number;
    paymentMethod: string;
    notes?: string;
  }) => Promise<IOfflineOrder>;

  /**
   * Get all pending offline orders
   */
  getPendingOrders: () => Promise<IOfflineOrder[]>;

  /**
   * Refresh the pending count
   */
  refreshPendingCount: () => Promise<void>;

  /**
   * Loading state for operations
   */
  isLoading: boolean;

  /**
   * Error from last operation
   */
  error: string | null;
}

/**
 * Hook for offline order operations
 *
 * @example
 * ```tsx
 * const { isOffline, createOfflineOrder, pendingCount } = useOfflineOrder();
 *
 * const handleCompleteOrder = async () => {
 *   if (isOffline) {
 *     const order = await createOfflineOrder({
 *       orderNumber: '#1001',
 *       orderType: 'dine_in',
 *       // ... other params
 *     });
 *     toast.success('Order saved offline');
 *   }
 * };
 * ```
 */
export function useOfflineOrder(): IUseOfflineOrderReturn {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const terminalId = useTerminalStore((state) => state.serverId);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh the pending orders count
   */
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingOrdersCount();
      setPendingCount(count);
    } catch (err) {
      console.error('[useOfflineOrder] Error getting pending count:', err);
    }
  }, []);

  /**
   * Create an offline order
   */
  const createOfflineOrder = useCallback(
    async (params: {
      orderNumber: string;
      orderType: OrderType;
      tableNumber: string | null;
      customerId: string | null;
      customerName: string | null;
      items: CartItem[];
      subtotal: number;
      discountAmount: number;
      discountType: string | null;
      discountValue: number | null;
      total: number;
      paymentMethod: string;
      notes?: string;
    }): Promise<IOfflineOrder> => {
      setIsLoading(true);
      setError(null);

      try {
        const order = await saveOrderOffline({
          ...params,
          posTerminalId: terminalId,
        });

        // Update pending count
        await refreshPendingCount();

        return order;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save order offline';
        setError(errorMessage);
        console.error('[useOfflineOrder] Error creating offline order:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [terminalId, refreshPendingCount]
  );

  /**
   * Get all pending (unsynced) offline orders
   */
  const getPendingOrders = useCallback(async (): Promise<IOfflineOrder[]> => {
    try {
      return await getOfflineOrders();
    } catch (err) {
      console.error('[useOfflineOrder] Error getting pending orders:', err);
      return [];
    }
  }, []);

  return {
    isOffline: !isOnline,
    pendingCount,
    createOfflineOrder,
    getPendingOrders,
    refreshPendingCount,
    isLoading,
    error,
  };
}

/**
 * Check if an order was created offline (by ID prefix)
 */
export function isOfflineOrderId(orderId: string): boolean {
  return orderId.startsWith('offline-');
}

/**
 * Format offline order indicator text
 */
export function getOfflineOrderLabel(isOffline: boolean): string {
  return isOffline ? 'OFFLINE - Pending sync' : '';
}
