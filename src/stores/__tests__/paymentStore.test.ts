/**
 * PaymentStore Tests
 *
 * Comprehensive tests for the Zustand payment store covering:
 * - Initial state values
 * - initialize() with order total
 * - setCurrentMethod() with all payment methods
 * - setCurrentAmount() for manual amount entry
 * - addPayment() for single and split payments
 * - removePayment() to remove from split list
 * - reset() to clear all state
 * - isComplete() computed check
 * - canAddPayment() computed check
 * - getPaymentInputs() for processing
 * - Split payment flow (multiple methods for one order)
 * - IDR rounding edge cases
 * - Edge cases: zero, negative, overpayment, partial
 *
 * Business rules:
 *   - Currency: IDR, rounded to nearest 100
 *   - Tax: 10% included in prices (tax = total * 10/110)
 *   - Split payments: multiple payment methods for a single order
 *   - Rounding tolerance: <= 1 IDR treated as complete
 *
 * @see src/stores/paymentStore.ts
 * @see src/types/payment.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePaymentStore } from '@/stores/paymentStore';
import type { TPaymentMethod, IPaymentInput } from '@/types/payment';

// =====================================================
// Constants
// =====================================================

/** Typical bakery order total in IDR */
const ORDER_TOTAL = 150000;

/** Smaller order for simple tests */
const SMALL_ORDER = 25000;

// =====================================================
// Test Helpers
// =====================================================

/**
 * Create a payment input fixture.
 */
function makePaymentInput(overrides: Partial<IPaymentInput> = {}): IPaymentInput {
  return {
    method: 'cash',
    amount: ORDER_TOTAL,
    ...overrides,
  };
}

/**
 * Initialize the store with a given total and return state accessor.
 */
function initStore(total: number = ORDER_TOTAL) {
  usePaymentStore.getState().initialize(total);
  return usePaymentStore.getState();
}


// =====================================================
// Initial State
// =====================================================

const initialState = {
  orderTotal: 0,
  payments: [],
  totalPaid: 0,
  remainingAmount: 0,
  status: 'idle',
  currentMethod: null,
  currentAmount: 0,
};

// =====================================================
// Tests
// =====================================================

