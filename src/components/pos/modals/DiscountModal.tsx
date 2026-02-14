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
            <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-[var(--theme-bg-primary)] rounded-xl text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 m-0">
                                <Tag size={24} className="text-[var(--color-gold)]" />
                                {isItemDiscount ? 'Item Discount' : 'Order Discount'}
                            </h2>
                            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">
                                {isItemDiscount ? itemName : 'Apply discount to total'}
                            </p>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Discount Type Selector */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {(['percentage', 'fixed'] as const).map(type => (
                                <button
                                    key={type}
                                    className={cn(
                                        'p-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 border-2',
                                        discountType === type
                                            ? 'bg-[var(--color-gold)]/15 border-[var(--color-gold)] text-[var(--color-gold)]'
                                            : 'bg-[var(--theme-bg-secondary)] border-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] hover:text-white'
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
                                        className="p-3 bg-[var(--theme-bg-secondary)] border border-white/10 rounded text-sm font-semibold text-[var(--theme-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:border-[var(--color-gold)] hover:text-white"
                                        onClick={() => handleQuickPercentage(pct)}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Discount Input */}
                        <div className="mb-8">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] block mb-2">
                                {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (IDR)'}
                            </label>
                            <input
                                type="number"
                                className="w-full h-16 px-6 text-center text-3xl font-bold text-white bg-black/40 border border-white/10 rounded-xl transition-all duration-200 focus:outline-none focus:border-[var(--color-gold)]"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder="0"
                                min="0"
                                max={discountType === 'percentage' ? posConfig.maxDiscountPercentage.toString() : totalPrice.toString()}
                                autoFocus
                            />
                        </div>

                        {/* Price Summary */}
                        <div className="bg-[var(--theme-bg-secondary)] border border-white/5 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-3 text-sm">
                                <span className="text-[var(--theme-text-secondary)] font-medium">
                                    {isItemDiscount ? 'Item Price' : 'Order Total'}
                                </span>
                                <span className="font-semibold text-white">{formatPrice(totalPrice)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <>
                                    <div className="flex justify-between items-center mb-3 text-sm">
                                        <span className="text-[var(--color-danger-text)] font-medium">
                                            Discount ({discountType === 'percentage' ? `${discountValue}%` : 'fixed'})
                                        </span>
                                        <span className="text-[var(--color-danger-text)] font-bold">
                                            -{formatPrice(discountAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-dashed border-white/10">
                                        <span className="text-lg font-bold text-white">Final Price</span>
                                        <span className="text-2xl font-extrabold text-[var(--color-success-text)]">
                                            {formatPrice(finalPrice)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400 font-medium">
                            <Tag size={16} />
                            PIN verification required to apply discount
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
                        <button className="px-6 py-3 border border-white/10 rounded-xl bg-transparent text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-white cursor-pointer" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="px-6 py-3 bg-[var(--color-gold)] rounded-xl text-black text-sm font-bold cursor-pointer hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
