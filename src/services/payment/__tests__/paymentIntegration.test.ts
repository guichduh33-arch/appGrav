/**
 * Payment Integration Tests
 *
 * Integration tests for split payment flow, void, and refund operations.
 * Tests the full flow from UI state machine to service layer.
 *
 * @see Story 3.26: Phase 2 Integration Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validatePayment, validateSplitPayments } from '@/services/payment/paymentService';
import { usePaymentStore } from '@/stores/paymentStore';
import type { TPaymentMethod } from '@/types/payment';

describe('Payment Integration Tests', () => {
    beforeEach(() => {
        // Reset store state completely
        const store = usePaymentStore.getState();
        store.reset();
    });

    describe('Split Payment Flow', () => {
        it('should complete split payment with cash + card', () => {
            // Reset and get fresh store
            usePaymentStore.getState().reset();
            usePaymentStore.getState().initialize(150000);

            // Check initial state
            expect(usePaymentStore.getState().orderTotal).toBe(150000);
            expect(usePaymentStore.getState().remainingAmount).toBe(150000);
            expect(usePaymentStore.getState().status).toBe('idle');

            // Add cash payment of 100,000
            usePaymentStore.getState().addPayment({
                method: 'cash' as TPaymentMethod,
                amount: 100000,
                cashReceived: 100000,
            });

            // Check state after adding cash payment
            expect(usePaymentStore.getState().totalPaid).toBe(100000);
            expect(usePaymentStore.getState().remainingAmount).toBe(50000);
            expect(usePaymentStore.getState().payments.length).toBe(1);
            expect(usePaymentStore.getState().status).toBe('adding');

            // Add card payment of 50,000
            usePaymentStore.getState().addPayment({
                method: 'card' as TPaymentMethod,
                amount: 50000,
                reference: 'CARD-REF-123',
            });

            // Check final state
            expect(usePaymentStore.getState().totalPaid).toBe(150000);
            expect(usePaymentStore.getState().remainingAmount).toBe(0);
            expect(usePaymentStore.getState().payments.length).toBe(2);
            expect(usePaymentStore.getState().status).toBe('complete');
            expect(usePaymentStore.getState().isComplete()).toBe(true);
        });

        it('should validate split payment total matches order total', () => {
            // Split payments that don't match order total should fail
            const result = validateSplitPayments(
                [
                    { method: 'cash', amount: 50000, cashReceived: 50000 },
                    { method: 'card', amount: 30000 },
                ],
                100000 // order total is 100k, payments only 80k
            );

            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes('less than order total'))).toBe(true);
        });

        it('should allow partial payments and track remaining', () => {
            usePaymentStore.getState().reset();
            usePaymentStore.getState().initialize(200000);

            usePaymentStore.getState().addPayment({ method: 'cash', amount: 75000, cashReceived: 80000 });
            expect(usePaymentStore.getState().remainingAmount).toBe(125000);
            expect(usePaymentStore.getState().canAddPayment()).toBe(true);

            usePaymentStore.getState().addPayment({ method: 'qris', amount: 75000 });
            expect(usePaymentStore.getState().remainingAmount).toBe(50000);
            expect(usePaymentStore.getState().canAddPayment()).toBe(true);

            usePaymentStore.getState().addPayment({ method: 'edc', amount: 50000, reference: 'EDC-001' });
            expect(usePaymentStore.getState().remainingAmount).toBe(0);
            expect(usePaymentStore.getState().canAddPayment()).toBe(false);
            expect(usePaymentStore.getState().isComplete()).toBe(true);
        });

        it('should remove payment and recalculate remaining', () => {
            usePaymentStore.getState().reset();
            usePaymentStore.getState().initialize(100000);

            usePaymentStore.getState().addPayment({ method: 'cash', amount: 50000, cashReceived: 50000 });
            usePaymentStore.getState().addPayment({ method: 'card', amount: 50000 });

            expect(usePaymentStore.getState().isComplete()).toBe(true);

            // Get the card payment ID and remove it
            const payments = usePaymentStore.getState().payments;
            expect(payments.length).toBe(2);
            const cardPaymentId = payments[1].id;
            usePaymentStore.getState().removePayment(cardPaymentId);

            expect(usePaymentStore.getState().totalPaid).toBe(50000);
            expect(usePaymentStore.getState().remainingAmount).toBe(50000);
            expect(usePaymentStore.getState().isComplete()).toBe(false);
        });
    });

    describe('Payment Method Validation', () => {
        it('should accept card payment without reference (optional during creation)', () => {
            // Reference is optional during creation, validated during reconciliation
            const cardNoRef = validatePayment({ method: 'card', amount: 50000 }, 100000);
            expect(cardNoRef.valid).toBe(true);
        });

        it('should validate cash received covers amount', () => {
            const insufficient = validatePayment(
                { method: 'cash', amount: 50000, cashReceived: 40000 },
                100000
            );
            expect(insufficient.valid).toBe(false);
            expect(insufficient.errors).toContain('Cash received must be at least the payment amount');
        });

        it('should accept all valid payment methods', () => {
            const methods: TPaymentMethod[] = ['cash', 'card', 'qris', 'edc', 'transfer'];

            methods.forEach((method) => {
                const validation = validatePayment(
                    {
                        method,
                        amount: 10000,
                        cashReceived: method === 'cash' ? 10000 : undefined,
                    },
                    100000
                );
                expect(validation.valid).toBe(true);
            });
        });

        it('should reject zero or negative amounts', () => {
            const zeroAmount = validatePayment({ method: 'cash', amount: 0 }, 100000);
            expect(zeroAmount.valid).toBe(false);
            expect(zeroAmount.errors).toContain('Payment amount must be greater than 0');

            const negativeAmount = validatePayment({ method: 'card', amount: -1000 }, 100000);
            expect(negativeAmount.valid).toBe(false);
        });
    });

    describe('State Machine Transitions', () => {
        it('should transition from idle to adding when selecting method', () => {
            usePaymentStore.getState().reset();
            usePaymentStore.getState().initialize(50000);

            // Initial state
            expect(usePaymentStore.getState().status).toBe('idle');

            // Selecting a method transitions to adding
            usePaymentStore.getState().setCurrentMethod('cash');
            expect(usePaymentStore.getState().status).toBe('adding');
            expect(usePaymentStore.getState().currentMethod).toBe('cash');
        });

        it('should reset to initial state', () => {
            usePaymentStore.getState().reset();
            usePaymentStore.getState().initialize(100000);
            usePaymentStore
                .getState()
                .addPayment({ method: 'cash', amount: 100000, cashReceived: 100000 });
            expect(usePaymentStore.getState().isComplete()).toBe(true);

            usePaymentStore.getState().reset();

            expect(usePaymentStore.getState().orderTotal).toBe(0);
            expect(usePaymentStore.getState().payments).toHaveLength(0);
            expect(usePaymentStore.getState().status).toBe('idle');
        });

        it('should get payment inputs for processing', () => {
            usePaymentStore.getState().reset();
            usePaymentStore.getState().initialize(100000);

            usePaymentStore.getState().addPayment({ method: 'cash', amount: 50000, cashReceived: 60000 });
            usePaymentStore.getState().addPayment({ method: 'qris', amount: 50000, reference: 'QRIS-001' });

            const inputs = usePaymentStore.getState().getPaymentInputs();

            expect(inputs).toHaveLength(2);
            expect(inputs[0].method).toBe('cash');
            expect(inputs[0].amount).toBe(50000);
            expect(inputs[1].method).toBe('qris');
            expect(inputs[1].amount).toBe(50000);
        });
    });
});
