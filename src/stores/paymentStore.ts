/**
 * Payment Store - Split Payment State Management
 *
 * Zustand store for managing split payment flow state.
 * Uses a state machine pattern for reliable payment processing.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 * @see src/services/payment/paymentService.ts
 */

import { create } from 'zustand';
import type { TPaymentMethod, IPaymentInput, ISplitPaymentState } from '@/types/payment';

// =====================================================
// Types
// =====================================================

interface IPaymentEntry extends IPaymentInput {
  id: string;
  timestamp: number;
}

interface IPaymentStore {
  // State
  orderTotal: number;
  payments: IPaymentEntry[];
  totalPaid: number;
  remainingAmount: number;
  status: ISplitPaymentState['status'];
  currentMethod: TPaymentMethod | null;
  currentAmount: number;

  // Actions
  initialize: (orderTotal: number) => void;
  setCurrentMethod: (method: TPaymentMethod | null) => void;
  setCurrentAmount: (amount: number) => void;
  addPayment: (payment: IPaymentInput) => void;
  removePayment: (paymentId: string) => void;
  reset: () => void;

  // Computed
  isComplete: () => boolean;
  canAddPayment: () => boolean;
  getPaymentInputs: () => IPaymentInput[];
}

// =====================================================
// Initial State
// =====================================================

const initialState = {
  orderTotal: 0,
  payments: [] as IPaymentEntry[],
  totalPaid: 0,
  remainingAmount: 0,
  status: 'idle' as ISplitPaymentState['status'],
  currentMethod: null as TPaymentMethod | null,
  currentAmount: 0,
};

// =====================================================
// Store
// =====================================================

export const usePaymentStore = create<IPaymentStore>((set, get) => ({
  ...initialState,

  /**
   * Initialize payment flow with order total
   */
  initialize: (orderTotal: number) => {
    set({
      ...initialState,
      orderTotal,
      remainingAmount: orderTotal,
    });
  },

  /**
   * Set current payment method being entered
   */
  setCurrentMethod: (method: TPaymentMethod | null) => {
    const { remainingAmount, status } = get();
    set({
      currentMethod: method,
      // Pre-fill remaining amount for non-cash payments
      currentAmount: method && method !== 'cash' ? remainingAmount : 0,
      status: method ? 'adding' : status === 'adding' ? 'idle' : status,
    });
  },

  /**
   * Set amount for current payment
   */
  setCurrentAmount: (amount: number) => {
    set({ currentAmount: amount });
  },

  /**
   * Add a payment to the split payment list
   */
  addPayment: (payment: IPaymentInput) => {
    const { payments, orderTotal } = get();

    const newPayment: IPaymentEntry = {
      ...payment,
      id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };

    const newPayments = [...payments, newPayment];
    const newTotalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    const newRemaining = Math.max(0, orderTotal - newTotalPaid);

    // Determine new status (allow 1 IDR rounding)
    const newStatus: ISplitPaymentState['status'] = newRemaining <= 1 ? 'complete' : 'adding';

    set({
      payments: newPayments,
      totalPaid: newTotalPaid,
      remainingAmount: newRemaining,
      status: newStatus,
      currentMethod: null,
      currentAmount: 0,
    });
  },

  /**
   * Remove a payment from the split payment list
   */
  removePayment: (paymentId: string) => {
    const { payments, orderTotal } = get();

    const newPayments = payments.filter((p) => p.id !== paymentId);
    const newTotalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    const newRemaining = Math.max(0, orderTotal - newTotalPaid);

    set({
      payments: newPayments,
      totalPaid: newTotalPaid,
      remainingAmount: newRemaining,
      status: newPayments.length === 0 ? 'idle' : 'adding',
    });
  },

  /**
   * Reset payment state
   */
  reset: () => {
    set(initialState);
  },

  /**
   * Check if payment is complete (total reached)
   */
  isComplete: () => {
    const { remainingAmount } = get();
    return remainingAmount <= 1;
  },

  /**
   * Check if can add another payment
   */
  canAddPayment: () => {
    const { remainingAmount, status } = get();
    return remainingAmount > 1 && status !== 'complete';
  },

  /**
   * Get payment inputs for processing
   */
  getPaymentInputs: (): IPaymentInput[] => {
    const { payments } = get();
    return payments.map(({ method, amount, cashReceived, reference, isOffline }) => ({
      method,
      amount,
      cashReceived,
      reference,
      isOffline,
    }));
  },
}));

export default usePaymentStore;
