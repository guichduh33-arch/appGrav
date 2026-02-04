import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useStockAdjustment, useSuppliers } from '@/hooks/inventory'
import './StockAdjustmentModal.css'

// Local interface to avoid type import issues
interface IProduct {
    id: string
    name: string
    current_stock: number
    unit: string | null
}

interface StockAdjustmentModalProps {
    product: IProduct
    onClose: () => void
}

type AdjustmentType = 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out'

export default function StockAdjustmentModal({ product, onClose }: StockAdjustmentModalProps) {
    const { mutate: adjustStock, isPending } = useStockAdjustment()
    const { data: suppliers } = useSuppliers()

    const [type, setType] = useState<AdjustmentType>('purchase')
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')
    const [notes, setNotes] = useState('')
    const [supplierId, setSupplierId] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        adjustStock({
            productId: product.id,
            type,
            quantity: Number(quantity),
            reason,
            notes,
            supplierId: supplierId || undefined
        }, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const isPositiveAdjustment = type === 'purchase' || type === 'adjustment_in'

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md is-active">
                <div className="modal__header">
                    <div>
                        <h3 className="modal__title">Stock Adjustment</h3>
                        <p className="modal__subtitle">
                            {product.name} (Current: {product.current_stock} {product.unit})
                        </p>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    {/* Adjustment Type */}
                    <div className="form-group">
                        <label className="form-label">Operation Type</label>
                        <div className="adjustment-type-grid">
                            <button
                                type="button"
                                className={`adjustment-type-btn type-purchase ${type === 'purchase' ? 'is-active' : ''}`}
                                onClick={() => setType('purchase')}
                            >
                                <span className="adjustment-type-icon">📥</span>
                                <div>
                                    <span className="adjustment-type-label">Reception</span>
                                    <span className="adjustment-type-desc">Supplier delivery</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn type-waste ${type === 'waste' ? 'is-active' : ''}`}
                                onClick={() => setType('waste')}
                            >
                                <span className="adjustment-type-icon">🗑️</span>
                                <div>
                                    <span className="adjustment-type-label">Waste / Loss</span>
                                    <span className="adjustment-type-desc">Damaged/expired product</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn type-adj-in ${type === 'adjustment_in' ? 'is-active' : ''}`}
                                onClick={() => setType('adjustment_in')}
                            >
                                <span className="adjustment-type-icon">➕</span>
                                <div>
                                    <span className="adjustment-type-label">Correction (+)</span>
                                    <span className="adjustment-type-desc">Count error</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn type-adj-out ${type === 'adjustment_out' ? 'is-active' : ''}`}
                                onClick={() => setType('adjustment_out')}
                            >
                                <span className="adjustment-type-icon">➖</span>
                                <div>
                                    <span className="adjustment-type-label">Correction (-)</span>
                                    <span className="adjustment-type-desc">Count error</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Supplier - only for Purchase */}
                    {type === 'purchase' && (
                        <div className="form-group">
                            <label className="form-label">Supplier</label>
                            <select
                                className="form-select"
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                aria-label="Select supplier"
                            >
                                <option value="">Select a supplier...</option>
                                {suppliers?.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="form-group">
                        <label className="form-label">Quantity ({product.unit})</label>
                        <input
                            type="number"
                            className="form-input"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="0.001"
                            step="0.001"
                            required
                            placeholder="e.g. 10"
                            autoFocus
                        />
                    </div>

                    {/* Reason */}
                    <div className="form-group">
                        <label className="form-label">Reason</label>
                        <select
                            className="form-select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            aria-label="Reason"
                        >
                            <option value="">Select a reason...</option>
                            {type === 'purchase' && (
                                <option value="Supplier delivery">Supplier delivery</option>
                            )}
                            {type === 'waste' && (
                                <>
                                    <option value="Expired">Expired</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Preparation error">Preparation error</option>
                                </>
                            )}
                            {(type === 'adjustment_in' || type === 'adjustment_out') && (
                                <option value="Inventory">Inventory (Correction)</option>
                            )}
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes (Optional)</label>
                        <textarea
                            className="form-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional details..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`btn btn-block ${isPositiveAdjustment ? 'btn-primary' : 'btn-danger'}`}
                        disabled={isPending}
                    >
                        {isPending ? 'Saving...' : (
                            <>
                                <Check size={18} />
                                {isPositiveAdjustment
                                    ? 'Add to Stock'
                                    : 'Remove from Stock'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
