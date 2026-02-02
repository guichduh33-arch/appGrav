/**
 * KDS Status Service
 * Story 4.5 - KDS Item Status Update
 *
 * Handles marking items as preparing/ready and notifying via LAN
 */

import { supabase } from '@/lib/supabase';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import type { IKdsItemPreparingPayload, IKdsItemReadyPayload } from '@/services/lan/lanProtocol';
import type { TKitchenStation } from '@/types/offline';

/**
 * Result of a status update operation
 */
export interface IItemStatusResult {
  success: boolean;
  lanSent: boolean;
  error?: string;
}

/**
 * Mark items as "preparing" and notify via LAN
 *
 * @param orderId - The order ID
 * @param orderNumber - Human-readable order number
 * @param itemIds - Array of item IDs to mark as preparing
 * @param station - Kitchen station (kitchen, barista, display, none)
 * @returns Result indicating success and whether LAN notification was sent
 */
export async function markItemsPreparing(
  orderId: string,
  orderNumber: string,
  itemIds: string[],
  station: TKitchenStation
): Promise<IItemStatusResult> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Update items in Supabase
    const { error } = await supabase
      .from('order_items')
      .update({ item_status: 'preparing' })
      .in('id', itemIds);

    if (error) {
      return { success: false, lanSent: false, error: error.message };
    }

    // 2. Check if all items in order are now preparing → update order status
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id, item_status')
      .eq('order_id', orderId);

    const allPreparing = orderItems?.every(
      (item) => itemIds.includes(item.id) || item.item_status !== 'new'
    );

    if (allPreparing) {
      await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', orderId);
    }

    // 3. Send via LAN if connected
    let lanSent = false;
    if (lanClient.isActive()) {
      const payload: IKdsItemPreparingPayload = {
        order_id: orderId,
        order_number: orderNumber,
        item_ids: itemIds,
        station,
        timestamp,
      };
      await lanClient.send(LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING, payload);
      lanSent = true;
    }

    return { success: true, lanSent };
  } catch (err) {
    return {
      success: false,
      lanSent: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Mark items as "ready" and notify via LAN
 *
 * @param orderId - The order ID
 * @param orderNumber - Human-readable order number
 * @param itemIds - Array of item IDs to mark as ready
 * @param station - Kitchen station (kitchen, barista, display, none)
 * @returns Result indicating success and whether LAN notification was sent
 */
export async function markItemsReady(
  orderId: string,
  orderNumber: string,
  itemIds: string[],
  station: TKitchenStation
): Promise<IItemStatusResult> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Update items in Supabase with prepared_at timestamp
    const { error } = await supabase
      .from('order_items')
      .update({
        item_status: 'ready',
        prepared_at: timestamp,
      })
      .in('id', itemIds);

    if (error) {
      return { success: false, lanSent: false, error: error.message };
    }

    // 2. Send via LAN if connected
    let lanSent = false;
    if (lanClient.isActive()) {
      const payload: IKdsItemReadyPayload = {
        order_id: orderId,
        order_number: orderNumber,
        item_ids: itemIds,
        station,
        prepared_at: timestamp,
        timestamp,
      };
      await lanClient.send(LAN_MESSAGE_TYPES.KDS_ITEM_READY, payload);
      lanSent = true;
    }

    return { success: true, lanSent };
  } catch (err) {
    return {
      success: false,
      lanSent: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
