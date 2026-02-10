/**
 * Cart types - extracted from cartStore to break circular dependencies
 *
 * ARCH-006: These types were originally defined in src/stores/cartStore.ts.
 * Extracting them here allows services and components to import cart types
 * without importing the entire store, avoiding circular dependency issues.
 */

import type { Product, ProductCombo } from './database'
import type { TPriceType } from './offline'

export interface CartModifier {
    groupName: string
    optionId: string
    optionLabel: string
    priceAdjustment: number
}

export interface ComboSelectedItem {
    group_id: string
    group_name: string
    item_id: string
    product_id: string
    product_name: string
    price_adjustment: number
}

export interface VariantMaterial {
    materialId: string
    quantity: number
}

export interface SelectedVariant {
    groupName: string
    optionIds: string[]
    optionLabels: string[]
    materials: VariantMaterial[]
}

export interface CartItem {
    id: string // Unique ID for this cart item
    type: 'product' | 'combo'
    product?: Product // For regular products
    combo?: ProductCombo // For combos
    quantity: number
    unitPrice: number // Base price (may be customer-specific)
    modifiers: CartModifier[] // For regular products
    comboSelections?: ComboSelectedItem[] // For combos
    modifiersTotal: number // Sum of modifier/adjustment prices
    notes: string
    selectedVariants?: SelectedVariant[] // Product variants with material tracking
    totalPrice: number // (unitPrice + modifiersTotal) * quantity
    // Customer category pricing (Story 6.2)
    appliedPriceType?: TPriceType // retail, wholesale, discount, custom
    savingsAmount?: number // Amount saved compared to retail price
    retailPrice?: number // Original retail price (for comparison display)
}
