/**
 * useNetworkAlerts Hook
 * Story 3.2 - Internet Outage Alerts
 * Story 3.3 - Post-Offline Sync Report (offline period tracking)
 *
 * Shows toast notifications when network status changes.
 * Triggers sync when coming back online.
 * Tracks offline periods for reporting.
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNetworkStore } from '../stores/networkStore';
import { startSyncWithDelay } from '../services/sync/syncEngine';
import { startOfflinePeriod, endOfflinePeriod } from '../services/sync/offlinePeriod';
import logger from '@/utils/logger';

/**
 * Hook that monitors network status and shows alerts on transitions.
 *
 * - Shows "Connection lost" toast when going offline
 * - Shows "Connection restored" toast when coming back online
 * - Triggers automatic sync when connection is restored
 *
 * @example
 * ```tsx
 * function App() {
 *   // Call in root component to enable network alerts
 *   useNetworkAlerts();
 *
 *   return <MainContent />;
 * }
 * ```
 */
export function useNetworkAlerts(): void {
  const isOnline = useNetworkStore((state) => state.isOnline);

  // Track previous online state to detect transitions
  const wasOnlineRef = useRef<boolean | null>(null);
  // Track if this is the first render (skip initial alert)
  const isFirstRenderRef = useRef(true);
  // Track current offline period ID for Story 3.3
  const currentPeriodIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip on first render to avoid showing alert on page load
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      wasOnlineRef.current = isOnline;
      return;
    }

    // Check if state actually changed
    if (wasOnlineRef.current === isOnline) {
      return;
    }

    // Transition detected
    const previousState = wasOnlineRef.current;
    wasOnlineRef.current = isOnline;

    // Only show alerts after first render and on actual transitions
    if (previousState === null) {
      return;
    }

    if (!isOnline) {
      // Going offline
      toast.error('Connection lost - Offline mode activated', {
        id: 'network-offline',
        duration: 5000,
        icon: '📴',
      });

      // Start tracking offline period (Story 3.3)
      startOfflinePeriod()
        .then((periodId) => {
          currentPeriodIdRef.current = periodId;
        })
        .catch((err) => {
          console.error('[useNetworkAlerts] Failed to start offline period:', err);
        });
    } else {
      // Coming back online
      toast.success('Connection restored - Syncing...', {
        id: 'network-online',
        duration: 4000,
        icon: '📶',
      });

      // End the offline period (Story 3.3)
      if (currentPeriodIdRef.current) {
        endOfflinePeriod(currentPeriodIdRef.current)
          .then((period) => {
            if (period) {
              logger.debug(`[useNetworkAlerts] Offline period ended: ${period.transactions_created} transactions created`);
            }
            currentPeriodIdRef.current = null;
          })
          .catch((err) => {
            console.error('[useNetworkAlerts] Failed to end offline period:', err);
          });
      }

      // Trigger automatic sync after coming back online
      startSyncWithDelay();
    }
  }, [isOnline]);
}
