import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Plus, Trash2, ChevronDown, ChevronRight, GripVertical,
    Save, AlertCircle, Check, Info, Copy
} from 'lucide-react'
import {
    useProductModifiersAdmin,
    useModifierEditor,
    type ModifierGroup,
    type ModifierOption
} from '../../../hooks/products'
import { formatPrice } from '../../../utils/helpers'
import './ModifiersTab.css'

interface ModifiersTabProps {
    productId: string
    categoryId: string | null | undefined
}

export const ModifiersTab: React.FC<ModifiersTabProps> = ({ productId }) => {
    const { t } = useTranslation()
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
            // Expand all groups by default
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
        // Copy the category group as a product-specific group
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
            console.error('Error saving modifiers:', err)
        }
    }

    // Get combined view: product groups + inherited category groups
    const productGroupNames = new Set(editor.groups.map(g => g.name))
    const inheritedCategoryGroups = categoryGroups.filter(g => !productGroupNames.has(g.name))

    if (isLoading) {
        return (
            <div className="modifiers-tab">
                <div className="modifiers-loading">
                    <div className="spinner" />
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="modifiers-tab">
                <div className="modifiers-error">
                    <AlertCircle size={48} />
                    <p>{t('modifiers_admin.load_error')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="modifiers-tab">
            {/* Header */}
            <div className="modifiers-header">
                <div>
                    <h3 className="modifiers-title">{t('modifiers_admin.title')}</h3>
                    <p className="modifiers-subtitle">
                        {t('modifiers_admin.subtitle')}
                    </p>
                </div>
                <div className="modifiers-actions">
                    {editor.hasChanges && (
                        <button
                            className="btn-secondary"
                            onClick={editor.resetChanges}
                            disabled={isSaving}
                        >
                            {t('common.cancel')}
                        </button>
                    )}
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={!editor.hasChanges || isSaving}
                    >
                        {isSaving ? (
                            <><span className="spinner-sm" /> {t('common.saving')}</>
                        ) : saveSuccess ? (
                            <><Check size={18} /> {t('modifiers_admin.save_success')}</>
                        ) : (
                            <><Save size={18} /> {t('common.save')}</>
                        )}
                    </button>
                </div>
            </div>

            {saveError && (
                <div className="modifiers-alert error">
                    <AlertCircle size={18} />
                    <span>{t('modifiers_admin.save_error')}: {(saveError as Error).message}</span>
                </div>
            )}

            {/* Info Banner */}
            {categoryGroups.length > 0 && (
                <div className="modifiers-info">
                    <Info size={18} />
                    <span>
                        {t('modifiers_admin.category_info', {
                            count: categoryGroups.length,
                            defaultValue: `${categoryGroups.length} groupe(s) hérité(s) de la catégorie. Ajoutez des groupes spécifiques pour ce produit ou personnalisez les groupes hérités.`
                        })}
                    </span>
                </div>
            )}

            {/* Product-Specific Groups */}
            <div className="modifiers-section">
                <div className="modifiers-section-header">
                    <h4>{t('modifiers_admin.product_groups')}</h4>
                    <button
                        className="btn-add-group"
                        onClick={() => setShowAddGroup(true)}
                    >
                        <Plus size={18} />
                        {t('modifiers_admin.add_group')}
                    </button>
                </div>

                {/* Add Group Form */}
                {showAddGroup && (
                    <div className="add-group-form">
                        <div className="add-group-row">
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('modifiers_admin.group_name_placeholder')}
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                autoFocus
                            />
                            <select
                                className="form-select"
                                value={newGroupType}
                                onChange={e => setNewGroupType(e.target.value as 'single' | 'multiple')}
                            >
                                <option value="single">{t('modifiers_admin.type_single')}</option>
                                <option value="multiple">{t('modifiers_admin.type_multiple')}</option>
                            </select>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={newGroupRequired}
                                    onChange={e => setNewGroupRequired(e.target.checked)}
                                />
                                {t('modifiers_admin.required')}
                            </label>
                        </div>
                        <div className="add-group-actions">
                            <button className="btn-secondary" onClick={() => setShowAddGroup(false)}>
                                {t('common.cancel')}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleAddGroup}
                                disabled={!newGroupName.trim()}
                            >
                                <Plus size={16} />
                                {t('modifiers_admin.add')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Product Groups List */}
                {editor.groups.length === 0 && !showAddGroup ? (
                    <div className="modifiers-empty">
                        <p>{t('modifiers_admin.no_product_groups')}</p>
                    </div>
                ) : (
                    <div className="modifier-groups">
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
            {inheritedCategoryGroups.length > 0 && (
                <div className="modifiers-section inherited">
                    <div className="modifiers-section-header">
                        <h4>{t('modifiers_admin.inherited_groups')}</h4>
                    </div>
                    <div className="modifier-groups">
                        {inheritedCategoryGroups.map((group, idx) => (
                            <div key={`cat-${group.name}-${idx}`} className="modifier-group inherited">
                                <div className="modifier-group-header">
                                    <div className="modifier-group-info">
                                        <span className="inherited-badge">
                                            {t('modifiers_admin.inherited')}
                                        </span>
                                        <h5 className="modifier-group-name">{group.name}</h5>
                                        <span className="modifier-group-type">
                                            {group.type === 'single' ? t('modifiers_admin.type_single') : t('modifiers_admin.type_multiple')}
                                            {group.required && <span className="required-indicator">*</span>}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-copy"
                                        onClick={() => handleCopyFromCategory(group)}
                                        title={t('modifiers_admin.customize')}
                                    >
                                        <Copy size={16} />
                                        {t('modifiers_admin.customize')}
                                    </button>
                                </div>
                                <div className="modifier-options-preview">
                                    {group.options.map(opt => (
                                        <span key={opt.id} className="option-preview">
                                            {opt.icon && <span className="option-icon">{opt.icon}</span>}
                                            {opt.label}
                                            {opt.priceAdjustment > 0 && (
                                                <span className="option-price">+{formatPrice(opt.priceAdjustment)}</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {editor.groups.length === 0 && inheritedCategoryGroups.length === 0 && !showAddGroup && (
                <div className="modifiers-empty-state">
                    <div className="empty-icon">
                        <Plus size={48} />
                    </div>
                    <h4>{t('modifiers_admin.no_modifiers')}</h4>
                    <p>{t('modifiers_admin.no_modifiers_hint')}</p>
                    <button className="btn-primary" onClick={() => setShowAddGroup(true)}>
                        <Plus size={18} />
                        {t('modifiers_admin.add_first_group')}
                    </button>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// Modifier Group Card Component
// ============================================================================

interface ModifierGroupCardProps {
    group: ModifierGroup
    groupIndex: number
    isExpanded: boolean
    onToggle: () => void
    onUpdateGroup: (updates: Partial<ModifierGroup>) => void
    onDeleteGroup: () => void
    onAddOption: () => void
    onUpdateOption: (optionIndex: number, updates: Partial<ModifierOption>) => void
    onDeleteOption: (optionIndex: number) => void
    onSetDefault: (optionIndex: number) => void
}

const ModifierGroupCard: React.FC<ModifierGroupCardProps> = ({
    group,
    groupIndex,
    isExpanded,
    onToggle,
    onUpdateGroup,
    onDeleteGroup,
    onAddOption,
    onUpdateOption,
    onDeleteOption,
    onSetDefault
}) => {
    const { t } = useTranslation()
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(group.name)

    const handleNameSave = () => {
        if (editedName.trim() && editedName !== group.name) {
            onUpdateGroup({ name: editedName.trim() })
        }
        setIsEditingName(false)
    }

    return (
        <div className="modifier-group">
            <div className="modifier-group-header" onClick={onToggle}>
                <div className="modifier-group-drag">
                    <GripVertical size={16} />
                </div>
                <button className="expand-btn">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="modifier-group-info">
                    {isEditingName ? (
                        <input
                            type="text"
                            className="form-input inline-edit"
                            value={editedName}
                            onChange={e => setEditedName(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <h5
                            className="modifier-group-name"
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                setIsEditingName(true)
                            }}
                        >
                            {group.name}
                        </h5>
                    )}
                    <div className="modifier-group-meta">
                        <select
                            className="form-select-inline"
                            value={group.type}
                            onChange={e => onUpdateGroup({ type: e.target.value as 'single' | 'multiple' })}
                            onClick={e => e.stopPropagation()}
                        >
                            <option value="single">{t('modifiers_admin.type_single')}</option>
                            <option value="multiple">{t('modifiers_admin.type_multiple')}</option>
                        </select>
                        <label className="checkbox-inline" onClick={e => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                checked={group.required}
                                onChange={e => onUpdateGroup({ required: e.target.checked })}
                            />
                            {t('modifiers_admin.required')}
                        </label>
                    </div>
                </div>
                <div className="modifier-group-stats">
                    <span className="options-count">
                        {group.options.length} {t('modifiers_admin.options')}
                    </span>
                </div>
                <button
                    className="btn-delete"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(t('modifiers_admin.delete_group_confirm'))) {
                            onDeleteGroup()
                        }
                    }}
                    title={t('modifiers_admin.delete_group')}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {isExpanded && (
                <div className="modifier-options">
                    {group.options.length === 0 ? (
                        <div className="options-empty">
                            <p>{t('modifiers_admin.no_options')}</p>
                        </div>
                    ) : (
                        <>
                            {/* Column Headers */}
                            <div className="options-header">
                                <span></span>
                                <span>{t('modifiers_admin.option_label')}</span>
                                <span className="center">{t('modifiers_admin.option_icon')}</span>
                                <span>{t('modifiers_admin.price_adjustment')}</span>
                                <span className="center">{t('modifiers_admin.is_default')}</span>
                                <span></span>
                            </div>
                            {/* Option Cards */}
                            <div className="options-list">
                                {group.options.map((option, optIndex) => (
                                    <div key={`${option.id}-${optIndex}`} className="option-card">
                                        <div className="drag-handle">
                                            <GripVertical size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={option.label}
                                            onChange={e => onUpdateOption(optIndex, { label: e.target.value })}
                                            placeholder={t('modifiers_admin.option_label_placeholder')}
                                        />
                                        <input
                                            type="text"
                                            className="form-input icon-input"
                                            value={option.icon || ''}
                                            onChange={e => onUpdateOption(optIndex, { icon: e.target.value })}
                                            placeholder="🔥"
                                            maxLength={4}
                                        />
                                        <div className="price-input-wrapper">
                                            <span className="price-prefix">+</span>
                                            <input
                                                type="number"
                                                className="form-input price-input"
                                                value={option.priceAdjustment}
                                                onChange={e => onUpdateOption(optIndex, {
                                                    priceAdjustment: parseFloat(e.target.value) || 0
                                                })}
                                                min={0}
                                                step={1000}
                                                placeholder="0"
                                                title={t('modifiers_admin.price_adjustment')}
                                            />
                                        </div>
                                        <div className="default-cell">
                                            {group.type === 'single' ? (
                                                <input
                                                    type="radio"
                                                    name={`default-${groupIndex}`}
                                                    checked={option.isDefault}
                                                    onChange={() => onSetDefault(optIndex)}
                                                    className="default-radio"
                                                />
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={option.isDefault}
                                                    onChange={() => onSetDefault(optIndex)}
                                                    className="default-checkbox"
                                                />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-delete-option"
                                            onClick={() => onDeleteOption(optIndex)}
                                            title={t('modifiers_admin.delete_option')}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <button type="button" className="btn-add-option" onClick={onAddOption}>
                        <Plus size={16} />
                        {t('modifiers_admin.add_option')}
                    </button>
                </div>
            )}
        </div>
    )
}

export default ModifiersTab
