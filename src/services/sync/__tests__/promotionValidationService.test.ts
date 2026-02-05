/**
 * Tests for Promotion Validation Service
 * Story 6.4 - Promotions Offline Cache
 *
 * Tests:
 * - Date range validation (AC3)
 * - Time constraints validation (AC4)
 * - Day of week validation (AC4)
 * - Combined validation
 */

import { describe, it, expect } from 'vitest';
import {
  isPromotionValidNow,
  isDateRangeValid,
  isTimeRangeValid,
  isDayOfWeekValid,
  getValidPromotions,
  sortPromotionsByPriority,
} from '../promotionValidationService';
import type { IOfflinePromotion } from '@/lib/db';

// Helper to create a mock promotion
function createMockPromotion(overrides: Partial<IOfflinePromotion> = {}): IOfflinePromotion {
  return {
    id: 'test-promo-1',
    code: 'TEST10',
    name: 'Test Promotion',
    description: null,
    promotion_type: 'percentage',
    discount_percentage: 10,
    discount_amount: null,
    buy_quantity: null,
    get_quantity: null,
    start_date: null,
    end_date: null,
    time_start: null,
    time_end: null,
    days_of_week: null,
    min_purchase_amount: null,
    min_quantity: null,
    is_active: true,
    is_stackable: false,
    priority: 0,
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('promotionValidationService', () => {
  describe('isDateRangeValid', () => {
    it('should return true when no date constraints', () => {
      expect(isDateRangeValid(null, null)).toBe(true);
    });

    it('should return true when current date is within range', () => {
      const now = new Date('2026-02-05T12:00:00');
      expect(isDateRangeValid('2026-02-01', '2026-02-28', now)).toBe(true);
    });

    it('should return false when current date is before start_date', () => {
      const now = new Date('2026-01-15T12:00:00');
      expect(isDateRangeValid('2026-02-01', '2026-02-28', now)).toBe(false);
    });

    it('should return false when current date is after end_date', () => {
      const now = new Date('2026-03-15T12:00:00');
      expect(isDateRangeValid('2026-02-01', '2026-02-28', now)).toBe(false);
    });

    it('should return true when only start_date is set and passed', () => {
      const now = new Date('2026-02-15T12:00:00');
      expect(isDateRangeValid('2026-02-01', null, now)).toBe(true);
    });

    it('should return true when only end_date is set and not passed', () => {
      const now = new Date('2026-02-15T12:00:00');
      expect(isDateRangeValid(null, '2026-02-28', now)).toBe(true);
    });

    it('should return true on exact start_date', () => {
      // Use midday to avoid timezone issues with midnight
      const now = new Date('2026-02-01T12:00:00');
      expect(isDateRangeValid('2026-02-01', '2026-02-28', now)).toBe(true);
    });

    it('should return true on exact end_date', () => {
      const now = new Date('2026-02-28T23:59:59');
      expect(isDateRangeValid('2026-02-01', '2026-02-28', now)).toBe(true);
    });
  });

  describe('isTimeRangeValid', () => {
    it('should return true when no time constraints', () => {
      expect(isTimeRangeValid(null, null)).toBe(true);
    });

    it('should return true when current time is within range', () => {
      const now = new Date('2026-02-05T14:30:00');
      expect(isTimeRangeValid('10:00', '18:00', now)).toBe(true);
    });

    it('should return false when current time is before time_start', () => {
      const now = new Date('2026-02-05T08:30:00');
      expect(isTimeRangeValid('10:00', '18:00', now)).toBe(false);
    });

    it('should return false when current time is after time_end', () => {
      const now = new Date('2026-02-05T20:30:00');
      expect(isTimeRangeValid('10:00', '18:00', now)).toBe(false);
    });

    it('should return true when only time_start is set', () => {
      const now = new Date('2026-02-05T14:00:00');
      expect(isTimeRangeValid('10:00', null, now)).toBe(true);
    });

    it('should return true when only time_end is set', () => {
      const now = new Date('2026-02-05T10:00:00');
      expect(isTimeRangeValid(null, '18:00', now)).toBe(true);
    });

    it('should return true at exact time_start', () => {
      const now = new Date('2026-02-05T10:00:00');
      expect(isTimeRangeValid('10:00', '18:00', now)).toBe(true);
    });

    it('should return true at exact time_end', () => {
      const now = new Date('2026-02-05T18:00:00');
      expect(isTimeRangeValid('10:00', '18:00', now)).toBe(true);
    });
  });

  describe('isDayOfWeekValid', () => {
    it('should return true when no day constraints', () => {
      expect(isDayOfWeekValid(null)).toBe(true);
    });

    it('should return true when empty array', () => {
      expect(isDayOfWeekValid([])).toBe(true);
    });

    it('should return true when current day is in allowed days', () => {
      // Wednesday = 3
      const wednesday = new Date('2026-02-04T12:00:00');
      expect(isDayOfWeekValid([1, 2, 3, 4, 5], wednesday)).toBe(true); // Weekdays
    });

    it('should return false when current day is not in allowed days', () => {
      // Saturday = 6
      const saturday = new Date('2026-02-07T12:00:00');
      expect(isDayOfWeekValid([1, 2, 3, 4, 5], saturday)).toBe(false); // Weekdays only
    });

    it('should work with Sunday (0)', () => {
      // Sunday = 0
      const sunday = new Date('2026-02-08T12:00:00');
      expect(isDayOfWeekValid([0, 6], sunday)).toBe(true); // Weekends
    });

    it('should work with Saturday (6)', () => {
      // Saturday = 6
      const saturday = new Date('2026-02-07T12:00:00');
      expect(isDayOfWeekValid([0, 6], saturday)).toBe(true); // Weekends
    });
  });

  describe('isPromotionValidNow', () => {
    it('should return false when promotion is inactive', () => {
      const promo = createMockPromotion({ is_active: false });
      expect(isPromotionValidNow(promo)).toBe(false);
    });

    it('should return true for active promotion with no constraints', () => {
      const promo = createMockPromotion();
      expect(isPromotionValidNow(promo)).toBe(true);
    });

    it('should return false when date range is invalid', () => {
      const now = new Date('2026-03-01T12:00:00');
      const promo = createMockPromotion({
        start_date: '2026-02-01',
        end_date: '2026-02-28',
      });
      expect(isPromotionValidNow(promo, now)).toBe(false);
    });

    it('should return false when time range is invalid', () => {
      const now = new Date('2026-02-05T08:00:00');
      const promo = createMockPromotion({
        time_start: '10:00',
        time_end: '18:00',
      });
      expect(isPromotionValidNow(promo, now)).toBe(false);
    });

    it('should return false when day of week is invalid', () => {
      // Saturday = 6
      const saturday = new Date('2026-02-07T12:00:00');
      const promo = createMockPromotion({
        days_of_week: [1, 2, 3, 4, 5], // Weekdays only
      });
      expect(isPromotionValidNow(promo, saturday)).toBe(false);
    });

    it('should return true when all constraints are met', () => {
      const wednesday = new Date('2026-02-04T14:00:00');
      const promo = createMockPromotion({
        start_date: '2026-02-01',
        end_date: '2026-02-28',
        time_start: '10:00',
        time_end: '18:00',
        days_of_week: [1, 2, 3, 4, 5],
      });
      expect(isPromotionValidNow(promo, wednesday)).toBe(true);
    });
  });

  describe('getValidPromotions', () => {
    it('should filter out inactive promotions', () => {
      const promotions = [
        createMockPromotion({ id: '1', is_active: true }),
        createMockPromotion({ id: '2', is_active: false }),
        createMockPromotion({ id: '3', is_active: true }),
      ];
      const valid = getValidPromotions(promotions);
      expect(valid).toHaveLength(2);
      expect(valid.map((p) => p.id)).toEqual(['1', '3']);
    });

    it('should filter out expired promotions', () => {
      const now = new Date('2026-02-15T12:00:00');
      const promotions = [
        createMockPromotion({ id: '1', end_date: '2026-02-28' }), // Valid
        createMockPromotion({ id: '2', end_date: '2026-02-01' }), // Expired
        createMockPromotion({ id: '3', end_date: null }), // No expiry
      ];
      const valid = getValidPromotions(promotions, now);
      expect(valid).toHaveLength(2);
      expect(valid.map((p) => p.id)).toEqual(['1', '3']);
    });

    it('should return empty array when all promotions are invalid', () => {
      const promotions = [
        createMockPromotion({ id: '1', is_active: false }),
        createMockPromotion({ id: '2', is_active: false }),
      ];
      const valid = getValidPromotions(promotions);
      expect(valid).toHaveLength(0);
    });
  });

  describe('sortPromotionsByPriority', () => {
    it('should sort by priority descending', () => {
      const promotions = [
        createMockPromotion({ id: '1', name: 'A', priority: 1 }),
        createMockPromotion({ id: '2', name: 'B', priority: 10 }),
        createMockPromotion({ id: '3', name: 'C', priority: 5 }),
      ];
      const sorted = sortPromotionsByPriority(promotions);
      expect(sorted.map((p) => p.id)).toEqual(['2', '3', '1']);
    });

    it('should sort alphabetically by name for same priority', () => {
      const promotions = [
        createMockPromotion({ id: '1', name: 'Zebra', priority: 5 }),
        createMockPromotion({ id: '2', name: 'Alpha', priority: 5 }),
        createMockPromotion({ id: '3', name: 'Beta', priority: 5 }),
      ];
      const sorted = sortPromotionsByPriority(promotions);
      expect(sorted.map((p) => p.name)).toEqual(['Alpha', 'Beta', 'Zebra']);
    });

    it('should not mutate original array', () => {
      const promotions = [
        createMockPromotion({ id: '1', priority: 1 }),
        createMockPromotion({ id: '2', priority: 10 }),
      ];
      const originalOrder = promotions.map((p) => p.id);
      sortPromotionsByPriority(promotions);
      expect(promotions.map((p) => p.id)).toEqual(originalOrder);
    });
  });
});
