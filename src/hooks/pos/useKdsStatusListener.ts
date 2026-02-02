/**
 * KDS Status Listener Hook
 * Story 4.5 - KDS Item Status Update
 *
 * Listens for KDS item status updates via LAN (for POS to receive updates)
 *
 * Note: This hook is ready for integration into POS order views.
 * Integration deferred to a future story that defines the UX for order status display.
 */

import { useEffect, useCallback, useState } from 'react';
import { lanClient } from '@/services/lan/lanClient';
import {
  LAN_MESSAGE_TYPES,
  type ILanMessage,
  type IKdsItemPreparingPayload,
  type IKdsItemReadyPayload,
} from '@/services/lan/lanProtocol';
import type { TKitchenStation } from '@/types/offline';

/**
 * Options for useKdsStatusListener hook
 */
export interface IUseKdsStatusListenerOptions {
  /** Callback when items are marked as preparing */
  onItemPreparing?: (orderId: string, itemIds: string[], station: TKitchenStation) => void;
  /** Callback when items are marked as ready */
  onItemReady?: (orderId: string, itemIds: string[], station: TKitchenStation, preparedAt: string) => void;
  /** Whether the listener is enabled */
  enabled?: boolean;
}

/**
 * Result of useKdsStatusListener hook
 */
export interface IUseKdsStatusListenerResult {
  /** Whether the listener is active */
  isActive: boolean;
}

/**
 * Hook to listen for KDS item status updates via LAN
 * Used by POS to receive updates when KDS marks items as preparing/ready
 */
export function useKdsStatusListener(
  options: IUseKdsStatusListenerOptions = {}
): IUseKdsStatusListenerResult {
  const { onItemPreparing, onItemReady, enabled = true } = options;

  // Track LAN connection status dynamically
  const [isActive, setIsActive] = useState(() => lanClient.isActive());

  // Update isActive periodically to reflect connection changes
  useEffect(() => {
    if (!enabled) return;

    const checkConnection = () => {
      setIsActive(lanClient.isActive());
    };

    // Check every 2 seconds for connection status changes
    const interval = setInterval(checkConnection, 2000);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, [enabled]);

  const handlePreparing = useCallback(
    (message: ILanMessage<IKdsItemPreparingPayload>) => {
      const { order_id, item_ids, station } = message.payload;
      console.log(`[POS] Items preparing for order ${order_id} from ${station}`);
      onItemPreparing?.(order_id, item_ids, station);
    },
    [onItemPreparing]
  );

  const handleReady = useCallback(
    (message: ILanMessage<IKdsItemReadyPayload>) => {
      const { order_id, item_ids, station, prepared_at } = message.payload;
      console.log(`[POS] Items ready for order ${order_id} from ${station}`);
      onItemReady?.(order_id, item_ids, station, prepared_at);
    },
    [onItemReady]
  );

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to KDS status messages
    const unsubscribePreparing = lanClient.on<IKdsItemPreparingPayload>(
      LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING,
      handlePreparing
    );

    const unsubscribeReady = lanClient.on<IKdsItemReadyPayload>(
      LAN_MESSAGE_TYPES.KDS_ITEM_READY,
      handleReady
    );

    return () => {
      unsubscribePreparing();
      unsubscribeReady();
    };
  }, [enabled, handlePreparing, handleReady]);

  return {
    isActive,
  };
}
