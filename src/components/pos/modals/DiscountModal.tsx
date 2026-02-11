import { useState } from 'react'
import { X, Percent, DollarSign, Tag } from 'lucide-react'
import { formatPrice } from '../../../utils/helpers'
import PinVerificationModal from './PinVerificationModal'
import { usePOSConfigSettings } from '@/hooks/settings/useModuleConfigSettings'
import './DiscountModal.css'

interface DiscountModalProps {
    itemName?: string
    itemPrice?: number
    totalPrice: number
    onApplyDiscount: (discountAmount: number, discountType: 'percentage' | 'fixed', discountValue: number) => void
    onClose: () => void
}

export default function DiscountModal({
    itemName,
    // itemPrice is kept for potential future per-item discount features
    totalPrice,
    onApplyDiscount,
    onClose
}: DiscountModalProps) {
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
    const [discountValue, setDiscountValue] = useState<string>('')
    const [showPinModal, setShowPinModal] = useState(false)
    const [pendingDiscount, setPendingDiscount] = useState<{ amount: number; type: 'percentage' | 'fixed'; value: number } | null>(null)

    const posConfig = usePOSConfigSettings()
    const isItemDiscount = !!itemName

    // Calculate discount amount
    const calculateDiscountAmount = (): number => {
        const value = parseFloat(discountValue)
        if (isNaN(value) || value <= 0) return 0

        if (discountType === 'percentage') {
            const percentage = Math.min(value, posConfig.maxDiscountPercentage)
            return (totalPrice * percentage) / 100
        } else {
            // Fixed amount (IDR)
            return Math.min(value, totalPrice) // Cannot exceed total
        }
    }

    const discountAmount = calculateDiscountAmount()
    const finalPrice = totalPrice - discountAmount

    const handleQuickPercentage = (percentage: number) => {
        setDiscountType('percentage')
        setDiscountValue(percentage.toString())
    }

    const handleApply = () => {
        if (discountAmount > 0) {
            // Show PIN modal for verification
            setPendingDiscount({
                amount: discountAmount,
                type: discountType,
                value: parseFloat(discountValue)
            })
            setShowPinModal(true)
        }
    }

    const handlePinVerify = (verified: boolean) => {
        if (verified && pendingDiscount) {
            onApplyDiscount(pendingDiscount.amount, pendingDiscount.type, pendingDiscount.value)
            onClose()
        }
        setShowPinModal(false)
        setPendingDiscount(null)
    }

    return (
        <>
            <div className="modal-backdrop is-active" onClick={onClose}>
                <div className="modal modal-md is-active" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="modal__header">
                        <div>
                            <h2 className="modal__title">
                                <Tag size={24} />
                                {isItemDiscount ? 'Item Discount' : 'Order Discount'}
                            </h2>
                            <p className="modal__subtitle">
                                {isItemDiscount ? itemName : 'Apply discount to total'}
                            </p>
                        </div>
                        <button className="modal__close" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal__body discount-modal__body">
                        {/* Discount Type Selector */}
                        <div className="discount-type-selector">
                            <button
                                className={`discount-type-btn ${discountType === 'percentage' ? 'is-active' : ''}`}
                                onClick={() => setDiscountType('percentage')}
                            >
                                <Percent size={20} />
                                Percentage
                            </button>
                            <button
                                className={`discount-type-btn ${discountType === 'fixed' ? 'is-active' : ''}`}
                                onClick={() => setDiscountType('fixed')}
                            >
                                <DollarSign size={20} />
                                Fixed Amount (IDR)
                            </button>
                        </div>

                        {/* Quick Percentage Buttons */}
                        {discountType === 'percentage' && (
                            <div className="quick-percentages">
                                {posConfig.quickDiscountPercentages.map(pct => (
                                    <button
                                        key={pct}
                                        className="quick-percentage-btn"
                                        onClick={() => handleQuickPercentage(pct)}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Discount Input */}
                        <div className="discount-input-group">
                            <label className="discount-input-label">
                                {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (IDR)'}
                            </label>
                            <input
                                type="number"
                                className="discount-input"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder={discountType === 'percentage' ? '0' : '0'}
                                min="0"
                                max={discountType === 'percentage' ? posConfig.maxDiscountPercentage.toString() : totalPrice.toString()}
                                autoFocus
                            />
                        </div>

                        {/* Price Summary */}
                        <div className="discount-summary">
                            <div className="discount-summary-row">
                                <span className="discount-summary-label">
                                    {isItemDiscount ? 'Item Price' : 'Order Total'}
                                </span>
                                <span className="discount-summary-value">{formatPrice(totalPrice)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <>
                                    <div className="discount-summary-row discount-row">
                                        <span className="discount-summary-label">
                                            Discount ({discountType === 'percentage' ? `${discountValue}%` : 'fixed'})
                                        </span>
                                        <span className="discount-summary-value text-danger">
                                            -{formatPrice(discountAmount)}
                                        </span>
                                    </div>
                                    <div className="discount-summary-row final-price-row">
                                        <span className="discount-summary-label">Final Price</span>
                                        <span className="discount-summary-value final-price">
                                            {formatPrice(finalPrice)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="discount-warning">
                            <Tag size={16} />
                            PIN verification required to apply discount
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal__footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary-lg"
                            onClick={handleApply}
                            disabled={discountAmount === 0}
                        >
                            <Tag size={18} />
                            Apply Discount
                        </button>
                    </div>
                </div>
            </div>

            {/* PIN Verification Modal */}
            {showPinModal && (
                <PinVerificationModal
                    title="Verification Required"
                    message="Enter your PIN to apply this discount"
                    allowedRoles={posConfig.voidRequiredRoles}
                    onVerify={handlePinVerify}
                    onClose={() => {
                        setShowPinModal(false)
                        setPendingDiscount(null)
                    }}
                />
            )}
        </>
    )
}
