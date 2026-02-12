/**
 * useKdsOrderActions Hook
 * Extracts KDS order action handlers from KDSMainPage for cleaner separation of concerns.
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { markItemsPreparing, markItemsReady, completeOrder } from '@/services/kds';
import { broadcastOrderStatus } from '@/services/display/displayBroadcast';
import { logError } from '@/utils/logger';
import type { IKdsOrder, IKdsOrderItem } from './useKdsOrderQueue';
import type { TKitchenStation } from '@/types/offline';

interface IUseKdsOrderActionsOptions {
  orders: IKdsOrder[];
  stationConfig: { dbStation: string } | null;
  updateOrderItem: (orderId: string, itemId: string, updates: Partial<IKdsOrderItem>) => void;
  removeOrder: (orderId: string) => void;
  fetchOrders: () => Promise<void>;
}

export function useKdsOrderActions({
  orders,
  stationConfig,
  updateOrderItem,
  removeOrder,
  fetchOrders,
}: IUseKdsOrderActionsOptions) {
  const dbStation = (stationConfig?.dbStation || 'kitchen') as TKitchenStation;

  const handleStartPreparing = useCallback(async (orderId: string, itemIds: string[]) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const previousStatuses = new Map(
      order.items.filter(item => itemIds.includes(item.id)).map(item => [item.id, item.item_status])
    );

    itemIds.forEach(itemId => {
      updateOrderItem(orderId, itemId, { item_status: 'preparing' });
    });

    const result = await markItemsPreparing(orderId, order.order_number, itemIds, dbStation);

    if (!result.success) {
      logError('Error updating item status:', result.error);
      previousStatuses.forEach((status, itemId) => {
        updateOrderItem(orderId, itemId, { item_status: status });
      });
      toast.error(result.error || 'Error updating status');
    }
  }, [orders, dbStation, updateOrderItem]);

  const handleMarkReady = useCallback(async (orderId: string, itemIds: string[]) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const previousStatuses = new Map(
      order.items.filter(item => itemIds.includes(item.id)).map(item => [item.id, item.item_status])
    );

    itemIds.forEach(itemId => {
      updateOrderItem(orderId, itemId, { item_status: 'ready' });
    });

    const result = await markItemsReady(orderId, order.order_number, itemIds, dbStation);

    if (!result.success) {
      logError('Error updating item status:', result.error);
      previousStatuses.forEach((status, itemId) => {
        updateOrderItem(orderId, itemId, { item_status: status });
      });
      toast.error(result.error || 'Error updating status');
    } else {
      const allReady = order.items.every(item =>
        itemIds.includes(item.id) || item.item_status === 'ready' || item.item_status === 'served'
      );
      if (allReady) {
        broadcastOrderStatus(orderId, order.order_number, 'ready');
      }
    }
  }, [orders, dbStation, updateOrderItem]);

  const handleToggleHold = useCallback(async (itemId: string, currentHoldStatus: boolean) => {
    try {
      await supabase
        .from('order_items')
        .update({ is_held: !currentHoldStatus })
        .eq('id', itemId);
      fetchOrders();
    } catch (error) {
      logError('Error toggling hold status:', error);
    }
  }, [fetchOrders]);

  const handleMarkServed = useCallback(async (orderId: string, itemIds: string[]) => {
    try {
      await supabase
        .from('order_items')
        .update({
          item_status: 'served',
          served_at: new Date().toISOString()
        })
        .in('id', itemIds);

      const order = orders.find(o => o.id === orderId);
      if (order) {
        const allServed = order.items.every(item =>
          itemIds.includes(item.id) || item.item_status === 'served'
        );
        if (allServed) {
          await supabase
            .from('orders')
            .update({ status: 'served' })
            .eq('id', orderId);
        }
      }

      fetchOrders();
    } catch (error) {
      logError('Error updating item status:', error);
    }
  }, [orders, fetchOrders]);

  const handleOrderComplete = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const result = await completeOrder(orderId, order.order_number, dbStation);

    if (result.success) {
      removeOrder(orderId);
      broadcastOrderStatus(orderId, order.order_number, 'ready');
    } else {
      logError('Failed to complete order:', result.error);
      fetchOrders();
    }
  }, [orders, dbStation, fetchOrders, removeOrder]);

  return {
    handleStartPreparing,
    handleMarkReady,
    handleMarkServed,
    handleToggleHold,
    handleOrderComplete,
  };
}
