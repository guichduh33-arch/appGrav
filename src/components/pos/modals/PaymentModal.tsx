/**
 * PaymentModal - Split Payment Support (F2.2)
 *
 * Supports single and split payments with state machine pattern.
 * All payment methods available with offline support.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 * @see src/stores/paymentStore.ts
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { logError } from '@/utils/logger';
import {
  X,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Plus,
  Trash2,
  Building,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import { usePaymentStore } from '../../../stores/paymentStore';
import { formatPrice } from '../../../utils/helpers';
import { useOfflinePayment } from '../../../hooks/offline/useOfflinePayment';
import { useNetworkStore } from '../../../stores/networkStore';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';
import type { TPaymentMethod } from '@/types/payment';
import { printReceipt, type IOrderPrintData } from '@/services/print/printService';
import { useDisplayBroadcast } from '@/hooks/pos';
import { calculateTaxAmount } from '@/services/offline/offlineOrderService';
import { createB2BPosOrder } from '@/services/b2b/b2bPosOrderService';
import { usePOSConfigSettings } from '@/hooks/settings/useModuleConfigSettings';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentNumpad } from './PaymentNumpad';
import { PaymentOrderSummary } from './PaymentOrderSummary';
import { PaymentSuccess } from './PaymentSuccess';
import './PaymentModal.css';

interface PaymentModalProps {
  onClose: () => void;
}

// Payment method config
const PAYMENT_METHODS: Array<{
  id: TPaymentMethod;
  name: string;
  icon: typeof Banknote;
  requiresReference?: boolean;
}> = [
    { id: 'cash', name: 'Cash', icon: Banknote },
    { id: 'card', name: 'Card', icon: CreditCard, requiresReference: true },
    { id: 'qris', name: 'QRIS', icon: QrCode, requiresReference: true },
    { id: 'edc', name: 'EDC', icon: Smartphone, requiresReference: true },
    { id: 'transfer', name: 'Transfer', icon: Building, requiresReference: true },
  ];

const B2B_PAYMENT_METHOD = {
  id: 'store_credit' as TPaymentMethod,
  name: 'Store Credit',
  icon: Building,
  requiresReference: false,
};

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const {
    items: cartItems, total, subtotal, discountAmount,
    orderType, tableNumber, customerName, customerId,
    customerCategorySlug, activeOrderNumber,
  } = useCartStore();
  const isOnline = useNetworkStore((state) => state.isOnline);
  const { user } = useAuthStore();

  const {
    payments, totalPaid, remainingAmount, status, currentMethod,
    currentAmount, initialize, setCurrentMethod, setCurrentAmount,
    addPayment, removePayment, reset, isComplete, getPaymentInputs,
  } = usePaymentStore();

  const { processPayment, processSplitPayment, isProcessing, error, clearError } =
    useOfflinePayment();
  const { broadcastOrderComplete, broadcastClear } = useDisplayBroadcast();
  const posConfig = usePOSConfigSettings();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successChange, setSuccessChange] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const errorShownRef = useRef(false);

  useEffect(() => {
    initialize(Math.round(total));
    return () => reset();
  }, [total, initialize, reset]);

  useEffect(() => {
    if (error && !errorShownRef.current) {
      toast.error(`Payment error: ${error}`);
      errorShownRef.current = true;
    } else if (!error) {
      errorShownRef.current = false;
    }
  }, [error]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const progressPercent = Math.min(100, (totalPaid / Math.round(total)) * 100);

  const handleSelectMethod = useCallback(
    (method: TPaymentMethod) => {
      setCurrentMethod(method);
      setCashReceived(0);
      if (method !== 'cash') {
        setCurrentAmount(remainingAmount);
      } else {
        setCurrentAmount(0);
      }
    },
    [setCurrentMethod, setCurrentAmount, remainingAmount]
  );

  const handleNumpadKey = useCallback(
    (key: string) => {
      if (key === 'clear') {
        setCashReceived(0);
        setCurrentAmount(0);
      } else if (key === 'backspace') {
        setCashReceived((prev) => Math.floor(prev / 10));
      } else {
        const digit = parseInt(key, 10);
        setCashReceived((prev) => {
          const newValue = prev * 10 + digit;
          setCurrentAmount(Math.min(newValue, remainingAmount));
          return newValue;
        });
      }
    },
    [setCurrentAmount, remainingAmount]
  );

  const handleQuickAmount = useCallback(
    (amount: number | 'exact' | 'remaining') => {
      const value = amount === 'exact' || amount === 'remaining' ? remainingAmount : amount;
      setCashReceived(value);
      setCurrentAmount(Math.min(value, remainingAmount));
    },
    [setCurrentAmount, remainingAmount]
  );

  const handleAddPayment = useCallback(() => {
    if (!currentMethod || currentAmount <= 0) return;
    addPayment({
      method: currentMethod,
      amount: currentAmount,
      cashReceived: currentMethod === 'cash' ? cashReceived : undefined,
      isOffline: !isOnline,
    });
    setCashReceived(0);
  }, [currentMethod, currentAmount, cashReceived, isOnline, addPayment]);

  const handleCompletePayment = useCallback(async () => {
    if (!isComplete() || isProcessing) return;
    try {
      const paymentInputs = getPaymentInputs();
      let result;
      if (paymentInputs.length === 1) {
        result = await processPayment(paymentInputs[0]);
      } else {
        result = await processSplitPayment(paymentInputs);
      }

      if (result) {
        const hasStoreCredit = payments.some(p => p.method === 'store_credit');
        if (hasStoreCredit && customerId && customerCategorySlug === 'wholesale') {
          const posOrderId = typeof result === 'object' && result !== null && 'id' in result
            ? (result as { id: string }).id : undefined;
          const b2bResult = await createB2BPosOrder({
            customerId, customerName: customerName || 'B2B Customer',
            items: cartItems, subtotal, discountAmount, total,
            orderNotes: '', createdBy: user?.id || '', posOrderId,
          });
          if (b2bResult.success) toast.success(`B2B order ${b2bResult.orderNumber} created on credit`);
          else toast.error(`B2B order failed: ${b2bResult.error}`);
        }

        const totalChange = payments.reduce((sum, p) => {
          if (p.method === 'cash' && p.cashReceived) return sum + Math.max(0, p.cashReceived - p.amount);
          return sum;
        }, 0);

        setSuccessChange(totalChange);
        setShowSuccess(true);
        const orderNum = activeOrderNumber || `ORD-${Date.now()}`;
        broadcastOrderComplete(orderNum, total, totalChange > 0 ? totalChange : undefined);
        if (!isOnline) toast.success('Payment saved offline');
      }
    } catch (err) {
      logError('Payment error:', err);
    }
  }, [isComplete, isProcessing, getPaymentInputs, processPayment, processSplitPayment, payments, isOnline, activeOrderNumber, total, broadcastOrderComplete, customerId, customerName, customerCategorySlug, cartItems, subtotal, discountAmount, user]);

  const handleNewOrder = useCallback(() => {
    broadcastClear();
    reset();
    onClose();
    toast.success('Ready for new order');
  }, [reset, onClose, broadcastClear]);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);
    try {
      const tax = calculateTaxAmount(total);
      const orderData: IOrderPrintData = {
        orderNumber: activeOrderNumber || `ORD-${Date.now()}`,
        orderType, tableNumber: tableNumber || undefined,
        customerName: customerName || undefined,
        items: cartItems.map((item) => ({
          name: item.type === 'combo' ? (item.combo?.name || 'Combo') : (item.product?.name || 'Product'),
          quantity: item.quantity, price: item.totalPrice,
          modifiers: item.modifiers.map((m) => m.optionLabel),
          notes: item.notes || undefined,
        })),
        subtotal, tax, discount: discountAmount > 0 ? discountAmount : undefined,
        total, payments: payments.map((p) => ({ method: p.method, amount: p.amount, reference: p.reference })),
        change: successChange > 0 ? successChange : undefined,
        cashierName: user?.name || user?.email || 'Cashier',
        createdAt: new Date().toISOString(),
      };
      const result = await printReceipt(orderData);
      if (result.success) toast.success('Receipt printed');
      else toast.error(result.error || 'Print failed');
    } catch (err) {
      logError('Print error:', err);
      toast.error('Failed to print receipt');
    } finally {
      setIsPrinting(false);
    }
  }, [activeOrderNumber, orderType, tableNumber, customerName, cartItems, subtotal, discountAmount, total, payments, successChange, user]);

  const canAddCurrent = currentMethod && currentAmount > 0 &&
    (currentMethod !== 'cash' || cashReceived >= currentAmount);

  const availableMethods = [...PAYMENT_METHODS, ...(customerCategorySlug === 'wholesale' ? [B2B_PAYMENT_METHOD] : [])];

  if (showSuccess) {
    return (
      <PaymentSuccess
        payments={payments}
        successChange={successChange}
        isOnline={isOnline}
        isPrinting={isPrinting}
        onPrint={handlePrint}
        onNewOrder={handleNewOrder}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0D0D0F] flex flex-col" style={{ zIndex: 'var(--z-modal-backdrop)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[var(--color-gold)]/10 bg-[#0D0D0F] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-[0.15em] text-white">THE BREAKERY</span>
          <span className="text-xs text-[var(--theme-text-muted)]">Station 04 &bull; Terminal 12</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--theme-text-muted)]">Server: <span className="text-white font-medium">{user?.name || user?.email || 'Cashier'}</span></span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer transition-colors" onClick={onClose} aria-label="Close" title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Order Summary */}
        <div className="w-[45%] border-r border-white/5 flex flex-col bg-[#0D0D0F] overflow-hidden">
          <div className="px-8 pt-6 pb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">Current Order</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            {/* Order items table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-[#8E8E93] border-b border-white/5">
                  <th className="text-left py-3 font-semibold">Item</th>
                  <th className="text-center py-3 font-semibold w-16">Qty</th>
                  <th className="text-right py-3 font-semibold w-24">Price</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-white/5">
                    <td className="py-3 text-white font-medium">
                      {item.type === 'combo' ? item.combo?.name : item.product?.name}
                      {item.modifiers.length > 0 && (
                        <span className="block text-[11px] text-[#8E8E93] mt-0.5">{item.modifiers.map(m => m.optionLabel).join(', ')}</span>
                      )}
                    </td>
                    <td className="py-3 text-center text-[#8E8E93]">{item.quantity}</td>
                    <td className="py-3 text-right text-white font-medium">{formatPrice(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Order totals */}
          <div className="px-8 py-6 border-t border-white/5 mt-auto">
            <div className="flex justify-between text-xs text-[#8E8E93] mb-2">
              <span>Subtotal</span>
              <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-[#8E8E93] mb-2">
                <span>Discount</span>
                <span className="text-green-400 font-semibold">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-[#8E8E93] mb-4">
              <span>Tax (incl.)</span>
              <span>{formatPrice(Math.round(total * 10 / 110))}</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-white/10">
              <span className="text-sm font-bold text-white uppercase tracking-widest">Total Amount</span>
              <span className="text-2xl font-bold text-[var(--color-gold)]">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Payment Controls */}
        <div className="flex-1 flex flex-col bg-[#161618] overflow-y-auto">
          <div className="px-8 py-6 flex flex-col gap-6 flex-1">
            {/* Payment Progress */}
            <PaymentOrderSummary
              totalPaid={totalPaid}
              total={total}
              remainingAmount={remainingAmount}
              status={status}
              progressPercent={progressPercent}
            />

            {/* Added Payments List */}
            {payments.length > 0 && (
              <div>
                <label className="section-label">PAYMENTS ADDED</label>
                {payments.map((payment) => {
                  const methodConfig = PAYMENT_METHODS.find((m) => m.id === payment.method);
                  const Icon = methodConfig?.icon || Banknote;
                  return (
                    <div key={payment.id} className="payment-list__item">
                      <div className="payment-list__info">
                        <Icon size={20} />
                        <span className="payment-list__method">{methodConfig?.name}</span>
                        <span className="payment-list__amount">{formatPrice(payment.amount)}</span>
                      </div>
                      <button type="button" className="payment-list__remove" onClick={() => removePayment(payment.id)} title="Remove payment">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Payment Method Selection */}
            {status !== 'complete' && (
              <>
                <PaymentMethodSelector
                  methods={availableMethods}
                  currentMethod={currentMethod}
                  onSelectMethod={handleSelectMethod}
                  isOnline={isOnline}
                  label={payments.length > 0 ? 'ADD ANOTHER PAYMENT' : 'SELECT PAYMENT METHOD'}
                />

                {/* Amount Entry */}
                {currentMethod && (
                  <div className={`payment-grid ${currentMethod !== 'cash' ? 'payment-grid--single' : ''}`}>
                    <div className="payment-left">
                      {/* Amount display */}
                      <div className="text-center p-6 bg-[var(--theme-bg-secondary)]/50 border border-[var(--color-gold)]/20 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)] mb-2">
                          {currentMethod === 'cash' ? 'Enter Amount' : 'Payment Amount'}
                        </p>
                        <p className="text-5xl font-light text-white leading-none">
                          {formatPrice(currentAmount)}
                        </p>
                      </div>

                      {/* Quick Amounts for Cash */}
                      {currentMethod === 'cash' && (
                        <>
                          <div className="flex-grow flex flex-col">
                            <p className="section-label">AMOUNT RECEIVED</p>
                            <div className="grid grid-cols-3 gap-2 flex-grow">
                              <button className="quick-amount-btn is-exact" onClick={() => handleQuickAmount('remaining')}>
                                Exact ({formatPrice(remainingAmount)})
                              </button>
                              {posConfig.quickPaymentAmounts.filter((a) => a >= remainingAmount * 0.5).map((amount) => (
                                <button key={amount} className="quick-amount-btn" onClick={() => handleQuickAmount(amount)}>
                                  {formatPrice(amount)}
                                </button>
                              ))}
                            </div>
                          </div>
                          {cashReceived > currentAmount && (
                            <div className="payment-change">
                              <span className="payment-change__label">Change</span>
                              <span className="payment-change__value">{formatPrice(cashReceived - currentAmount)}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Non-cash amount input */}
                      {currentMethod !== 'cash' && (
                        <div className="mt-3">
                          <label className="section-label">AMOUNT</label>
                          <div className="amount-input">
                            <span className="currency-prefix">Rp</span>
                            <input
                              type="text"
                              value={currentAmount.toLocaleString('id-ID')}
                              onChange={(e) => {
                                const value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                                setCurrentAmount(Math.min(value, remainingAmount));
                              }}
                              aria-label="Payment amount"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Numpad for Cash */}
                    {currentMethod === 'cash' && (
                      <div className="payment-right">
                        <div className="mb-3">
                          <label className="section-label">Cash received</label>
                          <div className="amount-input">
                            <span className="currency-prefix">Rp</span>
                            <input type="text" value={cashReceived.toLocaleString('id-ID')} readOnly aria-label="Cash received" />
                          </div>
                        </div>
                        <PaymentNumpad onKey={handleNumpadKey} />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-white/5 flex items-center gap-3 mt-auto shrink-0">
            <button className="py-4 px-6 border border-white/10 rounded-lg bg-transparent text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-secondary)] cursor-pointer transition-all hover:border-white/20 hover:text-white" onClick={onClose}>Cancel</button>

            {currentMethod && status !== 'complete' && (
              <button className="py-4 px-6 border border-[var(--color-gold)]/20 rounded-lg bg-transparent text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] cursor-pointer transition-all hover:bg-[var(--color-gold)]/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2" onClick={handleAddPayment} disabled={!canAddCurrent}>
                <Plus size={14} /> Add Payment
              </button>
            )}

            <button
              className="flex-1 flex items-center justify-center gap-2 py-5 px-8 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 uppercase tracking-[0.25em] bg-[var(--color-gold)] text-black shadow-lg shadow-[var(--color-gold)]/20 hover:brightness-110 disabled:bg-[var(--theme-bg-tertiary)] disabled:text-[var(--theme-text-muted)] disabled:shadow-none disabled:cursor-not-allowed"
              onClick={handleCompletePayment}
              disabled={!isComplete() || isProcessing}
            >
              {isProcessing ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <><Check size={18} /> {payments.length > 1 ? 'Complete Split' : 'Process Payment'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-8 py-2 border-t border-white/5 bg-[#0D0D0F] text-[10px] text-[#8E8E93] tracking-wider shrink-0">
        <span>Terminal: POS-12</span>
        <span>Server Sync: {isOnline ? <span className="text-green-400">● Connected</span> : <span className="text-amber-400">● Offline</span>}</span>
        <span>v2.4.1</span>
      </div>
    </div>
  );
}
