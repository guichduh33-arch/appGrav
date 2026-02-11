/**
 * Loyalty System Constants
 *
 * Defines tier colors and discount percentages for the loyalty program.
 * Used by LoyaltyBadge, Cart, and CustomerSearchModal components.
 * These serve as fallback defaults; runtime values come from useLoyaltySettings().
 *
 * @see Story 6.3: Loyalty Points Display (Read-Only)
 * @see CLAUDE.md#Business-Rules for tier definitions
 */

/**
 * Color codes for each loyalty tier
 * Used for visual distinction in badges and avatars
 */
export const TIER_COLORS: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2'
}

/**
 * Discount percentages for each loyalty tier
 * - Bronze: 0% (no discount)
 * - Silver: 5% (500+ points)
 * - Gold: 8% (2,000+ points)
 * - Platinum: 10% (5,000+ points)
 */
export const TIER_DISCOUNTS: Record<string, number> = {
    bronze: 0,
    silver: 5,
    gold: 8,
    platinum: 10
}

/**
 * Helper function to get tier color with fallback
 * @param tier - The loyalty tier name (lowercase)
 * @returns The hex color code for the tier
 */
export const getTierColor = (tier: string): string => {
    return TIER_COLORS[tier.toLowerCase()] || '#6366f1'
}

/**
 * Helper function to get tier discount percentage
 * @param tier - The loyalty tier name (lowercase)
 * @returns The discount percentage (0-10)
 */
export const getTierDiscount = (tier: string): number => {
    return TIER_DISCOUNTS[tier.toLowerCase()] || 0
}
