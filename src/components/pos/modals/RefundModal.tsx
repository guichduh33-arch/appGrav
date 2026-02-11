/**
 * RefundModal Component (F2.5)
 *
 * Modal for processing full or partial refunds with method selection.
 * Requires PIN verification for security.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 * @see src/services/financial/refundService.ts
 */

import { useState, useCallback, useEffect } from 'react';
import { X, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PinVerificationModal from './PinVerificationModal';
import { processRefund } from '@/services/financial/refundService';
import { useNetworkStore } from '@/stores/networkStore';
import { usePOSConfigSettings } from '@/hooks/settings/useModuleConfigSettings';
import { formatPrice } from '@/utils/helpers';
import {
  REFUND_REASON_OPTIONS,
  type TRefundReasonCode,
} from '@/services/financial/financialOperationService';
import type { TPaymentMethod } from '@/types/payment';
import './RefundModal.css';

interface RefundModalProps {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  originalPaymentMethod: TPaymentMethod;
  paidAt?: string;
  onRefund: () => void;
  onClose: () => void;
}

type RefundType = 'full' | 'partial';

const REFUND_METHODS: Array<{ id: TPaymentMethod | 'same'; label: string }> = [
  { id: 'same', label: 'Same as original' },
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'transfer', label: 'Bank Transfer' },
];

