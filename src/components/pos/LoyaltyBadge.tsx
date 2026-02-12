/**
 * LoyaltyBadge Component
 *
 * Displays customer loyalty information: tier badge, points balance, and discount.
 * Supports offline mode with appropriate visual indicators.
 *
 * @see Story 6.3: Loyalty Points Display (Read-Only)
 */

import { memo } from 'react'
import { Star, Crown, WifiOff } from 'lucide-react'
import { getTierColor, getTierDiscount } from '@/constants/loyalty'
import { cn } from '@/lib/utils'

export interface LoyaltyBadgeProps {
    /** Customer's loyalty tier (bronze, silver, gold, platinum) */
    tier: string
    /** Customer's current points balance */
    points: number
    /** Whether the app is in offline mode */
    isOffline?: boolean
    /** Optional: compact display mode */
    compact?: boolean
}

/**
 * LoyaltyBadge - Displays loyalty tier, points, and discount information
 *
 * AC1: Displays tier badge with appropriate color
 * AC2: Displays points formatted with thousand separators
 * AC3: Displays loyalty discount for Silver/Gold/Platinum
 * AC4: Bronze shows no discount
 * AC5: Shows offline indicator when in offline mode
 */
export const LoyaltyBadge = memo(function LoyaltyBadge({ tier, points, isOffline = false, compact = false }: LoyaltyBadgeProps) {
    const normalizedTier = tier?.toLowerCase() || 'bronze'
    const tierColor = getTierColor(normalizedTier)
    const discount = getTierDiscount(normalizedTier)
    const hasDiscount = discount > 0

    const formattedPoints = points?.toLocaleString() || '0'

    return (
        <div
            className={cn('inline-flex items-center gap-1.5 flex-wrap text-[11px]', compact && 'gap-1 text-[10px]')}
            data-testid="loyalty-badge"
        >
            {/* Tier Badge */}
            <span
                className={cn(
                    'inline-flex items-center gap-[3px] px-1.5 py-0.5 rounded text-white font-semibold text-[10px] uppercase tracking-wider',
                    compact && 'px-1 py-px text-[9px]'
                )}
                style={{ backgroundColor: tierColor }}
                title={`${normalizedTier.charAt(0).toUpperCase() + normalizedTier.slice(1)} tier`}
                data-testid="loyalty-tier"
            >
                {normalizedTier !== 'bronze' ? (
                    <Crown size={compact ? 10 : 12} />
                ) : (
                    <Star size={compact ? 10 : 12} />
                )}
                {!compact && (
                    <span className="ml-0.5">
                        {normalizedTier.charAt(0).toUpperCase() + normalizedTier.slice(1)}
                    </span>
                )}
            </span>

            {/* Points Display */}
            <span
                className={cn(
                    'inline-flex items-center gap-[3px] text-slate-500 text-[11px] font-medium',
                    compact && 'text-[10px]'
                )}
                title={isOffline ? 'Points balance may be outdated' : `${formattedPoints} loyalty points`}
                data-testid="loyalty-points"
            >
                <Star size={compact ? 10 : 12} />
                {formattedPoints} pts
                {isOffline && (
                    <span title="Points balance may be outdated" data-testid="offline-indicator">
                        <WifiOff size={10} className="text-amber-500 ml-0.5" />
                    </span>
                )}
            </span>

            {/* Loyalty Discount - Only for Silver, Gold, Platinum (AC3, AC4) */}
            {hasDiscount && (
                <span
                    className={cn(
                        'inline-flex items-center gap-[3px] px-1.5 py-0.5 rounded font-semibold text-[10px]',
                        compact && 'px-1 py-px text-[9px]'
                    )}
                    style={{ backgroundColor: tierColor, color: normalizedTier === 'silver' || normalizedTier === 'platinum' ? '#333' : '#fff' }}
                    title={`Loyalty discount: ${discount}%`}
                    data-testid="loyalty-discount"
                >
                    <Star size={10} />
                    -{discount}%
                </span>
            )}
        </div>
    )
})

export default LoyaltyBadge
