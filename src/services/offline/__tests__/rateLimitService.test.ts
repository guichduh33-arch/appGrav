/**
 * Unit Tests for Rate Limit Service
 *
 * Tests rate limiting functionality for offline PIN authentication.
 * Validates 3-attempt limit and 15-minute cooldown (persisted to IndexedDB).
 *
 * @see Story 1.2: AC3 - Rate Limiting After Failed Attempts (3 per 15 minutes)
 */

import 'fake-indexeddb/auto';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db';
import { rateLimitService } from '../rateLimitService';

/** 15 minutes in milliseconds */
const COOLDOWN_MS = 15 * 60 * 1000;

describe('rateLimitService', () => {
  beforeEach(async () => {
    // Reset database before each test
    await db.delete();
    await db.open();
    // Clear all rate limit entries before each test
    await rateLimitService.clearAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow first attempt', async () => {
      const result = await rateLimitService.checkRateLimit('user-1');

      expect(result.allowed).toBe(true);
      expect(result.waitSeconds).toBeUndefined();
    });

    it('should allow up to 3 failed attempts', async () => {
      const userId = 'user-1';

      // Record 2 failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Third attempt should still be allowed
      const result = await rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(true);
    });

    it('should block after 3 failed attempts', async () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Fourth attempt should be blocked
      const result = await rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.waitSeconds).toBeDefined();
      expect(result.waitSeconds).toBeGreaterThan(0);
      expect(result.waitSeconds).toBeLessThanOrEqual(900); // 15 minutes
    });

    it('should allow after cooldown period expires', async () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Verify blocked
      expect((await rateLimitService.checkRateLimit(userId)).allowed).toBe(false);

      // Mock Date.now to simulate 15 minutes + 1 second later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + COOLDOWN_MS + 1000);

      // Should be allowed again
      const result = await rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(true);
    });

    it('should return remaining wait time in seconds', async () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Mock Date.now to simulate 5 minutes later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + 5 * 60 * 1000);

      // Should have ~10 minutes remaining (600 seconds)
      const result = await rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.waitSeconds).toBe(600);
    });

    it('should track different users independently', async () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      // Block user1
      await rateLimitService.recordFailedAttempt(user1);
      await rateLimitService.recordFailedAttempt(user1);
      await rateLimitService.recordFailedAttempt(user1);

      // user2 should still be allowed
      expect((await rateLimitService.checkRateLimit(user2)).allowed).toBe(true);
      // user1 should be blocked
      expect((await rateLimitService.checkRateLimit(user1)).allowed).toBe(false);
    });

    it('should persist rate limits across "page refreshes" (database reads)', async () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Verify blocked
      expect((await rateLimitService.checkRateLimit(userId)).allowed).toBe(false);

      // Simulate "page refresh" by reading directly from DB
      const entry = await db.offline_rate_limits.get(userId);
      expect(entry).toBeDefined();
      expect(entry?.attempts).toBe(3);

      // Rate limit should still be enforced
      const result = await rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(false);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should increment attempt count', async () => {
      const userId = 'user-1';

      expect(await rateLimitService.getAttemptCount(userId)).toBe(0);

      await rateLimitService.recordFailedAttempt(userId);
      expect(await rateLimitService.getAttemptCount(userId)).toBe(1);

      await rateLimitService.recordFailedAttempt(userId);
      expect(await rateLimitService.getAttemptCount(userId)).toBe(2);

      await rateLimitService.recordFailedAttempt(userId);
      expect(await rateLimitService.getAttemptCount(userId)).toBe(3);
    });

    it('should update last attempt timestamp', async () => {
      const userId = 'user-1';

      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Check immediately after - should have ~15 minutes wait
      const result = await rateLimitService.checkRateLimit(userId);
      expect(result.waitSeconds).toBeGreaterThanOrEqual(899); // ~15 minutes
    });
  });

  describe('resetAttempts', () => {
    it('should clear attempts for a user', async () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Verify blocked
      expect((await rateLimitService.checkRateLimit(userId)).allowed).toBe(false);

      // Reset
      await rateLimitService.resetAttempts(userId);

      // Should be allowed again
      expect((await rateLimitService.checkRateLimit(userId)).allowed).toBe(true);
      expect(await rateLimitService.getAttemptCount(userId)).toBe(0);
    });

    it('should not throw for non-existent user', async () => {
      await expect(rateLimitService.resetAttempts('non-existent')).resolves.not.toThrow();
    });
  });

  describe('getAttemptCount', () => {
    it('should return 0 for new users', async () => {
      expect(await rateLimitService.getAttemptCount('new-user')).toBe(0);
    });

    it('should return correct count after failed attempts', async () => {
      const userId = 'user-1';

      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      expect(await rateLimitService.getAttemptCount(userId)).toBe(2);
    });
  });

  describe('isRateLimited', () => {
    it('should return false for users under limit', async () => {
      const userId = 'user-1';

      expect(await rateLimitService.isRateLimited(userId)).toBe(false);

      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      expect(await rateLimitService.isRateLimited(userId)).toBe(false);
    });

    it('should return true for users at limit', async () => {
      const userId = 'user-1';

      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      expect(await rateLimitService.isRateLimited(userId)).toBe(true);
    });

    it('should return false after cooldown expires', async () => {
      const userId = 'user-1';

      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      expect(await rateLimitService.isRateLimited(userId)).toBe(true);

      // Mock Date.now to simulate 15 minutes + 1 second later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + COOLDOWN_MS + 1000);

      expect(await rateLimitService.isRateLimited(userId)).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all rate limit entries', async () => {
      // Block multiple users
      await rateLimitService.recordFailedAttempt('user-1');
      await rateLimitService.recordFailedAttempt('user-1');
      await rateLimitService.recordFailedAttempt('user-1');
      await rateLimitService.recordFailedAttempt('user-2');
      await rateLimitService.recordFailedAttempt('user-2');
      await rateLimitService.recordFailedAttempt('user-2');

      expect(await rateLimitService.isRateLimited('user-1')).toBe(true);
      expect(await rateLimitService.isRateLimited('user-2')).toBe(true);

      // Clear all
      await rateLimitService.clearAll();

      expect(await rateLimitService.isRateLimited('user-1')).toBe(false);
      expect(await rateLimitService.isRateLimited('user-2')).toBe(false);
      expect(await rateLimitService.getAttemptCount('user-1')).toBe(0);
      expect(await rateLimitService.getAttemptCount('user-2')).toBe(0);
    });
  });

  describe('cleanupExpired', () => {
    it('should remove entries older than cooldown period', async () => {
      const userId = 'user-1';

      // Record failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Mock Date.now to simulate 15 minutes + 1 second later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + COOLDOWN_MS + 1000);

      // Run cleanup
      await rateLimitService.cleanupExpired();

      // Entry should be removed
      expect(await rateLimitService.getAttemptCount(userId)).toBe(0);
    });

    it('should not remove entries within cooldown period', async () => {
      const userId = 'user-1';

      // Record failed attempts
      await rateLimitService.recordFailedAttempt(userId);
      await rateLimitService.recordFailedAttempt(userId);

      // Mock Date.now to simulate 5 minutes later (within cooldown)
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + 5 * 60 * 1000);

      // Run cleanup
      await rateLimitService.cleanupExpired();

      // Entry should still exist
      expect(await rateLimitService.getAttemptCount(userId)).toBe(2);
    });
  });
});
