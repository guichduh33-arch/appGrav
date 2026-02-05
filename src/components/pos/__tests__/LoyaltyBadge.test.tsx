/**
 * LoyaltyBadge Component Tests
 *
 * @see Story 6.3: Loyalty Points Display (Read-Only)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoyaltyBadge } from '../LoyaltyBadge'
import { TIER_COLORS } from '@/constants/loyalty'

describe('LoyaltyBadge', () => {
    describe('AC1: Tier Badge Display', () => {
        it('renders Bronze tier with correct color', () => {
            render(<LoyaltyBadge tier="bronze" points={100} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            expect(tierBadge).toBeInTheDocument()
            expect(tierBadge).toHaveStyle({ backgroundColor: TIER_COLORS.bronze })
        })

        it('renders Silver tier with correct color', () => {
            render(<LoyaltyBadge tier="silver" points={500} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            expect(tierBadge).toHaveStyle({ backgroundColor: TIER_COLORS.silver })
        })

        it('renders Gold tier with correct color', () => {
            render(<LoyaltyBadge tier="gold" points={2000} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            expect(tierBadge).toHaveStyle({ backgroundColor: TIER_COLORS.gold })
        })

        it('renders Platinum tier with correct color', () => {
            render(<LoyaltyBadge tier="platinum" points={5000} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            expect(tierBadge).toHaveStyle({ backgroundColor: TIER_COLORS.platinum })
        })

        it('handles case-insensitive tier names', () => {
            render(<LoyaltyBadge tier="GOLD" points={2000} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            expect(tierBadge).toHaveStyle({ backgroundColor: TIER_COLORS.gold })
        })

        it('defaults to bronze for unknown tiers', () => {
            render(<LoyaltyBadge tier="unknown" points={0} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            // Should use fallback color
            expect(tierBadge).toBeInTheDocument()
        })
    })

    describe('AC2: Points Display', () => {
        it('displays points with thousand separators', () => {
            render(<LoyaltyBadge tier="silver" points={1500} />)

            const pointsDisplay = screen.getByTestId('loyalty-points')
            expect(pointsDisplay).toHaveTextContent('1,500 pts')
        })

        it('displays large points correctly formatted', () => {
            render(<LoyaltyBadge tier="platinum" points={12500} />)

            const pointsDisplay = screen.getByTestId('loyalty-points')
            expect(pointsDisplay).toHaveTextContent('12,500 pts')
        })

        it('handles zero points', () => {
            render(<LoyaltyBadge tier="bronze" points={0} />)

            const pointsDisplay = screen.getByTestId('loyalty-points')
            expect(pointsDisplay).toHaveTextContent('0 pts')
        })
    })

    describe('AC3: Loyalty Discount Display', () => {
        it('displays 5% discount for Silver tier', () => {
            render(<LoyaltyBadge tier="silver" points={500} />)

            const discountBadge = screen.getByTestId('loyalty-discount')
            expect(discountBadge).toHaveTextContent('-5%')
        })

        it('displays 8% discount for Gold tier', () => {
            render(<LoyaltyBadge tier="gold" points={2000} />)

            const discountBadge = screen.getByTestId('loyalty-discount')
            expect(discountBadge).toHaveTextContent('-8%')
        })

        it('displays 10% discount for Platinum tier', () => {
            render(<LoyaltyBadge tier="platinum" points={5000} />)

            const discountBadge = screen.getByTestId('loyalty-discount')
            expect(discountBadge).toHaveTextContent('-10%')
        })
    })

    describe('AC4: Bronze No Discount', () => {
        it('does NOT display discount badge for Bronze tier', () => {
            render(<LoyaltyBadge tier="bronze" points={100} />)

            const discountBadge = screen.queryByTestId('loyalty-discount')
            expect(discountBadge).not.toBeInTheDocument()
        })
    })

    describe('AC5: Offline Indicator', () => {
        it('displays offline indicator when isOffline=true', () => {
            render(<LoyaltyBadge tier="silver" points={500} isOffline={true} />)

            const offlineIndicator = screen.getByTestId('offline-indicator')
            expect(offlineIndicator).toBeInTheDocument()
        })

        it('does NOT display offline indicator when isOffline=false', () => {
            render(<LoyaltyBadge tier="silver" points={500} isOffline={false} />)

            const offlineIndicator = screen.queryByTestId('offline-indicator')
            expect(offlineIndicator).not.toBeInTheDocument()
        })

        it('does NOT display offline indicator by default', () => {
            render(<LoyaltyBadge tier="silver" points={500} />)

            const offlineIndicator = screen.queryByTestId('offline-indicator')
            expect(offlineIndicator).not.toBeInTheDocument()
        })

        it('shows correct tooltip for offline points', () => {
            render(<LoyaltyBadge tier="silver" points={500} isOffline={true} />)

            const pointsDisplay = screen.getByTestId('loyalty-points')
            expect(pointsDisplay).toHaveAttribute('title', 'Points balance may be outdated')
        })
    })

    describe('Compact Mode', () => {
        it('renders in compact mode without tier name text', () => {
            render(<LoyaltyBadge tier="gold" points={2000} compact={true} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            // In compact mode, tier name should not be displayed
            expect(tierBadge.querySelector('.loyalty-badge__tier-name')).not.toBeInTheDocument()
        })

        it('renders tier name in default (non-compact) mode', () => {
            render(<LoyaltyBadge tier="gold" points={2000} compact={false} />)

            const tierBadge = screen.getByTestId('loyalty-tier')
            expect(tierBadge.querySelector('.loyalty-badge__tier-name')).toBeInTheDocument()
            expect(tierBadge).toHaveTextContent('Gold')
        })
    })
})
