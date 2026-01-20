import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
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
                        <h2 className="shift-modal__title">{t('shift.open_title', 'Ouvrir un Shift')}</h2>
                        <p className="shift-modal__subtitle">{t('shift.open_subtitle', 'Saisissez le montant cash initial en caisse')}</p>
                    </div>
                    <button className="shift-modal__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="shift-modal__content">
                    <div className="shift-form__group">
                        <label className="shift-form__label">
                            <Banknote size={18} />
                            {t('shift.opening_cash', 'Montant Cash Initial')}
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
                        <p className="shift-form__quick-label">{t('shift.quick_amounts', 'Montants rapides')}</p>
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
                            {t('shift.notes', 'Notes (optionnel)')}
                        </label>
                        <textarea
                            className="shift-form__textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('shift.notes_placeholder', 'Ajouter des notes...')}
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
                            {t('common.cancel', 'Annuler')}
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
                                    {t('shift.open_button', 'Ouvrir le Shift')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
