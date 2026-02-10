/**
 * Checkout Integration Tests (TEST-002)
 *
 * Integration-style tests that exercise the full checkout flow:
 * cart store + payment service + offline payment service (mocked).
 *
 * Covers:
 * 1. Full checkout flow: add items -> calculate totals -> validate -> process payment
 * 2. Split payment: two payments (cash + card) totaling order amount
 * 3. Payment with change: cash exceeding total, change rounded to 100 IDR
 * 4. Discount + payment: apply discount -> adjusted total -> pay
 * 5. Offline payment: payment queued when offline
 *
 * @see Sprint 4 - Quality & Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCartStore, type CartModifier } from '@/stores/cartStore'
import {
  validatePayment,
  validateSplitPayments,
  calculateChange,
  processPayment,
  processSplitPayment,
  createSplitPaymentState,
  addPaymentToState,
} from '@/services/payment/paymentService'
import type { IPaymentInput } from '@/types/payment'
import type { Product } from '@/types/database'

// =====================================================
// Mocks
// =====================================================

// Mock cartPersistenceService
vi.mock('@/services/offline/cartPersistenceService', () => ({
  saveCart: vi.fn(),
  clearPersistedCart: vi.fn(),
  loadCart: vi.fn(() => null),
  hasPersistedCart: vi.fn(() => false),
}))

// Mock offlinePaymentService - the actual IndexedDB layer
vi.mock('@/services/offline/offlinePaymentService', () => {
  let paymentCounter = 0

  return {
    saveOfflinePayment: vi.fn(async (input: Record<string, unknown>) => {
      paymentCounter++
      return {
        id: `LOCAL-PAY-mock-${paymentCounter}`,
        order_id: input.order_id,
        method: input.method,
        amount: input.amount,
        cash_received: input.cash_received ?? null,
        change_given: input.change_given ?? null,
        reference: input.reference ?? null,
        user_id: input.user_id,
        session_id: input.session_id ?? null,
        created_at: new Date().toISOString(),
        sync_status: input.method === 'cash' ? 'pending_sync' : 'pending_validation',
      }
    }),
    saveOfflinePayments: vi.fn(async (orderId: string, payments: Array<Record<string, unknown>>) => {
      return payments.map((p) => {
        paymentCounter++
        return {
          id: `LOCAL-PAY-mock-${paymentCounter}`,
          order_id: orderId,
          method: p.method,
          amount: p.amount,
          cash_received: p.cash_received ?? null,
          change_given: p.change_given ?? null,
          reference: p.reference ?? null,
          user_id: p.user_id,
          session_id: p.session_id ?? null,
          created_at: new Date().toISOString(),
          sync_status: p.method === 'cash' ? 'pending_sync' : 'pending_validation',
        }
      })
    }),
    calculateChange: vi.fn((total: number, cashReceived: number) => {
      return Math.max(0, cashReceived - total)
    }),
    getOrderPaidAmount: vi.fn(async () => 0),
    generateLocalPaymentId: vi.fn(() => `LOCAL-PAY-${crypto.randomUUID()}`),
  }
})

// =====================================================
// Test Helpers
// =====================================================

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

function addItemToCart(product?: Product, quantity = 1, modifiers: CartModifier[] = []): void {
  const p = product ?? makeProduct()
  useCartStore.getState().addItem(p, quantity, modifiers, '', undefined)
}

function resetCart(): void {
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
}

/**
 * Calculate inclusive tax: tax = total * 10/110
 */
function calculateInclusiveTax(total: number): number {
  return Math.round(total * 10 / 110)
}

// =====================================================
// Tests
// =====================================================

