import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, type ComboSelectedItem } from '../cartStore'
import type { ProductCombo } from '../../types/database'

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

function makeSelections(): ComboSelectedItem[] {
    return [
        {
            group_id: 'g1',
            group_name: 'Beverage',
            item_id: 'item-1',
            product_id: 'prod-espresso',
            product_name: 'Espresso',
            price_adjustment: 0,
        },
        {
            group_id: 'g2',
            group_name: 'Pastry',
            item_id: 'item-2',
            product_id: 'prod-croissant',
            product_name: 'Croissant',
            price_adjustment: 0,
        },
    ]
}

describe('cartStore combo integration', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart()
    })

    it('adds a combo to cart', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 1, selections, 45000, '')

        const state = useCartStore.getState()
        expect(state.items).toHaveLength(1)
        expect(state.items[0].type).toBe('combo')
        expect(state.items[0].combo?.name).toBe('Breakfast Combo')
        expect(state.items[0].comboSelections).toHaveLength(2)
        expect(state.items[0].totalPrice).toBe(45000)
    })

    it('adds combo with price adjustments', () => {
        const combo = makeCombo()
        const selections: ComboSelectedItem[] = [
            {
                group_id: 'g1',
                group_name: 'Beverage',
                item_id: 'item-1',
                product_id: 'prod-latte',
                product_name: 'Oat Milk Latte',
                price_adjustment: 5000,
            },
            {
                group_id: 'g2',
                group_name: 'Pastry',
                item_id: 'item-2',
                product_id: 'prod-croissant',
                product_name: 'Croissant',
                price_adjustment: 0,
            },
        ]

        // totalPrice already includes adjustments (45000 base + 5000 adjustment)
        useCartStore.getState().addCombo(combo, 1, selections, 50000, '')

        const state = useCartStore.getState()
        expect(state.items[0].totalPrice).toBe(50000)
        expect(state.items[0].comboSelections?.[0].price_adjustment).toBe(5000)
    })

    it('adds combo with quantity > 1', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 2, selections, 45000, '')

        const state = useCartStore.getState()
        expect(state.items[0].quantity).toBe(2)
        expect(state.items[0].totalPrice).toBe(90000)
    })

    it('adds combo with notes', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 1, selections, 45000, 'No sugar')

        const state = useCartStore.getState()
        expect(state.items[0].notes).toBe('No sugar')
    })

    it('calculates subtotal correctly with combos and products', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        // Add a combo
        useCartStore.getState().addCombo(combo, 1, selections, 45000, '')

        // Add a regular product
        useCartStore.getState().addItem(
            { id: 'prod-1', name: 'Brownie', retail_price: 25000 } as any,
            1,
            [],
            '',
            undefined
        )

        const state = useCartStore.getState()
        expect(state.items).toHaveLength(2)
        expect(state.subtotal).toBe(70000)
    })

    it('removes combo from cart', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 1, selections, 45000, '')
        const itemId = useCartStore.getState().items[0].id

        useCartStore.getState().removeItem(itemId)

        expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('updates combo quantity', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 1, selections, 45000, '')
        const itemId = useCartStore.getState().items[0].id

        useCartStore.getState().updateItemQuantity(itemId, 3)

        const state = useCartStore.getState()
        expect(state.items[0].quantity).toBe(3)
        expect(state.items[0].totalPrice).toBe(135000)
    })

    it('clears cart removes combos', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 1, selections, 45000, '')
        useCartStore.getState().clearCart()

        expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('combo item id starts with combo- prefix', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 1, selections, 45000, '')

        expect(useCartStore.getState().items[0].id).toMatch(/^combo-/)
    })

    it('combo modifiers array is empty', () => {
        const combo = makeCombo()
        const selections = makeSelections()

        useCartStore.getState().addCombo(combo, 1, selections, 45000, '')

        expect(useCartStore.getState().items[0].modifiers).toHaveLength(0)
    })
})
