import { useState, useEffect } from 'react'
import { X, Check, Plus, Minus } from 'lucide-react'
import type { Product } from '../../../types/database'
import { useCartStore, type CartModifier, type CartItem } from '../../../stores/cartStore'
import { formatPrice } from '../../../utils/helpers'
import { calculateCustomerPrice } from '@/services/sync/customerPricingService'
import type { IOfflineProduct } from '@/lib/db'
import type { ICustomerPriceResult } from '@/types/offline'
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
    const { addItem, addItemWithPricing, updateItem, customerCategorySlug } = useCartStore()

    // Story 6.2: Customer pricing state
    const [customerPriceResult, setCustomerPriceResult] = useState<ICustomerPriceResult | null>(null)

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

    // Story 6.2: Calculate customer-specific price on mount or when category changes
    useEffect(() => {
        const fetchCustomerPrice = async () => {
            // Convert Product to IOfflineProduct-like structure for pricing service
            const offlineProduct: IOfflineProduct = {
                id: product.id,
                category_id: product.category_id || null,
                sku: product.sku || null,
                name: product.name,
                product_type: product.product_type || null,
                retail_price: product.retail_price || 0,
                wholesale_price: product.wholesale_price || null,
                cost_price: product.cost_price || null,
                image_url: product.image_url || null,
                is_active: product.is_active ?? true,
                updated_at: product.updated_at || new Date().toISOString(),
                pos_visible: product.pos_visible ?? true,
                available_for_sale: product.available_for_sale ?? true,
            }

            try {
                const result = await calculateCustomerPrice(offlineProduct, customerCategorySlug)
                setCustomerPriceResult(result)
            } catch (error) {
                console.error('[ModifierModal] Error calculating customer price:', error)
                // Fallback to retail price
                setCustomerPriceResult({
                    price: product.retail_price || 0,
                    priceType: 'retail',
                    savings: 0,
                    categoryName: null,
                })
            }
        }

        fetchCustomerPrice()
    }, [product, customerCategorySlug])

    // Calculate total price - use customer price if available
    const basePrice = customerPriceResult?.price ?? (product.retail_price || 0)
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
                        optionLabel: selectedOption.label,
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
                            optionLabel: option.label,
                            priceAdjustment: option.price,
                        })
                    }
                })
            }
        })

        if (editItem) {
            updateItem(editItem.id, modifiers, notes)
            // Update quantity if changed
            if (quantity !== editItem.quantity) {
                useCartStore.getState().updateItemQuantity(editItem.id, quantity)
            }
            // Story 6.2: Update pricing if customer category changed
            if (customerPriceResult && customerPriceResult.priceType !== 'retail') {
                useCartStore.getState().updateItemPricing(
                    editItem.id,
                    customerPriceResult.price,
                    customerPriceResult.priceType,
                    customerPriceResult.savings
                )
            }
        } else {
            // Story 6.2: Use addItemWithPricing if we have customer-specific pricing
            if (customerPriceResult && customerPriceResult.priceType !== 'retail') {
                addItemWithPricing(
                    product,
                    quantity,
                    modifiers,
                    notes,
                    customerPriceResult.price,
                    customerPriceResult.priceType,
                    customerPriceResult.savings
                )
            } else {
                // Fallback to standard addItem for retail customers
                addItem(product, quantity, modifiers, notes)
            }
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
                        <p className="modal__subtitle">Customize your order</p>
                    </div>
                    <button className="modal__close" onClick={onClose} title="Close" aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {/* Modifier Groups */}
                    {modifierGroups.map(group => (
                        <div key={group.name} className="modifier-section">
                            <h4 className="modifier-section__title">
                                {group.label}
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
                                                <span className="modifier-option__text">{option.label}</span>
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
                                            <span className="modifier-checkbox__label">{option.label}</span>
                                            <span className="modifier-checkbox__price">+{formatPrice(option.price)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Notes */}
                    <div className="modifier-section">
                        <h4 className="modifier-section__title">Kitchen notes</h4>
                        <textarea
                            className="form-textarea"
                            placeholder="Special instructions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Quantity */}
                    <div className="modifier-section">
                        <h4 className="modifier-section__title">Quantity</h4>
                        <div className="qty-selector">
                            <button
                                className="qty-selector__btn"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                title="Decrease quantity"
                                aria-label="Decrease quantity"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="qty-selector__value">{quantity}</span>
                            <button
                                className="qty-selector__btn"
                                onClick={() => setQuantity(quantity + 1)}
                                title="Increase quantity"
                                aria-label="Increase quantity"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="btn btn-primary btn-block" onClick={handleConfirm}>
                        <Check size={18} />
                        {editItem ? 'Update item' : 'Add to cart'} - {formatPrice(totalPrice)}
                    </button>
                </div>
            </div>
        </div>
    )
}
