import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useStockAdjustment, useSuppliers } from '@/hooks/inventory'
import { cn } from '@/lib/utils'

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

const ADJUSTMENT_TYPES: Array<{ id: AdjustmentType; icon: string; label: string; desc: string; isDanger?: boolean }> = [
    { id: 'purchase', icon: '📥', label: 'Reception', desc: 'Supplier delivery' },
    { id: 'waste', icon: '🗑️', label: 'Waste / Loss', desc: 'Damaged/expired product', isDanger: true },
    { id: 'adjustment_in', icon: '➕', label: 'Correction (+)', desc: 'Count error' },
    { id: 'adjustment_out', icon: '➖', label: 'Correction (-)', desc: 'Count error' },
]

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {ADJUSTMENT_TYPES.map(adj => {
                                const isActive = type === adj.id
                                return (
                                    <button
                                        key={adj.id}
                                        type="button"
                                        className={cn(
                                            'flex items-center gap-4 p-4 border rounded-lg cursor-pointer text-left transition-all duration-200 relative overflow-hidden',
                                            'hover:-translate-y-0.5 hover:shadow-md',
                                            isActive && adj.isDanger
                                                ? 'bg-danger-bg border-danger shadow-[0_0_0_2px_var(--color-danger-border)]'
                                                : isActive
                                                    ? 'bg-primary/5 border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]'
                                                    : 'bg-white border-gray-200 hover:border-primary-light'
                                        )}
                                        onClick={() => setType(adj.id)}
                                    >
                                        <span className={cn(
                                            'text-[1.75rem] w-12 h-12 flex items-center justify-center rounded shrink-0',
                                            isActive ? 'bg-white' : 'bg-gray-50'
                                        )}>
                                            {adj.icon}
                                        </span>
                                        <div>
                                            <span className="block font-semibold text-[0.95rem] text-gray-900 mb-0.5">{adj.label}</span>
                                            <span className="block text-xs text-gray-500 leading-tight">{adj.desc}</span>
                                        </div>
                                    </button>
                                )
                            })}
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
