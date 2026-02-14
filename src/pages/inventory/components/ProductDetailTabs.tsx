import { cn } from '@/lib/utils'

export type Tab = 'general' | 'units' | 'recipe' | 'costing' | 'prices' | 'variants'

interface ProductDetailTabsProps {
    activeTab: Tab
    onTabChange: (tab: Tab) => void
}

const TABS: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'units', label: 'Units' },
    { key: 'recipe', label: 'Recipe' },
    { key: 'variants', label: 'Variants' },
    { key: 'costing', label: 'Costing' },
    { key: 'prices', label: 'Prices' },
]

export function ProductDetailTabs({ activeTab, onTabChange }: ProductDetailTabsProps) {
    return (
        <div className="border-b border-white/5 px-10">
            <div className="max-w-6xl mx-auto flex gap-10">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={cn(
                            'py-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors bg-transparent cursor-pointer',
                            activeTab === tab.key
                                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                                : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--stone-text)]'
                        )}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
