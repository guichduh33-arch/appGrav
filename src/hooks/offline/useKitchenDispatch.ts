/**
 * useKitchenDispatch Hook
 * Story 3.7 - Kitchen Dispatch via LAN (Offline)
 *
 * React hook for kitchen dispatch functionality.
 * Handles dispatching orders to KDS stations and managing the dispatch queue.
 *
 * @see _bmad-output/implementation-artifacts/3-7-kitchen-dispatch-via-lan-offline.md
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useLanStore } from '@/stores/lanStore';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import {
  dispatchOrderToKitchen,
  processDispatchQueue,
  markStationDispatched,
  getPendingDispatchCount,
  getFailedDispatchCount,
  getRetryDelay,
} from '@/services/offline/kitchenDispatchService';
import type {
  IKdsOrderAckPayload,
  TKitchenStation,
  TDispatchStatus,
  IDispatchQueueItem,
} from '@/types/offline';
import logger from '@/utils/logger';
import { logError, logWarn } from '@/utils/logger'

/**
 * Dispatch status for a specific order
 */
interface IOrderDispatchStatus {
  orderId: string;
  status: TDispatchStatus;
  dispatchedAt: string | null;
  error: string | null;
  pendingStations: TKitchenStation[];
}

/**
 * Hook result interface
 */
interface UseKitchenDispatchResult {
  /** Dispatch a specific order to kitchen stations */
  dispatchOrder: (orderId: string) => Promise<boolean>;
  /** Process the entire dispatch queue */
  processQueue: () => Promise<{ processed: number; failed: number }>;
  /** Get dispatch status for a specific order */
  getOrderStatus: (orderId: string) => Promise<IOrderDispatchStatus | null>;
  /** Number of orders pending dispatch */
  pendingCount: number;
  /** Number of orders with failed dispatch */
  failedCount: number;
  /** Whether currently dispatching */
  isDispatching: boolean;
  /** Last dispatch error */
  lastError: string | null;
  /** LAN connection status */
  isLanConnected: boolean;
}

/**
 * Hook for kitchen dispatch operations
 */
export function useKitchenDispatch(): UseKitchenDispatchResult {
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const connectionStatus = useLanStore((state) => state.connectionStatus);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live query for pending count
  const pendingCount = useLiveQuery(
    () => getPendingDispatchCount(),
    [],
    0
  );

  // Live query for failed count
  const failedCount = useLiveQuery(
    () => getFailedDispatchCount(),
    [],
    0
  );

  const isLanConnected = connectionStatus === 'connected';

  // Listen for KDS ACK messages
  useEffect(() => {
    const handleAck = async (message: { payload: IKdsOrderAckPayload }) => {
      const { order_id, station, device_id, timestamp } = message.payload;
      await markStationDispatched(order_id, station);
      logger.debug(
        `[useKitchenDispatch] Order ${order_id} acknowledged by ${station} (device: ${device_id}) at ${timestamp}`
      );
    };

    const unsubscribe = lanClient.on<IKdsOrderAckPayload>(
      LAN_MESSAGE_TYPES.KDS_ORDER_ACK,
      handleAck
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Process queue when LAN reconnects
  useEffect(() => {
    if (isLanConnected && pendingCount > 0) {
      // Debounce queue processing to avoid rapid reconnect/disconnect cycles
      const timeoutId = setTimeout(() => {
        processDispatchQueue().then(({ processed, failed }) => {
          if (processed > 0) {
            logger.debug(`[useKitchenDispatch] Processed ${processed} pending dispatches`);
          }
          if (failed > 0) {
            logWarn(`[useKitchenDispatch] ${failed} dispatches failed`);
          }
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isLanConnected, pendingCount]);

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  /**
   * Dispatch a specific order to kitchen stations
   */
  const dispatchOrder = useCallback(async (orderId: string): Promise<boolean> => {
    setIsDispatching(true);
    setLastError(null);

    try {
      const order = await db.offline_orders.get(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const items = await db.offline_order_items
        .where('order_id')
        .equals(orderId)
        .toArray();

      if (items.length === 0) {
        throw new Error('No items found for order');
      }

      const { dispatched, queued } = await dispatchOrderToKitchen(order, items);

      if (queued.length > 0) {
        logger.debug(
          `[useKitchenDispatch] Queued ${queued.length} station(s) for later: ${queued.join(', ')}`
        );
      }

      if (dispatched.length > 0) {
        logger.debug(
          `[useKitchenDispatch] Dispatched to ${dispatched.length} station(s): ${dispatched.join(', ')}`
        );
      }

      return dispatched.length > 0 || queued.length > 0;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Dispatch failed';
      setLastError(msg);
      logError('[useKitchenDispatch] Error:', error);
      return false;
    } finally {
      setIsDispatching(false);
    }
  }, []);

  /**
   * Process the entire dispatch queue
   */
  const processQueue = useCallback(async (): Promise<{
    processed: number;
    failed: number;
  }> => {
    setIsDispatching(true);
    setLastError(null);

    try {
      const result = await processDispatchQueue();

      // Schedule retry if there are still pending items
      if (result.failed === 0 && pendingCount > 0) {
        const delay = getRetryDelay(0);
        retryTimerRef.current = setTimeout(() => {
          processDispatchQueue();
        }, delay);
      }

      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Queue processing failed';
      setLastError(msg);
      logError('[useKitchenDispatch] Queue processing error:', error);
      return { processed: 0, failed: 0 };
    } finally {
      setIsDispatching(false);
    }
  }, [pendingCount]);

  /**
   * Get dispatch status for a specific order
   */
  const getOrderStatus = useCallback(
    async (orderId: string): Promise<IOrderDispatchStatus | null> => {
      const order = await db.offline_orders.get(orderId);
      if (!order) return null;

      const pendingItems = await db.offline_dispatch_queue
        .where('order_id')
        .equals(orderId)
        .toArray();

      const pendingStations = pendingItems.map((item) => item.station);

      return {
        orderId: order.id,
        status: order.dispatch_status || 'pending',
        dispatchedAt: order.dispatched_at || null,
        error: order.dispatch_error || null,
        pendingStations,
      };
    },
    []
  );

  return {
    dispatchOrder,
    processQueue,
    getOrderStatus,
    pendingCount,
    failedCount,
    isDispatching,
    lastError,
    isLanConnected,
  };
}

/**
 * Hook for tracking dispatch status of a specific order
 */
export function useOrderDispatchStatus(orderId: string | null) {
  // Live query for order dispatch status
  const order = useLiveQuery(
    () => (orderId ? db.offline_orders.get(orderId) : undefined),
    [orderId]
  );

  // Live query for pending dispatch items
  const pendingItems = useLiveQuery(
    () =>
      orderId
        ? db.offline_dispatch_queue.where('order_id').equals(orderId).toArray()
        : [],
    [orderId],
    []
  );

  if (!order || !orderId) {
    return null;
  }

  return {
    orderId: order.id,
    status: order.dispatch_status || 'pending',
    dispatchedAt: order.dispatched_at || null,
    error: order.dispatch_error || null,
    pendingStations: pendingItems.map((item: IDispatchQueueItem) => item.station),
    pendingCount: pendingItems.length,
  };
}
