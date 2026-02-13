import { useState } from 'react'
import { X, Banknote, QrCode, CreditCard, AlertTriangle, Lock, Printer } from 'lucide-react'
import { formatPrice } from '../../../utils/helpers'
import { logError } from '@/utils/logger'

interface CloseShiftModalProps {
    sessionStats: {
        totalSales: number
        transactionCount: number
        duration: number
    }
    openingCash: number
    onClose: () => void
    onConfirm: (actualCash: number, actualQris: number, actualEdc: number, notes?: string) => Promise<void>
    isLoading: boolean
}

export default function CloseShiftModal({
    sessionStats,
    openingCash,
    onClose,
    onConfirm,
    isLoading
}: CloseShiftModalProps) {
    const [actualCash, setActualCash] = useState<string>('')
    const [actualQris, setActualQris] = useState<string>('')
    const [actualEdc, setActualEdc] = useState<string>('')
    const [notes, setNotes] = useState('')

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
            return `${hours}h ${mins}min`
        }
        return `${mins} min`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await onConfirm(
                parseInt(actualCash) || 0,
                parseInt(actualQris) || 0,
                parseInt(actualEdc) || 0,
                notes || undefined
            )
        } catch (error) {
            logError('Error closing shift:', error)
        }
    }

    const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        setter(value)
    }

    const cashVariance = actualCash ? (parseInt(actualCash) || 0) - openingCash : 0

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="flex w-full max-w-[900px] max-h-[90vh] flex-col overflow-hidden rounded-xl bg-[var(--theme-bg-primary)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] text-white">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-display italic font-bold text-[var(--color-gold)]">B</span>
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">Shift Summary</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[var(--theme-text-muted)]">
                        <div className="text-right">
                            <div className="font-bold text-white">{dateStr}</div>
                            <div>{timeStr}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-white">Manager</div>
                            <div>{formatDuration(sessionStats.duration)} on duty</div>
                        </div>
                    </div>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer transition-colors"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Left Column: Sales Summary */}
                        <div className="p-8 border-r border-white/5">
                            {/* Net Sales */}
                            <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase mb-4">Net Sales by Category</h3>
                            <div className="divide-y divide-white/5">
                                <div className="flex justify-between py-3">
                                    <span className="text-sm text-[var(--theme-text-secondary)]">Total Sales</span>
                                    <span className="text-sm font-semibold">{formatPrice(sessionStats.totalSales)}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-sm text-[var(--theme-text-secondary)]">Transactions</span>
                                    <span className="text-sm font-semibold">{sessionStats.transactionCount}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-sm text-[var(--theme-text-secondary)]">Opening Cash</span>
                                    <span className="text-sm font-semibold">{formatPrice(openingCash)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between py-4 mt-2 border-t border-white/10">
                                <span className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">Total Net Sales</span>
                                <span className="text-lg font-bold">{formatPrice(sessionStats.totalSales)}</span>
                            </div>

                            {/* Payments Received */}
                            <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase mb-4 mt-6">Payments Received</h3>
                            <div className="divide-y divide-white/5">
                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2">
                                        <Banknote size={16} className="text-[var(--theme-text-muted)]" />
                                        <span className="text-sm text-[var(--theme-text-secondary)]">Cash Payments</span>
                                    </div>
                                    <span className="text-sm font-semibold">{formatPrice(0)}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2">
                                        <QrCode size={16} className="text-[var(--theme-text-muted)]" />
                                        <span className="text-sm text-[var(--theme-text-secondary)]">QRIS</span>
                                    </div>
                                    <span className="text-sm font-semibold">{formatPrice(0)}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={16} className="text-[var(--theme-text-muted)]" />
                                        <span className="text-sm text-[var(--theme-text-secondary)]">Card/EDC</span>
                                    </div>
                                    <span className="text-sm font-semibold">{formatPrice(0)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between py-4 mt-2 border-t border-white/10">
                                <span className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">Total Payments</span>
                                <span className="text-2xl font-bold text-[var(--color-gold)]">{formatPrice(sessionStats.totalSales)}</span>
                            </div>

                            {/* Tax & Tips cards */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-1">Total Tax</span>
                                    <span className="text-lg font-bold">{formatPrice(Math.round(sessionStats.totalSales * 10 / 110))}</span>
                                </div>
                                <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-1">Duration</span>
                                    <span className="text-lg font-bold">{formatDuration(sessionStats.duration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Cash Reconciliation */}
                        <div className="p-8">
                            <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase mb-6 text-center">Cash Reconciliation</h3>

                            {/* Expected Cash */}
                            <div className="mb-6">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-2">Expected Cash in Drawer</span>
                                <div className="bg-[var(--theme-bg-secondary)] border border-white/5 rounded-xl py-5 px-6 text-2xl font-semibold text-center">
                                    {formatPrice(openingCash)}
                                </div>
                                <span className="text-[10px] text-[var(--theme-text-muted)] mt-1 block text-center">
                                    Opening float ({formatPrice(openingCash)})
                                </span>
                            </div>

                            {/* Actual Cash Input */}
                            <div className="mb-6">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-2">Actual Cash in Drawer</span>
                                <div className="relative flex items-center">
                                    <span className="absolute left-6 text-lg font-semibold text-[var(--theme-text-muted)]">Rp</span>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-[var(--color-gold)]/30 rounded-xl py-6 pl-14 pr-6 text-2xl font-semibold text-white text-center transition-all duration-150 focus:border-[var(--color-gold)] focus:outline-none placeholder:text-[var(--theme-text-muted)]"
                                        value={actualCash}
                                        onChange={handleInputChange(setActualCash)}
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* QRIS Input */}
                            <div className="mb-6">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-2">Total QRIS</span>
                                <div className="relative flex items-center">
                                    <span className="absolute left-6 text-lg font-semibold text-[var(--theme-text-muted)]">Rp</span>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-14 pr-6 text-lg font-semibold text-white text-center transition-all duration-150 focus:border-[var(--color-gold)] focus:outline-none placeholder:text-[var(--theme-text-muted)]"
                                        value={actualQris}
                                        onChange={handleInputChange(setActualQris)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* EDC Input */}
                            <div className="mb-6">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-2">Total EDC/Card</span>
                                <div className="relative flex items-center">
                                    <span className="absolute left-6 text-lg font-semibold text-[var(--theme-text-muted)]">Rp</span>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-14 pr-6 text-lg font-semibold text-white text-center transition-all duration-150 focus:border-[var(--color-gold)] focus:outline-none placeholder:text-[var(--theme-text-muted)]"
                                        value={actualEdc}
                                        onChange={handleInputChange(setActualEdc)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Variance */}
                            <div className="flex justify-between items-baseline mb-6">
                                <span className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">Variance</span>
                                <span className={`text-2xl font-bold ${cashVariance === 0 ? 'text-white' : cashVariance > 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                                    {formatPrice(cashVariance)}
                                </span>
                            </div>

                            {/* Anti-fraud notice */}
                            <div className="flex items-center gap-2 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] p-3 text-xs text-[var(--color-warning-text)] mb-6">
                                <AlertTriangle size={14} className="shrink-0" />
                                <span>Expected amounts will be revealed after closing</span>
                            </div>

                            {/* Notes */}
                            <div className="mb-6">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-2">Closing Notes</span>
                                <textarea
                                    className="w-full resize-none rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-white transition-all duration-150 focus:border-[var(--color-gold)] focus:outline-none placeholder:text-[var(--theme-text-muted)]"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Observations, anomalies..."
                                    rows={2}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    className="w-full border border-white/10 rounded-xl py-5 bg-transparent text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--theme-text-secondary)] cursor-pointer transition-all hover:border-white/20 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    <Printer size={14} />
                                    Print Summary
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-[var(--color-gold)] rounded-xl text-black py-6 text-[13px] font-bold tracking-[0.25em] uppercase shadow-xl shadow-[var(--color-gold)]/10 cursor-pointer transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                    ) : (
                                        <>
                                            <Lock size={16} />
                                            Finalize & Close Shift
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-[var(--theme-text-muted)] text-center">
                                    Shift closure cannot be undone once submitted.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
