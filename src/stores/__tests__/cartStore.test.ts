/**
 * CartStore Tests (TEST-001)
 *
 * Comprehensive tests for the Zustand cart store covering:
 * - addItem / addItemWithPricing
 * - removeItem / removeLockedItem
 * - updateItemQuantity / updateItem
 * - calculateTotals (subtotal, tax, total, discounts)
 * - Locked items (kitchen-sent items)
 * - clearCart (with and without locked items)
 * - Discounts (percentage and fixed amount)
 * - Modifiers (price adjustments)
 * - Edge cases (empty cart, zero quantities, max discount caps)
 *
 * @see Sprint 4 - Quality & Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCartStore, type CartModifier } from '@/stores/cartStore'
import type { Product } from '@/types/database'

// Mock the cartPersistenceService so clearCart doesn't hit localStorage
vi.mock('@/services/offline/cartPersistenceService', () => ({
  saveCart: vi.fn(),
  clearPersistedCart: vi.fn(),
  loadCart: vi.fn(() => null),
  hasPersistedCart: vi.fn(() => false),
}))

// =====================================================
// Test Helpers
// =====================================================

/**
 * Create a minimal Product fixture for testing.
 * Uses Partial<Product> cast to Product since only relevant fields are needed.
 */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-001',
    name: 'Croissant',
    sku: 'CRO-001',
    retail_price: 25000,
    wholesale_price: 20000,
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    product_type: 'finished',
    category_id: 'cat-001',
    company_id: 'company-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as Product
}

function makeModifier(overrides: Partial<CartModifier> = {}): CartModifier {
  return {
    groupName: 'Size',
    optionId: 'opt-large',
    optionLabel: 'Large',
    priceAdjustment: 5000,
    ...overrides,
  }
}

/**
 * Helper to add a simple product to cart and return the cart item ID.
 */
function addSimpleProduct(product?: Product, quantity = 1): string {
  const p = product ?? makeProduct()
  useCartStore.getState().addItem(p, quantity, [], '', undefined)
  const items = useCartStore.getState().items
  return items[items.length - 1].id
}

/**
 * Calculate the inclusive tax for a given total.
 * Tax = total * 10 / 110  (10% included in price)
 */
function calculateInclusiveTax(total: number): number {
  return Math.round(total * 10 / 110)
}

// =====================================================
// Tests
// =====================================================

