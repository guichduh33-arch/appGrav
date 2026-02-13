import { memo } from 'react'
import { Menu, Settings, User } from 'lucide-react'
import type { Category } from '../../types/database'
import { NetworkIndicator } from '../ui/NetworkIndicator'
import { SyncIndicator } from '../ui/SyncIndicator'
import { OfflineSessionIndicator } from '../ui/OfflineSessionIndicator'
import { cn } from '@/lib/utils'

interface CategoryNavProps {
    categories: Category[]
    selectedCategory: string | null
    onSelectCategory: (categoryId: string | null) => void
    isLoading?: boolean
    onOpenMenu?: () => void
}

const itemBase = 'w-full flex flex-col items-center gap-1 py-4 px-1 border-none cursor-pointer text-left transition-all duration-200 relative border-r-2 border-r-transparent bg-transparent'
const itemActive = 'border-r-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
const itemInactive = 'text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--theme-bg-tertiary)]'

export default memo(function CategoryNav({
    categories,
    selectedCategory,
    onSelectCategory,
    isLoading,
    onOpenMenu
}: CategoryNavProps) {
    if (isLoading) {
        return (
            <aside className="pos-categories">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 w-full bg-[var(--theme-bg-secondary)] rounded mb-1 animate-pulse" />
                ))}
            </aside>
        )
    }

    return (
        <aside className="pos-categories">
            {/* Logo */}
            <div className="pos-categories__header">
                <div className="flex flex-col items-center mb-4">
                    <span className="text-2xl font-display italic font-bold text-[var(--color-gold)]">B</span>
                </div>

                <button className="pos-menu-btn" onClick={onOpenMenu} title="Menu" aria-label="Open menu">
                    <Menu size={20} />
                </button>
                <NetworkIndicator compact className="mt-2" />
                <OfflineSessionIndicator compact className="mt-1" />
                <SyncIndicator compact className="mt-1" />
            </div>

            <button
                className={cn(itemBase, selectedCategory === null ? itemActive : itemInactive)}
                onClick={() => onSelectCategory(null)}
            >
                <span className="text-[10px] uppercase tracking-widest font-medium">All</span>
            </button>

            {categories.map(category => (
                <button
                    key={category.id}
                    className={cn(itemBase, selectedCategory === category.id ? itemActive : itemInactive)}
                    onClick={() => onSelectCategory(category.id)}
                >
                    {category.color && (
                        <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: category.color }}
                        />
                    )}
                    <span className="text-[10px] font-medium tracking-widest uppercase text-center leading-tight line-clamp-2">
                        {category.name}
                    </span>
                </button>
            ))}

            {/* Bottom icons */}
            <div className="mt-auto flex flex-col items-center gap-1 py-4 border-t border-white/5">
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--theme-bg-tertiary)] transition-colors border-none bg-transparent cursor-pointer"
                    title="Settings"
                    aria-label="Settings"
                    onClick={onOpenMenu}
                >
                    <Settings size={18} />
                </button>
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--theme-bg-tertiary)] transition-colors border-none bg-transparent cursor-pointer"
                    title="Account"
                    aria-label="Account"
                >
                    <User size={18} />
                </button>
            </div>
        </aside>
    )
})
