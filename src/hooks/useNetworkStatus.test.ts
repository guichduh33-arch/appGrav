import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';
import { useNetworkStore } from '../stores/networkStore';

describe('useNetworkStatus', () => {
  // Store original navigator.onLine
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    // Reset store state
    useNetworkStore.setState({
      isOnline: true,
      lastOnlineAt: null,
      isLanConnected: false,
      lanHubUrl: null,
      networkMode: 'online',
    });

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    });
  });

  describe('initial state', () => {
    it('should return current network status', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.networkMode).toBe('online');
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isLanConnected).toBe(false);
    });

    it('should sync with navigator.onLine on mount', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.isOnline).toBe(false);
    });
  });

  describe('event listeners', () => {
    it('should add online/offline event listeners on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useNetworkStatus());

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useNetworkStatus());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('online/offline events', () => {
    it('should update state when online event fires', () => {
      // Start offline
      useNetworkStore.setState({ isOnline: false, networkMode: 'offline' });

      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.networkMode).toBe('online');
    });

    it('should update state when offline event fires', () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.networkMode).toBe('offline');
    });
  });

  describe('network mode', () => {
    it('should return online when connected to internet', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.networkMode).toBe('online');
    });

    it('should return offline when disconnected', () => {
      // Mock navigator.onLine before rendering
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.networkMode).toBe('offline');
    });

    it('should return lan-only when offline but LAN connected', () => {
      // Mock navigator.onLine before rendering
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      // Pre-set LAN as connected
      useNetworkStore.setState({
        isLanConnected: true,
      });

      const { result } = renderHook(() => useNetworkStatus());

      // The hook sets isOnline from navigator, then store computes mode
      expect(result.current.networkMode).toBe('lan-only');
    });
  });

  describe('lastOnlineAt', () => {
    it('should return null initially when starting offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      const { result } = renderHook(() => useNetworkStatus());

      // When starting offline, lastOnlineAt should be null
      expect(result.current.lastOnlineAt).toBeNull();
    });

    it('should return date after going online', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      useNetworkStore.setState({ isOnline: false, networkMode: 'offline', lastOnlineAt: null });

      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
    });
  });
});
