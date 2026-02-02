/**
 * useKdsStatusListener Tests
 * Story 4.7 - POS KDS Status Listener Integration
 *
 * Tests for the KDS status listener hook used by POS to receive
 * real-time updates when KDS marks items as preparing/ready.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKdsStatusListener } from '../useKdsStatusListener';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';

// Mock lanClient
vi.mock('@/services/lan/lanClient', () => ({
  lanClient: {
    on: vi.fn(),
    isActive: vi.fn(),
  },
}));

describe('useKdsStatusListener', () => {
  let mockUnsubscribePreparing: ReturnType<typeof vi.fn>;
  let mockUnsubscribeReady: ReturnType<typeof vi.fn>;
  let preparingHandler: ((message: unknown) => void) | null = null;
  let readyHandler: ((message: unknown) => void) | null = null;

  beforeEach(() => {
    mockUnsubscribePreparing = vi.fn();
    mockUnsubscribeReady = vi.fn();
    preparingHandler = null;
    readyHandler = null;

    vi.mocked(lanClient.on).mockImplementation((type, handler) => {
      if (type === LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING) {
        preparingHandler = handler as (message: unknown) => void;
        return mockUnsubscribePreparing as unknown as () => void;
      }
      if (type === LAN_MESSAGE_TYPES.KDS_ITEM_READY) {
        readyHandler = handler as (message: unknown) => void;
        return mockUnsubscribeReady as unknown as () => void;
      }
      return vi.fn() as unknown as () => void;
    });

    vi.mocked(lanClient.isActive).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to KDS_ITEM_PREPARING and KDS_ITEM_READY events when enabled', () => {
    renderHook(() =>
      useKdsStatusListener({
        enabled: true,
      })
    );

    expect(lanClient.on).toHaveBeenCalledWith(
      LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING,
      expect.any(Function)
    );
    expect(lanClient.on).toHaveBeenCalledWith(
      LAN_MESSAGE_TYPES.KDS_ITEM_READY,
      expect.any(Function)
    );
  });

  it('should not subscribe when disabled', () => {
    renderHook(() =>
      useKdsStatusListener({
        enabled: false,
      })
    );

    expect(lanClient.on).not.toHaveBeenCalled();
  });

  it('should call onItemPreparing callback when KDS_ITEM_PREPARING message is received', () => {
    const onItemPreparing = vi.fn();

    renderHook(() =>
      useKdsStatusListener({
        onItemPreparing,
        enabled: true,
      })
    );

    // Simulate receiving a KDS_ITEM_PREPARING message
    const mockMessage = {
      id: 'msg-123',
      type: LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING,
      from: 'kds-device',
      timestamp: '2026-02-02T10:00:00.000Z',
      payload: {
        order_id: 'order-123',
        item_ids: ['item-1', 'item-2'],
        station: 'kitchen',
        timestamp: '2026-02-02T10:00:00.000Z',
      },
    };

    preparingHandler?.(mockMessage);

    expect(onItemPreparing).toHaveBeenCalledWith(
      'order-123',
      ['item-1', 'item-2'],
      'kitchen'
    );
  });

  it('should call onItemReady callback when KDS_ITEM_READY message is received', () => {
    const onItemReady = vi.fn();

    renderHook(() =>
      useKdsStatusListener({
        onItemReady,
        enabled: true,
      })
    );

    // Simulate receiving a KDS_ITEM_READY message
    const mockMessage = {
      id: 'msg-456',
      type: LAN_MESSAGE_TYPES.KDS_ITEM_READY,
      from: 'kds-device',
      timestamp: '2026-02-02T10:05:00.000Z',
      payload: {
        order_id: 'order-123',
        item_ids: ['item-1', 'item-2'],
        station: 'barista',
        prepared_at: '2026-02-02T10:05:00.000Z',
        timestamp: '2026-02-02T10:05:00.000Z',
      },
    };

    readyHandler?.(mockMessage);

    expect(onItemReady).toHaveBeenCalledWith(
      'order-123',
      ['item-1', 'item-2'],
      'barista',
      '2026-02-02T10:05:00.000Z'
    );
  });

  it('should return isActive status from lanClient', () => {
    vi.mocked(lanClient.isActive).mockReturnValue(true);

    const { result } = renderHook(() =>
      useKdsStatusListener({
        enabled: true,
      })
    );

    expect(result.current.isActive).toBe(true);

    vi.mocked(lanClient.isActive).mockReturnValue(false);

    const { result: result2 } = renderHook(() =>
      useKdsStatusListener({
        enabled: true,
      })
    );

    expect(result2.current.isActive).toBe(false);
  });

  it('should unsubscribe from events on unmount', () => {
    const { unmount } = renderHook(() =>
      useKdsStatusListener({
        enabled: true,
      })
    );

    expect(mockUnsubscribePreparing).not.toHaveBeenCalled();
    expect(mockUnsubscribeReady).not.toHaveBeenCalled();

    unmount();

    expect(mockUnsubscribePreparing).toHaveBeenCalled();
    expect(mockUnsubscribeReady).toHaveBeenCalled();
  });

  it('should handle missing callbacks gracefully', () => {
    renderHook(() =>
      useKdsStatusListener({
        enabled: true,
        // No callbacks provided
      })
    );

    // Simulate receiving messages without callbacks - should not throw
    const preparingMessage = {
      id: 'msg-1',
      type: LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING,
      from: 'kds',
      timestamp: new Date().toISOString(),
      payload: {
        order_id: 'order-1',
        item_ids: ['item-1'],
        station: 'kitchen',
        timestamp: new Date().toISOString(),
      },
    };

    const readyMessage = {
      id: 'msg-2',
      type: LAN_MESSAGE_TYPES.KDS_ITEM_READY,
      from: 'kds',
      timestamp: new Date().toISOString(),
      payload: {
        order_id: 'order-1',
        item_ids: ['item-1'],
        station: 'kitchen',
        prepared_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      },
    };

    expect(() => preparingHandler?.(preparingMessage)).not.toThrow();
    expect(() => readyHandler?.(readyMessage)).not.toThrow();
  });
});
