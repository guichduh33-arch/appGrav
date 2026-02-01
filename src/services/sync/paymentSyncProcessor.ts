/**
 * Payment Sync Processor (Story 3.6)
 *
 * Handles synchronization of standalone payments to Supabase.
 * Payments are typically synced WITH orders (see orderSyncProcessor),
 * but this processor handles edge cases where payments need separate sync.
 *
 * Processing order: Sessions → Orders (with payments) → Standalone Payments
 *
 * @see ADR-002: Stratégie de Synchronisation
 * @see Story 3.4: Offline Payment Processing
 */

import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { ISyncQueueItem } from '@/types/offline';
import { isLocalId, type ISyncResult } from './syncQueueHelpers';

/**
 * Process a payment sync queue item
 *
 * This handles standalone payment sync. Most payments are synced
 * as part of order sync in orderSyncProcessor.
 *
 * Steps:
 * 1. Read local payment from offline_payments
 * 2. Resolve order_id (local → server if already synced)
 * 3. Insert payment into Supabase
 * 4. Update local payment with server_id and sync_status
 *
 * @param item - Sync queue item for a payment
 * @param orderIdMap - Map of local order IDs to server IDs
 * @returns Promise with sync result
 */
export async function processPaymentSync(
  item: ISyncQueueItem,
  orderIdMap: Map<string, string>
): Promise<ISyncResult> {
  try {
    // 1. Read local payment
    const payment = await db.offline_payments.get(item.entityId);
    if (!payment) {
      return { success: false, error: 'Payment not found in local cache' };
    }

    // Check if payment was already synced as part of order sync
    if (payment.sync_status === 'synced') {
      return { success: true, serverId: payment.server_id };
    }

    // 2. Resolve order_id
    let serverOrderId: string = payment.order_id;
    if (isLocalId(payment.order_id)) {
      const mappedOrderId = orderIdMap.get(payment.order_id);
      if (!mappedOrderId) {
        // Check if order was synced and has server_id
        const order = await db.offline_orders.get(payment.order_id);
        if (order?.server_id) {
          serverOrderId = order.server_id;
        } else {
          return {
            success: false,
            error: 'Order not yet synced - payment will retry after order sync',
          };
        }
      } else {
        serverOrderId = mappedOrderId;
      }
    }

    // 3. Insert payment into Supabase
    const { data: serverPayment, error: paymentError } = await supabase
      .from('order_payments')
      .insert({
        order_id: serverOrderId,
        method: payment.method,
        amount: payment.amount,
        cash_received: payment.cash_received,
        change_given: payment.change_given,
        reference: payment.reference,
        user_id: payment.user_id,
        created_at: payment.created_at,
      })
      .select('id')
      .single();

    if (paymentError) {
      return { success: false, error: paymentError.message };
    }

    const serverId = serverPayment.id;

    // 4. Update local payment with server_id and sync_status
    await db.offline_payments.update(item.entityId, {
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
 * Mark a payment as synced
 *
 * @param localId - Local payment ID
 * @param serverId - Server-assigned UUID
 */
export async function markPaymentSynced(
  localId: string,
  serverId: string
): Promise<void> {
  await db.offline_payments.update(localId, {
    server_id: serverId,
    sync_status: 'synced',
  });
}
