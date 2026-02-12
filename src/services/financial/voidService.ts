/**
 * Void Service - Order Void Operations
 *
 * Handles voiding orders with audit trail and offline support.
 * Requires PIN verification and 'sales.void' permission.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { IVoidInput, IFinancialOperationResult, IConflictResolution } from '@/types/payment';
import {
  validateVoidInput,
  shouldRejectForConflict,
  VOID_PERMISSION,
} from './financialOperationService';
import { logVoidOperation } from './auditService';
import { logError } from '@/utils/logger'

// =====================================================
// Types
// =====================================================

/**
 * Void operation for offline queue
 */
interface IOfflineVoidOperation {
  id: string;
  orderId: string;
  reason: string;
  reasonCode: string;
  voidedBy: string;
  createdAt: string;
  synced: boolean;
}

// =====================================================
// Constants
// =====================================================

const LOCAL_VOID_PREFIX = 'LOCAL-VOID-';

// =====================================================
// Validation
// =====================================================

/**
 * Check if user has void permission
 *
 * This is a placeholder - actual permission check should use usePermissions hook
 * or the user_has_permission database function.
 *
 * @param userId - User ID to check
 * @returns true if user has void permission
 */
export async function canVoidOrder(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_permission_code: VOID_PERMISSION,
  });

  if (error) {
    logError('Permission check failed:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if order can be voided
 *
 * @param orderId - Order ID to check
 * @returns Object with canVoid flag and reason if not
 */
export async function canOrderBeVoided(
  orderId: string
): Promise<{ canVoid: boolean; reason?: string }> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, refund_amount')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { canVoid: false, reason: 'Order not found' };
  }

  // Cannot void already voided orders
  if (order.status === 'voided') {
    return { canVoid: false, reason: 'Order is already voided' };
  }

  // Cannot void orders with refunds
  if (order.refund_amount && order.refund_amount > 0) {
    return { canVoid: false, reason: 'Order has been refunded' };
  }

  // Cannot void completed orders (use refund instead)
  if (order.status === 'completed') {
    return { canVoid: false, reason: 'Completed orders should be refunded, not voided' };
  }

  return { canVoid: true };
}

// =====================================================
// Void Operations
// =====================================================

/**
 * Void an order
 *
 * If online, applies immediately. If offline, queues for sync with conflict detection.
 *
 * @param input - Void operation input
 * @param isOffline - Whether to queue for offline sync
 * @returns Operation result
 */
export async function voidOrder(
  input: IVoidInput,
  isOffline = false
): Promise<IFinancialOperationResult> {
  // Validate input
  const validationErrors = validateVoidInput(input);
  if (validationErrors.length > 0) {
    return {
      success: false,
      operationId: '',
      auditLogId: '',
      error: validationErrors.join('; '),
    };
  }

  const operationId = isOffline
    ? `${LOCAL_VOID_PREFIX}${crypto.randomUUID()}`
    : crypto.randomUUID();

  try {
    if (isOffline) {
      // Queue for offline sync
      return await queueOfflineVoid(input, operationId);
    } else {
      // Apply immediately
      return await applyVoid(input, operationId);
    }
  } catch (error) {
    return {
      success: false,
      operationId,
      auditLogId: '',
      error: error instanceof Error ? error.message : 'Unknown void error',
    };
  }
}

/**
 * Apply void operation directly (online mode)
 */
async function applyVoid(
  input: IVoidInput,
  operationId: string
): Promise<IFinancialOperationResult> {
  // Check if order can be voided
  const canVoid = await canOrderBeVoided(input.orderId);
  if (!canVoid.canVoid) {
    return {
      success: false,
      operationId,
      auditLogId: '',
      error: canVoid.reason,
    };
  }

  // Update order status to voided
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'voided',
      cancellation_reason: `[${input.reasonCode}] ${input.reason}`,
      cancelled_at: new Date().toISOString(),
      cancelled_by: input.voidedBy,
    })
    .eq('id', input.orderId);

  if (updateError) {
    return {
      success: false,
      operationId,
      auditLogId: '',
      error: `Failed to void order: ${updateError.message}`,
    };
  }

  // Create audit log
  const auditLogId = await logVoidOperation(
    input.orderId,
    input.voidedBy,
    input.reason,
    input.reasonCode,
    false
  );

  return {
    success: true,
    operationId,
    auditLogId,
  };
}

/**
 * Queue void operation for offline sync
 */
async function queueOfflineVoid(
  input: IVoidInput,
  operationId: string
): Promise<IFinancialOperationResult> {
  const now = new Date().toISOString();

  const offlineOperation: IOfflineVoidOperation = {
    id: operationId,
    orderId: input.orderId,
    reason: input.reason,
    reasonCode: input.reasonCode,
    voidedBy: input.voidedBy,
    createdAt: now,
    synced: false,
  };

  // Add to sync queue
  await db.offline_sync_queue.add({
    entity: 'void_operations' as never, // Type workaround
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
  const auditLogId = await logVoidOperation(
    input.orderId,
    input.voidedBy,
    input.reason,
    input.reasonCode,
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
 * Process offline void operation during sync
 *
 * Checks for conflicts before applying.
 *
 * @param operation - Offline void operation
 * @returns Operation result
 */
export async function syncVoidOperation(
  operation: IOfflineVoidOperation
): Promise<IFinancialOperationResult> {
  // Get current order state from server
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, updated_at, status')
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
      error: 'Conflict: Order was modified after void was created. Please review and retry.',
    };
  }

  // Apply the void
  return applyVoid(
    {
      orderId: operation.orderId,
      reason: operation.reason,
      reasonCode: operation.reasonCode as never,
      voidedBy: operation.voidedBy,
    },
    operation.id
  );
}

// =====================================================
// Service Export
// =====================================================

export const voidService = {
  canVoidOrder,
  canOrderBeVoided,
  voidOrder,
  syncVoidOperation,
};

export default voidService;
