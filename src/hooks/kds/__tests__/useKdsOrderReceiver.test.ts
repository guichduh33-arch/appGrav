/**
 * useKdsOrderReceiver Hook Tests
 * Story 4.3 - Order Dispatch to KDS via LAN
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKdsOrderReceiver } from '../useKdsOrderReceiver';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, ILanMessage } from '@/services/lan/lanProtocol';
import type { IKdsNewOrderPayload, TKitchenStation } from '@/types/offline';

// Mock lanClient
vi.mock('@/services/lan/lanClient', () => ({
  lanClient: {
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
    isActive: vi.fn().mockReturnValue(true),
  },
}));

// Mock lanProtocol - just the constants
vi.mock('@/services/lan/lanProtocol', () => ({
  LAN_MESSAGE_TYPES: {
    KDS_NEW_ORDER: 'kds_new_order',
    KDS_ORDER_ACK: 'kds_order_ack',
  },
}));

describe('useKdsOrderReceiver', () => {
  // Mock callback functions
  const mockPlaySound = vi.fn();
  const mockOnNewOrder = vi.fn();

  // Sample payload for testing
  const createTestPayload = (
    orderId: string,
    station: TKitchenStation = 'kitchen'
  ): IKdsNewOrderPayload => ({
    order_id: orderId,
    order_number: 'TEST-001',
    table_number: 5,
    order_type: 'dine_in',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        name: 'Croissant',
        quantity: 2,
        modifiers: ['Warm'],
        notes: null,
        category_id: 'cat-1',
      },
    ],
    station,
    timestamp: new Date().toISOString(),
  });

  // Variable to capture the handler registered with lanClient.on
  let capturedHandler: ((message: ILanMessage<IKdsNewOrderPayload>) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedHandler = null;

    // Capture the handler when lanClient.on is called
    (lanClient.on as ReturnType<typeof vi.fn>).mockImplementation(
      (type: string, handler: (msg: ILanMessage<IKdsNewOrderPayload>) => void) => {
        if (type === LAN_MESSAGE_TYPES.KDS_NEW_ORDER) {
          capturedHandler = handler;
        }
        return vi.fn(); // Return unsubscribe function
      }
    );

    (lanClient.send as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMessage = (payload: IKdsNewOrderPayload): ILanMessage<IKdsNewOrderPayload> => ({
    id: 'msg-' + Date.now(),
    type: LAN_MESSAGE_TYPES.KDS_NEW_ORDER as 'kds_new_order',
    from: 'pos-device',
    timestamp: new Date().toISOString(),
    payload,
  });

  describe('subscription', () => {
    it('should subscribe to KDS_NEW_ORDER on mount', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: true,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      expect(lanClient.on).toHaveBeenCalledWith(
        LAN_MESSAGE_TYPES.KDS_NEW_ORDER,
        expect.any(Function)
      );
    });

    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = vi.fn();
      (lanClient.on as ReturnType<typeof vi.fn>).mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: true,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('station filtering', () => {
    it('should receive orders for matching station', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-1', 'kitchen');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(mockOnNewOrder).toHaveBeenCalledWith(payload, 'lan');
    });

    it('should ignore orders for different station', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-1', 'barista');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(mockOnNewOrder).not.toHaveBeenCalled();
    });

    it('should receive ALL orders when station is "all" (waiter station)', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'all',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      // Kitchen order
      const kitchenPayload = createTestPayload('order-1', 'kitchen');
      act(() => {
        capturedHandler?.(createMessage(kitchenPayload));
      });

      // Barista order
      const baristaPayload = createTestPayload('order-2', 'barista');
      act(() => {
        capturedHandler?.(createMessage(baristaPayload));
      });

      // Display order
      const displayPayload = createTestPayload('order-3', 'display');
      act(() => {
        capturedHandler?.(createMessage(displayPayload));
      });

      expect(mockOnNewOrder).toHaveBeenCalledTimes(3);
    });

    it('should handle barista station correctly', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'barista',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const baristaPayload = createTestPayload('order-1', 'barista');
      const kitchenPayload = createTestPayload('order-2', 'kitchen');

      act(() => {
        capturedHandler?.(createMessage(baristaPayload));
        capturedHandler?.(createMessage(kitchenPayload));
      });

      // Should only receive barista order
      expect(mockOnNewOrder).toHaveBeenCalledTimes(1);
      expect(mockOnNewOrder).toHaveBeenCalledWith(baristaPayload, 'lan');
    });
  });

  describe('ACK sending', () => {
    it('should send ACK after receiving order', async () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-123', 'kitchen');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      // Wait for async ACK to be sent
      await vi.waitFor(() => {
        expect(lanClient.send).toHaveBeenCalledWith(
          LAN_MESSAGE_TYPES.KDS_ORDER_ACK,
          expect.objectContaining({
            order_id: 'order-123',
            station: 'kitchen',
            acknowledged_at: expect.any(String),
          })
        );
      });
    });

    it('should send ACK with correct station for "all" station', async () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'all',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-123', 'barista');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      await vi.waitFor(() => {
        expect(lanClient.send).toHaveBeenCalledWith(
          LAN_MESSAGE_TYPES.KDS_ORDER_ACK,
          expect.objectContaining({
            order_id: 'order-123',
            station: 'barista', // Should use payload station, not 'all'
          })
        );
      });
    });

    it('should not send ACK for ignored orders', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-1', 'barista');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(lanClient.send).not.toHaveBeenCalled();
    });
  });

  describe('sound notification', () => {
    it('should play sound when soundEnabled is true', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: true,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-1', 'kitchen');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(mockPlaySound).toHaveBeenCalled();
    });

    it('should NOT play sound when soundEnabled is false', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-1', 'kitchen');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(mockPlaySound).not.toHaveBeenCalled();
    });
  });

  describe('duplicate detection', () => {
    it('should ignore duplicate orders based on existingOrderIds', () => {
      const existingOrderIds = new Set(['order-1', 'order-2']);

      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
          existingOrderIds,
        })
      );

      // Try to add duplicate order
      const payload = createTestPayload('order-1', 'kitchen');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(mockOnNewOrder).not.toHaveBeenCalled();
    });

    it('should accept new orders not in existingOrderIds', () => {
      const existingOrderIds = new Set(['order-1', 'order-2']);

      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
          existingOrderIds,
        })
      );

      // New order
      const payload = createTestPayload('order-3', 'kitchen');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(mockOnNewOrder).toHaveBeenCalledWith(payload, 'lan');
    });
  });

  describe('invalid payload handling', () => {
    it('should ignore messages with invalid payload', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      // Invalid payload without order_id
      const invalidMessage = {
        id: 'msg-1',
        type: LAN_MESSAGE_TYPES.KDS_NEW_ORDER as 'kds_new_order',
        from: 'pos-device',
        timestamp: new Date().toISOString(),
        payload: { station: 'kitchen' } as unknown as IKdsNewOrderPayload,
      };

      act(() => {
        capturedHandler?.(invalidMessage);
      });

      expect(mockOnNewOrder).not.toHaveBeenCalled();
    });

    it('should ignore messages with missing station', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      // Invalid payload without station
      const invalidMessage = {
        id: 'msg-1',
        type: LAN_MESSAGE_TYPES.KDS_NEW_ORDER as 'kds_new_order',
        from: 'pos-device',
        timestamp: new Date().toISOString(),
        payload: { order_id: 'order-1' } as unknown as IKdsNewOrderPayload,
      };

      act(() => {
        capturedHandler?.(invalidMessage);
      });

      expect(mockOnNewOrder).not.toHaveBeenCalled();
    });
  });

  describe('callback source marker', () => {
    it('should always pass "lan" as source to onNewOrder', () => {
      renderHook(() =>
        useKdsOrderReceiver({
          station: 'kitchen',
          soundEnabled: false,
          playSound: mockPlaySound,
          onNewOrder: mockOnNewOrder,
        })
      );

      const payload = createTestPayload('order-1', 'kitchen');
      const message = createMessage(payload);

      act(() => {
        capturedHandler?.(message);
      });

      expect(mockOnNewOrder).toHaveBeenCalledWith(expect.anything(), 'lan');
    });
  });
});
