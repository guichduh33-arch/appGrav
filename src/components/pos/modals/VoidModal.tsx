/**
 * VoidModal Component (F2.4)
 *
 * Modal for voiding an order with reason selection and PIN verification.
 * Red warning theme to indicate destructive action.
 *
 * @see docs/adr/ADR-001-payment-system-refactor.md
 * @see src/services/financial/voidService.ts
 */

import { useState, useCallback } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PinVerificationModal from './PinVerificationModal';
import { voidOrder } from '@/services/financial/voidService';
import { useNetworkStore } from '@/stores/networkStore';
import { usePOSConfigSettings } from '@/hooks/settings/useModuleConfigSettings';
import { formatPrice } from '@/utils/helpers';
import {
  VOID_REASON_OPTIONS,
  type TVoidReasonCode,
} from '@/services/financial/financialOperationService';
import type { TPaymentMethod } from '@/types/payment';
import './VoidModal.css';

interface VoidModalProps {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  paymentMethod: TPaymentMethod;
  orderTime?: string;
  onVoid: () => void;
  onClose: () => void;
}

export default function VoidModal({
  orderId,
  orderNumber,
  orderTotal,
  paymentMethod,
  orderTime,
  onVoid,
  onClose,
}: VoidModalProps) {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const posConfig = usePOSConfigSettings();

  // Form state
  const [reasonCode, setReasonCode] = useState<TVoidReasonCode | ''>('');
  const [notes, setNotes] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Can submit?
  const canSubmit = reasonCode !== '';

  // Handle void button click - show PIN modal
  const handleVoidClick = useCallback(() => {
    if (!canSubmit) {
      toast.error('Please select a reason');
      return;
    }
    setShowPinModal(true);
  }, [canSubmit]);

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
        const reasonLabel = VOID_REASON_OPTIONS.find((o) => o.value === reasonCode)?.label || reasonCode;
        const fullReason = notes ? `${reasonLabel}: ${notes}` : reasonLabel;

        const result = await voidOrder({
          orderId,
          reason: fullReason,
          reasonCode: reasonCode as TVoidReasonCode,
          voidedBy: verifiedUser.id,
        });

        if (result.success) {
          toast.success(`Order ${orderNumber} voided`);
          if (!isOnline) {
            toast.info('Void will sync when online');
          }
          onVoid();
          onClose();
        } else {
          toast.error(result.error || 'Failed to void order');
        }
      } catch (error) {
        console.error('Void error:', error);
        toast.error('Failed to void order');
      } finally {
        setIsProcessing(false);
      }
    },
    [orderId, orderNumber, reasonCode, notes, isOnline, onVoid, onClose]
  );

  // Payment method display name
  const paymentMethodName: string = ({
    cash: 'Cash',
    card: 'Card',
    qris: 'QRIS',
    edc: 'EDC',
    transfer: 'Transfer',
    store_credit: 'Store Credit',
  } as Record<string, string>)[paymentMethod] || paymentMethod;

  return (
    <>
      <div
        className="modal-backdrop is-active"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal modal-md is-active void-modal">
          <div className="modal__header void-modal__header">
            <div className="void-modal__header-content">
              <AlertTriangle size={24} className="void-modal__icon" />
              <h3 className="modal__title">Void Order</h3>
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

          <div className="modal__body void-modal__body">
            {/* Order Summary */}
            <div className="void-modal__summary">
              <div className="void-modal__summary-header">
                <span className="void-modal__order-number">Order {orderNumber}</span>
              </div>
              <div className="void-modal__summary-details">
                <div className="void-modal__detail">
                  <span className="void-modal__detail-label">Total</span>
                  <span className="void-modal__detail-value">{formatPrice(orderTotal)}</span>
                </div>
                <div className="void-modal__detail">
                  <span className="void-modal__detail-label">Payment</span>
                  <span className="void-modal__detail-value">{paymentMethodName}</span>
                </div>
                {orderTime && (
                  <div className="void-modal__detail">
                    <span className="void-modal__detail-label">Time</span>
                    <span className="void-modal__detail-value">{orderTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason Selection */}
            <div className="void-modal__field">
              <label className="void-modal__label">
                Reason for void <span className="required">*</span>
              </label>
              <select
                className="void-modal__select"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as TVoidReasonCode)}
                disabled={isProcessing}
              >
                <option value="">Select a reason...</option>
                {VOID_REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div className="void-modal__field">
              <label className="void-modal__label">Additional notes</label>
              <textarea
                className="void-modal__textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
                disabled={isProcessing}
              />
            </div>

            {/* Warning */}
            <div className="void-modal__warning">
              <AlertTriangle size={16} />
              <span>
                This action cannot be undone.
                {paymentMethod === 'cash' && ' A cash refund may be required.'}
              </span>
            </div>
          </div>

          <div className="modal__footer void-modal__footer">
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
              className="btn btn-danger"
              onClick={handleVoidClick}
              disabled={!canSubmit || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Void Order'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <PinVerificationModal
          title="Manager Verification"
          message={`Enter manager PIN to void order ${orderNumber}`}
          allowedRoles={posConfig.voidRequiredRoles}
          onVerify={handlePinVerified}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </>
  );
}

export { VoidModal };
