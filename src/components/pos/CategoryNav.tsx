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

const itemBase = 'w-full flex items-center py-5 px-6 min-h-[80px] border-none rounded-lg cursor-pointer text-left transition-all duration-200 text-white relative overflow-hidden shadow-[0_2px_5px_rgba(0,0,0,0.1)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:brightness-110'
const itemActive = 'shadow-[inset_0_0_0_4px_rgba(255,255,255,0.3),0_8px_16px_rgba(0,0,0,0.2)] scale-[1.02] z-[2]'

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
                    <div key={i} className="h-20 w-full bg-gray-100 rounded-lg mb-3 animate-pulse" />
                ))}
            </aside>
        )
    }

    return (
        <aside className="pos-categories">
            {/* Menu Button */}
            <div className="pos-categories__header">
                <button className="pos-menu-btn" onClick={onOpenMenu} title="Menu" aria-label="Open menu">
                    <Menu size={28} />
                </button>
                <NetworkIndicator compact className="mt-2" />
                <OfflineSessionIndicator compact className="mt-1" />
                <SyncIndicator compact className="mt-1" />
            </div>

            <button
                className={cn(itemBase, selectedCategory === null && itemActive)}
                style={{ backgroundColor: '#334155' }}
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
