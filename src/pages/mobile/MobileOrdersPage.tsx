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
import './MobileOrdersPage.css';

/**
 * Format relative time
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins === 1) return 'Il y a 1 min';
  if (diffMins < 60) return `Il y a ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return 'Il y a 1h';
  return `Il y a ${diffHours}h`;
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
    <div className="mobile-orders">
      <div className="mobile-orders__header">
        <h1>Mes Commandes</h1>
        {sentOrders.length > 0 && (
          <button
            className="mobile-orders__clear-btn"
            onClick={clearCompletedOrders}
          >
            Effacer terminées
          </button>
        )}
      </div>

      {sentOrders.length === 0 ? (
        <div className="mobile-orders__empty">
          <Clock size={48} className="mobile-orders__empty-icon" />
          <h2>Aucune commande</h2>
          <p>Vos commandes envoyées apparaîtront ici</p>
        </div>
      ) : (
        <div className="mobile-orders__list">
          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <section className="mobile-orders__section">
              <h2 className="mobile-orders__section-title mobile-orders__section-title--ready">
                <CheckCircle size={20} />
                Prêtes ({readyOrders.length})
              </h2>
              {readyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="mobile-orders__card mobile-orders__card--ready"
                >
                  <div className="mobile-orders__card-main">
                    <span className="mobile-orders__order-number">
                      #{order.orderNumber}
                    </span>
                    {order.tableNumber && (
                      <span className="mobile-orders__table">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="mobile-orders__card-details">
                    <span className="mobile-orders__items">
                      {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                    </span>
                    <span className="mobile-orders__time">
                      {formatTimeAgo(order.sentAt)}
                    </span>
                  </div>
                  <div className="mobile-orders__card-status">
                    <span className="mobile-orders__status mobile-orders__status--ready">
                      <CheckCircle size={16} />
                      Prête à servir
                    </span>
                    <button
                      className="mobile-orders__done-btn"
                      onClick={() => handleRemove(order.orderId)}
                    >
                      Servie
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <section className="mobile-orders__section">
              <h2 className="mobile-orders__section-title mobile-orders__section-title--preparing">
                <Clock size={20} />
                En préparation ({preparingOrders.length})
              </h2>
              {preparingOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="mobile-orders__card mobile-orders__card--preparing"
                >
                  <div className="mobile-orders__card-main">
                    <span className="mobile-orders__order-number">
                      #{order.orderNumber}
                    </span>
                    {order.tableNumber && (
                      <span className="mobile-orders__table">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="mobile-orders__card-details">
                    <span className="mobile-orders__items">
                      {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                    </span>
                    <span className="mobile-orders__time">
                      {formatTimeAgo(order.sentAt)}
                    </span>
                  </div>
                  <div className="mobile-orders__card-status">
                    <span className="mobile-orders__status mobile-orders__status--preparing">
                      <Clock size={16} className="animate-pulse" />
                      En préparation
                    </span>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Sent Orders */}
          {sentOnlyOrders.length > 0 && (
            <section className="mobile-orders__section">
              <h2 className="mobile-orders__section-title">
                <AlertCircle size={20} />
                Envoyées ({sentOnlyOrders.length})
              </h2>
              {sentOnlyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="mobile-orders__card"
                >
                  <div className="mobile-orders__card-main">
                    <span className="mobile-orders__order-number">
                      #{order.orderNumber}
                    </span>
                    {order.tableNumber && (
                      <span className="mobile-orders__table">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="mobile-orders__card-details">
                    <span className="mobile-orders__items">
                      {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                    </span>
                    <span className="mobile-orders__time">
                      {formatTimeAgo(order.sentAt)}
                    </span>
                  </div>
                  <div className="mobile-orders__card-status">
                    <span className="mobile-orders__status">
                      Envoyée
                    </span>
                    <button
                      className="mobile-orders__remove-btn"
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
