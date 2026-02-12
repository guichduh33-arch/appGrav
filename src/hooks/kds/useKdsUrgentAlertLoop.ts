/**
 * useKdsUrgentAlertLoop Hook
 * Plays urgent alert sound repeatedly while critical orders exist.
 * Does NOT play on mount (the onOrderBecameUrgent callback handles the first alert).
 */

import { useEffect, useRef } from 'react';
import { playUrgentSound } from '@/utils/audio';

interface IUseKdsUrgentAlertLoopOptions {
  /** Number of orders currently in critical state */
  criticalCount: number;
  /** Whether sound is enabled by the user */
  soundEnabled: boolean;
  /** Interval between repeated alerts in ms (default: 30000) */
  intervalMs?: number;
}

export function useKdsUrgentAlertLoop({
  criticalCount,
  soundEnabled,
  intervalMs = 30000,
}: IUseKdsUrgentAlertLoopOptions): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (criticalCount > 0 && soundEnabled) {
      intervalRef.current = setInterval(() => {
        playUrgentSound();
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [criticalCount, soundEnabled, intervalMs]);
}
