import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Check, Plus, Minus } from 'lucide-react'
import type { Product } from '../../types/database'
import { useCartStore, type CartModifier } from '../../stores/cartStore'
import { formatPrice } from '../../utils/helpers'
import './ModifierModal.css'

interface ModifierModalProps {
    product: Product
    onClose: () => void
}

// Modifier configuration by category
const MODIFIER_CONFIG: Record<string, ModifierGroup[]> = {
    Coffee: [
        {
            name: 'temperature',
            label: 'Température',
            icon: '🌡️',
            type: 'single',
            required: true,
            options: [
                { id: 'hot', label: 'Chaud', icon: '🔥', price: 0, default: true },
                { id: 'iced', label: 'Glacé', icon: '🧊', price: 5000 },
            ],
        },
        {
            name: 'milk',
            label: 'Type de lait',
            icon: '🥛',
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
            icon: '⚡',
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
            icon: '🔥',
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
            icon: '🍞',
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
    icon: string
    type: 'single' | 'multiple'
    required: boolean
    options: ModifierOption[]
}

interface ModifierOption {
    id: string
    label: string
    icon?: string
    price: number
    default?: boolean
}

export default function ModifierModal({ product, onClose }: ModifierModalProps) {
    const { t } = useTranslation()
    const addItem = useCartStore(state => state.addItem)

    // Get modifiers for this product's category
    const categoryName = (product as any).category?.name || 'default'
    const modifierGroups = MODIFIER_CONFIG[categoryName] || []

    // Initialize selections with defaults
    const [selections, setSelections] = useState<Record<string, string | string[]>>(() => {
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

    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')

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

    // Handle add to cart
    const handleAddToCart = () => {
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

        addItem(product, quantity, modifiers, notes)
        onClose()
    }

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md is-active">
                <div className="modal__header">
                    <div>
                        <h3 className="modal__title">
                            <span>{getProductEmoji(product)}</span>
                            <span>{product.name}</span>
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
                                {group.icon} {t(`modifiers.groups.${group.name}`)}
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
                                                {option.icon && <span className="modifier-option__icon">{option.icon}</span>}
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
                        <h4 className="modifier-section__title">📝 {t('modifiers.notes_label')}</h4>
                        <textarea
                            className="form-textarea"
                            placeholder={t('modifiers.notes_placeholder')}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Quantity */}
                    <div className="modifier-section">
                        <h4 className="modifier-section__title">📦 {t('modifiers.quantity_label')}</h4>
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
                    <button className="btn btn-primary btn-block" onClick={handleAddToCart}>
                        <Check size={18} />
                        {t('modifiers.add_to_cart')} • {formatPrice(totalPrice)}
                    </button>
                </div>
            </div>
        </div>
    )
}

function getProductEmoji(product: Product): string {
    const name = product.name.toLowerCase()
    if (name.includes('cappuccino') || name.includes('latte') || name.includes('espresso')) return '☕'
    if (name.includes('matcha')) return '🍵'
    if (name.includes('croissant')) return '🥐'
    if (name.includes('bagel')) return '🥯'
    if (name.includes('sandwich')) return '🥪'
    return '🥐'
}
