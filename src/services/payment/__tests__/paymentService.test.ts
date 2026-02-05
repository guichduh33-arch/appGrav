/**
 * Payment Service Tests
 *
 * Tests for payment validation, change calculation, and split payment state management.
 */

import { describe, it, expect } from 'vitest';
import {
  validatePayment,
  validateSplitPayments,
  calculateChange,
  createSplitPaymentState,
  addPaymentToState,
  removePaymentFromState,
  resetSplitPaymentState,
} from '../paymentService';
import type { IPaymentInput } from '@/types/payment';

describe('paymentService', () => {
  describe('validatePayment', () => {
    it('should accept valid cash payment', () => {
      const input: IPaymentInput = {
        method: 'cash',
        amount: 100000,
        cashReceived: 100000,
      };

      const result = validatePayment(input, 100000);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid card payment', () => {
      const input: IPaymentInput = {
        method: 'card',
        amount: 100000,
        reference: 'CARD-12345',
      };

      const result = validatePayment(input, 100000);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero amount', () => {
      const input: IPaymentInput = {
        method: 'cash',
        amount: 0,
      };

      const result = validatePayment(input, 100000);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Payment amount must be greater than 0');
    });

    it('should reject negative amount', () => {
      const input: IPaymentInput = {
        method: 'cash',
        amount: -100,
      };

      const result = validatePayment(input, 100000);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Payment amount must be greater than 0');
    });

    it('should reject cash payment with insufficient cash received', () => {
      const input: IPaymentInput = {
        method: 'cash',
        amount: 100000,
        cashReceived: 50000,
      };

      const result = validatePayment(input, 100000);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Cash received must be at least the payment amount'
      );
    });

    it('should accept cash payment with excess cash received', () => {
      const input: IPaymentInput = {
        method: 'cash',
        amount: 100000,
        cashReceived: 150000,
      };

      const result = validatePayment(input, 100000);

      expect(result.valid).toBe(true);
    });

    it('should reject amount exceeding maximum', () => {
      const input: IPaymentInput = {
        method: 'cash',
        amount: 20_000_000_000, // 20 billion
      };

      const result = validatePayment(input, 20_000_000_000);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds maximum'))).toBe(true);
    });
  });

  describe('validateSplitPayments', () => {
    it('should accept split payments totaling order amount', () => {
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 100000, cashReceived: 100000 },
        { method: 'card', amount: 50000 },
      ];

      const result = validateSplitPayments(inputs, 150000);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty payments array', () => {
      const result = validateSplitPayments([], 100000);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one payment is required');
    });

    it('should reject split payments less than order total', () => {
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 50000, cashReceived: 50000 },
        { method: 'card', amount: 30000 },
      ];

      const result = validateSplitPayments(inputs, 150000);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('less than order total'))).toBe(
        true
      );
    });

    it('should reject split payments exceeding order total', () => {
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 100000, cashReceived: 100000 },
        { method: 'card', amount: 100000 },
      ];

      const result = validateSplitPayments(inputs, 150000);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds order total'))).toBe(
        true
      );
    });

    it('should allow 1 IDR rounding difference', () => {
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 100000, cashReceived: 100000 },
        { method: 'card', amount: 49999 },
      ];

      const result = validateSplitPayments(inputs, 150000);

      expect(result.valid).toBe(true);
    });

    it('should validate individual payments in split', () => {
      const inputs: IPaymentInput[] = [
        { method: 'cash', amount: 100000, cashReceived: 50000 }, // Invalid: cash < amount
        { method: 'card', amount: 50000 },
      ];

      const result = validateSplitPayments(inputs, 150000);

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('Payment 1:') && e.includes('Cash'))
      ).toBe(true);
    });
  });

  describe('calculateChange', () => {
    it('should calculate correct change', () => {
      expect(calculateChange(100000, 75000)).toBe(25000);
    });

    it('should return 0 when exact amount', () => {
      expect(calculateChange(100000, 100000)).toBe(0);
    });

    it('should round down to nearest 100 IDR', () => {
      expect(calculateChange(100050, 75000)).toBe(25000); // Not 25050
    });

    it('should return 0 when cash received is less', () => {
      expect(calculateChange(50000, 75000)).toBe(0);
    });

    it('should handle large amounts', () => {
      expect(calculateChange(1000000, 500000)).toBe(500000);
    });
  });

  describe('Split Payment State Machine', () => {
    describe('createSplitPaymentState', () => {
      it('should create initial state with correct values', () => {
        const state = createSplitPaymentState(150000);

        expect(state.payments).toHaveLength(0);
        expect(state.totalPaid).toBe(0);
        expect(state.remainingAmount).toBe(150000);
        expect(state.status).toBe('idle');
      });
    });

    describe('addPaymentToState', () => {
      it('should add payment and update totals', () => {
        const initialState = createSplitPaymentState(150000);
        const payment: IPaymentInput = {
          method: 'cash',
          amount: 100000,
        };

        const newState = addPaymentToState(initialState, payment, 150000);

        expect(newState.payments).toHaveLength(1);
        expect(newState.totalPaid).toBe(100000);
        expect(newState.remainingAmount).toBe(50000);
        expect(newState.status).toBe('adding');
      });

      it('should set status to complete when total reached', () => {
        const initialState = createSplitPaymentState(150000);
        const payment1: IPaymentInput = { method: 'cash', amount: 100000 };
        const state1 = addPaymentToState(initialState, payment1, 150000);

        const payment2: IPaymentInput = { method: 'card', amount: 50000 };
        const state2 = addPaymentToState(state1, payment2, 150000);

        expect(state2.payments).toHaveLength(2);
        expect(state2.totalPaid).toBe(150000);
        expect(state2.remainingAmount).toBe(0);
        expect(state2.status).toBe('complete');
      });

      it('should handle small rounding differences', () => {
        const initialState = createSplitPaymentState(150000);
        const payment: IPaymentInput = { method: 'cash', amount: 149999 };

        const newState = addPaymentToState(initialState, payment, 150000);

        // 1 IDR difference should round to complete
        expect(newState.status).toBe('complete');
      });
    });

    describe('removePaymentFromState', () => {
      it('should remove payment and update totals', () => {
        let state = createSplitPaymentState(150000);
        state = addPaymentToState(state, { method: 'cash', amount: 100000 }, 150000);
        state = addPaymentToState(state, { method: 'card', amount: 50000 }, 150000);

        const newState = removePaymentFromState(state, 0, 150000);

        expect(newState.payments).toHaveLength(1);
        expect(newState.totalPaid).toBe(50000);
        expect(newState.remainingAmount).toBe(100000);
        expect(newState.status).toBe('adding');
      });

      it('should set status to idle when all payments removed', () => {
        let state = createSplitPaymentState(150000);
        state = addPaymentToState(state, { method: 'cash', amount: 100000 }, 150000);

        const newState = removePaymentFromState(state, 0, 150000);

        expect(newState.payments).toHaveLength(0);
        expect(newState.status).toBe('idle');
      });
    });

    describe('resetSplitPaymentState', () => {
      it('should reset to initial state', () => {
        let state = createSplitPaymentState(150000);
        state = addPaymentToState(state, { method: 'cash', amount: 100000 }, 150000);

        const resetState = resetSplitPaymentState(150000);

        expect(resetState.payments).toHaveLength(0);
        expect(resetState.totalPaid).toBe(0);
        expect(resetState.remainingAmount).toBe(150000);
        expect(resetState.status).toBe('idle');
      });
    });
  });
});
