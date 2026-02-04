import { useState, useEffect, useRef } from 'react'
import { X, Check, CreditCard, Banknote, QrCode, Printer, RotateCcw, WifiOff, Clock } from 'lucide-react'
import { useCartStore } from '../../../stores/cartStore'
import { formatPrice } from '../../../utils/helpers'
import { useOfflinePayment } from '../../../hooks/offline/useOfflinePayment'
import { useNetworkStore } from '../../../stores/networkStore'
import toast from 'react-hot-toast'
import './PaymentModal.css'

interface PaymentModalProps {
    onClose: () => void
}

type PaymentMethod = 'cash' | 'card' | 'qris'

const QUICK_AMOUNTS = [100000, 150000, 200000, 250000, 500000]

export default function PaymentModal({ onClose }: PaymentModalProps) {
    const { total } = useCartStore()
    const isOnline = useNetworkStore((state) => state.isOnline)

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
    const [amountReceived, setAmountReceived] = useState<number>(0)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successChange, setSuccessChange] = useState<number>(0)

    // Use the new offline payment hook (Story 3.4)
    const { processPayment, isProcessing, error, clearError } = useOfflinePayment()

    // Track if error toast was shown to prevent duplicates
    const errorShownRef = useRef(false)

    // Show error toast when error changes
    useEffect(() => {
        if (error && !errorShownRef.current) {
            toast.error(`Payment error: ${error}`)
            errorShownRef.current = true
        } else if (!error) {
            errorShownRef.current = false
        }
    }, [error])

    // Clear error on unmount
    useEffect(() => {
        return () => {
            clearError()
        }
    }, [clearError])

    const totalRounded = Math.round(total)
    const change = amountReceived - totalRounded

    // Improved validation: ensure we compare with a small epsilon if needed,
    // although amounts are usually integers in IDR, it's good practice.
    const canComplete = paymentMethod !== 'cash' || (amountReceived >= totalRounded - 0.01)

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

    // Handle payment completion using offline-capable hook
    const handleConfirmPayment = async () => {
        if (!canComplete || isProcessing) return

        try {
            const result = await processPayment({
                method: paymentMethod,
                amount: totalRounded,
                cashReceived: paymentMethod === 'cash' ? amountReceived : undefined,
            })

            if (result) {
                setSuccessChange(result.change)
                setShowSuccess(true)

                // Show appropriate toast based on online/offline status
                if (!isOnline && paymentMethod !== 'cash') {
                    toast.success('Payment saved offline')
                }
            }
        } catch (err: unknown) {
            // Error is already handled by the hook and useEffect above
            console.error('Payment error:', err)
        }
    }

    // Handle new order
    const handleNewOrder = () => {
        // Cart is already cleared by processPayment
        onClose()
        toast.success('Ready for new order')
    }

    // Success screen
    if (showSuccess) {
        return (
            <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && handleNewOrder()}>
                <div className="modal modal-sm is-active success-modal">
                    <div className="modal__body success-content">
                        <div className="success-icon">
                            <Check size={64} className="text-success" />
                        </div>
                        <h2>Payment successful!</h2>
                        <p className="success-subtitle">Order completed</p>

                        {paymentMethod === 'cash' && successChange > 0 && (
                            <div className="success-change">
                                <span className="success-change__label">Change given</span>
                                <span className="success-change__value">{formatPrice(successChange)}</span>
                            </div>
                        )}

                        {/* Show pending validation notice for card/QRIS offline */}
                        {!isOnline && paymentMethod !== 'cash' && (
                            <div className="success-offline-notice" style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#92400e'
                            }}>
                                <Clock size={20} />
                                <span>Will validate when online</span>
                            </div>
                        )}

                        <div className="success-actions">
                            <button className="btn btn-secondary" onClick={() => toast('Printing receipt...')}>
                                <Printer size={18} className="mr-2" />
                                Print
                            </button>
                            <button className="btn btn-primary" onClick={handleNewOrder}>
                                <RotateCcw size={18} className="mr-2" />
                                New Order
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
                            Checkout
                        </h3>
                        <p className="modal__subtitle">Ongoing order</p>
                    </div>
                    <button className="modal__close" onClick={onClose} aria-label="Close" title="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body payment-body">
                    {/* Top: Payment Methods */}
                    <div className="payment-methods-container">
                        <label className="section-label">
                            PAYMENT METHOD
                            {!isOnline && (
                                <span className="offline-badge" style={{ marginLeft: '8px', fontSize: '12px', color: '#f59e0b' }}>
                                    <WifiOff size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                    Offline Mode
                                </span>
                            )}
                        </label>
                        <div className="payment-methods">
                            {/* Cash - always available */}
                            <div className="payment-method">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="payCash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={() => setPaymentMethod('cash')}
                                />
                                <label htmlFor="payCash" className="payment-method__label">
                                    <Banknote size={24} className="payment-method__icon" />
                                    <span className="payment-method__name">Cash</span>
                                </label>
                            </div>

                            {/* Card - available offline with pending validation (Story 3.4) */}
                            <div className="payment-method">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="payCard"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                />
                                <label htmlFor="payCard" className="payment-method__label">
                                    <CreditCard size={24} className="payment-method__icon" />
                                    <span className="payment-method__name">Card</span>
                                    {!isOnline && (
                                        <span className="payment-method__offline" style={{ color: '#f59e0b', fontSize: '11px' }}>
                                            <Clock size={12} style={{ display: 'inline', marginRight: '2px' }} />
                                            Pending validation
                                        </span>
                                    )}
                                </label>
                            </div>

                            {/* QRIS - available offline with pending validation (Story 3.4) */}
                            <div className="payment-method">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="payQris"
                                    checked={paymentMethod === 'qris'}
                                    onChange={() => setPaymentMethod('qris')}
                                />
                                <label htmlFor="payQris" className="payment-method__label">
                                    <QrCode size={24} className="payment-method__icon" />
                                    <span className="payment-method__name">QRIS</span>
                                    {!isOnline && (
                                        <span className="payment-method__offline" style={{ color: '#f59e0b', fontSize: '11px' }}>
                                            <Clock size={12} style={{ display: 'inline', marginRight: '2px' }} />
                                            Pending validation
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={`payment-grid ${paymentMethod !== 'cash' ? 'payment-grid--single' : ''}`}>
                        {/* Left: Money Info & Quick Amounts */}
                        <div className="payment-left">
                            {/* Amount Display */}
                            <div className="payment-amount-display">
                                <p className="payment-amount-display__label">Amount to pay</p>
                                <p className="payment-amount-display__value">{formatPrice(total)}</p>
                            </div>

                            {/* Quick Amounts (Cash only) */}
                            {paymentMethod === 'cash' && (
                                <>
                                    <div className="quick-amounts-section">
                                        <p className="section-label">AMOUNT RECEIVED</p>
                                        <div className="quick-amounts">
                                            <button
                                                className="quick-amount-btn is-exact"
                                                onClick={() => handleQuickAmount('exact')}
                                            >
                                                Exact amount
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
                                    </div>

                                    {/* Change Display */}
                                    {amountReceived >= total && (
                                        <div className="payment-change">
                                            <span className="payment-change__label">Change given</span>
                                            <span className="payment-change__value">{formatPrice(change)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Right: Numpad */}
                        {paymentMethod === 'cash' && (
                            <div className="payment-right">
                                <div className="amount-input-container">
                                    <label className="section-label">Manual input</label>
                                    <div className="amount-input">
                                        <span className="currency-prefix">Rp</span>
                                        <input
                                            type="text"
                                            value={amountReceived.toLocaleString('id-ID')}
                                            readOnly
                                            aria-label="Amount received"
                                            title="Amount received"
                                        />
                                    </div>
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
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary-lg"
                        onClick={handleConfirmPayment}
                        disabled={!canComplete || isProcessing}
                    >
                        {isProcessing ? (
                            'Processing...'
                        ) : (
                            <>
                                <Check size={20} />
                                Complete Payment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