describe('cartStore', () => {
  beforeEach(() => {
    // Force clear everything including locked items
    useCartStore.setState({
      items: [],
      orderType: 'dine_in',
      tableNumber: null,
      customerId: null,
      customerName: null,
      customerCategorySlug: null,
      discountType: null,
      discountValue: 0,
      discountReason: null,
      orderNotes: '',
      lockedItemIds: [],
      activeOrderId: null,
      activeOrderNumber: null,
      promotionDiscounts: [],
      promotionTotalDiscount: 0,
      appliedPromotions: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      itemCount: 0,
    })
  })

  // ===========================================
  // 1. addItem
  // ===========================================
  describe('addItem', () => {
    it('should add a product to cart with quantity=1', () => {
      const product = makeProduct()
      useCartStore.getState().addItem(product, 1, [], '', undefined)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].type).toBe('product')
      expect(state.items[0].product?.id).toBe('prod-001')
      expect(state.items[0].quantity).toBe(1)
      expect(state.items[0].unitPrice).toBe(25000)
      expect(state.items[0].totalPrice).toBe(25000)
    })

    it('should create unique cart item IDs for the same product added multiple times', () => {
      const product = makeProduct()
      useCartStore.getState().addItem(product, 1, [], '', undefined)
      useCartStore.getState().addItem(product, 1, [], '', undefined)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(2)
      // IDs should be different since each addItem creates a new cart entry
      expect(state.items[0].id).not.toBe(state.items[1].id)
    })

    it('should add an item with quantity > 1', () => {
      const product = makeProduct({ retail_price: 30000 })
      useCartStore.getState().addItem(product, 3, [], '', undefined)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(3)
      expect(state.items[0].totalPrice).toBe(90000) // 30000 * 3
    })

    it('should update subtotal and itemCount when items are added', () => {
      useCartStore.getState().addItem(makeProduct({ id: 'p1', retail_price: 25000 }), 1, [], '', undefined)
      useCartStore.getState().addItem(makeProduct({ id: 'p2', retail_price: 35000 }), 2, [], '', undefined)

      const state = useCartStore.getState()
      expect(state.subtotal).toBe(25000 + 70000) // 25000 + (35000 * 2)
      expect(state.itemCount).toBe(3) // 1 + 2
    })

    it('should handle product with null retail_price as 0', () => {
      const product = makeProduct({ retail_price: null })
      useCartStore.getState().addItem(product, 1, [], '', undefined)

      const state = useCartStore.getState()
      expect(state.items[0].unitPrice).toBe(0)
      expect(state.items[0].totalPrice).toBe(0)
    })

    it('should add item with notes', () => {
      const product = makeProduct()
      useCartStore.getState().addItem(product, 1, [], 'Extra crispy', undefined)

      expect(useCartStore.getState().items[0].notes).toBe('Extra crispy')
    })
  })

  // ===========================================
  // 2. removeItem
  // ===========================================
  describe('removeItem', () => {
    it('should remove an item from cart', () => {
      const itemId = addSimpleProduct()
      expect(useCartStore.getState().items).toHaveLength(1)

      useCartStore.getState().removeItem(itemId)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should update totals after removal', () => {
      const id1 = addSimpleProduct(makeProduct({ id: 'p1', retail_price: 25000 }))
      addSimpleProduct(makeProduct({ id: 'p2', retail_price: 35000 }))

      expect(useCartStore.getState().subtotal).toBe(60000)

      useCartStore.getState().removeItem(id1)

      expect(useCartStore.getState().subtotal).toBe(35000)
      expect(useCartStore.getState().itemCount).toBe(1)
    })

    it('should do nothing when removing non-existent item', () => {
      addSimpleProduct()
      const state = useCartStore.getState()

      useCartStore.getState().removeItem('non-existent-id')

      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().subtotal).toBe(state.subtotal)
    })
  })

  // ===========================================
  // 3. updateItemQuantity
  // ===========================================
  describe('updateItemQuantity', () => {
    it('should update quantity of an existing item', () => {
      const itemId = addSimpleProduct(makeProduct({ retail_price: 25000 }))

      useCartStore.getState().updateItemQuantity(itemId, 5)

      const item = useCartStore.getState().items[0]
      expect(item.quantity).toBe(5)
      expect(item.totalPrice).toBe(125000) // 25000 * 5
    })

    it('should update subtotal and total after quantity change', () => {
      const itemId = addSimpleProduct(makeProduct({ retail_price: 20000 }))

      useCartStore.getState().updateItemQuantity(itemId, 3)

      expect(useCartStore.getState().subtotal).toBe(60000)
      expect(useCartStore.getState().total).toBe(60000)
      expect(useCartStore.getState().itemCount).toBe(3)
    })

    it('should remove item when quantity is set to 0', () => {
      const itemId = addSimpleProduct()

      useCartStore.getState().updateItemQuantity(itemId, 0)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should remove item when quantity is set to negative', () => {
      const itemId = addSimpleProduct()

      useCartStore.getState().updateItemQuantity(itemId, -1)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should correctly recalculate totalPrice with modifiers when quantity changes', () => {
      const product = makeProduct({ retail_price: 20000 })
      const modifiers = [makeModifier({ priceAdjustment: 3000 })]
      useCartStore.getState().addItem(product, 1, modifiers, '', undefined)
      const itemId = useCartStore.getState().items[0].id

      // Initially: (20000 + 3000) * 1 = 23000
      expect(useCartStore.getState().items[0].totalPrice).toBe(23000)

      useCartStore.getState().updateItemQuantity(itemId, 4)

      // After: (20000 + 3000) * 4 = 92000
      expect(useCartStore.getState().items[0].totalPrice).toBe(92000)
    })
  })

  // ===========================================
  // 4. calculateTotals (subtotal, tax, total, discount)
  // ===========================================
  describe('calculateTotals', () => {
    it('should calculate subtotal as sum of all item totalPrices', () => {
      addSimpleProduct(makeProduct({ id: 'p1', retail_price: 25000 }))
      addSimpleProduct(makeProduct({ id: 'p2', retail_price: 35000 }))
      addSimpleProduct(makeProduct({ id: 'p3', retail_price: 15000 }))

      expect(useCartStore.getState().subtotal).toBe(75000)
    })

    it('should have total equal to subtotal when no discount', () => {
      addSimpleProduct(makeProduct({ retail_price: 50000 }))

      const state = useCartStore.getState()
      expect(state.total).toBe(state.subtotal)
      expect(state.total).toBe(50000)
    })

    it('should calculate 10% inclusive tax correctly (tax = total * 10/110)', () => {
      addSimpleProduct(makeProduct({ retail_price: 110000 }))

      const state = useCartStore.getState()
      // Tax is inclusive: tax = 110000 * 10 / 110 = 10000
      const expectedTax = calculateInclusiveTax(state.total)
      expect(expectedTax).toBe(10000)
    })

    it('should calculate inclusive tax for typical bakery prices', () => {
      // Croissant 25000 IDR
      addSimpleProduct(makeProduct({ retail_price: 25000 }))

      const total = useCartStore.getState().total
      // Tax = 25000 * 10 / 110 = 2272.727... -> rounded to 2273
      expect(calculateInclusiveTax(total)).toBe(2273)
    })

    it('should correctly compute total with percentage discount', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))

      useCartStore.getState().setDiscount('percent', 10, 'Staff discount')

      const state = useCartStore.getState()
      expect(state.subtotal).toBe(100000)
      expect(state.discountAmount).toBe(10000)
      expect(state.total).toBe(90000)
    })

    it('should correctly compute total with fixed amount discount', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))

      useCartStore.getState().setDiscount('amount', 15000, 'Coupon')

      const state = useCartStore.getState()
      expect(state.subtotal).toBe(100000)
      expect(state.discountAmount).toBe(15000)
      expect(state.total).toBe(85000)
    })

    it('should compute inclusive tax after discount', () => {
      addSimpleProduct(makeProduct({ retail_price: 110000 }))

      useCartStore.getState().setDiscount('amount', 10000, null)

      const state = useCartStore.getState()
      // Total = 110000 - 10000 = 100000
      // Tax = 100000 * 10 / 110 = 9090.9... -> 9091
      expect(state.total).toBe(100000)
      expect(calculateInclusiveTax(state.total)).toBe(9091)
    })
  })

  // ===========================================
  // 5. Locked items
  // ===========================================
  describe('locked items', () => {
    it('should lock current items in cart', () => {
      const itemId = addSimpleProduct()

      useCartStore.getState().lockCurrentItems()

      expect(useCartStore.getState().lockedItemIds).toContain(itemId)
      expect(useCartStore.getState().isItemLocked(itemId)).toBe(true)
    })

    it('should prevent removal of locked items via removeItem', () => {
      const itemId = addSimpleProduct()
      useCartStore.getState().lockCurrentItems()

      // Attempt to remove locked item (should not remove)
      useCartStore.getState().removeItem(itemId)

      expect(useCartStore.getState().items).toHaveLength(1)
    })

    it('should allow force removal of locked items via removeLockedItem', () => {
      const itemId = addSimpleProduct()
      useCartStore.getState().lockCurrentItems()

      useCartStore.getState().removeLockedItem(itemId)

      expect(useCartStore.getState().items).toHaveLength(0)
      expect(useCartStore.getState().lockedItemIds).not.toContain(itemId)
    })

    it('should prevent reducing quantity of locked items', () => {
      const product = makeProduct({ retail_price: 25000 })
      useCartStore.getState().addItem(product, 3, [], '', undefined)
      const itemId = useCartStore.getState().items[0].id

      useCartStore.getState().lockCurrentItems()

      // Try to reduce quantity (should fail silently)
      useCartStore.getState().updateItemQuantity(itemId, 1)

      // Quantity should remain unchanged
      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })

    it('should allow increasing quantity of locked items', () => {
      const product = makeProduct({ retail_price: 25000 })
      useCartStore.getState().addItem(product, 2, [], '', undefined)
      const itemId = useCartStore.getState().items[0].id

      useCartStore.getState().lockCurrentItems()

      useCartStore.getState().updateItemQuantity(itemId, 5)

      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('should return locked and unlocked items correctly', () => {
      const id1 = addSimpleProduct(makeProduct({ id: 'p1', name: 'Croissant' }))
      useCartStore.getState().lockCurrentItems()

      addSimpleProduct(makeProduct({ id: 'p2', name: 'Brownie' }))

      const locked = useCartStore.getState().getLockedItems()
      const unlocked = useCartStore.getState().getUnlockedItems()

      expect(locked).toHaveLength(1)
      expect(locked[0].id).toBe(id1)
      expect(unlocked).toHaveLength(1)
      expect(unlocked[0].product?.name).toBe('Brownie')
    })

    it('should set and clear active order', () => {
      useCartStore.getState().setActiveOrder('order-123', 'ORD-001')

      expect(useCartStore.getState().activeOrderId).toBe('order-123')
      expect(useCartStore.getState().activeOrderNumber).toBe('ORD-001')

      useCartStore.getState().clearActiveOrder()

      expect(useCartStore.getState().activeOrderId).toBeNull()
      expect(useCartStore.getState().activeOrderNumber).toBeNull()
      expect(useCartStore.getState().lockedItemIds).toHaveLength(0)
    })
  })

  // ===========================================
  // 6. clearCart
  // ===========================================
  describe('clearCart', () => {
    it('should clear all items from cart and return true', () => {
      addSimpleProduct()
      addSimpleProduct(makeProduct({ id: 'p2' }))

      const result = useCartStore.getState().clearCart()

      expect(result).toBe(true)
      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.subtotal).toBe(0)
      expect(state.total).toBe(0)
      expect(state.itemCount).toBe(0)
    })

    it('should reset all cart metadata when clearing', () => {
      addSimpleProduct()
      useCartStore.getState().setCustomer('cust-1', 'John')
      useCartStore.getState().setTableNumber('5')
      useCartStore.getState().setDiscount('percent', 10, 'VIP')

      useCartStore.getState().clearCart()

      const state = useCartStore.getState()
      expect(state.customerId).toBeNull()
      expect(state.customerName).toBeNull()
      expect(state.tableNumber).toBeNull()
      expect(state.discountType).toBeNull()
      expect(state.discountValue).toBe(0)
      expect(state.discountReason).toBeNull()
    })

    it('should NOT clear cart when locked items exist (FE-002)', () => {
      addSimpleProduct()
      useCartStore.getState().lockCurrentItems()

      const result = useCartStore.getState().clearCart()

      expect(result).toBe(false)
      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().lockedItemIds).toHaveLength(1)
    })

    it('should forceClearCart including locked items', () => {
      addSimpleProduct()
      useCartStore.getState().lockCurrentItems()

      useCartStore.getState().forceClearCart()

      expect(useCartStore.getState().items).toHaveLength(0)
      expect(useCartStore.getState().lockedItemIds).toHaveLength(0)
    })
  })

  // ===========================================
  // 7. Discounts
  // ===========================================
  describe('discounts', () => {
    it('should apply percentage discount correctly', () => {
      addSimpleProduct(makeProduct({ retail_price: 200000 }))

      useCartStore.getState().setDiscount('percent', 15, 'Holiday sale')

      const state = useCartStore.getState()
      expect(state.discountAmount).toBe(30000) // 200000 * 15%
      expect(state.total).toBe(170000)
    })

    it('should apply fixed amount discount correctly', () => {
      addSimpleProduct(makeProduct({ retail_price: 200000 }))

      useCartStore.getState().setDiscount('amount', 50000, 'Coupon')

      const state = useCartStore.getState()
      expect(state.discountAmount).toBe(50000)
      expect(state.total).toBe(150000)
    })

    it('should cap percentage discount at 100%', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))

      // Try to set 150% discount
      useCartStore.getState().setDiscount('percent', 150, 'Test')

      const state = useCartStore.getState()
      // Should be capped at 100% = 100000
      expect(state.discountAmount).toBe(100000)
      expect(state.total).toBe(0)
    })

    it('should cap fixed discount at subtotal', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))

      // Try to set discount higher than subtotal
      useCartStore.getState().setDiscount('amount', 200000, 'Test')

      const state = useCartStore.getState()
      expect(state.discountAmount).toBe(100000) // Capped at subtotal
      expect(state.total).toBe(0)
    })

    it('should remove discount when type is set to null', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))
      useCartStore.getState().setDiscount('percent', 10, 'Test')

      expect(useCartStore.getState().discountAmount).toBe(10000)

      useCartStore.getState().setDiscount(null, 0, null)

      expect(useCartStore.getState().discountAmount).toBe(0)
      expect(useCartStore.getState().total).toBe(100000)
    })

    it('should recalculate discount when items change', () => {
      addSimpleProduct(makeProduct({ id: 'p1', retail_price: 100000 }))
      useCartStore.getState().setDiscount('percent', 10, 'Test')

      expect(useCartStore.getState().discountAmount).toBe(10000)
      expect(useCartStore.getState().total).toBe(90000)

      // Add another item
      addSimpleProduct(makeProduct({ id: 'p2', retail_price: 50000 }))

      // Subtotal is now 150000, discount should recalculate
      expect(useCartStore.getState().subtotal).toBe(150000)
      expect(useCartStore.getState().discountAmount).toBe(15000) // 150000 * 10%
      expect(useCartStore.getState().total).toBe(135000)
    })

    it('should handle negative discount value as 0', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))

      useCartStore.getState().setDiscount('amount', -5000, 'Invalid')

      const state = useCartStore.getState()
      expect(state.discountAmount).toBe(0)
      expect(state.total).toBe(100000)
    })

    it('should store discount reason', () => {
      useCartStore.getState().setDiscount('percent', 10, 'Staff discount')

      expect(useCartStore.getState().discountReason).toBe('Staff discount')
    })
  })

  // ===========================================
  // 8. Modifiers
  // ===========================================
  describe('modifiers', () => {
    it('should calculate price with single modifier', () => {
      const product = makeProduct({ retail_price: 25000 })
      const modifiers = [makeModifier({ priceAdjustment: 5000 })]

      useCartStore.getState().addItem(product, 1, modifiers, '', undefined)

      const item = useCartStore.getState().items[0]
      expect(item.modifiersTotal).toBe(5000)
      expect(item.totalPrice).toBe(30000) // 25000 + 5000
    })

    it('should calculate price with multiple modifiers', () => {
      const product = makeProduct({ retail_price: 25000 })
      const modifiers = [
        makeModifier({ groupName: 'Size', optionLabel: 'Large', priceAdjustment: 5000 }),
        makeModifier({ groupName: 'Topping', optionLabel: 'Cheese', priceAdjustment: 3000 }),
        makeModifier({ groupName: 'Extra', optionLabel: 'Butter', priceAdjustment: 2000 }),
      ]

      useCartStore.getState().addItem(product, 1, modifiers, '', undefined)

      const item = useCartStore.getState().items[0]
      expect(item.modifiersTotal).toBe(10000) // 5000 + 3000 + 2000
      expect(item.totalPrice).toBe(35000) // 25000 + 10000
    })

    it('should multiply (unitPrice + modifiersTotal) by quantity', () => {
      const product = makeProduct({ retail_price: 20000 })
      const modifiers = [makeModifier({ priceAdjustment: 5000 })]

      useCartStore.getState().addItem(product, 3, modifiers, '', undefined)

      const item = useCartStore.getState().items[0]
      expect(item.totalPrice).toBe(75000) // (20000 + 5000) * 3
    })

    it('should update modifiers on existing item via updateItem', () => {
      const product = makeProduct({ retail_price: 20000 })
      const originalModifiers = [makeModifier({ priceAdjustment: 5000 })]
      useCartStore.getState().addItem(product, 2, originalModifiers, '', undefined)
      const itemId = useCartStore.getState().items[0].id

      // Update with new modifiers
      const newModifiers = [
        makeModifier({ priceAdjustment: 8000 }),
        makeModifier({ groupName: 'Extra', priceAdjustment: 2000 }),
      ]
      useCartStore.getState().updateItem(itemId, newModifiers, 'Updated notes')

      const item = useCartStore.getState().items[0]
      expect(item.modifiers).toHaveLength(2)
      expect(item.modifiersTotal).toBe(10000) // 8000 + 2000
      expect(item.totalPrice).toBe(60000) // (20000 + 10000) * 2
      expect(item.notes).toBe('Updated notes')
    })

    it('should handle modifiers with zero price adjustment', () => {
      const product = makeProduct({ retail_price: 25000 })
      const modifiers = [makeModifier({ priceAdjustment: 0 })]

      useCartStore.getState().addItem(product, 1, modifiers, '', undefined)

      expect(useCartStore.getState().items[0].totalPrice).toBe(25000)
    })
  })

  // ===========================================
  // 9. Edge cases
  // ===========================================
  describe('edge cases', () => {
    it('should have zero totals for empty cart', () => {
      const state = useCartStore.getState()
      expect(state.subtotal).toBe(0)
      expect(state.total).toBe(0)
      expect(state.itemCount).toBe(0)
      expect(state.discountAmount).toBe(0)
    })

    it('should prevent negative total (total is always >= 0)', () => {
      addSimpleProduct(makeProduct({ retail_price: 10000 }))

      // Apply a discount larger than subtotal
      useCartStore.getState().setDiscount('amount', 50000, 'Overkill')

      // discountAmount is capped at subtotal, so total = 0
      expect(useCartStore.getState().total).toBe(0)
    })

    it('should handle removing the last item from cart', () => {
      const itemId = addSimpleProduct()

      useCartStore.getState().removeItem(itemId)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.subtotal).toBe(0)
      expect(state.total).toBe(0)
      expect(state.itemCount).toBe(0)
    })

    it('should handle many items in cart', () => {
      for (let i = 0; i < 50; i++) {
        addSimpleProduct(makeProduct({ id: `prod-${i}`, retail_price: 10000 }))
      }

      expect(useCartStore.getState().items).toHaveLength(50)
      expect(useCartStore.getState().subtotal).toBe(500000)
      expect(useCartStore.getState().itemCount).toBe(50)
    })

    it('should set order type', () => {
      useCartStore.getState().setOrderType('takeaway')
      expect(useCartStore.getState().orderType).toBe('takeaway')

      useCartStore.getState().setOrderType('delivery')
      expect(useCartStore.getState().orderType).toBe('delivery')
    })

    it('should set customer info', () => {
      useCartStore.getState().setCustomer('cust-123', 'Budi')

      expect(useCartStore.getState().customerId).toBe('cust-123')
      expect(useCartStore.getState().customerName).toBe('Budi')
    })

    it('should set customer with category slug', () => {
      useCartStore.getState().setCustomerWithCategorySlug('cust-456', 'Wholesale Corp', 'wholesale')

      expect(useCartStore.getState().customerId).toBe('cust-456')
      expect(useCartStore.getState().customerName).toBe('Wholesale Corp')
      expect(useCartStore.getState().customerCategorySlug).toBe('wholesale')
    })

    it('should set order notes', () => {
      useCartStore.getState().setOrderNotes('Deliver to back entrance')

      expect(useCartStore.getState().orderNotes).toBe('Deliver to back entrance')
    })

    it('should set table number', () => {
      useCartStore.getState().setTableNumber('12')
      expect(useCartStore.getState().tableNumber).toBe('12')

      useCartStore.getState().setTableNumber(null)
      expect(useCartStore.getState().tableNumber).toBeNull()
    })
  })

  // ===========================================
  // 10. Customer category pricing
  // ===========================================
  describe('addItemWithPricing', () => {
    it('should add item with wholesale price', () => {
      const product = makeProduct({ retail_price: 25000, wholesale_price: 20000 })

      useCartStore.getState().addItemWithPricing(
        product, 1, [], '', 20000, 'wholesale', 5000, undefined
      )

      const item = useCartStore.getState().items[0]
      expect(item.unitPrice).toBe(20000)
      expect(item.totalPrice).toBe(20000)
      expect(item.appliedPriceType).toBe('wholesale')
      expect(item.savingsAmount).toBe(5000)
      expect(item.retailPrice).toBe(25000)
    })

    it('should multiply savings by quantity', () => {
      const product = makeProduct({ retail_price: 25000 })

      useCartStore.getState().addItemWithPricing(
        product, 3, [], '', 20000, 'discount', 5000, undefined
      )

      const item = useCartStore.getState().items[0]
      expect(item.savingsAmount).toBe(15000) // 5000 * 3
      expect(item.totalPrice).toBe(60000) // 20000 * 3
    })
  })

  // ===========================================
  // 11. Promotion discounts
  // ===========================================
  describe('promotions', () => {
    it('should apply promotion discount to total', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))

      useCartStore.getState().setPromotionResult({
        itemDiscounts: [
          {
            itemId: useCartStore.getState().items[0].id,
            promotionId: 'promo-1',
            promotionName: '10% Off',
            promotionCode: 'SAVE10',
            discountAmount: 10000,
            discountType: 'percentage',
            description: '10% off',
          },
        ],
        totalDiscount: 10000,
        appliedPromotions: [
          {
            promotionId: 'promo-1',
            promotionName: '10% Off',
            promotionCode: 'SAVE10',
            totalDiscount: 10000,
          },
        ],
      })

      const state = useCartStore.getState()
      expect(state.promotionTotalDiscount).toBe(10000)
      expect(state.total).toBe(90000) // 100000 - 10000
    })

    it('should stack promotion discount with manual discount', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))

      // Apply promotion first
      useCartStore.getState().setPromotionResult({
        itemDiscounts: [],
        totalDiscount: 10000,
        appliedPromotions: [],
      })

      // Then manual discount
      useCartStore.getState().setDiscount('amount', 5000, 'Extra discount')

      const state = useCartStore.getState()
      // Total = 100000 - 10000 (promo) - 5000 (manual) = 85000
      expect(state.total).toBe(85000)
    })

    it('should retrieve item-specific promotion discounts', () => {
      addSimpleProduct(makeProduct({ retail_price: 100000 }))
      const itemId = useCartStore.getState().items[0].id

      useCartStore.getState().setPromotionResult({
        itemDiscounts: [
          {
            itemId,
            promotionId: 'promo-1',
            promotionName: 'BOGO',
            promotionCode: 'BOGO50',
            discountAmount: 50000,
            discountType: 'buy_x_get_y',
            description: 'Buy one get one 50%',
          },
        ],
        totalDiscount: 50000,
        appliedPromotions: [],
      })

      const itemDiscounts = useCartStore.getState().getItemPromotionDiscount(itemId)
      expect(itemDiscounts).toHaveLength(1)
      expect(itemDiscounts[0].discountAmount).toBe(50000)
    })
  })

  // ===========================================
  // 12. restoreCartState
  // ===========================================
  describe('restoreCartState', () => {
    it('should restore items, locked IDs, and active order', () => {
      const items = [
        {
          id: 'restored-1',
          type: 'product' as const,
          product: makeProduct(),
          quantity: 2,
          unitPrice: 25000,
          modifiers: [],
          modifiersTotal: 0,
          notes: '',
          totalPrice: 50000,
        },
      ]

      useCartStore.getState().restoreCartState(
        items,
        ['restored-1'],
        'order-abc',
        'ORD-100'
      )

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].id).toBe('restored-1')
      expect(state.lockedItemIds).toContain('restored-1')
      expect(state.activeOrderId).toBe('order-abc')
      expect(state.activeOrderNumber).toBe('ORD-100')
      expect(state.subtotal).toBe(50000)
    })
  })
})
