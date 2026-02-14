import { Search, Users, Building2, Crown, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
    id: string
    name: string
    slug: string
    color: string
}

interface CustomersFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    categoryFilter: string
    onCategoryFilterChange: (value: string) => void
    tierFilter: string
    onTierFilterChange: (value: string) => void
    statusFilter: string
    onStatusFilterChange: (value: string) => void
    categories: Category[]
    customerCount: number
    getCountForCategory: (categoryId: string) => number
}

function getCategoryIcon(type: string) {
    switch (type) {
        case 'wholesale': return <Building2 size={14} />
        case 'vip': return <Crown size={14} />
        case 'staff': return <UserCheck size={14} />
        default: return <Users size={14} />
    }
}

const selectClass = 'py-3 px-4 border border-white/10 rounded-xl bg-black/40 text-sm text-white cursor-pointer min-w-[150px] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 max-md:w-full'

export function CustomersFilters({
    searchTerm,
    onSearchChange,
    categoryFilter,
    onCategoryFilterChange,
    tierFilter,
    onTierFilterChange,
    statusFilter,
    onStatusFilterChange,
    categories,
    customerCount,
    getCountForCategory,
}: CustomersFiltersProps) {
    return (
        <>
            {/* Search & Dropdowns */}
            <div className="flex gap-3 mb-4 flex-wrap max-md:flex-col">
                <div className="flex-1 min-w-[280px] flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 max-md:min-w-full">
                    <Search size={18} className="text-[var(--theme-text-muted)] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, email or member #..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="flex-1 border-none bg-transparent py-3 text-sm text-white outline-none placeholder:text-[var(--theme-text-muted)]"
                    />
                </div>
                <select value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value)} className={selectClass}>
                    <option value="all">All categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select value={tierFilter} onChange={(e) => onTierFilterChange(e.target.value)} className={selectClass}>
                    <option value="all">All tiers</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                </select>
                <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className={selectClass}>
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Category Chip Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    className={cn(
                        'flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/10 bg-transparent text-xs text-[var(--muted-smoke)] cursor-pointer transition-all',
                        categoryFilter === 'all' && 'bg-[var(--color-gold)] border-[var(--color-gold)] text-black font-bold'
                    )}
                    onClick={() => onCategoryFilterChange('all')}
                >
                    <Users size={14} />
                    All ({customerCount})
                </button>
                {categories.map(cat => {
                    const count = getCountForCategory(cat.id)
                    return (
                        <button
                            key={cat.id}
                            className={cn(
                                'flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/10 bg-transparent text-xs text-[var(--muted-smoke)] cursor-pointer transition-all',
                                'hover:border-[var(--chip-color)] hover:text-[var(--chip-color)]',
                                categoryFilter === cat.id && 'bg-[var(--chip-color)] border-[var(--chip-color)] text-white font-bold'
                            )}
                            onClick={() => onCategoryFilterChange(cat.id)}
                            style={{ '--chip-color': cat.color } as React.CSSProperties}
                        >
                            {getCategoryIcon(cat.slug)}
                            {cat.name} ({count})
                        </button>
                    )
                })}
            </div>
        </>
    )
}
