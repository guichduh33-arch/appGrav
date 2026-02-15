import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Product } from '../../types/database'
import { toast } from 'sonner'
import { logError } from '@/utils/logger'

import ComboFormGeneral from './combo-form/ComboFormGeneral'
import ComboFormPricePreview from './combo-form/ComboFormPricePreview'
import ComboFormGroupEditor from './combo-form/ComboFormGroupEditor'

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
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [comboPrice, setComboPrice] = useState<number>(0)
    const [isActive, setIsActive] = useState(true)
    const [availableAtPos, setAvailableAtPos] = useState(true)
    const [imageUrl, setImageUrl] = useState('')
    const [sortOrder, setSortOrder] = useState(0)
    const [availableFrom, setAvailableFrom] = useState('')
    const [availableTo, setAvailableTo] = useState('')
    const [groups, setGroups] = useState<ComboGroup[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
        if (isEditing) fetchCombo()
    }, [id])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('name')
            if (error) throw error
            if (data) setProducts(data)
        } catch (error) { logError('Error fetching products:', error); toast.error('Error loading products') }
    }

    const fetchCombo = async () => {
        if (!id) return
        setLoading(true)
        try {
            const { data: comboData, error: comboError } = await supabase.from('product_combos').select('*').eq('id', id).single()
            if (comboError) throw comboError
            if (comboData) {
                setName(comboData.name); setDescription(comboData.description || '')
                setComboPrice(comboData.combo_price ?? 0); setIsActive(comboData.is_active ?? true)
                setAvailableAtPos(comboData.available_at_pos ?? true); setImageUrl(comboData.image_url || '')
                setSortOrder(comboData.sort_order ?? 0)
                setAvailableFrom(comboData.available_from || ''); setAvailableTo(comboData.available_to || '')

                const { data: groupsData, error: groupsError } = await supabase
                    .from('product_combo_groups').select('*').eq('combo_id', id).order('sort_order')
                if (groupsError) throw groupsError
                if (groupsData) {
                    const groupsWithItems = await Promise.all(
                        groupsData.map(async (group) => {
                            const { data: itemsData } = await supabase.from('product_combo_group_items').select('*').eq('group_id', group.id).order('sort_order')
                            type RawGroupItem = { id: string; product_id: string; price_adjustment?: number | null; is_default?: boolean | null; sort_order?: number | null };
                            const itemsWithProducts = await Promise.all((itemsData || []).map(async (item: RawGroupItem) => {
                                const { data: product } = await supabase.from('products').select('*').eq('id', item.product_id).single()
                                return { ...item, product, price_adjustment: item.price_adjustment ?? 0, is_default: item.is_default ?? false, sort_order: item.sort_order ?? 0 }
                            }))
                            return {
                                id: group.id, group_name: group.name ?? '', group_type: (group.max_selections ?? 1) === 1 ? 'single' : 'multiple',
                                is_required: group.is_required ?? true, min_selections: group.min_selections ?? 1, max_selections: group.max_selections ?? 1,
                                sort_order: group.sort_order ?? 0, items: itemsWithProducts, expanded: true
                            } as ComboGroup
                        })
                    )
                    setGroups(groupsWithItems)
                }
            }
        } catch (error) { logError('Error fetching combo:', error); toast.error('Error loading combo') }
        finally { setLoading(false) }
    }

    const addGroup = () => {
        setGroups([...groups, { group_name: '', group_type: 'single', is_required: true, min_selections: 1, max_selections: 1, sort_order: groups.length, items: [], expanded: true }])
    }
    const removeGroup = (index: number) => setGroups(groups.filter((_, i) => i !== index))
    const updateGroup = (index: number, updates: Partial<ComboGroup>) => { const g = [...groups]; g[index] = { ...g[index], ...updates }; setGroups(g) }
    const toggleGroupExpanded = (index: number) => { const g = [...groups]; g[index].expanded = !g[index].expanded; setGroups(g) }

    const addProductToGroup = (groupIndex: number, product: Product) => {
        if (groups[groupIndex].items.some(item => item.product_id === product.id)) { toast.error('Already in group'); return }
        const g = [...groups]
        g[groupIndex].items.push({ product_id: product.id, product, price_adjustment: 0, is_default: g[groupIndex].items.length === 0, sort_order: g[groupIndex].items.length })
        setGroups(g); setShowProductSearch(null); setSearchTerm('')
    }
    const removeProductFromGroup = (gi: number, ii: number) => { const g = [...groups]; g[gi].items = g[gi].items.filter((_, i) => i !== ii); setGroups(g) }
    const updateGroupItem = (gi: number, ii: number, u: Partial<GroupItem>) => { const g = [...groups]; g[gi].items[ii] = { ...g[gi].items[ii], ...u }; setGroups(g) }
    const setAsDefault = (gi: number, ii: number) => { const g = [...groups]; g[gi].items.forEach(item => item.is_default = false); g[gi].items[ii].is_default = true; setGroups(g) }

    const calculateMinPrice = () => {
        let min = comboPrice
        groups.forEach(group => {
            if (group.is_required && group.items.length > 0) {
                const defaultItem = group.items.find(item => item.is_default)
                const cheapest = group.items.reduce((m, item) => item.price_adjustment < m.price_adjustment ? item : m, group.items[0])
                min += (defaultItem || cheapest).price_adjustment
            }
        })
        return min
    }

    const calculateMaxPrice = () => {
        let max = comboPrice
        groups.forEach(group => {
            if (group.group_type === 'single') {
                const most = group.items.reduce((m, item) => item.price_adjustment > m.price_adjustment ? item : m, group.items[0] || { price_adjustment: 0 })
                max += most.price_adjustment
            } else {
                const sorted = [...group.items].sort((a, b) => b.price_adjustment - a.price_adjustment)
                max += sorted.slice(0, group.max_selections).reduce((sum, item) => sum + item.price_adjustment, 0)
            }
        })
        return max
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) { toast.error('Combo name is required'); return }
        if (comboPrice <= 0) { toast.error('Price must be > 0'); return }
        if (groups.length === 0) { toast.error('Add at least one group'); return }
        for (let i = 0; i < groups.length; i++) {
            const g = groups[i]
            if (!g.group_name.trim()) { toast.error(`Group ${i + 1} name is required`); return }
            if (g.items.length === 0) { toast.error(`Group "${g.group_name}" needs at least one product`); return }
            if (g.group_type === 'single' && g.max_selections !== 1) { toast.error(`Group "${g.group_name}" single type must have max_selections = 1`); return }
            if (g.min_selections > g.max_selections) { toast.error(`Group "${g.group_name}": min > max`); return }
        }

        setSaving(true)
        try {
            if (isEditing) {
                const { error: comboError } = await supabase.from('product_combos')
                    .update({ name, description: description || null, combo_price: comboPrice, is_active: isActive, available_at_pos: availableAtPos, image_url: imageUrl || null, sort_order: sortOrder, available_from: availableFrom || null, available_to: availableTo || null } as never).eq('id', id!)
                if (comboError) throw comboError
                const { error: deleteError } = await supabase.from('product_combo_groups').delete().eq('combo_id', id!)
                if (deleteError) throw deleteError
                await insertGroupsAndItems(id!)
                toast.success('Combo updated')
            } else {
                const { data: comboData, error: comboError } = await supabase.from('product_combos')
                    .insert({ name, description: description || null, combo_price: comboPrice, is_active: isActive, available_at_pos: availableAtPos, image_url: imageUrl || null, sort_order: sortOrder, available_from: availableFrom || null, available_to: availableTo || null } as never).select().single()
                if (comboError) throw comboError
                await insertGroupsAndItems(comboData.id)
                toast.success('Combo created')
            }
            navigate('/products/combos')
        } catch (error) { logError('Error saving combo:', error); toast.error('Error saving combo') }
        finally { setSaving(false) }
    }

    const insertGroupsAndItems = async (comboId: string) => {
        for (const group of groups) {
            const { data: groupData, error: groupError } = await supabase.from('product_combo_groups')
                .insert({ combo_id: comboId, name: group.group_name, is_required: group.is_required, min_selections: group.min_selections, max_selections: group.max_selections, sort_order: group.sort_order }).select().single()
            if (groupError) throw groupError
            if (group.items.length > 0) {
                const { error: itemsError } = await supabase.from('product_combo_group_items')
                    .insert(group.items.map(item => ({ group_id: groupData.id, product_id: item.product_id, price_adjustment: item.price_adjustment, is_default: item.is_default, sort_order: item.sort_order })))
                if (itemsError) throw itemsError
            }
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-5 max-w-[1200px] mx-auto text-[var(--theme-text-muted)]">
                <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-8 max-w-[1200px] mx-auto max-md:p-4 font-body">
            <header className="flex items-center gap-4 mb-8">
                <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--onyx-surface)] border border-white/10 text-[var(--theme-text-secondary)] transition-all hover:bg-white/5 hover:text-[var(--color-gold)] shadow-sm"
                    onClick={() => navigate('/products/combos')}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <h1 className="font-display text-3xl font-semibold text-white m-0 flex items-center gap-3">
                        <Box size={28} className="text-[var(--color-gold)]" />
                        {isEditing ? 'Edit Combo' : 'New Combo'}
                    </h1>
                    <p className="text-[var(--theme-text-secondary)] text-sm opacity-60 mt-1">
                        Design a premium bundle for your customers
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-[1fr_400px] gap-8 xl:grid-cols-1">
                    <div className="space-y-8">
                        <ComboFormGeneral
                            name={name} description={description} comboPrice={comboPrice}
                            sortOrder={sortOrder} imageUrl={imageUrl} isActive={isActive}
                            availableAtPos={availableAtPos}
                            availableFrom={availableFrom} availableTo={availableTo}
                            onNameChange={setName}
                            onDescriptionChange={setDescription} onComboPriceChange={setComboPrice}
                            onSortOrderChange={setSortOrder} onImageUrlChange={setImageUrl}
                            onIsActiveChange={setIsActive} onAvailableAtPosChange={setAvailableAtPos}
                            onAvailableFromChange={setAvailableFrom} onAvailableToChange={setAvailableTo}
                        />
                        {groups.length > 0 && (
                            <ComboFormPricePreview minPrice={calculateMinPrice()} maxPrice={calculateMaxPrice()} />
                        )}
                    </div>

                    <ComboFormGroupEditor
                        groups={groups} showProductSearch={showProductSearch}
                        searchTerm={searchTerm} filteredProducts={filteredProducts}
                        onAddGroup={addGroup} onRemoveGroup={removeGroup}
                        onUpdateGroup={updateGroup} onToggleExpanded={toggleGroupExpanded}
                        onAddProduct={addProductToGroup} onRemoveProduct={removeProductFromGroup}
                        onUpdateGroupItem={updateGroupItem} onSetDefault={setAsDefault}
                        onShowProductSearch={setShowProductSearch} onSearchTermChange={setSearchTerm}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 p-6 bg-[var(--onyx-surface)] border border-white/5 rounded-xl shadow-sm max-md:flex-col">
                    <button
                        type="button"
                        className="py-3 px-8 rounded-xl font-body text-sm font-semibold cursor-pointer border border-white/10 bg-transparent text-white transition-all hover:bg-white/5 max-md:w-full"
                        onClick={() => navigate('/products/combos')}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 py-3 px-10 rounded-xl font-body text-sm font-bold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-[var(--color-gold)] text-black shadow-[0_4px_12px_rgba(201,165,92,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(201,165,92,0.35)] disabled:opacity-50 disabled:transform-none max-md:w-full"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>{isEditing ? 'Update Combo' : 'Create Combo'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
