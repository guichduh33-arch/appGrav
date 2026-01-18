import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Check, CreditCard } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { formatPrice } from '../../utils/helpers'
import { useOrders } from '../../hooks/useOrders'
import toast from 'react-hot-toast'
import './PaymentModal.css'

interface PaymentModalProps {
    onClose: () => void
}

type PaymentMethod = 'cash' | 'card' | 'qris'

const QUICK_AMOUNTS = [100000, 150000, 200000, 250000, 500000]

export default function PaymentModal({ onClose }: PaymentModalProps) {
    const { t } = useTranslation()
    const { total, clearCart } = useCartStore()

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
    const [amountReceived, setAmountReceived] = useState<number>(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const { createOrder, isCreating } = useOrders()

    const change = amountReceived - total
    const canComplete = paymentMethod !== 'cash' || amountReceived >= total

    // Handle numpad input
    const handleNumpadKey = (key: string) => {
        if (key === 'clear') {
            setAmountReceived(0)
        } else if (key === 'backspace') {
            setAmountReceived(prev => Math.floor(prev / 10))
        } else {
            const digit = parseInt(key, 10)
            setAmountReceived(prev => prev * 10 + digit)
        }
    }

    // Handle quick amount
    const handleQuickAmount = (amount: number | 'exact') => {
        if (amount === 'exact') {
            setAmountReceived(total)
        } else {
            setAmountReceived(amount)
        }
    }

    // Handle payment completion
    const handleConfirmPayment = async () => {
        if (!canComplete || isCreating) return

        setIsProcessing(true)

        try {
            await createOrder({
                method: paymentMethod,
                cashReceived: paymentMethod === 'cash' ? amountReceived : undefined,
                changeGiven: paymentMethod === 'cash' ? Math.max(0, change) : undefined
            })

            setShowSuccess(true)

        } catch (error) {
            console.error('Payment error:', error)
            toast.error(t('payment.toast_error'))
            setIsProcessing(false)
        }
    }

    // Handle new order
    const handleNewOrder = () => {
        clearCart()
        onClose()
        toast.success(t('payment.toast_new_ready'))
    }

    // Success screen
    if (showSuccess) {
        return (
            <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && handleNewOrder()}>
                <div className="modal modal-sm is-active success-modal">
                    <div className="modal__body success-content">
                        <div className="success-icon">✅</div>
                        <h2>{t('payment.success_title')}</h2>
                        <p className="success-subtitle">{t('payment.success_subtitle')}</p>

                        {paymentMethod === 'cash' && change > 0 && (
                            <div className="success-change">
                                <span className="success-change__label">{t('payment.change_given')}</span>
                                <span className="success-change__value">{formatPrice(change)}</span>
                            </div>
                        )}

                        <div className="success-actions">
                            <button className="btn btn-secondary" onClick={() => toast(t('payment.print_toast'))}>
                                🖨️ {t('payment.print')}
                            </button>
                            <button className="btn btn-primary" onClick={handleNewOrder}>
                                {t('payment.new_order')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg is-active">
                <div className="modal__header">
                    <div>
                        <h3 className="modal__title">
                            <CreditCard size={24} />
                            {t('payment.title')}
                        </h3>
                        <p className="modal__subtitle">{t('payment.subtitle')}</p>
                    </div>
                    <button className="modal__close" onClick={onClose} aria-label={t('common.close')} title={t('common.close')}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body payment-body">
                    <div className={`payment-grid ${paymentMethod === 'cash' ? 'has-numpad' : 'full-width'}`}>
                        {/* Left: Amount & Methods */}
                        <div className="payment-left">
                            {/* Amount Display */}
                            <div className="payment-amount-display">
                                <p className="payment-amount-display__label">{t('payment.amount_to_pay')}</p>
                                <p className="payment-amount-display__value">{formatPrice(total)}</p>
                            </div>

                            {/* Payment Methods */}
                            <h4 className="payment-section-title">{t('payment.method_title')}</h4>
                            <div className="payment-methods">
                                <div className="payment-method">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        id="payCash"
                                        checked={paymentMethod === 'cash'}
                                        onChange={() => setPaymentMethod('cash')}
                                    />
                                    <label htmlFor="payCash" className="payment-method__label">
                                        <span className="payment-method__icon">💵</span>
                                        <span className="payment-method__name">{t('payment.cash')}</span>
                                    </label>
                                </div>
                                <div className="payment-method">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        id="payCard"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                    />
                                    <label htmlFor="payCard" className="payment-method__label">
                                        <span className="payment-method__icon">💳</span>
                                        <span className="payment-method__name">{t('payment.card')}</span>
                                    </label>
                                </div>
                                <div className="payment-method">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        id="payQris"
                                        checked={paymentMethod === 'qris'}
                                        onChange={() => setPaymentMethod('qris')}
                                    />
                                    <label htmlFor="payQris" className="payment-method__label">
                                        <span className="payment-method__icon">📱</span>
                                        <span className="payment-method__name">{t('payment.qris')}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Quick Amounts (Cash only) */}
                            {paymentMethod === 'cash' && (
                                <>
                                    <h4 className="payment-section-title">{t('payment.amount_received')}</h4>
                                    <div className="quick-amounts">
                                        <button
                                            className="quick-amount-btn is-exact"
                                            onClick={() => handleQuickAmount('exact')}
                                        >
                                            {t('payment.exact_amount')}
                                        </button>
                                        {QUICK_AMOUNTS.map(amount => (
                                            <button
                                                key={amount}
                                                className="quick-amount-btn"
                                                onClick={() => handleQuickAmount(amount)}
                                            >
                                                {formatPrice(amount)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Change Display */}
                                    {amountReceived >= total && (
                                        <div className="payment-change">
                                            <span className="payment-change__label">{t('payment.change_given')}</span>
                                            <span className="payment-change__value">{formatPrice(change)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Right: Numpad */}
                        {paymentMethod === 'cash' && (
                            <div className="payment-right">
                                <h4 className="payment-section-title">{t('payment.manual_input')}</h4>
                                <div className="amount-input">
                                    <input
                                        type="text"
                                        value={formatPrice(amountReceived)}
                                        readOnly
                                        aria-label={t('payment.amount_received')}
                                        title={t('payment.amount_received')}
                                    />
                                </div>
                                <div className="numpad">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map(key => (
                                        <button
                                            key={key}
                                            className={`numpad__key ${key === 'clear' ? 'clear' : ''} ${key === 'backspace' ? 'backspace' : ''}`}
                                            onClick={() => handleNumpadKey(key)}
                                        >
                                            {key === 'clear' ? 'C' : key === 'backspace' ? '⌫' : key}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal__footer payment-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        {t('payment.cancel')}
                    </button>
                    <button
                        className="btn btn-primary-lg"
                        onClick={handleConfirmPayment}
                        disabled={!canComplete || isProcessing || isCreating}
                    >
                        {isProcessing || isCreating ? (
                            t('payment.processing')
                        ) : (
                            <>
                                <Check size={20} />
                                {t('payment.complete')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
