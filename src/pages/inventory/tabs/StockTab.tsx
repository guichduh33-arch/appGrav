import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle, ArrowDownCircle,
    Filter, TrendingUp, TrendingDown, Clock, AlertTriangle, Truck, ArrowRight
} from 'lucide-react'
import { Product, StockMovement } from '../../../types/database'

interface StockTabProps {
    product: Product
    stockHistory: StockMovement[]
}

type MovementType = 'all' | 'production_in' | 'production_out' | 'stock_in' | 'sale_pos' | 'sale_b2b' | 'waste' | 'opname'

const MOVEMENT_CONFIG: Record<string, {
    label: string
    icon: React.ReactNode
    bgColor: string
    textColor: string
    borderColor: string
    description: string
}> = {
    production_in: {
        label: 'Production In',
        icon: <Factory size={16} />,
        bgColor: '#FEF3C7',
        textColor: '#B45309',
        borderColor: '#FCD34D',
        description: 'Finished/semi-finished produced'
    },
    production_out: {
        label: 'Production Out',
        icon: <Package size={16} />,
        bgColor: '#FDF2F8',
        textColor: '#BE185D',
        borderColor: '#F9A8D4',
        description: 'Ingredients used in production'
    },
    stock_in: {
        label: 'Stock In',
        icon: <Truck size={16} />,
        bgColor: '#D1FAE5',
        textColor: '#047857',
        borderColor: '#6EE7B7',
        description: 'Purchase / Supplier receipt'
    },
    sale_pos: {
        label: 'Sale POS',
        icon: <ShoppingCart size={16} />,
        bgColor: '#DBEAFE',
        textColor: '#1D4ED8',
        borderColor: '#93C5FD',
        description: 'Sold at POS'
    },
    sale_b2b: {
        label: 'Sale B2B',
        icon: <ShoppingCart size={16} />,
        bgColor: '#E0E7FF',
        textColor: '#4338CA',
        borderColor: '#A5B4FC',
        description: 'B2B wholesale sale'
    },
    waste: {
        label: 'Waste',
        icon: <Trash2 size={16} />,
        bgColor: '#FEE2E2',
        textColor: '#DC2626',
        borderColor: '#FCA5A5',
        description: 'Loss / Breakage'
    },
    opname: {
        label: 'Opname',
        icon: <ArrowUpCircle size={16} />,
        bgColor: '#F3F4F6',
        textColor: '#4B5563',
        borderColor: '#D1D5DB',
        description: 'Weekly stock control'
    }
}

interface MovementWithBalance extends StockMovement {
    stockBefore: number
    stockAfter: number
}

