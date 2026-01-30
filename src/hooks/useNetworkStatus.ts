import { useEffect, useCallback } from 'react';
import { useNetworkStore, TNetworkMode } from '../stores/networkStore';

/**
 * Hook return type for network status
 */
interface IUseNetworkStatusReturn {
  networkMode: TNetworkMode;
  isOnline: boolean;
  isLanConnected: boolean;
  lastOnlineAt: Date | null;
}

/**
 * Hook for monitoring and managing network connectivity status
 *
 * **IMPORTANT:** This is the PRIMARY network status hook for the application.
 * Uses Zustand store (networkStore) for centralized state management.
 *
 * For simple online/offline checks without LAN mode, see:
 * - `src/hooks/offline/useNetworkStatus.ts` (simpler, standalone version)
 *
 * Features:
 * - Listens to browser online/offline events
 * - Updates networkStore state on changes
 * - Provides reactive network mode for components
 *
 * Network mode logic:
 * - online: navigator.onLine is true
 * - lan-only: navigator.onLine is false but LAN hub is reachable
 * - offline: No connectivity available
 *
 * NFR Compliance:
 * - NFR-A2: Transition detection < 2 seconds (browser events are instant)
 * - NFR-U3: Visual feedback < 100ms (state updates trigger immediate re-render)
 *
 * @returns {IUseNetworkStatusReturn} Current network status and state
 *
 * @example
 * ```tsx
 * const { networkMode, isOnline } = useNetworkStatus();
 * // networkMode: 'online' | 'lan-only' | 'offline'
 * ```
 */
export function useNetworkStatus(): IUseNetworkStatusReturn {
  const {
    setIsOnline,
    networkMode,
    isOnline,
    isLanConnected,
    lastOnlineAt
  } = useNetworkStore();

  /**
   * Handler for browser online event
   */
  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, [setIsOnline]);

  /**
   * Handler for browser offline event
   */
  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, [setIsOnline]);

  useEffect(() => {
    // Add event listeners for online/offline detection
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check - sync state with current browser status
    // This ensures correct status on component mount/app restart (AC3)
    setIsOnline(navigator.onLine);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, setIsOnline]);

  // NOTE: LAN connectivity check will be added in Story 4.1 (WebSocket Hub)
  // For now, isLanConnected is always false until the hub is implemented
  // The networkMode will correctly show 'offline' when no internet
  // Once Story 4.1 is complete, LAN detection will enable 'lan-only' mode

  return {
    networkMode,
    isOnline,
    isLanConnected,
    lastOnlineAt
  };
}

export default useNetworkStatus;
