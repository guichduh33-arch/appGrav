/**
 * Audit Service - Financial Operation Audit Trail
 *
 * Handles audit logging for critical financial operations (void, refund).
 * All operations are logged with severity='critical' for compliance.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { FINANCIAL_OPERATION_SEVERITY } from './financialOperationService';

// =====================================================
// Types
// =====================================================

/**
 * Audit action types for financial operations
 */
export type TAuditAction =
  | 'order_voided'
  | 'order_refunded'
  | 'payment_failed'
  | 'payment_reversed';

/**
 * Audit log entry input
 */
export interface IAuditLogInput {
  action: TAuditAction;
  entityType: 'order' | 'payment';
  entityId: string;
  userId: string;
  details: Record<string, unknown>;
  isOffline?: boolean;
}

/**
 * Audit log entry (matches database schema)
 */
export interface IAuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  severity: string;
  details: Record<string, unknown>;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

// =====================================================
// Offline Audit Log Queue
// =====================================================

/**
 * Offline audit log entry for sync queue
 */
interface IOfflineAuditLog {
  id: string;
  action: TAuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  severity: string;
  details: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

/**
 * Generate local UUID for offline audit logs
 */
function generateLocalAuditId(): string {
  return `LOCAL-AUDIT-${crypto.randomUUID()}`;
}

// =====================================================
// Audit Logging
// =====================================================

/**
 * Log a financial operation to the audit trail
 *
 * If offline, queues the log for later sync.
 * All financial operations are logged with severity='critical'.
 *
 * @param input - Audit log input
 * @returns Audit log ID (local ID if offline)
 */
export async function logFinancialOperation(
  input: IAuditLogInput
): Promise<string> {
  const auditId = input.isOffline ? generateLocalAuditId() : crypto.randomUUID();
  const now = new Date().toISOString();

  const logEntry = {
    id: auditId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    user_id: input.userId,
    severity: FINANCIAL_OPERATION_SEVERITY,
    details: input.details,
    created_at: now,
  };

  if (input.isOffline) {
    // Queue for offline sync
    await queueOfflineAuditLog({
      id: auditId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId,
      severity: FINANCIAL_OPERATION_SEVERITY,
      details: input.details,
      createdAt: now,
      synced: false,
    });
  } else {
    // Insert directly to Supabase
    const { error } = await supabase.from('audit_logs').insert(logEntry);

    if (error) {
      console.error('Failed to insert audit log:', error);
      // Fall back to offline queue on error
      await queueOfflineAuditLog({
        id: auditId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        severity: FINANCIAL_OPERATION_SEVERITY,
        details: input.details,
        createdAt: now,
        synced: false,
      });
    }
  }

  return auditId;
}

/**
 * Log a void operation
 *
 * @param orderId - Voided order ID
 * @param userId - User who performed the void
 * @param reason - Void reason text
 * @param reasonCode - Void reason code
 * @param isOffline - Whether operation is offline
 * @returns Audit log ID
 */
export async function logVoidOperation(
  orderId: string,
  userId: string,
  reason: string,
  reasonCode: string,
  isOffline = false
): Promise<string> {
  return logFinancialOperation({
    action: 'order_voided',
    entityType: 'order',
    entityId: orderId,
    userId,
    details: {
      reason,
      reasonCode,
      voidedAt: new Date().toISOString(),
    },
    isOffline,
  });
}

/**
 * Log a refund operation
 *
 * @param orderId - Refunded order ID
 * @param userId - User who performed the refund
 * @param amount - Refund amount
 * @param reason - Refund reason text
 * @param reasonCode - Refund reason code
 * @param method - Refund payment method
 * @param isOffline - Whether operation is offline
 * @returns Audit log ID
 */
export async function logRefundOperation(
  orderId: string,
  userId: string,
  amount: number,
  reason: string,
  reasonCode: string,
  method: string,
  isOffline = false
): Promise<string> {
  return logFinancialOperation({
    action: 'order_refunded',
    entityType: 'order',
    entityId: orderId,
    userId,
    details: {
      amount,
      reason,
      reasonCode,
      method,
      refundedAt: new Date().toISOString(),
    },
    isOffline,
  });
}

// =====================================================
// Offline Queue Management
// =====================================================

/**
 * Queue an audit log for offline sync
 *
 * Uses the general sync queue with entity type 'audit_logs'
 */
async function queueOfflineAuditLog(log: IOfflineAuditLog): Promise<void> {
  // Convert IOfflineAuditLog to plain object for storage
  const payload: Record<string, unknown> = {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    userId: log.userId,
    severity: log.severity,
    details: log.details,
    createdAt: log.createdAt,
    synced: log.synced,
  };

  await db.offline_sync_queue.add({
    entity: 'audit_logs' as never, // Type workaround - extend TSyncEntity if needed
    action: 'create',
    entityId: log.id,
    payload,
    created_at: log.createdAt,
    status: 'pending',
    retries: 0,
  });
}

/**
 * Get pending offline audit logs
 *
 * @returns Array of pending audit log IDs
 */
export async function getPendingAuditLogs(): Promise<string[]> {
  const pending = await db.offline_sync_queue
    .where('entity')
    .equals('audit_logs')
    .and((item) => item.status === 'pending')
    .toArray();

  return pending.map((item) => item.entityId);
}

// =====================================================
// Audit Log Retrieval
// =====================================================

/**
 * Get audit logs for an entity
 *
 * @param entityType - Entity type (order, payment)
 * @param entityId - Entity ID
 * @returns Array of audit log entries
 */
export async function getAuditLogsForEntity(
  entityType: string,
  entityId: string
): Promise<IAuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }

  return data as IAuditLogEntry[];
}

/**
 * Get recent financial operation audit logs
 *
 * @param limit - Maximum number of logs to return
 * @returns Array of recent audit log entries
 */
export async function getRecentFinancialOperations(
  limit = 50
): Promise<IAuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('severity', FINANCIAL_OPERATION_SEVERITY)
    .in('action', ['order_voided', 'order_refunded'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch financial operations:', error);
    return [];
  }

  return data as IAuditLogEntry[];
}

// =====================================================
// Service Export
// =====================================================

export const auditService = {
  logFinancialOperation,
  logVoidOperation,
  logRefundOperation,
  getPendingAuditLogs,
  getAuditLogsForEntity,
  getRecentFinancialOperations,
};

export default auditService;
