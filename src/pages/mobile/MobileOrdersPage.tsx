/**
 * Mobile Orders Page
 * Story 6.7 - Order Status Tracking
 *
 * Track sent orders and receive notifications when ready.
 */

import { useEffect, useCallback } from 'react';
import { Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useMobileStore } from '@/stores/mobileStore';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, type ILanMessage } from '@/services/lan/lanProtocol';

/**
 * Format relative time
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1h ago';
  return `${diffHours}h ago`;
}

/**
 * Mobile Orders Page Component
 */
export default function MobileOrdersPage() {
  const {
    sentOrders,
    updateSentOrderStatus,
    removeSentOrder,
    clearCompletedOrders,
    extendSession,
  } = useMobileStore();

  // Extend session on activity
  useEffect(() => {
    extendSession();
  }, [extendSession]);

  // Listen for order status updates
  useEffect(() => {
    const handleStatusUpdate = (message: ILanMessage) => {
      const payload = message.payload as {
        orderId: string;
        status: 'preparing' | 'ready';
      };

      if (payload.orderId && payload.status) {
        updateSentOrderStatus(payload.orderId, payload.status);

        // Haptic feedback for ready orders
        if (payload.status === 'ready' && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100, 50, 100]);
        }
      }
    };

    const unsubscribe = lanClient.on(LAN_MESSAGE_TYPES.ORDER_STATUS, handleStatusUpdate);

    return () => {
      unsubscribe();
    };
  }, [updateSentOrderStatus]);

  // Handle order removal
  const handleRemove = useCallback((orderId: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    removeSentOrder(orderId);
  }, [removeSentOrder]);

  // Group orders by status
  const readyOrders = sentOrders.filter((o) => o.status === 'ready');
  const preparingOrders = sentOrders.filter((o) => o.status === 'preparing');
  const sentOnlyOrders = sentOrders.filter((o) => o.status === 'sent');

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between p-md bg-white border-b border-border">
        <h1 className="text-xl font-semibold m-0">My Orders</h1>
        {sentOrders.length > 0 && (
          <button
            className="bg-transparent border-none text-primary text-sm font-medium cursor-pointer"
            onClick={clearCompletedOrders}
          >
            Clear completed
          </button>
        )}
      </div>

      {sentOrders.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-xl text-muted-foreground">
          <Clock size={48} className="text-muted mb-md" />
          <h2 className="text-xl m-0 mb-xs text-foreground">No orders</h2>
          <p className="m-0">Your sent orders will appear here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-md">
          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <section className="mb-lg">
              <h2 className="flex items-center gap-sm text-sm font-semibold uppercase text-success m-0 mb-sm">
                <CheckCircle size={20} />
                Ready ({readyOrders.length})
              </h2>
              {readyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-success-bg rounded-lg p-md mb-sm border border-success"
                >
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="text-lg font-bold">
                      #{order.orderNumber}
                    </span>
                    {order.tableNumber && (
                      <span className="py-0.5 px-sm bg-white/50 rounded-full text-sm text-muted-foreground">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-md mb-sm text-sm text-[var(--color-success-dark,#16a34a)]">
                    <span>
                      {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
                    </span>
                    <span>
                      {formatTimeAgo(order.sentAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-xs text-sm font-medium text-success">
                      <CheckCircle size={16} />
                      Ready to serve
                    </span>
                    <button
                      className="py-xs px-md bg-success border-none rounded-md text-white font-semibold cursor-pointer min-h-[36px] active:bg-[var(--color-success-dark,#16a34a)]"
                      onClick={() => handleRemove(order.orderId)}
                    >
                      Served
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <section className="mb-lg">
              <h2 className="flex items-center gap-sm text-sm font-semibold uppercase text-warning m-0 mb-sm">
                <Clock size={20} />
                Preparing ({preparingOrders.length})
              </h2>
              {preparingOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-lg p-md mb-sm border border-warning"
                >
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="text-lg font-bold">
                      #{order.orderNumber}
                    </span>
                    {order.tableNumber && (
                      <span className="py-0.5 px-sm bg-secondary rounded-full text-sm text-muted-foreground">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-md mb-sm text-sm text-muted-foreground">
                    <span>
                      {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
                    </span>
                    <span>
                      {formatTimeAgo(order.sentAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-xs text-sm font-medium text-warning">
                      <Clock size={16} className="animate-pulse" />
                      Preparing
                    </span>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Sent Orders */}
          {sentOnlyOrders.length > 0 && (
            <section className="mb-lg">
              <h2 className="flex items-center gap-sm text-sm font-semibold uppercase text-muted-foreground m-0 mb-sm">
                <AlertCircle size={20} />
                Sent ({sentOnlyOrders.length})
              </h2>
              {sentOnlyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-lg p-md mb-sm border border-border"
                >
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="text-lg font-bold">
                      #{order.orderNumber}
                    </span>
                    {order.tableNumber && (
                      <span className="py-0.5 px-sm bg-secondary rounded-full text-sm text-muted-foreground">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-md mb-sm text-sm text-muted-foreground">
                    <span>
                      {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
                    </span>
                    <span>
                      {formatTimeAgo(order.sentAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-xs text-sm font-medium text-muted-foreground">
                      Sent
                    </span>
                    <button
                      className="p-xs bg-danger-bg border-none rounded-md text-danger cursor-pointer"
                      onClick={() => handleRemove(order.orderId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
