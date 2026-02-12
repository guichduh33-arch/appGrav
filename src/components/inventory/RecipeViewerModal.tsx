import { X, Package, AlertCircle } from 'lucide-react'
import type { Product } from '../../types/database'
import { useProductRecipe } from '@/hooks/inventory'
import { cn } from '@/lib/utils'

interface RecipeViewerModalProps {
    product: Product
    onClose: () => void
}

export default function RecipeViewerModal({ product, onClose }: RecipeViewerModalProps) {
    const { data: recipe, isLoading, error } = useProductRecipe(product.id)

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md is-active max-w-[600px]">
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
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
                            <p>Loading recipe...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                            <AlertCircle size={48} />
                            <p>Error loading recipe</p>
                        </div>
                    )}

                    {!isLoading && !error && (!recipe || recipe.length === 0) && (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                            <Package size={48} />
                            <p>No recipe defined for this product</p>
                            <span className="text-sm text-muted-foreground">
                                This product has no associated ingredients in the database.
                            </span>
                        </div>
                    )}

                    {recipe && recipe.length > 0 && (
                        <div className="border border-border rounded-lg overflow-hidden">
                            <div className="grid grid-cols-[2fr_1fr_1.5fr] gap-4 px-4 py-3 bg-muted font-semibold text-sm text-muted-foreground border-b border-border">
                                <span>Ingredient</span>
                                <span>Quantity</span>
                                <span>Current Stock</span>
                            </div>
                            {recipe.map((item, index) => {
                                const material = item.material
                                const isLowStock = material && (material.current_stock ?? 0) < item.quantity

                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            'grid grid-cols-[2fr_1fr_1.5fr] gap-4 px-4 py-3 border-b border-border items-center last:border-b-0',
                                            isLowStock && 'bg-red-50'
                                        )}
                                    >
                                        <div className="flex items-center gap-2 font-medium">
                                            <span className="text-xl">🧪</span>
                                            {material?.name || 'Unknown Ingredient'}
                                        </div>
                                        <div className="font-semibold text-foreground">
                                            {item.quantity} {material?.unit || 'pcs'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {material ? (
                                                <>
                                                    <span className={isLowStock ? 'text-destructive font-bold' : ''}>
                                                        {material.current_stock}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{material.unit}</span>
                                                    {isLowStock && (
                                                        <span className="ml-2 text-xs px-2 py-0.5 bg-destructive text-white rounded">
                                                            Low
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
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
