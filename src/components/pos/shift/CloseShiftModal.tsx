import { useState } from 'react'
import { X, Banknote, QrCode, CreditCard, Clock, AlertTriangle, Lock } from 'lucide-react'
import { formatPrice } from '../../../utils/helpers'

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
            console.error('Error closing shift:', error)
        }
    }

    const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        setter(value)
    }

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-[560px] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-[480px]:max-h-screen max-[480px]:rounded-none">
                <div className="flex items-start gap-4 border-b border-slate-200 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="m-0 text-xl font-bold text-slate-900">Close Shift</h2>
                        <p className="mt-1 text-sm text-slate-500">Count and enter the actual amounts</p>
                    </div>
                    <button
                        className="ml-auto cursor-pointer rounded-lg border-none bg-transparent p-2 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-500"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* Session Summary */}
                    <div className="mb-5 rounded-xl bg-slate-50 p-4">
                        <h3 className="m-0 mb-3 text-sm font-bold text-slate-700">Shift Summary</h3>
                        <div className="grid grid-cols-3 gap-3 max-[480px]:grid-cols-1">
                            <div className="flex flex-col gap-1">
                                <Clock size={16} className="text-slate-500" />
                                <span className="text-xs text-slate-500">Duration</span>
                                <span className="text-sm font-bold text-slate-900">{formatDuration(sessionStats.duration)}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500">Transactions</span>
                                <span className="text-sm font-bold text-slate-900">{sessionStats.transactionCount}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Banknote size={16} className="text-slate-500" />
                                <span className="text-xs text-slate-500">Opening cash</span>
                                <span className="text-sm font-bold text-slate-900">{formatPrice(openingCash)}</span>
                            </div>
                        </div>

                        {/* Anti-fraud notice */}
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100 p-3 text-xs text-amber-800">
                            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                            <span>Expected amounts will be revealed after closing</span>
                        </div>
                    </div>

                    {/* Actual Amounts Section */}
                    <div className="mb-5">
                        <h3 className="m-0 mb-3 text-sm font-bold text-slate-700">Counted Amounts</h3>

                        <div className="flex flex-col gap-4">
                            {/* Cash */}
                            <div className="rounded-xl bg-slate-50 p-4">
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Banknote size={18} className="rounded-md bg-emerald-100 p-0.5 text-emerald-700" />
                                    Cash in drawer
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 font-semibold text-slate-500">Rp</span>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-2 border-slate-200 py-3 pl-10 pr-4 text-base font-semibold text-slate-900 transition-all duration-150 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none"
                                        value={actualCash}
                                        onChange={handleInputChange(setActualCash)}
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                {actualCash && (
                                    <span className="mt-1 block text-right text-sm font-semibold text-slate-500">{formatPrice(parseInt(actualCash) || 0)}</span>
                                )}
                            </div>

                            {/* QRIS */}
                            <div className="rounded-xl bg-slate-50 p-4">
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <QrCode size={18} className="rounded-md bg-blue-100 p-0.5 text-blue-600" />
                                    Total QRIS
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 font-semibold text-slate-500">Rp</span>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-2 border-slate-200 py-3 pl-10 pr-4 text-base font-semibold text-slate-900 transition-all duration-150 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none"
                                        value={actualQris}
                                        onChange={handleInputChange(setActualQris)}
                                        placeholder="0"
                                    />
                                </div>
                                {actualQris && (
                                    <span className="mt-1 block text-right text-sm font-semibold text-slate-500">{formatPrice(parseInt(actualQris) || 0)}</span>
                                )}
                            </div>

                            {/* EDC */}
                            <div className="rounded-xl bg-slate-50 p-4">
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CreditCard size={18} className="rounded-md bg-purple-100 p-0.5 text-violet-600" />
                                    Total EDC/Card
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 font-semibold text-slate-500">Rp</span>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-2 border-slate-200 py-3 pl-10 pr-4 text-base font-semibold text-slate-900 transition-all duration-150 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none"
                                        value={actualEdc}
                                        onChange={handleInputChange(setActualEdc)}
                                        placeholder="0"
                                    />
                                </div>
                                {actualEdc && (
                                    <span className="mt-1 block text-right text-sm font-semibold text-slate-500">{formatPrice(parseInt(actualEdc) || 0)}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-5">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            Closing notes (optional)
                        </label>
                        <textarea
                            className="w-full resize-none rounded-xl border-2 border-slate-200 p-3 text-sm text-slate-900 transition-all duration-150 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observations, anomalies..."
                            rows={2}
                        />
                    </div>

                    <div className="mt-2 flex gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Close Shift
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
