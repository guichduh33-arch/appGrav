/**
 * Refund Service - Order Refund Operations
 *
 * Handles refunding orders (full or partial) with audit trail and offline support.
 * Requires PIN verification and 'sales.refund' permission.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type {
  TPaymentMethod,
  IRefundInput,
  IFinancialOperationResult,
  IConflictResolution,
} from '@/types/payment';
import {
  validateRefundInput,
  shouldRejectForConflict,
  REFUND_PERMISSION,
} from './financialOperationService';
import { logRefundOperation } from './auditService';

// =====================================================
// Types
// =====================================================

/**
 * Refund operation for offline queue
 */
interface IOfflineRefundOperation {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  reasonCode: string;
  method: TPaymentMethod;
  refundedBy: string;
  createdAt: string;
  synced: boolean;
}

/**
 * Order data for refund validation
 */
interface IOrderForRefund {
  id: string;
  total: number;
  status: string;
  refund_amount: number | null;
  payment_method: TPaymentMethod | null;
}

// =====================================================
// Constants
// =====================================================

const LOCAL_REFUND_PREFIX = 'LOCAL-REFUND-';

// =====================================================
// Validation
// =====================================================

/**
 * Check if user has refund permission
 *
 * @param userId - User ID to check
 * @returns true if user has refund permission
 */
export async function canRefundOrder(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_permission_code: REFUND_PERMISSION,
  });

  if (error) {
    console.error('Permission check failed:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if order can be refunded
 *
 * @param orderId - Order ID to check
 * @param refundAmount - Requested refund amount
 * @returns Object with canRefund flag and reason if not
 */
export async function canOrderBeRefunded(
  orderId: string,
  refundAmount: number
): Promise<{ canRefund: boolean; reason?: string; order?: IOrderForRefund }> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, total, status, refund_amount, payment_method')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { canRefund: false, reason: 'Order not found' };
  }

  // Cannot refund voided orders
  if (order.status === 'voided') {
    return { canRefund: false, reason: 'Cannot refund a voided order' };
  }

  // Cannot refund cancelled orders
  if (order.status === 'cancelled') {
    return { canRefund: false, reason: 'Cannot refund a cancelled order' };
  }

  // Check if order is paid
  if (order.status !== 'completed' && order.status !== 'served') {
    return { canRefund: false, reason: 'Order must be completed before refunding' };
  }

  // Calculate remaining refundable amount
  const previousRefunds = order.refund_amount || 0;
  const maxRefundable = order.total - previousRefunds;

  if (refundAmount > maxRefundable) {
    return {
      canRefund: false,
      reason: `Refund amount exceeds remaining refundable amount (max: ${maxRefundable.toLocaleString()} IDR)`,
    };
  }

  return { canRefund: true, order: order as IOrderForRefund };
}

/**
 * Get maximum refundable amount for an order
 *
 * @param orderId - Order ID
 * @returns Maximum refundable amount or 0 if order not found
 */
export async function getMaxRefundableAmount(orderId: string): Promise<number> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('total, refund_amount')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return 0;
  }

  const previousRefunds = order.refund_amount || 0;
  return Math.max(0, order.total - previousRefunds);
}

// =====================================================
// Refund Operations
// =====================================================

/**
 * Refund an order (full or partial)
 *
 * If online, applies immediately. If offline, queues for sync with conflict detection.
 *
 * @param input - Refund operation input
 * @param isOffline - Whether to queue for offline sync
 * @returns Operation result
 */
export async function refundOrder(
  input: IRefundInput,
  isOffline = false
): Promise<IFinancialOperationResult> {
  // Get order total for validation
  const { data: order } = await supabase
    .from('orders')
    .select('total')
    .eq('id', input.orderId)
    .single();

  const orderTotal = order?.total || 0;

  // Validate input
  const validationErrors = validateRefundInput(input, orderTotal);
  if (validationErrors.length > 0) {
    return {
      success: false,
      operationId: '',
      auditLogId: '',
      error: validationErrors.join('; '),
    };
  }

  const operationId = isOffline
    ? `${LOCAL_REFUND_PREFIX}${crypto.randomUUID()}`
    : crypto.randomUUID();

  try {
    if (isOffline) {
      return await queueOfflineRefund(input, operationId);
    } else {
      return await applyRefund(input, operationId);
    }
  } catch (error) {
    return {
      success: false,
      operationId,
      auditLogId: '',
      error: error instanceof Error ? error.message : 'Unknown refund error',
    };
  }
}

/**
 * Apply refund operation directly (online mode)
 */
