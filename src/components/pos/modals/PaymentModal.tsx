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
import {
  X,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  RotateCcw,
  WifiOff,
  Clock,
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
import './PaymentModal.css';

interface PaymentModalProps {
  onClose: () => void;
}

const QUICK_AMOUNTS = [50000, 100000, 150000, 200000, 500000];

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

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const {
    items: cartItems,
    total,
    subtotal,
    discountAmount,
    orderType,
    tableNumber,
    customerName,
    activeOrderNumber,
  } = useCartStore();
  const isOnline = useNetworkStore((state) => state.isOnline);
  const { user } = useAuthStore();

  // Payment store for split payment state
  const {
    payments,
    totalPaid,
    remainingAmount,
    status,
    currentMethod,
    currentAmount,
    initialize,
    setCurrentMethod,
    setCurrentAmount,
    addPayment,
    removePayment,
    reset,
    isComplete,
    getPaymentInputs,
  } = usePaymentStore();

  // Offline payment hook
  const { processPayment, processSplitPayment, isProcessing, error, clearError } =
    useOfflinePayment();

  // Display broadcast for customer display
  const { broadcastOrderComplete, broadcastClear } = useDisplayBroadcast();

  // Local state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successChange, setSuccessChange] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState(false);

  // Track if error toast was shown
  const errorShownRef = useRef(false);

  // Initialize payment store on mount
  useEffect(() => {
    initialize(Math.round(total));
    return () => reset();
  }, [total, initialize, reset]);

  // Show error toast
  useEffect(() => {
    if (error && !errorShownRef.current) {
      toast.error(`Payment error: ${error}`);
      errorShownRef.current = true;
    } else if (!error) {
      errorShownRef.current = false;
    }
  }, [error]);

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Calculate progress percentage
  const progressPercent = Math.min(100, (totalPaid / Math.round(total)) * 100);

  // Handle method selection
  const handleSelectMethod = useCallback(
    (method: TPaymentMethod) => {
      setCurrentMethod(method);
      setCashReceived(0);
      // Pre-fill remaining for non-cash
      if (method !== 'cash') {
        setCurrentAmount(remainingAmount);
      } else {
        setCurrentAmount(0);
      }
    },
    [setCurrentMethod, setCurrentAmount, remainingAmount]
  );

  // Handle numpad input for cash
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
          // For cash, amount to pay is min of cash received and remaining
          setCurrentAmount(Math.min(newValue, remainingAmount));
          return newValue;
        });
      }
    },
    [setCurrentAmount, remainingAmount]
  );

  // Handle quick amount selection
  const handleQuickAmount = useCallback(
    (amount: number | 'exact' | 'remaining') => {
      let value: number;
      if (amount === 'exact' || amount === 'remaining') {
        value = remainingAmount;
      } else {
        value = amount;
      }
      setCashReceived(value);
      setCurrentAmount(Math.min(value, remainingAmount));
    },
    [setCurrentAmount, remainingAmount]
  );

  // Handle adding current payment
  const handleAddPayment = useCallback(() => {
    if (!currentMethod || currentAmount <= 0) return;

    addPayment({
      method: currentMethod,
      amount: currentAmount,
      cashReceived: currentMethod === 'cash' ? cashReceived : undefined,
      isOffline: !isOnline,
    });

    // Reset local state
    setCashReceived(0);
  }, [currentMethod, currentAmount, cashReceived, isOnline, addPayment]);

  // Handle completing all payments
  const handleCompletePayment = useCallback(async () => {
    if (!isComplete() || isProcessing) return;

    try {
      const paymentInputs = getPaymentInputs();

      let result;
      if (paymentInputs.length === 1) {
        // Single payment
        result = await processPayment(paymentInputs[0]);
      } else {
        // Split payment
        result = await processSplitPayment(paymentInputs);
      }

      if (result) {
        // Calculate total change from all cash payments
        const totalChange = payments.reduce((sum, p) => {
          if (p.method === 'cash' && p.cashReceived) {
            return sum + Math.max(0, p.cashReceived - p.amount);
          }
          return sum;
        }, 0);

        setSuccessChange(totalChange);
        setShowSuccess(true);

        // Broadcast order completion to customer display
        const orderNum = activeOrderNumber || `ORD-${Date.now()}`;
        broadcastOrderComplete(orderNum, total, totalChange > 0 ? totalChange : undefined);

        if (!isOnline) {
          toast.success('Payment saved offline');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  }, [isComplete, isProcessing, getPaymentInputs, processPayment, processSplitPayment, payments, isOnline, activeOrderNumber, total, broadcastOrderComplete]);

  // Handle new order
  const handleNewOrder = useCallback(() => {
    // Clear customer display
    broadcastClear();
    reset();
    onClose();
    toast.success('Ready for new order');
  }, [reset, onClose, broadcastClear]);

  // Handle print receipt
  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      // Calculate tax (10% included in prices: tax = total * 10/110)
      const tax = Math.round(total * 10 / 110);

      // Build order data for printing
      const orderData: IOrderPrintData = {
        orderNumber: activeOrderNumber || `ORD-${Date.now()}`,
        orderType: orderType,
        tableNumber: tableNumber || undefined,
        customerName: customerName || undefined,
        items: cartItems.map((item) => ({
          name: item.type === 'combo' ? (item.combo?.name || 'Combo') : (item.product?.name || 'Product'),
          quantity: item.quantity,
          price: item.totalPrice,
          modifiers: item.modifiers.map((m) => m.optionLabel),
          notes: item.notes || undefined,
        })),
        subtotal: subtotal,
        tax: tax,
        discount: discountAmount > 0 ? discountAmount : undefined,
        total: total,
        payments: payments.map((p) => ({
          method: p.method,
          amount: p.amount,
          reference: p.reference,
        })),
        change: successChange > 0 ? successChange : undefined,
        cashierName: user?.name || user?.email || 'Cashier',
        createdAt: new Date().toISOString(),
      };

      const result = await printReceipt(orderData);

      if (result.success) {
        toast.success('Receipt printed');
      } else {
        toast.error(result.error || 'Print failed');
      }
    } catch (err) {
      console.error('Print error:', err);
      toast.error('Failed to print receipt');
    } finally {
      setIsPrinting(false);
    }
  }, [
    activeOrderNumber,
    orderType,
    tableNumber,
    customerName,
    cartItems,
    subtotal,
    discountAmount,
    total,
    payments,
    successChange,
    user,
  ]);

  // Can add current payment?
  const canAddCurrent =
    currentMethod &&
    currentAmount > 0 &&
    (currentMethod !== 'cash' || cashReceived >= currentAmount);

  // Success screen
  if (showSuccess) {
    return (
      <div
        className="modal-backdrop is-active"
        onClick={(e) => e.target === e.currentTarget && handleNewOrder()}
      >
        <div className="modal modal-sm is-active success-modal">
          <div className="modal__body success-content">
            <div className="success-icon">
              <Check size={64} className="text-success" />
            </div>
            <h2>Payment successful!</h2>
            <p className="success-subtitle">
              {payments.length > 1 ? `${payments.length} payments processed` : 'Order completed'}
            </p>

            {successChange > 0 && (
              <div className="success-change">
                <span className="success-change__label">Change given</span>
                <span className="success-change__value">{formatPrice(successChange)}</span>
              </div>
            )}

            {!isOnline && (
              <div
                className="success-offline-notice"
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#92400e',
                }}
              >
                <Clock size={20} />
                <span>Will sync when online</span>
              </div>
            )}

            <div className="success-actions">
              <button
                className="btn btn-secondary"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <>
                    <Loader2 size={18} className="mr-2 spin" />
                    Printing...
                  </>
                ) : (
                  <>
                    <Printer size={18} className="mr-2" />
                    Print
                  </>
                )}
              </button>
              <button className="btn btn-primary" onClick={handleNewOrder}>
                <RotateCcw size={18} className="mr-2" />
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-backdrop is-active"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-lg is-active">
        <div className="modal__header">
          <div>
            <h3 className="modal__title">
              <CreditCard size={24} />
              Checkout
            </h3>
            <p className="modal__subtitle">
              Total: {formatPrice(total)}
              {!isOnline && (
                <span style={{ marginLeft: '8px', color: '#f59e0b', fontSize: '12px' }}>
                  <WifiOff size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Offline
                </span>
              )}
            </p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close" title="Close">
            <X size={24} />
          </button>
        </div>

        <div className="modal__body payment-body">
          {/* Progress Section */}
          <div className="payment-progress">
            <div className="payment-progress__header">
              <span className="payment-progress__label">
                {status === 'complete' ? 'Payment Complete' : 'Payment Progress'}
              </span>
              <span className="payment-progress__amount">
                {formatPrice(totalPaid)} / {formatPrice(total)}
              </span>
            </div>
            <div className="payment-progress__bar">
              <div
                className="payment-progress__fill"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: status === 'complete' ? '#22c55e' : '#3b82f6',
                }}
              />
            </div>
            {remainingAmount > 0 && (
              <p className="payment-progress__remaining">
                Remaining: <strong>{formatPrice(remainingAmount)}</strong>
              </p>
            )}
          </div>

          {/* Added Payments List */}
          {payments.length > 0 && (
            <div className="payment-list">
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
                    <button
                      type="button"
                      className="payment-list__remove"
                      onClick={() => removePayment(payment.id)}
                      title="Remove payment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment Method Selection (only if not complete) */}
          {status !== 'complete' && (
            <>
              <div className="payment-methods-container">
                <label className="section-label">
                  {payments.length > 0 ? 'ADD ANOTHER PAYMENT' : 'PAYMENT METHOD'}
                </label>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.id} className="payment-method">
                        <input
                          type="radio"
                          name="paymentMethod"
                          id={`pay-${method.id}`}
                          checked={currentMethod === method.id}
                          onChange={() => handleSelectMethod(method.id)}
                        />
                        <label htmlFor={`pay-${method.id}`} className="payment-method__label">
                          <Icon size={24} className="payment-method__icon" />
                          <span className="payment-method__name">{method.name}</span>
                          {!isOnline && method.id !== 'cash' && (
                            <span
                              className="payment-method__offline"
                              style={{ color: '#f59e0b', fontSize: '11px' }}
                            >
                              <Clock
                                size={12}
                                style={{ display: 'inline', marginRight: '2px' }}
                              />
                              Pending
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount Entry (when method selected) */}
              {currentMethod && (
                <div
                  className={`payment-grid ${currentMethod !== 'cash' ? 'payment-grid--single' : ''}`}
                >
                  {/* Left: Amount Info */}
                  <div className="payment-left">
                    <div className="payment-amount-display">
                      <p className="payment-amount-display__label">
                        {currentMethod === 'cash' ? 'Amount to pay' : 'Payment amount'}
                      </p>
                      <p className="payment-amount-display__value">{formatPrice(currentAmount)}</p>
                    </div>

                    {/* Quick Amounts for Cash */}
                    {currentMethod === 'cash' && (
                      <>
                        <div className="quick-amounts-section">
                          <p className="section-label">AMOUNT RECEIVED</p>
                          <div className="quick-amounts">
                            <button
                              className="quick-amount-btn is-exact"
                              onClick={() => handleQuickAmount('remaining')}
                            >
                              Exact ({formatPrice(remainingAmount)})
                            </button>
                            {QUICK_AMOUNTS.filter((a) => a >= remainingAmount * 0.5).map(
                              (amount) => (
                                <button
                                  key={amount}
                                  className="quick-amount-btn"
                                  onClick={() => handleQuickAmount(amount)}
                                >
                                  {formatPrice(amount)}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Change Display */}
                        {cashReceived > currentAmount && (
                          <div className="payment-change">
                            <span className="payment-change__label">Change</span>
                            <span className="payment-change__value">
                              {formatPrice(cashReceived - currentAmount)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Non-cash amount input */}
                    {currentMethod !== 'cash' && (
                      <div className="payment-amount-input">
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
                      <div className="amount-input-container">
                        <label className="section-label">Cash received</label>
                        <div className="amount-input">
                          <span className="currency-prefix">Rp</span>
                          <input
                            type="text"
                            value={cashReceived.toLocaleString('id-ID')}
                            readOnly
                            aria-label="Cash received"
                          />
                        </div>
                      </div>
                      <div className="numpad">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map(
                          (key) => (
                            <button
                              key={key}
                              className={`numpad__key ${key === 'clear' ? 'clear' : ''} ${key === 'backspace' ? 'backspace' : ''}`}
                              onClick={() => handleNumpadKey(key)}
                            >
                              {key === 'clear' ? 'C' : key === 'backspace' ? '⌫' : key}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal__footer payment-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          {/* Add Payment Button (when method selected and not complete) */}
          {currentMethod && status !== 'complete' && (
            <button
              className="btn btn-primary"
              onClick={handleAddPayment}
              disabled={!canAddCurrent}
            >
              <Plus size={18} />
              Add Payment
            </button>
          )}

          {/* Complete Button (when payments added and complete) */}
          <button
            className="btn btn-primary-lg"
            onClick={handleCompletePayment}
            disabled={!isComplete() || isProcessing}
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Check size={20} />
                {payments.length > 1 ? 'Complete Split Payment' : 'Complete Payment'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
