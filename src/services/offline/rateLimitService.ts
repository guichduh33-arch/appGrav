/**
 * Rate Limiting Service for Offline Authentication
 *
 * Prevents brute-force PIN attacks by limiting failed login attempts.
 * Rate limit state is PERSISTED to IndexedDB to survive page refreshes.
 *
 * Rules:
 * - After 3 failed attempts: 15 minute cooldown (per Story 1.2 requirement)
 * - Cooldown resets after 15 minutes or on successful login
 * - State persists in IndexedDB to prevent bypass via refresh
 *
 * @see Story 1.2: AC3 - Rate Limiting After Failed Attempts (3 attempts per 15 minutes)
 */

import { db } from '@/lib/db';
import type { IOfflineRateLimit } from '@/types/offline';
import { useCoreSettingsStore } from '@/stores/settings/coreSettingsStore';
import { logDebug } from '@/utils/logger'

/** Maximum failed attempts before rate limiting */
const MAX_ATTEMPTS = 3;


function getSecurityConfig() {
  const getSetting = useCoreSettingsStore.getState().getSetting;
  return {
    maxAttempts: getSetting<number>('security.pin_max_attempts') ?? MAX_ATTEMPTS,
    cooldownMs: (getSetting<number>('security.pin_cooldown_minutes') ?? 15) * 60 * 1000,
  };
}

/**
 * Result of rate limit check
 */
export interface IRateLimitCheck {
  /** Whether the user is allowed to attempt login */
  allowed: boolean;
  /** Seconds remaining in cooldown (if rate limited) */
  waitSeconds?: number;
}

/**
 * Rate Limiting Service
 *
 * Tracks and enforces rate limits for offline PIN authentication.
 * All state is persisted to IndexedDB to prevent bypass via page refresh.
 */
export const rateLimitService = {
  /**
   * Check if a user is allowed to attempt login
   *
   * @param userId - User UUID to check
   * @returns Rate limit check result with allowed status and wait time
   */
  async checkRateLimit(userId: string): Promise<IRateLimitCheck> {
    const { maxAttempts, cooldownMs } = getSecurityConfig();
    const entry = await db.offline_rate_limits.get(userId);

    // No entry or under limit - allowed
    if (!entry || entry.attempts < maxAttempts) {
      return { allowed: true };
    }

    // Check if cooldown has elapsed
    const lastAttemptTime = new Date(entry.last_attempt).getTime();
    const elapsed = Date.now() - lastAttemptTime;

    if (elapsed >= cooldownMs) {
      // Cooldown complete - reset and allow
      await db.offline_rate_limits.delete(userId);
      return { allowed: true };
    }

    // Still in cooldown - calculate remaining time
    const remainingMs = cooldownMs - elapsed;
    const waitSeconds = Math.ceil(remainingMs / 1000);

    return { allowed: false, waitSeconds };
  },

  /**
   * Record a failed login attempt for a user
   *
   * Increments the failure counter and updates timestamp.
   * Persisted to IndexedDB to survive page refreshes.
   *
   * @param userId - User UUID that failed authentication
   */
  async recordFailedAttempt(userId: string): Promise<void> {
    const { maxAttempts } = getSecurityConfig();
    const existing = await db.offline_rate_limits.get(userId);
    const entry: IOfflineRateLimit = existing
      ? {
          id: userId,
          attempts: existing.attempts + 1,
          last_attempt: new Date().toISOString(),
        }
      : {
          id: userId,
          attempts: 1,
          last_attempt: new Date().toISOString(),
        };

    await db.offline_rate_limits.put(entry);

    logDebug(
      '[rateLimit] Failed attempt recorded:',
      userId,
      `(${entry.attempts}/${maxAttempts})`
    );
  },

  /**
   * Reset rate limit for a user (on successful login)
   *
   * @param userId - User UUID to reset
   */
  async resetAttempts(userId: string): Promise<void> {
    const exists = await db.offline_rate_limits.get(userId);
    if (exists) {
      await db.offline_rate_limits.delete(userId);
      logDebug('[rateLimit] Attempts reset for user:', userId);
    }
  },

  /**
   * Get current attempt count for a user
   *
   * @param userId - User UUID to check
   * @returns Number of failed attempts (0 if no entry)
   */
  async getAttemptCount(userId: string): Promise<number> {
    const entry = await db.offline_rate_limits.get(userId);
    return entry?.attempts ?? 0;
  },

  /**
   * Check if user is currently rate limited
   *
   * @param userId - User UUID to check
   * @returns true if user is blocked by rate limit
   */
  async isRateLimited(userId: string): Promise<boolean> {
    const result = await this.checkRateLimit(userId);
    return !result.allowed;
  },

  /**
   * Clear all rate limit entries (for testing)
   */
  async clearAll(): Promise<void> {
    await db.offline_rate_limits.clear();
  },

  /**
   * Cleanup expired rate limit entries
   * Can be called periodically to free up storage
   */
  async cleanupExpired(): Promise<void> {
    const { cooldownMs } = getSecurityConfig();
    const cutoff = new Date(Date.now() - cooldownMs).toISOString();
    const expired = await db.offline_rate_limits
      .where('last_attempt')
      .below(cutoff)
      .toArray();

    if (expired.length > 0) {
      await db.offline_rate_limits.bulkDelete(expired.map((e) => e.id));
      logDebug('[rateLimit] Cleaned up', expired.length, 'expired entries');
    }
  },
};

export default rateLimitService;
