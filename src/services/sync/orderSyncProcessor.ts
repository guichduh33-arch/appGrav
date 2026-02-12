/**
 * Order Sync Processor (Story 3.6)
 *
 * Handles synchronization of offline orders to Supabase.
 * Orders are synced AFTER sessions to resolve session_id FK.
 * Also syncs associated order_items and payments.
 *
 * @see ADR-002: Stratégie de Synchronisation
 * @see Story 3.1: Dexie Schema for Orders
 * @see Story 3.3: Offline Order Creation
 * @see Story 3.4: Offline Payment Processing
 */

import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { ISyncQueueItem, IOfflineOrderItem, IOfflinePayment } from '@/types/offline';
import { isLocalId, detectConflictType, type ISyncResult } from './syncQueueHelpers';
import { logError } from '@/utils/logger'

/**
 * Process an order sync queue item
 *
 * Steps:
 * 1. Read local order from offline_orders
 * 2. Read local order items from offline_order_items
 * 3. Read local payments from offline_payments
 * 4. Remap session_id if needed (local → server)
 * 5. Insert order into Supabase
 * 6. Insert order_items with new order_id
 * 7. Insert payments with new order_id
 * 8. Update local entities with server IDs and sync_status
 *
 * @param item - Sync queue item for an order
 * @param sessionIdMap - Map of local session IDs to server IDs
 * @returns Promise with sync result including server ID
 */
export async function processOrderSync(
  item: ISyncQueueItem,
  sessionIdMap: Map<string, string>
): Promise<ISyncResult> {
  try {
    // 1. Read local order
    const order = await db.offline_orders.get(item.entityId);
    if (!order) {
      return { success: false, error: 'Order not found in local cache' };
    }

    // 2. Read local order items
    const items = await db.offline_order_items
      .where('order_id')
      .equals(item.entityId)
      .toArray();

    // 3. Read local payments
    const payments = await db.offline_payments
      .where('order_id')
      .equals(item.entityId)
      .toArray();

    // 4. Remap session_id if needed
    let serverSessionId: string | null = order.session_id;
    if (order.session_id && isLocalId(order.session_id)) {
      serverSessionId = sessionIdMap.get(order.session_id) ?? null;
    }

    // 5. Insert order into Supabase
    const { data: serverOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: order.order_number,
        status: order.status,
        order_type: order.order_type,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        discount_amount: order.discount_amount,
        discount_type: order.discount_type,
        total: order.total,
        customer_id: order.customer_id,
        table_number: order.table_number,
        notes: order.notes,
        user_id: order.user_id,
        session_id: serverSessionId,
        created_at: order.created_at,
      })
      .select('id')
      .single();

    if (orderError) {
      // C-3: Detect conflict type
      const conflictType = detectConflictType(orderError);
      return { success: false, error: orderError.message, conflictType };
    }

    const serverId = serverOrder.id;

    // 6. Insert order items with new order_id
    if (items.length > 0) {
      const serverItems = items.map((orderItem: IOfflineOrderItem) => ({
        order_id: serverId,
        product_id: orderItem.product_id,
        product_name: orderItem.product_name,
        product_sku: orderItem.product_sku,
        quantity: orderItem.quantity,
        unit_price: orderItem.unit_price,
        subtotal: orderItem.subtotal,
        modifiers: orderItem.modifiers,
        notes: orderItem.notes,
        dispatch_station: orderItem.dispatch_station,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(serverItems);

      if (itemsError) {
        logError('[OrderSync] Failed to insert items:', itemsError);
        // Continue - order was created successfully
      }
    }

    // 7. Insert payments with new order_id
    if (payments.length > 0) {
      const serverPayments = payments.map((payment: IOfflinePayment) => ({
        order_id: serverId,
        method: payment.method,
        amount: payment.amount,
        cash_received: payment.cash_received,
        change_given: payment.change_given,
        reference: payment.reference,
        user_id: payment.user_id,
        created_at: payment.created_at,
      }));

      const { error: paymentsError } = await supabase
        .from('order_payments')
        .insert(serverPayments);

      if (paymentsError) {
        logError('[OrderSync] Failed to insert payments:', paymentsError);
        // Continue - order was created successfully
      }
    }

    // 8. Update local order with server_id and sync_status
    await db.offline_orders.update(item.entityId, {
      server_id: serverId,
      sync_status: 'synced',
    });

    // Update local payments sync_status
    for (const payment of payments) {
      await db.offline_payments.update(payment.id, {
        sync_status: 'synced',
        server_id: serverId, // Link to order server_id for reference
      });
    }

    return { success: true, serverId };
  } catch (error) {
    // C-3: Detect conflict type from exception
    const conflictType = detectConflictType(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      conflictType,
    };
  }
}

/**
 * Update local order with server ID after sync
 *
 * @param localId - Local order ID (LOCAL-*)
 * @param serverId - Server-assigned UUID
 */
export async function updateLocalOrderWithServerId(
  localId: string,
  serverId: string
): Promise<void> {
  await db.offline_orders.update(localId, {
    server_id: serverId,
    sync_status: 'synced',
  });
}
