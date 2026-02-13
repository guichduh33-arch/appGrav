import { memo } from 'react'
import { Menu } from 'lucide-react'
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

const itemBase = 'w-full flex flex-col items-center justify-center py-3 px-1 min-h-[64px] border-none cursor-pointer text-left transition-all duration-200 relative border-l-3 border-l-transparent'
const itemActive = 'border-l-[var(--color-gold)] bg-[var(--color-gold)]/10 text-white'
const itemInactive = 'text-[var(--theme-text-muted)] hover:text-white hover:bg-[var(--theme-bg-tertiary)]'

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
            {/* Menu Button & Logo */}
            <div className="pos-categories__header">
                <div className="flex flex-col items-center mb-4">
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-gold font-bold mb-0.5 opacity-80">The</span>
                    <span className="text-xs font-display font-bold tracking-[0.1em] text-white uppercase">Breakery</span>
                </div>

                <button className="pos-menu-btn" onClick={onOpenMenu} title="Menu" aria-label="Open menu">
                    <Menu size={22} />
                </button>
                <NetworkIndicator compact className="mt-2" />
                <OfflineSessionIndicator compact className="mt-1" />
                <SyncIndicator compact className="mt-1" />
            </div>

            <button
                className={cn(itemBase, selectedCategory === null ? itemActive : itemInactive)}
                onClick={() => onSelectCategory(null)}
            >
                <span className="text-xs font-bold tracking-tight uppercase">All</span>
            </button>

            {categories.map(category => (
                <button
                    key={category.id}
                    className={cn(itemBase, selectedCategory === category.id ? itemActive : itemInactive)}
                    onClick={() => onSelectCategory(category.id)}
                >
                    {category.color && (
                        <div
                            className="w-2.5 h-2.5 rounded-full mb-1 shrink-0"
                            style={{ backgroundColor: category.color }}
                        />
                    )}
                    <span className="text-[0.65rem] font-semibold tracking-tight uppercase text-center leading-tight line-clamp-2">
                        {category.name}
                    </span>
                </button>
            ))}
        </aside>
    )
})
