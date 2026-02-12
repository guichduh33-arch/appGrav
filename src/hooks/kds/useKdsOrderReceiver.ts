/**
 * useKdsOrderReceiver Hook
 * Story 4.3 - Order Dispatch to KDS via LAN
 *
 * React hook for receiving KDS orders via LAN with:
 * - Station-based filtering
 * - Sound notification
 * - ACK acknowledgment to hub
 * - Duplicate detection
 *
 * @see ADR-006: LAN Architecture
 * @see ADR-007: Kitchen Display System
 */

import { useEffect, useCallback, useRef } from 'react';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, ILanMessage } from '@/services/lan/lanProtocol';
import type { IKdsNewOrderPayload, TKitchenStation } from '@/types/offline';
import logger from '@/utils/logger';

/**
 * Options for the useKdsOrderReceiver hook
 */
export interface IUseKdsOrderReceiverOptions {
  /** Current KDS station ('kitchen' | 'barista' | 'display' | 'all') */
  station: TKitchenStation | 'all';

  /** Whether sound notifications are enabled */
  soundEnabled: boolean;

  /** Function to play notification sound */
  playSound: () => void;

  /** Callback when a new order is received */
  onNewOrder: (order: IKdsNewOrderPayload, source: 'lan') => void;

  /** Set of already received order IDs (for duplicate detection) */
  existingOrderIds?: Set<string>;
}

/**
 * Result interface for the hook
 */
export interface IUseKdsOrderReceiverResult {
  /** Whether the hook is actively listening for orders */
  isListening: boolean;

  /** Count of orders received via LAN in current session */
  lanOrderCount: number;
}

/**
 * Hook for receiving KDS orders via LAN
 *
 * Subscribes to KDS_NEW_ORDER messages from the LAN hub,
 * filters by station, plays notification sounds, and sends ACKs.
 *
 * @example
 * ```tsx
 * const { isListening, lanOrderCount } = useKdsOrderReceiver({
 *   station: 'kitchen',
 *   soundEnabled: true,
 *   playSound: playNotificationSound,
 *   onNewOrder: handleLanOrder,
 * });
 * ```
 */
export function useKdsOrderReceiver(options: IUseKdsOrderReceiverOptions): IUseKdsOrderReceiverResult {
  const { station, soundEnabled, playSound, onNewOrder, existingOrderIds } = options;

  // Track listening state and order count
  const isListeningRef = useRef(false);
  const lanOrderCountRef = useRef(0);

  // Store latest callback ref to avoid stale closures
  const onNewOrderRef = useRef(onNewOrder);
  const playSoundRef = useRef(playSound);
  const existingOrderIdsRef = useRef(existingOrderIds);

  // Keep refs updated
  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
    playSoundRef.current = playSound;
    existingOrderIdsRef.current = existingOrderIds;
  }, [onNewOrder, playSound, existingOrderIds]);

  /**
   * Handle incoming KDS_NEW_ORDER message
   */
  const handleNewOrder = useCallback(
    (message: ILanMessage<IKdsNewOrderPayload>) => {
      const payload = message.payload;

      // Validate payload
      if (!payload || !payload.order_id || !payload.station) {
        logger.warn('[useKdsOrderReceiver] Invalid payload received:', payload);
        return;
      }

      // Filter by station
      // 'all' station receives all orders (waiter station)
      // Otherwise, only receive orders for our specific station
      if (station !== 'all' && payload.station !== station) {
        logger.debug(
          `[useKdsOrderReceiver] Ignoring order for station ${payload.station}, we are ${station}`
        );
        return;
      }

      // Duplicate detection - skip if order already exists
      if (existingOrderIdsRef.current?.has(payload.order_id)) {
        logger.debug(
          `[useKdsOrderReceiver] Ignoring duplicate order ${payload.order_number} (${payload.order_id})`
        );
        return;
      }

      logger.debug(
        `[useKdsOrderReceiver] Received order ${payload.order_number} for station ${payload.station}`
      );

      // Play notification sound
      if (soundEnabled) {
        playSoundRef.current();
      }

      // Increment counter
      lanOrderCountRef.current += 1;

      // Pass to callback with 'lan' source marker
      onNewOrderRef.current(payload, 'lan');

      // Send ACK to hub
      sendOrderAck(payload.order_id, station === 'all' ? payload.station : station);
    },
    [station, soundEnabled]
  );

  /**
   * Send order acknowledgment to hub
   */
  const sendOrderAck = async (orderId: string, ackStation: TKitchenStation) => {
    try {
      await lanClient.send(LAN_MESSAGE_TYPES.KDS_ORDER_ACK, {
        order_id: orderId,
        station: ackStation,
        acknowledged_at: new Date().toISOString(),
      });
      logger.debug(`[useKdsOrderReceiver] ACK sent for order ${orderId}`);
    } catch (error) {
      logger.error('[useKdsOrderReceiver] Failed to send ACK:', error);
    }
  };

  // Subscribe to KDS_NEW_ORDER messages
  useEffect(() => {
    // Cast the handler type for TypeScript compatibility with lanClient.on()
    const unsubscribe = lanClient.on(
      LAN_MESSAGE_TYPES.KDS_NEW_ORDER,
      handleNewOrder as (msg: ILanMessage) => void
    );

    isListeningRef.current = true;
    logger.debug(`[useKdsOrderReceiver] Listening for orders on station: ${station}`);

    return () => {
      unsubscribe();
      isListeningRef.current = false;
      logger.debug(`[useKdsOrderReceiver] Stopped listening on station: ${station}`);
    };
  }, [handleNewOrder, station]);

  return {
    isListening: isListeningRef.current,
    lanOrderCount: lanOrderCountRef.current,
  };
}

export default useKdsOrderReceiver;
