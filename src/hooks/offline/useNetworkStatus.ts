/**
 * useNetworkStatus Hook (Simplified Version)
 *
 * Detects online/offline network status using browser APIs.
 * Provides real-time network state for offline-first functionality.
 *
 * **NOTE:** This is a SIMPLIFIED version for basic online/offline detection.
 * For full network mode support (online/lan-only/offline), use:
 * - `src/hooks/useNetworkStatus.ts` (uses Zustand networkStore)
 *
 * @see Story 1.4: Network Status Indicator
 */

import { useState, useEffect, useCallback } from 'react';
import { logDebug } from '@/utils/logger'

/**
 * Return type for useNetworkStatus hook
 */
export interface IUseNetworkStatusReturn {
  /** Whether the browser is online */
  isOnline: boolean;
  /** Whether the browser is offline */
  isOffline: boolean;
  /** Manually check network status (triggers re-render) */
  checkNetwork: () => void;
}

/**
 * Hook for detecting online/offline network status
 *
 * Uses browser's navigator.onLine and online/offline events.
 *
 * @returns Network status and check function
 *
 * @example
 * ```tsx
 * const { isOnline, isOffline } = useNetworkStatus();
 *
 * if (isOffline) {
 *   return <OfflineIndicator />;
 * }
 * ```
 */
export function useNetworkStatus(): IUseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    // Default to online in SSR or non-browser environments
    return true;
  });

  const checkNetwork = useCallback(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
  }, []);

  useEffect(() => {
    // Guard against non-browser environments
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      logDebug('[useNetworkStatus] Network online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      logDebug('[useNetworkStatus] Network offline');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkNetwork();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNetwork]);

  return {
    isOnline,
    isOffline: !isOnline,
    checkNetwork,
  };
}

export default useNetworkStatus;
