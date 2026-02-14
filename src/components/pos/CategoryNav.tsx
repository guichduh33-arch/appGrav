import { memo } from 'react'
import { Settings, User, Croissant, Cake, Coffee, ShoppingBag, Grid } from 'lucide-react'
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

const itemBase = 'w-full flex flex-col items-center gap-1 py-4 px-1 border-none cursor-pointer text-left transition-all duration-300 relative border-r-2 border-r-transparent bg-transparent hover:text-[var(--color-gold)]'
const itemActive = 'border-r-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
const itemInactive = 'text-[var(--muted-smoke)] hover:bg-[var(--theme-bg-tertiary)]/30'

const getCategoryIcon = (name: string) => {
    const s = name.toLowerCase()
    if (s.includes('boulangerie')) return <Croissant size={24} strokeWidth={1.5} />
    if (s.includes('patisserie')) return <Cake size={24} strokeWidth={1.5} />
    if (s.includes('cafe')) return <Coffee size={24} strokeWidth={1.5} />
    if (s.includes('merch')) return <ShoppingBag size={24} strokeWidth={1.5} />
    return <Grid size={24} strokeWidth={1.5} />
}

export default memo(function CategoryNav({
    categories,
    selectedCategory,
    onSelectCategory,
    isLoading,
    onOpenMenu
}: CategoryNavProps) {
    if (isLoading) {
        return (
            <aside className="w-24 bg-[var(--theme-bg-primary)] border-r border-white/5 flex flex-col items-center py-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 w-12 bg-[var(--onyx-surface)] rounded-lg mb-4 animate-pulse" />
                ))}
            </aside>
        )
    }

    return (
        <aside className="w-24 bg-[var(--theme-bg-primary)] border-r border-white/5 flex flex-col items-center py-8 flex-shrink-0">
            {/* Logo */}
            <div className="mb-12">
                <span className="text-3xl font-display italic font-bold text-[var(--color-gold)] select-none">B</span>
            </div>

            <nav className="flex flex-col w-full flex-1 h-0 overflow-y-auto custom-scrollbar">
                <button
                    className={cn(itemBase, selectedCategory === null ? itemActive : itemInactive)}
                    onClick={() => onSelectCategory(null)}
                >
                    <Grid size={24} strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-widest font-medium mt-1">All</span>
                </button>

                {categories.map(category => (
                    <button
                        key={category.id}
                        className={cn(itemBase, selectedCategory === category.id ? itemActive : itemInactive)}
                        onClick={() => onSelectCategory(category.id)}
                    >
                        {getCategoryIcon(category.name)}
                        <span className="text-[10px] font-medium tracking-widest uppercase text-center leading-tight line-clamp-2 mt-1 px-1">
                            {category.name}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Indicators & Settings */}
            <div className="mt-auto flex flex-col items-center gap-4 w-full">
                <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                    <NetworkIndicator compact />
                    <OfflineSessionIndicator compact />
                    <SyncIndicator compact />
                </div>

                <div className="flex flex-col items-center gap-1 py-4 border-t border-white/5 w-full">
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--muted-smoke)] hover:text-[var(--color-gold)] hover:bg-[var(--theme-bg-tertiary)] transition-colors border-none bg-transparent cursor-pointer"
                        title="Settings"
                        onClick={onOpenMenu}
                    >
                        <Settings size={20} strokeWidth={1.5} />
                    </button>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--muted-smoke)] hover:text-[var(--color-gold)] hover:bg-[var(--theme-bg-tertiary)] transition-colors border-none bg-transparent cursor-pointer"
                        title="Account"
                    >
                        <User size={20} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </aside>
    )
})
