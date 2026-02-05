import { useState, useMemo, useEffect } from 'react'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Filter, TrendingUp, TrendingDown, Clock, Truck, ArrowRight,
    Search, Calendar, Download, X
} from 'lucide-react'
import { useStockMovements, type IStockMovement, type TMovementFilterType } from '@/hooks/inventory'
import { MOVEMENT_STYLES, getMovementStyle } from '@/constants/inventory'
import { formatCurrency } from '@/utils/helpers'

// Format number with thousand separators (French locale)
const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-'
    return num.toLocaleString('fr-FR')
}
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import './StockMovementsPage.css'

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
    const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string }>>([])
    const [productSearch, setProductSearch] = useState('')

    // Load products for filter
    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        const { data } = await supabase
            .from('products')
            .select('id, name, sku')
            .order('name')

        if (data) setProducts(data)
    }

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
    const handleExportExcel = () => {
        try {
            // Prepare data for export
            const exportData = filteredMovements.map((m: IStockMovement) => {
                const { date, time } = formatDate(m.created_at)
                const style = getMovementStyle(m.movement_type)
                return {
                    'Date': date,
                    'Heure': time,
                    'Produit': m.product_name,
                    'SKU': m.product_sku,
                    'Type': style.label,
                    'Quantité': m.quantity,
                    'Unité': m.product_unit,
                    'Prix Unitaire': m.product_cost,
                    'Valeur': Math.abs(m.quantity * m.product_cost),
                    'Stock Avant': m.stock_before || '-',
                    'Stock Après': m.stock_after || '-',
                    'Raison': m.reason || '',
                    'Personnel': m.staff_name || ''
                }
            })

            // Create workbook
            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Mouvements')

            // Generate filename with date
            const now = new Date()
            const filename = `mouvements_stock_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`

            // Save file
            XLSX.writeFile(wb, filename)

            toast.success(`Export réussi: ${filteredMovements.length} mouvements exportés`)
        } catch (error) {
            console.error('Error exporting to Excel:', error)
            toast.error('Erreur lors de l\'export Excel')
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
            <div className="movements-loading">
                <div className="spinner" />
                <p>Loading movements...</p>
            </div>
        )
    }

    return (
        <div className="stock-movements-page-new">
            {/* Stats Cards */}
            <div className="movements-stats">
                {/* Total Movements */}
                <div className="stat-card stat-primary">
                    <div className="stat-label">Total Movements</div>
                    <div className="stat-value">{filteredMovements.length}</div>
                    <div className="stat-sub">records</div>
                </div>

                {/* Total In */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-green">
                        <TrendingUp size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total In</div>
                        <div className="stat-value text-green">+{formatNumber(stats.totalIn)}</div>
                        <div className="stat-sub text-green">+{formatCurrency(stats.totalInValue)}</div>
                    </div>
                </div>

                {/* Total Out */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-red">
                        <TrendingDown size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Out</div>
                        <div className="stat-value text-red">-{formatNumber(stats.totalOut)}</div>
                        <div className="stat-sub text-red">-{formatCurrency(stats.totalOutValue)}</div>
                    </div>
                </div>

                {/* Production In */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-amber">
                        <Factory size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Production In</div>
                        <div className="stat-value text-amber">+{formatNumber(stats.productionIn)}</div>
                    </div>
                </div>

                {/* Production Out */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-pink">
                        <Package size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Production Out</div>
                        <div className="stat-value text-pink">-{formatNumber(stats.productionOut)}</div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="movements-search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by product, SKU, reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Product Filter */}
                <div className="product-filter-wrapper" style={{ position: 'relative', minWidth: '200px' }}>
                    <div className="search-input-wrapper">
                        <Package size={16} />
                        <input
                            type="text"
                            placeholder="Filtrer par produit..."
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
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    padding: '4px'
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {productSearch && !selectedProductId && filteredProducts.length > 0 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                marginTop: '4px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 1000
                            }}
                        >
                            {filteredProducts.slice(0, 50).map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProductId(product.id)
                                        setProductSearch('')
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #F3F4F6',
                                        fontSize: '0.875rem'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                                    <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>{product.sku}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="date-filters">
                    <div className="date-input-wrapper">
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <span className="date-separator">to</span>
                    <div className="date-input-wrapper">
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExportExcel}
                    disabled={filteredMovements.length === 0}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: filteredMovements.length > 0 ? '#10B981' : '#E5E7EB',
                        color: filteredMovements.length > 0 ? 'white' : '#9CA3AF',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: filteredMovements.length > 0 ? 'pointer' : 'not-allowed',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap'
                    }}
                    title="Exporter en Excel"
                >
                    <Download size={18} />
                    Excel
                </button>
            </div>

            {/* Type Filters */}
            <div className="movements-filters">
                <div className="filter-label">
                    <Filter size={18} />
                    <span>Filter:</span>
                </div>

                <button
                    onClick={() => setFilterType('all')}
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
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
                            className={`filter-btn ${filterType === type ? 'active' : ''}`}
                            style={{
                                '--btn-bg': filterType === type ? style.bgColor : 'white',
                                '--btn-color': filterType === type ? style.textColor : '#6B7280',
                                '--btn-border': filterType === type ? style.borderColor : '#E5E7EB'
                            } as React.CSSProperties}
                        >
                            {getMovementIcon(type)}
                            {style.label} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Movements List */}
            <div className="movements-list-card">
                <div className="movements-list-header">
                    <h3>Movement History ({filteredMovements.length})</h3>
                </div>

                {filteredMovements.length > 0 ? (
                    <div className="movements-list">
                        {filteredMovements.map((movement: IStockMovement) => {
                            const style = getMovementStyle(movement.movement_type)
                            const { date, time } = formatDate(movement.created_at)
                            const isPositive = movement.quantity > 0
                            const value = Math.abs(movement.quantity * movement.product_cost)

                            return (
                                <div key={movement.id} className="movement-item">
                                    {/* Type Icon */}
                                    <div
                                        className="movement-icon"
                                        style={{
                                            background: style.bgColor,
                                            borderColor: style.borderColor,
                                            color: style.textColor
                                        }}
                                    >
                                        {getMovementIcon(movement.movement_type)}
                                    </div>

                                    {/* Product & Details */}
                                    <div className="movement-details">
                                        <div className="movement-product">
                                            <span className="product-name">{movement.product_name}</span>
                                            {movement.product_sku && (
                                                <span className="product-sku">{movement.product_sku}</span>
                                            )}
                                        </div>
                                        <div className="movement-meta">
                                            <span
                                                className="movement-type-badge"
                                                style={{
                                                    background: style.bgColor,
                                                    color: style.textColor
                                                }}
                                            >
                                                {style.label}
                                            </span>
                                            <span className="movement-desc">{style.description}</span>
                                        </div>
                                        {movement.reason && (
                                            <div className="movement-reason" title={movement.reason}>
                                                {movement.reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity & Value */}
                                    <div className="movement-quantity">
                                        <div className={`qty-value ${isPositive ? 'positive' : 'negative'}`}>
                                            {isPositive ? '+' : ''}{formatNumber(movement.quantity)} {movement.product_unit}
                                        </div>
                                        <div className={`qty-cost ${isPositive ? 'positive' : 'negative'}`}>
                                            {isPositive ? '+' : '-'}{formatCurrency(value)}
                                        </div>
                                    </div>

                                    {/* Stock Before/After */}
                                    <div className="movement-stock-info" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        minWidth: '120px',
                                        fontSize: '0.8125rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '4px 8px',
                                            background: '#F9FAFB',
                                            borderRadius: '4px'
                                        }}>
                                            <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Stock avant:</span>
                                            <span style={{ fontWeight: 600, color: '#374151' }}>
                                                {movement.stock_before !== null && movement.stock_before !== undefined
                                                    ? `${formatNumber(movement.stock_before)} ${movement.product_unit}`
                                                    : '-'}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '4px 8px',
                                            background: isPositive ? '#ECFDF5' : '#FEF2F2',
                                            borderRadius: '4px'
                                        }}>
                                            <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Stock après:</span>
                                            <span style={{
                                                fontWeight: 600,
                                                color: isPositive ? '#059669' : '#DC2626'
                                            }}>
                                                {movement.stock_after !== null && movement.stock_after !== undefined
                                                    ? `${formatNumber(movement.stock_after)} ${movement.product_unit}`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date & Staff */}
                                    <div className="movement-date">
                                        <div className="date-value">{date}</div>
                                        <div className="time-value">
                                            <Clock size={12} />
                                            {time}
                                        </div>
                                        {movement.staff_name && (
                                            <div className="staff-name">{movement.staff_name}</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="movements-empty">
                        <Package size={48} />
                        <p className="empty-title">No movements</p>
                        <p className="empty-desc">
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
