import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Filter, TrendingUp, TrendingDown, Clock, AlertTriangle, Truck, ArrowRight
} from 'lucide-react'
import { Product, StockMovement } from '../../../types/database'

interface StockTabProps {
    product: Product
    stockHistory: StockMovement[]
}

type MovementType = 'all' | 'production_in' | 'production_out' | 'stock_in' | 'sale_pos' | 'sale_b2b' | 'waste' | 'opname' | 'purchase' | 'adjustment_in' | 'adjustment_out' | 'sale' | 'production'

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
    useTranslation() // Translation hook for future use
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

    // Calculate stats - cast movement_type to string for flexible comparison
    const costPrice = product.cost_price || 0
    const getMovementType = (m: StockMovement): string => m.movement_type as string
    const stats = {
        totalIn: stockHistory.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0),
        totalOut: stockHistory.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        productionIn: stockHistory.filter(m => getMovementType(m) === 'production_in').reduce((sum, m) => sum + m.quantity, 0),
        productionOut: stockHistory.filter(m => getMovementType(m) === 'production_out').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        stockIn: stockHistory.filter(m => getMovementType(m) === 'stock_in').reduce((sum, m) => sum + m.quantity, 0),
        sales: stockHistory.filter(m => getMovementType(m) === 'sale_pos' || getMovementType(m) === 'sale_b2b').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        waste: stockHistory.filter(m => getMovementType(m) === 'waste').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        opname: stockHistory.filter(m => getMovementType(m) === 'opname').reduce((sum, m) => sum + m.quantity, 0),
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
        <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4">
                {/* Current Stock */}
                <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-500 to-blue-700">
                    <div className="text-xs opacity-90 mb-1">Current Stock</div>
                    <div className="text-2xl font-bold">{product.current_stock} {product.unit}</div>
                    <div className="text-xs opacity-90 mt-1">{formatIDR(stats.currentStockValue)}</div>
                </div>

                {/* Total In */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <span className="text-xs text-gray-500">Total In</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-500">+{stats.totalIn}</div>
                    <div className="text-xs text-emerald-600 font-medium">+{formatIDR(stats.totalInValue)}</div>
                </div>

                {/* Total Out */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={18} className="text-red-500" />
                        <span className="text-xs text-gray-500">Total Out</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">-{stats.totalOut}</div>
                    <div className="text-xs text-red-600 font-medium">-{formatIDR(stats.totalOutValue)}</div>
                </div>

                {/* Production In */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Factory size={18} className="text-amber-500" />
                        <span className="text-xs text-gray-500">Production In</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-700">+{stats.productionIn}</div>
                    <div className="text-xs text-amber-800 font-medium">+{formatIDR(stats.productionIn * costPrice)}</div>
                </div>

                {/* Production Out */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Package size={18} className="text-pink-600" />
                        <span className="text-xs text-gray-500">Production Out</span>
                    </div>
                    <div className="text-2xl font-bold text-pink-600">-{stats.productionOut}</div>
                    <div className="text-xs text-pink-800 font-medium">-{formatIDR(stats.productionOut * costPrice)}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Filter size={18} />
                        <span className="font-medium text-sm">Filter:</span>
                    </div>

                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all'
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500 font-semibold'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        All ({stockHistory.length})
                    </button>

                    {Object.entries(MOVEMENT_CONFIG).map(([type, config]) => {
                        const count = stockHistory.filter(m => m.movement_type === type).length
                        if (count === 0) return null
                        const isActive = filterType === type
                        return (
                            <button
                                key={type}
                                onClick={() => setFilterType(type as MovementType)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${isActive ? 'border-2 font-semibold' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                style={isActive ? {
                                    backgroundColor: config.bgColor,
                                    color: config.textColor,
                                    borderColor: config.borderColor
                                } : {}}
                            >
                                {config.icon}
                                {config.label} ({count})
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Movements List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="m-0 text-base font-semibold text-gray-800">
                        Movement History ({filteredHistory.length})
                    </h3>
                </div>

                {filteredHistory.length > 0 ? (
                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredHistory.map((movement, index) => {
                            const config = getMovementConfig(movement.movement_type)
                            const { date, time } = formatDate(movement.created_at)
                            const isPositive = movement.quantity > 0

                            return (
                                <div
                                    key={movement.id}
                                    className={`px-5 py-4 flex items-center gap-4 transition-colors hover:bg-gray-50 ${index < filteredHistory.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    {/* Type Icon */}
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                                        style={{
                                            backgroundColor: config.bgColor,
                                            borderColor: config.borderColor,
                                            color: config.textColor
                                        }}
                                    >
                                        {config.icon}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="px-2 py-1 rounded-md text-xs font-semibold uppercase"
                                                style={{
                                                    backgroundColor: config.bgColor,
                                                    color: config.textColor
                                                }}
                                            >
                                                {config.label}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {config.description}
                                            </span>
                                        </div>
                                        {movement.reason && (
                                            <div
                                                className="text-sm text-gray-500 truncate"
                                                title={movement.reason}
                                            >
                                                {movement.reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stock Before → After */}
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg shrink-0">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400 uppercase">Before</div>
                                            <div className="text-base font-semibold text-gray-600">{movement.stockBefore}</div>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-400" />
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400 uppercase">After</div>
                                            <div className={`text-base font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {movement.stockAfter}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity & Value */}
                                    <div className="text-center shrink-0 min-w-[100px]">
                                        <div className={`text-xl font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {isPositive ? '+' : ''}{movement.quantity} {product.unit}
                                        </div>
                                        <div className={`text-xs font-semibold mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {isPositive ? '+' : '-'}{formatIDR(getMovementValue(movement.quantity))}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="text-right shrink-0 min-w-[90px]">
                                        <div className="text-sm font-medium text-gray-600">
                                            {date}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                            <Clock size={12} />
                                            {time}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="py-16 px-8 text-center text-gray-400">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="m-0 font-medium">No stock movements</p>
                        <p className="mt-2 text-sm">
                            {filterType !== 'all'
                                ? 'No movements of this type found'
                                : 'Stock movements will appear here'}
                        </p>
                    </div>
                )}
            </div>

            {/* Low Stock Warning */}
            {product.current_stock <= (product.min_stock_level || 0) && (
                <div className="bg-amber-100 rounded-2xl p-5 border border-amber-300 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-amber-600" />
                    <div>
                        <div className="font-semibold text-amber-800">Low Stock</div>
                        <div className="text-sm text-amber-700">
                            Current stock ({product.current_stock} {product.unit}) is below minimum threshold ({product.min_stock_level} {product.unit})
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
