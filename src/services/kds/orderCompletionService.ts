/**
 * Order Completion Service
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Handles marking orders as complete/ready, updating Supabase, and notifying via LAN
 */

import { supabase } from '@/lib/supabase';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import type { IOrderCompletePayload } from '@/services/lan/lanProtocol';
import type { TKitchenStation } from '@/types/offline';

/**
 * Result of an order completion operation
 */
export interface IOrderCompleteResult {
  success: boolean;
  lanSent: boolean;
  error?: string;
}

/**
 * Complete an order after auto-remove countdown
 * Updates Supabase order status to 'ready' and broadcasts ORDER_COMPLETE via LAN
 *
 * @param orderId - The order ID
 * @param orderNumber - Human-readable order number
 * @param station - Kitchen station that completed the order
 * @returns Result indicating success and whether LAN notification was sent
 */
export async function completeOrder(
  orderId: string,
  orderNumber: string,
  station: TKitchenStation
): Promise<IOrderCompleteResult> {
  const completedAt = new Date().toISOString();

  try {
    // 1. Update order status in Supabase
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'ready',
        completed_at: completedAt,
      })
      .eq('id', orderId);

    if (error) {
      return { success: false, lanSent: false, error: error.message };
    }

    // 2. Send ORDER_COMPLETE via LAN if connected
    let lanSent = false;
    if (lanClient.isActive()) {
      const payload: IOrderCompletePayload = {
        order_id: orderId,
        order_number: orderNumber,
        station,
        completed_at: completedAt,
        timestamp: completedAt,
      };
      await lanClient.send(LAN_MESSAGE_TYPES.ORDER_COMPLETE, payload);
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
