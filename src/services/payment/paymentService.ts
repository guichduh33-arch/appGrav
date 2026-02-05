/**
 * Payment Service - Unified Payment Processing
 *
 * High-level payment processing service that wraps offline payment operations
 * and provides validation, split payment state management, and change calculation.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 * @see src/types/payment.ts for type definitions
 */

import type {
  TPaymentMethod,
  IPaymentInput,
  IPaymentResult,
  IValidationResult,
  ISplitPaymentState,
} from '@/types/payment';
import {
  saveOfflinePayment,
  saveOfflinePayments,
  calculateChange as calculateChangeUtil,
  getOrderPaidAmount,
} from '@/services/offline/offlinePaymentService';

// =====================================================
// Constants
// =====================================================

/** Maximum payment amount (10 billion IDR) */
const MAX_PAYMENT_AMOUNT = 10_000_000_000;

/** IDR rounding threshold (100 IDR) */
const IDR_ROUNDING = 100;

/** Payment methods that require reference number */
const REFERENCE_REQUIRED_METHODS: TPaymentMethod[] = ['card', 'qris', 'edc', 'transfer'];

// =====================================================
// Validation
// =====================================================

/**
 * Validate a single payment input
 *
 * @param input - Payment input to validate
 * @param orderTotal - Total order amount for validation
 * @returns Validation result with errors array
 */
