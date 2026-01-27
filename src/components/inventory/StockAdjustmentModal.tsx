import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
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
                        <h3 className="modal__title">{t('stock_adjustment.title', 'Stock Adjustment')}</h3>
                        <p className="modal__subtitle">
                            {product.name} ({t('stock_adjustment.current', 'Current')}: {product.current_stock} {product.unit})
                        </p>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        title={t('common.close', 'Close')}
                        aria-label={t('common.close', 'Close')}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    {/* Adjustment Type */}
                    <div className="form-group">
                        <label className="form-label">{t('stock_adjustment.operation_type', 'Operation Type')}</label>
                        <div className="adjustment-type-grid">
                            <button
                                type="button"
                                className={`adjustment-type-btn type-purchase ${type === 'purchase' ? 'is-active' : ''}`}
                                onClick={() => setType('purchase')}
                            >
                                <span className="adjustment-type-icon">📥</span>
                                <div>
                                    <span className="adjustment-type-label">{t('stock_adjustment.types.reception', 'Reception')}</span>
                                    <span className="adjustment-type-desc">{t('stock_adjustment.types.reception_desc', 'Supplier delivery')}</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn type-waste ${type === 'waste' ? 'is-active' : ''}`}
                                onClick={() => setType('waste')}
                            >
                                <span className="adjustment-type-icon">🗑️</span>
                                <div>
                                    <span className="adjustment-type-label">{t('stock_adjustment.types.waste', 'Waste / Loss')}</span>
                                    <span className="adjustment-type-desc">{t('stock_adjustment.types.waste_desc', 'Damaged/expired product')}</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn type-adj-in ${type === 'adjustment_in' ? 'is-active' : ''}`}
                                onClick={() => setType('adjustment_in')}
                            >
                                <span className="adjustment-type-icon">➕</span>
                                <div>
                                    <span className="adjustment-type-label">{t('stock_adjustment.types.correction_plus', 'Correction (+)')}</span>
                                    <span className="adjustment-type-desc">{t('stock_adjustment.types.correction_desc', 'Count error')}</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn type-adj-out ${type === 'adjustment_out' ? 'is-active' : ''}`}
                                onClick={() => setType('adjustment_out')}
                            >
                                <span className="adjustment-type-icon">➖</span>
                                <div>
                                    <span className="adjustment-type-label">{t('stock_adjustment.types.correction_minus', 'Correction (-)')}</span>
                                    <span className="adjustment-type-desc">{t('stock_adjustment.types.correction_desc', 'Count error')}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Supplier - only for Purchase */}
                    {type === 'purchase' && (
                        <div className="form-group">
                            <label className="form-label">{t('stock_adjustment.supplier', 'Supplier')}</label>
                            <select
                                className="form-select"
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                aria-label={t('stock_adjustment.select_supplier', 'Select supplier')}
                            >
                                <option value="">{t('stock_adjustment.select_supplier', 'Select a supplier...')}</option>
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
                        <label className="form-label">{t('stock_adjustment.quantity', 'Quantity')} ({product.unit})</label>
                        <input
                            type="number"
                            className="form-input"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="0.001"
                            step="0.001"
                            required
                            placeholder={t('stock_adjustment.quantity_placeholder', 'e.g. 10')}
                            autoFocus
                        />
                    </div>

                    {/* Reason */}
                    <div className="form-group">
                        <label className="form-label">{t('stock_adjustment.reason', 'Reason')}</label>
                        <select
                            className="form-select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            aria-label={t('stock_adjustment.reason', 'Reason')}
                        >
                            <option value="">{t('stock_adjustment.select_reason', 'Select a reason...')}</option>
                            {type === 'purchase' && (
                                <option value="Supplier delivery">{t('stock_adjustment.reasons.supplier_delivery', 'Supplier delivery')}</option>
                            )}
                            {type === 'waste' && (
                                <>
                                    <option value="Expired">{t('stock_adjustment.reasons.expired', 'Expired')}</option>
                                    <option value="Damaged">{t('stock_adjustment.reasons.damaged', 'Damaged')}</option>
                                    <option value="Preparation error">{t('stock_adjustment.reasons.preparation_error', 'Preparation error')}</option>
                                </>
                            )}
                            {(type === 'adjustment_in' || type === 'adjustment_out') && (
                                <option value="Inventory">{t('stock_adjustment.reasons.inventory', 'Inventory (Correction)')}</option>
                            )}
                            <option value="Other">{t('stock_adjustment.reasons.other', 'Other')}</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">{t('stock_adjustment.notes', 'Notes')} ({t('common.optional', 'Optional')})</label>
                        <textarea
                            className="form-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('stock_adjustment.notes_placeholder', 'Additional details...')}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`btn btn-block ${isPositiveAdjustment ? 'btn-primary' : 'btn-danger'}`}
                        disabled={isPending}
                    >
                        {isPending ? t('common.saving', 'Saving...') : (
                            <>
                                <Check size={18} />
                                {isPositiveAdjustment
                                    ? t('stock_adjustment.add_to_stock', 'Add to Stock')
                                    : t('stock_adjustment.remove_from_stock', 'Remove from Stock')}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
