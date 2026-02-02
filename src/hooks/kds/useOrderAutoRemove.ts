/**
 * useOrderAutoRemove Hook
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Manages auto-remove countdown when all items in an order are ready.
 * Features:
 * - 5 second (default) countdown with visual feedback
 * - Cancel functionality to prevent auto-remove
 * - Animation state for smooth exit
 * - Waiter station exception (no auto-remove)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Options for the useOrderAutoRemove hook
 */
export interface IUseOrderAutoRemoveOptions {
  /** Order ID for tracking */
  orderId: string;
  /** Whether all items in the order are ready */
  allItemsReady: boolean;
  /** Whether this is a waiter station (no auto-remove for waiter) */
  isWaiterStation: boolean;
  /** Delay before auto-remove in milliseconds (default: 5000) */
  autoRemoveDelay?: number;
  /** Callback when order should be removed */
  onComplete: () => void;
}

/**
 * Result returned by the useOrderAutoRemove hook
 */
export interface IUseOrderAutoRemoveResult {
  /** Whether countdown is currently active */
  isCountingDown: boolean;
  /** Seconds remaining until auto-remove */
  timeRemaining: number;
  /** Cancel the auto-remove countdown */
  cancelAutoRemove: () => void;
  /** Whether the exit animation is in progress */
  isExiting: boolean;
}

/**
 * Hook for managing order auto-remove countdown when all items are ready
 *
 * @example
 * ```tsx
 * const { isCountingDown, timeRemaining, cancelAutoRemove, isExiting } = useOrderAutoRemove({
 *   orderId: 'order-123',
 *   allItemsReady: true,
 *   isWaiterStation: false,
 *   onComplete: () => handleRemoveOrder('order-123'),
 * });
 * ```
 */
export function useOrderAutoRemove(
  options: IUseOrderAutoRemoveOptions
): IUseOrderAutoRemoveResult {
  const {
    allItemsReady,
    isWaiterStation,
    autoRemoveDelay = 5000,
    onComplete,
  } = options;

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoRemoveDelay / 1000);
  const [isExiting, setIsExiting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Refs for timers - kept across re-renders
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store onComplete in ref to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Track state in refs for cleanup
  const isCancelledRef = useRef(isCancelled);
  isCancelledRef.current = isCancelled;

  /**
   * Clear all timers helper
   */
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  /**
   * Cancel the auto-remove countdown
   * Stops all timers and resets state
   */
  const cancelAutoRemove = useCallback(() => {
    clearAllTimers();
    setIsCancelled(true);
    setIsCountingDown(false);
    setTimeRemaining(autoRemoveDelay / 1000);
  }, [autoRemoveDelay, clearAllTimers]);

  /**
   * Effect: Start countdown when all items become ready
   */
  useEffect(() => {
    // Skip for waiter stations
    if (isWaiterStation) return;

    // Skip if cancelled or already exiting
    if (isCancelled) return;
    if (isExiting) return;

    // Skip if already counting
    if (isCountingDown) return;

    // Start countdown when all items are ready
    if (allItemsReady) {
      setIsCountingDown(true);
      setTimeRemaining(autoRemoveDelay / 1000);

      // Update countdown every second
      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

      // After delay, trigger exit animation then complete
      timerRef.current = setTimeout(() => {
        // Check if cancelled during countdown
        if (isCancelledRef.current) return;

        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setIsCountingDown(false);
        setIsExiting(true);

        // After animation duration (300ms), call onComplete
        animationTimerRef.current = setTimeout(() => {
          if (!isCancelledRef.current) {
            onCompleteRef.current();
          }
        }, 300);
      }, autoRemoveDelay);
    }
  }, [allItemsReady, isWaiterStation, isCancelled, isExiting, isCountingDown, autoRemoveDelay]);

  /**
   * Effect: Reset cancelled state when items are no longer all ready
   * This allows re-triggering the countdown after cancel + items change
   */
  useEffect(() => {
    if (!allItemsReady) {
      setIsCancelled(false);
      setIsExiting(false);
      setIsCountingDown(false);
      clearAllTimers();
    }
  }, [allItemsReady, clearAllTimers]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    isCountingDown,
    timeRemaining,
    cancelAutoRemove,
    isExiting,
  };
}
