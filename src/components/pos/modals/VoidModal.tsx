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

  const [reasonCode, setReasonCode] = useState<TVoidReasonCode | ''>('');
  const [notes, setNotes] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canSubmit = reasonCode !== '';

  const handleVoidClick = useCallback(() => {
    if (!canSubmit) {
      toast.error('Please select a reason');
      return;
    }
    setShowPinModal(true);
  }, [canSubmit]);

  const handlePinVerified = useCallback(
    async (verified: boolean, verifiedUser?: { id: string; name: string }) => {
      if (!verified || !verifiedUser) {
        setShowPinModal(false);
        return;
      }

      setShowPinModal(false);
      setIsProcessing(true);

      try {
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
        <div className="modal modal-md is-active max-w-[500px]">
          {/* Red gradient header */}
          <div className="modal__header bg-gradient-to-br from-red-600 to-red-700 !border-b-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-50" />
              <h3 className="modal__title !text-white">Void Order</h3>
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

          <div className="modal__body flex flex-col gap-6 p-6">
            {/* Order Summary */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="mb-2 pb-2 border-b border-red-200">
                <span className="text-lg font-bold text-red-900">Order {orderNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-red-950 text-sm">Total</span>
                  <span className="font-semibold text-red-900">{formatPrice(orderTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-950 text-sm">Payment</span>
                  <span className="font-semibold text-red-900">{paymentMethodName}</span>
                </div>
                {orderTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-950 text-sm">Time</span>
                    <span className="font-semibold text-red-900">{orderTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">
                Reason for void <span className="text-red-600">*</span>
              </label>
              <select
                className="form-select"
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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">Additional notes</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
                disabled={isProcessing}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-4 bg-amber-50 border border-yellow-300 rounded text-sm text-amber-800 [&>svg]:shrink-0 [&>svg]:mt-0.5">
              <AlertTriangle size={16} />
              <span>
                This action cannot be undone.
                {paymentMethod === 'cash' && ' A cash refund may be required.'}
              </span>
            </div>
          </div>

          <div className="modal__footer flex justify-end gap-4 px-6 py-4 border-t border-border">
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
