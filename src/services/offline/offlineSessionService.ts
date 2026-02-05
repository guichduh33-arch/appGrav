/**
 * Offline Session Service
 *
 * Provides session management for offline POS operations:
 * - Open/close POS sessions when offline
 * - Calculate session totals from orders/payments
 * - Manage variance tracking
 * - Integrate with sync queue
 *
 * @see Story 3.5: POS Session Management Offline
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */

import { db } from '@/lib/db';
import type {
  IOfflineSession,
  ISyncQueueItem,
  ISessionPaymentTotals,
  ISessionClosingData,
} from '@/types/offline';
import { LOCAL_SESSION_ID_PREFIX } from '@/types/offline';

/**
 * Generate a local UUID with LOCAL-SESSION- prefix
 */
export function generateLocalSessionId(): string {
  return `${LOCAL_SESSION_ID_PREFIX}${crypto.randomUUID()}`;
}

/**
 * Get active (open) session for a user
 * @returns The active session or null if no active session
 */
export async function getActiveSession(
  userId: string
): Promise<IOfflineSession | null> {
  const session = await db.offline_sessions
    .where({ user_id: userId, status: 'open' })
    .first();
  return session ?? null;
}

/**
 * Check if user has an active session
 */
export async function hasActiveSession(userId: string): Promise<boolean> {
  const count = await db.offline_sessions
    .where({ user_id: userId, status: 'open' })
    .count();
  return count > 0;
}

/**
 * Open a new POS session offline
 *
 * Creates a new session with the given opening amount and adds it to the sync queue.
 * Only one session can be active per user at a time.
 *
 * @param userId - The user opening the session
 * @param openingAmount - Initial cash float in IDR
 * @throws Error if user already has an active session
 * @returns The created session
 */
export async function openSession(
  userId: string,
  openingAmount: number
): Promise<IOfflineSession> {
  const now = new Date().toISOString();
  const sessionId = generateLocalSessionId();

  const session: IOfflineSession = {
    id: sessionId,
    user_id: userId,
    status: 'open',
    opening_amount: openingAmount,
    expected_totals: null,
    actual_totals: null,
    cash_variance: null,
    notes: null,
    opened_at: now,
    closed_at: null,
    sync_status: 'pending_sync',
  };

  // C-4: Atomic transaction - check and create in single transaction
  // to prevent race condition where two threads could both pass
  // the hasActiveSession check before either creates a session
  await db.transaction(
    'rw',
    [db.offline_sessions, db.offline_sync_queue],
    async () => {
      // Check inside transaction for atomicity
      const existingCount = await db.offline_sessions
        .where({ user_id: userId, status: 'open' })
        .count();

      if (existingCount > 0) {
        throw new Error('Session already active');
      }

      await db.offline_sessions.add(session);

      // Add to sync queue
      const syncItem: Omit<ISyncQueueItem, 'id'> = {
        entity: 'pos_sessions',
        action: 'create',
        entityId: sessionId,
        payload: { session },
        created_at: now,
        status: 'pending',
        retries: 0,
      };
      await db.offline_sync_queue.add(syncItem as ISyncQueueItem);
    }
  );

  return session;
}

/**
 * Calculate session totals from orders and payments
 *
 * Aggregates all payments linked to orders created during the session.
 * Payment method totals are calculated from offline_payments.
 *
 * @param sessionId - The session ID to calculate totals for
 * @returns Payment totals aggregated by method
 */
export async function calculateSessionTotals(
  sessionId: string
): Promise<ISessionPaymentTotals> {
  // Get all orders for this session
  const orders = await db.offline_orders
    .where('session_id')
    .equals(sessionId)
    .toArray();

  // Initialize totals
  const totals: ISessionPaymentTotals = {
    cash: 0,
    card: 0,
    qris: 0,
    edc: 0,
    transfer: 0,
    total: 0,
  };

  // If no orders, return zeros
  if (orders.length === 0) {
    return totals;
  }

  const orderIds = orders.map((o) => o.id);

  // Get all payments for these orders
  const payments = await db.offline_payments
    .where('order_id')
    .anyOf(orderIds)
    .toArray();

  // Aggregate by payment method
  for (const payment of payments) {
    const amount = payment.amount;
    switch (payment.method) {
      case 'cash':
        totals.cash += amount;
        break;
      case 'card':
        totals.card += amount;
        break;
      case 'qris':
        totals.qris += amount;
        break;
      case 'edc':
        totals.edc += amount;
        break;
      case 'transfer':
        totals.transfer += amount;
        break;
    }
    totals.total += amount;
  }

  return totals;
}

/**
 * Close a POS session offline
 *
 * Records the actual counted amounts, calculates variance, and updates the session.
 * Adds an update entry to the sync queue.
 *
 * @param sessionId - The session ID to close
 * @param closingData - Actual counted amounts and notes
 * @throws Error if session not found or not open
 * @returns The updated session with closing data
 */
export async function closeSession(
  sessionId: string,
  closingData: ISessionClosingData
): Promise<IOfflineSession> {
  const session = await db.offline_sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'open') {
    throw new Error('Session is not open');
  }

  const now = new Date().toISOString();

  // Calculate expected totals from orders/payments
  const expectedTotals = await calculateSessionTotals(sessionId);

  // Build actual totals from closing data
  const actualTotals: ISessionPaymentTotals = {
    cash: closingData.actual_cash,
    card: closingData.actual_card,
    qris: closingData.actual_qris,
    edc: closingData.actual_edc,
    transfer: closingData.actual_transfer,
    total:
      closingData.actual_cash +
      closingData.actual_card +
      closingData.actual_qris +
      closingData.actual_edc +
      closingData.actual_transfer,
  };

  // Calculate cash variance (including opening amount)
  // Expected cash = opening_amount + cash payments received
  const expectedCash = expectedTotals.cash + session.opening_amount;
  // Variance = actual - expected (positive = surplus, negative = shortage)
  const cashVariance = closingData.actual_cash - expectedCash;

  const updatedSession: IOfflineSession = {
    ...session,
    status: 'closed',
    expected_totals: expectedTotals,
    actual_totals: actualTotals,
    cash_variance: cashVariance,
    notes: closingData.notes ?? null,
    closed_at: now,
    sync_status: 'pending_sync',
  };

  await db.transaction(
    'rw',
    [db.offline_sessions, db.offline_sync_queue],
    async () => {
      await db.offline_sessions.put(updatedSession);

      // Add to sync queue
      const syncItem: Omit<ISyncQueueItem, 'id'> = {
        entity: 'pos_sessions',
        action: 'update',
        entityId: sessionId,
        payload: { session: updatedSession },
        created_at: now,
        status: 'pending',
        retries: 0,
      };
      await db.offline_sync_queue.add(syncItem as ISyncQueueItem);
    }
  );

  return updatedSession;
}

/**
 * Get session by ID
 *
 * @param sessionId - The session ID to retrieve
 * @returns The session or null if not found
 */
export async function getSessionById(
  sessionId: string
): Promise<IOfflineSession | null> {
  const session = await db.offline_sessions.get(sessionId);
  return session ?? null;
}

/**
 * Get all sessions for a user
 *
 * @param userId - The user ID to get sessions for
 * @returns Array of sessions sorted by opened_at descending
 */
export async function getSessionsByUserId(
  userId: string
): Promise<IOfflineSession[]> {
  return db.offline_sessions
    .where('user_id')
    .equals(userId)
    .reverse()
    .sortBy('opened_at');
}
