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

const itemBase = 'w-full flex items-center py-5 px-6 min-h-[80px] border-none rounded-lg cursor-pointer text-left transition-all duration-200 text-white relative overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.3)] [text-shadow:0_1px_4px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(0,0,0,0.4)] hover:brightness-110'
const itemActive = 'shadow-[inset_0_0_0_3px_rgba(201,165,92,0.8),0_8px_20px_rgba(0,0,0,0.5)] scale-[1.02] z-[2]'

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
                    <div key={i} className="h-20 w-full bg-[var(--theme-bg-secondary)] rounded-lg mb-3 animate-pulse" />
                ))}
            </aside>
        )
    }

    return (
        <aside className="pos-categories">
            {/* Menu Button & Logo */}
            <div className="pos-categories__header">
                <div className="flex flex-col items-center mb-6">
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-gold font-bold mb-1 opacity-80">The</span>
                    <span className="text-sm font-display font-bold tracking-[0.1em] text-white uppercase">Breakery</span>
                </div>

                <button className="pos-menu-btn" onClick={onOpenMenu} title="Menu" aria-label="Open menu">
                    <Menu size={28} />
                </button>
                <NetworkIndicator compact className="mt-2" />
                <OfflineSessionIndicator compact className="mt-1" />
                <SyncIndicator compact className="mt-1" />
            </div>

            <button
                className={cn(itemBase, selectedCategory === null && itemActive)}
                style={{ backgroundColor: '#1A1A1D' }} // Warm Charcoal
                onClick={() => onSelectCategory(null)}
            >
                <span className="text-[1.1rem] font-bold tracking-tight uppercase">All</span>
            </button>

            {categories.map(category => (
                <button
                    key={category.id}
                    className={cn(itemBase, selectedCategory === category.id && itemActive)}
                    onClick={() => onSelectCategory(category.id)}
                    style={{ backgroundColor: category.color || '#6b7280' }}
                >
                    <span className="text-[1.1rem] font-bold tracking-tight uppercase">
                        {category.name}
                    </span>
                </button>
            ))}
        </aside>
    )
})
