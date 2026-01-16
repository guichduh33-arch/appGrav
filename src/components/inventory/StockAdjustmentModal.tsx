import { useState } from 'react'
import { X, Check } from 'lucide-react'
import type { Product } from '../../types/database'
import { useStockAdjustment } from '../../hooks/useInventory'
// Removed unused import: formatPrice
import './StockAdjustmentModal.css'

interface StockAdjustmentModalProps {
    product: Product
    onClose: () => void
}

type AdjustmentType = 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out'

export default function StockAdjustmentModal({ product, onClose }: StockAdjustmentModalProps) {
    const { mutate: adjustStock, isPending } = useStockAdjustment()

    const [type, setType] = useState<AdjustmentType>('purchase')
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        adjustStock({
            productId: product.id,
            type,
            quantity: Number(quantity),
            reason,
            notes
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
                        <h3 className="modal__title">Ajustement de stock</h3>
                        <p className="modal__subtitle">{product.name} (Actuel: {product.current_stock} {product.unit})</p>
                    </div>
                    <button className="modal__close" onClick={onClose} title="Fermer" aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    {/* Adjustment Type */}
                    <div className="form-group">
                        <label className="form-label">Type d'opération</label>
                        <div className="adjustment-type-grid">
                            <button
                                type="button"
                                className={`adjustment-type-btn ${type === 'purchase' ? 'is-active' : ''}`}
                                onClick={() => setType('purchase')}
                            >
                                <span className="adjustment-type-icon">📥</span>
                                <div>
                                    <span className="adjustment-type-label">Réception</span>
                                    <span className="adjustment-type-desc">Arrivage fournisseur</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn ${type === 'waste' ? 'is-active' : ''}`}
                                onClick={() => setType('waste')}
                            >
                                <span className="adjustment-type-icon">🗑️</span>
                                <div>
                                    <span className="adjustment-type-label">Perte / Gaspi</span>
                                    <span className="adjustment-type-desc">Produit abîmé/périmé</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn ${type === 'adjustment_in' ? 'is-active' : ''}`}
                                onClick={() => setType('adjustment_in')}
                            >
                                <span className="adjustment-type-icon">➕</span>
                                <div>
                                    <span className="adjustment-type-label">Correction (+)</span>
                                    <span className="adjustment-type-desc">Erreur comptage</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`adjustment-type-btn ${type === 'adjustment_out' ? 'is-active' : ''}`}
                                onClick={() => setType('adjustment_out')}
                            >
                                <span className="adjustment-type-icon">➖</span>
                                <div>
                                    <span className="adjustment-type-label">Correction (-)</span>
                                    <span className="adjustment-type-desc">Erreur comptage</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="form-group">
                        <label className="form-label">Quantité ({product.unit})</label>
                        <input
                            type="number"
                            className="form-input"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="0.001"
                            step="0.001"
                            required
                            placeholder="ex: 10"
                            autoFocus
                        />
                    </div>

                    {/* Reason */}
                    <div className="form-group">
                        <label className="form-label">Motif</label>
                        <select
                            className="form-select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            aria-label="Motif d'ajustement"
                        >
                            <option value="">Sélectionner un motif...</option>
                            {type === 'purchase' && (
                                <option value="Livraison fournisseur">Livraison fournisseur</option>
                            )}
                            {type === 'waste' && (
                                <>
                                    <option value="Périmé">Périmé</option>
                                    <option value="Abîmé">Abîmé</option>
                                    <option value="Erreur préparation">Erreur préparation</option>
                                </>
                            )}
                            {(type === 'adjustment_in' || type === 'adjustment_out') && (
                                <option value="Inventaire">Inventaire (Correction)</option>
                            )}
                            <option value="Autre">Autre</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes (Optionnel)</label>
                        <textarea
                            className="form-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Détails supplémentaires..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`btn btn-block ${isPositiveAdjustment ? 'btn-primary' : 'btn-danger'}`}
                        disabled={isPending}
                    >
                        {isPending ? 'Enregistrement...' : (
                            <>
                                <Check size={18} />
                                {isPositiveAdjustment ? 'Ajouter au Stock' : 'Retirer du Stock'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
