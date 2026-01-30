/**
 * Rate Limiting Service for Offline Authentication
 *
 * Prevents brute-force PIN attacks by limiting failed login attempts.
 * Rate limit state is kept in memory only (not persisted) - acceptable for MVP.
 *
 * Rules:
 * - After 3 failed attempts: 30 second cooldown
 * - Cooldown resets after 30s or on successful login
 * - State clears on page refresh (memory only)
 *
 * @see Story 1.2: AC3 - Rate Limiting After Failed Attempts
 */

/** Maximum failed attempts before rate limiting */
const MAX_ATTEMPTS = 3;

/** Cooldown duration in milliseconds (30 seconds) */
const COOLDOWN_MS = 30 * 1000;

/**
 * Rate limit tracking entry per user
 */
interface IRateLimitEntry {
  /** Number of consecutive failed attempts */
  attempts: number;
  /** Timestamp of last failed attempt (ms since epoch) */
  lastAttempt: number;
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
 * In-memory map tracking rate limits per user
 * Key: userId, Value: rate limit entry
 */
const rateLimitMap = new Map<string, IRateLimitEntry>();

/**
 * Rate Limiting Service
 *
 * Tracks and enforces rate limits for offline PIN authentication.
 */
export const rateLimitService = {
  /**
   * Check if a user is allowed to attempt login
   *
   * @param userId - User UUID to check
   * @returns Rate limit check result with allowed status and wait time
   */
  checkRateLimit(userId: string): IRateLimitCheck {
    const entry = rateLimitMap.get(userId);

    // No entry or under limit - allowed
    if (!entry || entry.attempts < MAX_ATTEMPTS) {
      return { allowed: true };
    }

    // Check if cooldown has elapsed
    const elapsed = Date.now() - entry.lastAttempt;
    if (elapsed >= COOLDOWN_MS) {
      // Cooldown complete - reset and allow
      rateLimitMap.delete(userId);
      return { allowed: true };
    }

    // Still in cooldown - calculate remaining time
    const remainingMs = COOLDOWN_MS - elapsed;
    const waitSeconds = Math.ceil(remainingMs / 1000);

    return { allowed: false, waitSeconds };
  },

  /**
   * Record a failed login attempt for a user
   *
   * Increments the failure counter and updates timestamp.
   *
   * @param userId - User UUID that failed authentication
   */
  recordFailedAttempt(userId: string): void {
    const existing = rateLimitMap.get(userId);
    const entry: IRateLimitEntry = existing
      ? { attempts: existing.attempts + 1, lastAttempt: Date.now() }
      : { attempts: 1, lastAttempt: Date.now() };

    rateLimitMap.set(userId, entry);

    console.debug(
      '[rateLimit] Failed attempt recorded:',
      userId,
      `(${entry.attempts}/${MAX_ATTEMPTS})`
    );
  },

  /**
   * Reset rate limit for a user (on successful login)
   *
   * @param userId - User UUID to reset
   */
  resetAttempts(userId: string): void {
    if (rateLimitMap.has(userId)) {
      rateLimitMap.delete(userId);
      console.debug('[rateLimit] Attempts reset for user:', userId);
    }
  },

  /**
   * Get current attempt count for a user
   *
   * @param userId - User UUID to check
   * @returns Number of failed attempts (0 if no entry)
   */
  getAttemptCount(userId: string): number {
    const entry = rateLimitMap.get(userId);
    return entry?.attempts ?? 0;
  },

  /**
   * Check if user is currently rate limited
   *
   * @param userId - User UUID to check
   * @returns true if user is blocked by rate limit
   */
  isRateLimited(userId: string): boolean {
    return !this.checkRateLimit(userId).allowed;
  },

  /**
   * Clear all rate limit entries (for testing)
   */
  clearAll(): void {
    rateLimitMap.clear();
  },
};

export default rateLimitService;
