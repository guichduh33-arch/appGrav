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
import { cn } from '@/lib/utils';

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
        <div className="modal modal-md is-active max-w-[520px]">
          <div className="modal__header bg-gradient-to-br from-blue-600 to-blue-700 !border-b-0">
            <div className="flex items-center gap-2">
              <DollarSign size={24} className="text-blue-200" />
              <h3 className="modal__title !text-white">Process Refund</h3>
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

          <div className="modal__body flex flex-col gap-4 p-6">
            {/* Order Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="mb-2 pb-2 border-b border-blue-200">
                <span className="text-lg font-bold text-blue-800">Order {orderNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-blue-500 text-sm">Original Total</span>
                  <span className="font-semibold text-blue-800">{formatPrice(orderTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-500 text-sm">Payment Method</span>
                  <span className="font-semibold text-blue-800">{paymentMethodName}</span>
                </div>
                {paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-500 text-sm">Paid At</span>
                    <span className="font-semibold text-blue-800">{paidAt}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Refund Type Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">Refund Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={cn(
                    'flex flex-col items-center p-4 bg-background border-2 border-border rounded-lg cursor-pointer transition-all duration-200 font-semibold hover:border-blue-600 disabled:opacity-50',
                    refundType === 'full' && 'border-blue-600 bg-blue-50 text-blue-800'
                  )}
                  onClick={() => setRefundType('full')}
                  disabled={isProcessing}
                >
                  Full Refund
                  <span className="text-lg font-bold mt-1">{formatPrice(orderTotal)}</span>
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex flex-col items-center p-4 bg-background border-2 border-border rounded-lg cursor-pointer transition-all duration-200 font-semibold hover:border-blue-600 disabled:opacity-50',
                    refundType === 'partial' && 'border-blue-600 bg-blue-50 text-blue-800'
                  )}
                  onClick={() => setRefundType('partial')}
                  disabled={isProcessing}
                >
                  Partial Refund
                  <span className="text-xs opacity-70 mt-1">Enter amount</span>
                </button>
              </div>
            </div>

            {/* Partial Amount Input */}
            {refundType === 'partial' && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-foreground">
                  Refund Amount <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center bg-background border-2 border-primary rounded-lg py-2 px-4">
                  <span className="text-lg font-semibold text-muted-foreground mr-2">Rp</span>
                  <input
                    type="text"
                    className="border-none bg-transparent text-xl font-bold text-foreground w-full outline-none"
                    value={amount.toLocaleString('id-ID')}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                      setAmount(Math.min(value, orderTotal));
                    }}
                    disabled={isProcessing}
                  />
                </div>
                <span className="text-xs text-muted-foreground">Maximum: {formatPrice(orderTotal)}</span>
              </div>
            )}

            {/* Refund Method */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">Refund Method</label>
              <div className="grid grid-cols-2 gap-2">
                {REFUND_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={cn(
                      'py-2 px-4 bg-background border border-border rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:border-blue-600 disabled:opacity-50',
                      refundMethod === method.id && 'border-blue-600 bg-blue-50 text-blue-800'
                    )}
                    onClick={() => setRefundMethod(method.id)}
                    disabled={isProcessing}
                  >
                    {method.id === 'same' ? `${method.label} (${paymentMethodName})` : method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">
                Reason for refund <span className="text-red-600">*</span>
              </label>
              <select
                className="form-select"
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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">Additional notes</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                disabled={isProcessing}
              />
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
              className="flex items-center gap-1 py-2 px-6 bg-blue-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
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
