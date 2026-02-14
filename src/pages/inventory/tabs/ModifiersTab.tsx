import React, { useState, useEffect } from 'react'
import {
    Plus, Save, AlertCircle, Check, Info
} from 'lucide-react'
import {
    useProductModifiersAdmin,
    useModifierEditor,
    type ModifierGroup,
} from '../../../hooks/products'
import { logError } from '@/utils/logger'
import { ModifierGroupCard, InheritedGroupList, AddGroupForm } from './modifiers'

interface ModifiersTabProps {
    productId: string
    categoryId: string | null | undefined
}

export const ModifiersTab: React.FC<ModifiersTabProps> = ({ productId }) => {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [showAddGroup, setShowAddGroup] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupType, setNewGroupType] = useState<'single' | 'multiple'>('single')
    const [newGroupRequired, setNewGroupRequired] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Fetch data
    const {
        productGroups,
        categoryGroups,
        isLoading,
        error,
        saveModifiers,
        isSaving,
        saveError
    } = useProductModifiersAdmin(productId)

    // Editor state
    const editor = useModifierEditor(productGroups)

    // Reset editor when data loads
    useEffect(() => {
        if (productGroups.length > 0) {
            const expanded: Record<string, boolean> = {}
            productGroups.forEach(g => expanded[g.name] = true)
            setExpandedGroups(expanded)
        }
    }, [productGroups])

    const toggleGroupExpanded = (name: string) => {
        setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }))
    }

    const handleAddGroup = () => {
        if (!newGroupName.trim()) return
        editor.addGroup(newGroupName.trim(), newGroupType, newGroupRequired)
        setExpandedGroups(prev => ({ ...prev, [newGroupName.trim()]: true }))
        setNewGroupName('')
        setNewGroupType('single')
        setNewGroupRequired(false)
        setShowAddGroup(false)
    }

    const handleAddOption = (groupIndex: number) => {
        const optionId = `option_${Date.now()}`
        editor.addOption(groupIndex, {
            id: optionId,
            label: '',
            priceAdjustment: 0,
            isDefault: false,
        })
    }

    const handleCopyFromCategory = (categoryGroup: ModifierGroup) => {
        editor.addGroup(categoryGroup.name, categoryGroup.type, categoryGroup.required)
        const newGroupIndex = editor.groups.length
        categoryGroup.options.forEach(opt => {
            editor.addOption(newGroupIndex, {
                id: opt.id,
                label: opt.label,
                icon: opt.icon,
                priceAdjustment: opt.priceAdjustment,
                isDefault: opt.isDefault,
            })
        })
        setExpandedGroups(prev => ({ ...prev, [categoryGroup.name]: true }))
    }

    const handleSave = async () => {
        try {
            await saveModifiers(editor.groups)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            logError('Error saving modifiers:', err)
        }
    }

    // Combined view: product groups + inherited category groups
    const productGroupNames = new Set(editor.groups.map(g => g.name))
    const inheritedCategoryGroups = categoryGroups.filter(g => !productGroupNames.has(g.name))

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 max-w-[1000px]">
                <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)]">
                    <div className="w-10 h-10 border-[3px] border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <p className="mt-4 text-sm">Loading...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col gap-6 max-w-[1000px]">
                <div className="flex flex-col items-center justify-center py-16 text-red-400">
                    <AlertCircle size={48} />
                    <p className="mt-4 text-sm">Error loading modifiers</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-[1000px]">
            {/* Header */}
            <div className="flex justify-between items-start p-6 bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <div>
                    <h3 className="text-xl font-semibold text-white m-0 mb-1">
                        Product Modifiers
                    </h3>
                    <p className="text-sm text-[var(--theme-text-muted)] m-0">
                        Configure modifier groups and options for this product
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    {editor.hasChanges && (
                        <button
                            className="px-4 py-2.5 text-sm font-medium bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors"
                            onClick={editor.resetChanges}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[var(--color-gold)] text-black rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={handleSave}
                        disabled={!editor.hasChanges || isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : saveSuccess ? (
                            <><Check size={18} /> Saved!</>
                        ) : (
                            <><Save size={18} /> Save</>
                        )}
                    </button>
                </div>
            </div>

            {/* Save Error Alert */}
            {saveError && (
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertCircle size={18} />
                    <span>Error saving modifiers: {(saveError as Error).message}</span>
                </div>
            )}

            {/* Info Banner */}
            {categoryGroups.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm bg-[var(--color-gold)]/[0.06] text-[var(--color-gold)] border border-[var(--color-gold)]/20">
                    <Info size={18} />
                    <span>
                        {`${categoryGroups.length} group(s) inherited from category. Add product-specific groups or customize inherited groups.`}
                    </span>
                </div>
            )}

            {/* Product-Specific Groups */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] m-0">
                        Product Groups
                    </h4>
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[var(--color-gold)] text-black rounded-xl hover:brightness-110 transition-all"
                        onClick={() => setShowAddGroup(true)}
                    >
                        <Plus size={18} />
                        Add Group
                    </button>
                </div>

                {/* Add Group Form */}
                {showAddGroup && (
                    <AddGroupForm
                        newGroupName={newGroupName}
                        newGroupType={newGroupType}
                        newGroupRequired={newGroupRequired}
                        onNameChange={setNewGroupName}
                        onTypeChange={setNewGroupType}
                        onRequiredChange={setNewGroupRequired}
                        onAdd={handleAddGroup}
                        onCancel={() => setShowAddGroup(false)}
                    />
                )}

                {/* Product Groups List */}
                {editor.groups.length === 0 && !showAddGroup ? (
                    <div className="py-8 text-center text-[var(--theme-text-muted)] text-[15px]">
                        No product-specific groups defined
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {editor.groups.map((group, groupIndex) => (
                            <ModifierGroupCard
                                key={`${group.name}-${groupIndex}`}
                                group={group}
                                groupIndex={groupIndex}
                                isExpanded={expandedGroups[group.name] ?? true}
                                onToggle={() => toggleGroupExpanded(group.name)}
                                onUpdateGroup={(updates) => editor.updateGroup(groupIndex, updates)}
                                onDeleteGroup={() => editor.deleteGroup(groupIndex)}
                                onAddOption={() => handleAddOption(groupIndex)}
                                onUpdateOption={(optIndex, updates) => editor.updateOption(groupIndex, optIndex, updates)}
                                onDeleteOption={(optIndex) => editor.deleteOption(groupIndex, optIndex)}
                                onSetDefault={(optIndex) => editor.setDefaultOption(groupIndex, optIndex)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Inherited Category Groups */}
            <InheritedGroupList
                groups={inheritedCategoryGroups}
                onCopyFromCategory={handleCopyFromCategory}
            />

            {/* Empty State */}
            {editor.groups.length === 0 && inheritedCategoryGroups.length === 0 && !showAddGroup && (
                <div className="flex flex-col items-center justify-center py-16 px-8 bg-[var(--onyx-surface)] rounded-xl border-2 border-dashed border-white/10 text-center">
                    <div className="w-20 h-20 flex items-center justify-center bg-white/5 rounded-full text-[var(--theme-text-muted)] mb-6">
                        <Plus size={48} />
                    </div>
                    <h4 className="text-lg font-semibold text-white m-0 mb-2">
                        No modifiers
                    </h4>
                    <p className="text-[15px] text-[var(--theme-text-muted)] m-0 mb-6 max-w-[400px]">
                        Add modifier groups to allow customers to customize this product
                    </p>
                    <button
                        className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-[var(--color-gold)] text-black rounded-xl hover:brightness-110 transition-all"
                        onClick={() => setShowAddGroup(true)}
                    >
                        <Plus size={18} />
                        Add first group
                    </button>
                </div>
            )}
        </div>
    )
}

export default ModifiersTab
