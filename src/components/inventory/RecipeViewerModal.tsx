import { X, Package, AlertCircle } from 'lucide-react'
import type { Product } from '../../types/database'
import { useProductRecipe } from '@/hooks/inventory'
import './RecipeViewerModal.css'

interface RecipeViewerModalProps {
    product: Product
    onClose: () => void
}

export default function RecipeViewerModal({ product, onClose }: RecipeViewerModalProps) {
    const { data: recipe, isLoading, error } = useProductRecipe(product.id)

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md is-active recipe-modal">
                <div className="modal__header">
                    <div>
                        <h3 className="modal__title">Recipe / BOM</h3>
                        <p className="modal__subtitle">{product.name}</p>
                    </div>
                    <button className="modal__close" onClick={onClose} title="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {isLoading && (
                        <div className="recipe-loading">
                            <div className="spinner"></div>
                            <p>Loading recipe...</p>
                        </div>
                    )}

                    {error && (
                        <div className="recipe-error">
                            <AlertCircle size={48} />
                            <p>Error loading recipe</p>
                        </div>
                    )}

                    {!isLoading && !error && (!recipe || recipe.length === 0) && (
                        <div className="recipe-empty">
                            <Package size={48} />
                            <p>No recipe defined for this product</p>
                            <span className="recipe-empty__hint">
                                This product has no associated ingredients in the database.
                            </span>
                        </div>
                    )}

                    {recipe && recipe.length > 0 && (
                        <div className="recipe-list">
                            <div className="recipe-header">
                                <span>Ingredient</span>
                                <span>Quantity</span>
                                <span>Current Stock</span>
                            </div>
                            {(recipe as unknown as Array<{ material?: Product & { current_stock?: number }; quantity: number; unit?: string }>).map((item, index) => {
                                const material = item.material
                                const isLowStock = material && (material.current_stock ?? 0) < item.quantity

                                return (
                                    <div key={index} className={`recipe-item ${isLowStock ? 'is-low' : ''}`}>
                                        <div className="recipe-item__name">
                                            <span className="material-icon">🧪</span>
                                            {material?.name || 'Unknown Ingredient'}
                                        </div>
                                        <div className="recipe-item__qty">
                                            {item.quantity} {item.unit || material?.unit || 'pcs'}
                                        </div>
                                        <div className="recipe-item__stock">
                                            {material ? (
                                                <>
                                                    <span className={isLowStock ? 'text-urgent' : ''}>
                                                        {material.current_stock}
                                                    </span>
                                                    <span className="stock-unit">{material.unit}</span>
                                                    {isLowStock && (
                                                        <span className="low-badge">⚠️ Low</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="btn btn-secondary btn-block" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