async function applyRefund(
  input: IRefundInput,
  operationId: string
): Promise<IFinancialOperationResult> {
  // Check if order can be refunded
  const canRefund = await canOrderBeRefunded(input.orderId, input.amount);
  if (!canRefund.canRefund) {
    return {
      success: false,
      operationId,
      auditLogId: '',
      error: canRefund.reason,
    };
  }

  // Calculate new total refund amount
  const previousRefunds = canRefund.order?.refund_amount || 0;
  const newTotalRefund = previousRefunds + input.amount;

  // Update order with refund info
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      refund_amount: newTotalRefund,
      refund_reason: `[${input.reasonCode}] ${input.reason}`,
      refund_method: input.method,
      refunded_at: new Date().toISOString(),
      refunded_by: input.refundedBy,
    })
    .eq('id', input.orderId);

  if (updateError) {
    return {
      success: false,
      operationId,
      auditLogId: '',
      error: `Failed to refund order: ${updateError.message}`,
    };
  }

  // Update POS session refund total if applicable
  await updateSessionRefundTotal(input.refundedBy, input.amount);

  // Create audit log
  const auditLogId = await logRefundOperation(
    input.orderId,
    input.refundedBy,
    input.amount,
    input.reason,
    input.reasonCode,
    input.method,
    false
  );

  return {
    success: true,
    operationId,
    auditLogId,
  };
}

/**
 * Update POS session total_refunds
 */
async function updateSessionRefundTotal(
  userId: string,
  refundAmount: number
): Promise<void> {
  // Find open session for user
  const { data: session, error: sessionError } = await supabase
    .from('pos_sessions')
    .select('id, total_refunds')
    .eq('user_id', userId)
    .eq('status', 'open')
    .single();

  if (sessionError || !session) {
    // No open session, skip update
    return;
  }

  // Update total refunds
  const newTotal = (session.total_refunds || 0) + refundAmount;
  await supabase
    .from('pos_sessions')
    .update({ total_refunds: newTotal })
    .eq('id', session.id);
}

/**
 * Queue refund operation for offline sync
 */
async function queueOfflineRefund(
  input: IRefundInput,
  operationId: string
): Promise<IFinancialOperationResult> {
  const now = new Date().toISOString();

  const offlineOperation: IOfflineRefundOperation = {
    id: operationId,
    orderId: input.orderId,
    amount: input.amount,
    reason: input.reason,
    reasonCode: input.reasonCode,
    method: input.method,
    refundedBy: input.refundedBy,
    createdAt: now,
    synced: false,
  };

  // Add to sync queue
  await db.offline_sync_queue.add({
    entity: 'refund_operations' as never, // Type workaround
    action: 'create',
    entityId: operationId,
    payload: {
      ...offlineOperation,
      conflictRule: 'reject_if_server_newer',
    },
    created_at: now,
    status: 'pending',
    retries: 0,
  });

  // Create offline audit log
  const auditLogId = await logRefundOperation(
    input.orderId,
    input.refundedBy,
    input.amount,
    input.reason,
    input.reasonCode,
    input.method,
    true
  );

  return {
    success: true,
    operationId,
    auditLogId,
  };
}

// =====================================================
// Sync Conflict Handling
// =====================================================

/**
 * Process offline refund operation during sync
 *
 * Checks for conflicts before applying.
 *
 * @param operation - Offline refund operation
 * @returns Operation result
 */
export async function syncRefundOperation(
  operation: IOfflineRefundOperation
): Promise<IFinancialOperationResult> {
  // Get current order state from server
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, updated_at, status, refund_amount, total')
    .eq('id', operation.orderId)
    .single();

  if (error || !order) {
    return {
      success: false,
      operationId: operation.id,
      auditLogId: '',
      error: 'Order not found on server',
    };
  }

  // Check for conflict
  const resolution: IConflictResolution = {
    serverUpdatedAt: new Date(order.updated_at),
    localOperationAt: new Date(operation.createdAt),
    rule: 'reject_if_server_newer',
  };

  if (shouldRejectForConflict(resolution)) {
    return {
      success: false,
      operationId: operation.id,
      auditLogId: '',
      error: 'Conflict: Order was modified after refund was created. Please review and retry.',
    };
  }

  // Apply the refund
  return applyRefund(
    {
      orderId: operation.orderId,
      amount: operation.amount,
      reason: operation.reason,
      reasonCode: operation.reasonCode as never,
      method: operation.method,
      refundedBy: operation.refundedBy,
    },
    operation.id
  );
}

// =====================================================
// Service Export
// =====================================================

export const refundService = {
  canRefundOrder,
  canOrderBeRefunded,
  getMaxRefundableAmount,
  refundOrder,
  syncRefundOperation,
};

// Alias for backward compatibility with modal imports
export const processRefund = refundOrder;

export default refundService;
