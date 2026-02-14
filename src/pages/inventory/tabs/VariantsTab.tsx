import React, { useState, useEffect } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logError } from '@/utils/logger'

interface VariantMaterial {
    material_id: string
    quantity: number
}

interface VariantGroup {
    group_name: string
    group_type: 'single' | 'multiple'
    group_required: boolean
    group_sort_order: number
    options: VariantOption[]
}

interface VariantOption {
    id?: string
    option_id: string
    option_label: string
    price_adjustment: number
    is_default: boolean
    option_sort_order: number
    is_active: boolean
    materials: VariantMaterial[]
}

interface VariantsTabProps {
    productId: string
}

export const VariantsTab: React.FC<VariantsTabProps> = ({ productId }) => {
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupType, setNewGroupType] = useState<'single' | 'multiple'>('single')
    const [newGroupRequired, setNewGroupRequired] = useState(false)
    const [showAddGroup, setShowAddGroup] = useState(false)
    const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; sku: string; unit: string | null }>>([])

    useEffect(() => {
        loadVariants()
        loadAvailableProducts()
    }, [productId])

    async function loadAvailableProducts() {
        try {
            const { data, error} = await supabase
                .from('products')
                .select('id, name, sku, unit')
                .order('name')

            if (error) throw error
            setAvailableProducts(data || [])
        } catch (error) {
            logError('Error loading products:', error)
        }
    }

    async function loadVariants() {
        try {
            const { data, error } = await supabase
                .from('product_modifiers')
                .select('*')
                .eq('product_id', productId)
                .order('group_sort_order', { ascending: true })
                .order('option_sort_order', { ascending: true })

            if (error) throw error

            const groups: Record<string, VariantGroup> = {}

            data?.forEach(mod => {
                if (!groups[mod.group_name]) {
                    groups[mod.group_name] = {
                        group_name: mod.group_name,
                        group_type: mod.group_type || 'single',
                        group_required: mod.group_required || false,
                        group_sort_order: mod.group_sort_order || 0,
                        options: []
                    }
                }

                const materials: VariantMaterial[] = mod.materials && Array.isArray(mod.materials)
                    ? mod.materials.map((m: any) => ({
                        material_id: m.material_id,
                        quantity: m.quantity || 0
                    }))
                    : []

                groups[mod.group_name].options.push({
                    id: mod.id,
                    option_id: mod.option_id,
                    option_label: mod.option_label,
                    price_adjustment: mod.price_adjustment || 0,
                    is_default: mod.is_default || false,
                    option_sort_order: mod.option_sort_order || 0,
                    is_active: mod.is_active !== false,
                    materials
                })
            })

            setVariantGroups(Object.values(groups))
        } catch (error) {
            logError('Error loading variants:', error)
            toast.error('Error loading variants')
        } finally {
            setLoading(false)
        }
    }

    async function handleAddGroup() {
        if (!newGroupName.trim()) {
            toast.error('Category name is required')
            return
        }

        try {
            const { error } = await supabase
                .from('product_modifiers')
                .insert({
                    product_id: productId,
                    group_name: newGroupName,
                    group_type: newGroupType,
                    group_required: newGroupRequired,
                    group_sort_order: variantGroups.length,
                    option_id: `opt_${Date.now()}`,
                    option_label: 'Option 1',
                    price_adjustment: 0,
                    is_default: true,
                    option_sort_order: 0,
                    is_active: true,
                    materials: []
                })

            if (error) throw error

            toast.success('Category added')
            setNewGroupName('')
            setNewGroupType('single')
            setNewGroupRequired(false)
            setShowAddGroup(false)
            loadVariants()
        } catch (error) {
            logError('Error adding variant group:', error)
            toast.error('Error adding category')
        }
    }

    async function handleAddOption(groupName: string) {
        const group = variantGroups.find(g => g.group_name === groupName)
        if (!group) return

        try {
            const { error } = await supabase
                .from('product_modifiers')
                .insert({
                    product_id: productId,
                    group_name: groupName,
                    group_type: group.group_type,
                    group_required: group.group_required,
                    group_sort_order: group.group_sort_order,
                    option_id: `opt_${Date.now()}`,
                    option_label: `Option ${group.options.length + 1}`,
                    price_adjustment: 0,
                    is_default: false,
                    option_sort_order: group.options.length,
                    is_active: true,
                    materials: []
                })

            if (error) throw error

            toast.success('Option added')
            loadVariants()
        } catch (error) {
            logError('Error adding option:', error)
            toast.error('Error adding option')
        }
    }

    async function handleDeleteOption(optionId: string) {
        if (!confirm('Delete this option?')) return

        try {
            const { error } = await supabase
                .from('product_modifiers')
                .delete()
                .eq('id', optionId)

            if (error) throw error

            toast.success('Option deleted')
            loadVariants()
        } catch (error) {
            logError('Error deleting option:', error)
            toast.error('Error deleting option')
        }
    }

    async function handleDeleteGroup(groupName: string) {
        if (!confirm('Delete this entire category and all its options?')) return

        try {
            const { error } = await supabase
                .from('product_modifiers')
                .delete()
                .eq('product_id', productId)
                .eq('group_name', groupName)

            if (error) throw error

            toast.success('Category deleted')
            loadVariants()
        } catch (error) {
            logError('Error deleting group:', error)
            toast.error('Error deleting category')
        }
    }

    async function handleUpdateOption(optionId: string, field: string, value: any) {
        setVariantGroups(prevGroups => {
            return prevGroups.map(group => ({
                ...group,
                options: group.options.map(opt =>
                    opt.id === optionId ? { ...opt, [field]: value } : opt
                )
            }))
        })

        try {
            const { error } = await supabase
                .from('product_modifiers')
                .update({ [field]: value })
                .eq('id', optionId)

            if (error) throw error
        } catch (error) {
            logError('Error updating option:', error)
            toast.error('Error updating option')
            loadVariants()
        }
    }

    function handleAddMaterial(groupName: string, optionId: string) {
        const newGroups = [...variantGroups]
        const groupIndex = newGroups.findIndex(g => g.group_name === groupName)
        const optionIndex = newGroups[groupIndex].options.findIndex(o => o.id === optionId)

        newGroups[groupIndex].options[optionIndex].materials.push({
            material_id: '',
            quantity: 0
        })

        setVariantGroups(newGroups)
    }

    function handleRemoveMaterial(groupName: string, optionId: string, materialIndex: number) {
        const newGroups = [...variantGroups]
        const groupIndex = newGroups.findIndex(g => g.group_name === groupName)
        const optionIndex = newGroups[groupIndex].options.findIndex(o => o.id === optionId)

        newGroups[groupIndex].options[optionIndex].materials.splice(materialIndex, 1)

        setVariantGroups(newGroups)

        const option = newGroups[groupIndex].options[optionIndex]
        handleUpdateOption(option.id!, 'materials', option.materials)
    }

    function handleUpdateMaterial(groupName: string, optionId: string, materialIndex: number, field: 'material_id' | 'quantity', value: string | number) {
        const newGroups = [...variantGroups]
        const groupIndex = newGroups.findIndex(g => g.group_name === groupName)
        const optionIndex = newGroups[groupIndex].options.findIndex(o => o.id === optionId)

        const materials = [...newGroups[groupIndex].options[optionIndex].materials]
        materials[materialIndex] = {
            ...materials[materialIndex],
            [field]: value
        }
        newGroups[groupIndex].options[optionIndex].materials = materials

        setVariantGroups(newGroups)

        const option = newGroups[groupIndex].options[optionIndex]
        handleUpdateOption(option.id!, 'materials', option.materials)
    }

    if (loading) {
        return (
            <div className="py-8 text-center text-[var(--theme-text-muted)] text-sm uppercase tracking-widest">
                Loading...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-white m-0">Product Variants</h2>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                        Create variant categories with multiple ingredients per option
                    </p>
                </div>
                <button
                    onClick={() => setShowAddGroup(true)}
                    className="bg-[var(--color-gold)] text-black font-bold px-5 py-2.5 rounded-sm flex items-center gap-2 text-xs uppercase tracking-wider hover:bg-[var(--color-gold)]/90 transition-colors cursor-pointer"
                >
                    <Plus size={16} />
                    New Category
                </button>
            </div>

            {/* Add Group Modal */}
            {showAddGroup && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl p-6 w-[90%] max-w-[500px] shadow-2xl">
                        <h3 className="text-lg font-semibold text-white mb-6">New Variant Category</h3>

                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-2">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="e.g. Milk, Size, Topping..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-2">
                                Selection Type
                            </label>
                            <select
                                value={newGroupType}
                                onChange={(e) => setNewGroupType(e.target.value as 'single' | 'multiple')}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                            >
                                <option value="single">Single Choice</option>
                                <option value="multiple">Multiple Choice</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--stone-text)]">
                                <input
                                    type="checkbox"
                                    checked={newGroupRequired}
                                    onChange={(e) => setNewGroupRequired(e.target.checked)}
                                    className="rounded border-white/20 bg-black/40 text-[var(--color-gold)] focus:ring-[var(--color-gold)]/20"
                                />
                                Required
                            </label>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowAddGroup(false)
                                    setNewGroupName('')
                                    setNewGroupType('single')
                                    setNewGroupRequired(false)
                                }}
                                className="px-5 py-2.5 bg-transparent border border-white/10 text-white rounded-lg text-sm font-medium hover:border-white/20 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddGroup}
                                className="px-5 py-2.5 bg-[var(--color-gold)] text-black rounded-lg text-sm font-bold hover:bg-[var(--color-gold)]/90 transition-colors cursor-pointer"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Variant Groups List */}
            {variantGroups.length === 0 ? (
                <div className="py-12 text-center bg-[var(--onyx-surface)] rounded-xl border border-dashed border-white/10">
                    <p className="text-[var(--theme-text-muted)] mb-2 text-sm">
                        No variant categories defined
                    </p>
                    <p className="text-[var(--theme-text-muted)] text-xs opacity-60">
                        Click "New Category" to get started
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {variantGroups.map((group) => (
                        <div
                            key={group.group_name}
                            className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden"
                        >
                            {/* Group Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-white m-0">
                                        {group.group_name}
                                    </h3>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2.5 py-0.5 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[10px] rounded-full font-bold uppercase tracking-wider border border-[var(--color-gold)]/20">
                                            {group.group_type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                                        </span>
                                        {group.group_required && (
                                            <span className="px-2.5 py-0.5 bg-amber-400/10 text-amber-400 text-[10px] rounded-full font-bold uppercase tracking-wider border border-amber-400/20">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteGroup(group.group_name)}
                                    className="p-2 bg-transparent border-none text-[var(--theme-text-muted)] hover:text-red-400 cursor-pointer rounded transition-colors"
                                    title="Delete category"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Options List */}
                            <div className="p-6 space-y-4">
                                {group.options.map((option, optIndex) => (
                                    <div
                                        key={option.id || optIndex}
                                        className="bg-black/20 p-4 rounded-lg border border-white/5"
                                    >
                                        {/* Option Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                type="text"
                                                value={option.option_label}
                                                onChange={(e) => handleUpdateOption(option.id!, 'option_label', e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                                            />
                                            <input
                                                type="number"
                                                value={option.price_adjustment}
                                                onChange={(e) => handleUpdateOption(option.id!, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                                placeholder="Price"
                                                className="w-24 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                                            />
                                            <label className="flex items-center gap-1.5 text-[10px] text-[var(--theme-text-muted)] uppercase tracking-wider cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={option.is_default}
                                                    onChange={(e) => handleUpdateOption(option.id!, 'is_default', e.target.checked)}
                                                    className="rounded border-white/20 bg-black/40 text-[var(--color-gold)] focus:ring-[var(--color-gold)]/20"
                                                />
                                                Default
                                            </label>
                                            <button
                                                onClick={() => handleDeleteOption(option.id!)}
                                                className="p-1.5 bg-transparent border-none text-[var(--theme-text-muted)] hover:text-red-400 cursor-pointer transition-colors"
                                                title="Delete option"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Materials Section */}
                                        <div className="pt-3 border-t border-white/5">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">
                                                    Ingredients to Deduct
                                                </span>
                                                <button
                                                    onClick={() => handleAddMaterial(group.group_name, option.id!)}
                                                    className="flex items-center gap-1 px-2 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[var(--color-gold)]/20 transition-colors"
                                                >
                                                    <Plus size={12} />
                                                    Add
                                                </button>
                                            </div>

                                            {option.materials.length === 0 ? (
                                                <p className="text-[10px] text-[var(--theme-text-muted)] italic m-1 opacity-60">
                                                    No ingredients configured
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {option.materials.map((material, matIndex) => {
                                                        const selectedProduct = availableProducts.find(p => p.id === material.material_id)
                                                        return (
                                                            <div
                                                                key={matIndex}
                                                                className="flex items-center gap-2 bg-black/30 p-2 rounded border border-white/5"
                                                            >
                                                                <select
                                                                    value={material.material_id}
                                                                    onChange={(e) => handleUpdateMaterial(
                                                                        group.group_name,
                                                                        option.id!,
                                                                        matIndex,
                                                                        'material_id',
                                                                        e.target.value
                                                                    )}
                                                                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none"
                                                                >
                                                                    <option value="">Select a product...</option>
                                                                    {availableProducts.map(prod => (
                                                                        <option key={prod.id} value={prod.id}>
                                                                            {prod.name} ({prod.sku})
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                <input
                                                                    type="number"
                                                                    value={material.quantity}
                                                                    onChange={(e) => handleUpdateMaterial(
                                                                        group.group_name,
                                                                        option.id!,
                                                                        matIndex,
                                                                        'quantity',
                                                                        parseFloat(e.target.value) || 0
                                                                    )}
                                                                    placeholder="Qty"
                                                                    disabled={!material.material_id}
                                                                    className="w-20 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none disabled:opacity-40"
                                                                />

                                                                {selectedProduct && (
                                                                    <span className="text-[10px] text-[var(--theme-text-muted)] min-w-[40px]">
                                                                        {selectedProduct.unit}
                                                                    </span>
                                                                )}

                                                                <button
                                                                    onClick={() => handleRemoveMaterial(group.group_name, option.id!, matIndex)}
                                                                    className="p-1 bg-transparent border-none text-[var(--theme-text-muted)] hover:text-red-400 cursor-pointer transition-colors"
                                                                    title="Remove ingredient"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Option Button */}
                                <button
                                    onClick={() => handleAddOption(group.group_name)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-dashed border-white/10 rounded-lg cursor-pointer text-[var(--theme-text-muted)] text-sm font-medium hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] transition-colors"
                                >
                                    <Plus size={16} />
                                    Add an option
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
