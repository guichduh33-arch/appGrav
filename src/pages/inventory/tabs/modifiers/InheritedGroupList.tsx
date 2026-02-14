import React from 'react'
import { Copy } from 'lucide-react'
import type { ModifierGroup } from '../../../../hooks/products'
import { formatPrice } from '../../../../utils/helpers'

interface InheritedGroupListProps {
    groups: ModifierGroup[]
    onCopyFromCategory: (group: ModifierGroup) => void
}

export const InheritedGroupList: React.FC<InheritedGroupListProps> = ({
    groups,
    onCopyFromCategory
}) => {
    if (groups.length === 0) return null

    return (
        <div className="bg-[var(--onyx-surface)] border border-dashed border-white/10 rounded-xl overflow-hidden">
            {/* Section Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] m-0">
                    Inherited Groups
                </h4>
            </div>

            {/* Inherited Groups */}
            <div className="flex flex-col">
                {groups.map((group, idx) => (
                    <div key={`cat-${group.name}-${idx}`} className="border-b border-white/5 last:border-b-0">
                        <div className="flex items-center px-5 py-4 gap-3">
                            <div className="flex-1 flex items-center gap-3 min-w-0">
                                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.05em] px-2 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full">
                                    Inherited
                                </span>
                                <h5 className="text-base font-semibold text-white m-0">{group.name}</h5>
                                <span className="text-[13px] text-[var(--theme-text-muted)] flex items-center gap-1">
                                    {group.type === 'single' ? 'Single choice' : 'Multiple choice'}
                                    {group.required && <span className="text-red-400 font-semibold">*</span>}
                                </span>
                            </div>
                            <button
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--color-gold)] bg-transparent border border-[var(--color-gold)]/30 rounded-lg hover:bg-[var(--color-gold)]/10 transition-colors"
                                onClick={() => onCopyFromCategory(group)}
                                title="Customize"
                            >
                                <Copy size={16} />
                                Customize
                            </button>
                        </div>
                        {/* Options Preview */}
                        <div className="flex flex-wrap gap-2 px-5 pb-4">
                            {group.options.map(opt => (
                                <span
                                    key={opt.id}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.03] border border-white/5 rounded-full text-[13px] text-[var(--theme-text-secondary)]"
                                >
                                    {opt.icon && <span className="text-base">{opt.icon}</span>}
                                    {opt.label}
                                    {opt.priceAdjustment > 0 && (
                                        <span className="text-xs text-[var(--color-gold)] font-semibold ml-1">
                                            +{formatPrice(opt.priceAdjustment)}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
