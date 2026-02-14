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
import { logError } from '@/utils/logger'

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
        logError('Refund error:', error);
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
        className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-[var(--theme-bg-primary)] rounded-xl text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] w-full max-w-[520px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <DollarSign size={24} className="text-[var(--color-gold)]" />
              <h3 className="text-lg font-bold text-white m-0">Process Refund</h3>
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

          <div className="flex flex-col gap-4 p-6">
            {/* Order Summary */}
            <div className="bg-[var(--theme-bg-secondary)] border border-white/5 rounded-lg p-4">
              <div className="mb-2 pb-2 border-b border-white/5">
                <span className="text-lg font-bold text-[var(--color-gold)]">Order {orderNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--theme-text-secondary)] text-sm">Original Total</span>
                  <span className="font-semibold text-white">{formatPrice(orderTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--theme-text-secondary)] text-sm">Payment Method</span>
                  <span className="font-semibold text-white">{paymentMethodName}</span>
                </div>
                {paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--theme-text-secondary)] text-sm">Paid At</span>
                    <span className="font-semibold text-white">{paidAt}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Refund Type Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Refund Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={cn(
                    'flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 font-semibold disabled:opacity-50',
                    refundType === 'full'
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-white'
                      : 'bg-[var(--theme-bg-secondary)] border-white/10 text-[var(--theme-text-secondary)] hover:border-[var(--color-gold)]/50'
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
                    'flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 font-semibold disabled:opacity-50',
                    refundType === 'partial'
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-white'
                      : 'bg-[var(--theme-bg-secondary)] border-white/10 text-[var(--theme-text-secondary)] hover:border-[var(--color-gold)]/50'
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
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                  Refund Amount <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center bg-black/40 border border-[var(--color-gold)] rounded-xl py-2 px-4">
                  <span className="text-lg font-semibold text-[var(--theme-text-muted)] mr-2">Rp</span>
                  <input
                    type="text"
                    className="border-none bg-transparent text-xl font-bold text-white w-full outline-none"
                    value={amount.toLocaleString('id-ID')}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                      setAmount(Math.min(value, orderTotal));
                    }}
                    disabled={isProcessing}
                  />
                </div>
                <span className="text-xs text-[var(--theme-text-muted)]">Maximum: {formatPrice(orderTotal)}</span>
              </div>
            )}

            {/* Refund Method */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Refund Method</label>
              <div className="grid grid-cols-2 gap-2">
                {REFUND_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={cn(
                      'py-2 px-4 border rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 disabled:opacity-50',
                      refundMethod === method.id
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-white'
                        : 'bg-[var(--theme-bg-secondary)] border-white/10 text-[var(--theme-text-secondary)] hover:border-[var(--color-gold)]/50'
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
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                Reason for refund <span className="text-red-400">*</span>
              </label>
              <select
                className="bg-black/40 border border-white/10 rounded-xl text-white px-4 py-3 focus:border-[var(--color-gold)] focus:outline-none"
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
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Additional notes</label>
              <textarea
                className="bg-black/40 border border-white/10 rounded-xl text-white px-4 py-3 focus:border-[var(--color-gold)] focus:outline-none resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                disabled={isProcessing}
              />
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
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-gold)] rounded-xl text-black text-sm font-bold cursor-pointer hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
