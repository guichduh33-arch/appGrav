/**
 * Display Broadcast Hook Tests
 *
 * Tests for customer display broadcast functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useDisplayBroadcast,
  useDisplayBroadcastListener,
  type TDisplayMessage,
} from '../useDisplayBroadcast';

describe('useDisplayBroadcast', () => {
  // Mock BroadcastChannel
  const mockPostMessage = vi.fn();
  const mockClose = vi.fn();

  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
    }

    postMessage = mockPostMessage;
    close = mockClose;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - Mock global BroadcastChannel
    global.BroadcastChannel = MockBroadcastChannel;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useDisplayBroadcast', () => {
    it('should report isSupported as true when BroadcastChannel exists', () => {
      const { result } = renderHook(() => useDisplayBroadcast());

      expect(result.current.isSupported).toBe(true);
    });

    it('should report isSupported as false when BroadcastChannel is undefined', () => {
      // @ts-expect-error - Temporarily remove BroadcastChannel
      delete global.BroadcastChannel;

      const { result } = renderHook(() => useDisplayBroadcast());

      expect(result.current.isSupported).toBe(false);

      // Restore
      // @ts-expect-error - Restore mock
      global.BroadcastChannel = MockBroadcastChannel;
    });

    it('should broadcast cart update with correct format', () => {
      const { result } = renderHook(() => useDisplayBroadcast());

      // Mock cart items with minimal required fields for broadcast
      const items = [
        {
          id: 'item-1',
          type: 'product' as const,
          product: { id: 'prod-1', name: 'Croissant' },
          quantity: 2,
          unitPrice: 25000,
          totalPrice: 50000,
          modifiers: [{ groupName: 'Size', optionId: 'lg', optionLabel: 'Large', priceAdjustment: 0 }],
          modifiersTotal: 0,
          notes: '',
        },
      ] as unknown as import('@/stores/cartStore').CartItem[];

      act(() => {
        result.current.broadcastCart(items, 50000, 0, 50000);
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cart:update',
          payload: expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                id: 'item-1',
                name: 'Croissant',
                quantity: 2,
              }),
            ]),
            subtotal: 50000,
            discount: 0,
            total: 50000,
            timestamp: expect.any(Number),
          }),
        })
      );
    });

    it('should broadcast order complete with correct format', () => {
      const { result } = renderHook(() => useDisplayBroadcast());

      act(() => {
        result.current.broadcastOrderComplete('ORD-001', 150000, 50000);
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order:complete',
          payload: expect.objectContaining({
            orderNumber: 'ORD-001',
            total: 150000,
            change: 50000,
            timestamp: expect.any(Number),
          }),
        })
      );
    });

    it('should broadcast order complete without change when undefined', () => {
      const { result } = renderHook(() => useDisplayBroadcast());

      act(() => {
        result.current.broadcastOrderComplete('ORD-002', 100000);
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order:complete',
          payload: expect.objectContaining({
            orderNumber: 'ORD-002',
            total: 100000,
            change: undefined,
          }),
        })
      );
    });

    it('should broadcast clear display command', () => {
      const { result } = renderHook(() => useDisplayBroadcast());

      act(() => {
        result.current.broadcastClear();
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'display:clear',
          payload: expect.objectContaining({
            timestamp: expect.any(Number),
          }),
        })
      );
    });

    it('should broadcast welcome message', () => {
      const { result } = renderHook(() => useDisplayBroadcast());

      act(() => {
        result.current.broadcastWelcome('Welcome to The Breakery!');
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'display:welcome',
          payload: expect.objectContaining({
            message: 'Welcome to The Breakery!',
            timestamp: expect.any(Number),
          }),
        })
      );
    });

    it('should close channel on unmount', () => {
      const { unmount } = renderHook(() => useDisplayBroadcast());

      unmount();

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('useDisplayBroadcastListener', () => {
    it('should call handler when message received', () => {
      const messageHandler = vi.fn();
      let capturedOnMessage: ((event: MessageEvent) => void) | null = null;

      // Create a separate mock class to capture onmessage
      class CaptureMockBroadcastChannel {
        name: string;
        private _onmessage: ((event: MessageEvent) => void) | null = null;

        constructor(name: string) {
          this.name = name;
        }

        set onmessage(handler: ((event: MessageEvent) => void) | null) {
          this._onmessage = handler;
          capturedOnMessage = handler;
        }

        get onmessage() {
          return this._onmessage;
        }

        postMessage = mockPostMessage;
        close = mockClose;
      }

      // @ts-expect-error - Override mock
      global.BroadcastChannel = CaptureMockBroadcastChannel;

      renderHook(() => useDisplayBroadcastListener(messageHandler));

      // Simulate receiving a message
      if (capturedOnMessage) {
        const testMessage: TDisplayMessage = {
          type: 'cart:update',
          payload: {
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            timestamp: Date.now(),
          },
        };

        act(() => {
          capturedOnMessage!({ data: testMessage } as MessageEvent);
        });

        expect(messageHandler).toHaveBeenCalledWith(testMessage);
      }
    });
  });
});
