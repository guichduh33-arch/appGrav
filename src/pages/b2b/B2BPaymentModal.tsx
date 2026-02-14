import { X, CreditCard } from 'lucide-react'
import type { PaymentFormData } from './b2bOrderDetailTypes'

interface B2BPaymentModalProps {
    paymentForm: PaymentFormData
    onFormChange: (form: PaymentFormData) => void
    onSubmit: () => void
    onClose: () => void
}

const inputClass = 'w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none'
const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]'

export default function B2BPaymentModal({
    paymentForm,
    onFormChange,
    onSubmit,
    onClose
}: B2BPaymentModalProps) {
    return (
        <div
            className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-6"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-lg w-full max-w-[480px] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">Record a payment</h2>
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer hover:border-white/20 hover:text-white"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="payment-amount" className={labelClass}>Amount *</label>
                        <input
                            id="payment-amount"
                            type="number"
                            min="0"
                            value={paymentForm.amount}
                            onChange={(e) => onFormChange({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="payment-method" className={labelClass}>Payment method *</label>
                        <select
                            id="payment-method"
                            value={paymentForm.payment_method}
                            onChange={(e) => onFormChange({ ...paymentForm, payment_method: e.target.value })}
                            className={inputClass}
                        >
                            <option value="transfer">Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="card">Card</option>
                            <option value="qris">QRIS</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="payment-reference" className={labelClass}>Reference (optional)</label>
                        <input
                            id="payment-reference"
                            type="text"
                            value={paymentForm.reference_number}
                            onChange={(e) => onFormChange({ ...paymentForm, reference_number: e.target.value })}
                            placeholder="Transaction #, check #..."
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="payment-notes" className={labelClass}>Notes</label>
                        <textarea
                            id="payment-notes"
                            rows={2}
                            value={paymentForm.notes}
                            onChange={(e) => onFormChange({ ...paymentForm, notes: e.target.value })}
                            placeholder="Optional notes..."
                            className={inputClass + ' resize-none'}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-white font-medium rounded-xl text-sm transition-colors hover:border-white/20"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110"
                        onClick={onSubmit}
                    >
                        <CreditCard size={18} />
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
