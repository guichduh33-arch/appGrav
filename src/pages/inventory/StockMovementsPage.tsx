import { useState, useMemo } from 'react'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Filter, TrendingUp, TrendingDown, Clock, Truck, ArrowRight,
    Search, Calendar, Download, X
} from 'lucide-react'
import { useStockMovements, type IStockMovement, type TMovementFilterType } from '@/hooks/inventory'
import { useProductListSimple } from '@/hooks/products/useProductList'
import { MOVEMENT_STYLES, getMovementStyle } from '@/constants/inventory'
import { formatCurrency } from '@/utils/helpers'
import { cn } from '@/lib/utils'

// Format number with thousand separators
const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-'
    return num.toLocaleString('en-US')
}
import { toast } from 'sonner'

// Icon mapping for movement types
const MOVEMENT_ICONS: Record<string, React.ReactNode> = {
    production_in: <Factory size={16} />,
    production_out: <Package size={16} />,
    stock_in: <Truck size={16} />,
    purchase: <Truck size={16} />,
    sale: <ShoppingCart size={16} />,
    sale_pos: <ShoppingCart size={16} />,
    sale_b2b: <ShoppingCart size={16} />,
    waste: <Trash2 size={16} />,
    adjustment: <ArrowUpCircle size={16} />,
    adjustment_in: <ArrowUpCircle size={16} />,
    adjustment_out: <ArrowUpCircle size={16} />,
    transfer: <ArrowRight size={16} />,
    opname: <ArrowUpCircle size={16} />
}

function getMovementIcon(type: string): React.ReactNode {
    return MOVEMENT_ICONS[type] || <Package size={16} />
}

