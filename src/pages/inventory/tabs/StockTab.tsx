import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle, ArrowDownCircle,
    Filter, TrendingUp, TrendingDown, Clock, AlertTriangle, Truck
} from 'lucide-react'
import { Product, StockMovement } from '../../../types/database'

interface StockTabProps {
    product: Product
    stockHistory: StockMovement[]
}

type MovementType = 'all' | 'production' | 'sale' | 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out'

const MOVEMENT_CONFIG: Record<string, {
    label: string
    icon: React.ReactNode
    bgColor: string
    textColor: string
    borderColor: string
    description: string
}> = {
    production: {
        label: 'Production',
        icon: <Factory size={16} />,
        bgColor: '#FEF3C7',
        textColor: '#B45309',
        borderColor: '#FCD34D',
        description: 'Manufactured product'
    },
    sale: {
        label: 'Sale',
        icon: <ShoppingCart size={16} />,
        bgColor: '#DBEAFE',
        textColor: '#1D4ED8',
        borderColor: '#93C5FD',
        description: 'Sold at POS'
    },
    purchase: {
        label: 'Purchase',
        icon: <Truck size={16} />,
        bgColor: '#D1FAE5',
        textColor: '#047857',
        borderColor: '#6EE7B7',
        description: 'Supplier receipt'
    },
    waste: {
        label: 'Waste',
        icon: <Trash2 size={16} />,
        bgColor: '#FEE2E2',
        textColor: '#DC2626',
        borderColor: '#FCA5A5',
        description: 'Loss / Breakage'
    },
    adjustment_in: {
        label: 'Adj. In',
        icon: <ArrowUpCircle size={16} />,
        bgColor: '#ECFDF5',
        textColor: '#059669',
        borderColor: '#A7F3D0',
        description: 'Stock adjustment in'
    },
    adjustment_out: {
        label: 'Adj. Out',
        icon: <ArrowDownCircle size={16} />,
        bgColor: '#FFF7ED',
        textColor: '#EA580C',
        borderColor: '#FDBA74',
        description: 'Stock adjustment out'
    }
}

export const StockTab: React.FC<StockTabProps> = ({ product, stockHistory }) => {
    const { t } = useTranslation()
    const [filterType, setFilterType] = useState<MovementType>('all')

    // Filter movements
    const filteredHistory = filterType === 'all'
        ? stockHistory
        : stockHistory.filter(m => m.movement_type === filterType)

    // Calculate stats
    const stats = {
        totalIn: stockHistory.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0),
        totalOut: stockHistory.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        production: stockHistory.filter(m => m.movement_type === 'production').reduce((sum, m) => sum + m.quantity, 0),
        sales: stockHistory.filter(m => m.movement_type === 'sale').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        purchases: stockHistory.filter(m => m.movement_type === 'purchase').reduce((sum, m) => sum + m.quantity, 0),
        waste: stockHistory.filter(m => m.movement_type === 'waste').reduce((sum, m) => sum + Math.abs(m.quantity), 0)
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
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{product.current_stock}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{product.unit}</div>
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
                </div>

                {/* Productions */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Factory size={18} style={{ color: '#F59E0B' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Production</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#B45309' }}>+{stats.production}</div>
                </div>

                {/* Waste */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Trash2 size={18} style={{ color: '#DC2626' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Waste</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#DC2626' }}>-{stats.waste}</div>
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
                                        {movement.reference_id && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#9CA3AF',
                                                marginTop: '0.25rem'
                                            }}>
                                                Ref: {movement.reference_id.substring(0, 8)}...
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div style={{
                                        textAlign: 'right',
                                        flexShrink: 0
                                    }}>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: isPositive ? '#10B981' : '#EF4444'
                                        }}>
                                            {isPositive ? '+' : ''}{movement.quantity}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                            {product.unit}
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