export function validatePayment(
  input: IPaymentInput,
  _orderTotal: number
): IValidationResult {
  const errors: string[] = [];

  // Amount validation
  if (input.amount <= 0) {
    errors.push('Payment amount must be greater than 0');
  }

  if (input.amount > MAX_PAYMENT_AMOUNT) {
    errors.push(`Payment amount exceeds maximum (${MAX_PAYMENT_AMOUNT.toLocaleString()} IDR)`);
  }

  // Cash validation
  if (input.method === 'cash') {
    if (input.cashReceived !== undefined && input.cashReceived < input.amount) {
      errors.push('Cash received must be at least the payment amount');
    }
  }

  // Reference validation for non-cash
  if (REFERENCE_REQUIRED_METHODS.includes(input.method)) {
    // Reference is optional during creation, validated during reconciliation
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate split payment inputs
 *
 * @param inputs - Array of payment inputs
 * @param orderTotal - Total order amount
 * @returns Validation result
 */
export function validateSplitPayments(
  inputs: IPaymentInput[],
  orderTotal: number
): IValidationResult {
  const errors: string[] = [];

  if (inputs.length === 0) {
    errors.push('At least one payment is required');
    return { valid: false, errors };
  }

  // Validate each payment individually
  for (let i = 0; i < inputs.length; i++) {
    const result = validatePayment(inputs[i], orderTotal);
    if (!result.valid) {
      errors.push(...result.errors.map((e) => `Payment ${i + 1}: ${e}`));
    }
  }

  // Validate total
  const totalPaid = inputs.reduce((sum, p) => sum + p.amount, 0);

  // Allow small rounding difference (1 IDR)
  if (Math.abs(totalPaid - orderTotal) > 1) {
    if (totalPaid < orderTotal) {
      errors.push(
        `Total payments (${totalPaid.toLocaleString()} IDR) less than order total (${orderTotal.toLocaleString()} IDR)`
      );
    } else {
      errors.push(
        `Total payments (${totalPaid.toLocaleString()} IDR) exceeds order total (${orderTotal.toLocaleString()} IDR)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// Change Calculation
// =====================================================

/**
 * Calculate change for cash payment
 *
 * Rounds to nearest 100 IDR per Indonesian standards.
 *
 * @param cashReceived - Cash amount received
 * @param amount - Payment amount due
 * @returns Change to return (always >= 0, rounded to 100 IDR)
 */
export function calculateChange(cashReceived: number, amount: number): number {
  const rawChange = calculateChangeUtil(amount, cashReceived);
  // Round down to nearest 100 IDR
  return Math.floor(rawChange / IDR_ROUNDING) * IDR_ROUNDING;
}

// =====================================================
// Split Payment State Management
// =====================================================

/**
 * Create initial split payment state
 *
 * @param orderTotal - Total order amount
 * @returns Initial state
 */
export function createSplitPaymentState(orderTotal: number): ISplitPaymentState {
  return {
    payments: [],
    totalPaid: 0,
    remainingAmount: orderTotal,
    status: 'idle',
  };
}

/**
 * Add a payment to split payment state
 *
 * @param state - Current state
 * @param payment - Payment to add
 * @param orderTotal - Total order amount
 * @returns Updated state
 */
export function addPaymentToState(
  state: ISplitPaymentState,
  payment: IPaymentInput,
  orderTotal: number
): ISplitPaymentState {
  const newPayments = [...state.payments, payment];
  const newTotalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
  const newRemaining = Math.max(0, orderTotal - newTotalPaid);

  // Determine new status
  // Allow 1 IDR rounding difference (newRemaining is already >= 0 from Math.max above)
  let newStatus: ISplitPaymentState['status'];
  if (newRemaining <= 1) {
    newStatus = 'complete';
  } else {
    newStatus = 'adding';
  }

  return {
    payments: newPayments,
    totalPaid: newTotalPaid,
    remainingAmount: newRemaining,
    status: newStatus,
  };
}

/**
 * Remove a payment from split payment state
 *
 * @param state - Current state
 * @param index - Index of payment to remove
 * @param orderTotal - Total order amount
 * @returns Updated state
 */
export function removePaymentFromState(
  state: ISplitPaymentState,
  index: number,
  orderTotal: number
): ISplitPaymentState {
  const newPayments = state.payments.filter((_, i) => i !== index);
  const newTotalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
  const newRemaining = Math.max(0, orderTotal - newTotalPaid);

  return {
    payments: newPayments,
    totalPaid: newTotalPaid,
    remainingAmount: newRemaining,
    status: newPayments.length === 0 ? 'idle' : 'adding',
  };
}

/**
 * Reset split payment state
 *
 * @param orderTotal - Total order amount
 * @returns Fresh state
 */
export function resetSplitPaymentState(orderTotal: number): ISplitPaymentState {
  return createSplitPaymentState(orderTotal);
}

// =====================================================
// Payment Processing
// =====================================================

/**
 * Process a single payment for an order
 *
 * @param orderId - Order ID
 * @param input - Payment input
 * @param userId - User processing the payment
 * @param sessionId - Optional POS session ID
 * @param orderTotal - Optional order total for validation
 * @returns Payment result
 */
export async function processPayment(
  orderId: string,
  input: IPaymentInput,
  userId: string,
  sessionId?: string,
  orderTotal?: number
): Promise<IPaymentResult> {
  try {
    // Validate payment if order total is provided
    if (orderTotal !== undefined) {
      const validation = validatePayment(input, orderTotal);
      if (!validation.valid) {
        return {
          success: false,
          paymentId: '',
          error: validation.errors.join('; '),
        };
      }

      // C-2: Validate payment amount matches order total (with 1 IDR tolerance)
      if (Math.abs(input.amount - orderTotal) > 1) {
        return {
          success: false,
          paymentId: '',
          error: `Payment amount (${input.amount.toLocaleString()} IDR) does not match order total (${orderTotal.toLocaleString()} IDR)`,
        };
      }
    }

    // Calculate change for cash
    let change: number | undefined;
    let changeGiven: number | null = null;
    let cashReceived: number | null = null;

    if (input.method === 'cash' && input.cashReceived !== undefined) {
      cashReceived = input.cashReceived;
      change = calculateChange(input.cashReceived, input.amount);
      changeGiven = change;
    }

    // Save payment offline
    const payment = await saveOfflinePayment({
      order_id: orderId,
      method: input.method,
      amount: input.amount,
      cash_received: cashReceived ?? undefined,
      change_given: changeGiven ?? undefined,
      reference: input.reference,
      user_id: userId,
      session_id: sessionId ?? null,
    });

    return {
      success: true,
      paymentId: payment.id,
      change,
    };
  } catch (error) {
    return {
      success: false,
      paymentId: '',
      error: error instanceof Error ? error.message : 'Unknown payment error',
    };
  }
}

/**
 * Process multiple payments (split payment) for an order
 *
 * @param orderId - Order ID
 * @param inputs - Array of payment inputs
 * @param userId - User processing the payments
 * @param sessionId - Optional POS session ID
 * @param orderTotal - Optional order total for validation
 * @returns Payment result (paymentId is first payment's ID)
 */
export async function processSplitPayment(
  orderId: string,
  inputs: IPaymentInput[],
  userId: string,
  sessionId?: string,
  orderTotal?: number
): Promise<IPaymentResult> {
  try {
    // C-2: Validate split payments if order total is provided
    if (orderTotal !== undefined) {
      const validation = validateSplitPayments(inputs, orderTotal);
      if (!validation.valid) {
        return {
          success: false,
          paymentId: '',
          error: validation.errors.join('; '),
        };
      }
    }

    // Prepare payments with calculated change
    const paymentInputs = inputs.map((input) => {
      let changeGiven: number | undefined;
      let cashReceived: number | undefined;

      if (input.method === 'cash' && input.cashReceived !== undefined) {
        cashReceived = input.cashReceived;
        changeGiven = calculateChange(input.cashReceived, input.amount);
      }

      return {
        method: input.method,
        amount: input.amount,
        cash_received: cashReceived,
        change_given: changeGiven,
        reference: input.reference,
        user_id: userId,
        session_id: sessionId ?? null,
      };
    });

    // Save all payments
    const payments = await saveOfflinePayments(orderId, paymentInputs);

    // Calculate total change for all cash payments
    const totalChange = inputs.reduce((sum, input) => {
      if (input.method === 'cash' && input.cashReceived !== undefined) {
        return sum + calculateChange(input.cashReceived, input.amount);
      }
      return sum;
    }, 0);

    return {
      success: true,
      paymentId: payments[0]?.id ?? '',
      change: totalChange > 0 ? totalChange : undefined,
    };
  } catch (error) {
    return {
      success: false,
      paymentId: '',
      error: error instanceof Error ? error.message : 'Unknown payment error',
    };
  }
}

/**
 * Get remaining amount for an order (for partial payments)
 *
 * @param orderId - Order ID
 * @param orderTotal - Total order amount
 * @returns Remaining amount to pay
 */
export async function getRemainingAmount(
  orderId: string,
  orderTotal: number
): Promise<number> {
  const paidAmount = await getOrderPaidAmount(orderId);
  return Math.max(0, orderTotal - paidAmount);
}

// =====================================================
// Service Interface Export
// =====================================================

export interface IPaymentService {
  validatePayment: typeof validatePayment;
  validateSplitPayments: typeof validateSplitPayments;
  calculateChange: typeof calculateChange;
  processPayment: typeof processPayment;
  processSplitPayment: typeof processSplitPayment;
  getRemainingAmount: typeof getRemainingAmount;
  createSplitPaymentState: typeof createSplitPaymentState;
  addPaymentToState: typeof addPaymentToState;
  removePaymentFromState: typeof removePaymentFromState;
  resetSplitPaymentState: typeof resetSplitPaymentState;
}

/**
 * Payment service singleton
 */
export const paymentService: IPaymentService = {
  validatePayment,
  validateSplitPayments,
  calculateChange,
  processPayment,
  processSplitPayment,
  getRemainingAmount,
  createSplitPaymentState,
  addPaymentToState,
  removePaymentFromState,
  resetSplitPaymentState,
};

export default paymentService;
