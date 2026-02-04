import { useState } from 'react'
import { X, Banknote, QrCode, CreditCard, Clock, AlertTriangle, Lock } from 'lucide-react'
import { formatPrice } from '../../../utils/helpers'
import './ShiftModals.css'

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
        <div className="shift-modal-overlay">
            <div className="shift-modal shift-modal--close">
                <div className="shift-modal__header">
                    <div className="shift-modal__header-icon shift-modal__header-icon--close">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="shift-modal__title">Close Shift</h2>
                        <p className="shift-modal__subtitle">Count and enter the actual amounts</p>
                    </div>
                    <button className="shift-modal__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="shift-modal__content">
                    {/* Session Summary */}
                    <div className="shift-summary">
                        <h3 className="shift-summary__title">Shift Summary</h3>
                        <div className="shift-summary__grid">
                            <div className="shift-summary__item">
                                <Clock size={16} />
                                <span className="shift-summary__label">Duration</span>
                                <span className="shift-summary__value">{formatDuration(sessionStats.duration)}</span>
                            </div>
                            <div className="shift-summary__item">
                                <span className="shift-summary__label">Transactions</span>
                                <span className="shift-summary__value">{sessionStats.transactionCount}</span>
                            </div>
                            <div className="shift-summary__item">
                                <Banknote size={16} />
                                <span className="shift-summary__label">Opening cash</span>
                                <span className="shift-summary__value">{formatPrice(openingCash)}</span>
                            </div>
                        </div>

                        {/* Anti-fraud notice */}
                        <div className="shift-summary__notice">
                            <AlertTriangle size={16} />
                            <span>Expected amounts will be revealed after closing</span>
                        </div>
                    </div>

                    {/* Actual Amounts Section */}
                    <div className="shift-amounts">
                        <h3 className="shift-amounts__title">Counted Amounts</h3>

                        <div className="shift-amounts__grid">
                            {/* Cash */}
                            <div className="shift-amount-field">
                                <label className="shift-amount-field__label">
                                    <Banknote size={18} className="shift-amount-field__icon shift-amount-field__icon--cash" />
                                    Cash in drawer
                                </label>
                                <div className="shift-form__input-wrapper">
                                    <span className="shift-form__currency">Rp</span>
                                    <input
                                        type="text"
                                        className="shift-form__input"
                                        value={actualCash}
                                        onChange={handleInputChange(setActualCash)}
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                {actualCash && (
                                    <span className="shift-amount-field__preview">{formatPrice(parseInt(actualCash) || 0)}</span>
                                )}
                            </div>

                            {/* QRIS */}
                            <div className="shift-amount-field">
                                <label className="shift-amount-field__label">
                                    <QrCode size={18} className="shift-amount-field__icon shift-amount-field__icon--qris" />
                                    Total QRIS
                                </label>
                                <div className="shift-form__input-wrapper">
                                    <span className="shift-form__currency">Rp</span>
                                    <input
                                        type="text"
                                        className="shift-form__input"
                                        value={actualQris}
                                        onChange={handleInputChange(setActualQris)}
                                        placeholder="0"
                                    />
                                </div>
                                {actualQris && (
                                    <span className="shift-amount-field__preview">{formatPrice(parseInt(actualQris) || 0)}</span>
                                )}
                            </div>

                            {/* EDC */}
                            <div className="shift-amount-field">
                                <label className="shift-amount-field__label">
                                    <CreditCard size={18} className="shift-amount-field__icon shift-amount-field__icon--edc" />
                                    Total EDC/Card
                                </label>
                                <div className="shift-form__input-wrapper">
                                    <span className="shift-form__currency">Rp</span>
                                    <input
                                        type="text"
                                        className="shift-form__input"
                                        value={actualEdc}
                                        onChange={handleInputChange(setActualEdc)}
                                        placeholder="0"
                                    />
                                </div>
                                {actualEdc && (
                                    <span className="shift-amount-field__preview">{formatPrice(parseInt(actualEdc) || 0)}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="shift-form__group">
                        <label className="shift-form__label">
                            Closing notes (optional)
                        </label>
                        <textarea
                            className="shift-form__textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observations, anomalies..."
                            rows={2}
                        />
                    </div>

                    <div className="shift-modal__actions">
                        <button
                            type="button"
                            className="shift-btn shift-btn--secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="shift-btn shift-btn--danger"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="shift-btn__loading" />
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
