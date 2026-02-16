import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Check, Plus, Minus } from 'lucide-react'
import type { Product } from '../../../types/database'
import { useCartStore, type CartModifier, type CartItem } from '../../../stores/cartStore'
import { formatPrice } from '../../../utils/helpers'
import { calculateCustomerPrice } from '@/services/sync/customerPricingService'
import type { IOfflineProduct } from '@/lib/db'
import type { ICustomerPriceResult } from '@/types/offline'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'
import { usePOSConfigSettings } from '@/hooks/settings'

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
            label: 'Temperature',
            type: 'single',
            required: true,
            options: [
                { id: 'hot', label: 'Hot', price: 0, default: true },
                { id: 'iced', label: 'Iced', price: 5000 },
            ],
        },
        {
            name: 'milk',
            label: 'Milk Type',
            type: 'single',
            required: true,
            options: [
                { id: 'normal', label: 'Normal', price: 0, default: true },
                { id: 'oat', label: 'Oat', price: 8000 },
                { id: 'soy', label: 'Soy', price: 6000 },
                { id: 'almond', label: 'Almond', price: 8000 },
                { id: 'none', label: 'No Milk', price: 0 },
            ],
        },
        {
            name: 'extras',
            label: 'Extras',
            type: 'multiple',
            required: false,
            options: [
                { id: 'extra-shot', label: 'Extra Shot Espresso', price: 10000 },
                { id: 'no-sugar', label: 'No Sugar', price: 0 },
                { id: 'whipped-cream', label: 'Whipped Cream', price: 5000 },
            ],
        },
    ],
    Bagel: [
        {
            name: 'toast',
            label: 'Toast Level',
            type: 'single',
            required: true,
            options: [
                { id: 'not-toasted', label: 'Not Toasted', price: 0 },
                { id: 'lightly', label: 'Lightly Toasted', price: 0, default: true },
                { id: 'well-done', label: 'Well Toasted', price: 0 },
            ],
        },
    ],
    Sandwich: [
        {
            name: 'bread',
            label: 'Bread Type',
            type: 'single',
            required: true,
            options: [
                { id: 'white', label: 'White Bread', price: 0, default: true },
                { id: 'whole', label: 'Whole Wheat', price: 0 },
                { id: 'sourdough', label: 'Sourdough', price: 5000 },
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
    const { modifierSelectionBehaviour } = usePOSConfigSettings()

    // Story 6.2: Customer pricing state
    const [customerPriceResult, setCustomerPriceResult] = useState<ICustomerPriceResult | null>(null)

    // Get modifiers for this product's category - prefer DB settings over hardcoded fallback
    const categoryName = (product.category as { name?: string } | null)?.name || 'default'
    const modifierGroups = (modifierSelectionBehaviour?.[categoryName] || MODIFIER_CONFIG[categoryName] || []) as ModifierGroup[]

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
                current_stock: null,
                image_url: product.image_url || null,
                is_active: product.is_active ?? true,
                updated_at: product.updated_at || new Date().toISOString(),
                pos_visible: product.pos_visible ?? true,
                available_for_sale: product.available_for_sale ?? true,
                track_inventory: product.track_inventory ?? true,
            }

            try {
                const result = await calculateCustomerPrice(offlineProduct, customerCategorySlug)
                setCustomerPriceResult(result)
            } catch (error) {
                logError('[ModifierModal] Error calculating customer price:', error)
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
        if (!editItem) {
            toast.success(`Added ${product.name}`, { duration: 1500 })
        }
        onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            style={{ zIndex: 'var(--z-modal-backdrop)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl shadow-2xl max-h-[90vh] flex flex-col md:flex-row text-white w-[800px] max-w-full overflow-hidden"
                style={{ zIndex: 'var(--z-modal)' }}
            >
                {/* Left: Product image */}
                {product.image_url && (
                    <div className="w-full md:w-5/12 shrink-0">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Right: Options */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-start justify-between p-6 border-b border-[var(--theme-border)]">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 m-0 text-[var(--theme-text-primary)]">
                                {product.name}
                            </h3>
                            <p className="text-xs text-[var(--theme-text-muted)] mt-1">Personalize this selection</p>
                        </div>
                        <button
                            className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:bg-[var(--theme-bg-tertiary)] hover:text-white"
                            onClick={onClose}
                            title="Close"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {/* Modifier Groups */}
                        {modifierGroups.map(group => (
                            <div key={group.name} className="mb-6 last:mb-0">
                                <h4 className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-gold)] mb-3 uppercase tracking-[0.2em]">
                                    {group.label}
                                    {group.required && <span className="text-destructive ml-1">*</span>}
                                </h4>

                                {group.type === 'single' ? (
                                    <div className="flex flex-col gap-2">
                                        {group.options.map(option => (
                                            <div key={option.id} className="relative">
                                                <input
                                                    type="radio"
                                                    name={group.name}
                                                    id={`${group.name}-${option.id}`}
                                                    checked={selections[group.name] === option.id}
                                                    onChange={() => handleSingleSelect(group.name, option.id)}
                                                    className="absolute opacity-0 pointer-events-none peer"
                                                />
                                                <label
                                                    htmlFor={`${group.name}-${option.id}`}
                                                    className="flex items-center justify-between p-4 bg-transparent border border-[var(--theme-border)] rounded-lg cursor-pointer transition-all text-left text-[var(--theme-text-secondary)] hover:border-[var(--color-gold)]/50 peer-checked:border-[var(--color-gold)] peer-checked:bg-[var(--color-gold)]/5"
                                                >
                                                    <span className="text-sm font-medium">{option.label}</span>
                                                    {option.price > 0 && (
                                                        <span className="text-xs font-semibold text-[var(--color-gold)]">+{formatPrice(option.price)}</span>
                                                    )}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {group.options.map(option => {
                                            const isChecked = (selections[group.name] as string[]).includes(option.id)
                                            return (
                                                <label
                                                    key={option.id}
                                                    className={cn(
                                                        'flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all',
                                                        'hover:border-[var(--color-gold)]/50',
                                                        isChecked ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[var(--theme-border)]'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleMultiSelect(group.name, option.id)}
                                                            className="w-4 h-4 accent-[var(--color-gold)]"
                                                        />
                                                        <span className="text-sm font-medium text-[var(--theme-text-secondary)]">{option.label}</span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-[var(--color-gold)]">+{formatPrice(option.price)}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Notes */}
                        <div className="mb-6 last:mb-0">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-gold)] mb-3 uppercase tracking-[0.2em]">Kitchen notes</h4>
                            <textarea
                                className="w-full min-h-[100px] p-3 font-[var(--font-body)] text-[15px] text-white bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl resize-none transition-all focus:outline-none focus:border-gold focus:bg-[var(--theme-bg-tertiary)] placeholder:text-[var(--theme-text-muted)]"
                                placeholder="Special instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Quantity */}
                        <div className="mb-6 last:mb-0">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-gold)] mb-3 uppercase tracking-[0.2em]">Quantity</h4>
                            <div className="flex items-center gap-4 bg-[var(--theme-bg-tertiary)] p-1.5 rounded-2xl w-fit border border-[var(--theme-border)]">
                                <button
                                    className="w-12 h-12 flex items-center justify-center bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl text-white cursor-pointer transition-all hover:bg-[var(--theme-bg-tertiary)]"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    title="Decrease quantity"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="text-2xl font-bold min-w-[40px] text-center text-white tabular-nums">{quantity}</span>
                                <button
                                    className="w-12 h-12 flex items-center justify-center bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl text-white cursor-pointer transition-all hover:bg-[var(--theme-bg-tertiary)]"
                                    onClick={() => setQuantity(quantity + 1)}
                                    title="Increase quantity"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-[var(--theme-border)] mt-auto">
                        <button
                            className="w-full py-4 px-6 bg-[var(--color-gold)] text-black border-none rounded-lg text-sm font-bold flex items-center justify-center gap-3 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] uppercase tracking-[0.15em]"
                            onClick={handleConfirm}
                        >
                            <Check size={16} />
                            {editItem ? 'Update Cart' : 'Add to Cart'} &mdash; {formatPrice(totalPrice)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
