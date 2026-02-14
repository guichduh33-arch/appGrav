import React, { useState, useMemo } from 'react'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Filter, TrendingUp, TrendingDown, Clock, AlertTriangle, Truck, ArrowRight
} from 'lucide-react'
import { Product, StockMovement } from '../../../types/database'
import { MOVEMENT_STYLES, getMovementStyle, type TMovementType } from '@/constants/inventory'

interface StockTabProps {
    product: Product
    stockHistory: StockMovement[]
}

type MovementFilterType = 'all' | TMovementType

const MOVEMENT_ICONS: Record<TMovementType, React.ReactNode> = {
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
    const key = type as TMovementType
    return MOVEMENT_ICONS[key] ?? <Package size={16} />
}

interface MovementWithBalance extends StockMovement {
    stockBefore: number
    stockAfter: number
}

export const StockTab: React.FC<StockTabProps> = ({ product, stockHistory }) => {
    const [filterType, setFilterType] = useState<MovementFilterType>('all')

    const movementsWithBalance = useMemo(() => {
        const sorted = [...stockHistory].sort((a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        )

        const totalMovement = sorted.reduce((sum, m) => sum + m.quantity, 0)
        let runningStock = (product.current_stock || 0) - totalMovement

        const withBalance: MovementWithBalance[] = sorted.map(movement => {
            const stockBefore = runningStock
            runningStock += movement.quantity
            return {
                ...movement,
                stockBefore,
                stockAfter: runningStock
            }
        })

        return withBalance.reverse()
    }, [stockHistory, product.current_stock])

    const filteredHistory = filterType === 'all'
        ? movementsWithBalance
        : movementsWithBalance.filter(m => m.movement_type === filterType)

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
        totalInValue: stockHistory.filter(m => m.quantity > 0).reduce((sum, m) => sum + (m.quantity * costPrice), 0),
        totalOutValue: stockHistory.filter(m => m.quantity < 0).reduce((sum, m) => sum + (Math.abs(m.quantity) * costPrice), 0),
        currentStockValue: (product.current_stock || 0) * costPrice
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return { date: '-', time: '-' }
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

    const getMovementValue = (quantity: number): number => {
        const costPrice = product.cost_price || 0
        return quantity * costPrice
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4">
                {/* Current Stock */}
                <div className="rounded-xl p-5 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
                    <div className="text-[10px] text-[var(--color-gold)] font-bold uppercase tracking-wider mb-1">Current Stock</div>
                    <div className="text-2xl font-bold text-white">{product.current_stock} {product.unit}</div>
                    <div className="text-xs text-[var(--color-gold)]/70 mt-1">{formatIDR(stats.currentStockValue)}</div>
                </div>

                {/* Total In */}
                <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-emerald-400" />
                        <span className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Total In</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">+{stats.totalIn}</div>
                    <div className="text-xs text-emerald-400/70 font-medium">+{formatIDR(stats.totalInValue)}</div>
                </div>

                {/* Total Out */}
                <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={18} className="text-red-400" />
                        <span className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Total Out</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">-{stats.totalOut}</div>
                    <div className="text-xs text-red-400/70 font-medium">-{formatIDR(stats.totalOutValue)}</div>
                </div>

                {/* Production In */}
                <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Factory size={18} className="text-[var(--color-gold)]" />
                        <span className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Prod. In</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-gold)]">+{stats.productionIn}</div>
                    <div className="text-xs text-[var(--color-gold)]/70 font-medium">+{formatIDR(stats.productionIn * costPrice)}</div>
                </div>

                {/* Production Out */}
                <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Package size={18} className="text-rose-400" />
                        <span className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Prod. Out</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-400">-{stats.productionOut}</div>
                    <div className="text-xs text-rose-400/70 font-medium">-{formatIDR(stats.productionOut * costPrice)}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[var(--onyx-surface)] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-[var(--theme-text-muted)]">
                        <Filter size={16} />
                        <span className="font-bold text-[10px] uppercase tracking-wider">Filter:</span>
                    </div>

                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${filterType === 'all'
                                ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30'
                                : 'bg-white/5 text-[var(--theme-text-muted)] border border-white/5 hover:border-white/10'
                            }`}
                    >
                        All ({stockHistory.length})
                    </button>

                    {Object.entries(MOVEMENT_STYLES).map(([type, style]) => {
                        const count = stockHistory.filter(m => m.movement_type === type).length
                        if (count === 0) return null
                        const isActive = filterType === type
                        return (
                            <button
                                key={type}
                                onClick={() => setFilterType(type as MovementFilterType)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${isActive
                                    ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30'
                                    : 'bg-white/5 text-[var(--theme-text-muted)] border border-white/5 hover:border-white/10'
                                }`}
                            >
                                {getMovementIcon(type)}
                                {style.label} ({count})
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Movements List */}
            <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                    <h3 className="m-0 text-base font-semibold text-white">
                        Movement History ({filteredHistory.length})
                    </h3>
                </div>

                {filteredHistory.length > 0 ? (
                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredHistory.map((movement, index) => {
                            const style = getMovementStyle(movement.movement_type)
                            const { date, time } = formatDate(movement.created_at)
                            const isPositive = movement.quantity > 0

                            return (
                                <div
                                    key={movement.id}
                                    className={`px-6 py-4 flex items-center gap-4 transition-colors hover:bg-white/[0.02] ${index < filteredHistory.length - 1 ? 'border-b border-white/5' : ''
                                        }`}
                                >
                                    {/* Type Icon */}
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                                        style={{
                                            backgroundColor: style.bgColor,
                                            borderColor: style.borderColor,
                                            color: style.textColor
                                        }}
                                    >
                                        {getMovementIcon(movement.movement_type)}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: style.bgColor,
                                                    color: style.textColor
                                                }}
                                            >
                                                {style.label}
                                            </span>
                                            <span className="text-[10px] text-[var(--theme-text-muted)]">
                                                {style.description}
                                            </span>
                                        </div>
                                        {movement.reason && (
                                            <div
                                                className="text-xs text-[var(--theme-text-muted)] truncate"
                                                title={movement.reason}
                                            >
                                                {movement.reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stock Before/After */}
                                    <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg shrink-0 border border-white/5">
                                        <div className="text-center">
                                            <div className="text-[9px] text-[var(--theme-text-muted)] uppercase font-bold tracking-wider">Before</div>
                                            <div className="text-sm font-semibold text-[var(--theme-text-muted)]">{movement.stockBefore}</div>
                                        </div>
                                        <ArrowRight size={14} className="text-white/20" />
                                        <div className="text-center">
                                            <div className="text-[9px] text-[var(--theme-text-muted)] uppercase font-bold tracking-wider">After</div>
                                            <div className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {movement.stockAfter}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity & Value */}
                                    <div className="text-center shrink-0 min-w-[100px]">
                                        <div className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isPositive ? '+' : ''}{movement.quantity} {product.unit}
                                        </div>
                                        <div className={`text-xs font-semibold mt-0.5 ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                                            {isPositive ? '+' : '-'}{formatIDR(getMovementValue(movement.quantity))}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="text-right shrink-0 min-w-[90px]">
                                        <div className="text-xs font-medium text-[var(--stone-text)]">
                                            {date}
                                        </div>
                                        <div className="text-[10px] text-[var(--theme-text-muted)] flex items-center justify-end gap-1">
                                            <Clock size={10} />
                                            {time}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="py-16 px-8 text-center">
                        <Package size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="m-0 font-medium text-[var(--theme-text-muted)]">No stock movements</p>
                        <p className="mt-2 text-xs text-[var(--theme-text-muted)] opacity-60">
                            {filterType !== 'all'
                                ? 'No movements of this type found'
                                : 'Stock movements will appear here'}
                        </p>
                    </div>
                )}
            </div>

            {/* Low Stock Warning */}
            {(product.current_stock ?? 0) <= (product.min_stock_level || 0) && (
                <div className="bg-amber-400/10 rounded-xl p-5 border border-amber-400/20 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-amber-400" />
                    <div>
                        <div className="font-semibold text-amber-400 text-sm">Low Stock</div>
                        <div className="text-xs text-amber-400/70">
                            {`Current stock (${product.current_stock} ${product.unit}) is below minimum threshold (${product.min_stock_level} ${product.unit})`}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
