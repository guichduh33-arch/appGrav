import {
    Factory, Package, TrendingUp, TrendingDown
} from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'

// Format number with thousand separators
const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-'
    return num.toLocaleString('en-US')
}

interface StockMovementsStatsProps {
    totalMovements: number
    totalIn: number
    totalOut: number
    productionIn: number
    productionOut: number
    totalInValue: number
    totalOutValue: number
}

export default function StockMovementsStats({
    totalMovements,
    totalIn,
    totalOut,
    productionIn,
    productionOut,
    totalInValue,
    totalOutValue
}: StockMovementsStatsProps) {
    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Total Movements - Hero card */}
            <div className="col-span-12 lg:col-span-4 bg-blue-600 rounded-none p-8 text-white relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />
                <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-white/70">Total Movements</p>
                    <h3 className="text-5xl font-light leading-none mb-4 tabular-nums">{totalMovements}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-white/60">
                        records in current period
                    </div>
                </div>
            </div>

            {/* Metric cards */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-4 max-lg:grid-cols-2 gap-6">
                {/* Total In */}
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Total In</p>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={16} className="text-emerald-400" />
                            <h4 className="text-2xl font-semibold text-emerald-400 tabular-nums">+{formatNumber(totalIn)}</h4>
                        </div>
                    </div>
                    <p className="text-[10px] text-emerald-400/70 mt-2 font-medium tabular-nums">+{formatCurrency(totalInValue)}</p>
                </div>

                {/* Total Out */}
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Total Out</p>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={16} className="text-rose-400" />
                            <h4 className="text-2xl font-semibold text-rose-400 tabular-nums">-{formatNumber(totalOut)}</h4>
                        </div>
                    </div>
                    <p className="text-[10px] text-rose-400/70 mt-2 font-medium tabular-nums">-{formatCurrency(totalOutValue)}</p>
                </div>

                {/* Production In */}
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Prod. In</p>
                        <div className="flex items-center gap-2 mb-1">
                            <Factory size={16} className="text-white/60" />
                            <h4 className="text-2xl font-semibold text-white tabular-nums">+{formatNumber(productionIn)}</h4>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase">Completed SKU</p>
                </div>

                {/* Production Out */}
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Prod. Out</p>
                        <div className="flex items-center gap-2 mb-1">
                            <Package size={16} className="text-white/60" />
                            <h4 className="text-2xl font-semibold text-white tabular-nums">-{formatNumber(productionOut)}</h4>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase">Base ingredients</p>
                </div>
            </div>
        </div>
    )
}
