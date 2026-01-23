import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Check, Plus, Minus } from 'lucide-react'
import type { Product } from '../../../types/database'
import { useCartStore, type CartModifier, type CartItem } from '../../../stores/cartStore'
import { formatPrice } from '../../../utils/helpers'
import './ModifierModal.css'

interface ModifierModalProps {
    product: Product & { category?: { name: string } | null }
    onClose: () => void
    editItem?: CartItem
}

// Modifier configuration by category
const MODIFIER_CONFIG: Record<string, ModifierGroup[]> = {
    Coffee: [
        {
            name: 'temperature',
            label: 'Température',
            type: 'single',
            required: true,
            options: [
                { id: 'hot', label: 'Chaud', price: 0, default: true },
                { id: 'iced', label: 'Glacé', price: 5000 },
            ],
        },
        {
            name: 'milk',
            label: 'Type de lait',
            type: 'single',
            required: true,
            options: [
                { id: 'normal', label: 'Normal', price: 0, default: true },
                { id: 'oat', label: 'Avoine', price: 8000 },
                { id: 'soy', label: 'Soja', price: 6000 },
                { id: 'almond', label: 'Amande', price: 8000 },
                { id: 'none', label: 'Sans lait', price: 0 },
            ],
        },
        {
            name: 'extras',
            label: 'Options',
            type: 'multiple',
            required: false,
            options: [
                { id: 'extra-shot', label: 'Extra Shot Espresso', price: 10000 },
                { id: 'no-sugar', label: 'Sans Sucre', price: 0 },
                { id: 'whipped-cream', label: 'Chantilly', price: 5000 },
            ],
        },
    ],
    Bagel: [
        {
            name: 'toast',
            label: 'Niveau de Toastage',
            type: 'single',
            required: true,
            options: [
                { id: 'not-toasted', label: 'Non toasté', price: 0 },
                { id: 'lightly', label: 'Légèrement', price: 0, default: true },
                { id: 'well-done', label: 'Bien toasté', price: 0 },
            ],
        },
    ],
    Sandwich: [
        {
            name: 'bread',
            label: 'Type de pain',
            type: 'single',
            required: true,
            options: [
                { id: 'white', label: 'Pain Blanc', price: 0, default: true },
                { id: 'whole', label: 'Pain Complet', price: 0 },
                { id: 'sourdough', label: 'Pain au Levain', price: 5000 },
            ],
        },
    ],
}

interface ModifierGroup {
    name: string
    label: string
    type: 'single' | 'multiple'
    required: boolean
    options: ModifierOption[]
}

interface ModifierOption {
    id: string
    label: string
    price: number
    default?: boolean
}

