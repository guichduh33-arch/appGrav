import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ComboGrid from '../ComboGrid'
import type { ProductCombo } from '../../../types/database'

function makeCombo(overrides: Partial<ProductCombo> = {}): ProductCombo {
    return {
        id: 'combo-1',
        name: 'Breakfast Combo',
        description: 'Coffee + Croissant',
        combo_price: 45000,
        is_active: true,
        available_at_pos: true,
        sort_order: 1,
        company_id: 'company-1',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        ...overrides,
    } as ProductCombo
}

describe('ComboGrid', () => {
    it('renders nothing when no combos', () => {
        const { container } = render(
            <ComboGrid combos={[]} onComboClick={vi.fn()} />
        )
        expect(container.innerHTML).toBe('')
    })

    it('renders combo cards with name and price', () => {
        const combo = makeCombo()
        render(<ComboGrid combos={[combo]} onComboClick={vi.fn()} />)

        expect(screen.getByText('Breakfast Combo')).toBeDefined()
        // Price is formatted as IDR
        expect(screen.getByText(/45/)).toBeDefined()
    })

    it('shows Combo badge', () => {
        const combo = makeCombo()
        render(<ComboGrid combos={[combo]} onComboClick={vi.fn()} />)

        expect(screen.getByText('Combo')).toBeDefined()
    })

    it('calls onComboClick when card clicked', () => {
        const combo = makeCombo()
        const onClick = vi.fn()
        render(<ComboGrid combos={[combo]} onComboClick={onClick} />)

        fireEvent.click(screen.getByText('Breakfast Combo'))
        expect(onClick).toHaveBeenCalledWith(combo)
    })

    it('renders multiple combos', () => {
        const combos = [
            makeCombo({ id: 'c1', name: 'Breakfast Combo' }),
            makeCombo({ id: 'c2', name: 'Lunch Special', combo_price: 85000 }),
        ]
        render(<ComboGrid combos={combos} onComboClick={vi.fn()} />)

        expect(screen.getByText('Breakfast Combo')).toBeDefined()
        expect(screen.getByText('Lunch Special')).toBeDefined()
    })

    it('shows loading skeletons', () => {
        const { container } = render(
            <ComboGrid combos={[]} onComboClick={vi.fn()} isLoading={true} />
        )
        const skeletons = container.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBe(3)
    })
})
