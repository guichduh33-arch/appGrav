/**
 * Promotion Validation Service
 * Story 6.4 - Promotions Offline Cache
 *
 * Validates promotion eligibility based on:
 * - Date range (start_date to end_date)
 * - Time constraints (time_start to time_end)
 * - Day of week constraints (days_of_week)
 *
 * Used for offline promotion evaluation in POS.
 *
 * @see Story 6.4: AC3 - Validation des Dates de Validité Offline
 * @see Story 6.4: AC4 - Validation des Contraintes Temporelles
 */

import type { IOfflinePromotion } from '@/lib/db';

/**
 * Check if a promotion is currently valid based on all temporal constraints
 *
 * Evaluates:
 * 1. Date range: start_date <= now <= end_date
 * 2. Time range: time_start <= currentTime <= time_end (if defined)
 * 3. Day of week: days_of_week includes current day (if defined)
 *
 * @param promo - Promotion to validate
 * @param now - Optional date to validate against (defaults to current time)
 * @returns true if promotion is valid at the given time
 *
 * @example
 * ```typescript
 * const isValid = isPromotionValidNow(promotion);
 * if (isValid) {
 *   // Apply promotion to cart
 * }
 * ```
 */
export function isPromotionValidNow(
  promo: IOfflinePromotion,
  now: Date = new Date()
): boolean {
  // Must be active
  if (!promo.is_active) {
    return false;
  }

  // Check date range
  if (!isDateRangeValid(promo.start_date, promo.end_date, now)) {
    return false;
  }

  // Check time range (if defined)
  if (!isTimeRangeValid(promo.time_start, promo.time_end, now)) {
    return false;
  }

  // Check day of week (if defined)
  if (!isDayOfWeekValid(promo.days_of_week, now)) {
    return false;
  }

  return true;
}

/**
 * Check if current date is within the promotion's date range
 *
 * @param startDate - Start date (ISO string) or null
 * @param endDate - End date (ISO string) or null
 * @param now - Current date to check against
 * @returns true if within date range
 */
export function isDateRangeValid(
  startDate: string | null,
  endDate: string | null,
  now: Date = new Date()
): boolean {
  // Extract date-only string for comparison (YYYY-MM-DD)
  const todayStr = now.toISOString().split('T')[0];

  // Check start date
  if (startDate) {
    // Extract date part only (handle ISO strings with time component)
    const startStr = startDate.split('T')[0];
    if (startStr > todayStr) {
      // Promotion hasn't started yet
      return false;
    }
  }

  // Check end date
  if (endDate) {
    // Extract date part only
    const endStr = endDate.split('T')[0];
    if (endStr < todayStr) {
      // Promotion has expired
      return false;
    }
  }

  return true;
}

/**
 * Check if current time is within the promotion's time range
 *
 * @param timeStart - Start time (HH:MM format) or null
 * @param timeEnd - End time (HH:MM format) or null
 * @param now - Current date/time to check against
 * @returns true if within time range or no time constraints
 */
export function isTimeRangeValid(
  timeStart: string | null,
  timeEnd: string | null,
  now: Date = new Date()
): boolean {
  // No time constraints = always valid
  if (!timeStart && !timeEnd) {
    return true;
  }

  // Get current time in HH:MM format
  const currentTime = now.toTimeString().slice(0, 5);

  // Check start time
  if (timeStart && currentTime < timeStart) {
    return false;
  }

  // Check end time
  if (timeEnd && currentTime > timeEnd) {
    return false;
  }

  return true;
}

/**
 * Check if current day of week is in the promotion's allowed days
 *
 * Days use JavaScript convention: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 *
 * @param daysOfWeek - Array of allowed day numbers, or null for all days
 * @param now - Current date to check against
 * @returns true if current day is allowed or no day constraints
 */
export function isDayOfWeekValid(
  daysOfWeek: number[] | null,
  now: Date = new Date()
): boolean {
  // No day constraints = all days valid
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return true;
  }

  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  return daysOfWeek.includes(currentDay);
}

/**
 * Filter an array of promotions to only those currently valid
 *
 * @param promotions - Array of promotions to filter
 * @param now - Optional date to validate against
 * @returns Array of valid promotions
 *
 * @example
 * ```typescript
 * const allPromotions = await getAllPromotionsFromOffline();
 * const validPromotions = getValidPromotions(allPromotions);
 * ```
 */
export function getValidPromotions(
  promotions: IOfflinePromotion[],
  now: Date = new Date()
): IOfflinePromotion[] {
  return promotions.filter((promo) => isPromotionValidNow(promo, now));
}

/**
 * Sort promotions by priority (higher priority first)
 * For same priority, sort by name alphabetically
 *
 * @param promotions - Array of promotions to sort
 * @returns Sorted array (does not mutate original)
 */
export function sortPromotionsByPriority(
  promotions: IOfflinePromotion[]
): IOfflinePromotion[] {
  return [...promotions].sort((a, b) => {
    // Higher priority first
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // Same priority: alphabetical by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get valid promotions sorted by priority
 *
 * Combines filtering and sorting for convenience
 *
 * @param promotions - Array of promotions to process
 * @param now - Optional date to validate against
 * @returns Array of valid promotions sorted by priority
 */
export function getValidPromotionsSorted(
  promotions: IOfflinePromotion[],
  now: Date = new Date()
): IOfflinePromotion[] {
  const valid = getValidPromotions(promotions, now);
  return sortPromotionsByPriority(valid);
}
