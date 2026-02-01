/**
 * Session Sync Processor (Story 3.6)
 *
 * Handles synchronization of POS sessions to Supabase.
 * Sessions must be synced BEFORE orders to establish FK relationships.
 *
 * @see ADR-002: Stratégie de Synchronisation
 * @see Story 3.5: POS Session Management Offline
 */

import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { ISyncQueueItem } from '@/types/offline';
import type { ISyncResult } from './syncQueueHelpers';

/**
 * Process a POS session sync queue item
 *
 * Steps:
 * 1. Read local session from offline_sessions
 * 2. Insert session into Supabase pos_sessions
 * 3. Update local session with server_id and sync_status
 *
 * @param item - Sync queue item for a session
 * @returns Promise with sync result including server ID
 */
export async function processSessionSync(
  item: ISyncQueueItem
): Promise<ISyncResult> {
  try {
    // 1. Read local session
    const session = await db.offline_sessions.get(item.entityId);
    if (!session) {
      return { success: false, error: 'Session not found in local cache' };
    }

    // 2. Insert session into Supabase
    const { data: serverSession, error: sessionError } = await supabase
      .from('pos_sessions')
      .insert({
        user_id: session.user_id,
        opening_amount: session.opening_amount,
        status: session.status,
        expected_cash: session.expected_totals?.cash ?? 0,
        expected_card: session.expected_totals?.card ?? 0,
        expected_qris: session.expected_totals?.qris ?? 0,
        expected_transfer: session.expected_totals?.transfer ?? 0,
        expected_ewallet: session.expected_totals?.ewallet ?? 0,
        actual_cash: session.actual_totals?.cash ?? null,
        actual_card: session.actual_totals?.card ?? null,
        actual_qris: session.actual_totals?.qris ?? null,
        actual_transfer: session.actual_totals?.transfer ?? null,
        actual_ewallet: session.actual_totals?.ewallet ?? null,
        cash_variance: session.cash_variance,
        notes: session.notes,
        opened_at: session.opened_at,
        closed_at: session.closed_at,
      })
      .select('id')
      .single();

    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    const serverId = serverSession.id;

    // 3. Update local session with server_id and sync_status
    await db.offline_sessions.update(item.entityId, {
      server_id: serverId,
      sync_status: 'synced',
    });

    return { success: true, serverId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update orders that have a local session_id with the server session_id
 *
 * Called after a session is successfully synced to update FK references.
 * Uses Dexie transaction for atomicity per Epic 2 retrospective.
 *
 * @param localSessionId - Local session ID (LOCAL-SESSION-*)
 * @param serverSessionId - Server-assigned session UUID
 */
export async function updateOrdersWithSessionServerId(
  localSessionId: string,
  serverSessionId: string
): Promise<void> {
  await db.transaction('rw', db.offline_orders, async () => {
    // Find all orders with this local session_id
    const orders = await db.offline_orders
      .where('session_id')
      .equals(localSessionId)
      .toArray();

    // Update each order with the server session_id
    for (const order of orders) {
      await db.offline_orders.update(order.id, {
        session_id: serverSessionId,
      });
    }
  });
}
