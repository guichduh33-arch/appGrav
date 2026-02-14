import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Truck, ArrowRight, Clock
} from 'lucide-react'
import type { IStockMovement } from '@/hooks/inventory'
import { getMovementStyle } from '@/constants/inventory'
import { formatCurrency } from '@/utils/helpers'
import { cn } from '@/lib/utils'

// Format number with thousand separators
const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-'
    return num.toLocaleString('en-US')
}

// Icon mapping for movement types
const MOVEMENT_ICONS: Record<string, React.ReactNode> = {
    production_in: <Factory size={20} />,
    production_out: <Package size={20} />,
    stock_in: <Truck size={20} />,
    purchase: <Truck size={20} />,
    sale: <ShoppingCart size={20} />,
    sale_pos: <ShoppingCart size={20} />,
    sale_b2b: <ShoppingCart size={20} />,
    waste: <Trash2 size={20} />,
    adjustment: <ArrowUpCircle size={20} />,
    adjustment_in: <ArrowUpCircle size={20} />,
    adjustment_out: <ArrowUpCircle size={20} />,
    transfer: <ArrowRight size={20} />,
    opname: <ArrowUpCircle size={20} />
}

function getMovementIcon(type: string): React.ReactNode {
    return MOVEMENT_ICONS[type] || <Package size={20} />
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
        date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
}

interface StockMovementsTableProps {
    movements: IStockMovement[]
    filterType: string
}

export default function StockMovementsTable({ movements, filterType }: StockMovementsTableProps) {
    if (movements.length === 0) {
        return (
            <div className="py-20 text-center text-[var(--muted-smoke)]">
                <Package size={48} className="mb-4 opacity-30 mx-auto" />
                <p className="m-0 font-semibold text-white">No movements</p>
                <p className="mt-2 mb-0 text-sm">
                    {filterType !== 'all'
                        ? 'No movements of this type found'
                        : 'Stock movements will appear here'}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <h5 className="text-[11px] font-bold text-[var(--stone-text)] uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-1 h-4 bg-[var(--color-gold)]" />
                    Recent Activity Logs
                </h5>
                <span className="text-[10px] text-slate-600 uppercase font-medium">
                    {movements.length} movements - Sorted by timestamp (Newest)
                </span>
            </div>

            {/* Movement cards */}
            <div className="max-h-[650px] overflow-y-auto space-y-4">
                {movements.map((movement: IStockMovement) => {
                    const style = getMovementStyle(movement.movement_type)
                    const { date, time } = formatDate(movement.created_at)
                    const isPositive = movement.quantity > 0
                    const value = Math.abs(movement.quantity * movement.product_cost)

                    return (
                        <div
                            key={movement.id}
                            className="bg-[var(--onyx-surface)] border border-white/5 p-6 hover:border-white/20 transition-all group"
                        >
                            <div className="flex items-start gap-8 max-md:flex-wrap max-md:gap-4">
                                {/* Icon */}
                                <div className="w-14 h-14 bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-[var(--color-gold)] transition-colors shrink-0">
                                    {getMovementIcon(movement.movement_type)}
                                </div>

                                {/* Main content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-6 max-md:flex-col max-md:gap-3">
                                        {/* Product info */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-semibold text-white">{movement.product_name}</h4>
                                                {movement.product_sku && (
                                                    <span className="px-2 py-0.5 border border-white/10 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {movement.product_sku}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1"
                                                    style={{
                                                        background: `${style.textColor}10`,
                                                        color: style.textColor
                                                    }}
                                                >
                                                    {style.label}
                                                </span>
                                                <span className="text-[11px] text-slate-500">{style.description}</span>
                                            </div>
                                            {movement.reason && (
                                                <div className="text-sm text-[var(--muted-smoke)] mt-2 max-w-[400px] truncate" title={movement.reason}>
                                                    {movement.reason}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div className="text-right max-md:text-left">
                                            <p className={cn(
                                                'text-3xl font-light tabular-nums leading-none mb-1',
                                                isPositive ? 'text-emerald-400' : 'text-rose-400'
                                            )}>
                                                {isPositive ? '+' : ''}{formatNumber(movement.quantity)} {movement.product_unit}
                                            </p>
                                            <p className="text-[11px] text-[var(--color-gold)] font-bold tabular-nums uppercase tracking-tighter">
                                                {isPositive ? '+' : '-'} {formatCurrency(value)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stock / Timestamp details */}
                                    <div className="grid grid-cols-4 max-md:grid-cols-2 gap-12 pt-6 border-t border-white/5">
                                        <div>
                                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Previous Stock</p>
                                            <p className="text-sm font-medium text-slate-400 tabular-nums">
                                                {movement.stock_before !== null && movement.stock_before !== undefined
                                                    ? `${formatNumber(movement.stock_before)} ${movement.product_unit}`
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Current Balance</p>
                                            <p className="text-sm font-bold text-white tabular-nums">
                                                {movement.stock_after !== null && movement.stock_after !== undefined
                                                    ? `${formatNumber(movement.stock_after)} ${movement.product_unit}`
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="col-span-2 text-right max-md:text-left">
                                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Timestamp</p>
                                            <div className="flex items-center justify-end max-md:justify-start gap-2 text-slate-400 tabular-nums text-xs">
                                                <Clock size={12} />
                                                <span>{date}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span>{time}</span>
                                                {movement.staff_name && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="text-[var(--muted-smoke)]">{movement.staff_name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
