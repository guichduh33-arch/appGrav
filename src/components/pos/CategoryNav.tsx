import { useTranslation } from 'react-i18next'
import type { Category } from '../../types/database'
import './CategoryNav.css'

interface CategoryNavProps {
    categories: Category[]
    selectedCategory: string | null
    onSelectCategory: (categoryId: string | null) => void
    isLoading?: boolean
}


export default function CategoryNav({
    categories,
    selectedCategory,
    onSelectCategory,
    isLoading
}: CategoryNavProps) {
    const { t } = useTranslation()
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
            {/* All Products */}
            <button
                className={`pos-categories__item ${selectedCategory === null ? 'is-active' : ''}`}
                onClick={() => onSelectCategory(null)}
            >
                <span className="pos-categories__label">{t('inventory_page.all')}</span>
            </button>

            {/* Category buttons */}
            {categories.map(category => (
                <button
                    key={category.id}
                    className={`pos-categories__item ${selectedCategory === category.id ? 'is-active' : ''}`}
                    onClick={() => onSelectCategory(category.id)}
                >
                    <span className="pos-categories__label">
                        {category.name}
                    </span>
                </button>
            ))}
        </aside>
    )
}
