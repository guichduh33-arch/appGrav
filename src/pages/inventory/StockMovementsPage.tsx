import { useState, useMemo } from 'react'
import { useStockMovements, type IStockMovement, type TMovementFilterType } from '@/hooks/inventory'
import { useProductListSimple } from '@/hooks/products/useProductList'
import { getMovementStyle } from '@/constants/inventory'
import { toast } from 'sonner'
import { logError } from '@/utils/logger'
import StockMovementsStats from './components/StockMovementsStats'
import StockMovementsFilters from './components/StockMovementsFilters'
import StockMovementsTable from './components/StockMovementsTable'

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

    // Export to CSV
    const handleExportExcel = () => {
        try {
            const formatDate = (dateStr: string) => {
                const date = new Date(dateStr)
                return {
                    date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
            }

            const headers = ['Date', 'Time', 'Product', 'SKU', 'Type', 'Quantity', 'Unit', 'Unit Price', 'Value', 'Stock Before', 'Stock After', 'Reason', 'Staff']
            const rows = filteredMovements.map((m: IStockMovement) => {
                const { date, time } = formatDate(m.created_at)
                const style = getMovementStyle(m.movement_type)
                return [date, time, m.product_name, m.product_sku, style.label, m.quantity, m.product_unit, m.product_cost, Math.abs(m.quantity * m.product_cost), m.stock_before ?? '-', m.stock_after ?? '-', m.reason ?? '', m.staff_name ?? '']
            })

            const escapeCell = (val: string | number) => {
                const s = String(val)
                return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
            }
            const csv = [headers.join(','), ...rows.map(r => r.map(escapeCell).join(','))].join('\n')

            const now = new Date()
            const filename = `stock_movements_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.click()
            URL.revokeObjectURL(url)

            toast.success(`Export successful: ${filteredMovements.length} movements exported`)
        } catch (error) {
            logError('Error exporting to CSV:', error)
            toast.error('Error exporting data')
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
            <div className="flex flex-col items-center justify-center px-8 py-16 text-center text-[var(--muted-smoke)]">
                <div className="w-8 h-8 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                <p className="mt-4">Loading movements...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-10">
            <StockMovementsStats
                totalMovements={filteredMovements.length}
                totalIn={stats.totalIn}
                totalOut={stats.totalOut}
                productionIn={stats.productionIn}
                productionOut={stats.productionOut}
                totalInValue={stats.totalInValue}
                totalOutValue={stats.totalOutValue}
            />

            <StockMovementsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                dateFrom={dateFrom}
                onDateFromChange={setDateFrom}
                dateTo={dateTo}
                onDateToChange={setDateTo}
                selectedProductId={selectedProductId}
                onProductSelect={setSelectedProductId}
                productSearch={productSearch}
                onProductSearchChange={setProductSearch}
                filteredProducts={filteredProducts}
                products={products}
                totalMovements={movements.length}
                filteredMovementsCount={filteredMovements.length}
                typeCounts={typeCounts}
                onExportExcel={handleExportExcel}
            />

            <StockMovementsTable
                movements={filteredMovements}
                filterType={filterType}
            />
        </div>
    )
}
