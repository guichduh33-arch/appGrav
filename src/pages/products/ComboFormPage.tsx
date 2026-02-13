import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Plus, X, Save, ArrowLeft, Search, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Product } from '../../types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'
import { logError } from '@/utils/logger'

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
        <div className="p-8 max-w-[1200px] mx-auto md:p-4 font-body">
            <header className="flex items-center gap-4 mb-8">
                <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] transition-all hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--color-gold)] shadow-sm"
                    onClick={() => navigate('/products/combos')}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <h1 className="font-display text-3xl font-semibold text-[var(--theme-text-primary)] m-0 flex items-center gap-3">
                        <Box size={28} className="text-[var(--color-gold)]" />
                        {isEditing ? 'Curate Artisan Combo' : 'Craft New Combo'}
                    </h1>
                    <p className="text-[var(--theme-text-secondary)] text-sm opacity-60 mt-1">
                        Design a premium bundle experience for your customers
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-[1fr_400px] gap-8 xl:grid-cols-1">
                    {/* Left column - General info */}
                    <div className="space-y-8">
                        <div className="bg-[var(--theme-bg-secondary)] rounded-2xl p-8 border border-[var(--theme-border)] shadow-sm">
                            <h2 className="flex items-center gap-3 font-display text-xl font-semibold text-[var(--theme-text-primary)] m-0 mb-8 pb-4 border-b border-[var(--theme-border)]">
                                <Box size={20} className="text-[var(--color-gold)]" /> General Curation
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-semibold text-[var(--theme-text-secondary)]">Combo Identity *</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Name your curated bundle (e.g., Parisian Breakfast)"
                                        className="w-full px-5 py-3.5 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] placeholder:opacity-30"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-semibold text-[var(--theme-text-secondary)]">Experience Description</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the artisan choices available in this set..."
                                        rows={4}
                                        className="w-full px-5 py-3.5 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] placeholder:opacity-30 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                                    <div className="space-y-2">
                                        <label htmlFor="comboPrice" className="text-sm font-semibold text-[var(--theme-text-secondary)]">Artisan Base Price (IDR) *</label>
                                        <div className="relative">
                                            <input
                                                id="comboPrice"
                                                type="number"
                                                value={comboPrice}
                                                onChange={(e) => setComboPrice(Number(e.target.value))}
                                                min="0"
                                                step="1000"
                                                className="w-full px-5 py-3.5 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                required
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] font-bold text-xs pointer-events-none">IDR</div>
                                        </div>
                                        <p className="text-[0.7rem] text-[var(--theme-text-muted)] mt-1 opacity-70 italic">Surcharges from specific artisan choices will be added</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="sortOrder" className="text-sm font-semibold text-[var(--theme-text-secondary)]">Display Hierarchy</label>
                                        <input
                                            id="sortOrder"
                                            type="number"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(Number(e.target.value))}
                                            min="0"
                                            className="w-full px-5 py-3.5 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="imageUrl" className="text-sm font-semibold text-[var(--theme-text-secondary)]">Signature Reveal (Image URL)</label>
                                    <input
                                        id="imageUrl"
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://artisan-bakery.com/combos/revealed.jpg"
                                        className="w-full px-5 py-3.5 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] placeholder:opacity-30"
                                    />
                                </div>

                                <div className="flex gap-10 pt-4 md:flex-col md:gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={cn(
                                            "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                                            isActive ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-white shadow-[0_2px_8px_rgba(201,165,92,0.4)]" : "bg-transparent border-[var(--theme-border)] group-hover:border-[var(--color-gold-light)]"
                                        )}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                            />
                                            {isActive && <Save size={14} strokeWidth={3} />}
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--theme-text-primary)]">Acitvate Set</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={cn(
                                            "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                                            availableAtPos ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-white shadow-[0_2px_8px_rgba(201,165,92,0.4)]" : "bg-transparent border-[var(--theme-border)] group-hover:border-[var(--color-gold-light)]"
                                        )}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={availableAtPos}
                                                onChange={(e) => setAvailableAtPos(e.target.checked)}
                                            />
                                            {availableAtPos && <Box size={14} strokeWidth={3} />}
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--theme-text-primary)]">Show in POS Display</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Price summary box */}
                        {groups.length > 0 && (
                            <div className="bg-gradient-to-br from-[var(--theme-bg-secondary)] to-[var(--theme-bg-tertiary)] rounded-2xl p-8 border border-[var(--color-gold)]/20 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                <h3 className="font-display font-bold text-[var(--color-gold)] uppercase tracking-widest text-[0.7rem] mb-6 flex items-center gap-2">
                                    <Save size={14} /> Artisan Price Preview
                                </h3>
                                <div className="grid grid-cols-2 gap-8 md:grid-cols-1">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[var(--theme-text-muted)] text-[0.65rem] uppercase tracking-widest font-bold">Minimum Curated Price</span>
                                        <span className="text-3xl font-display font-bold text-[var(--theme-text-primary)]">{formatCurrency(minPrice)}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[var(--theme-text-muted)] text-[0.65rem] uppercase tracking-widest font-bold">Peak Curated Value</span>
                                        <span className="text-3xl font-display font-bold text-[var(--color-gold)]">{formatCurrency(maxPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column - Groups */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-display font-semibold text-xl text-[var(--theme-text-primary)] m-0">Artisan Curation Groups</h2>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 py-2 px-5 rounded-lg font-body text-xs font-bold uppercase tracking-widest transition-all border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white"
                                onClick={addGroup}
                            >
                                <Plus size={16} />
                                Add Selection Group
                            </button>
                        </div>

                        <div className="space-y-6">
                            {groups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-16 bg-[var(--theme-bg-secondary)]/50 rounded-2xl border-2 border-dashed border-[var(--theme-border)] text-[var(--theme-text-muted)] text-center">
                                    <div className="w-16 h-16 rounded-full bg-[var(--theme-bg-tertiary)] flex items-center justify-center mb-6 opacity-30">
                                        <Plus size={32} />
                                    </div>
                                    <h4 className="text-lg font-display font-semibold mb-2">Build Your First Collection</h4>
                                    <p className="text-sm max-w-xs opacity-60">Add artisanal groups like "Morning Pastries" or "Select Beverage" to build your bundle.</p>
                                </div>
                            ) : (
                                groups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="bg-[var(--theme-bg-secondary)] rounded-2xl border border-[var(--theme-border)] overflow-hidden transition-all hover:border-[var(--color-gold-light)]/40 shadow-sm">
                                        <div className="flex items-center gap-4 px-6 py-4 bg-[var(--theme-bg-tertiary)] border-b border-[var(--theme-border)]">
                                            <button
                                                type="button"
                                                className="text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] transition-colors p-1"
                                                onClick={() => toggleGroupExpanded(groupIndex)}
                                            >
                                                {group.expanded ? <ChevronUp size={22} strokeWidth={2.5} /> : <ChevronDown size={22} strokeWidth={2.5} />}
                                            </button>
                                            <input
                                                type="text"
                                                className="flex-1 bg-transparent border-none text-[var(--theme-text-primary)] font-display font-bold text-lg outline-none placeholder:opacity-20"
                                                value={group.group_name}
                                                onChange={(e) => updateGroup(groupIndex, { group_name: e.target.value })}
                                                placeholder="Group Selection Name (e.g., Choice of Sourdough)"
                                            />
                                            <button
                                                type="button"
                                                className="text-[var(--theme-text-muted)] hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/5"
                                                onClick={() => removeGroup(groupIndex)}
                                                title="Dissolve group"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        {group.expanded && (
                                            <div className="p-8 space-y-8">
                                                <div className="bg-[var(--theme-bg-tertiary)]/50 rounded-xl p-6 border border-[var(--theme-border)] grid grid-cols-2 gap-8 md:grid-cols-1">
                                                    <div className="space-y-4">
                                                        <label htmlFor={`group-type-${groupIndex}`} className="text-[0.7rem] uppercase tracking-widest font-bold text-[var(--theme-text-muted)] block">Curation Type</label>
                                                        <select
                                                            id={`group-type-${groupIndex}`}
                                                            value={group.group_type}
                                                            className="w-full px-4 py-3 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none focus:border-[var(--color-gold)]"
                                                            onChange={(e) => {
                                                                const type = e.target.value as 'single' | 'multiple'
                                                                updateGroup(groupIndex, {
                                                                    group_type: type,
                                                                    max_selections: type === 'single' ? 1 : group.max_selections
                                                                })
                                                            }}
                                                        >
                                                            <option value="single">Single Choice (Artisanal Default)</option>
                                                            <option value="multiple">Multiple Artisan Selections</option>
                                                        </select>
                                                        <label className="flex items-center gap-3 cursor-pointer mt-4">
                                                            <div className={cn(
                                                                "w-5 h-5 rounded border transition-all flex items-center justify-center",
                                                                group.is_required ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-white" : "bg-transparent border-[var(--theme-border)]"
                                                            )}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={group.is_required}
                                                                    onChange={(e) => updateGroup(groupIndex, { is_required: e.target.checked })}
                                                                />
                                                                {group.is_required && <Plus size={12} strokeWidth={4} />}
                                                            </div>
                                                            <span className="text-sm font-medium text-[var(--theme-text-secondary)]">Required Collection</span>
                                                        </label>
                                                    </div>

                                                    {group.group_type === 'multiple' && (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label htmlFor={`min-sel-${groupIndex}`} className="text-[0.7rem] uppercase tracking-widest font-bold text-[var(--theme-text-muted)] block">Min Range</label>
                                                                <input
                                                                    id={`min-sel-${groupIndex}`}
                                                                    type="number"
                                                                    value={group.min_selections}
                                                                    onChange={(e) => updateGroup(groupIndex, { min_selections: Number(e.target.value) })}
                                                                    min="0"
                                                                    className="w-full px-4 py-3 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none focus:border-[var(--color-gold)]"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label htmlFor={`max-sel-${groupIndex}`} className="text-[0.7rem] uppercase tracking-widest font-bold text-[var(--theme-text-muted)] block">Max Range</label>
                                                                <input
                                                                    id={`max-sel-${groupIndex}`}
                                                                    type="number"
                                                                    value={group.max_selections}
                                                                    onChange={(e) => updateGroup(groupIndex, { max_selections: Number(e.target.value) })}
                                                                    min="1"
                                                                    className="w-full px-4 py-3 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text-primary)] outline-none focus:border-[var(--color-gold)]"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-display font-bold text-sm tracking-wide text-[var(--theme-text-primary)] m-0">Avaliable Curation Options</h4>
                                                        <button
                                                            type="button"
                                                            className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                                                            onClick={() => setShowProductSearch(groupIndex)}
                                                        >
                                                            <Search size={14} /> Add Product
                                                        </button>
                                                    </div>

                                                    {showProductSearch === groupIndex && (
                                                        <div className="bg-[var(--theme-bg-tertiary)] border border-[var(--color-gold)]/30 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                                                            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--theme-border)]">
                                                                <Search size={18} className="text-[var(--color-gold)] opacity-50" />
                                                                <input
                                                                    type="text"
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    placeholder="Search artisan catalog..."
                                                                    autoFocus
                                                                    className="flex-1 bg-transparent border-none text-[var(--theme-text-primary)] outline-none placeholder:opacity-20"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="p-1 hover:bg-[var(--theme-bg-secondary)] rounded-md transition-colors"
                                                                    onClick={() => setShowProductSearch(null)}
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                            <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin">
                                                                {filteredProducts.map(product => (
                                                                    <div
                                                                        key={product.id}
                                                                        className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--color-gold)]/10 cursor-pointer group transition-colors"
                                                                        onClick={() => addProductToGroup(groupIndex, product)}
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-semibold text-sm text-[var(--theme-text-primary)] group-hover:text-[var(--color-gold)]">{product.name}</span>
                                                                            <span className="text-[0.65rem] opacity-40 uppercase tracking-tighter">SKU: {product.sku || 'N/A'}</span>
                                                                        </div>
                                                                        <span className="text-xs font-bold text-[var(--theme-text-secondary)]">{formatCurrency(product.retail_price || 0)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4">
                                                        {group.items.length === 0 ? (
                                                            <div className="py-10 text-center opacity-30 italic text-sm">No artisan options revealed in this group.</div>
                                                        ) : (
                                                            group.items.map((item, itemIndex) => (
                                                                <div key={itemIndex} className="bg-[var(--theme-bg-tertiary)] p-5 rounded-xl border border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-6 hover:border-[var(--theme-border-strong)] transition-all">
                                                                    <div className="flex items-center gap-4 flex-1">
                                                                        <div className="w-10 h-10 rounded-lg bg-[var(--theme-bg-secondary)] flex items-center justify-center text-[var(--color-gold)] shadow-inner">
                                                                            <Package size={20} />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="font-semibold text-[var(--theme-text-primary)]">{item.product?.name}</span>
                                                                                {item.is_default && (
                                                                                    <span className="px-2 py-0.5 rounded bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 text-[var(--color-gold)] text-[0.6rem] font-black uppercase tracking-widest">Master Default</span>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-[0.7rem] text-[var(--theme-text-muted)] opacity-60">Base value: {formatCurrency(item.product?.retail_price || 0)}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-6">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <span className="text-[0.6rem] uppercase tracking-widest font-black text-[var(--theme-text-muted)]">Premium Surcharge</span>
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.price_adjustment}
                                                                                    onChange={(e) => updateGroupItem(groupIndex, itemIndex, { price_adjustment: Number(e.target.value) })}
                                                                                    step="500"
                                                                                    className="w-24 px-3 py-1.5 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-lg text-xs font-bold text-[var(--theme-text-primary)] focus:border-[var(--color-gold)] outline-none"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                className={cn(
                                                                                    "px-3 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all",
                                                                                    item.is_default
                                                                                        ? "bg-[var(--color-gold)] text-white shadow-[0_2px_8px_rgba(201,165,92,0.3)]"
                                                                                        : "bg-[var(--theme-bg-secondary)] text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] border border-[var(--theme-border)]"
                                                                                )}
                                                                                onClick={() => setAsDefault(groupIndex, itemIndex)}
                                                                                disabled={item.is_default}
                                                                            >
                                                                                {item.is_default ? 'Default' : 'Set Default'}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="p-2 text-[var(--theme-text-muted)] hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                                                                onClick={() => removeProductFromGroup(groupIndex, itemIndex)}
                                                                            >
                                                                                <X size={18} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-5 pt-8 border-t border-[var(--theme-border)] sticky bottom-0 bg-[var(--theme-bg-primary)]/80 backdrop-blur-md pb-8 z-40">
                    <button
                        type="button"
                        className="py-3 px-10 rounded-xl font-body text-sm font-semibold border-2 border-[var(--theme-border)] bg-transparent text-[var(--theme-text-primary)] transition-all hover:bg-[var(--theme-bg-tertiary)] active:scale-[0.98]"
                        onClick={() => navigate('/products/combos')}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-3 py-3 px-14 rounded-xl font-body text-sm font-bold border-2 border-transparent transition-all duration-[300ms] bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[0_10px_30px_rgba(201,165,92,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(201,165,92,0.4)] disabled:opacity-50 active:scale-[0.98]"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Curating...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>{isEditing ? 'Commit Update' : 'Initialize Combo'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}