export const StockTab: React.FC<StockTabProps> = ({ product, stockHistory }) => {
    const { t } = useTranslation()
    const [filterType, setFilterType] = useState<MovementType>('all')

    // Calculate running balance for each movement (oldest to newest, then reverse for display)
    const movementsWithBalance = useMemo(() => {
        // Sort by date ascending (oldest first) to calculate running balance
        const sorted = [...stockHistory].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        // Start from current stock and work backwards to find initial stock
        const totalMovement = sorted.reduce((sum, m) => sum + m.quantity, 0)
        let runningStock = (product.current_stock || 0) - totalMovement

        // Calculate stock before and after for each movement
        const withBalance: MovementWithBalance[] = sorted.map(movement => {
            const stockBefore = runningStock
            runningStock += movement.quantity
            return {
                ...movement,
                stockBefore,
                stockAfter: runningStock
            }
        })

        // Reverse to show newest first
        return withBalance.reverse()
    }, [stockHistory, product.current_stock])

    // Filter movements
    const filteredHistory = filterType === 'all'
        ? movementsWithBalance
        : movementsWithBalance.filter(m => m.movement_type === filterType)

    // Calculate stats
    const costPrice = product.cost_price || 0
    const stats = {
        totalIn: stockHistory.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0),
        totalOut: stockHistory.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        productionIn: stockHistory.filter(m => m.movement_type === 'production_in').reduce((sum, m) => sum + m.quantity, 0),
        productionOut: stockHistory.filter(m => m.movement_type === 'production_out').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        stockIn: stockHistory.filter(m => m.movement_type === 'stock_in').reduce((sum, m) => sum + m.quantity, 0),
        sales: stockHistory.filter(m => m.movement_type === 'sale_pos' || m.movement_type === 'sale_b2b').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        waste: stockHistory.filter(m => m.movement_type === 'waste').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        opname: stockHistory.filter(m => m.movement_type === 'opname').reduce((sum, m) => sum + m.quantity, 0),
        // Values in IDR
        totalInValue: stockHistory.filter(m => m.quantity > 0).reduce((sum, m) => sum + (m.quantity * costPrice), 0),
        totalOutValue: stockHistory.filter(m => m.quantity < 0).reduce((sum, m) => sum + (Math.abs(m.quantity) * costPrice), 0),
        currentStockValue: (product.current_stock || 0) * costPrice
    }

    const getMovementConfig = (type: string) => {
        return MOVEMENT_CONFIG[type] || {
            label: type,
            icon: <Package size={16} />,
            bgColor: '#F3F4F6',
            textColor: '#6B7280',
            borderColor: '#E5E7EB',
            description: 'Movement'
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return {
            date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
    }

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(amount))
    }

    // Calculate movement value based on cost price
    const getMovementValue = (quantity: number): number => {
        const costPrice = product.cost_price || 0
        return quantity * costPrice
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                {/* Current Stock */}
                <div style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>Current Stock</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{product.current_stock} {product.unit}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.25rem' }}>{formatIDR(stats.currentStockValue)}</div>
                </div>

                {/* Total In */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <TrendingUp size={18} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total In</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>+{stats.totalIn}</div>
                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>+{formatIDR(stats.totalInValue)}</div>
                </div>

                {/* Total Out */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <TrendingDown size={18} style={{ color: '#EF4444' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Out</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444' }}>-{stats.totalOut}</div>
                    <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 500 }}>-{formatIDR(stats.totalOutValue)}</div>
                </div>

                {/* Production In */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Factory size={18} style={{ color: '#F59E0B' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Production In</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#B45309' }}>+{stats.productionIn}</div>
                    <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 500 }}>+{formatIDR(stats.productionIn * costPrice)}</div>
                </div>

                {/* Production Out */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Package size={18} style={{ color: '#BE185D' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Production Out</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#BE185D' }}>-{stats.productionOut}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9D174D', fontWeight: 500 }}>-{formatIDR(stats.productionOut * costPrice)}</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1rem',
                border: '1px solid #E5E7EB'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
                        <Filter size={18} />
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Filter:</span>
                    </div>

                    <button
                        onClick={() => setFilterType('all')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: filterType === 'all' ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                            background: filterType === 'all' ? '#DBEAFE' : 'white',
                            color: filterType === 'all' ? '#1D4ED8' : '#6B7280',
                            fontWeight: filterType === 'all' ? 600 : 500,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        All ({stockHistory.length})
                    </button>

                    {Object.entries(MOVEMENT_CONFIG).map(([type, config]) => {
                        const count = stockHistory.filter(m => m.movement_type === type).length
                        if (count === 0) return null
                        return (
                            <button
                                key={type}
                                onClick={() => setFilterType(type as MovementType)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: filterType === type ? `2px solid ${config.borderColor}` : '1px solid #E5E7EB',
                                    background: filterType === type ? config.bgColor : 'white',
                                    color: filterType === type ? config.textColor : '#6B7280',
                                    fontWeight: filterType === type ? 600 : 500,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem'
                                }}
                            >
                                {config.icon}
                                {config.label} ({count})
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Movements List */}
            <div style={{
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #E5E7EB',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid #E5E7EB',
                    background: '#F9FAFB'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#4A3728' }}>
                        Movement History ({filteredHistory.length})
                    </h3>
                </div>

                {filteredHistory.length > 0 ? (
                    <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                        {filteredHistory.map((movement, index) => {
                            const config = getMovementConfig(movement.movement_type)
                            const { date, time } = formatDate(movement.created_at)
                            const isPositive = movement.quantity > 0

                            return (
                                <div
                                    key={movement.id}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderBottom: index < filteredHistory.length - 1 ? '1px solid #F3F4F6' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Type Icon */}
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '0.75rem',
                                        background: config.bgColor,
                                        border: `1px solid ${config.borderColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: config.textColor,
                                        flexShrink: 0
                                    }}>
                                        {config.icon}
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                background: config.bgColor,
                                                color: config.textColor,
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase'
                                            }}>
                                                {config.label}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                                {config.description}
                                            </span>
                                        </div>
                                        {movement.reason && (
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#6B7280',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }} title={movement.reason}>
                                                {movement.reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stock Before → After */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        background: '#F3F4F6',
                                        borderRadius: '0.5rem',
                                        flexShrink: 0
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.625rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Before</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#4B5563' }}>{movement.stockBefore}</div>
                                        </div>
                                        <ArrowRight size={16} style={{ color: '#9CA3AF' }} />
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.625rem', color: '#9CA3AF', textTransform: 'uppercase' }}>After</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: isPositive ? '#10B981' : '#EF4444' }}>{movement.stockAfter}</div>
                                        </div>
                                    </div>

                                    {/* Quantity & Value */}
                                    <div style={{
                                        textAlign: 'center',
                                        flexShrink: 0,
                                        minWidth: '100px'
                                    }}>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: isPositive ? '#10B981' : '#EF4444'
                                        }}>
                                            {isPositive ? '+' : ''}{movement.quantity} {product.unit}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: isPositive ? '#059669' : '#DC2626',
                                            marginTop: '0.125rem'
                                        }}>
                                            {isPositive ? '+' : '-'}{formatIDR(getMovementValue(movement.quantity))}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div style={{
                                        textAlign: 'right',
                                        flexShrink: 0,
                                        minWidth: '90px'
                                    }}>
                                        <div style={{ fontSize: '0.875rem', color: '#4B5563', fontWeight: 500 }}>
                                            {date}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#9CA3AF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: '0.25rem'
                                        }}>
                                            <Clock size={12} />
                                            {time}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        color: '#9CA3AF'
                    }}>
                        <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p style={{ margin: 0, fontWeight: 500 }}>No stock movements</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                            {filterType !== 'all'
                                ? 'No movements of this type found'
                                : 'Stock movements will appear here'}
                        </p>
                    </div>
                )}
            </div>

            {/* Low Stock Warning */}
            {product.current_stock <= (product.min_stock_level || 0) && (
                <div style={{
                    background: '#FEF3C7',
                    borderRadius: '1rem',
                    padding: '1rem 1.25rem',
                    border: '1px solid #FCD34D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <AlertTriangle size={20} style={{ color: '#D97706' }} />
                    <div>
                        <div style={{ fontWeight: 600, color: '#92400E' }}>Low Stock</div>
                        <div style={{ fontSize: '0.875rem', color: '#B45309' }}>
                            Current stock ({product.current_stock} {product.unit}) is below minimum threshold ({product.min_stock_level} {product.unit})
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
