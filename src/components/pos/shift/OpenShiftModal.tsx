import { useState } from 'react'
import { X, Banknote, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '../../../utils/helpers'
import { usePOSConfigSettings } from '@/hooks/settings/useModuleConfigSettings'

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
            console.error('Error opening shift:', error)
        }
    }

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-[480px] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-[480px]:max-h-screen max-[480px]:rounded-none">
                <div className="flex items-start gap-4 border-b border-slate-200 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h2 className="m-0 text-xl font-bold text-slate-900">Open a Shift</h2>
                        <p className="mt-1 text-sm text-slate-500">Enter the initial cash amount in drawer</p>
                    </div>
                    <button
                        className="ml-auto cursor-pointer rounded-lg border-none bg-transparent p-2 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-500"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="mb-5">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Banknote size={18} />
                            Opening Cash
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 font-semibold text-slate-500">Rp</span>
                            <input
                                type="text"
                                className="w-full rounded-xl border-2 border-slate-200 py-4 pl-10 pr-4 text-2xl font-semibold text-slate-900 transition-all duration-150 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="mt-3 text-center text-[2rem] font-bold text-slate-900">
                            {formatPrice(openingCash)}
                        </div>
                    </div>

                    <div className="mb-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Quick amounts</p>
                        <div className="grid grid-cols-3 gap-2">
                            {posConfig.shiftOpeningCashPresets.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={cn(
                                        'cursor-pointer rounded-lg border-2 border-slate-200 bg-slate-50 px-2 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-150 hover:border-slate-300 hover:bg-slate-100',
                                        openingCash === amount && 'border-blue-500 bg-blue-50 text-blue-600'
                                    )}
                                    onClick={() => handleQuickAmount(amount)}
                                >
                                    {formatPrice(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            Notes (optional)
                        </label>
                        <textarea
                            className="w-full resize-none rounded-xl border-2 border-slate-200 p-3 text-sm text-slate-900 transition-all duration-150 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes..."
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
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    <Clock size={18} />
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
