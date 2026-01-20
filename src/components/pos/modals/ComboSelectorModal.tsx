import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { formatCurrency } from '../../../utils/helpers'
import {
    ProductCombo,
    ProductComboGroup,
    ProductComboGroupItem,
    Product
} from '../../../types/database'
import './ComboSelectorModal.css'

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

            const groups = groupsData || []

            // Fetch items for each group
            const groupsWithItems = await Promise.all(
                groups.map(async (group) => {
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
                        items: itemsData || []
                    }
                })
            )

            const comboWithGroups: ComboWithGroups = {
                ...comboData,
                groups: groupsWithItems
            }

            setCombo(comboWithGroups)

            // Initialize selections with default items
            const initialSelections = new Map<string, Set<string>>()
            groupsWithItems.forEach(group => {
                const defaultItem = group.items.find(item => item.is_default)
                if (defaultItem && group.is_required) {
                    initialSelections.set(group.id, new Set([defaultItem.id]))
                }
            })
            setSelections(initialSelections)

        } catch (err) {
            console.error('Error fetching combo:', err)
            setError('Erreur lors du chargement du combo')
        } finally {
            setLoading(false)
        }
    }

    const handleItemSelect = (group: ComboGroupWithItems, itemId: string) => {
        const newSelections = new Map(selections)
        const groupSelections = newSelections.get(group.id) || new Set<string>()

        if (group.group_type === 'single') {
            // Single selection: replace current selection
            newSelections.set(group.id, new Set([itemId]))
        } else {
            // Multiple selection: toggle item
            if (groupSelections.has(itemId)) {
                groupSelections.delete(itemId)
            } else {
                // Check max selections
                if (groupSelections.size >= group.max_selections) {
                    setError(`Maximum ${group.max_selections} sélection(s) pour ${group.group_name}`)
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
                        total += item.price_adjustment
                    }
                })
            }
        })

        return total
    }

    const validateSelections = (): string | null => {
        if (!combo) return 'Combo non chargé'

        for (const group of combo.groups) {
            const groupSelections = selections.get(group.id) || new Set()

            if (group.is_required && groupSelections.size === 0) {
                return `Veuillez choisir une option pour ${group.group_name}`
            }

            if (group.group_type === 'multiple') {
                if (groupSelections.size < group.min_selections) {
                    return `Minimum ${group.min_selections} sélection(s) pour ${group.group_name}`
                }
                if (groupSelections.size > group.max_selections) {
                    return `Maximum ${group.max_selections} sélection(s) pour ${group.group_name}`
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
                            group_name: group.group_name,
                            item_id: item.id,
                            product_id: item.product_id,
                            product_name: item.product.name,
                            price_adjustment: item.price_adjustment
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
            <div className="combo-modal-overlay">
                <div className="combo-modal">
                    <div className="combo-modal-loading">
                        <div className="spinner"></div>
                        <span>Chargement du combo...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!combo) {
        return (
            <div className="combo-modal-overlay">
                <div className="combo-modal">
                    <div className="combo-modal-error">
                        <p>Combo introuvable</p>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const totalPrice = calculateTotalPrice()

    return (
        <div className="combo-modal-overlay" onClick={onClose}>
            <div className="combo-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="combo-modal-header">
                    <div>
                        <h2>{combo.name}</h2>
                        {combo.description && (
                            <p className="combo-description">{combo.description}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Fermer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="combo-error-banner">
                        {error}
                    </div>
                )}

                {/* Groups */}
                <div className="combo-modal-body">
                    {combo.groups.map((group) => {
                        const groupSelections = selections.get(group.id) || new Set()

                        return (
                            <div key={group.id} className="combo-group">
                                <div className="combo-group-header">
                                    <h3>
                                        {group.group_name}
                                        {group.is_required && <span className="required-badge">*</span>}
                                        {!group.is_required && <span className="optional-badge">Optionnel</span>}
                                    </h3>
                                    {group.group_type === 'multiple' && (
                                        <span className="selection-hint">
                                            {group.min_selections === group.max_selections
                                                ? `Choisir ${group.min_selections}`
                                                : `Choisir ${group.min_selections}-${group.max_selections}`}
                                        </span>
                                    )}
                                </div>

                                <div className="combo-group-items">
                                    {group.items.map((item) => {
                                        if (!item.product) return null

                                        const isSelected = isItemSelected(group.id, item.id)

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`combo-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleItemSelect(group, item.id)}
                                            >
                                                <div className="combo-item-content">
                                                    <div className="combo-item-info">
                                                        <span className="combo-item-name">
                                                            {item.product.name}
                                                        </span>
                                                        {item.price_adjustment !== 0 && (
                                                            <span className={`combo-item-price ${item.price_adjustment > 0 ? 'extra' : 'discount'}`}>
                                                                {item.price_adjustment > 0 ? '+' : ''}
                                                                {formatCurrency(item.price_adjustment)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="combo-item-check">
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
                <div className="combo-modal-footer">
                    <div className="combo-total">
                        <span className="combo-total-label">Total:</span>
                        <span className="combo-total-price">{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="combo-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleConfirm}
                        >
                            Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
