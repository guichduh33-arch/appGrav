import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Check } from 'lucide-react'
import type { Product } from '../../../types/database'
import { useCartStore } from '../../../stores/cartStore'
import { formatPrice } from '../../../utils/helpers'
import { useProductVariants, type IVariantGroup } from '../../../hooks/products/useProductVariants'
import { calculateCustomerPrice } from '@/services/sync/customerPricingService'
import type { IOfflineProduct } from '@/lib/db'
import type { ICustomerPriceResult } from '@/types/offline'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'

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
    const { addItem, addItemWithPricing, customerCategorySlug } = useCartStore()
    const { data: variantGroups = [], isLoading } = useProductVariants(baseProduct.id)
    const [hasCheckedVariants, setHasCheckedVariants] = useState(false)

    // Story 6.2: Customer pricing state
    const [customerPriceResult, setCustomerPriceResult] = useState<ICustomerPriceResult | null>(null)

    // Story 6.2: Calculate customer-specific price on mount or when category changes
    useEffect(() => {
        const fetchCustomerPrice = async () => {
            const offlineProduct: IOfflineProduct = {
                id: baseProduct.id,
                category_id: baseProduct.category_id || null,
                sku: baseProduct.sku || null,
                name: baseProduct.name,
                product_type: baseProduct.product_type || null,
                retail_price: baseProduct.retail_price || 0,
                wholesale_price: baseProduct.wholesale_price || null,
                cost_price: baseProduct.cost_price || null,
                current_stock: null,
                image_url: baseProduct.image_url || null,
                is_active: baseProduct.is_active ?? true,
                updated_at: baseProduct.updated_at || new Date().toISOString(),
                pos_visible: baseProduct.pos_visible ?? true,
                available_for_sale: baseProduct.available_for_sale ?? true,
            }

            try {
                const result = await calculateCustomerPrice(offlineProduct, customerCategorySlug)
                setCustomerPriceResult(result)
            } catch (error) {
                logError('[VariantModal] Error calculating customer price:', error)
                setCustomerPriceResult({
                    price: baseProduct.retail_price || 0,
                    priceType: 'retail',
                    savings: 0,
                    categoryName: null,
                })
            }
        }

        fetchCustomerPrice()
    }, [baseProduct, customerCategorySlug])

    useEffect(() => {
        if (!isLoading && !hasCheckedVariants && variantGroups.length === 0 && customerPriceResult) {
            setHasCheckedVariants(true)
            if (customerPriceResult.priceType !== 'retail') {
                addItemWithPricing(
                    baseProduct,
                    1,
                    [],
                    '',
                    customerPriceResult.price,
                    customerPriceResult.priceType,
                    customerPriceResult.savings
                )
            } else {
                addItem(baseProduct, 1, [], '', undefined)
            }
            toast.success(`Added ${baseProduct.name}`, { duration: 1500 })
            onClose()
        }
    }, [isLoading, hasCheckedVariants, variantGroups.length, baseProduct, addItem, addItemWithPricing, customerPriceResult, onClose])

    const [selections, setSelections] = useState<Record<string, string[]>>(() => {
        const initial: Record<string, string[]> = {}
        variantGroups.forEach(group => {
            const defaultOptions = group.options.filter(opt => opt.is_default)
            if (defaultOptions.length > 0) {
                initial[group.group_name] = defaultOptions.map(opt => opt.option_id)
            } else if (group.options.length > 0) {
                if (group.group_type === 'single') {
                    initial[group.group_name] = [group.options[0].option_id]
                } else {
                    initial[group.group_name] = []
                }
            }
        })
        return initial
    })

    const handleOptionSelect = (group: IVariantGroup, optionId: string) => {
        setSelections(prev => {
            if (group.group_type === 'single') {
                return { ...prev, [group.group_name]: [optionId] }
            } else {
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

    const totalPrice = useMemo(() => {
        let price = customerPriceResult?.price ?? (baseProduct.retail_price || 0)

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
    }, [customerPriceResult, baseProduct.retail_price, variantGroups, selections])

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

        const variantNote = selectedVariants
            .filter(v => v.optionLabels.length > 0)
            .map(v => `${v.groupName}: ${v.optionLabels.join(', ')}`)
            .join(' | ')

        if (customerPriceResult && customerPriceResult.priceType !== 'retail') {
            addItemWithPricing(
                baseProduct,
                1,
                [],
                variantNote,
                totalPrice,
                customerPriceResult.priceType,
                customerPriceResult.savings,
                selectedVariants
            )
        } else {
            const productWithAdjustedPrice = {
                ...baseProduct,
                retail_price: totalPrice
            }
            addItem(productWithAdjustedPrice, 1, [], variantNote, selectedVariants)
        }
        toast.success(`Added ${baseProduct.name}`, { duration: 1500 })
        onClose()
    }

    if (isLoading) {
        return (
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
                style={{ zIndex: 'var(--z-modal-backdrop)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div
                    className="relative bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] w-[500px] max-w-[90vw] text-white p-8 text-center"
                    style={{ zIndex: 'var(--z-modal)' }}
                >
                    Loading options...
                </div>
            </div>
        )
    }

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
            style={{ zIndex: 'var(--z-modal-backdrop)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col text-white w-[500px] max-w-[90vw]"
                style={{ zIndex: 'var(--z-modal)' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-[var(--space-lg)] border-b border-[var(--color-gray-700)]">
                    <div className="flex items-center gap-4">
                        {baseProduct.image_url && (
                            <img
                                src={baseProduct.image_url}
                                alt={baseProduct.name}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-white m-0">{baseProduct.name}</h3>
                            <p className="text-sm text-[var(--color-gray-400)] mt-1">Choose your options</p>
                        </div>
                    </div>
                    <button
                        className="w-10 h-10 flex items-center justify-center bg-transparent border-none rounded-lg text-[var(--color-gray-400)] cursor-pointer transition-all hover:bg-[var(--color-gray-700)] hover:text-white"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-[var(--space-lg)]">
                    {variantGroups.length === 0 ? (
                        <div className="text-center p-4 text-[var(--color-gray-400)]">
                            No options available for this product
                        </div>
                    ) : (
                        variantGroups.map(group => (
                            <div key={group.group_name} className="mb-6 last:mb-0">
                                <h4 className="text-sm font-semibold text-[var(--color-gray-400)] mb-3 uppercase tracking-[0.05em] flex items-center gap-2">
                                    {group.group_name}
                                    {group.group_required && <span className="text-destructive ml-1">*</span>}
                                    {group.group_type === 'multiple' && (
                                        <span className="text-xs font-normal ml-2 text-[var(--color-gray-500)]">
                                            (Multiple choice)
                                        </span>
                                    )}
                                </h4>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                                    {group.options.map(option => {
                                        const isSelected = (selections[group.group_name] || []).includes(option.option_id)
                                        return (
                                            <button
                                                key={option.option_id}
                                                className={cn(
                                                    'flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[80px]',
                                                    isSelected
                                                        ? 'border-gold bg-gold/15 text-white'
                                                        : 'border-[var(--color-gray-600)] bg-[var(--color-gray-900)] text-[var(--color-gray-300)] hover:border-gold/50 hover:bg-[var(--color-gray-800)]'
                                                )}
                                                onClick={() => handleOptionSelect(group, option.option_id)}
                                            >
                                                <span className="text-[0.9rem] font-semibold text-center">{option.option_label}</span>
                                                {option.price_adjustment !== 0 && (
                                                    <span className={cn(
                                                        'text-xs font-medium',
                                                        isSelected ? 'text-gold' : 'text-[var(--color-gray-400)]'
                                                    )}>
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

                    {/* Total Price */}
                    <div className="flex justify-between items-center p-4 bg-[var(--color-gray-900)] border border-[var(--color-gray-700)] rounded-xl mt-4">
                        <span className="text-[var(--color-gray-300)] text-lg">Total price:</span>
                        <strong className="text-xl font-bold text-gold">{formatPrice(totalPrice)}</strong>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-[var(--space-lg)] border-t border-[var(--color-gray-700)] bg-[var(--color-gray-800)] rounded-b-2xl">
                    <button
                        className="w-full h-14 px-6 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white border-none rounded-xl text-lg font-bold flex items-center justify-center gap-3 cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(201,165,92,0.3)] hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddToCart}
                        disabled={!isValidSelection}
                    >
                        <Check size={18} />
                        Add to cart {'\u00B7'} {formatPrice(totalPrice)}
                    </button>
                </div>
            </div>
        </div>
    )
}
