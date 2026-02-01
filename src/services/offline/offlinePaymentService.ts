/**
 * Offline Payment Service (Story 3.4)
 *
 * Manages offline payments in IndexedDB via Dexie.
 * Handles payment creation, retrieval, and sync queue integration.
 *
 * Key features:
 * - Generate LOCAL-PAY-prefixed UUIDs for offline payments
 * - Automatic sync status based on payment method
 * - Split payment support
 * - Change calculation for cash payments
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */

import { db } from '@/lib/db';
import type {
  IOfflinePayment,
  ISyncQueueItem,
  TPaymentMethod,
  TOfflinePaymentSyncStatus,
  TSyncAction,
} from '@/types/offline';
import { LOCAL_PAYMENT_ID_PREFIX } from '@/types/offline';

// =====================================================
// ID Generation
// =====================================================

/**
 * Generate a local UUID with LOCAL-PAY- prefix
 *
 * The prefix identifies payments created offline.
 * After successful sync, server_id will contain the actual server UUID.
 *
 * @returns UUID string with LOCAL-PAY- prefix (e.g., "LOCAL-PAY-550e8400-e29b-41d4-a716-446655440000")
 */
export function generateLocalPaymentId(): string {
  return `${LOCAL_PAYMENT_ID_PREFIX}${crypto.randomUUID()}`;
}

/**
 * Check if a payment ID was generated offline
 *
 * @param id - Payment ID to check
 * @returns true if the ID has the LOCAL-PAY- prefix
 */
export function isLocalPaymentId(id: string): boolean {
  return id.startsWith(LOCAL_PAYMENT_ID_PREFIX);
}

// =====================================================
// Sync Status Determination
// =====================================================

/**
 * Determine sync status based on payment method
 *
 * - Cash: pending_sync (can sync immediately)
 * - Card/QRIS/etc: pending_validation (needs online validation)
 *
 * @param method - Payment method
 * @returns Appropriate sync status
 */
function getSyncStatus(method: TPaymentMethod): TOfflinePaymentSyncStatus {
  if (method === 'cash') {
    return 'pending_sync';
  }
  // Card, QRIS, transfer, ewallet need online validation
  return 'pending_validation';
}

// =====================================================
// Change Calculation
// =====================================================

/**
 * Calculate change for cash payment
 *
 * @param total - Order total amount
 * @param cashReceived - Cash amount received from customer
 * @returns Change to give back (always >= 0)
 */
export function calculateChange(total: number, cashReceived: number): number {
  return Math.max(0, cashReceived - total);
}

// =====================================================
// Sync Queue Integration
// =====================================================

/**
 * Add a payment operation to the sync queue
 *
 * @param action - CRUD action (create, update, delete)
 * @param entityId - Payment ID or Order ID for grouping
 * @param payload - Operation payload
 */
async function addPaymentToSyncQueue(
  action: TSyncAction,
  entityId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const item: Omit<ISyncQueueItem, 'id'> = {
    entity: 'payments',
    action,
    entityId,
    payload,
    created_at: new Date().toISOString(),
    status: 'pending',
    retries: 0,
  };

  await db.offline_sync_queue.add(item as ISyncQueueItem);
}

// =====================================================
// Input Types
// =====================================================

/**
 * Input type for creating an offline payment
 * Excludes auto-generated fields
 */
export type TCreateOfflinePaymentInput = {
  order_id: string;
  method: TPaymentMethod;
  amount: number;
  cash_received?: number;
  change_given?: number;
  reference?: string;
  user_id: string;
  session_id?: string | null;
};

// =====================================================
// Payment CRUD Operations
// =====================================================

/**
 * Save a single payment to IndexedDB
 *
 * Automatically:
 * - Generates LOCAL-PAY-prefixed UUID
 * - Sets sync_status based on payment method
 * - Adds entry to sync queue
 *
 * All operations run in a transaction for data integrity.
 *
 * @param input - Payment data
 * @returns Promise with created payment
 */
export async function saveOfflinePayment(
  input: TCreateOfflinePaymentInput
): Promise<IOfflinePayment> {
  // Input validation
  if (!input.order_id) {
    throw new Error('Payment must have an order_id');
  }
  if (!input.user_id) {
    throw new Error('Payment must have a user_id');
  }
  if (input.amount <= 0) {
    throw new Error('Payment amount must be positive');
  }

  const now = new Date().toISOString();
  const paymentId = generateLocalPaymentId();
  const syncStatus = getSyncStatus(input.method);

  const payment: IOfflinePayment = {
    id: paymentId,
    order_id: input.order_id,
    method: input.method,
    amount: input.amount,
    cash_received: input.cash_received ?? null,
    change_given: input.change_given ?? null,
    reference: input.reference ?? null,
    user_id: input.user_id,
    session_id: input.session_id ?? null,
    created_at: now,
    sync_status: syncStatus,
  };

  await db.transaction(
    'rw',
    [db.offline_payments, db.offline_sync_queue],
    async () => {
      await db.offline_payments.add(payment);
      await addPaymentToSyncQueue('create', paymentId, { payment });
    }
  );

  return payment;
}

