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

            // Group by group_name
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

                // Parse materials from JSONB
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
        // Update local state immediately for responsive UI
        setVariantGroups(prevGroups => {
            return prevGroups.map(group => ({
                ...group,
                options: group.options.map(opt =>
                    opt.id === optionId ? { ...opt, [field]: value } : opt
                )
            }))
        })

        // Then update database
        try {
            const { error } = await supabase
                .from('product_modifiers')
                .update({ [field]: value })
                .eq('id', optionId)

            if (error) throw error
        } catch (error) {
            logError('Error updating option:', error)
            toast.error('Error updating option')
            // Reload to get correct state on error
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

        // Update in database
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

        // Update in database
        const option = newGroups[groupIndex].options[optionIndex]
        handleUpdateOption(option.id!, 'materials', option.materials)
    }

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Product Variants</h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
                        Create variant categories with multiple ingredients per option
                    </p>
                </div>
                <button
                    onClick={() => setShowAddGroup(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    <Plus size={18} />
                    New Category
                </button>
            </div>

            {/* Add Group Modal */}
            {showAddGroup && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '500px'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
                            New Variant Category
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                Category Name *
                            </label>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="e.g. Milk, Size, Topping..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                Selection Type
                            </label>
                            <select
                                value={newGroupType}
                                onChange={(e) => setNewGroupType(e.target.value as 'single' | 'multiple')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="single">Single Choice</option>
                                <option value="multiple">Multiple Choice</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={newGroupRequired}
                                    onChange={(e) => setNewGroupRequired(e.target.checked)}
                                />
                                <span style={{ fontSize: '0.875rem' }}>Required</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowAddGroup(false)
                                    setNewGroupName('')
                                    setNewGroupType('single')
                                    setNewGroupRequired(false)
                                }}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: '#F3F4F6',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddGroup}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: '#3B82F6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Variant Groups List */}
            {variantGroups.length === 0 ? (
                <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px dashed #D1D5DB'
                }}>
                    <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                        No variant categories defined
                    </p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                        Click "New Category" to get started
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {variantGroups.map((group) => (
                        <div
                            key={group.group_name}
                            style={{
                                background: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '1.5rem'
                            }}
                        >
                            {/* Group Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid #E5E7EB'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                                        {group.group_name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: '#EFF6FF',
                                            color: '#1E40AF',
                                            fontSize: '0.75rem',
                                            borderRadius: '12px',
                                            fontWeight: 500
                                        }}>
                                            {group.group_type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                                        </span>
                                        {group.group_required && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: '#FEF3C7',
                                                color: '#92400E',
                                                fontSize: '0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: 500
                                            }}>
                                                Required
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteGroup(group.group_name)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#EF4444',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                    title="Delete category"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Options List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {group.options.map((option, optIndex) => (
                                    <div
                                        key={option.id || optIndex}
                                        style={{
                                            background: '#F9FAFB',
                                            padding: '1rem',
                                            borderRadius: '6px',
                                            border: '1px solid #E5E7EB'
                                        }}
                                    >
                                        {/* Option Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <input
                                                type="text"
                                                value={option.option_label}
                                                onChange={(e) => handleUpdateOption(option.id!, 'option_label', e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    border: '1px solid #D1D5DB',
                                                    borderRadius: '4px',
                                                    fontSize: '0.875rem',
                                                    background: 'white'
                                                }}
                                            />
                                            <input
                                                type="number"
                                                value={option.price_adjustment}
                                                onChange={(e) => handleUpdateOption(option.id!, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                                placeholder="Prix"
                                                style={{
                                                    width: '100px',
                                                    padding: '0.5rem',
                                                    border: '1px solid #D1D5DB',
                                                    borderRadius: '4px',
                                                    fontSize: '0.875rem',
                                                    background: 'white'
                                                }}
                                            />
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={option.is_default}
                                                    onChange={(e) => handleUpdateOption(option.id!, 'is_default', e.target.checked)}
                                                />
                                                Default
                                            </label>
                                            <button
                                                onClick={() => handleDeleteOption(option.id!)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#EF4444',
                                                    cursor: 'pointer'
                                                }}
                                                title="Delete option"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Materials Section */}
                                        <div style={{
                                            marginTop: '0.75rem',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid #E5E7EB'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
                                                    Ingredients to Deduct
                                                </span>
                                                <button
                                                    onClick={() => handleAddMaterial(group.group_name, option.id!)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        padding: '0.25rem 0.5rem',
                                                        background: '#3B82F6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    <Plus size={14} />
                                                    Add
                                                </button>
                                            </div>

                                            {/* Materials List */}
                                            {option.materials.length === 0 ? (
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: '#9CA3AF',
                                                    fontStyle: 'italic',
                                                    margin: '0.5rem 0'
                                                }}>
                                                    No ingredients configured
                                                </p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {option.materials.map((material, matIndex) => {
                                                        const selectedProduct = availableProducts.find(p => p.id === material.material_id)
                                                        return (
                                                            <div
                                                                key={matIndex}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    background: 'white',
                                                                    padding: '0.5rem',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #E5E7EB'
                                                                }}
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
                                                                    style={{
                                                                        flex: 1,
                                                                        padding: '0.375rem',
                                                                        border: '1px solid #D1D5DB',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.75rem'
                                                                    }}
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
                                                                    placeholder="Qté"
                                                                    disabled={!material.material_id}
                                                                    style={{
                                                                        width: '80px',
                                                                        padding: '0.375rem',
                                                                        border: '1px solid #D1D5DB',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.75rem',
                                                                        background: material.material_id ? 'white' : '#F3F4F6'
                                                                    }}
                                                                />

                                                                {selectedProduct && (
                                                                    <span style={{
                                                                        fontSize: '0.75rem',
                                                                        color: '#6B7280',
                                                                        minWidth: '40px'
                                                                    }}>
                                                                        {selectedProduct.unit}
                                                                    </span>
                                                                )}

                                                                <button
                                                                    onClick={() => handleRemoveMaterial(group.group_name, option.id!, matIndex)}
                                                                    style={{
                                                                        padding: '0.25rem',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: '#EF4444',
                                                                        cursor: 'pointer'
                                                                    }}
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
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        background: 'white',
                                        border: '1px dashed #D1D5DB',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        color: '#6B7280',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}
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
