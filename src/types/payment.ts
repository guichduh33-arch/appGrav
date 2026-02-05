/**
 * Payment Types - Single Source of Truth
 *
 * All payment method types should be imported from this file.
 * Aligned with database enum: supabase/migrations/001_extensions_enums.sql
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */

/**
 * Payment method - aligned with database enum `payment_method`
 */
export type TPaymentMethod = 'cash' | 'card' | 'qris' | 'edc' | 'transfer';

/**
 * Payment input for processing a single payment
 */
export interface IPaymentInput {
  method: TPaymentMethod;
  amount: number;
  cashReceived?: number;
  reference?: string;
  isOffline?: boolean;
}

/**
 * Result of a payment operation
 */
export interface IPaymentResult {
  success: boolean;
  paymentId: string;
  change?: number;
  error?: string;
}

/**
 * Validation result for payment input
 */
export interface IValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * State machine for split payment flow
 */
export interface ISplitPaymentState {
  payments: IPaymentInput[];
  totalPaid: number;
  remainingAmount: number;
  status: 'idle' | 'adding' | 'validating' | 'complete';
}

/**
 * Order payment record (matches database table)
 */
export interface IOrderPayment {
  id: string;
  order_id: string;
  payment_method: TPaymentMethod;
  amount: number;
  cash_received: number | null;
  change_given: number | null;
  reference: string | null;
  status: string;
  is_offline: boolean;
  synced_at: string | null;
  created_at: string;
  created_by: string | null;
}

/**
 * Void reason codes
 */
export type TVoidReasonCode =
  | 'customer_changed_mind'
  | 'duplicate_order'
  | 'wrong_items'
  | 'system_error'
  | 'other';

/**
 * Refund reason codes
 */
export type TRefundReasonCode =
  | 'product_quality'
  | 'wrong_item_delivered'
  | 'customer_dissatisfied'
  | 'overcharge'
  | 'other';

/**
 * Void operation input
 */
export interface IVoidInput {
  orderId: string;
  reason: string;
  reasonCode: TVoidReasonCode;
  voidedBy: string;
}

/**
 * Refund operation input
 */
export interface IRefundInput {
  orderId: string;
  amount: number;
  reason: string;
  reasonCode: TRefundReasonCode;
  method: TPaymentMethod;
  refundedBy: string;
}

/**
 * Financial operation result
 */
export interface IFinancialOperationResult {
  success: boolean;
  operationId: string;
  auditLogId: string;
  error?: string;
}

/**
 * Conflict resolution for offline operations
 */
export interface IConflictResolution {
  serverUpdatedAt: Date;
  localOperationAt: Date;
  rule: 'reject_if_server_newer' | 'force_apply';
}