describe('Checkout Integration Tests', () => {
  beforeEach(() => {
    resetCart()
    vi.clearAllMocks()
  })

  // ===========================================
  // 1. Full checkout flow
  // ===========================================
  describe('full checkout flow', () => {
    it('should complete a simple checkout: add items -> validate -> process payment', async () => {
      // Step 1: Add items to cart
      addItemToCart(makeProduct({ id: 'p1', name: 'Croissant', retail_price: 25000 }), 2)
      addItemToCart(makeProduct({ id: 'p2', name: 'Espresso', retail_price: 35000 }), 1)

      // Step 2: Verify cart totals
      const cartState = useCartStore.getState()
      expect(cartState.items).toHaveLength(2)
      expect(cartState.subtotal).toBe(85000) // (25000 * 2) + 35000
      expect(cartState.total).toBe(85000)
      expect(cartState.itemCount).toBe(3)

      // Step 3: Validate payment
      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: cartState.total,
        cashReceived: 100000,
      }
      const validation = validatePayment(paymentInput, cartState.total)
      expect(validation.valid).toBe(true)

      // Step 4: Process payment
      const result = await processPayment(
        'order-001',
        paymentInput,
        'user-001',
        'session-001',
        cartState.total
      )

      expect(result.success).toBe(true)
      expect(result.paymentId).toMatch(/^LOCAL-PAY-/)
      // Change: 100000 - 85000 = 15000 (already a multiple of 100)
      expect(result.change).toBe(15000)
    })

    it('should complete checkout with QRIS payment (no change)', async () => {
      addItemToCart(makeProduct({ retail_price: 50000 }), 1)

      const total = useCartStore.getState().total
      const paymentInput: IPaymentInput = {
        method: 'qris',
        amount: total,
        reference: 'QRIS-TXN-12345',
      }

      const validation = validatePayment(paymentInput, total)
      expect(validation.valid).toBe(true)

      const result = await processPayment('order-002', paymentInput, 'user-001', 'session-001', total)

      expect(result.success).toBe(true)
      expect(result.change).toBeUndefined() // Non-cash has no change
    })

    it('should reject payment when amount does not match order total', async () => {
      addItemToCart(makeProduct({ retail_price: 50000 }))

      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: 30000, // Does not match 50000 total
        cashReceived: 30000,
      }

      const result = await processPayment('order-003', paymentInput, 'user-001', undefined, 50000)

      expect(result.success).toBe(false)
      expect(result.error).toContain('does not match order total')
    })

    it('should verify inclusive tax after checkout', async () => {
      addItemToCart(makeProduct({ retail_price: 110000 }), 1)

      const total = useCartStore.getState().total
      expect(total).toBe(110000)

      // Tax is included: 110000 * 10 / 110 = 10000
      const tax = calculateInclusiveTax(total)
      expect(tax).toBe(10000)

      // The payment is for the full amount (tax included)
      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: total,
        cashReceived: total,
      }

      const result = await processPayment('order-004', paymentInput, 'user-001', undefined, total)
      expect(result.success).toBe(true)
      expect(result.change).toBe(0)
    })
  })

  // ===========================================
  // 2. Split payment
  // ===========================================
  describe('split payment', () => {
    it('should complete split payment with cash + card', async () => {
      addItemToCart(makeProduct({ retail_price: 75000 }), 2) // 150000 total

      const total = useCartStore.getState().total
      expect(total).toBe(150000)

      // Split: 100000 cash + 50000 card
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 100000, cashReceived: 100000 },
        { method: 'card', amount: 50000, reference: 'CARD-001' },
      ]

      // Validate split payments
      const validation = validateSplitPayments(inputs, total)
      expect(validation.valid).toBe(true)

      // Process split payment
      const result = await processSplitPayment('order-005', inputs, 'user-001', 'session-001', total)

      expect(result.success).toBe(true)
      expect(result.paymentId).toMatch(/^LOCAL-PAY-/)
    })

    it('should track split payment state machine', () => {
      addItemToCart(makeProduct({ retail_price: 100000 }))

      const total = useCartStore.getState().total

      // Initialize state
      let state = createSplitPaymentState(total)
      expect(state.status).toBe('idle')
      expect(state.remainingAmount).toBe(100000)

      // Add first payment (cash 60000)
      state = addPaymentToState(state, { method: 'cash', amount: 60000 }, total)
      expect(state.status).toBe('adding')
      expect(state.totalPaid).toBe(60000)
      expect(state.remainingAmount).toBe(40000)

      // Add second payment (card 40000)
      state = addPaymentToState(state, { method: 'card', amount: 40000 }, total)
      expect(state.status).toBe('complete')
      expect(state.totalPaid).toBe(100000)
      expect(state.remainingAmount).toBe(0)
    })

    it('should reject split payments that do not total the order amount', () => {
      addItemToCart(makeProduct({ retail_price: 100000 }))

      const total = useCartStore.getState().total
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 50000, cashReceived: 50000 },
        { method: 'card', amount: 30000 },
      ]

      const validation = validateSplitPayments(inputs, total)
      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('less than order total'))).toBe(true)
    })

    it('should handle three-way split payment', async () => {
      addItemToCart(makeProduct({ retail_price: 50000 }), 3) // 150000 total

      const total = useCartStore.getState().total
      expect(total).toBe(150000)

      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 50000, cashReceived: 50000 },
        { method: 'qris', amount: 50000, reference: 'QRIS-001' },
        { method: 'card', amount: 50000, reference: 'CARD-002' },
      ]

      const validation = validateSplitPayments(inputs, total)
      expect(validation.valid).toBe(true)

      const result = await processSplitPayment('order-006', inputs, 'user-001', undefined, total)
      expect(result.success).toBe(true)
    })
  })

  // ===========================================
  // 3. Payment with change
  // ===========================================
  describe('payment with change', () => {
    it('should calculate correct change rounded to 100 IDR', () => {
      // Cash: 100000, Amount: 85000 -> Change: 15000
      expect(calculateChange(100000, 85000)).toBe(15000)
    })

    it('should round change down to nearest 100 IDR', () => {
      // Cash: 100000, Amount: 85050 -> Raw change: 14950 -> Floor to 14900
      expect(calculateChange(100000, 85050)).toBe(14900)
    })

    it('should return 0 change when exact payment', () => {
      expect(calculateChange(50000, 50000)).toBe(0)
    })

    it('should return 0 change when cash is less than amount (underpay)', () => {
      expect(calculateChange(30000, 50000)).toBe(0)
    })

    it('should handle typical bakery transaction change', async () => {
      // Customer buys 2 croissants (25000 each) = 50000
      // Pays with 100000 note -> change = 50000
      addItemToCart(makeProduct({ retail_price: 25000 }), 2)

      const total = useCartStore.getState().total
      expect(total).toBe(50000)

      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: total,
        cashReceived: 100000,
      }

      const result = await processPayment('order-007', paymentInput, 'user-001', undefined, total)

      expect(result.success).toBe(true)
      expect(result.change).toBe(50000) // 100000 - 50000
    })

    it('should round down small change amounts', async () => {
      // Product: 27300 IDR, cash: 30000 -> raw change: 2700 -> floor to 2700 (already multiple of 100)
      addItemToCart(makeProduct({ retail_price: 27300 }))

      const total = useCartStore.getState().total

      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: total,
        cashReceived: 30000,
      }

      const result = await processPayment('order-008', paymentInput, 'user-001', undefined, total)

      expect(result.success).toBe(true)
      expect(result.change).toBe(2700) // floor(2700/100)*100 = 2700
    })

    it('should round change: 50150 paid on 50000 order -> change 100 not 150', () => {
      // calculateChange(cashReceived=50150, amount=50000) -> raw=150 -> floor(150/100)*100=100
      expect(calculateChange(50150, 50000)).toBe(100)
    })

    it('should handle split payment with change on cash portion', async () => {
      addItemToCart(makeProduct({ retail_price: 100000 }))

      const total = useCartStore.getState().total
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 60000, cashReceived: 70000 }, // 10000 change
        { method: 'card', amount: 40000, reference: 'CARD-X' },
      ]

      const validation = validateSplitPayments(inputs, total)
      expect(validation.valid).toBe(true)

      const result = await processSplitPayment('order-009', inputs, 'user-001', undefined, total)

      expect(result.success).toBe(true)
      expect(result.change).toBe(10000) // Change from cash portion
    })
  })

  // ===========================================
  // 4. Discount + payment
  // ===========================================
  describe('discount + payment', () => {
    it('should complete checkout with percentage discount applied', async () => {
      addItemToCart(makeProduct({ retail_price: 100000 }))

      // Apply 10% discount
      useCartStore.getState().setDiscount('percent', 10, 'Staff discount')

      const state = useCartStore.getState()
      expect(state.subtotal).toBe(100000)
      expect(state.discountAmount).toBe(10000)
      expect(state.total).toBe(90000)

      // Pay the discounted total
      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: state.total,
        cashReceived: 100000,
      }

      const validation = validatePayment(paymentInput, state.total)
      expect(validation.valid).toBe(true)

      const result = await processPayment('order-010', paymentInput, 'user-001', undefined, state.total)
      expect(result.success).toBe(true)
      expect(result.change).toBe(10000) // 100000 - 90000
    })

    it('should complete checkout with fixed amount discount', async () => {
      addItemToCart(makeProduct({ retail_price: 50000 }), 3) // subtotal 150000

      // Apply 20000 IDR discount
      useCartStore.getState().setDiscount('amount', 20000, 'Loyalty reward')

      const state = useCartStore.getState()
      expect(state.subtotal).toBe(150000)
      expect(state.discountAmount).toBe(20000)
      expect(state.total).toBe(130000)

      // Verify tax on discounted amount
      const tax = calculateInclusiveTax(state.total)
      // 130000 * 10 / 110 = 11818.18... -> 11818
      expect(tax).toBe(11818)

      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: state.total,
        cashReceived: 150000,
      }

      const result = await processPayment('order-011', paymentInput, 'user-001', undefined, state.total)
      expect(result.success).toBe(true)
      expect(result.change).toBe(20000) // 150000 - 130000
    })

    it('should handle discount + split payment', async () => {
      addItemToCart(makeProduct({ retail_price: 100000 }))

      useCartStore.getState().setDiscount('percent', 20, 'Promo')

      const state = useCartStore.getState()
      expect(state.total).toBe(80000) // 100000 - 20%

      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 50000, cashReceived: 50000 },
        { method: 'qris', amount: 30000, reference: 'QRIS-X' },
      ]

      const validation = validateSplitPayments(inputs, state.total)
      expect(validation.valid).toBe(true)

      const result = await processSplitPayment('order-012', inputs, 'user-001', undefined, state.total)
      expect(result.success).toBe(true)
    })

    it('should handle promotion discount + manual discount + payment', async () => {
      addItemToCart(makeProduct({ retail_price: 100000 }))

      // Apply promotion: 10000 off
      useCartStore.getState().setPromotionResult({
        itemDiscounts: [],
        totalDiscount: 10000,
        appliedPromotions: [
          { promotionId: 'p1', promotionName: 'Welcome', promotionCode: 'WELCOME', totalDiscount: 10000 },
        ],
      })

      // Apply manual discount: 5%
      useCartStore.getState().setDiscount('percent', 5, 'Manager')

      const state = useCartStore.getState()
      // subtotal = 100000
      // promotion discount = 10000
      // manual discount = 100000 * 5% = 5000
      // total = 100000 - 10000 - 5000 = 85000
      expect(state.total).toBe(85000)

      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: state.total,
        cashReceived: 100000,
      }

      const result = await processPayment('order-013', paymentInput, 'user-001', undefined, state.total)
      expect(result.success).toBe(true)
      expect(result.change).toBe(15000) // 100000 - 85000
    })
  })

  // ===========================================
  // 5. Offline payment
  // ===========================================
  describe('offline payment', () => {
    it('should process payment offline (queued in IndexedDB)', async () => {
      const { saveOfflinePayment } = await import('@/services/offline/offlinePaymentService')

      addItemToCart(makeProduct({ retail_price: 50000 }))

      const total = useCartStore.getState().total
      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: total,
        cashReceived: 50000,
      }

      const result = await processPayment('offline-order-001', paymentInput, 'user-001', undefined, total)

      expect(result.success).toBe(true)
      expect(result.paymentId).toMatch(/^LOCAL-PAY-/)

      // Verify saveOfflinePayment was called (payment stored in IndexedDB)
      expect(saveOfflinePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'offline-order-001',
          method: 'cash',
          amount: 50000,
          user_id: 'user-001',
        })
      )
    })

    it('should process split payment offline with correct structure', async () => {
      const { saveOfflinePayments } = await import('@/services/offline/offlinePaymentService')

      addItemToCart(makeProduct({ retail_price: 100000 }))

      const total = useCartStore.getState().total
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 60000, cashReceived: 60000 },
        { method: 'card', amount: 40000, reference: 'CARD-OFF-1' },
      ]

      const result = await processSplitPayment('offline-order-002', inputs, 'user-offline', undefined, total)

      expect(result.success).toBe(true)

      // Verify saveOfflinePayments was called with both payment entries
      expect(saveOfflinePayments).toHaveBeenCalledWith(
        'offline-order-002',
        expect.arrayContaining([
          expect.objectContaining({ method: 'cash', amount: 60000 }),
          expect.objectContaining({ method: 'card', amount: 40000 }),
        ])
      )
    })

    it('should set correct sync status based on payment method', async () => {
      const { saveOfflinePayment } = await import('@/services/offline/offlinePaymentService')

      addItemToCart(makeProduct({ retail_price: 50000 }))
      const total = useCartStore.getState().total

      // Cash payment
      await processPayment('order-cash', { method: 'cash', amount: total, cashReceived: total }, 'user-001', undefined, total)

      // The mock returns 'pending_sync' for cash
      const cashCall = (saveOfflinePayment as ReturnType<typeof vi.fn>).mock.results[0]
      const cashPayment = await cashCall.value
      expect(cashPayment.sync_status).toBe('pending_sync')
    })

    it('should handle payment processing error gracefully', async () => {
      const { saveOfflinePayment } = await import('@/services/offline/offlinePaymentService')

      // Make saveOfflinePayment throw an error
      ;(saveOfflinePayment as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('IndexedDB quota exceeded')
      )

      addItemToCart(makeProduct({ retail_price: 50000 }))
      const total = useCartStore.getState().total

      const result = await processPayment(
        'order-fail',
        { method: 'cash', amount: total, cashReceived: total },
        'user-001',
        undefined,
        total
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('IndexedDB quota exceeded')
    })

    it('should reject invalid payment even when offline', async () => {
      addItemToCart(makeProduct({ retail_price: 50000 }))

      // Zero amount should be rejected by validation
      const result = await processPayment(
        'order-invalid',
        { method: 'cash', amount: 0 },
        'user-001',
        undefined,
        50000
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Payment amount must be greater than 0')
    })
  })

  // ===========================================
  // 6. End-to-end flow with modifiers
  // ===========================================
  describe('checkout with modifiers', () => {
    it('should calculate correct total with modifiers and process payment', async () => {
      const product = makeProduct({ retail_price: 30000 })
      const modifiers: CartModifier[] = [
        { groupName: 'Milk', optionId: 'oat', optionLabel: 'Oat Milk', priceAdjustment: 5000 },
        { groupName: 'Size', optionId: 'lg', optionLabel: 'Large', priceAdjustment: 10000 },
      ]

      useCartStore.getState().addItem(product, 2, modifiers, 'Extra hot', undefined)

      const state = useCartStore.getState()
      // (30000 + 5000 + 10000) * 2 = 90000
      expect(state.subtotal).toBe(90000)
      expect(state.total).toBe(90000)

      const paymentInput: IPaymentInput = {
        method: 'cash',
        amount: state.total,
        cashReceived: 100000,
      }

      const result = await processPayment('order-mod', paymentInput, 'user-001', undefined, state.total)

      expect(result.success).toBe(true)
      expect(result.change).toBe(10000) // 100000 - 90000
    })
  })
})
