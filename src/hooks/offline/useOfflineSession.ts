/**
 * Offline Session Hook
 *
 * Provides React hook for managing POS sessions with offline support.
 * Uses useLiveQuery for reactive session state updates.
 *
 * @see Story 3.5: POS Session Management Offline
 */

import { useCallback, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStatus } from './useNetworkStatus';
import {
  openSession as openSessionOffline,
  closeSession as closeSessionOffline,
  getActiveSession,
  calculateSessionTotals,
} from '@/services/offline/offlineSessionService';
import type {
  IOfflineSession,
  ISessionClosingData,
  ISessionPaymentTotals,
} from '@/types/offline';

interface UseOfflineSessionResult {
  /** Current active session (null if none) */
  currentSession: IOfflineSession | null;
  /** Whether user has an active session */
  isSessionOpen: boolean;
  /** Session totals (calculated from payments) */
  sessionTotals: ISessionPaymentTotals | null;
  /** Open a new session */
  openSession: (openingAmount: number) => Promise<IOfflineSession>;
  /** Close current session */
  closeSession: (closingData: ISessionClosingData) => Promise<IOfflineSession>;
  /** Refresh session totals manually */
  refreshTotals: () => Promise<void>;
  /** Whether network is offline */
  isOffline: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Hook for managing POS sessions with offline support
 *
 * Features:
 * - Reactive session state via useLiveQuery
 * - Automatic totals calculation
 * - Error handling
 * - Network status awareness
 *
 * @example
 * ```tsx
 * const { currentSession, openSession, closeSession, isSessionOpen } = useOfflineSession();
 *
 * // Open a session with 500,000 IDR opening amount
 * await openSession(500000);
 *
 * // Close the session
 * await closeSession({
 *   actual_cash: 1500000,
 *   actual_card: 200000,
 *   actual_qris: 100000,
 *   actual_transfer: 0,
 *   actual_ewallet: 50000,
 *   notes: 'End of day'
 * });
 * ```
 */
export function useOfflineSession(): UseOfflineSessionResult {
  const { isOnline } = useNetworkStatus();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionTotals, setSessionTotals] =
    useState<ISessionPaymentTotals | null>(null);

  // Live query for active session - updates automatically when IndexedDB changes
  const currentSession = useLiveQuery(
    async () => {
      if (!user?.id) return null;
      return getActiveSession(user.id);
    },
    [user?.id],
    null
  );

  // Calculate totals when session exists or changes
  useEffect(() => {
    async function loadTotals() {
      if (currentSession?.id) {
        try {
          const totals = await calculateSessionTotals(currentSession.id);
          setSessionTotals(totals);
        } catch {
          // If totals calculation fails, set to null
          setSessionTotals(null);
        }
      } else {
        setSessionTotals(null);
      }
    }
    loadTotals();
  }, [currentSession?.id]);

  /**
   * Refresh session totals manually
   * Useful after creating new orders/payments
   */
  const refreshTotals = useCallback(async () => {
    if (currentSession?.id) {
      const totals = await calculateSessionTotals(currentSession.id);
      setSessionTotals(totals);
    }
  }, [currentSession?.id]);

  /**
   * Open a new POS session
   *
   * @param openingAmount - Initial cash float in IDR
   * @throws Error if user not authenticated or session already active
   */
  const openSession = useCallback(
    async (openingAmount: number): Promise<IOfflineSession> => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Always use offline service for now
        // TODO: Add online routing when useShift is integrated
        const session = await openSessionOffline(user.id, openingAmount);
        return session;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to open session');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Close the current POS session
   *
   * @param closingData - Actual counted amounts and notes
   * @throws Error if no active session
   */
  const closeSession = useCallback(
    async (closingData: ISessionClosingData): Promise<IOfflineSession> => {
      if (!currentSession?.id) {
        throw new Error('No active session');
      }

      setIsLoading(true);
      setError(null);

      try {
        const session = await closeSessionOffline(
          currentSession.id,
          closingData
        );
        return session;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to close session');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession?.id]
  );

  return {
    currentSession: currentSession ?? null,
    isSessionOpen: !!currentSession && currentSession.status === 'open',
    sessionTotals,
    openSession,
    closeSession,
    refreshTotals,
    isOffline: !isOnline,
    isLoading,
    error,
  };
}
