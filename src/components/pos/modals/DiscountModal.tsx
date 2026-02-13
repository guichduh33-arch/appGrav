import { useState } from 'react'
import { X, Percent, DollarSign, Tag } from 'lucide-react'
import { formatPrice } from '../../../utils/helpers'
import PinVerificationModal from './PinVerificationModal'
import { usePOSConfigSettings } from '@/hooks/settings/useModuleConfigSettings'
import { cn } from '@/lib/utils'

interface DiscountModalProps {
    itemName?: string
    itemPrice?: number
    totalPrice: number
    onApplyDiscount: (discountAmount: number, discountType: 'percentage' | 'fixed', discountValue: number) => void
    onClose: () => void
}

export default function DiscountModal({
    itemName,
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

    const calculateDiscountAmount = (): number => {
        const value = parseFloat(discountValue)
        if (isNaN(value) || value <= 0) return 0

        if (discountType === 'percentage') {
            const percentage = Math.min(value, posConfig.maxDiscountPercentage)
            return (totalPrice * percentage) / 100
        } else {
            return Math.min(value, totalPrice)
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

                    <div className="modal__body p-6">
                        {/* Discount Type Selector */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {(['percentage', 'fixed'] as const).map(type => (
                                <button
                                    key={type}
                                    className={cn(
                                        'p-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 border-2',
                                        discountType === type
                                            ? 'bg-gold/15 border-gold text-gold'
                                            : 'bg-[var(--color-gray-800)] border-transparent text-[var(--color-gray-300)] hover:bg-[var(--color-gray-700)] hover:text-white'
                                    )}
                                    onClick={() => setDiscountType(type)}
                                >
                                    {type === 'percentage' ? <><Percent size={20} /> Percentage</> : <><DollarSign size={20} /> Fixed Amount (IDR)</>}
                                </button>
                            ))}
                        </div>

                        {/* Quick Percentage Buttons */}
                        {discountType === 'percentage' && (
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                {posConfig.quickDiscountPercentages.map(pct => (
                                    <button
                                        key={pct}
                                        className="p-3 bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded text-sm font-semibold text-[var(--color-gray-300)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:border-gold hover:text-white"
                                        onClick={() => handleQuickPercentage(pct)}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Discount Input */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (IDR)'}
                            </label>
                            <input
                                type="number"
                                className="w-full h-16 px-6 text-center text-3xl font-bold text-white bg-[var(--color-gray-900)] border-2 border-[var(--color-gray-700)] rounded-lg transition-all duration-200 focus:outline-none focus:border-gold focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder="0"
                                min="0"
                                max={discountType === 'percentage' ? posConfig.maxDiscountPercentage.toString() : totalPrice.toString()}
                                autoFocus
                            />
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gray-800 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-3 text-sm">
                                <span className="text-gray-400 font-medium">
                                    {isItemDiscount ? 'Item Price' : 'Order Total'}
                                </span>
                                <span className="font-semibold text-white">{formatPrice(totalPrice)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <>
                                    <div className="flex justify-between items-center mb-3 text-sm">
                                        <span className="text-destructive font-medium">
                                            Discount ({discountType === 'percentage' ? `${discountValue}%` : 'fixed'})
                                        </span>
                                        <span className="text-destructive font-bold">
                                            -{formatPrice(discountAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-dashed border-gray-700">
                                        <span className="text-lg font-bold text-white">Final Price</span>
                                        <span className="text-2xl font-extrabold text-success">
                                            {formatPrice(finalPrice)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-warning font-medium">
                            <Tag size={16} />
                            PIN verification required to apply discount
                        </div>
                    </div>

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
