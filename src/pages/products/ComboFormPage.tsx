import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Plus, X, Save, ArrowLeft, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Product } from '../../types/database'
import { toast } from 'sonner'
import './ComboFormPage.css'

interface GroupItem {
    id?: string
    product_id: string
    product?: Product
    price_adjustment: number
    is_default: boolean
    sort_order: number
}

interface ComboGroup {
    id?: string
    group_name: string
    group_type: 'single' | 'multiple'
    is_required: boolean
    min_selections: number
    max_selections: number
    sort_order: number
    items: GroupItem[]
    expanded?: boolean
}

export default function ComboFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [comboPrice, setComboPrice] = useState<number>(0)
    const [isActive, setIsActive] = useState(true)
    const [availableAtPos, setAvailableAtPos] = useState(true)
    const [imageUrl, setImageUrl] = useState('')
    const [sortOrder, setSortOrder] = useState(0)
    const [groups, setGroups] = useState<ComboGroup[]>([])

    // Product selection
    const [products, setProducts] = useState<Product[]>([])
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null) // group index
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
        if (isEditing) {
            fetchCombo()
        }
    }, [id])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            if (data) setProducts(data)
        } catch (error) {
            logError('Error fetching products:', error)
            toast.error('Error loading products')
        }
    }

    const fetchCombo = async () => {
        if (!id) return

        setLoading(true)
        try {
            // Fetch combo
            const { data: comboData, error: comboError } = await supabase
                .from('product_combos')
                .select('*')
                .eq('id', id)
                .single()

            if (comboError) throw comboError

            if (comboData) {
                setName(comboData.name)
                setDescription(comboData.description || '')
                setComboPrice(comboData.combo_price ?? 0)
                setIsActive(comboData.is_active ?? true)
                setAvailableAtPos(comboData.available_at_pos ?? true)
                setImageUrl(comboData.image_url || '')
                setSortOrder(comboData.sort_order ?? 0)

                // Fetch groups with items
                const { data: groupsData, error: groupsError } = await supabase
                    .from('product_combo_groups')
                    .select('*')
                    .eq('combo_id', id)
                    .order('sort_order')

                if (groupsError) throw groupsError

                if (groupsData) {
                    const groupsWithItems = await Promise.all(
                        groupsData.map(async (group) => {
                            const { data: itemsData } = await supabase
                                .from('product_combo_group_items')
                                .select('*')
                                .eq('group_id', group.id)
                                .order('sort_order')

                            // Fetch product details for each item
                            type RawGroupItem = { id: string; product_id: string; price_adjustment?: number | null; is_default?: boolean | null; sort_order?: number | null };
                            const itemsWithProducts = await Promise.all((itemsData || []).map(async (item: RawGroupItem) => {
                                const { data: product } = await supabase
                                    .from('products')
                                    .select('*')
                                    .eq('id', item.product_id)
                                    .single()
                                return {
                                    ...item,
                                    product,
                                    price_adjustment: item.price_adjustment ?? 0,
                                    is_default: item.is_default ?? false,
                                    sort_order: item.sort_order ?? 0
                                }
                            }))

                            return {
                                id: group.id,
                                group_name: group.name ?? '',
                                group_type: (group.max_selections ?? 1) === 1 ? 'single' : 'multiple',
                                is_required: group.is_required ?? true,
                                min_selections: group.min_selections ?? 1,
                                max_selections: group.max_selections ?? 1,
                                sort_order: group.sort_order ?? 0,
                                items: itemsWithProducts,
                                expanded: true
                            } as ComboGroup
                        })
                    )
                    setGroups(groupsWithItems)
                }
            }
        } catch (error) {
            logError('Error fetching combo:', error)
            toast.error('Error loading combo')
        } finally {
            setLoading(false)
        }
    }

    const addGroup = () => {
        setGroups([...groups, {
            group_name: '',
            group_type: 'single',
            is_required: true,
            min_selections: 1,
            max_selections: 1,
            sort_order: groups.length,
            items: [],
            expanded: true
        }])
    }

    const removeGroup = (index: number) => {
        setGroups(groups.filter((_, i) => i !== index))
    }

    const updateGroup = (index: number, updates: Partial<ComboGroup>) => {
        const newGroups = [...groups]
        newGroups[index] = { ...newGroups[index], ...updates }
        setGroups(newGroups)
    }

    const toggleGroupExpanded = (index: number) => {
        const newGroups = [...groups]
        newGroups[index].expanded = !newGroups[index].expanded
        setGroups(newGroups)
    }

    const addProductToGroup = (groupIndex: number, product: Product) => {
        const group = groups[groupIndex]

        if (group.items.some(item => item.product_id === product.id)) {
            toast.error('This product is already in this group')
            return
        }

        const newGroups = [...groups]
        newGroups[groupIndex].items.push({
            product_id: product.id,
            product,
            price_adjustment: 0,
            is_default: group.items.length === 0, // First product = default
            sort_order: group.items.length
        })
        setGroups(newGroups)
        setShowProductSearch(null)
        setSearchTerm('')
    }

    const removeProductFromGroup = (groupIndex: number, itemIndex: number) => {
        const newGroups = [...groups]
        newGroups[groupIndex].items = newGroups[groupIndex].items.filter((_, i) => i !== itemIndex)
        setGroups(newGroups)
    }

    const updateGroupItem = (groupIndex: number, itemIndex: number, updates: Partial<GroupItem>) => {
        const newGroups = [...groups]
        newGroups[groupIndex].items[itemIndex] = {
            ...newGroups[groupIndex].items[itemIndex],
            ...updates
        }
        setGroups(newGroups)
    }

    const setAsDefault = (groupIndex: number, itemIndex: number) => {
        const newGroups = [...groups]
        // Unset all defaults in this group
        newGroups[groupIndex].items.forEach(item => item.is_default = false)
        // Set this one as default
        newGroups[groupIndex].items[itemIndex].is_default = true
        setGroups(newGroups)
    }

    const calculateMinPrice = () => {
        let min = comboPrice
        groups.forEach(group => {
            if (group.is_required && group.items.length > 0) {
                // Find cheapest option (or default)
                const defaultItem = group.items.find(item => item.is_default)
                const cheapest = group.items.reduce((min, item) =>
                    item.price_adjustment < min.price_adjustment ? item : min
                    , group.items[0])

                min += (defaultItem || cheapest).price_adjustment
            }
        })
        return min
    }

    const calculateMaxPrice = () => {
        let max = comboPrice
        groups.forEach(group => {
            if (group.group_type === 'single') {
                // For single selection, take most expensive
                const mostExpensive = group.items.reduce((max, item) =>
                    item.price_adjustment > max.price_adjustment ? item : max
                    , group.items[0] || { price_adjustment: 0 })
                max += mostExpensive.price_adjustment
            } else {
                // For multiple, sum up to max_selections of most expensive
                const sorted = [...group.items].sort((a, b) => b.price_adjustment - a.price_adjustment)
                const topItems = sorted.slice(0, group.max_selections)
                max += topItems.reduce((sum, item) => sum + item.price_adjustment, 0)
            }
        })
        return max
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!name.trim()) {
            toast.error('Combo name is required')
            return
        }

        if (comboPrice <= 0) {
            toast.error('Combo price must be greater than 0')
            return
        }

        if (groups.length === 0) {
            toast.error('Add at least one choice group')
            return
        }

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i]
            if (!group.group_name.trim()) {
                toast.error(`Group ${i + 1} name is required`)
                return
            }
            if (group.items.length === 0) {
                toast.error(`Group "${group.group_name}" must contain at least one product`)
                return
            }
            if (group.group_type === 'single' && group.max_selections !== 1) {
                toast.error(`Group "${group.group_name}" of type "single choice" must have max_selections = 1`)
                return
            }
            if (group.min_selections > group.max_selections) {
                toast.error(`Group "${group.group_name}": min_selections cannot be > max_selections`)
                return
            }
        }

        setSaving(true)
        try {
            if (isEditing) {
                // Update combo
                const { error: comboError } = await supabase
                    .from('product_combos')
                    .update({
                        name,
                        description: description || null,
                        combo_price: comboPrice,
                        is_active: isActive,
                        available_at_pos: availableAtPos,
                        image_url: imageUrl || null,
                        sort_order: sortOrder
                    } as never)
                    .eq('id', id!)

                if (comboError) throw comboError

                // Delete existing groups and items (cascade will handle items)
                const { error: deleteError } = await supabase
                    .from('product_combo_groups')
                    .delete()
                    .eq('combo_id', id!)

                if (deleteError) throw deleteError

                // Insert new groups and items
                await insertGroupsAndItems(id!)

                toast.success('Combo updated successfully')
            } else {
                // Create combo
                const { data: comboData, error: comboError } = await supabase
                    .from('product_combos')
                    .insert({
                        name,
                        description: description || null,
                        combo_price: comboPrice,
                        is_active: isActive,
                        available_at_pos: availableAtPos,
                        image_url: imageUrl || null,
                        sort_order: sortOrder
                    } as never)
                    .select()
                    .single()

                if (comboError) throw comboError

                await insertGroupsAndItems(comboData.id)

                toast.success('Combo created successfully')
            }

            navigate('/products/combos')
        } catch (error) {
            logError('Error saving combo:', error)
            toast.error('Error saving combo')
        } finally {
            setSaving(false)
        }
    }

    const insertGroupsAndItems = async (comboId: string) => {
        for (const group of groups) {
            // Insert group
            const { data: groupData, error: groupError } = await supabase
                .from('product_combo_groups')
                .insert({
                    combo_id: comboId,
                    name: group.group_name,
                    is_required: group.is_required,
                    min_selections: group.min_selections,
                    max_selections: group.max_selections,
                    sort_order: group.sort_order
                })
                .select()
                .single()

            if (groupError) throw groupError

            // Insert items
            if (group.items.length > 0) {
                const { error: itemsError } = await supabase
                    .from('product_combo_group_items')
                    .insert(
                        group.items.map(item => ({
                            group_id: groupData.id,
                            product_id: item.product_id,
                            price_adjustment: item.price_adjustment,
                            is_default: item.is_default,
                            sort_order: item.sort_order
                        }))
                    )

                if (itemsError) throw itemsError
            }
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const minPrice = calculateMinPrice()
    const maxPrice = calculateMaxPrice()

    if (loading) {
        return (
            <div className="combo-form-loading">
                <div className="spinner"></div>
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className="combo-form-page">
            <header className="combo-form-header">
                <button
                    type="button"
                    className="btn-back"
                    onClick={() => navigate('/products/combos')}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1>
                    <Box size={28} />
                    {isEditing ? 'Edit combo' : 'New combo'}
                </h1>
            </header>

            <form onSubmit={handleSubmit} className="combo-form">
                <div className="form-grid">
                    {/* Left column - General info */}
                    <div className="form-section">
                        <h2>General Information</h2>

                        <div className="form-group">
                            <label htmlFor="name">Combo Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Full Breakfast Pack"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Choose your drink and pastry..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="comboPrice">Base Price (IDR) *</label>
                            <input
                                id="comboPrice"
                                type="number"
                                value={comboPrice}
                                onChange={(e) => setComboPrice(Number(e.target.value))}
                                min="0"
                                step="1000"
                                required
                            />
                            <small>Surcharges will be added based on the customer's choices</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="imageUrl">Image URL</label>
                            <input
                                id="imageUrl"
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sortOrder">Display Order</label>
                            <input
                                id="sortOrder"
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Number(e.target.value))}
                                min="0"
                            />
                        </div>

                        <div className="form-group-horizontal">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <span>Active</span>
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={availableAtPos}
                                    onChange={(e) => setAvailableAtPos(e.target.checked)}
                                />
                                <span>Visible in POS</span>
                            </label>
                        </div>

                        {/* Price summary */}
                        {groups.length > 0 && (
                            <div className="pricing-preview">
                                <h3>Price Preview</h3>
                                <div className="price-range">
                                    <div className="price-item">
                                        <span>Minimum price:</span>
                                        <span className="price">{new Intl.NumberFormat('id-ID').format(minPrice)} IDR</span>
                                    </div>
                                    <div className="price-item">
                                        <span>Maximum price:</span>
                                        <span className="price highlight">{new Intl.NumberFormat('id-ID').format(maxPrice)} IDR</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column - Groups */}
                    <div className="form-section">
                        <div className="section-header">
                            <h2>Choice Groups</h2>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addGroup}
                            >
                                <Plus size={18} />
                                Add Group
                            </button>
                        </div>

                        <div className="groups-list">
                            {groups.length === 0 ? (
                                <div className="empty-state">
                                    <Box size={48} />
                                    <p>No group added</p>
                                    <small>Ex: "Drinks", "Pastries", "Sides"</small>
                                </div>
                            ) : (
                                groups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="group-card">
                                        <div className="group-header">
                                            <button
                                                type="button"
                                                className="group-expand"
                                                onClick={() => toggleGroupExpanded(groupIndex)}
                                            >
                                                {group.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                            <input
                                                type="text"
                                                className="group-name-input"
                                                value={group.group_name}
                                                onChange={(e) => updateGroup(groupIndex, { group_name: e.target.value })}
                                                placeholder="Group name (ex: Drinks)"
                                            />
                                            <button
                                                type="button"
                                                className="btn-icon danger"
                                                onClick={() => removeGroup(groupIndex)}
                                                title="Delete group"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {group.expanded && (
                                            <div className="group-body">
                                                <div className="group-settings">
                                                    <div className="form-group">
                                                        <label htmlFor={`group-type-${groupIndex}`}>Selection Type</label>
                                                        <select
                                                            id={`group-type-${groupIndex}`}
                                                            value={group.group_type}
                                                            onChange={(e) => {
                                                                const type = e.target.value as 'single' | 'multiple'
                                                                updateGroup(groupIndex, {
                                                                    group_type: type,
                                                                    max_selections: type === 'single' ? 1 : group.max_selections
                                                                })
                                                            }}
                                                        >
                                                            <option value="single">Single choice (1 option)</option>
                                                            <option value="multiple">Multiple choice</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={group.is_required}
                                                                onChange={(e) => updateGroup(groupIndex, { is_required: e.target.checked })}
                                                            />
                                                            <span>Required</span>
                                                        </label>
                                                    </div>

                                                    {group.group_type === 'multiple' && (
                                                        <div className="form-row">
                                                            <div className="form-group">
                                                                <label htmlFor={`min-sel-${groupIndex}`}>Min selections</label>
                                                                <input
                                                                    id={`min-sel-${groupIndex}`}
                                                                    type="number"
                                                                    value={group.min_selections}
                                                                    onChange={(e) => updateGroup(groupIndex, { min_selections: Number(e.target.value) })}
                                                                    min="0"
                                                                    title="Minimum number of selections"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor={`max-sel-${groupIndex}`}>Max selections</label>
                                                                <input
                                                                    id={`max-sel-${groupIndex}`}
                                                                    type="number"
                                                                    value={group.max_selections}
                                                                    onChange={(e) => updateGroup(groupIndex, { max_selections: Number(e.target.value) })}
                                                                    min="1"
                                                                    title="Maximum number of selections"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="group-items-header">
                                                    <h4>Available Options</h4>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm"
                                                        onClick={() => setShowProductSearch(groupIndex)}
                                                    >
                                                        <Plus size={16} />
                                                        Add
                                                    </button>
                                                </div>

                                                {showProductSearch === groupIndex && (
                                                    <div className="product-search">
                                                        <div className="search-input">
                                                            <Search size={18} />
                                                            <input
                                                                type="text"
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                placeholder="Search for a product..."
                                                                autoFocus
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowProductSearch(null)}
                                                                title="Close search"
                                                                aria-label="Close search"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="product-list">
                                                            {filteredProducts.map(product => (
                                                                <div
                                                                    key={product.id}
                                                                    className="product-item"
                                                                    onClick={() => addProductToGroup(groupIndex, product)}
                                                                >
                                                                    <span className="product-name">{product.name}</span>
                                                                    <span className="product-price">
                                                                        {new Intl.NumberFormat('id-ID').format(product.retail_price || 0)} IDR
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="group-items-list">
                                                    {group.items.length === 0 ? (
                                                        <div className="empty-items">
                                                            <small>No option added</small>
                                                        </div>
                                                    ) : (
                                                        group.items.map((item, itemIndex) => (
                                                            <div key={itemIndex} className="group-item">
                                                                <div className="item-info">
                                                                    <span className="item-name">
                                                                        {item.product?.name}
                                                                        {item.is_default && <span className="default-badge">Default</span>}
                                                                    </span>
                                                                    <div className="item-controls">
                                                                        <div className="price-adjustment">
                                                                            <label>Surcharge:</label>
                                                                            <input
                                                                                type="number"
                                                                                value={item.price_adjustment}
                                                                                onChange={(e) => updateGroupItem(groupIndex, itemIndex, { price_adjustment: Number(e.target.value) })}
                                                                                step="1000"
                                                                                placeholder="0"
                                                                            />
                                                                            <span>IDR</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-sm"
                                                                            onClick={() => setAsDefault(groupIndex, itemIndex)}
                                                                            disabled={item.is_default}
                                                                        >
                                                                            Default
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-icon danger"
                                                                            onClick={() => removeProductFromGroup(groupIndex, itemIndex)}
                                                                            title="Remove this product"
                                                                            aria-label="Remove this product"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/products/combos')}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="spinner-small"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {isEditing ? 'Update' : 'Create Combo'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

import { logError } from '@/utils/logger'