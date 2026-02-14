import React, { useState } from 'react'
import {
    Trash2, ChevronDown, ChevronRight, GripVertical, Plus
} from 'lucide-react'
import type { ModifierGroup, ModifierOption } from '../../../../hooks/products'

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

export const ModifierGroupCard: React.FC<ModifierGroupCardProps> = ({
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
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(group.name)

    const handleNameSave = () => {
        if (editedName.trim() && editedName !== group.name) {
            onUpdateGroup({ name: editedName.trim() })
        }
        setIsEditingName(false)
    }

    return (
        <div className="border-b border-white/5 last:border-b-0">
            {/* Group Header */}
            <div
                className="flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={onToggle}
            >
                <div className="text-[var(--theme-text-muted)] cursor-grab shrink-0">
                    <GripVertical size={16} />
                </div>
                <button className="flex items-center justify-center w-7 h-7 bg-transparent text-[var(--theme-text-muted)] rounded-lg shrink-0 hover:bg-white/5">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="flex-1 flex items-center gap-4 min-w-0">
                    {isEditingName ? (
                        <input
                            type="text"
                            className="text-base font-semibold px-2 py-1 min-w-[150px] border-2 border-[var(--color-gold)] rounded-lg bg-black/40 text-white outline-none"
                            value={editedName}
                            onChange={e => setEditedName(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <h5
                            className="text-base font-semibold text-white m-0 cursor-text hover:text-[var(--color-gold)] transition-colors"
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                setIsEditingName(true)
                            }}
                        >
                            {group.name}
                        </h5>
                    )}
                    <div className="flex items-center gap-3 shrink-0">
                        <select
                            className="px-3 py-1.5 text-[13px] border border-white/10 rounded-lg bg-black/40 text-[var(--theme-text-secondary)] cursor-pointer hover:border-white/20 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none"
                            value={group.type}
                            onChange={e => onUpdateGroup({ type: e.target.value as 'single' | 'multiple' })}
                            onClick={e => e.stopPropagation()}
                        >
                            <option value="single">Single choice</option>
                            <option value="multiple">Multiple choice</option>
                        </select>
                        <label
                            className="flex items-center gap-1.5 text-[13px] text-[var(--theme-text-muted)] cursor-pointer px-2 py-1.5 bg-white/[0.03] rounded-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                checked={group.required}
                                onChange={e => onUpdateGroup({ required: e.target.checked })}
                                className="accent-[var(--color-gold)]"
                            />
                            Required
                        </label>
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="text-xs text-[var(--theme-text-muted)] bg-white/5 px-2.5 py-1 rounded-full font-medium">
                        {group.options.length} options
                    </span>
                </div>
                <button
                    className="flex items-center justify-center w-8 h-8 bg-transparent text-[var(--theme-text-muted)] rounded-lg shrink-0 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this group?')) {
                            onDeleteGroup()
                        }
                    }}
                    title="Delete group"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Expanded Options */}
            {isExpanded && (
                <div className="px-5 pb-5 pt-2 bg-black/20 border-t border-white/5">
                    {group.options.length === 0 ? (
                        <div className="py-8 text-center text-[var(--theme-text-muted)] text-sm bg-[var(--onyx-surface)] rounded-xl border border-dashed border-white/10">
                            No options defined for this group
                        </div>
                    ) : (
                        <>
                            {/* Column Headers */}
                            <div className="grid gap-4 px-4 pb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"
                                style={{ gridTemplateColumns: '28px minmax(180px, 1fr) 60px 130px 60px 40px' }}
                            >
                                <span></span>
                                <span className="flex items-center">Label</span>
                                <span className="flex items-center justify-center">Icon</span>
                                <span className="flex items-center">Price Adj.</span>
                                <span className="flex items-center justify-center">Default</span>
                                <span></span>
                            </div>
                            {/* Option Rows */}
                            <div className="flex flex-col gap-2 mb-4">
                                {group.options.map((option, optIndex) => (
                                    <div
                                        key={`${option.id}-${optIndex}`}
                                        className="grid gap-4 items-center px-4 py-3 bg-[var(--onyx-surface)] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                                        style={{ gridTemplateColumns: '28px minmax(180px, 1fr) 60px 130px 60px 40px' }}
                                    >
                                        <div className="text-[var(--theme-text-muted)] cursor-grab flex items-center justify-center">
                                            <GripVertical size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full min-w-0 px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none transition-colors"
                                            value={option.label}
                                            onChange={e => onUpdateOption(optIndex, { label: e.target.value })}
                                            placeholder="Option label"
                                        />
                                        <input
                                            type="text"
                                            className="w-full text-center text-lg px-1 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none transition-colors"
                                            value={option.icon || ''}
                                            onChange={e => onUpdateOption(optIndex, { icon: e.target.value })}
                                            placeholder="\uD83D\uDD25"
                                            maxLength={4}
                                        />
                                        <div className="flex items-center relative w-full">
                                            <span className="absolute left-3 text-[var(--theme-text-muted)] text-sm font-medium pointer-events-none">+</span>
                                            <input
                                                type="number"
                                                className="w-full pl-6 pr-2 py-2 text-sm text-right bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none transition-colors"
                                                value={option.priceAdjustment}
                                                onChange={e => onUpdateOption(optIndex, {
                                                    priceAdjustment: parseFloat(e.target.value) || 0
                                                })}
                                                min={0}
                                                step={1000}
                                                placeholder="0"
                                                title="Price adjustment"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {group.type === 'single' ? (
                                                <input
                                                    type="radio"
                                                    name={`default-${groupIndex}`}
                                                    checked={option.isDefault}
                                                    onChange={() => onSetDefault(optIndex)}
                                                    className="w-[18px] h-[18px] cursor-pointer accent-[var(--color-gold)]"
                                                />
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={option.isDefault}
                                                    onChange={() => onSetDefault(optIndex)}
                                                    className="w-[18px] h-[18px] cursor-pointer accent-[var(--color-gold)]"
                                                />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="flex items-center justify-center w-8 h-8 bg-transparent text-[var(--theme-text-muted)] rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                            onClick={() => onDeleteOption(optIndex)}
                                            title="Delete option"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-medium text-[var(--theme-text-muted)] bg-transparent border-2 border-dashed border-white/10 rounded-xl hover:border-[var(--color-gold)]/50 hover:text-[var(--color-gold)] transition-colors"
                        onClick={onAddOption}
                    >
                        <Plus size={16} />
                        Add option
                    </button>
                </div>
            )}
        </div>
    )
}