export default function StockMovementsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<TMovementFilterType>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [selectedProductId, setSelectedProductId] = useState<string>('')
    const [productSearch, setProductSearch] = useState('')

    // Load products for filter dropdown
    const { data: products = [] } = useProductListSimple()

    // Use the hook instead of direct Supabase call
    const { data: movements = [], isLoading } = useStockMovements({
        type: filterType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
    })

    // Filter movements by search term and product (client-side for instant feedback)
    const filteredMovements = useMemo(() => {
        let filtered = movements

        // Filter by product if selected
        if (selectedProductId) {
            filtered = filtered.filter((m: IStockMovement) => m.product_id === selectedProductId)
        }

        // Filter by search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            filtered = filtered.filter((m: IStockMovement) => {
                const matchesProduct = m.product_name.toLowerCase().includes(search)
                const matchesSku = m.product_sku.toLowerCase().includes(search)
                const matchesReason = m.reason?.toLowerCase().includes(search)
                return matchesProduct || matchesSku || matchesReason
            })
        }

        return filtered
    }, [movements, searchTerm, selectedProductId])

    // Calculate stats
    const stats = useMemo(() => {
        const totalIn = filteredMovements.filter((m: IStockMovement) => m.quantity > 0).reduce((sum: number, m: IStockMovement) => sum + m.quantity, 0)
        const totalOut = filteredMovements.filter((m: IStockMovement) => m.quantity < 0).reduce((sum: number, m: IStockMovement) => sum + Math.abs(m.quantity), 0)
        const productionIn = filteredMovements.filter((m: IStockMovement) => m.movement_type === 'production_in').reduce((sum: number, m: IStockMovement) => sum + m.quantity, 0)
        const productionOut = filteredMovements.filter((m: IStockMovement) => m.movement_type === 'production_out').reduce((sum: number, m: IStockMovement) => sum + Math.abs(m.quantity), 0)
        const totalInValue = filteredMovements.filter((m: IStockMovement) => m.quantity > 0).reduce((sum: number, m: IStockMovement) => sum + (m.quantity * m.product_cost), 0)
        const totalOutValue = filteredMovements.filter((m: IStockMovement) => m.quantity < 0).reduce((sum: number, m: IStockMovement) => sum + (Math.abs(m.quantity) * m.product_cost), 0)

        return { totalIn, totalOut, productionIn, productionOut, totalInValue, totalOutValue }
    }, [filteredMovements])

    // Get movement type counts for filter buttons
    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        movements.forEach((m: IStockMovement) => {
            counts[m.movement_type] = (counts[m.movement_type] || 0) + 1
        })
        return counts
    }, [movements])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return {
            date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
    }

    // Export to Excel
    const handleExportExcel = async () => {
        try {
            const XLSX = await import('xlsx')

            // Prepare data for export
            const exportData = filteredMovements.map((m: IStockMovement) => {
                const { date, time } = formatDate(m.created_at)
                const style = getMovementStyle(m.movement_type)
                return {
                    'Date': date,
                    'Time': time,
                    'Product': m.product_name,
                    'SKU': m.product_sku,
                    'Type': style.label,
                    'Quantity': m.quantity,
                    'Unit': m.product_unit,
                    'Unit Price': m.product_cost,
                    'Value': Math.abs(m.quantity * m.product_cost),
                    'Stock Before': m.stock_before || '-',
                    'Stock After': m.stock_after || '-',
                    'Reason': m.reason || '',
                    'Staff': m.staff_name || ''
                }
            })

            // Create workbook
            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Movements')

            // Generate filename with date
            const now = new Date()
            const filename = `stock_movements_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`

            // Save file
            XLSX.writeFile(wb, filename)

            toast.success(`Export successful: ${filteredMovements.length} movements exported`)
        } catch (error) {
            console.error('Error exporting to Excel:', error)
            toast.error('Error exporting to Excel')
        }
    }

    // Filtered products for autocomplete
    const filteredProducts = useMemo(() => {
        if (!productSearch) return products
        const search = productSearch.toLowerCase()
        return products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.sku.toLowerCase().includes(search)
        )
    }, [products, productSearch])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center px-8 py-16 text-center text-gray-500">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                <p>Loading movements...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4 xl:grid-cols-3 md:grid-cols-2">
                {/* Total Movements */}
                <div className="flex flex-col items-start p-5 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                    <div className="text-xs opacity-90">Total Movements</div>
                    <div className="text-[1.75rem] font-bold">{ filteredMovements.length}</div>
                    <div className="text-xs opacity-90">records</div>
                </div>

                {/* Total In */}
                <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500">
                        <TrendingUp size={18} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Total In</div>
                        <div className="text-2xl font-bold leading-none text-emerald-500">+{formatNumber(stats.totalIn)}</div>
                        <div className="text-xs font-medium mt-1 text-emerald-600">+{formatCurrency(stats.totalInValue)}</div>
                    </div>
                </div>

                {/* Total Out */}
                <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/15 text-red-500">
                        <TrendingDown size={18} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Total Out</div>
                        <div className="text-2xl font-bold leading-none text-red-500">-{formatNumber(stats.totalOut)}</div>
                        <div className="text-xs font-medium mt-1 text-red-600">-{formatCurrency(stats.totalOutValue)}</div>
                    </div>
                </div>

                {/* Production In */}
                <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500">
                        <Factory size={18} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Production In</div>
                        <div className="text-2xl font-bold leading-none text-amber-700">+{formatNumber(stats.productionIn)}</div>
                    </div>
                </div>

                {/* Production Out */}
                <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-700/15 text-pink-700">
                        <Package size={18} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Production Out</div>
                        <div className="text-2xl font-bold leading-none text-pink-700">-{formatNumber(stats.productionOut)}</div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-4 items-center flex-wrap md:flex-col md:items-stretch">
                <div className="flex-1 min-w-[300px] md:min-w-0 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        className="w-full py-3 px-4 pl-11 border border-gray-200 rounded-xl text-[0.9375rem] text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
                        placeholder="Search by product, SKU, reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Product Filter */}
                <div className="relative min-w-[200px]">
                    <div className="relative">
                        <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full py-3 px-4 pl-11 border border-gray-200 rounded-xl text-[0.9375rem] text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
                            placeholder="Filter by product..."
                            value={selectedProductId ? products.find(p => p.id === selectedProductId)?.name || '' : productSearch}
                            onChange={(e) => {
                                setProductSearch(e.target.value)
                                if (!e.target.value) setSelectedProductId('')
                            }}
                            onFocus={() => setProductSearch('')}
                        />
                        {selectedProductId && (
                            <button
                                onClick={() => {
                                    setSelectedProductId('')
                                    setProductSearch('')
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 p-1"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {productSearch && !selectedProductId && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 max-h-[300px] overflow-y-auto shadow-md z-[1000]">
                            {filteredProducts.slice(0, 50).map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProductId(product.id)
                                        setProductSearch('')
                                    }}
                                    className="px-3 py-2 cursor-pointer border-b border-gray-100 text-sm hover:bg-gray-50"
                                >
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-gray-500 text-xs">{product.sku}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 md:justify-center">
                    <div className="relative flex items-center">
                        <Calendar size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                        <input
                            type="date"
                            className="py-3 px-4 pl-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <span className="text-gray-400 text-sm">to</span>
                    <div className="relative flex items-center">
                        <Calendar size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                        <input
                            type="date"
                            className="py-3 px-4 pl-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExportExcel}
                    disabled={filteredMovements.length === 0}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2.5 border-none rounded-lg font-medium text-sm whitespace-nowrap',
                        filteredMovements.length > 0
                            ? 'bg-emerald-500 text-white cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                    title="Export to Excel"
                >
                    <Download size={18} />
                    Excel
                </button>
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-3 flex-wrap p-4 bg-white rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                    <Filter size={18} />
                    <span>Filter:</span>
                </div>

                <button
                    onClick={() => setFilterType('all')}
                    className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm cursor-pointer transition-all duration-150',
                        filterType === 'all'
                            ? 'border-2 font-semibold border-gray-200 bg-white text-gray-500'
                            : 'border-gray-200 bg-white text-gray-500'
                    )}
                >
                    All ({movements.length})
                </button>

                {Object.entries(MOVEMENT_STYLES).map(([type, style]) => {
                    const count = typeCounts[type] || 0
                    if (count === 0) return null
                    return (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as TMovementFilterType)}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm cursor-pointer transition-all duration-150 hover:border-blue-500',
                                filterType === type ? 'border-2 font-semibold' : ''
                            )}
                            style={{
                                background: filterType === type ? style.bgColor : 'white',
                                color: filterType === type ? style.textColor : '#6B7280',
                                borderColor: filterType === type ? style.borderColor : '#E5E7EB'
                            }}
                        >
                            {getMovementIcon(type)}
                            {style.label} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Movements List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="m-0 text-base font-semibold text-gray-700">Movement History ({filteredMovements.length})</h3>
                </div>

                {filteredMovements.length > 0 ? (
                    <div className="max-h-[600px] overflow-y-auto">
                        {filteredMovements.map((movement: IStockMovement) => {
                            const style = getMovementStyle(movement.movement_type)
                            const { date, time } = formatDate(movement.created_at)
                            const isPositive = movement.quantity > 0
                            const value = Math.abs(movement.quantity * movement.product_cost)

                            return (
                                <div key={movement.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 md:flex-wrap">
                                    {/* Type Icon */}
                                    <div
                                        className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 md:order-0"
                                        style={{
                                            background: style.bgColor,
                                            borderColor: style.borderColor,
                                            color: style.textColor
                                        }}
                                    >
                                        {getMovementIcon(movement.movement_type)}
                                    </div>

                                    {/* Product & Details */}
                                    <div className="flex-1 min-w-0 md:w-full md:order-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">{movement.product_name}</span>
                                            {movement.product_sku && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{movement.product_sku}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="px-2 py-1 rounded-md text-xs font-semibold uppercase"
                                                style={{
                                                    background: style.bgColor,
                                                    color: style.textColor
                                                }}
                                            >
                                                {style.label}
                                            </span>
                                            <span className="text-xs text-gray-400">{style.description}</span>
                                        </div>
                                        {movement.reason && (
                                            <div className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]" title={movement.reason}>
                                                {movement.reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity & Value */}
                                    <div className="text-center shrink-0 min-w-[100px] md:order-2 md:text-left">
                                        <div className={cn('text-xl font-bold', isPositive ? 'text-emerald-500' : 'text-red-500')}>
                                            {isPositive ? '+' : ''}{formatNumber(movement.quantity)} {movement.product_unit}
                                        </div>
                                        <div className={cn('text-xs font-semibold mt-0.5', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                                            {isPositive ? '+' : '-'}{formatCurrency(value)}
                                        </div>
                                    </div>

                                    {/* Stock Before/After */}
                                    <div className="flex flex-col gap-1 min-w-[120px] text-[0.8125rem] md:order-3 md:w-full">
                                        <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded">
                                            <span className="text-gray-500 text-xs">Stock before:</span>
                                            <span className="font-semibold text-gray-700">
                                                {movement.stock_before !== null && movement.stock_before !== undefined
                                                    ? `${formatNumber(movement.stock_before)} ${movement.product_unit}`
                                                    : '-'}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            'flex justify-between items-center px-2 py-1 rounded',
                                            isPositive ? 'bg-emerald-50' : 'bg-red-50'
                                        )}>
                                            <span className="text-gray-500 text-xs">Stock after:</span>
                                            <span className={cn('font-semibold', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                                                {movement.stock_after !== null && movement.stock_after !== undefined
                                                    ? `${formatNumber(movement.stock_after)} ${movement.product_unit}`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date & Staff */}
                                    <div className="text-right shrink-0 min-w-[100px] md:order-4 md:text-left">
                                        <div className="text-sm text-gray-600 font-medium">{date}</div>
                                        <div className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                                            <Clock size={12} />
                                            {time}
                                        </div>
                                        {movement.staff_name && (
                                            <div className="text-xs text-gray-500 mt-1">{movement.staff_name}</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="px-8 py-16 text-center text-gray-400">
                        <Package size={48} className="mb-4 opacity-50 mx-auto" />
                        <p className="m-0 font-semibold text-gray-600">No movements</p>
                        <p className="mt-2 mb-0 text-sm">
                            {filterType !== 'all'
                                ? 'No movements of this type found'
                                : 'Stock movements will appear here'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
