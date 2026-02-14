import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Filter, Truck, ArrowRight, Search, Calendar, Download, X
} from 'lucide-react'
import { MOVEMENT_STYLES } from '@/constants/inventory'
import type { TMovementFilterType } from '@/hooks/inventory'
import { cn } from '@/lib/utils'

// Icon mapping for movement types
const MOVEMENT_ICONS: Record<string, React.ReactNode> = {
    production_in: <Factory size={14} />,
    production_out: <Package size={14} />,
    stock_in: <Truck size={14} />,
    purchase: <Truck size={14} />,
    sale: <ShoppingCart size={14} />,
    sale_pos: <ShoppingCart size={14} />,
    sale_b2b: <ShoppingCart size={14} />,
    waste: <Trash2 size={14} />,
    adjustment: <ArrowUpCircle size={14} />,
    adjustment_in: <ArrowUpCircle size={14} />,
    adjustment_out: <ArrowUpCircle size={14} />,
    transfer: <ArrowRight size={14} />,
    opname: <ArrowUpCircle size={14} />
}

function getMovementIcon(type: string): React.ReactNode {
    return MOVEMENT_ICONS[type] || <Package size={14} />
}

interface ProductOption {
    id: string
    name: string
    sku: string
}

interface StockMovementsFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    filterType: TMovementFilterType
    onFilterTypeChange: (type: TMovementFilterType) => void
    dateFrom: string
    onDateFromChange: (value: string) => void
    dateTo: string
    onDateToChange: (value: string) => void
    selectedProductId: string
    onProductSelect: (id: string) => void
    productSearch: string
    onProductSearchChange: (value: string) => void
    filteredProducts: ProductOption[]
    products: ProductOption[]
    totalMovements: number
    filteredMovementsCount: number
    typeCounts: Record<string, number>
    onExportExcel: () => void
}

export default function StockMovementsFilters({
    searchTerm,
    onSearchChange,
    filterType,
    onFilterTypeChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    selectedProductId,
    onProductSelect,
    productSearch,
    onProductSearchChange,
    filteredProducts,
    products,
    totalMovements,
    filteredMovementsCount,
    typeCounts,
    onExportExcel
}: StockMovementsFiltersProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Search & Date Filters */}
            <div className="flex gap-4 items-stretch flex-wrap md:flex-col md:items-stretch">
                {/* Search input */}
                <div className="relative flex-1 min-w-[300px] md:min-w-0">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                        type="text"
                        className="w-full bg-[#1A1A1C] border-none text-sm rounded-none pl-14 pr-4 py-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-[var(--color-gold)] transition-all outline-none"
                        placeholder="Search by SKU, product, or movement batch..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Product Filter */}
                <div className="relative min-w-[200px]">
                    <div className="relative">
                        <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input
                            type="text"
                            className="w-full bg-[#1A1A1C] border-none text-sm rounded-none pl-11 pr-8 py-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-[var(--color-gold)] transition-all outline-none"
                            placeholder="Filter by product..."
                            value={selectedProductId ? products.find(p => p.id === selectedProductId)?.name || '' : productSearch}
                            onChange={(e) => {
                                onProductSearchChange(e.target.value)
                                if (!e.target.value) onProductSelect('')
                            }}
                            onFocus={() => onProductSearchChange('')}
                        />
                        {selectedProductId && (
                            <button
                                onClick={() => {
                                    onProductSelect('')
                                    onProductSearchChange('')
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-500 p-1 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {productSearch && !selectedProductId && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1C] border border-white/10 mt-1 max-h-[300px] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] z-[1000]">
                            {filteredProducts.slice(0, 50).map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        onProductSelect(product.id)
                                        onProductSearchChange('')
                                    }}
                                    className="px-4 py-3 cursor-pointer border-b border-white/5 text-sm hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="font-medium text-white">{product.name}</div>
                                    <div className="text-[var(--muted-smoke)] text-xs mt-0.5">{product.sku}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date range */}
                <div className="flex items-center bg-[#1A1A1C] px-6 py-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Period</span>
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center">
                                <Calendar size={14} className="text-slate-600 mr-1.5" />
                                <input
                                    type="date"
                                    className="bg-transparent border-none p-0 text-xs focus:ring-0 text-white font-medium [color-scheme:dark] outline-none"
                                    value={dateFrom}
                                    onChange={(e) => onDateFromChange(e.target.value)}
                                />
                            </div>
                            <span className="text-slate-700">/</span>
                            <div className="relative flex items-center">
                                <Calendar size={14} className="text-slate-600 mr-1.5" />
                                <input
                                    type="date"
                                    className="bg-transparent border-none p-0 text-xs focus:ring-0 text-white font-medium [color-scheme:dark] outline-none"
                                    value={dateTo}
                                    onChange={(e) => onDateToChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={onExportExcel}
                    disabled={filteredMovementsCount === 0}
                    className={cn(
                        'flex items-center gap-3 px-8 font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all',
                        filteredMovementsCount > 0
                            ? 'bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer'
                            : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    )}
                    title="Export to Excel"
                >
                    <Download size={18} />
                    Excel Export
                </button>
            </div>

            {/* Type Filter Buttons */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                <button
                    onClick={() => onFilterTypeChange('all')}
                    className={cn(
                        'px-6 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap cursor-pointer transition-all shrink-0',
                        filterType === 'all'
                            ? 'bg-white text-black'
                            : 'border border-white/10 text-slate-400 hover:text-white hover:border-white/30'
                    )}
                >
                    <span className="flex items-center gap-1.5">
                        <Filter size={14} />
                        All Movements ({totalMovements})
                    </span>
                </button>

                {Object.entries(MOVEMENT_STYLES).map(([type, style]) => {
                    const count = typeCounts[type] || 0
                    if (count === 0) return null
                    return (
                        <button
                            key={type}
                            onClick={() => onFilterTypeChange(type as TMovementFilterType)}
                            className={cn(
                                'px-6 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap cursor-pointer transition-all shrink-0',
                                filterType === type
                                    ? 'bg-white text-black'
                                    : 'border border-white/10 text-slate-400 hover:text-white hover:border-white/30'
                            )}
                        >
                            <span className="flex items-center gap-1.5">
                                {getMovementIcon(type)}
                                {style.label} ({count})
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
