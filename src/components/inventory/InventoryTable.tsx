import { useState, useMemo, useEffect } from 'react'
import { Edit2, AlertTriangle, Search, Package, FileText } from 'lucide-react'
import type { Product } from '../../types/database'
import { cn } from '@/lib/utils'

interface InventoryTableProps {
    items: (Product & { category: { name: string } | null })[]
    /** Callback for stock adjustment. If undefined, adjustment button is hidden (offline mode). */
    onAdjustStock?: (product: Product) => void
    onViewDetails: (product: Product) => void
    isLoading?: boolean
}

// Debounce hook for search term
function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

export default function InventoryTable({ items, onAdjustStock, onViewDetails, isLoading }: InventoryTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)

    const filteredItems = useMemo(() => {
        if (!debouncedSearchTerm) return items
        const search = debouncedSearchTerm.toLowerCase()
        return items.filter(item =>
            item.name.toLowerCase().includes(search) ||
            item.sku?.toLowerCase().includes(search) ||
            item.category?.name.toLowerCase().includes(search)
        )
    }, [items, debouncedSearchTerm])

    if (isLoading) {
        return <div className="flex items-center justify-center py-16 px-8 text-[var(--theme-text-muted)] font-medium">Loading...</div>
    }

    return (
        <div className="flex flex-col h-full bg-[var(--theme-bg-primary)]">
            <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] shrink-0 max-md:flex-col max-md:gap-4 max-md:items-stretch">
                <div className="relative w-80 max-lg:w-60 max-md:w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, SKU, category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 pr-3 pl-[42px] border border-[var(--theme-border)] rounded-lg text-sm outline-none transition-all duration-200 bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-[3px] focus:ring-[var(--color-gold)]/10"
                    />
                </div>
                <div className="flex gap-3 max-md:justify-center">
                    <span className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] rounded-full text-[0.8rem] font-semibold text-[var(--theme-text-secondary)]">
                        <Package size={16} />
                        {filteredItems.length} items
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="sticky top-0 bg-[var(--theme-bg-tertiary)] px-4 py-3.5 text-left font-semibold text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider border-b-2 border-[var(--theme-border)] z-10 max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">Product</th>
                            <th className="sticky top-0 bg-[var(--theme-bg-tertiary)] px-4 py-3.5 text-left font-semibold text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider border-b-2 border-[var(--theme-border)] z-10 max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">SKU</th>
                            <th className="sticky top-0 bg-[var(--theme-bg-tertiary)] px-4 py-3.5 text-left font-semibold text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider border-b-2 border-[var(--theme-border)] z-10 max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">Category</th>
                            <th className="sticky top-0 bg-[var(--theme-bg-tertiary)] px-4 py-3.5 text-left font-semibold text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider border-b-2 border-[var(--theme-border)] z-10 max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">Type</th>
                            <th className="sticky top-0 bg-[var(--theme-bg-tertiary)] px-4 py-3.5 text-right font-semibold text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider border-b-2 border-[var(--theme-border)] z-10 max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">Current Stock</th>
                            <th className="sticky top-0 bg-[var(--theme-bg-tertiary)] px-4 py-3.5 text-center font-semibold text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider border-b-2 border-[var(--theme-border)] z-10 max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const isLowStock = (item.current_stock ?? 0) <= (item.min_stock_level ?? 0)

                            return (
                                <tr
                                    key={item.id}
                                    className={cn(
                                        'transition-colors duration-150 hover:bg-[var(--theme-bg-secondary)] [&:last-child_td]:border-b-0',
                                        isLowStock && 'bg-gradient-to-r from-[var(--color-danger-bg)] to-transparent hover:from-[var(--color-danger-bg)] hover:bg-[var(--theme-bg-secondary)]'
                                    )}
                                >
                                    <td className="px-4 py-4 border-b border-[var(--theme-border)] text-[var(--theme-text-primary)] align-middle max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div
                                                    className="font-semibold text-[var(--theme-text-primary)] leading-snug cursor-pointer transition-colors duration-150 hover:text-[var(--color-gold)]"
                                                    onClick={() => onViewDetails(item)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault()
                                                            onViewDetails(item)
                                                        }
                                                    }}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    {item.name}
                                                </div>
                                                {isLowStock && (
                                                    <div className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[var(--color-danger-text)] mt-1 px-2 py-0.5 bg-[var(--color-danger-bg)] rounded-full w-fit">
                                                        <AlertTriangle size={12} />
                                                        Low stock
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 border-b border-[var(--theme-border)] align-middle max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">
                                        <span className="font-mono text-[var(--theme-text-secondary)] text-[0.8rem] bg-[var(--theme-bg-tertiary)] px-2 py-1 rounded-sm tracking-wide">{item.sku}</span>
                                    </td>
                                    <td className="px-4 py-4 border-b border-[var(--theme-border)] align-middle max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">
                                        <span className="inline-flex items-center py-1.5 px-3 bg-gradient-to-br from-[var(--color-gold)]/5 to-[var(--color-gold)]/10 rounded-full text-xs text-[var(--color-gold)] font-semibold">
                                            {item.category?.name || 'No category'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 border-b border-[var(--theme-border)] text-[0.8rem] text-[var(--theme-text-secondary)] align-middle max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">
                                        {formatProductType(item.product_type)}
                                    </td>
                                    <td className="px-4 py-4 border-b border-[var(--theme-border)] text-right whitespace-nowrap align-middle max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">
                                        <span className={cn('font-bold text-lg text-[var(--theme-text-primary)]', isLowStock && '!text-[var(--color-danger-text)]')}>
                                            {item.current_stock}
                                        </span>
                                        <span className="ml-1.5 text-xs text-[var(--theme-text-muted)] font-medium">{item.unit}</span>
                                    </td>
                                    <td className="px-4 py-4 border-b border-[var(--theme-border)] text-center align-middle max-md:px-2 max-md:py-3 max-md:text-[0.8rem]">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                className="w-9 h-9 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] cursor-pointer inline-flex items-center justify-center text-[var(--theme-text-secondary)] transition-all duration-200 hover:bg-[var(--color-gold)]/5 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/20 hover:-translate-y-px hover:shadow-sm"
                                                onClick={() => onViewDetails(item)}
                                                title="View details"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            {onAdjustStock && (
                                                <button
                                                    className="w-9 h-9 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] cursor-pointer inline-flex items-center justify-center text-[var(--theme-text-secondary)] transition-all duration-200 hover:bg-[var(--color-gold)]/5 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/20 hover:-translate-y-px hover:shadow-sm"
                                                    onClick={() => onAdjustStock(item)}
                                                    title="Adjust stock"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-[var(--theme-text-muted)] gap-4 text-center [&_svg]:opacity-50">
                        <Package size={48} />
                        <p className="text-base font-medium text-[var(--theme-text-secondary)] m-0">No items found</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function formatProductType(type: string | null | undefined): string {
    switch (type) {
        case 'finished': return 'Finished'
        case 'raw_material': return 'Raw Material'
        case 'semi_finished': return 'Semi-Finished'
        default: return type || 'Unknown'
    }
}
