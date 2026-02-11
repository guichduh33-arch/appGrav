import { X, CreditCard } from 'lucide-react'
import type { PaymentFormData } from './b2bOrderDetailTypes'

interface B2BPaymentModalProps {
    paymentForm: PaymentFormData
    onFormChange: (form: PaymentFormData) => void
    onSubmit: () => void
    onClose: () => void
}

export default function B2BPaymentModal({
    paymentForm,
    onFormChange,
    onSubmit,
    onClose
}: B2BPaymentModalProps) {
    return (
        <div className="b2b-payment-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="b2b-payment-modal">
                <div className="modal__header">
                    <h2 className="modal__title">Record a payment</h2>
                    <button
                        type="button"
                        className="modal__close"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="modal__body">
                    <div className="form-group">
                        <label htmlFor="payment-amount">Amount *</label>
                        <input
                            id="payment-amount"
                            type="number"
                            min="0"
                            value={paymentForm.amount}
                            onChange={(e) => onFormChange({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="payment-method">Payment method *</label>
                        <select
                            id="payment-method"
                            value={paymentForm.payment_method}
                            onChange={(e) => onFormChange({ ...paymentForm, payment_method: e.target.value })}
                        >
                            <option value="transfer">Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="card">Card</option>
                            <option value="qris">QRIS</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="payment-reference">Reference (optional)</label>
                        <input
                            id="payment-reference"
                            type="text"
                            value={paymentForm.reference_number}
                            onChange={(e) => onFormChange({ ...paymentForm, reference_number: e.target.value })}
                            placeholder="Transaction #, check #..."
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="payment-notes">Notes</label>
                        <textarea
                            id="payment-notes"
                            rows={2}
                            value={paymentForm.notes}
                            onChange={(e) => onFormChange({ ...paymentForm, notes: e.target.value })}
                            placeholder="Optional notes..."
                        />
                    </div>
                </div>
                <div className="modal__footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
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
