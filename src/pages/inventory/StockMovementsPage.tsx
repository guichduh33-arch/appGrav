import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Filter, TrendingUp, TrendingDown, Clock, Truck, ArrowRight,
    Search, Calendar
} from 'lucide-react'
import { useStockMovements, type IStockMovement, type TMovementFilterType } from '@/hooks/inventory'
import { MOVEMENT_STYLES, getMovementStyle } from '@/constants/inventory'
import { formatCurrency } from '@/utils/helpers'
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
    const { t, i18n } = useTranslation()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<TMovementFilterType>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // Use the hook instead of direct Supabase call
    const { data: movements = [], isLoading } = useStockMovements({
        type: filterType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
    })

    // Filter movements by search term (client-side for instant feedback)
    const filteredMovements = useMemo(() => {
        if (!searchTerm) return movements

        const search = searchTerm.toLowerCase()
        return movements.filter((m: IStockMovement) => {
            const matchesProduct = m.product_name.toLowerCase().includes(search)
            const matchesSku = m.product_sku.toLowerCase().includes(search)
            const matchesReason = m.reason?.toLowerCase().includes(search)
            return matchesProduct || matchesSku || matchesReason
        })
    }, [movements, searchTerm])

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
        const locale = i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'id' ? 'id-ID' : 'en-US'
        return {
            date: date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
        }
    }

    if (isLoading) {
        return (
            <div className="movements-loading">
                <div className="spinner" />
                <p>{t('stock_movements.loading', 'Loading movements...')}</p>
            </div>
        )
    }

    return (
        <div className="stock-movements-page-new">
            {/* Stats Cards */}
            <div className="movements-stats">
                {/* Total Movements */}
                <div className="stat-card stat-primary">
                    <div className="stat-label">{t('stock_movements.stats.total_movements', 'Total Movements')}</div>
                    <div className="stat-value">{filteredMovements.length}</div>
                    <div className="stat-sub">{t('stock_movements.stats.records', 'records')}</div>
                </div>

                {/* Total In */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-green">
                        <TrendingUp size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('stock_movements.stats.total_in', 'Total In')}</div>
                        <div className="stat-value text-green">+{stats.totalIn}</div>
                        <div className="stat-sub text-green">+{formatCurrency(stats.totalInValue)}</div>
                    </div>
                </div>

                {/* Total Out */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-red">
                        <TrendingDown size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('stock_movements.stats.total_out', 'Total Out')}</div>
                        <div className="stat-value text-red">-{stats.totalOut}</div>
                        <div className="stat-sub text-red">-{formatCurrency(stats.totalOutValue)}</div>
                    </div>
                </div>

                {/* Production In */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-amber">
                        <Factory size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('stock_movements.stats.production_in', 'Production In')}</div>
                        <div className="stat-value text-amber">+{stats.productionIn}</div>
                    </div>
                </div>

                {/* Production Out */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-pink">
                        <Package size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('stock_movements.stats.production_out', 'Production Out')}</div>
                        <div className="stat-value text-pink">-{stats.productionOut}</div>
                    </div>
                </div>
            </div>

            {/* Search & Date Filters */}
            <div className="movements-search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('stock_movements.search_placeholder', 'Search by product, SKU, reason...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                    <span className="date-separator">{t('stock_movements.to', 'to')}</span>
                    <div className="date-input-wrapper">
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Type Filters */}
            <div className="movements-filters">
                <div className="filter-label">
                    <Filter size={18} />
                    <span>{t('stock_movements.filter', 'Filter')}:</span>
                </div>

                <button
                    onClick={() => setFilterType('all')}
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                >
                    {t('stock_movements.all', 'All')} ({movements.length})
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
                            {t(style.labelKey, style.label)} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Movements List */}
            <div className="movements-list-card">
                <div className="movements-list-header">
                    <h3>{t('stock_movements.history', 'Movement History')} ({filteredMovements.length})</h3>
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
                                                {t(style.labelKey, style.label)}
                                            </span>
                                            <span className="movement-desc">{t(style.descriptionKey, style.description)}</span>
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
                                            {isPositive ? '+' : ''}{movement.quantity} {movement.product_unit}
                                        </div>
                                        <div className={`qty-cost ${isPositive ? 'positive' : 'negative'}`}>
                                            {isPositive ? '+' : '-'}{formatCurrency(value)}
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
                        <p className="empty-title">{t('stock_movements.empty.title', 'No movements')}</p>
                        <p className="empty-desc">
                            {filterType !== 'all'
                                ? t('stock_movements.empty.filtered', 'No movements of this type found')
                                : t('stock_movements.empty.default', 'Stock movements will appear here')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
