/**
 * useOfflineAuth Hook
 *
 * Provides offline PIN authentication with rate limiting.
 * Used when the app is offline but user credentials are cached.
 *
 * Features:
 * - bcrypt PIN verification against cached hash
 * - Rate limiting (3 attempts, then 30s cooldown)
 * - Countdown timer for rate limit display
 * - Integration with authStore for session management
 *
 * @see Story 1.2: Offline PIN Authentication
 * @see ADR-004: PIN Verification Offline
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { offlineAuthService, rateLimitService } from '@/services/offline';
import type { TOfflineAuthError } from '@/types/offline';

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
  const { t } = useTranslation();
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
      // Check rate limit first
      const rateLimitCheck = rateLimitService.checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        setCooldownSeconds(rateLimitCheck.waitSeconds ?? 30);
        const authError: IOfflineAuthError = {
          code: 'RATE_LIMITED',
          message: t('auth.offline.rateLimited', { seconds: rateLimitCheck.waitSeconds }),
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
          // Record failed attempt
          rateLimitService.recordFailedAttempt(userId);

          // Check if now rate limited
          const newCheck = rateLimitService.checkRateLimit(userId);
          if (!newCheck.allowed) {
            setCooldownSeconds(newCheck.waitSeconds ?? 30);
          }

          // Set error based on result
          const errorCode = result.error ?? 'INVALID_PIN';
          const authError: IOfflineAuthError = {
            code: errorCode,
            message: getErrorMessage(errorCode, t),
          };
          setError(authError);
          throw new Error(errorCode);
        }

        // Success - reset rate limit and set session
        rateLimitService.resetAttempts(userId);

        const cachedUser = result.user!;

        // Update authStore with cached data and mark as offline session
        setOfflineSession({
          id: cachedUser.id,
          display_name: cachedUser.display_name,
          preferred_language: cachedUser.preferred_language,
        }, cachedUser.roles, cachedUser.permissions);

        console.debug('[useOfflineAuth] Offline login successful:', userId);
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
 * Get user-friendly error message for auth error codes using i18n
 *
 * @param code - Error code from offline authentication
 * @param t - Translation function from useTranslation
 * @returns Localized error message
 */
function getErrorMessage(code: TOfflineAuthError, t: (key: string) => string): string {
  switch (code) {
    case 'INVALID_PIN':
      return t('auth.offline.pinIncorrect');
    case 'CACHE_EXPIRED':
      return t('auth.offline.sessionExpiredOnlineRequired');
    case 'RATE_LIMITED':
      return t('auth.offline.rateLimitedWait');
    default:
      return t('common.error');
  }
}

export default useOfflineAuth;