export default function RefundModal({
  orderId,
  orderNumber,
  orderTotal,
  originalPaymentMethod,
  paidAt,
  onRefund,
  onClose,
}: RefundModalProps) {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const posConfig = usePOSConfigSettings();

  // Form state
  const [refundType, setRefundType] = useState<RefundType>('full');
  const [amount, setAmount] = useState<number>(orderTotal);
  const [refundMethod, setRefundMethod] = useState<TPaymentMethod | 'same'>('same');
  const [reasonCode, setReasonCode] = useState<TRefundReasonCode | ''>('');
  const [notes, setNotes] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update amount when refund type changes
  useEffect(() => {
    if (refundType === 'full') {
      setAmount(orderTotal);
    }
  }, [refundType, orderTotal]);

  // Validation
  const isValidAmount = amount > 0 && amount <= orderTotal;
  const canSubmit = reasonCode !== '' && isValidAmount;

  // Get actual refund method
  const actualRefundMethod = refundMethod === 'same' ? originalPaymentMethod : refundMethod;

  // Handle refund button click - show PIN modal
  const handleRefundClick = useCallback(() => {
    if (!canSubmit) {
      if (!isValidAmount) {
        toast.error('Invalid refund amount');
      } else {
        toast.error('Please select a reason');
      }
      return;
    }
    setShowPinModal(true);
  }, [canSubmit, isValidAmount]);

  // Handle PIN verification
  const handlePinVerified = useCallback(
    async (verified: boolean, verifiedUser?: { id: string; name: string }) => {
      if (!verified || !verifiedUser) {
        setShowPinModal(false);
        return;
      }

      setShowPinModal(false);
      setIsProcessing(true);

      try {
        // Construct reason text
        const reasonLabel = REFUND_REASON_OPTIONS.find((o) => o.value === reasonCode)?.label || reasonCode;
        const fullReason = notes ? `${reasonLabel}: ${notes}` : reasonLabel;

        const result = await processRefund({
          orderId,
          amount,
          reason: fullReason,
          reasonCode: reasonCode as TRefundReasonCode,
          method: actualRefundMethod,
          refundedBy: verifiedUser.id,
        });

        if (result.success) {
          toast.success(`Refund of ${formatPrice(amount)} processed`);
          if (!isOnline) {
            toast.info('Refund will sync when online');
          }
          onRefund();
          onClose();
        } else {
          toast.error(result.error || 'Failed to process refund');
        }
      } catch (error) {
        console.error('Refund error:', error);
        toast.error('Failed to process refund');
      } finally {
        setIsProcessing(false);
      }
    },
    [orderId, amount, reasonCode, notes, actualRefundMethod, isOnline, onRefund, onClose]
  );

  // Payment method display name
  const paymentMethodName: string = ({
    cash: 'Cash',
    card: 'Card',
    qris: 'QRIS',
    edc: 'EDC',
    transfer: 'Transfer',
    store_credit: 'Store Credit',
  } as Record<string, string>)[originalPaymentMethod] || originalPaymentMethod;

  return (
    <>
      <div
        className="modal-backdrop is-active"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal modal-md is-active refund-modal">
          <div className="modal__header refund-modal__header">
            <div className="refund-modal__header-content">
              <DollarSign size={24} className="refund-modal__icon" />
              <h3 className="modal__title">Process Refund</h3>
            </div>
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              aria-label="Close"
              disabled={isProcessing}
            >
              <X size={24} />
            </button>
          </div>

          <div className="modal__body refund-modal__body">
            {/* Order Summary */}
            <div className="refund-modal__summary">
              <div className="refund-modal__summary-header">
                <span className="refund-modal__order-number">Order {orderNumber}</span>
              </div>
              <div className="refund-modal__summary-details">
                <div className="refund-modal__detail">
                  <span className="refund-modal__detail-label">Original Total</span>
                  <span className="refund-modal__detail-value">{formatPrice(orderTotal)}</span>
                </div>
                <div className="refund-modal__detail">
                  <span className="refund-modal__detail-label">Payment Method</span>
                  <span className="refund-modal__detail-value">{paymentMethodName}</span>
                </div>
                {paidAt && (
                  <div className="refund-modal__detail">
                    <span className="refund-modal__detail-label">Paid At</span>
                    <span className="refund-modal__detail-value">{paidAt}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Refund Type Toggle */}
            <div className="refund-modal__field">
              <label className="refund-modal__label">Refund Type</label>
              <div className="refund-modal__toggle">
                <button
                  type="button"
                  className={`refund-modal__toggle-btn ${refundType === 'full' ? 'is-active' : ''}`}
                  onClick={() => setRefundType('full')}
                  disabled={isProcessing}
                >
                  Full Refund
                  <span className="refund-modal__toggle-amount">{formatPrice(orderTotal)}</span>
                </button>
                <button
                  type="button"
                  className={`refund-modal__toggle-btn ${refundType === 'partial' ? 'is-active' : ''}`}
                  onClick={() => setRefundType('partial')}
                  disabled={isProcessing}
                >
                  Partial Refund
                  <span className="refund-modal__toggle-hint">Enter amount</span>
                </button>
              </div>
            </div>

            {/* Partial Amount Input */}
            {refundType === 'partial' && (
              <div className="refund-modal__field">
                <label className="refund-modal__label">
                  Refund Amount <span className="required">*</span>
                </label>
                <div className="refund-modal__amount-input">
                  <span className="refund-modal__currency">Rp</span>
                  <input
                    type="text"
                    value={amount.toLocaleString('id-ID')}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                      setAmount(Math.min(value, orderTotal));
                    }}
                    disabled={isProcessing}
                  />
                </div>
                <span className="refund-modal__hint">Maximum: {formatPrice(orderTotal)}</span>
              </div>
            )}

            {/* Refund Method */}
            <div className="refund-modal__field">
              <label className="refund-modal__label">Refund Method</label>
              <div className="refund-modal__methods">
                {REFUND_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`refund-modal__method-btn ${refundMethod === method.id ? 'is-active' : ''}`}
                    onClick={() => setRefundMethod(method.id)}
                    disabled={isProcessing}
                  >
                    {method.id === 'same' ? `${method.label} (${paymentMethodName})` : method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Selection */}
            <div className="refund-modal__field">
              <label className="refund-modal__label">
                Reason for refund <span className="required">*</span>
              </label>
              <select
                className="refund-modal__select"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as TRefundReasonCode)}
                disabled={isProcessing}
              >
                <option value="">Select a reason...</option>
                {REFUND_REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div className="refund-modal__field">
              <label className="refund-modal__label">Additional notes</label>
              <textarea
                className="refund-modal__textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="modal__footer refund-modal__footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-refund"
              onClick={handleRefundClick}
              disabled={!canSubmit || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>Process Refund ({formatPrice(amount)})</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <PinVerificationModal
          title="Manager Verification"
          message={`Enter manager PIN to process ${formatPrice(amount)} refund`}
          allowedRoles={posConfig.refundRequiredRoles}
          onVerify={handlePinVerified}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </>
  );
}

export { RefundModal };