export default function ModifierModal({ product, onClose, editItem }: ModifierModalProps) {
    const { t } = useTranslation()
    const { addItem, updateItem } = useCartStore()

    // Get modifiers for this product's category
    const categoryName = (product.category as { name?: string } | null)?.name || 'default'
    const modifierGroups = MODIFIER_CONFIG[categoryName] || []

    // Initialize selections
    const [selections, setSelections] = useState<Record<string, string | string[]>>(() => {
        // If editing, reconstruct selections from existing modifiers
        if (editItem) {
            const initial: Record<string, string | string[]> = {}
            modifierGroups.forEach(group => {
                if (group.type === 'single') {
                    // Find the modifier that matches this group
                    const mod = editItem.modifiers.find(m => m.groupName === group.name)
                    initial[group.name] = mod?.optionId || (group.options.find(o => o.default) || group.options[0])?.id || ''
                } else {
                    // Find all modifiers for this group
                    const modIds = editItem.modifiers
                        .filter(m => m.groupName === group.name)
                        .map(m => m.optionId)
                    initial[group.name] = modIds
                }
            })
            return initial
        }

        // Default initialization
        const initial: Record<string, string | string[]> = {}
        modifierGroups.forEach(group => {
            if (group.type === 'single') {
                const defaultOption = group.options.find(o => o.default) || group.options[0]
                initial[group.name] = defaultOption?.id || ''
            } else {
                initial[group.name] = []
            }
        })
        return initial
    })

    const [quantity, setQuantity] = useState(editItem?.quantity || 1)
    const [notes, setNotes] = useState(editItem?.notes || '')

    // Calculate total price
    const basePrice = product.retail_price || 0
    let modifiersTotal = 0

    modifierGroups.forEach(group => {
        if (group.type === 'single') {
            const selectedOption = group.options.find(o => o.id === selections[group.name])
            if (selectedOption) modifiersTotal += selectedOption.price
        } else {
            const selectedIds = selections[group.name] as string[]
            selectedIds.forEach(id => {
                const option = group.options.find(o => o.id === id)
                if (option) modifiersTotal += option.price
            })
        }
    })

    const totalPrice = (basePrice + modifiersTotal) * quantity

    // Handle single selection
    const handleSingleSelect = (groupName: string, optionId: string) => {
        setSelections(prev => ({ ...prev, [groupName]: optionId }))
    }

    // Handle multiple selection
    const handleMultiSelect = (groupName: string, optionId: string) => {
        setSelections(prev => {
            const current = prev[groupName] as string[]
            if (current.includes(optionId)) {
                return { ...prev, [groupName]: current.filter(id => id !== optionId) }
            } else {
                return { ...prev, [groupName]: [...current, optionId] }
            }
        })
    }

    // Handle confirm (Add or Update)
    const handleConfirm = () => {
        const modifiers: CartModifier[] = []

        modifierGroups.forEach(group => {
            if (group.type === 'single') {
                const selectedOption = group.options.find(o => o.id === selections[group.name])
                if (selectedOption) {
                    modifiers.push({
                        groupName: group.name,
                        optionId: selectedOption.id,
                        optionLabel: t(`modifiers.options.${selectedOption.id.replace(/-/g, '_')}`),
                        priceAdjustment: selectedOption.price,
                    })
                }
            } else {
                const selectedIds = selections[group.name] as string[]
                selectedIds.forEach(id => {
                    const option = group.options.find(o => o.id === id)
                    if (option) {
                        modifiers.push({
                            groupName: group.name,
                            optionId: option.id,
                            optionLabel: t(`modifiers.options.${option.id.replace(/-/g, '_')}`),
                            priceAdjustment: option.price,
                        })
                    }
                })
            }
        })

        if (editItem) {
            updateItem(editItem.id, modifiers, notes)
            // Quantity update handled separately if needed, but for now we might focus on modifiers/notes
            // If quantity logic needs to be unified, updateItem could accept quantity too.
            // Based on cartStore updateItem signature: (itemId, modifiers, notes).
            // Let's assume quantity change is done via main cart buttons, OR we should update store to accept quantity in updateItem.
            // *Correction*: Store `updateItem` currently doesn't take quantity.
            // *Decision*: I will stick to modifiers/notes update here. If user changes quantity in modal, we should probably call `updateItemQuantity` too.
            // Let's check `updateItem` signature again in my previous turn... yes it's (itemId, modifiers, notes).
            // I'll add `updateItemQuantity` call if quantity changed.
            if (quantity !== editItem.quantity) {
                useCartStore.getState().updateItemQuantity(editItem.id, quantity)
            }
        } else {
            addItem(product, quantity, modifiers, notes)
        }
        onClose()
    }

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md is-active">
                <div className="modal__header">
                    <div>
                        <h3 className="modal__title">
                            {product.name}
                        </h3>
                        <p className="modal__subtitle">{t('modifiers.subtitle')}</p>
                    </div>
                    <button className="modal__close" onClick={onClose} title={t('common.close')} aria-label={t('common.close')}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {/* Modifier Groups */}
                    {modifierGroups.map(group => (
                        <div key={group.name} className="modifier-section">
                            <h4 className="modifier-section__title">
                                {t(`modifiers.groups.${group.name}`)}
                                {group.required && <span className="required">*</span>}
                            </h4>

                            {group.type === 'single' ? (
                                <div className="modifier-options">
                                    {group.options.map(option => (
                                        <div key={option.id} className="modifier-option">
                                            <input
                                                type="radio"
                                                name={group.name}
                                                id={`${group.name}-${option.id}`}
                                                checked={selections[group.name] === option.id}
                                                onChange={() => handleSingleSelect(group.name, option.id)}
                                            />
                                            <label htmlFor={`${group.name}-${option.id}`} className="modifier-option__label">
                                                <span className="modifier-option__text">{t(`modifiers.options.${option.id.replace(/-/g, '_')}`)}</span>
                                                {option.price > 0 && (
                                                    <span className="modifier-option__price">+{formatPrice(option.price)}</span>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="modifier-checkboxes">
                                    {group.options.map(option => (
                                        <label key={option.id} className={`modifier-checkbox ${(selections[group.name] as string[]).includes(option.id) ? 'is-checked' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={(selections[group.name] as string[]).includes(option.id)}
                                                onChange={() => handleMultiSelect(group.name, option.id)}
                                            />
                                            <span className="modifier-checkbox__label">{t(`modifiers.options.${option.id.replace(/-/g, '_')}`)}</span>
                                            <span className="modifier-checkbox__price">+{formatPrice(option.price)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Notes */}
                    <div className="modifier-section">
                        <h4 className="modifier-section__title">{t('modifiers.notes_label')}</h4>
                        <textarea
                            className="form-textarea"
                            placeholder={t('modifiers.notes_placeholder')}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Quantity */}
                    <div className="modifier-section">
                        <h4 className="modifier-section__title">{t('modifiers.quantity_label')}</h4>
                        <div className="qty-selector">
                            <button
                                className="qty-selector__btn"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                title={t('cart.qty_decrease')}
                                aria-label={t('cart.qty_decrease')}
                            >
                                <Minus size={18} />
                            </button>
                            <span className="qty-selector__value">{quantity}</span>
                            <button
                                className="qty-selector__btn"
                                onClick={() => setQuantity(quantity + 1)}
                                title={t('cart.qty_increase')}
                                aria-label={t('cart.qty_increase')}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="btn btn-primary btn-block" onClick={handleConfirm}>
                        <Check size={18} />
                        {editItem ? t('modifiers.update_item') : t('modifiers.add_to_cart')} • {formatPrice(totalPrice)}
                    </button>
                </div>
            </div>
        </div>
    )
}
