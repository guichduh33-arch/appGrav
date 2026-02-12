import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '../../../lib/supabase'
import { formatCurrency } from '../../../utils/helpers'
import {
    ProductCombo,
    ProductComboGroup,
    ProductComboGroupItem,
    Product
} from '../../../types/database'

interface GroupItemWithProduct extends ProductComboGroupItem {
    product: Product
}

interface ComboGroupWithItems extends ProductComboGroup {
    items: GroupItemWithProduct[]
}

interface ComboWithGroups extends ProductCombo {
    groups: ComboGroupWithItems[]
}

interface SelectedItem {
    group_id: string
    group_name: string
    item_id: string
    product_id: string
    product_name: string
    price_adjustment: number
}

interface ComboSelectorModalProps {
    comboId: string
    onClose: () => void
    onConfirm: (combo: ComboWithGroups, selectedItems: SelectedItem[], totalPrice: number) => void
}

export default function ComboSelectorModal({ comboId, onClose, onConfirm }: ComboSelectorModalProps) {
    const [combo, setCombo] = useState<ComboWithGroups | null>(null)
    const [loading, setLoading] = useState(true)
    const [selections, setSelections] = useState<Map<string, Set<string>>>(new Map())
    const [error, setError] = useState<string>('')

    useEffect(() => {
        fetchCombo()
    }, [comboId])

    const fetchCombo = async () => {
        try {
            setLoading(true)

            // Fetch combo
            const { data: comboData, error: comboError } = await supabase
                .from('product_combos')
                .select('*')
                .eq('id', comboId)
                .single()

            if (comboError) throw comboError

            // Fetch groups
            const { data: groupsData, error: groupsError } = await supabase
                .from('product_combo_groups')
                .select('*')
                .eq('combo_id', comboId)
                .order('sort_order', { ascending: true })

            if (groupsError) throw groupsError

            const groups = (groupsData || []) as ProductComboGroup[]

            // Fetch items for each group
            const groupsWithItems = await Promise.all(
                groups.map(async (group: ProductComboGroup) => {
                    const { data: itemsData } = await supabase
                        .from('product_combo_group_items')
                        .select(`
                            *,
                            product:products(*)
                        `)
                        .eq('group_id', group.id)
                        .order('sort_order', { ascending: true })

                    return {
                        ...group,
                        items: (itemsData || []) as unknown as GroupItemWithProduct[]
                    }
                })
            )

            const comboWithGroups: ComboWithGroups = {
                ...(comboData as ProductCombo),
                groups: groupsWithItems
            }

            setCombo(comboWithGroups)

            // Initialize selections with default items
            const initialSelections = new Map<string, Set<string>>()
            groupsWithItems.forEach((group: ComboGroupWithItems) => {
                const defaultItem = group.items.find((item: GroupItemWithProduct) => item.is_default)
                if (defaultItem && group.is_required) {
                    initialSelections.set(group.id, new Set([defaultItem.id]))
                }
            })
            setSelections(initialSelections)

        } catch (err) {
            console.error('Error fetching combo:', err)
            setError('Error loading combo')
        } finally {
            setLoading(false)
        }
    }

    const handleItemSelect = (group: ComboGroupWithItems, itemId: string) => {
        const newSelections = new Map(selections)
        const groupSelections = newSelections.get(group.id) || new Set<string>()

        // Single selection if max_selections is 1, otherwise multiple
        const isSingleSelection = (group.max_selections ?? 1) === 1
        if (isSingleSelection) {
            // Single selection: replace current selection
            newSelections.set(group.id, new Set([itemId]))
        } else {
            // Multiple selection: toggle item
            if (groupSelections.has(itemId)) {
                groupSelections.delete(itemId)
            } else {
                // Check max selections
                if (groupSelections.size >= (group.max_selections ?? 1)) {
                    setError(`Maximum ${group.max_selections ?? 1} selection(s) for ${group.name}`)
                    setTimeout(() => setError(''), 3000)
                    return
                }
                groupSelections.add(itemId)
            }
            newSelections.set(group.id, groupSelections)
        }

        setSelections(newSelections)
        setError('')
    }

    const isItemSelected = (groupId: string, itemId: string): boolean => {
        const groupSelections = selections.get(groupId)
        return groupSelections ? groupSelections.has(itemId) : false
    }

    const calculateTotalPrice = (): number => {
        if (!combo) return 0

        let total = combo.combo_price

        combo.groups.forEach(group => {
            const groupSelections = selections.get(group.id)
            if (groupSelections) {
                groupSelections.forEach(itemId => {
                    const item = group.items.find(i => i.id === itemId)
                    if (item) {
                        total += item.price_adjustment ?? 0
                    }
                })
            }
        })

        return total
    }

    const validateSelections = (): string | null => {
        if (!combo) return 'Combo not loaded'

        for (const group of combo.groups) {
            const groupSelections = selections.get(group.id) || new Set()

            if (group.is_required && groupSelections.size === 0) {
                return `Please choose an option for ${group.name}`
            }

            // Multi-selection validation
            const isMultiSelection = (group.max_selections ?? 1) > 1
            if (isMultiSelection) {
                if (groupSelections.size < (group.min_selections ?? 0)) {
                    return `Minimum ${group.min_selections ?? 0} selection(s) for ${group.name}`
                }
                if (groupSelections.size > (group.max_selections ?? 1)) {
                    return `Maximum ${group.max_selections ?? 1} selection(s) for ${group.name}`
                }
            }
        }

        return null
    }

    const handleConfirm = () => {
        const validationError = validateSelections()
        if (validationError) {
            setError(validationError)
            return
        }

        if (!combo) return

        // Build selected items array
        const selectedItems: SelectedItem[] = []
        combo.groups.forEach(group => {
            const groupSelections = selections.get(group.id)
            if (groupSelections) {
                groupSelections.forEach(itemId => {
                    const item = group.items.find(i => i.id === itemId)
                    if (item && item.product) {
                        selectedItems.push({
                            group_id: group.id,
                            group_name: group.name,
                            item_id: item.id,
                            product_id: item.product_id,
                            product_name: item.product.name,
                            price_adjustment: item.price_adjustment ?? 0
                        })
                    }
                })
            }
        })

        const totalPrice = calculateTotalPrice()
        onConfirm(combo, selectedItems, totalPrice)
    }

    if (loading) {
        return (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
                <div className="flex w-full max-w-[800px] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] max-md:max-h-[95vh] max-md:rounded-t-2xl max-md:rounded-b-none">
                    <div className="flex flex-col items-center justify-center gap-4 px-8 py-16">
                        <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-indigo-500" />
                        <span className="text-[0.95rem] text-slate-500">Loading combo...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!combo) {
        return (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
                <div className="flex w-full max-w-[800px] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] max-md:max-h-[95vh] max-md:rounded-t-2xl max-md:rounded-b-none">
                    <div className="flex flex-col items-center justify-center gap-4 px-8 py-16">
                        <p className="m-0 text-base text-slate-500">Combo not found</p>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const totalPrice = calculateTotalPrice()

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex w-full max-w-[800px] max-h-[90vh] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] max-md:max-h-[95vh] max-md:rounded-t-2xl max-md:rounded-b-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b-2 border-slate-200 p-6 max-md:p-4">
                    <div>
                        <h2 className="m-0 text-2xl font-bold text-slate-800 max-md:text-xl">{combo.name}</h2>
                        {combo.description && (
                            <p className="mt-2 text-[0.9rem] text-slate-500">{combo.description}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-800"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="border-l-4 border-red-500 bg-red-50 px-6 py-4 text-[0.9rem] font-medium text-red-800">
                        {error}
                    </div>
                )}

                {/* Groups */}
                <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6 max-md:gap-6 max-md:p-4">
                    {combo.groups.map((group) => {
                        return (
                            <div key={group.id} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="m-0 flex items-center gap-2 text-lg font-semibold text-slate-800">
                                        {group.name}
                                        {group.is_required && <span className="text-xl font-bold text-red-500">*</span>}
                                        {!group.is_required && <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Optional</span>}
                                    </h3>
                                    {(group.max_selections ?? 1) > 1 && (
                                        <span className="text-[0.85rem] font-medium text-slate-500">
                                            {group.min_selections === group.max_selections
                                                ? `Choose ${group.min_selections}`
                                                : `Choose ${group.min_selections ?? 0}-${group.max_selections}`}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 max-md:grid-cols-1">
                                    {group.items.map((item) => {
                                        if (!item.product) return null

                                        const isSelected = isItemSelected(group.id, item.id)

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={cn(
                                                    'flex items-center rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition-all duration-200 cursor-pointer hover:border-indigo-500 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(99,102,241,0.1)]',
                                                    isSelected && 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
                                                )}
                                                onClick={() => handleItemSelect(group, item.id)}
                                            >
                                                <div className="flex flex-1 items-center justify-between gap-4">
                                                    <div className="flex flex-1 flex-col gap-1">
                                                        <span className="text-base font-medium text-slate-800">
                                                            {item.product.name}
                                                        </span>
                                                        {(item.price_adjustment ?? 0) !== 0 && (
                                                            <span className={cn(
                                                                'text-sm font-semibold',
                                                                (item.price_adjustment ?? 0) > 0 ? 'text-emerald-600' : 'text-red-600'
                                                            )}>
                                                                {(item.price_adjustment ?? 0) > 0 ? '+' : ''}
                                                                {formatCurrency(item.price_adjustment ?? 0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                                                            <Check size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 border-t-2 border-slate-200 bg-slate-50 p-6 max-md:flex-col max-md:items-stretch max-md:p-4">
                    <div className="flex flex-col gap-1 max-md:text-center">
                        <span className="text-sm font-medium text-slate-500">Total:</span>
                        <span className="text-[1.75rem] font-bold text-emerald-500">{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex gap-3 max-md:w-full max-md:flex-col">
                        <button
                            type="button"
                            className="btn btn-secondary max-md:w-full max-md:justify-center"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary max-md:w-full max-md:justify-center"
                            onClick={handleConfirm}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