/**
 * Save multiple payments (split payment) to IndexedDB
 *
 * All payments are linked to the same order.
 * A single sync queue entry is created for all payments.
 *
 * @param orderId - Order ID to link payments to
 * @param payments - Array of payment data
 * @returns Promise with created payments
 */
export async function saveOfflinePayments(
  orderId: string,
  payments: Omit<TCreateOfflinePaymentInput, 'order_id'>[]
): Promise<IOfflinePayment[]> {
  // Input validation
  if (!orderId) {
    throw new Error('orderId is required');
  }
  if (payments.length === 0) {
    throw new Error('At least one payment is required');
  }

  const now = new Date().toISOString();

  const fullPayments: IOfflinePayment[] = payments.map((input) => {
    if (!input.user_id) {
      throw new Error('Payment must have a user_id');
    }
    if (input.amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    return {
      id: generateLocalPaymentId(),
      order_id: orderId,
      method: input.method,
      amount: input.amount,
      cash_received: input.cash_received ?? null,
      change_given: input.change_given ?? null,
      reference: input.reference ?? null,
      user_id: input.user_id,
      session_id: input.session_id ?? null,
      created_at: now,
      sync_status: getSyncStatus(input.method),
    };
  });

  await db.transaction(
    'rw',
    [db.offline_payments, db.offline_sync_queue],
    async () => {
      await db.offline_payments.bulkAdd(fullPayments);

      // Single sync queue entry for all payments (grouped by order)
      await addPaymentToSyncQueue('create', orderId, {
        payments: fullPayments,
      });
    }
  );

  return fullPayments;
}

// =====================================================
// Payment Retrieval Operations
// =====================================================

/**
 * Get all payments for a specific order
 *
 * @param orderId - Order ID
 * @returns Promise with array of payments
 */
export async function getPaymentsByOrderId(
  orderId: string
): Promise<IOfflinePayment[]> {
  return db.offline_payments.where('order_id').equals(orderId).toArray();
}

/**
 * Get a specific payment by ID
 *
 * @param id - Payment ID
 * @returns Promise with payment or undefined if not found
 */
export async function getOfflinePaymentById(
  id: string
): Promise<IOfflinePayment | undefined> {
  return db.offline_payments.get(id);
}

/**
 * Get total paid amount for an order
 *
 * @param orderId - Order ID
 * @returns Promise with total paid amount
 */
export async function getOrderPaidAmount(orderId: string): Promise<number> {
  const payments = await getPaymentsByOrderId(orderId);
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Get payments by sync status
 *
 * @param syncStatus - Sync status to filter by
 * @returns Promise with array of payments
 */
export async function getPaymentsBySyncStatus(
  syncStatus: TOfflinePaymentSyncStatus
): Promise<IOfflinePayment[]> {
  return db.offline_payments.where('sync_status').equals(syncStatus).toArray();
}

/**
 * Get count of payments pending synchronization
 *
 * @returns Promise with count of pending payments
 */
export async function getPendingSyncPaymentsCount(): Promise<number> {
  const pendingSync = await db.offline_payments
    .where('sync_status')
    .equals('pending_sync')
    .count();
  const pendingValidation = await db.offline_payments
    .where('sync_status')
    .equals('pending_validation')
    .count();
  return pendingSync + pendingValidation;
}

// =====================================================
// Sync Status Operations
// =====================================================

/**
 * Mark a payment as synced with the server
 *
 * @param localId - Local payment ID
 * @param serverId - Server-assigned UUID
 */
export async function markPaymentSynced(
  localId: string,
  serverId: string
): Promise<void> {
  await db.offline_payments.update(localId, {
    sync_status: 'synced',
    server_id: serverId,
  });
}

/**
 * Mark a payment with a sync conflict
 *
 * @param id - Payment ID
 */
export async function markPaymentConflict(id: string): Promise<void> {
  await db.offline_payments.update(id, {
    sync_status: 'conflict',
  });
}

// =====================================================
// Cleanup Operations
// =====================================================

/**
 * Delete all payments for an order
 *
 * @param orderId - Order ID
 */
export async function deletePaymentsByOrderId(orderId: string): Promise<void> {
  await db.offline_payments.where('order_id').equals(orderId).delete();
}

/**
 * Clear all offline payments
 *
 * Used for testing and recovery scenarios.
 */
export async function clearOfflinePayments(): Promise<void> {
  await db.offline_payments.clear();
}
