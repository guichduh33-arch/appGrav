import { Search, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'

interface Category {
    id: string
    name: string
    color: string | null
}

interface ProductsFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    categoryFilter: string
    onCategoryFilterChange: (value: string) => void
    categories: Category[]
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
}

export default function ProductsFilters({
    searchTerm,
    onSearchChange,
    categoryFilter,
    onCategoryFilterChange,
    categories,
    viewMode,
    onViewModeChange,
}: ProductsFiltersProps) {
    return (
        <div className="flex gap-3 mb-6 items-center flex-wrap md:flex-col">
            <div className="flex-1 min-w-[280px] flex items-center gap-3 px-4 bg-[var(--onyx-surface)] border border-white/10 rounded-xl transition-all duration-200 focus-within:border-[var(--color-gold)] focus-within:ring-1 focus-within:ring-[var(--color-gold)]/20 [&>svg]:text-[var(--theme-text-muted)] [&>svg]:shrink-0 md:w-full md:min-w-0">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 border-none py-3 font-body text-sm bg-transparent text-white outline-none placeholder:text-[var(--theme-text-muted)]"
                />
            </div>
            <select
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="py-3 px-4 border border-white/10 rounded-xl bg-[var(--onyx-surface)] font-body text-sm text-white min-w-[180px] cursor-pointer transition-all duration-200 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239CA3AF%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 md:w-full md:min-w-0"
                aria-label="Filter by category"
            >
                <option value="all">All categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <div className="flex bg-[var(--onyx-surface)] rounded-xl p-1 border border-white/5">
                <button
                    className={cn(
                        'py-2 px-2.5 border-none bg-transparent rounded-lg cursor-pointer text-[var(--theme-text-secondary)] transition-all duration-200 flex items-center justify-center hover:text-white',
                        viewMode === 'grid' && 'bg-white/5 text-[var(--color-gold)] shadow-sm'
                    )}
                    onClick={() => onViewModeChange('grid')}
                    title="Grid view"
                    aria-label="Grid view"
                >
                    <LayoutGrid size={16} />
                </button>
                <button
                    className={cn(
                        'py-2 px-2.5 border-none bg-transparent rounded-lg cursor-pointer text-[var(--theme-text-secondary)] transition-all duration-200 flex items-center justify-center hover:text-white',
                        viewMode === 'list' && 'bg-white/5 text-[var(--color-gold)] shadow-sm'
                    )}
                    onClick={() => onViewModeChange('list')}
                    title="List view"
                    aria-label="List view"
                >
                    <List size={16} />
                </button>
            </div>
        </div>
    )
}
