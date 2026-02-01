/**
 * useLanClient Hook Tests
 * Story 4.2 - KDS Socket.IO Client Connection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLanClient } from '../useLanClient';
import { lanClient } from '@/services/lan/lanClient';
import { useLanStore } from '@/stores/lanStore';

// Mock lanClient
vi.mock('@/services/lan/lanClient', () => ({
  lanClient: {
    isActive: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
    getStatus: vi.fn(),
  },
}));

// Mock useLanStore
vi.mock('@/stores/lanStore', () => ({
  useLanStore: vi.fn(),
}));

describe('useLanClient', () => {
  const mockLanStore = {
    connectionStatus: 'disconnected' as const,
    reconnectAttempts: 0,
    lastError: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset localStorage
    localStorage.clear();

    // Default mock implementations
    (lanClient.isActive as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (lanClient.connect as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (lanClient.disconnect as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    (useLanStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockLanStore);

    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-1234-5678-9abc-def012345678',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('connection', () => {
    it('should auto-connect on mount when autoConnect is true', async () => {
      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          deviceName: 'Test KDS',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      // Wait for state update after async connect
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('should not auto-connect when autoConnect is false', () => {
      renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          deviceName: 'Test KDS',
          autoConnect: false,
        })
      );

      expect(lanClient.connect).not.toHaveBeenCalled();
    });

    it('should generate unique device ID if not in localStorage', async () => {
      renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          deviceName: 'Test KDS',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      const callArgs = (lanClient.connect as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.deviceId).toBe('kds-test-uui'); // First 8 chars of UUID
      expect(localStorage.getItem('lan-device-id')).toBe('kds-test-uui');
    });

    it('should reuse device ID from localStorage', async () => {
      localStorage.setItem('lan-device-id', 'existing-device-id');

      renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          deviceName: 'Test KDS',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      const callArgs = (lanClient.connect as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.deviceId).toBe('existing-device-id');
    });

    it('should include station in device name for KDS', async () => {
      renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          deviceName: 'Kitchen Display',
          station: 'kitchen',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      const callArgs = (lanClient.connect as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.deviceName).toBe('Kitchen Display - Kitchen');
    });

    it('should connect with correct device type', async () => {
      renderHook(() =>
        useLanClient({
          deviceType: 'display',
          deviceName: 'Customer Display',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      const callArgs = (lanClient.connect as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.deviceType).toBe('display');
    });

    it('should not connect if already connected', async () => {
      (lanClient.isActive as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Connect should not be called since already connected
      expect(lanClient.connect).not.toHaveBeenCalled();
    });
  });

  describe('manual connect/disconnect', () => {
    it('should connect manually when connect() is called', async () => {
      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: false,
        })
      );

      await act(async () => {
        await result.current.connect();
      });

      expect(lanClient.connect).toHaveBeenCalled();
    });

    it('should disconnect when disconnect() is called', async () => {
      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: false,
        })
      );

      await act(async () => {
        await result.current.disconnect();
      });

      expect(lanClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('status tracking', () => {
    it('should expose connectionStatus from store', () => {
      (useLanStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockLanStore,
        connectionStatus: 'connecting',
      });

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: false,
        })
      );

      expect(result.current.connectionStatus).toBe('connecting');
    });

    it('should expose reconnectAttempts from store', () => {
      (useLanStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockLanStore,
        reconnectAttempts: 3,
      });

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: false,
        })
      );

      expect(result.current.reconnectAttempts).toBe(3);
    });

    it('should expose error from store', () => {
      (useLanStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockLanStore,
        lastError: 'Connection failed',
      });

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: false,
        })
      );

      expect(result.current.error).toBe('Connection failed');
    });
  });

  describe('cleanup', () => {
    it('should not disconnect on unmount to keep connection alive', async () => {
      const { unmount } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: true,
        })
      );

      unmount();

      // Should NOT disconnect - connection should persist
      expect(lanClient.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('barista station', () => {
    it('should include barista station in device name', async () => {
      renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          deviceName: 'KDS',
          station: 'barista',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      const callArgs = (lanClient.connect as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.deviceName).toBe('KDS - Barista');
    });
  });

  describe('error handling', () => {
    it('should set error when connect returns false', async () => {
      (lanClient.connect as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Connection failed');
    });

    it('should set error when connect throws', async () => {
      (lanClient.connect as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle localStorage not available', async () => {
      // Mock localStorage to throw
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('localStorage disabled');
      };

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: true,
        })
      );

      await waitFor(() => {
        expect(lanClient.connect).toHaveBeenCalled();
      });

      // Should still connect successfully
      expect(result.current.isConnected).toBe(true);

      // Restore
      localStorage.getItem = originalGetItem;
    });

    it('should clear error on successful connect', async () => {
      // First fail
      (lanClient.connect as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);
      // Then succeed
      (lanClient.connect as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

      const { result } = renderHook(() =>
        useLanClient({
          deviceType: 'kds',
          autoConnect: false,
        })
      );

      // First connection attempt fails
      await act(async () => {
        await result.current.connect();
      });

      expect(result.current.error).toBe('Connection failed');

      // Second connection attempt succeeds
      await act(async () => {
        await result.current.connect();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isConnected).toBe(true);
    });
  });
});
