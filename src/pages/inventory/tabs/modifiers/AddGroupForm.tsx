import React from 'react'
import { Plus } from 'lucide-react'

interface AddGroupFormProps {
    newGroupName: string
    newGroupType: 'single' | 'multiple'
    newGroupRequired: boolean
    onNameChange: (name: string) => void
    onTypeChange: (type: 'single' | 'multiple') => void
    onRequiredChange: (required: boolean) => void
    onAdd: () => void
    onCancel: () => void
}

export const AddGroupForm: React.FC<AddGroupFormProps> = ({
    newGroupName,
    newGroupType,
    newGroupRequired,
    onNameChange,
    onTypeChange,
    onRequiredChange,
    onAdd,
    onCancel
}) => {
    return (
        <div className="px-5 py-5 bg-[var(--color-gold)]/[0.03] border-b border-white/5">
            <div className="grid grid-cols-[1fr_160px_auto] gap-4 items-center">
                <input
                    type="text"
                    className="w-full px-3 py-2.5 text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none transition-colors"
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={e => onNameChange(e.target.value)}
                    autoFocus
                />
                <select
                    className="w-full px-3 py-2.5 text-sm bg-black/40 border border-white/10 rounded-xl text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none cursor-pointer transition-colors"
                    value={newGroupType}
                    onChange={e => onTypeChange(e.target.value as 'single' | 'multiple')}
                >
                    <option value="single">Single choice</option>
                    <option value="multiple">Multiple choice</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] cursor-pointer whitespace-nowrap px-3 py-2.5 bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                    <input
                        type="checkbox"
                        checked={newGroupRequired}
                        onChange={e => onRequiredChange(e.target.checked)}
                        className="w-4 h-4 accent-[var(--color-gold)]"
                    />
                    Required
                </label>
            </div>
            <div className="flex gap-3 mt-4 justify-end">
                <button
                    className="px-4 py-2 text-sm font-medium bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[var(--color-gold)] text-black rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={onAdd}
                    disabled={!newGroupName.trim()}
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>
        </div>
    )
}
