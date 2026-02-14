/**
 * Customer Display Page
 * Story 5.3, 5.4, 5.5, 5.6 - Customer Display Features
 * Sprint 4 redesign: dark theme, gold accents, improved typography
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDisplayStore } from '@/stores/displayStore';
import { useDisplaySettings } from '@/hooks/settings/useModuleConfigSettings';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, type ILanMessage } from '@/services/lan/lanProtocol';
import type { ICartDisplayPayload, IOrderStatusPayload } from '@/services/display/displayBroadcast';
import { supabase } from '@/lib/supabase';
import type { IDisplayPromotion } from '@/types/database';
import { MapPin, Wifi, Clock, CheckCircle } from 'lucide-react';
import { BreakeryLogo } from '@/components/ui/BreakeryLogo';
import { cn } from '@/lib/utils';
import { logError } from '@/utils/logger'

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

export default function CustomerDisplayPage() {
  const {
    cart, isIdle, orderQueue, readyOrders, currentPromoIndex,
    promoRotationInterval, updateCart, updateOrderStatus,
    setConnected, setIdleTimeout, setPromoInterval,
    nextPromo, resetPromoIndex, checkIdle,
  } = useDisplayStore();
  const displayConfig = useDisplaySettings();

  const [promotions, setPromotions] = useState<IDisplayPromotion[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [newReadyOrder, setNewReadyOrder] = useState<string | null>(null);
  const [idleMinutes, setIdleMinutes] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isDimmed = idleMinutes >= 30;

  useEffect(() => {
    setIdleTimeout(displayConfig.idleTimeoutSeconds);
    setPromoInterval(displayConfig.promoRotationIntervalSeconds);
  }, [displayConfig.idleTimeoutSeconds, displayConfig.promoRotationIntervalSeconds, setIdleTimeout, setPromoInterval]);

  // Track idle duration for dimming (S4.5)
  useEffect(() => {
    if (!isIdle) { setIdleMinutes(0); return; }
    const timer = setInterval(() => setIdleMinutes(m => m + 1), 60000);
    return () => clearInterval(timer);
  }, [isIdle]);

  const loadPromotions = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('display_promotions').select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order('priority', { ascending: false });
      if (error) throw error;
      setPromotions((data || []).map((p) => ({
        id: p.id, title: p.title ?? '', description: null,
        subtitle: p.subtitle ?? null, image_url: p.image_url ?? null,
        start_date: p.start_date ?? null, end_date: p.end_date ?? null,
        is_active: p.is_active ?? true, priority: p.priority ?? null,
        background_color: p.background_color ?? null, text_color: p.text_color ?? null,
      })) as IDisplayPromotion[]);
    } catch (error) {
      logError('[CustomerDisplay] Error loading promotions:', error);
    }
  }, []);

  const handleMessage = useCallback((message: ILanMessage) => {
    if (message.type === LAN_MESSAGE_TYPES.CART_UPDATE) {
      updateCart(message.payload as ICartDisplayPayload);
    } else if (message.type === LAN_MESSAGE_TYPES.ORDER_STATUS) {
      const payload = message.payload as IOrderStatusPayload;
      updateOrderStatus(payload);
      if (payload.status === 'ready') {
        setNewReadyOrder(payload.orderNumber);
        audioRef.current?.play().catch(() => {});
        setTimeout(() => setNewReadyOrder(null), 3000);
      }
    }
  }, [updateCart, updateOrderStatus]);

  useEffect(() => {
    let unsubscribeCart: (() => void) | null = null;
    let unsubscribeOrder: (() => void) | null = null;
    const connectToHub = async () => {
      setIsConnecting(true);
      unsubscribeCart = lanClient.on(LAN_MESSAGE_TYPES.CART_UPDATE, handleMessage);
      unsubscribeOrder = lanClient.on(LAN_MESSAGE_TYPES.ORDER_STATUS, handleMessage);
      const connected = await lanClient.connect({
        deviceId: `display-${Date.now()}`, deviceName: 'Customer Display', deviceType: 'display',
      });
      setConnected(connected);
      setIsConnecting(false);
    };
    connectToHub();
    loadPromotions();
    return () => { unsubscribeCart?.(); unsubscribeOrder?.(); lanClient.disconnect(); };
  }, [handleMessage, loadPromotions, setConnected]);

  useEffect(() => {
    if (!isIdle || promotions.length === 0) return;
    const interval = isDimmed ? 15000 : promoRotationInterval * 1000;
    const timer = setInterval(nextPromo, interval);
    return () => clearInterval(timer);
  }, [isIdle, promotions.length, promoRotationInterval, nextPromo, isDimmed]);

  useEffect(() => { resetPromoIndex(); }, [promotions.length, resetPromoIndex]);
  useEffect(() => { const t = setInterval(checkIdle, 1000); return () => clearInterval(t); }, [checkIdle]);

  const currentPromo = promotions.length > 0 ? promotions[currentPromoIndex % promotions.length] : null;

  // --- Connecting State ---
  if (isConnecting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-[var(--theme-bg-primary)]">
        <div className="flex justify-center mb-6 animate-[cd-float_3s_ease-in-out_infinite]">
          <BreakeryLogo size="xl" variant="light" showText={false} />
        </div>
        <h1 className="font-display text-[3.5rem] font-bold text-[var(--theme-text-primary)]">The Breakery</h1>
        <p className="text-lg mt-2 font-display text-[var(--theme-text-secondary)]">Artisan French Bakery</p>
        <p className="text-base mt-8 animate-[cd-blink_1.5s_ease-in-out_infinite] text-[var(--theme-text-muted)]">Connecting...</p>
        <style>{cdStyles}</style>
      </div>
    );
  }

  // --- Active Cart State ---
  if (!isIdle && cart.items.length > 0) {
    return (
      <div className="h-screen flex flex-col text-white overflow-hidden relative bg-[var(--theme-bg-primary)]">
        <audio ref={audioRef} src="/sounds/order-ready.mp3" preload="auto" />

        {/* Header */}
        <div className="flex items-center gap-4 px-10 py-5 border-b border-white/10">
          <BreakeryLogo size="sm" variant="light" showText={false} />
          <h2 className="text-xl font-semibold flex-1 text-[var(--theme-text-primary)]">Your Order</h2>
          {cart.customerName && <span className="text-base px-4 py-1 rounded-full bg-white/10 text-[var(--theme-text-secondary)]">{cart.customerName}</span>}
          {cart.tableNumber && <span className="text-base px-4 py-1 rounded-full bg-white/10 text-[var(--theme-text-secondary)]">Table {cart.tableNumber}</span>}
        </div>

        {/* Items */}
        <div className="cd-cart-items flex-1 overflow-y-auto px-10 py-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start py-4 border-b border-white/5 animate-[cd-slideIn_0.3s_ease-out]">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-base font-semibold min-w-[2rem] text-[var(--color-gold)]">{item.quantity}x</span>
                <span className="text-lg font-medium text-[var(--theme-text-primary)]">{item.name}</span>
                {item.modifiers.length > 0 && (
                  <span className="text-sm italic w-full ml-10 text-[var(--theme-text-muted)]">+ {item.modifiers.join(', ')}</span>
                )}
              </div>
              <span className="text-lg font-medium tabular-nums whitespace-nowrap text-[var(--theme-text-secondary)]">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="px-10 py-6 border-t border-white/10 text-center">
          {cart.discountAmount > 0 && (
            <div className="flex justify-between text-base mb-2 text-[var(--theme-text-secondary)]">
              <span>Subtotal</span><span className="tabular-nums">{formatPrice(cart.subtotal)}</span>
            </div>
          )}
          {cart.discountAmount > 0 && (
            <div className="flex justify-between text-base mb-4 text-[#22C55E]">
              <span>Discount</span><span className="tabular-nums">-{formatPrice(cart.discountAmount)}</span>
            </div>
          )}
          <div className="text-[48px] font-bold tabular-nums animate-[cd-totalBounce_0.3s_ease-out] text-[var(--color-gold)]">{formatPrice(cart.total)}</div>
          <div className="text-sm uppercase tracking-[0.1em] mt-1 text-[var(--theme-text-muted)]">TOTAL</div>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-[0.06] pointer-events-none">
          <BreakeryLogo size="xl" variant="light" showText={false} />
        </div>

        {/* Side ready orders */}
        {readyOrders.length > 0 && (
          <div className="absolute right-0 top-[72px] bottom-0 w-[240px] p-5 bg-white/5 border-l border-white/10">
            <h3 className="text-sm font-semibold uppercase tracking-[0.05em] mb-4 text-[var(--theme-text-muted)]">Ready</h3>
            <div className="flex flex-col gap-2">
              {readyOrders.map((order) => (
                <div key={order.orderId} className={cn(
                  'bg-[#22C55E] text-white p-3 rounded-lg text-xl font-bold text-center',
                  order.orderNumber === newReadyOrder && 'animate-[cd-flash_0.5s_ease-in-out_3]'
                )}>{order.orderNumber}</div>
              ))}
            </div>
          </div>
        )}
        <style>{cdStyles}</style>
      </div>
    );
  }

  // --- Idle State ---
  return (
    <div className={cn('h-screen flex flex-col justify-center text-white overflow-hidden relative transition-opacity duration-1000 bg-[var(--theme-bg-primary)]', isDimmed && 'opacity-70')}>
      <audio ref={audioRef} src="/sounds/order-ready.mp3" preload="auto" />

      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        {currentPromo ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-[cd-fadeIn_0.6s_ease-in-out]"
            style={{ backgroundColor: currentPromo.background_color ?? undefined, color: currentPromo.text_color ?? undefined }}>
            {currentPromo.image_url && (
              <img src={currentPromo.image_url} alt={currentPromo.title}
                className="max-w-[60%] max-h-[50vh] object-contain rounded-2xl mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)]" />
            )}
            <h2 className="text-[3.5rem] font-bold">{currentPromo.title}</h2>
            {currentPromo.subtitle && <p className="text-2xl mt-3 text-[var(--theme-text-secondary)]">{currentPromo.subtitle}</p>}
          </div>
        ) : (
          <>
            <div className="mb-12">
              <div className="flex justify-center mb-4 animate-[cd-float_3s_ease-in-out_infinite]">
                <BreakeryLogo size="xl" variant="light" showText={false} />
              </div>
              <h1 className="font-display text-[3.5rem] font-bold text-[var(--theme-text-primary)]">The Breakery</h1>
              <p className="text-lg mt-2 font-display text-[var(--theme-text-secondary)]">Artisan French Bakery</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 text-lg text-[var(--theme-text-secondary)]">
                <MapPin size={20} /><span>Senggigi, Lombok</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-lg text-[var(--theme-text-secondary)]">
                <Wifi size={20} /><span>WiFi: TheBreakery</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-lg text-[var(--theme-text-secondary)]">
                <Clock size={20} /><span>Open 7/7 &bull; 7am - 6pm</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom panel - Order Queue */}
      {(orderQueue.length > 0 || readyOrders.length > 0) && (
        <div className="flex gap-10 py-5 px-10 bg-black/30 backdrop-blur-md border-t border-white/5">
          {orderQueue.length > 0 && (
            <div className="flex-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.05em] mb-3 text-[var(--theme-text-muted)]">Preparing</h3>
              <div className="flex flex-wrap gap-2">
                {orderQueue.map((order) => (
                  <div key={order.orderId} className="py-2 px-5 rounded-lg text-xl font-semibold border border-amber-500/30 text-amber-300">
                    <Clock size={14} className="inline mr-1.5 opacity-60" />{order.orderNumber}
                  </div>
                ))}
              </div>
            </div>
          )}
          {readyOrders.length > 0 && (
            <div className="flex-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.05em] mb-3 text-[#22C55E]">Ready for Pickup</h3>
              <div className="flex flex-wrap gap-2">
                {readyOrders.map((order) => (
                  <div key={order.orderId} className={cn(
                    'bg-[#22C55E]/20 border border-[#22C55E]/40 py-2 px-5 rounded-lg text-xl font-bold text-[#22C55E]',
                    order.orderNumber === newReadyOrder && 'animate-[cd-flash_0.5s_ease-in-out_3]'
                  )}><CheckCircle size={14} className="inline mr-1.5" />{order.orderNumber}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Watermark */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-[0.08] pointer-events-none">
        <BreakeryLogo size="xl" variant="light" showText={false} />
      </div>

      <style>{cdStyles}</style>
    </div>
  );
}

const cdStyles = `
  @keyframes cd-blink { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes cd-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes cd-fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
  @keyframes cd-slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes cd-flash { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes cd-totalBounce { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  .cd-cart-items::-webkit-scrollbar { width: 6px; }
  .cd-cart-items::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
  .cd-cart-items::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
  .cd-cart-items::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
  @media (prefers-reduced-motion: reduce) {
    [class*="animate-"] { animation: none !important; }
  }
`;
