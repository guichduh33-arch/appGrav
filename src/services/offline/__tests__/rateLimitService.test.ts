/**
 * Unit Tests for Rate Limit Service
 *
 * Tests rate limiting functionality for offline PIN authentication.
 * Validates 3-attempt limit and 30-second cooldown.
 *
 * @see Story 1.2: AC3 - Rate Limiting After Failed Attempts
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { rateLimitService } from '../rateLimitService';

describe('rateLimitService', () => {
  beforeEach(() => {
    // Clear all rate limit entries before each test
    rateLimitService.clearAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow first attempt', () => {
      const result = rateLimitService.checkRateLimit('user-1');

      expect(result.allowed).toBe(true);
      expect(result.waitSeconds).toBeUndefined();
    });

    it('should allow up to 3 failed attempts', () => {
      const userId = 'user-1';

      // Record 2 failed attempts
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      // Third attempt should still be allowed
      const result = rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(true);
    });

    it('should block after 3 failed attempts', () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      // Fourth attempt should be blocked
      const result = rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.waitSeconds).toBeDefined();
      expect(result.waitSeconds).toBeGreaterThan(0);
      expect(result.waitSeconds).toBeLessThanOrEqual(30);
    });

    it('should allow after cooldown period expires', () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      // Verify blocked
      expect(rateLimitService.checkRateLimit(userId).allowed).toBe(false);

      // Mock Date.now to simulate 31 seconds later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + 31000);

      // Should be allowed again
      const result = rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(true);
    });

    it('should return remaining wait time in seconds', () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      // Mock Date.now to simulate 10 seconds later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + 10000);

      // Should have ~20 seconds remaining
      const result = rateLimitService.checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.waitSeconds).toBe(20);
    });

    it('should track different users independently', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      // Block user1
      rateLimitService.recordFailedAttempt(user1);
      rateLimitService.recordFailedAttempt(user1);
      rateLimitService.recordFailedAttempt(user1);

      // user2 should still be allowed
      expect(rateLimitService.checkRateLimit(user2).allowed).toBe(true);
      // user1 should be blocked
      expect(rateLimitService.checkRateLimit(user1).allowed).toBe(false);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should increment attempt count', () => {
      const userId = 'user-1';

      expect(rateLimitService.getAttemptCount(userId)).toBe(0);

      rateLimitService.recordFailedAttempt(userId);
      expect(rateLimitService.getAttemptCount(userId)).toBe(1);

      rateLimitService.recordFailedAttempt(userId);
      expect(rateLimitService.getAttemptCount(userId)).toBe(2);

      rateLimitService.recordFailedAttempt(userId);
      expect(rateLimitService.getAttemptCount(userId)).toBe(3);
    });

    it('should update last attempt timestamp', () => {
      const userId = 'user-1';

      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      // Check immediately after - should have ~30 seconds wait
      const result = rateLimitService.checkRateLimit(userId);
      expect(result.waitSeconds).toBeGreaterThanOrEqual(29);
    });
  });

  describe('resetAttempts', () => {
    it('should clear attempts for a user', () => {
      const userId = 'user-1';

      // Record 3 failed attempts
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      // Verify blocked
      expect(rateLimitService.checkRateLimit(userId).allowed).toBe(false);

      // Reset
      rateLimitService.resetAttempts(userId);

      // Should be allowed again
      expect(rateLimitService.checkRateLimit(userId).allowed).toBe(true);
      expect(rateLimitService.getAttemptCount(userId)).toBe(0);
    });

    it('should not throw for non-existent user', () => {
      expect(() => rateLimitService.resetAttempts('non-existent')).not.toThrow();
    });
  });

  describe('getAttemptCount', () => {
    it('should return 0 for new users', () => {
      expect(rateLimitService.getAttemptCount('new-user')).toBe(0);
    });

    it('should return correct count after failed attempts', () => {
      const userId = 'user-1';

      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      expect(rateLimitService.getAttemptCount(userId)).toBe(2);
    });
  });

  describe('isRateLimited', () => {
    it('should return false for users under limit', () => {
      const userId = 'user-1';

      expect(rateLimitService.isRateLimited(userId)).toBe(false);

      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      expect(rateLimitService.isRateLimited(userId)).toBe(false);
    });

    it('should return true for users at limit', () => {
      const userId = 'user-1';

      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      expect(rateLimitService.isRateLimited(userId)).toBe(true);
    });

    it('should return false after cooldown expires', () => {
      const userId = 'user-1';

      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);
      rateLimitService.recordFailedAttempt(userId);

      expect(rateLimitService.isRateLimited(userId)).toBe(true);

      // Mock Date.now to simulate 31 seconds later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + 31000);

      expect(rateLimitService.isRateLimited(userId)).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all rate limit entries', () => {
      // Block multiple users
      rateLimitService.recordFailedAttempt('user-1');
      rateLimitService.recordFailedAttempt('user-1');
      rateLimitService.recordFailedAttempt('user-1');
      rateLimitService.recordFailedAttempt('user-2');
      rateLimitService.recordFailedAttempt('user-2');
      rateLimitService.recordFailedAttempt('user-2');

      expect(rateLimitService.isRateLimited('user-1')).toBe(true);
      expect(rateLimitService.isRateLimited('user-2')).toBe(true);

      // Clear all
      rateLimitService.clearAll();

      expect(rateLimitService.isRateLimited('user-1')).toBe(false);
      expect(rateLimitService.isRateLimited('user-2')).toBe(false);
      expect(rateLimitService.getAttemptCount('user-1')).toBe(0);
      expect(rateLimitService.getAttemptCount('user-2')).toBe(0);
    });
  });
});
