/**
 * Customer Display Page
 * Story 5.3, 5.4, 5.5, 5.6 - Customer Display Features
 *
 * Displays:
 * - Current cart items and total
 * - Order queue (preparing)
 * - Ready order numbers
 * - Promotional content during idle
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDisplayStore } from '@/stores/displayStore';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, type ILanMessage } from '@/services/lan/lanProtocol';
import type { ICartDisplayPayload, IOrderStatusPayload } from '@/services/display/displayBroadcast';
import { supabase } from '@/lib/supabase';
import type { IDisplayPromotion } from '@/types/database';
import './CustomerDisplayPage.css';

/**
 * Format price in IDR
 */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Main Customer Display Page
 */
export default function CustomerDisplayPage() {
  const {
    cart,
    isIdle,
    orderQueue,
    readyOrders,
    currentPromoIndex,
    promoRotationInterval,
    updateCart,
    updateOrderStatus,
    setConnected,
    nextPromo,
    resetPromoIndex,
    checkIdle,
  } = useDisplayStore();

  const [promotions, setPromotions] = useState<IDisplayPromotion[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [newReadyOrder, setNewReadyOrder] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Load promotions from database
   */
  const loadPromotions = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('display_promotions')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order('priority', { ascending: false });

      if (error) throw error;
      // Cast to IDisplayPromotion[] with defaults for nullable fields
      const promotionsData = (data || []).map((p) => ({
        id: p.id,
        title: p.title ?? '',
        description: null,
        subtitle: p.subtitle ?? null,
        image_url: p.image_url ?? null,
        start_date: p.start_date ?? null,
        end_date: p.end_date ?? null,
        is_active: p.is_active ?? true,
        priority: p.priority ?? null,
        background_color: p.background_color ?? null,
        text_color: p.text_color ?? null,
      })) as IDisplayPromotion[];
      setPromotions(promotionsData);
    } catch (error) {
      console.error('[CustomerDisplay] Error loading promotions:', error);
    }
  }, []);

  /**
   * Handle incoming LAN messages
   */
  const handleMessage = useCallback((message: ILanMessage) => {
    if (message.type === LAN_MESSAGE_TYPES.CART_UPDATE) {
      updateCart(message.payload as ICartDisplayPayload);
    } else if (message.type === LAN_MESSAGE_TYPES.ORDER_STATUS) {
      const payload = message.payload as IOrderStatusPayload;
      updateOrderStatus(payload);

      // Play audio and flash for ready orders
      if (payload.status === 'ready') {
        setNewReadyOrder(payload.orderNumber);
        audioRef.current?.play().catch(() => {});
        setTimeout(() => setNewReadyOrder(null), 3000);
      }
    }
  }, [updateCart, updateOrderStatus]);

  /**
   * Connect to LAN hub
   */
  useEffect(() => {
    let unsubscribeCart: (() => void) | null = null;
    let unsubscribeOrder: (() => void) | null = null;

    const connectToHub = async () => {
      setIsConnecting(true);

      // Register message handlers
      unsubscribeCart = lanClient.on(LAN_MESSAGE_TYPES.CART_UPDATE, handleMessage);
      unsubscribeOrder = lanClient.on(LAN_MESSAGE_TYPES.ORDER_STATUS, handleMessage);

      // Connect to hub
      const connected = await lanClient.connect({
        deviceId: `display-${Date.now()}`,
        deviceName: 'Customer Display',
        deviceType: 'display',
      });

      setConnected(connected);
      setIsConnecting(false);
    };

    connectToHub();
    loadPromotions();

    // Cleanup
    return () => {
      unsubscribeCart?.();
      unsubscribeOrder?.();
      lanClient.disconnect();
    };
  }, [handleMessage, loadPromotions, setConnected]);

  /**
   * Promo rotation timer
   */
  useEffect(() => {
    if (!isIdle || promotions.length === 0) return;

    const timer = setInterval(() => {
      nextPromo();
    }, promoRotationInterval * 1000);

    return () => clearInterval(timer);
  }, [isIdle, promotions.length, promoRotationInterval, nextPromo]);

  /**
   * Reset promo index when promotions change
   */
  useEffect(() => {
    resetPromoIndex();
  }, [promotions.length, resetPromoIndex]);

  /**
   * Idle check timer
   */
  useEffect(() => {
    const timer = setInterval(checkIdle, 1000);
    return () => clearInterval(timer);
  }, [checkIdle]);

  // Get current promotion
  const currentPromo = promotions.length > 0
    ? promotions[currentPromoIndex % promotions.length]
    : null;

  // Show connecting state
  if (isConnecting) {
    return (
      <div className="customer-display">
        <div className="display-connecting">
          <div className="display-logo">
            <span className="display-logo__icon">🥐</span>
            <h1 className="display-logo__text">The Breakery</h1>
          </div>
          <p className="display-connecting__text">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  // Show cart when active
  if (!isIdle && cart.items.length > 0) {
    return (
      <div className="customer-display customer-display--active">
        {/* Hidden audio element */}
        <audio ref={audioRef} src="/sounds/order-ready.mp3" preload="auto" />

        <div className="display-cart">
          {/* Header */}
          <div className="display-cart__header">
            <h2>Votre Commande</h2>
            {cart.customerName && (
              <span className="display-cart__customer">{cart.customerName}</span>
            )}
            {cart.tableNumber && (
              <span className="display-cart__table">Table {cart.tableNumber}</span>
            )}
          </div>

          {/* Items */}
          <div className="display-cart__items">
            {cart.items.map((item) => (
              <div key={item.id} className="display-cart__item">
                <div className="display-cart__item-info">
                  <span className="display-cart__item-qty">{item.quantity}x</span>
                  <span className="display-cart__item-name">{item.name}</span>
                  {item.modifiers.length > 0 && (
                    <span className="display-cart__item-mods">
                      ({item.modifiers.join(', ')})
                    </span>
                  )}
                </div>
                <span className="display-cart__item-price">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="display-cart__totals">
            {cart.discountAmount > 0 && (
              <>
                <div className="display-cart__subtotal">
                  <span>Sous-total</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="display-cart__discount">
                  <span>Remise</span>
                  <span>-{formatPrice(cart.discountAmount)}</span>
                </div>
              </>
            )}
            <div className="display-cart__total">
              <span>Total</span>
              <span className="display-cart__total-amount">
                {formatPrice(cart.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Side panel - Ready Orders */}
        {readyOrders.length > 0 && (
          <div className="display-side-panel">
            <h3>Commandes Prêtes</h3>
            <div className="display-ready-orders">
              {readyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className={`display-ready-order ${
                    order.orderNumber === newReadyOrder ? 'display-ready-order--new' : ''
                  }`}
                >
                  {order.orderNumber}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show idle state with promotions and queue
  return (
    <div className="customer-display customer-display--idle">
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/sounds/order-ready.mp3" preload="auto" />

      {/* Main content - Promo or branding */}
      <div className="display-idle">
        {currentPromo ? (
          <div
            className="display-promo-content"
            style={{
              backgroundColor: currentPromo.background_color ?? undefined,
              color: currentPromo.text_color ?? undefined,
            }}
          >
            {currentPromo.image_url && (
              <img
                src={currentPromo.image_url}
                alt={currentPromo.title}
                className="display-promo-content__image"
              />
            )}
            <h2 className="display-promo-content__title">{currentPromo.title}</h2>
            {currentPromo.subtitle && (
              <p className="display-promo-content__subtitle">{currentPromo.subtitle}</p>
            )}
          </div>
        ) : (
          <>
            <div className="display-logo">
              <span className="display-logo__icon">🥐</span>
              <h1 className="display-logo__text">The Breakery</h1>
              <p className="display-logo__tagline">Boulangerie Artisanale Française</p>
            </div>

            <div className="display-info">
              <div className="display-info__item">
                <span className="display-info__icon">📍</span>
                <span>Senggigi, Lombok</span>
              </div>
              <div className="display-info__item">
                <span className="display-info__icon">📶</span>
                <span>WiFi: TheBreakery • Pass: croissant2024</span>
              </div>
              <div className="display-info__item">
                <span className="display-info__icon">⏰</span>
                <span>Ouvert 7j/7 • 7h - 18h</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom panel - Order Queue and Ready Orders */}
      {(orderQueue.length > 0 || readyOrders.length > 0) && (
        <div className="display-bottom-panel">
          {/* Preparing Orders */}
          {orderQueue.length > 0 && (
            <div className="display-queue-section">
              <h3>En Préparation</h3>
              <div className="display-queue">
                {orderQueue.map((order) => (
                  <div key={order.orderId} className="display-queue__item">
                    {order.orderNumber}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div className="display-ready-section">
              <h3>Prêtes à Servir</h3>
              <div className="display-ready">
                {readyOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className={`display-ready__item ${
                      order.orderNumber === newReadyOrder ? 'display-ready__item--new' : ''
                    }`}
                  >
                    {order.orderNumber}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
