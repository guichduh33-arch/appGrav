import { useState, useMemo, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import type { Product } from '../../../types/database'
import { useCartStore } from '../../../stores/cartStore'
import { formatPrice } from '../../../utils/helpers'
import { useProductVariants, type IVariantGroup } from '../../../hooks/products/useProductVariants'
import './VariantModal.css'

interface VariantModalProps {
    baseProduct: Product
    variants?: Product[] // Deprecated: now using database variants
    onClose: () => void
}

interface SelectedVariant {
    groupName: string
    optionIds: string[]
    optionLabels: string[]
    materials: Array<{
        materialId: string
        quantity: number
    }>
}

export default function VariantModal({ baseProduct, onClose }: VariantModalProps) {
    const addItem = useCartStore(state => state.addItem)
    const { data: variantGroups = [], isLoading } = useProductVariants(baseProduct.id)
    const [hasCheckedVariants, setHasCheckedVariants] = useState(false)

    // Si pas de variants, ajouter directement au panier et fermer
    useEffect(() => {
        if (!isLoading && !hasCheckedVariants && variantGroups.length === 0) {
            setHasCheckedVariants(true)
            addItem(baseProduct, 1, [], '', undefined)
            onClose()
        }
    }, [isLoading, hasCheckedVariants, variantGroups.length, baseProduct, addItem, onClose])

    // État pour stocker les sélections pour chaque groupe
    const [selections, setSelections] = useState<Record<string, string[]>>(() => {
        const initial: Record<string, string[]> = {}
        variantGroups.forEach(group => {
            // Sélectionner les options par défaut
            const defaultOptions = group.options.filter(opt => opt.is_default)
            if (defaultOptions.length > 0) {
                initial[group.group_name] = defaultOptions.map(opt => opt.option_id)
            } else if (group.options.length > 0) {
                // Sinon, sélectionner la première option pour les groupes single
                if (group.group_type === 'single') {
                    initial[group.group_name] = [group.options[0].option_id]
                } else {
                    initial[group.group_name] = []
                }
            }
        })
        return initial
    })

    // Gérer la sélection d'une option
    const handleOptionSelect = (group: IVariantGroup, optionId: string) => {
        setSelections(prev => {
            if (group.group_type === 'single') {
                // Pour single, remplacer la sélection
                return { ...prev, [group.group_name]: [optionId] }
            } else {
                // Pour multiple, toggle l'option
                const current = prev[group.group_name] || []
                const isSelected = current.includes(optionId)
                return {
                    ...prev,
                    [group.group_name]: isSelected
                        ? current.filter(id => id !== optionId)
                        : [...current, optionId]
                }
            }
        })
    }

    // Calculer le prix total avec les ajustements
    const totalPrice = useMemo(() => {
        let price = baseProduct.retail_price || 0

        variantGroups.forEach(group => {
            const selectedIds = selections[group.group_name] || []
            selectedIds.forEach(optionId => {
                const option = group.options.find(opt => opt.option_id === optionId)
                if (option) {
                    price += option.price_adjustment
                }
            })
        })

        return price
    }, [baseProduct.retail_price, variantGroups, selections])

    // Vérifier si toutes les sélections requises sont faites
    const isValidSelection = useMemo(() => {
        return variantGroups.every(group => {
            if (group.group_required) {
                const selected = selections[group.group_name] || []
                return selected.length > 0
            }
            return true
        })
    }, [variantGroups, selections])

    const handleAddToCart = () => {
        // Construire les variants sélectionnés pour le panier
        const selectedVariants: SelectedVariant[] = variantGroups.map(group => {
            const selectedOptionIds = selections[group.group_name] || []
            const selectedOptions = selectedOptionIds
                .map(id => group.options.find(opt => opt.option_id === id))
                .filter(Boolean)

            return {
                groupName: group.group_name,
                optionIds: selectedOptionIds,
                optionLabels: selectedOptions.map(opt => opt!.option_label),
                materials: selectedOptions
                    .flatMap(opt => opt!.materials || [])
                    .map(mat => ({
                        materialId: mat.material_id,
                        quantity: mat.quantity
                    }))
            }
        })

        // Créer une note descriptive des variants
        const variantNote = selectedVariants
            .filter(v => v.optionLabels.length > 0)
            .map(v => `${v.groupName}: ${v.optionLabels.join(', ')}`)
            .join(' | ')

        // Ajouter au panier avec le prix ajusté et les variants
        const productWithAdjustedPrice = {
            ...baseProduct,
            retail_price: totalPrice
        }

        // Passer les selectedVariants pour le tracking des ingrédients
        addItem(productWithAdjustedPrice, 1, [], variantNote, selectedVariants)
        onClose()
    }

    if (isLoading) {
        return (
            <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="modal modal-md is-active variant-modal">
                    <div className="modal__header">
                        <h3 className="modal__title">Chargement...</h3>
                        <button className="modal__close" onClick={onClose} title="Fermer" aria-label="Fermer">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="modal__body">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            Chargement des options...
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md is-active variant-modal">
                <div className="modal__header">
                    <div className="variant-modal__product-info">
                        {baseProduct.image_url && (
                            <img
                                src={baseProduct.image_url}
                                alt={baseProduct.name}
                                className="variant-modal__image"
                            />
                        )}
                        <div>
                            <h3 className="modal__title">{baseProduct.name}</h3>
                            <p className="modal__subtitle">Choisissez vos options</p>
                        </div>
                    </div>
                    <button className="modal__close" onClick={onClose} title="Fermer" aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {variantGroups.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#6B7280' }}>
                            Aucune option disponible pour ce produit
                        </div>
                    ) : (
                        variantGroups.map(group => (
                            <div key={group.group_name} className="variant-section">
                                <h4 className="variant-section__title">
                                    {group.group_name}
                                    {group.group_required && <span style={{ color: '#EF4444', marginLeft: '0.25rem' }}>*</span>}
                                    {group.group_type === 'multiple' && (
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '0.5rem', color: '#6B7280' }}>
                                            (Choix multiples)
                                        </span>
                                    )}
                                </h4>
                                <div className="variant-options">
                                    {group.options.map(option => {
                                        const isSelected = (selections[group.group_name] || []).includes(option.option_id)
                                        return (
                                            <button
                                                key={option.option_id}
                                                className={`variant-option ${isSelected ? 'is-selected' : ''}`}
                                                onClick={() => handleOptionSelect(group, option.option_id)}
                                            >
                                                <span className="variant-option__label">{option.option_label}</span>
                                                {option.price_adjustment !== 0 && (
                                                    <span className="variant-option__price">
                                                        {option.price_adjustment > 0 ? '+' : ''}{formatPrice(option.price_adjustment)}
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Selected Price Display */}
                    <div className="variant-price-display">
                        <span>Prix total:</span>
                        <strong>{formatPrice(totalPrice)}</strong>
                    </div>
                </div>

                <div className="modal__footer">
                    <button
                        className="btn btn-primary btn-block"
                        onClick={handleAddToCart}
                        disabled={!isValidSelection}
                    >
                        <Check size={18} />
                        Ajouter au panier • {formatPrice(totalPrice)}
                    </button>
                </div>
            </div>
        </div>
    )
}
