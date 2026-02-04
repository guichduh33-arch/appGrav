import { Menu } from 'lucide-react'
import type { Category } from '../../types/database'
import { NetworkIndicator } from '../ui/NetworkIndicator'
import { SyncIndicator } from '../ui/SyncIndicator'
import { OfflineSessionIndicator } from '../ui/OfflineSessionIndicator'
import './CategoryNav.css'

interface CategoryNavProps {
    categories: Category[]
    selectedCategory: string | null
    onSelectCategory: (categoryId: string | null) => void
    isLoading?: boolean
    onOpenMenu?: () => void
}


export default function CategoryNav({
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
                    <div key={i} className="pos-categories__item-skeleton" />
                ))}
            </aside>
        )
    }

    return (
        <aside className="pos-categories">
            {/* Menu Button */}
            <div className="pos-categories__header">
                <button className="pos-menu-btn" onClick={onOpenMenu} title="Menu">
                    <Menu size={28} />
                </button>
                {/* Network Status Indicator - Always visible per NFR-U4 */}
                <NetworkIndicator compact className="mt-2" />
                {/* Offline Session Indicator - Story 1.2 */}
                <OfflineSessionIndicator compact className="mt-1" />
                {/* Sync Status Indicator - Story 2.6 */}
                <SyncIndicator compact className="mt-1" />
            </div>

            <button
                className={`pos-categories__item is-all ${selectedCategory === null ? 'is-active' : ''}`}
                onClick={() => onSelectCategory(null)}
            >
                <span className="pos-categories__label">All</span>
            </button>

            {/* Category buttons */}
            {categories.map(category => (
                <button
                    key={category.id}
                    className={`pos-categories__item ${selectedCategory === category.id ? 'is-active' : ''}`}
                    onClick={() => onSelectCategory(category.id)}
                    style={{
                        '--category-color': category.color
                    } as React.CSSProperties}
                >
                    <span className="pos-categories__label">
                        {category.name}
                    </span>
                </button>
            ))}
        </aside>
    )
}
