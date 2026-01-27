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
import './MobileCartPage.css';

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
      setErrorMessage('Erreur lors de l\'envoi de la commande');
    } finally {
      setIsSending(false);
    }
  }, [currentOrder, userId, markOrderSent, navigate]);

  // Empty cart state
  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div className="mobile-cart mobile-cart--empty">
        <div className="mobile-cart__empty-content">
          <AlertCircle size={48} className="mobile-cart__empty-icon" />
          <h2>Panier vide</h2>
          <p>Ajoutez des produits pour commencer</p>
          <button
            className="mobile-cart__empty-btn"
            onClick={() => navigate('/mobile/catalog')}
          >
            Voir les produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-cart">
      {/* Header */}
      <div className="mobile-cart__header">
        <button className="mobile-cart__back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Panier</h1>
        {currentOrder.tableNumber && (
          <span className="mobile-cart__table">
            <Table2 size={16} />
            Table {currentOrder.tableNumber}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="mobile-cart__items">
        {currentOrder.items.map((item) => (
          <div key={item.id} className="mobile-cart__item">
            <div className="mobile-cart__item-main">
              <div className="mobile-cart__item-info">
                <span className="mobile-cart__item-name">{item.productName}</span>
                {item.modifiers.length > 0 && (
                  <span className="mobile-cart__item-mods">
                    {item.modifiers.map((m) => m.name).join(', ')}
                  </span>
                )}
                {item.notes && (
                  <span className="mobile-cart__item-notes">{item.notes}</span>
                )}
              </div>
              <span className="mobile-cart__item-price">
                Rp {item.totalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="mobile-cart__item-actions">
              <button
                className="mobile-cart__qty-btn"
                onClick={() => handleQuantityChange(item.id, -1)}
              >
                <Minus size={16} />
              </button>
              <span className="mobile-cart__qty">{item.quantity}</span>
              <button
                className="mobile-cart__qty-btn"
                onClick={() => handleQuantityChange(item.id, 1)}
              >
                <Plus size={16} />
              </button>
              <button
                className="mobile-cart__remove-btn"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mobile-cart__total">
        <div className="mobile-cart__total-row">
          <span>Sous-total</span>
          <span>Rp {currentOrder.subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="mobile-cart__total-row mobile-cart__total-row--final">
          <span>Total</span>
          <span>Rp {currentOrder.total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mobile-cart__actions">
        <button
          className="mobile-cart__action mobile-cart__action--clear"
          onClick={clearOrder}
          disabled={isSending}
        >
          <Trash2 size={20} />
          <span>Vider</span>
        </button>

        <button
          className="mobile-cart__action mobile-cart__action--send"
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
              ? 'Envoi...'
              : sendStatus === 'success'
              ? 'Envoyée!'
              : 'Envoyer à la cuisine'}
          </span>
        </button>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="mobile-cart__warning">
          <AlertCircle size={16} />
          <span>Mode hors-ligne - La commande sera envoyée à la reconnexion</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mobile-cart__error">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
