import { useState } from 'react'
import { X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '../../../utils/helpers'
import { usePOSConfigSettings } from '@/hooks/settings/useModuleConfigSettings'
import { logError } from '@/utils/logger'

interface OpenShiftModalProps {
    onOpen: (openingCash: number, terminalId?: string, notes?: string) => Promise<void>
    onClose: () => void
    isLoading: boolean
}

export default function OpenShiftModal({ onOpen, onClose, isLoading }: OpenShiftModalProps) {
    const posConfig = usePOSConfigSettings()
    const [openingCash, setOpeningCash] = useState<number>(0)
    const [notes, setNotes] = useState('')
    const [inputValue, setInputValue] = useState('')

    const handleQuickAmount = (amount: number) => {
        setOpeningCash(amount)
        setInputValue(amount.toString())
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        setInputValue(value)
        setOpeningCash(parseInt(value) || 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await onOpen(openingCash, undefined, notes || undefined)
        } catch (error) {
            logError('Error opening shift:', error)
        }
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="flex w-full max-w-[480px] max-h-[90vh] flex-col overflow-hidden rounded-xl bg-[var(--theme-bg-primary)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] text-white max-[480px]:max-h-screen max-[480px]:rounded-none">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-display italic font-bold text-[var(--color-gold)]">B</span>
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">Open Shift</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[var(--theme-text-muted)]">
                        <div className="text-right">
                            <div className="font-bold text-white">{dateStr}</div>
                            <div>{timeStr}</div>
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

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
                    {/* Opening Cash Input */}
                    <div className="mb-6">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-2">
                            Opening Cash
                        </span>
                        <div className="relative flex items-center">
                            <span className="absolute left-6 text-lg font-semibold text-[var(--theme-text-muted)]">Rp</span>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-[var(--color-gold)]/30 rounded-xl py-6 pl-14 pr-6 text-2xl font-semibold text-white text-center transition-all duration-150 focus:border-[var(--color-gold)] focus:outline-none placeholder:text-[var(--theme-text-muted)]"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="mt-3 text-center text-2xl font-bold text-[var(--color-gold)]">
                            {formatPrice(openingCash)}
                        </div>
                    </div>

                    {/* Quick Amounts */}
                    <div className="mb-6">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-3">
                            Quick amounts
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {posConfig.shiftOpeningCashPresets.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={cn(
                                        'cursor-pointer rounded-xl border border-white/10 bg-[var(--theme-bg-tertiary)] px-2 py-2.5 text-xs font-semibold text-[var(--theme-text-secondary)] transition-all duration-150 hover:border-white/20 hover:bg-[var(--theme-bg-secondary)]',
                                        openingCash === amount && 'border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                                    )}
                                    onClick={() => handleQuickAmount(amount)}
                                >
                                    {formatPrice(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-2">
                            Notes (optional)
                        </span>
                        <textarea
                            className="w-full resize-none rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-white transition-all duration-150 focus:border-[var(--color-gold)] focus:outline-none placeholder:text-[var(--theme-text-muted)]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes..."
                            rows={2}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 border-t border-white/5 pt-6">
                        <button
                            type="button"
                            className="w-full border border-white/10 rounded-xl py-5 bg-transparent text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--theme-text-secondary)] cursor-pointer transition-all hover:border-white/20 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
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
                                    <Clock size={16} />
                                    Open Shift
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
