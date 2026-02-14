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
import { logError } from '@/utils/logger'

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
        logError('Void error:', error);
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
        className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-[var(--theme-bg-primary)] rounded-xl text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] w-full max-w-[500px]">
          {/* Red-accented header for destructive action */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-400" />
              <h3 className="text-lg font-bold text-red-400 m-0">Void Order</h3>
            </div>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer"
              onClick={onClose}
              aria-label="Close"
              disabled={isProcessing}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-6 p-6">
            {/* Order Summary */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="mb-2 pb-2 border-b border-red-500/20">
                <span className="text-lg font-bold text-red-400">Order {orderNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--theme-text-secondary)] text-sm">Total</span>
                  <span className="font-semibold text-white">{formatPrice(orderTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--theme-text-secondary)] text-sm">Payment</span>
                  <span className="font-semibold text-white">{paymentMethodName}</span>
                </div>
                {orderTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--theme-text-secondary)] text-sm">Time</span>
                    <span className="font-semibold text-white">{orderTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                Reason for void <span className="text-red-400">*</span>
              </label>
              <select
                className="bg-black/40 border border-white/10 rounded-xl text-white px-4 py-3 focus:border-red-400 focus:outline-none"
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
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Additional notes</label>
              <textarea
                className="bg-black/40 border border-white/10 rounded-xl text-white px-4 py-3 focus:border-red-400 focus:outline-none resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
                disabled={isProcessing}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400 [&>svg]:shrink-0 [&>svg]:mt-0.5">
              <AlertTriangle size={16} />
              <span>
                This action cannot be undone.
                {paymentMethod === 'cash' && ' A cash refund may be required.'}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 border border-white/10 rounded-xl bg-transparent text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-white cursor-pointer"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 rounded-xl text-white text-sm font-bold cursor-pointer hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
