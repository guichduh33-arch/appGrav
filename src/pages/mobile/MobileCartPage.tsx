/**
 * Mobile Cart Page
 * Story 6.4, 6.5, 6.6 - Add Products, Modifiers, Send to Kitchen
 *
 * Cart review and order submission.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Send,
  Table2,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useMobileStore } from '@/stores/mobileStore';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import { supabase } from '@/lib/supabase';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Mobile Cart Page Component
 */
export default function MobileCartPage() {
  const navigate = useNavigate();
  const {
    currentOrder,
    updateItemQuantity,
    removeItem,
    clearOrder,
    markOrderSent,
    userId,
  } = useMobileStore();
  const { isOnline } = useNetworkStatus();

  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle item removal with haptic
  const handleRemoveItem = useCallback((itemId: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    removeItem(itemId);
  }, [removeItem]);

  // Handle quantity change with haptic
  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    const item = currentOrder?.items.find((i) => i.id === itemId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateItemQuantity(itemId, newQty);
    }
  }, [currentOrder, updateItemQuantity]);

  // Send order to kitchen
  const handleSendToKitchen = useCallback(async () => {
    if (!currentOrder || currentOrder.items.length === 0) return;

    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }

    setIsSending(true);
    setSendStatus('idle');
    setErrorMessage(null);

    try {
      // Generate order number
      const orderNumber = `M${Date.now().toString().slice(-6)}`;

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          order_type: currentOrder.tableNumber ? 'dine_in' : 'takeaway',
          table_number: currentOrder.tableNumber ? parseInt(currentOrder.tableNumber) : null,
          status: 'pending',
          user_id: userId,
          subtotal: currentOrder.subtotal,
          total: currentOrder.total,
          payment_status: 'pending',
          source: 'mobile',
        } as never)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = currentOrder.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        notes: item.notes || null,
        modifiers: item.modifiers.length > 0
          ? JSON.stringify(item.modifiers)
          : null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as never);

      if (itemsError) throw itemsError;

      // Send to KDS via LAN
      await lanClient.send(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, {
        orderId: orderData.id,
        orderNumber,
        tableNumber: currentOrder.tableNumber,
        items: currentOrder.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          modifiers: item.modifiers.map((m) => m.name),
          notes: item.notes,
        })),
        timestamp: new Date().toISOString(),
      });

      // Mark order as sent in store
      markOrderSent(orderData.id, orderNumber);

      setSendStatus('success');

      // Navigate after brief success display
      setTimeout(() => {
        navigate('/mobile/orders');
      }, 1500);
    } catch (error) {
      console.error('[MobileCart] Send error:', error);
      setSendStatus('error');
      setErrorMessage('Error sending order');
    } finally {
      setIsSending(false);
    }
  }, [currentOrder, userId, markOrderSent, navigate]);

  // Empty cart state
  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div className="flex flex-col h-full bg-secondary justify-center items-center p-8">
        <div className="text-center text-muted-foreground">
          <AlertCircle size={48} className="text-muted mb-4 mx-auto" />
          <h2 className="text-xl font-semibold mb-1 text-foreground">Empty cart</h2>
          <p className="mb-6">Add products to get started</p>
          <button
            className="py-2 px-6 bg-primary border-none rounded-xl text-white font-semibold cursor-pointer"
            onClick={() => navigate('/mobile/catalog')}
          >
            View products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-white border-b border-border">
        <button
          className="bg-transparent border-none text-foreground cursor-pointer p-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold m-0 flex-1">Cart</h1>
        {currentOrder.tableNumber && (
          <span className="flex items-center gap-1 py-1 px-2 bg-secondary rounded-full text-sm text-muted-foreground">
            <Table2 size={16} />
            Table {currentOrder.tableNumber}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {currentOrder.items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 border border-border">
            <div className="flex justify-between mb-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{item.productName}</span>
                {item.modifiers.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {item.modifiers.map((m) => m.name).join(', ')}
                  </span>
                )}
                {item.notes && (
                  <span className="text-sm text-muted italic">{item.notes}</span>
                )}
              </div>
              <span className="font-semibold text-primary">
                Rp {item.totalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 flex items-center justify-center bg-secondary border border-border rounded-full cursor-pointer active:bg-primary active:text-white active:border-primary"
                onClick={() => handleQuantityChange(item.id, -1)}
              >
                <Minus size={16} />
              </button>
              <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
              <button
                className="w-9 h-9 flex items-center justify-center bg-secondary border border-border rounded-full cursor-pointer active:bg-primary active:text-white active:border-primary"
                onClick={() => handleQuantityChange(item.id, 1)}
              >
                <Plus size={16} />
              </button>
              <button
                className="ml-auto w-9 h-9 flex items-center justify-center bg-red-100 border-none rounded-full text-destructive cursor-pointer"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-white p-4 border-t border-border">
        <div className="flex justify-between mb-1 text-muted-foreground">
          <span>Subtotal</span>
          <span>Rp {currentOrder.subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-foreground mt-2 pt-2 border-t border-border">
          <span>Total</span>
          <span>Rp {currentOrder.total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-border">
        <button
          className="flex-[0.4] flex items-center justify-center gap-2 p-4 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-150 min-h-14 bg-secondary text-muted-foreground disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={clearOrder}
          disabled={isSending}
        >
          <Trash2 size={20} />
          <span>Clear</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 p-4 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-150 min-h-14 bg-green-500 text-white active:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleSendToKitchen}
          disabled={isSending || sendStatus === 'success'}
        >
          {isSending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : sendStatus === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <Send size={20} />
          )}
          <span>
            {isSending
              ? 'Sending...'
              : sendStatus === 'success'
              ? 'Sent!'
              : 'Send to kitchen'}
          </span>
        </button>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="flex items-center gap-2 mx-4 py-2 px-4 bg-amber-100 rounded-lg text-warning text-sm">
          <AlertCircle size={16} />
          <span>Offline mode - Order will be sent when reconnected</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 mx-4 py-2 px-4 bg-red-100 rounded-lg text-destructive text-sm">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
