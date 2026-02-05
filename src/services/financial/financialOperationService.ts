/**
 * Financial Operation Service - Types and Interfaces
 *
 * Central types for void, refund, and audit operations.
 * These types are also exported from @/types/payment.ts for convenience.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */

import type {
  TVoidReasonCode,
  TRefundReasonCode,
  IVoidInput,
  IRefundInput,
  IFinancialOperationResult,
  IConflictResolution,
} from '@/types/payment';

// Re-export for convenience
export type {
  TVoidReasonCode,
  TRefundReasonCode,
  IVoidInput,
  IRefundInput,
  IFinancialOperationResult,
  IConflictResolution,
};

// =====================================================
// Constants
// =====================================================

/**
 * Human-readable labels for void reason codes
 */
export const VOID_REASON_LABELS: Record<TVoidReasonCode, string> = {
  customer_changed_mind: 'Customer Changed Mind',
  duplicate_order: 'Duplicate Order',
  wrong_items: 'Wrong Items Entered',
  system_error: 'System Error',
  other: 'Other',
};

/**
 * Human-readable labels for refund reason codes
 */
export const REFUND_REASON_LABELS: Record<TRefundReasonCode, string> = {
  product_quality: 'Product Quality Issue',
  wrong_item_delivered: 'Wrong Item Delivered',
  customer_dissatisfied: 'Customer Dissatisfied',
  overcharge: 'Overcharge',
  other: 'Other',
};

/**
 * Void reason options for UI dropdowns
 */
export const VOID_REASON_OPTIONS = Object.entries(VOID_REASON_LABELS).map(
  ([code, label]) => ({
    value: code as TVoidReasonCode,
    label,
  })
);

/**
 * Refund reason options for UI dropdowns
 */
export const REFUND_REASON_OPTIONS = Object.entries(REFUND_REASON_LABELS).map(
  ([code, label]) => ({
    value: code as TRefundReasonCode,
    label,
  })
);

// =====================================================
// Validation
// =====================================================

/**
 * Validate void input
 *
 * @param input - Void operation input
 * @returns Array of error messages (empty if valid)
 */
export function validateVoidInput(input: IVoidInput): string[] {
  const errors: string[] = [];

  if (!input.orderId) {
    errors.push('Order ID is required');
  }

  if (!input.reason || input.reason.trim().length === 0) {
    errors.push('Void reason is required');
  }

  if (!input.reasonCode) {
    errors.push('Void reason code is required');
  }

  if (!input.voidedBy) {
    errors.push('User ID (voidedBy) is required');
  }

  return errors;
}

/**
 * Validate refund input
 *
 * @param input - Refund operation input
 * @param orderTotal - Original order total for validation
 * @returns Array of error messages (empty if valid)
 */
export function validateRefundInput(
  input: IRefundInput,
  orderTotal: number
): string[] {
  const errors: string[] = [];

  if (!input.orderId) {
    errors.push('Order ID is required');
  }

  if (input.amount <= 0) {
    errors.push('Refund amount must be greater than 0');
  }

  if (input.amount > orderTotal) {
    errors.push('Refund amount cannot exceed order total');
  }

  if (!input.reason || input.reason.trim().length === 0) {
    errors.push('Refund reason is required');
  }

  if (!input.reasonCode) {
    errors.push('Refund reason code is required');
  }

  if (!input.method) {
    errors.push('Refund method is required');
  }

  if (!input.refundedBy) {
    errors.push('User ID (refundedBy) is required');
  }

  return errors;
}

// =====================================================
// Conflict Resolution
// =====================================================

/**
 * Check if an operation should be rejected due to server conflict
 *
 * @param resolution - Conflict resolution parameters
 * @returns true if operation should be rejected
 */
export function shouldRejectForConflict(resolution: IConflictResolution): boolean {
  if (resolution.rule === 'force_apply') {
    return false;
  }

  // reject_if_server_newer
  return resolution.serverUpdatedAt > resolution.localOperationAt;
}

// =====================================================
// Permission Codes
// =====================================================

/** Permission required for void operations */
export const VOID_PERMISSION = 'sales.void';

/** Permission required for refund operations */
export const REFUND_PERMISSION = 'sales.refund';

// =====================================================
// Audit Severity
// =====================================================

/** Audit log severity for financial operations */
export const FINANCIAL_OPERATION_SEVERITY = 'critical';
