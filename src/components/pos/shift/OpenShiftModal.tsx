import { useState } from 'react'
import { X, Banknote, Clock } from 'lucide-react'
import { formatPrice } from '../../../utils/helpers'
import './ShiftModals.css'

interface OpenShiftModalProps {
    onOpen: (openingCash: number, terminalId?: string, notes?: string) => Promise<void>
    onClose: () => void
    isLoading: boolean
}

const QUICK_AMOUNTS = [100000, 200000, 300000, 500000, 1000000]

export default function OpenShiftModal({ onOpen, onClose, isLoading }: OpenShiftModalProps) {
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
        <div className="shift-modal-overlay">
            <div className="shift-modal">
                <div className="shift-modal__header">
                    <div className="shift-modal__header-icon shift-modal__header-icon--open">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h2 className="shift-modal__title">Open a Shift</h2>
                        <p className="shift-modal__subtitle">Enter the initial cash amount in drawer</p>
                    </div>
                    <button className="shift-modal__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="shift-modal__content">
                    <div className="shift-form__group">
                        <label className="shift-form__label">
                            <Banknote size={18} />
                            Opening Cash
                        </label>
                        <div className="shift-form__input-wrapper">
                            <span className="shift-form__currency">Rp</span>
                            <input
                                type="text"
                                className="shift-form__input shift-form__input--large"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="shift-form__display">
                            {formatPrice(openingCash)}
                        </div>
                    </div>

                    <div className="shift-form__quick-amounts">
                        <p className="shift-form__quick-label">Quick amounts</p>
                        <div className="shift-form__quick-grid">
                            {QUICK_AMOUNTS.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={`shift-form__quick-btn ${openingCash === amount ? 'is-active' : ''}`}
                                    onClick={() => handleQuickAmount(amount)}
                                >
                                    {formatPrice(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="shift-form__group">
                        <label className="shift-form__label">
                            Notes (optional)
                        </label>
                        <textarea
                            className="shift-form__textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes..."
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
                            className="shift-btn shift-btn--primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="shift-btn__loading" />
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