describe('paymentStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    usePaymentStore.getState().reset();
  });

  // ---------------------------------------------------
  // Initial State
  // ---------------------------------------------------

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = usePaymentStore.getState();

      expect(state.orderTotal).toBe(0);
      expect(state.payments).toEqual([]);
      expect(state.totalPaid).toBe(0);
      expect(state.remainingAmount).toBe(0);
      expect(state.status).toBe('idle');
      expect(state.currentMethod).toBeNull();
      expect(state.currentAmount).toBe(0);
    });

    it('should expose all expected actions', () => {
      const state = usePaymentStore.getState();

      expect(typeof state.initialize).toBe('function');
      expect(typeof state.setCurrentMethod).toBe('function');
      expect(typeof state.setCurrentAmount).toBe('function');
      expect(typeof state.addPayment).toBe('function');
      expect(typeof state.removePayment).toBe('function');
      expect(typeof state.reset).toBe('function');
      expect(typeof state.isComplete).toBe('function');
      expect(typeof state.canAddPayment).toBe('function');
      expect(typeof state.getPaymentInputs).toBe('function');
    });
  });

  // ---------------------------------------------------
  // initialize()
  // ---------------------------------------------------

  describe('initialize', () => {
    it('should set orderTotal and remainingAmount', () => {
      const state = initStore(ORDER_TOTAL);

      expect(state.orderTotal).toBe(ORDER_TOTAL);
      expect(state.remainingAmount).toBe(ORDER_TOTAL);
    });

    it('should reset all other state to initial values', () => {
      // First, dirty the state
      usePaymentStore.getState().initialize(50000);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 30000 }));
      usePaymentStore.getState().setCurrentMethod('card');

      // Now re-initialize with a new total
      usePaymentStore.getState().initialize(ORDER_TOTAL);
      const state = usePaymentStore.getState();

      expect(state.orderTotal).toBe(ORDER_TOTAL);
      expect(state.payments).toEqual([]);
      expect(state.totalPaid).toBe(0);
      expect(state.remainingAmount).toBe(ORDER_TOTAL);
      expect(state.status).toBe('idle');
      expect(state.currentMethod).toBeNull();
      expect(state.currentAmount).toBe(0);
    });

    it('should handle zero total', () => {
      const state = initStore(0);

      expect(state.orderTotal).toBe(0);
      expect(state.remainingAmount).toBe(0);
    });

    it('should handle a typical IDR order total', () => {
      const state = initStore(275500);

      expect(state.orderTotal).toBe(275500);
      expect(state.remainingAmount).toBe(275500);
    });
  });

  // ---------------------------------------------------
  // setCurrentMethod()
  // ---------------------------------------------------

  describe('setCurrentMethod', () => {
    beforeEach(() => {
      initStore(ORDER_TOTAL);
    });

    it('should set the current method to cash', () => {
      usePaymentStore.getState().setCurrentMethod('cash');
      const state = usePaymentStore.getState();

      expect(state.currentMethod).toBe('cash');
    });

    it('should set status to adding when method is selected', () => {
      usePaymentStore.getState().setCurrentMethod('cash');

      expect(usePaymentStore.getState().status).toBe('adding');
    });

    it('should pre-fill currentAmount with remainingAmount for non-cash methods', () => {
      usePaymentStore.getState().setCurrentMethod('card');
      expect(usePaymentStore.getState().currentAmount).toBe(ORDER_TOTAL);

      usePaymentStore.getState().setCurrentMethod('qris');
      expect(usePaymentStore.getState().currentAmount).toBe(ORDER_TOTAL);

      usePaymentStore.getState().setCurrentMethod('transfer');
      expect(usePaymentStore.getState().currentAmount).toBe(ORDER_TOTAL);

      usePaymentStore.getState().setCurrentMethod('edc');
      expect(usePaymentStore.getState().currentAmount).toBe(ORDER_TOTAL);

      usePaymentStore.getState().setCurrentMethod('store_credit');
      expect(usePaymentStore.getState().currentAmount).toBe(ORDER_TOTAL);
    });

    it('should set currentAmount to 0 for cash method', () => {
      usePaymentStore.getState().setCurrentMethod('cash');
      expect(usePaymentStore.getState().currentAmount).toBe(0);
    });

    it('should pre-fill with updated remainingAmount after partial payment', () => {
      // Add a partial cash payment
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));

      // Now select card - should pre-fill with remaining 100000
      usePaymentStore.getState().setCurrentMethod('card');
      expect(usePaymentStore.getState().currentAmount).toBe(100000);
    });

    it('should clear method when set to null', () => {
      usePaymentStore.getState().setCurrentMethod('cash');
      usePaymentStore.getState().setCurrentMethod(null);

      const state = usePaymentStore.getState();
      expect(state.currentMethod).toBeNull();
      expect(state.currentAmount).toBe(0);
    });

    it('should revert status to idle when method cleared from adding state', () => {
      usePaymentStore.getState().setCurrentMethod('cash');
      expect(usePaymentStore.getState().status).toBe('adding');

      usePaymentStore.getState().setCurrentMethod(null);
      expect(usePaymentStore.getState().status).toBe('idle');
    });

    it.each<TPaymentMethod>(['cash', 'card', 'qris', 'edc', 'transfer', 'store_credit'])(
      'should accept %s as a valid payment method',
      (method) => {
        usePaymentStore.getState().setCurrentMethod(method);
        expect(usePaymentStore.getState().currentMethod).toBe(method);
      }
    );
  });

  // ---------------------------------------------------
  // setCurrentAmount()
  // ---------------------------------------------------

  describe('setCurrentAmount', () => {
    beforeEach(() => {
      initStore(ORDER_TOTAL);
    });

    it('should set the current amount', () => {
      usePaymentStore.getState().setCurrentAmount(50000);
      expect(usePaymentStore.getState().currentAmount).toBe(50000);
    });

    it('should allow setting to zero', () => {
      usePaymentStore.getState().setCurrentAmount(0);
      expect(usePaymentStore.getState().currentAmount).toBe(0);
    });

    it('should allow amounts exceeding order total (overpayment for cash)', () => {
      usePaymentStore.getState().setCurrentAmount(200000);
      expect(usePaymentStore.getState().currentAmount).toBe(200000);
    });

    it('should allow setting amount multiple times', () => {
      usePaymentStore.getState().setCurrentAmount(10000);
      expect(usePaymentStore.getState().currentAmount).toBe(10000);

      usePaymentStore.getState().setCurrentAmount(75000);
      expect(usePaymentStore.getState().currentAmount).toBe(75000);
    });
  });

  // ---------------------------------------------------
  // addPayment()
  // ---------------------------------------------------

  describe('addPayment', () => {
    beforeEach(() => {
      initStore(ORDER_TOTAL);
    });

    it('should add a payment to the list', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      const state = usePaymentStore.getState();

      expect(state.payments).toHaveLength(1);
      expect(state.payments[0].method).toBe('cash');
      expect(state.payments[0].amount).toBe(50000);
    });

    it('should generate a unique id for each payment', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));

      const state = usePaymentStore.getState();
      expect(state.payments[0].id).toBeDefined();
      expect(state.payments[1].id).toBeDefined();
      expect(state.payments[0].id).not.toBe(state.payments[1].id);
    });

    it('should set timestamp on added payment', () => {
      const before = Date.now();
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      const after = Date.now();

      const payment = usePaymentStore.getState().payments[0];
      expect(payment.timestamp).toBeGreaterThanOrEqual(before);
      expect(payment.timestamp).toBeLessThanOrEqual(after);
    });

    it('should update totalPaid correctly', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      expect(usePaymentStore.getState().totalPaid).toBe(50000);

      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 60000 }));
      expect(usePaymentStore.getState().totalPaid).toBe(110000);
    });

    it('should update remainingAmount correctly', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      expect(usePaymentStore.getState().remainingAmount).toBe(100000);

      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 60000 }));
      expect(usePaymentStore.getState().remainingAmount).toBe(40000);
    });

    it('should set remainingAmount to 0 when fully paid', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().remainingAmount).toBe(0);
    });

    it('should not allow negative remainingAmount (overpayment clamped to 0)', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL + 50000 }));
      expect(usePaymentStore.getState().remainingAmount).toBe(0);
    });

    it('should set status to complete when fully paid', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().status).toBe('complete');
    });

    it('should set status to complete when remaining <= 1 IDR (rounding tolerance)', () => {
      // Pay 1 IDR less than total - within tolerance
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL - 1 }));
      expect(usePaymentStore.getState().status).toBe('complete');
    });

    it('should keep status as adding when remaining > 1 IDR', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL - 2 }));
      expect(usePaymentStore.getState().status).toBe('adding');
    });

    it('should clear currentMethod and currentAmount after adding', () => {
      usePaymentStore.getState().setCurrentMethod('cash');
      usePaymentStore.getState().setCurrentAmount(50000);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));

      const state = usePaymentStore.getState();
      expect(state.currentMethod).toBeNull();
      expect(state.currentAmount).toBe(0);
    });

    it('should preserve cashReceived on cash payment', () => {
      usePaymentStore.getState().addPayment(
        makePaymentInput({ amount: ORDER_TOTAL, cashReceived: 200000 })
      );

      const payment = usePaymentStore.getState().payments[0];
      expect(payment.cashReceived).toBe(200000);
    });

    it('should preserve reference on non-cash payment', () => {
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'transfer', amount: ORDER_TOTAL, reference: 'TRF-001' })
      );

      const payment = usePaymentStore.getState().payments[0];
      expect(payment.reference).toBe('TRF-001');
    });

    it('should preserve isOffline flag', () => {
      usePaymentStore.getState().addPayment(
        makePaymentInput({ amount: ORDER_TOTAL, isOffline: true })
      );

      const payment = usePaymentStore.getState().payments[0];
      expect(payment.isOffline).toBe(true);
    });
  });

  // ---------------------------------------------------
  // removePayment()
  // ---------------------------------------------------

  describe('removePayment', () => {
    beforeEach(() => {
      initStore(ORDER_TOTAL);
    });

    it('should remove a payment by id', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 60000 }));

      const paymentId = usePaymentStore.getState().payments[0].id;
      usePaymentStore.getState().removePayment(paymentId);

      const state = usePaymentStore.getState();
      expect(state.payments).toHaveLength(1);
      expect(state.payments[0].method).toBe('card');
    });

    it('should recalculate totalPaid after removal', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 60000 }));

      const paymentId = usePaymentStore.getState().payments[0].id;
      usePaymentStore.getState().removePayment(paymentId);

      expect(usePaymentStore.getState().totalPaid).toBe(60000);
    });

    it('should recalculate remainingAmount after removal', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 60000 }));

      const paymentId = usePaymentStore.getState().payments[0].id;
      usePaymentStore.getState().removePayment(paymentId);

      expect(usePaymentStore.getState().remainingAmount).toBe(90000);
    });

    it('should set status to idle when all payments removed', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().status).toBe('complete');

      const paymentId = usePaymentStore.getState().payments[0].id;
      usePaymentStore.getState().removePayment(paymentId);

      expect(usePaymentStore.getState().status).toBe('idle');
      expect(usePaymentStore.getState().payments).toHaveLength(0);
    });

    it('should set status to adding when some payments remain', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 100000 }));
      expect(usePaymentStore.getState().status).toBe('complete');

      // Remove the second payment - now only 50000 paid of 150000
      const secondId = usePaymentStore.getState().payments[1].id;
      usePaymentStore.getState().removePayment(secondId);

      expect(usePaymentStore.getState().status).toBe('adding');
    });

    it('should do nothing when removing a non-existent id', () => {
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));

      usePaymentStore.getState().removePayment('non-existent-id');

      const state = usePaymentStore.getState();
      expect(state.payments).toHaveLength(1);
      expect(state.totalPaid).toBe(50000);
    });
  });

  // ---------------------------------------------------
  // reset()
  // ---------------------------------------------------

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Set up some state
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().setCurrentMethod('card');
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 50000 }));

      // Reset
      usePaymentStore.getState().reset();

      const state = usePaymentStore.getState();
      expect(state.orderTotal).toBe(initialState.orderTotal);
      expect(state.payments).toEqual(initialState.payments);
      expect(state.totalPaid).toBe(initialState.totalPaid);
      expect(state.remainingAmount).toBe(initialState.remainingAmount);
      expect(state.status).toBe(initialState.status);
      expect(state.currentMethod).toBe(initialState.currentMethod);
      expect(state.currentAmount).toBe(initialState.currentAmount);
    });

    it('should be callable multiple times without error', () => {
      usePaymentStore.getState().reset();
      usePaymentStore.getState().reset();
      usePaymentStore.getState().reset();

      const state = usePaymentStore.getState();
      expect(state.orderTotal).toBe(0);
    });
  });

  // ---------------------------------------------------
  // isComplete()
  // ---------------------------------------------------

  describe('isComplete', () => {
    it('should return false when no payments made', () => {
      initStore(ORDER_TOTAL);
      expect(usePaymentStore.getState().isComplete()).toBe(false);
    });

    it('should return false when partially paid', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      expect(usePaymentStore.getState().isComplete()).toBe(false);
    });

    it('should return true when exact amount paid', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().isComplete()).toBe(true);
    });

    it('should return true when overpaid', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL + 10000 }));
      expect(usePaymentStore.getState().isComplete()).toBe(true);
    });

    it('should return true when remaining is exactly 1 IDR (rounding tolerance)', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL - 1 }));
      expect(usePaymentStore.getState().isComplete()).toBe(true);
    });

    it('should return false when remaining is 2 IDR', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL - 2 }));
      expect(usePaymentStore.getState().isComplete()).toBe(false);
    });

    it('should return true for zero total order', () => {
      initStore(0);
      // remainingAmount is 0 which is <= 1
      expect(usePaymentStore.getState().isComplete()).toBe(true);
    });
  });

  // ---------------------------------------------------
  // canAddPayment()
  // ---------------------------------------------------

  describe('canAddPayment', () => {
    it('should return false when store is in initial state (total is 0)', () => {
      // remainingAmount is 0 which is <= 1
      expect(usePaymentStore.getState().canAddPayment()).toBe(false);
    });

    it('should return true when initialized with amount and nothing paid', () => {
      initStore(ORDER_TOTAL);
      expect(usePaymentStore.getState().canAddPayment()).toBe(true);
    });

    it('should return true when partially paid', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      expect(usePaymentStore.getState().canAddPayment()).toBe(true);
    });

    it('should return false when fully paid', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().canAddPayment()).toBe(false);
    });

    it('should return false when status is complete', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().status).toBe('complete');
      expect(usePaymentStore.getState().canAddPayment()).toBe(false);
    });

    it('should return true again after removing a payment from complete state', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 100000 }));
      expect(usePaymentStore.getState().canAddPayment()).toBe(false);

      // Remove one payment
      const secondId = usePaymentStore.getState().payments[1].id;
      usePaymentStore.getState().removePayment(secondId);

      expect(usePaymentStore.getState().canAddPayment()).toBe(true);
    });
  });

  // ---------------------------------------------------
  // getPaymentInputs()
  // ---------------------------------------------------

  describe('getPaymentInputs', () => {
    it('should return empty array when no payments', () => {
      initStore(ORDER_TOTAL);
      expect(usePaymentStore.getState().getPaymentInputs()).toEqual([]);
    });

    it('should return payment inputs without id and timestamp', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(
        makePaymentInput({ amount: ORDER_TOTAL, cashReceived: 200000 })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs).toHaveLength(1);
      expect(inputs[0]).toEqual({
        method: 'cash',
        amount: ORDER_TOTAL,
        cashReceived: 200000,
        reference: undefined,
        isOffline: undefined,
      });

      // Ensure internal fields are stripped
      expect((inputs[0] as unknown as Record<string, unknown>).id).toBeUndefined();
      expect((inputs[0] as unknown as Record<string, unknown>).timestamp).toBeUndefined();
    });

    it('should return multiple payment inputs in order', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'card', amount: 60000, reference: 'CARD-001' })
      );
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'qris', amount: 40000, reference: 'QRIS-001' })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs).toHaveLength(3);
      expect(inputs[0].method).toBe('cash');
      expect(inputs[1].method).toBe('card');
      expect(inputs[2].method).toBe('qris');
    });

    it('should include isOffline flag when set', () => {
      initStore(SMALL_ORDER);
      usePaymentStore.getState().addPayment(
        makePaymentInput({ amount: SMALL_ORDER, isOffline: true })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs[0].isOffline).toBe(true);
    });
  });

  // ---------------------------------------------------
  // Split Payment Flow (Integration)
  // ---------------------------------------------------

  describe('split payment flow', () => {
    it('should handle a two-way split (cash + card)', () => {
      initStore(ORDER_TOTAL);

      // First split: cash 80000
      usePaymentStore.getState().setCurrentMethod('cash');
      usePaymentStore.getState().setCurrentAmount(80000);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 80000 }));

      let state = usePaymentStore.getState();
      expect(state.totalPaid).toBe(80000);
      expect(state.remainingAmount).toBe(70000);
      expect(state.status).toBe('adding');

      // Second split: card for remaining
      usePaymentStore.getState().setCurrentMethod('card');
      expect(usePaymentStore.getState().currentAmount).toBe(70000); // auto-filled
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'card', amount: 70000, reference: 'CARD-REF' })
      );

      state = usePaymentStore.getState();
      expect(state.totalPaid).toBe(ORDER_TOTAL);
      expect(state.remainingAmount).toBe(0);
      expect(state.status).toBe('complete');
      expect(state.isComplete()).toBe(true);
      expect(state.canAddPayment()).toBe(false);
      expect(state.payments).toHaveLength(2);
    });

    it('should handle a three-way split (cash + card + qris)', () => {
      initStore(ORDER_TOTAL);

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'card', amount: 60000 })
      );
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'qris', amount: 40000 })
      );

      const state = usePaymentStore.getState();
      expect(state.totalPaid).toBe(ORDER_TOTAL);
      expect(state.remainingAmount).toBe(0);
      expect(state.status).toBe('complete');
      expect(state.payments).toHaveLength(3);
    });

    it('should handle removing middle payment and adding replacement', () => {
      initStore(ORDER_TOTAL);

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 60000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'qris', amount: 40000 }));

      // Remove the card payment
      const cardPaymentId = usePaymentStore.getState().payments[1].id;
      usePaymentStore.getState().removePayment(cardPaymentId);

      let state = usePaymentStore.getState();
      expect(state.totalPaid).toBe(90000);
      expect(state.remainingAmount).toBe(60000);
      expect(state.status).toBe('adding');

      // Add replacement transfer payment
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'transfer', amount: 60000, reference: 'TRF-001' })
      );

      state = usePaymentStore.getState();
      expect(state.totalPaid).toBe(ORDER_TOTAL);
      expect(state.status).toBe('complete');
    });
  });

  // ---------------------------------------------------
  // IDR Rounding & Edge Cases
  // ---------------------------------------------------

  describe('IDR rounding and edge cases', () => {
    it('should handle typical IDR amounts (multiples of 100)', () => {
      initStore(155000); // 155,000 IDR

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 100000 }));
      expect(usePaymentStore.getState().remainingAmount).toBe(55000);

      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 55000 }));
      expect(usePaymentStore.getState().remainingAmount).toBe(0);
      expect(usePaymentStore.getState().isComplete()).toBe(true);
    });

    it('should handle fractional IDR amounts with 1 IDR tolerance', () => {
      // Scenario: order total 33333 IDR (unusual but possible from rounding)
      initStore(33333);

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 33332 }));
      // 33333 - 33332 = 1, which is <= 1 tolerance
      expect(usePaymentStore.getState().remainingAmount).toBe(1);
      expect(usePaymentStore.getState().isComplete()).toBe(true);
      expect(usePaymentStore.getState().status).toBe('complete');
    });

    it('should handle overpayment (cash rounding up)', () => {
      // Customer pays 200000 for 150000 order
      initStore(ORDER_TOTAL);

      usePaymentStore.getState().addPayment(
        makePaymentInput({ amount: ORDER_TOTAL, cashReceived: 200000 })
      );

      const state = usePaymentStore.getState();
      expect(state.totalPaid).toBe(ORDER_TOTAL);
      expect(state.remainingAmount).toBe(0);
      expect(state.isComplete()).toBe(true);
    });

    it('should handle very small order total', () => {
      initStore(100); // Minimum practical IDR amount

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 100 }));

      expect(usePaymentStore.getState().isComplete()).toBe(true);
      expect(usePaymentStore.getState().remainingAmount).toBe(0);
    });

    it('should handle very large order total', () => {
      const largeTotal = 50000000; // 50 million IDR
      initStore(largeTotal);

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 30000000 }));
      expect(usePaymentStore.getState().remainingAmount).toBe(20000000);

      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'transfer', amount: 20000000 }));
      expect(usePaymentStore.getState().isComplete()).toBe(true);
    });

    it('should clamp remainingAmount to 0 when overpaying in split', () => {
      initStore(ORDER_TOTAL);

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 80000 }));
      // Second payment exceeds remaining
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 80000 }));

      const state = usePaymentStore.getState();
      expect(state.totalPaid).toBe(160000); // Total paid tracks actual amount
      expect(state.remainingAmount).toBe(0); // Clamped to 0
      expect(state.isComplete()).toBe(true);
    });
  });

  // ---------------------------------------------------
  // State Transitions
  // ---------------------------------------------------

  describe('status transitions', () => {
    it('should follow idle -> adding -> complete flow', () => {
      initStore(ORDER_TOTAL);
      expect(usePaymentStore.getState().status).toBe('idle');

      usePaymentStore.getState().setCurrentMethod('cash');
      expect(usePaymentStore.getState().status).toBe('adding');

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().status).toBe('complete');
    });

    it('should go back to adding after partial payment', () => {
      initStore(ORDER_TOTAL);

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));
      expect(usePaymentStore.getState().status).toBe('adding');
    });

    it('should go from complete to adding when a payment is removed (partial)', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 80000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 70000 }));
      expect(usePaymentStore.getState().status).toBe('complete');

      const secondId = usePaymentStore.getState().payments[1].id;
      usePaymentStore.getState().removePayment(secondId);
      expect(usePaymentStore.getState().status).toBe('adding');
    });

    it('should go from complete to idle when all payments removed', () => {
      initStore(SMALL_ORDER);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: SMALL_ORDER }));
      expect(usePaymentStore.getState().status).toBe('complete');

      const paymentId = usePaymentStore.getState().payments[0].id;
      usePaymentStore.getState().removePayment(paymentId);
      expect(usePaymentStore.getState().status).toBe('idle');
    });

    it('should not change non-adding status when clearing method', () => {
      initStore(ORDER_TOTAL);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: ORDER_TOTAL }));
      expect(usePaymentStore.getState().status).toBe('complete');

      // Clearing method from complete state should keep complete
      usePaymentStore.getState().setCurrentMethod(null);
      expect(usePaymentStore.getState().status).toBe('complete');
    });
  });

  // ---------------------------------------------------
  // Tax Calculation Context
  // ---------------------------------------------------

  describe('tax-inclusive total context', () => {
    it('should work correctly with tax-inclusive pricing (10% included)', () => {
      // A 110,000 IDR order includes 10,000 IDR tax (10/110)
      const taxInclusiveTotal = 110000;
      const expectedTax = Math.round(taxInclusiveTotal * 10 / 110);

      initStore(taxInclusiveTotal);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: taxInclusiveTotal }));

      const state = usePaymentStore.getState();
      expect(state.isComplete()).toBe(true);
      // The store handles payment amounts - tax is 10000 of the 110000
      expect(expectedTax).toBe(10000);
      expect(state.totalPaid).toBe(taxInclusiveTotal);
    });

    it('should handle split payment for tax-inclusive total', () => {
      // 55,000 IDR order (tax portion: 5000)
      const total = 55000;
      initStore(total);

      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 30000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'qris', amount: 25000 }));

      expect(usePaymentStore.getState().totalPaid).toBe(total);
      expect(usePaymentStore.getState().isComplete()).toBe(true);
    });
  });

  // ---------------------------------------------------
  // Multiple Payment Method Types
  // ---------------------------------------------------

  describe('payment method variety', () => {
    beforeEach(() => {
      initStore(ORDER_TOTAL);
    });

    it('should handle cash payment with cashReceived and change calculation', () => {
      const cashReceived = 200000;
      const change = cashReceived - ORDER_TOTAL; // 50000

      usePaymentStore.getState().addPayment(
        makePaymentInput({ amount: ORDER_TOTAL, cashReceived })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs[0].cashReceived).toBe(cashReceived);
      // Change = 200000 - 150000 = 50000 (rounded to nearest 100 is still 50000)
      expect(change).toBe(50000);
    });

    it('should handle QRIS payment with reference', () => {
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'qris', amount: ORDER_TOTAL, reference: 'QRIS-20260212-001' })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs[0].method).toBe('qris');
      expect(inputs[0].reference).toBe('QRIS-20260212-001');
    });

    it('should handle EDC payment with reference', () => {
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'edc', amount: ORDER_TOTAL, reference: 'EDC-TERMINAL-42' })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs[0].method).toBe('edc');
      expect(inputs[0].reference).toBe('EDC-TERMINAL-42');
    });

    it('should handle store credit payment', () => {
      usePaymentStore.getState().addPayment(
        makePaymentInput({ method: 'store_credit', amount: ORDER_TOTAL })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs[0].method).toBe('store_credit');
      expect(inputs[0].amount).toBe(ORDER_TOTAL);
    });

    it('should handle bank transfer payment with reference', () => {
      usePaymentStore.getState().addPayment(
        makePaymentInput({
          method: 'transfer',
          amount: ORDER_TOTAL,
          reference: 'BCA-TRF-20260212',
        })
      );

      const inputs = usePaymentStore.getState().getPaymentInputs();
      expect(inputs[0].method).toBe('transfer');
      expect(inputs[0].reference).toBe('BCA-TRF-20260212');
    });
  });

  // ---------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------

  describe('edge cases', () => {
    it('should handle addPayment when store is not initialized', () => {
      // Store is in default state (orderTotal = 0)
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 50000 }));

      const state = usePaymentStore.getState();
      expect(state.payments).toHaveLength(1);
      expect(state.totalPaid).toBe(50000);
      expect(state.remainingAmount).toBe(0); // clamped: max(0, 0 - 50000)
    });

    it('should handle rapid sequential additions', () => {
      initStore(ORDER_TOTAL);

      // Add multiple payments rapidly
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 30000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'card', amount: 30000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'qris', amount: 30000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'edc', amount: 30000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ method: 'transfer', amount: 30000 }));

      const state = usePaymentStore.getState();
      expect(state.payments).toHaveLength(5);
      expect(state.totalPaid).toBe(150000);
      expect(state.isComplete()).toBe(true);
    });

    it('should handle initialize after complete state correctly', () => {
      initStore(SMALL_ORDER);
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: SMALL_ORDER }));
      expect(usePaymentStore.getState().status).toBe('complete');

      // Start a new order
      initStore(ORDER_TOTAL);
      const state = usePaymentStore.getState();
      expect(state.orderTotal).toBe(ORDER_TOTAL);
      expect(state.payments).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.totalPaid).toBe(0);
    });

    it('should handle switching payment methods without adding', () => {
      initStore(ORDER_TOTAL);

      usePaymentStore.getState().setCurrentMethod('cash');
      usePaymentStore.getState().setCurrentAmount(100000);

      // Switch to card
      usePaymentStore.getState().setCurrentMethod('card');
      expect(usePaymentStore.getState().currentMethod).toBe('card');
      expect(usePaymentStore.getState().currentAmount).toBe(ORDER_TOTAL); // pre-filled for non-cash

      // Switch to qris
      usePaymentStore.getState().setCurrentMethod('qris');
      expect(usePaymentStore.getState().currentMethod).toBe('qris');
      expect(usePaymentStore.getState().currentAmount).toBe(ORDER_TOTAL);

      // No payments should have been added
      expect(usePaymentStore.getState().payments).toHaveLength(0);
    });

    it('should handle same method used in multiple splits', () => {
      initStore(ORDER_TOTAL);

      // Two cash payments
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 80000 }));
      usePaymentStore.getState().addPayment(makePaymentInput({ amount: 70000 }));

      const state = usePaymentStore.getState();
      expect(state.payments).toHaveLength(2);
      expect(state.payments[0].method).toBe('cash');
      expect(state.payments[1].method).toBe('cash');
      expect(state.totalPaid).toBe(ORDER_TOTAL);
      expect(state.isComplete()).toBe(true);
    });
  });
});
