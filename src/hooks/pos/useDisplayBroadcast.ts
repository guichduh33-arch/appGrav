/**
 * Customer Display Broadcast Hook (F3.2)
 *
 * Uses BroadcastChannel for cross-tab communication to update
 * the customer-facing display in real-time.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */

import { useEffect, useRef, useCallback } from 'react';
import type { CartItem } from '@/stores/cartStore';
import { logError, logWarn } from '@/utils/logger';
import { logError, logWarn } from '@/utils/logger';

// =====================================================
// Types
// =====================================================

/**
 * Cart update message payload
 */
export interface ICartUpdateMessage {
  type: 'cart:update';
  payload: {
    items: IDisplayCartItem[];
    subtotal: number;
    discount: number;
    total: number;
    timestamp: number;
  };
}

/**
 * Order complete message payload
 */
export interface IOrderCompleteMessage {
  type: 'order:complete';
  payload: {
    orderNumber: string;
    total: number;
    change?: number;
    timestamp: number;
  };
}

/**
 * Clear display message payload
 */
export interface IClearDisplayMessage {
  type: 'display:clear';
  payload: {
    timestamp: number;
  };
}

/**
 * Welcome message payload
 */
export interface IWelcomeMessage {
  type: 'display:welcome';
  payload: {
    message?: string;
    timestamp: number;
  };
}

/**
 * All possible display messages
 */
export type TDisplayMessage =
  | ICartUpdateMessage
  | IOrderCompleteMessage
  | IClearDisplayMessage
  | IWelcomeMessage;

/**
 * Simplified cart item for display
 */
export interface IDisplayCartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers?: string[];
}

/**
 * Display broadcast hook return type
 */
export interface IUseDisplayBroadcastReturn {
  broadcastCart: (
    items: CartItem[],
    subtotal: number,
    discount: number,
    total: number
  ) => void;
  broadcastOrderComplete: (orderNumber: string, total: number, change?: number) => void;
  broadcastClear: () => void;
  broadcastWelcome: (message?: string) => void;
  isSupported: boolean;
}

// =====================================================
// Constants
// =====================================================

const DISPLAY_CHANNEL = 'customer-display';

// =====================================================
// Hook
// =====================================================

/**
 * Hook for broadcasting cart and order updates to customer display
 *
 * Uses BroadcastChannel API for cross-tab communication.
 * Falls back gracefully if BroadcastChannel is not supported.
 *
 * @example
 * ```tsx
 * const { broadcastCart, broadcastOrderComplete } = useDisplayBroadcast();
 *
 * // When cart changes
 * useEffect(() => {
 *   broadcastCart(items, subtotal, discount, total);
 * }, [items, subtotal, discount, total]);
 *
 * // When order completes
 * broadcastOrderComplete('ORD-001', 150000, 50000);
 * ```
 */
export function useDisplayBroadcast(): IUseDisplayBroadcastReturn {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isSupported = typeof BroadcastChannel !== 'undefined';

  // Initialize BroadcastChannel
  useEffect(() => {
    if (!isSupported) {
      logWarn('BroadcastChannel not supported in this browser');
      return;
    }

    try {
      channelRef.current = new BroadcastChannel(DISPLAY_CHANNEL);
    } catch (err) {
      logError('Failed to create BroadcastChannel', err);
    }

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [isSupported]);

  /**
   * Broadcast cart update to customer display
   */
  const broadcastCart = useCallback(
    (items: CartItem[], subtotal: number, discount: number, total: number) => {
      if (!channelRef.current) return;

      // Transform cart items to display format
      const displayItems: IDisplayCartItem[] = items.map((item) => ({
        id: item.id,
        name:
          item.type === 'combo'
            ? item.combo?.name || 'Combo'
            : item.product?.name || 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        modifiers: item.modifiers.map((m) => m.optionLabel),
      }));

      const message: ICartUpdateMessage = {
        type: 'cart:update',
        payload: {
          items: displayItems,
          subtotal,
          discount,
          total,
          timestamp: Date.now(),
        },
      };

      try {
        channelRef.current.postMessage(message);
      } catch (err) {
        logError('Failed to broadcast cart update', err);
      }
    },
    []
  );

  /**
   * Broadcast order completion to customer display
   */
  const broadcastOrderComplete = useCallback(
    (orderNumber: string, total: number, change?: number) => {
      if (!channelRef.current) return;

      const message: IOrderCompleteMessage = {
        type: 'order:complete',
        payload: {
          orderNumber,
          total,
          change,
          timestamp: Date.now(),
        },
      };

      try {
        channelRef.current.postMessage(message);
      } catch (err) {
        logError('Failed to broadcast order complete', err);
      }
    },
    []
  );

  /**
   * Broadcast clear display command
   */
  const broadcastClear = useCallback(() => {
    if (!channelRef.current) return;

    const message: IClearDisplayMessage = {
      type: 'display:clear',
      payload: {
        timestamp: Date.now(),
      },
    };

    try {
      channelRef.current.postMessage(message);
    } catch (err) {
      logError('Failed to broadcast clear', err);
    }
  }, []);

  /**
   * Broadcast welcome message to display
   */
  const broadcastWelcome = useCallback((message?: string) => {
    if (!channelRef.current) return;

    const displayMessage: IWelcomeMessage = {
      type: 'display:welcome',
      payload: {
        message,
        timestamp: Date.now(),
      },
    };

    try {
      channelRef.current.postMessage(displayMessage);
    } catch (err) {
      console.error('Failed to broadcast welcome:', err);
    }
  }, []);

  return {
    broadcastCart,
    broadcastOrderComplete,
    broadcastClear,
    broadcastWelcome,
    isSupported,
  };
}

// =====================================================
// Listener Hook (for Customer Display page)
// =====================================================

/**
 * Message handler type
 */
export type TDisplayMessageHandler = (message: TDisplayMessage) => void;

/**
 * Hook for listening to display broadcasts (used by Customer Display page)
 *
 * @param onMessage - Callback when message received
 *
 * @example
 * ```tsx
 * useDisplayBroadcastListener((message) => {
 *   switch (message.type) {
 *     case 'cart:update':
 *       setCartItems(message.payload.items);
 *       setTotal(message.payload.total);
 *       break;
 *     case 'order:complete':
 *       showSuccessScreen(message.payload);
 *       break;
 *   }
 * });
 * ```
 */
export function useDisplayBroadcastListener(onMessage: TDisplayMessageHandler): void {
  const isSupported = typeof BroadcastChannel !== 'undefined';

  useEffect(() => {
    if (!isSupported) {
      logWarn('BroadcastChannel not supported in this browser');
      return;
    }

    let channel: BroadcastChannel;

    try {
      channel = new BroadcastChannel(DISPLAY_CHANNEL);

      channel.onmessage = (event: MessageEvent<TDisplayMessage>) => {
        onMessage(event.data);
      };
    } catch (err) {
      console.error('Failed to create BroadcastChannel listener:', err);
      return;
    }

    return () => {
      channel.close();
    };
  }, [isSupported, onMessage]);
}

export default useDisplayBroadcast;
