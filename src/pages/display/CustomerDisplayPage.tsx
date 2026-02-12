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
import { useDisplaySettings } from '@/hooks/settings/useModuleConfigSettings';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, type ILanMessage } from '@/services/lan/lanProtocol';
import type { ICartDisplayPayload, IOrderStatusPayload } from '@/services/display/displayBroadcast';
import { supabase } from '@/lib/supabase';
import type { IDisplayPromotion } from '@/types/database';
import { cn } from '@/lib/utils';
import { logError } from '@/utils/logger'

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
    setIdleTimeout,
    setPromoInterval,
    nextPromo,
    resetPromoIndex,
    checkIdle,
  } = useDisplayStore();
  const displayConfig = useDisplaySettings();

  const [promotions, setPromotions] = useState<IDisplayPromotion[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [newReadyOrder, setNewReadyOrder] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync display settings from settings store to display store
  useEffect(() => {
    setIdleTimeout(displayConfig.idleTimeoutSeconds);
    setPromoInterval(displayConfig.promoRotationIntervalSeconds);
  }, [displayConfig.idleTimeoutSeconds, displayConfig.promoRotationIntervalSeconds, setIdleTimeout, setPromoInterval]);

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
      logError('[CustomerDisplay] Error loading promotions:', error);
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
      <div
        className="h-screen flex flex-col text-white overflow-hidden font-display"
        style={{ background: 'linear-gradient(135deg, #BA90A2 0%, #DDB892 100%)' }}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-2xl">
            <span className="text-[6rem] block mb-md animate-[cd-float_3s_ease-in-out_infinite]">
              {'\uD83E\uDD50'}
            </span>
            <h1 className="font-display text-[4rem] font-bold m-0" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              The Breakery
            </h1>
          </div>
          <p className="text-xl opacity-90 animate-[cd-blink_1.5s_ease-in-out_infinite]">Connecting...</p>
        </div>
      </div>
    );
  }

  // Show cart when active
  if (!isIdle && cart.items.length > 0) {
    return (
      <div className="h-screen flex flex-row text-white overflow-hidden font-display" style={{ background: '#1a1a2e' }}>
        {/* Hidden audio element */}
        <audio ref={audioRef} src="/sounds/order-ready.mp3" preload="auto" />

        <div className="flex-1 flex flex-col p-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-lg pb-lg mb-lg" style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
            <h2 className="text-3xl font-semibold m-0 flex-1">Your Order</h2>
            {cart.customerName && (
              <span className="text-lg py-xs px-md rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {cart.customerName}
              </span>
            )}
            {cart.tableNumber && (
              <span className="text-lg py-xs px-md rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                Table {cart.tableNumber}
              </span>
            )}
          </div>

          {/* Items */}
          <div className="cd-cart-items flex-1 overflow-y-auto pr-md">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start py-md animate-[cd-slideIn_0.3s_ease-out]"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex flex-wrap items-baseline gap-sm">
                  <span className="text-lg font-semibold min-w-[2rem]" style={{ color: '#DDB892' }}>
                    {item.quantity}x
                  </span>
                  <span className="text-[18px] font-medium">{item.name}</span>
                  {item.modifiers.length > 0 && (
                    <span className="text-sm opacity-70 w-full ml-[2.5rem]">
                      ({item.modifiers.join(', ')})
                    </span>
                  )}
                </div>
                <span className="text-[24px] font-semibold whitespace-nowrap">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-lg mt-auto" style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
            {cart.discountAmount > 0 && (
              <>
                <div className="flex justify-between text-lg opacity-80 mb-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg opacity-80 mb-sm">
                  <span>Discount</span>
                  <span className="text-green-400">-{formatPrice(cart.discountAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-2xl font-semibold mt-md">
              <span>Total</span>
              <span className="text-[32px]" style={{ color: '#DDB892' }}>
                {formatPrice(cart.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Side panel - Ready Orders */}
        {readyOrders.length > 0 && (
          <div className="w-[280px] p-lg" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-lg font-semibold m-0 mb-lg uppercase tracking-[0.05em] opacity-70">
              Ready Orders
            </h3>
            <div className="flex flex-col gap-sm">
              {readyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className={cn(
                    'bg-green-500 text-white p-md rounded-lg text-2xl font-bold text-center',
                    order.orderNumber === newReadyOrder && 'animate-[cd-flash_0.5s_ease-in-out_3]'
                  )}
                >
                  {order.orderNumber}
                </div>
              ))}
            </div>
          </div>
        )}

        <style>{cdStyles}</style>
      </div>
    );
  }

  // Show idle state with promotions and queue
  return (
    <div
      className="h-screen flex flex-col justify-center text-white overflow-hidden font-display"
      style={{ background: 'linear-gradient(135deg, #BA90A2 0%, #DDB892 100%)' }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/sounds/order-ready.mp3" preload="auto" />

      {/* Main content - Promo or branding */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-2xl">
        {currentPromo ? (
          <div
            className="flex-1 flex flex-col items-center justify-center p-2xl animate-[cd-fadeIn_0.5s_ease-in-out]"
            style={{
              backgroundColor: currentPromo.background_color ?? undefined,
              color: currentPromo.text_color ?? undefined,
            }}
          >
            {currentPromo.image_url && (
              <img
                src={currentPromo.image_url}
                alt={currentPromo.title}
                className="max-w-[60%] max-h-[50vh] object-contain rounded-xl mb-xl"
                style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
              />
            )}
            <h2 className="text-[4rem] font-bold m-0 text-center" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              {currentPromo.title}
            </h2>
            {currentPromo.subtitle && (
              <p className="text-2xl mt-md opacity-90 text-center">{currentPromo.subtitle}</p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-2xl">
              <span className="text-[6rem] block mb-md animate-[cd-float_3s_ease-in-out_infinite]">
                {'\uD83E\uDD50'}
              </span>
              <h1 className="font-display text-[4rem] font-bold m-0" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                The Breakery
              </h1>
              <p className="text-lg opacity-90 mt-sm">French Artisan Bakery</p>
            </div>

            <div className="flex flex-col gap-md mb-2xl">
              <div className="flex items-center justify-center gap-sm text-lg opacity-90">
                <span className="text-[1.5rem]">{'\uD83D\uDCCD'}</span>
                <span>Senggigi, Lombok</span>
              </div>
              <div className="flex items-center justify-center gap-sm text-lg opacity-90">
                <span className="text-[1.5rem]">{'\uD83D\uDCF6'}</span>
                <span>WiFi: TheBreakery &bull; Pass: croissant2024</span>
              </div>
              <div className="flex items-center justify-center gap-sm text-lg opacity-90">
                <span className="text-[1.5rem]">{'\u23F0'}</span>
                <span>Open 7/7 &bull; 7am - 6pm</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom panel - Order Queue and Ready Orders */}
      {(orderQueue.length > 0 || readyOrders.length > 0) && (
        <div
          className="flex gap-2xl py-lg px-2xl"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
        >
          {/* Preparing Orders */}
          {orderQueue.length > 0 && (
            <div className="flex-1">
              <h3 className="text-lg font-semibold m-0 mb-md uppercase tracking-[0.05em] opacity-80">
                Preparing
              </h3>
              <div className="flex flex-wrap gap-sm">
                {orderQueue.map((order) => (
                  <div
                    key={order.orderId}
                    className="py-sm px-lg rounded-md text-xl font-semibold"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    {order.orderNumber}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div className="flex-1">
              <h3 className="text-lg font-semibold m-0 mb-md uppercase tracking-[0.05em] opacity-80">
                Ready to Serve
              </h3>
              <div className="flex flex-wrap gap-sm">
                {readyOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className={cn(
                      'bg-green-500 py-sm px-lg rounded-md text-xl font-bold',
                      order.orderNumber === newReadyOrder && 'animate-[cd-flash_0.5s_ease-in-out_3]'
                    )}
                  >
                    {order.orderNumber}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{cdStyles}</style>
    </div>
  );
}

/** Scoped keyframe styles for CustomerDisplay animations and scrollbar */
const cdStyles = `
  @keyframes cd-blink {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes cd-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes cd-fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes cd-slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes cd-flash {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); background: #4ade80; }
  }
  .cd-cart-items::-webkit-scrollbar { width: 6px; }
  .cd-cart-items::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
  .cd-cart-items::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
  .cd-cart-items::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
`;
