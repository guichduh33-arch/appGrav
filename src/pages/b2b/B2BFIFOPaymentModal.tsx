import { DollarSign, Loader2 } from 'lucide-react'

interface B2BFIFOPaymentModalProps {
    customerName: string
    amount: string
    method: string
    reference: string
    processing: boolean
    onAmountChange: (value: string) => void
    onMethodChange: (value: string) => void
    onReferenceChange: (value: string) => void
    onSubmit: () => void
    onClose: () => void
}

const inputClass = 'w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none'
const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]'

export default function B2BFIFOPaymentModal({
    customerName,
    amount,
    method,
    reference,
    processing,
    onAmountChange,
    onMethodChange,
    onReferenceChange,
    onSubmit,
    onClose,
}: B2BFIFOPaymentModalProps) {
    return (
        <div
            className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-6"
            onClick={(e) => e.target === e.currentTarget && !processing && onClose()}
        >
            <div className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-lg w-full max-w-[480px] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <DollarSign size={20} className="text-[var(--color-gold)]" />
                        FIFO Payment - {customerName}
                    </h3>
                    <button
                        className="w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer hover:border-white/20 hover:text-white"
                        onClick={onClose}
                        disabled={processing}
                    >
                        &times;
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-[var(--theme-text-muted)]">
                        Payment will be allocated to the oldest unpaid invoices first (FIFO).
                    </p>
                    <div className="space-y-1.5">
                        <label className={labelClass}>Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => onAmountChange(e.target.value)}
                            placeholder="Enter amount..."
                            min="0"
                            disabled={processing}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClass}>Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => onMethodChange(e.target.value)}
                            disabled={processing}
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
                        <label className={labelClass}>Reference (optional)</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => onReferenceChange(e.target.value)}
                            placeholder="Transfer reference, check number..."
                            disabled={processing}
                            className={inputClass}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-white font-medium rounded-xl text-sm transition-colors hover:border-white/20 disabled:opacity-50"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110 disabled:opacity-50"
                        onClick={onSubmit}
                        disabled={processing || !amount || Number(amount) <= 0}
                    >
                        {processing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <DollarSign size={16} />
                                Apply FIFO Payment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
