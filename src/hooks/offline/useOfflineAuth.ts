/**
 * useOfflineAuth Hook
 *
 * Provides offline PIN authentication with rate limiting.
 * Used when the app is offline but user credentials are cached.
 *
 * Features:
 * - bcrypt PIN verification against cached hash
 * - Rate limiting (3 attempts, then 15min cooldown - persisted to IndexedDB)
 * - Countdown timer for rate limit display
 * - Integration with authStore for session management
 *
 * @see Story 1.2: Offline PIN Authentication
 * @see ADR-004: PIN Verification Offline
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { offlineAuthService, rateLimitService } from '@/services/offline';
import type { TOfflineAuthError } from '@/types/offline';
import { logDebug } from '@/utils/logger'

/**
 * Error thrown by offline authentication
 */
export interface IOfflineAuthError {
  code: TOfflineAuthError;
  message: string;
}

/**
 * Return type for useOfflineAuth hook
 */
export interface IUseOfflineAuthReturn {
  /** Attempt offline login with PIN */
  loginOffline: (userId: string, pin: string) => Promise<void>;
  /** Whether the user is currently rate limited */
  isRateLimited: boolean;
  /** Seconds remaining in cooldown (0 if not rate limited) */
  cooldownSeconds: number;
  /** Whether an auth operation is in progress */
  isLoading: boolean;
  /** Last error from authentication attempt */
  error: IOfflineAuthError | null;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Hook for offline PIN authentication
 *
 * @returns Offline auth methods and state
 *
 * @example
 * ```tsx
 * const { loginOffline, isRateLimited, cooldownSeconds, error } = useOfflineAuth();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await loginOffline(userId, pin);
 *     // Success - user is now logged in
 *   } catch (err) {
 *     // Error handled via error state
 *   }
 * };
 * ```
 */
export function useOfflineAuth(): IUseOfflineAuthReturn {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IOfflineAuthError | null>(null);

  // Get authStore actions
  const setOfflineSession = useAuthStore((state) => state.setOfflineSession);

  const isRateLimited = cooldownSeconds > 0;

  // Countdown timer for rate limiting
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        const newValue = prev - 1;
        return newValue > 0 ? newValue : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  /**
   * Attempt offline login with PIN
   *
   * @param userId - User UUID
   * @param pin - PIN entered by user
   * @throws Error with code RATE_LIMITED, INVALID_PIN, or CACHE_EXPIRED
   */
  const loginOffline = useCallback(
    async (userId: string, pin: string): Promise<void> => {
      // Check rate limit first (async - persisted to IndexedDB)
      const rateLimitCheck = await rateLimitService.checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        setCooldownSeconds(rateLimitCheck.waitSeconds ?? 900); // 15 minutes default
        const authError: IOfflineAuthError = {
          code: 'RATE_LIMITED',
          message: `Too many attempts. Please wait ${rateLimitCheck.waitSeconds} seconds`,
        };
        setError(authError);
        throw new Error('RATE_LIMITED');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Verify PIN using offline auth service
        const result = await offlineAuthService.verifyPinOffline(userId, pin);

        if (!result.success) {
          // Record failed attempt (async - persisted to IndexedDB)
          await rateLimitService.recordFailedAttempt(userId);

          // Check if now rate limited
          const newCheck = await rateLimitService.checkRateLimit(userId);
          if (!newCheck.allowed) {
            setCooldownSeconds(newCheck.waitSeconds ?? 900); // 15 minutes default
          }

          // Set error based on result
          const errorCode = result.error ?? 'INVALID_PIN';
          const authError: IOfflineAuthError = {
            code: errorCode,
            message: getErrorMessage(errorCode),
          };
          setError(authError);
          throw new Error(errorCode);
        }

        // Success - reset rate limit and set session
        await rateLimitService.resetAttempts(userId);

        const cachedUser = result.user!;

        // Update authStore with cached data and mark as offline session
        setOfflineSession({
          id: cachedUser.id,
          display_name: cachedUser.display_name,
          preferred_language: cachedUser.preferred_language,
        }, cachedUser.roles, cachedUser.permissions);

        logDebug('[useOfflineAuth] Offline login successful:', userId);
      } finally {
        setIsLoading(false);
      }
    },
    [setOfflineSession]
  );

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loginOffline,
    isRateLimited,
    cooldownSeconds,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Get user-friendly error message for auth error codes
 *
 * @param code - Error code from offline authentication
 * @returns Error message string
 */
function getErrorMessage(code: TOfflineAuthError): string {
  switch (code) {
    case 'INVALID_PIN':
      return 'Incorrect PIN';
    case 'CACHE_EXPIRED':
      return 'Session expired. Online login required.';
    case 'RATE_LIMITED':
      return 'Please wait...';
    default:
      return 'Error';
  }
}

export default useOfflineAuth;
