import { Clock, Trash2, Eye, Lock } from 'lucide-react'
import type { Product, ProductionRecord } from '../../../types/database'
import type { ProductUOM } from '../StockProductionPage'

// Format number with thousand separators
const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US')
}

type RecordWithProduct = { product?: { unit?: string; product_uoms?: ProductUOM[] } }

const getRecordUnit = (record: RecordWithProduct): string => {
    const product = record.product
    if (!product) return 'pcs'
    const consumptionUom = product.product_uoms?.find((u) => u.is_consumption_unit)
    return consumptionUom?.unit_name || product.unit || 'pcs'
}

interface ProductionHistoryProps {
    todayHistory: (ProductionRecord & { product?: Product })[]
    isAdmin: boolean
    onDeleteRecord: (recordId: string) => void
}

export default function ProductionHistory({
    todayHistory,
    isAdmin,
    onDeleteRecord,
}: ProductionHistoryProps) {
    return (
        <div className="bg-[var(--onyx-surface)] rounded-3xl p-6 border border-white/5 flex-1 min-h-[448px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--muted-smoke)]">
                    Today's Production ({todayHistory.length})
                </h3>
                {!isAdmin && (
                    <div className="flex items-center gap-1.5 text-[var(--muted-smoke)] text-xs">
                        <Eye size={14} />
                        Read-only
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[400px] custom-scrollbar">
                {todayHistory.length > 0 ? (
                    todayHistory.map(record => (
                        <div
                            key={record.id}
                            className="px-4 py-3 bg-[var(--theme-bg-primary)] rounded-xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div>
                                <div className="text-sm font-medium text-white">
                                    {record.product?.name}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[var(--muted-smoke)] mt-0.5">
                                    <Clock size={11} />
                                    {record.created_at
                                        ? new Date(record.created_at).toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : ''}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-emerald-900/20 text-emerald-400 border border-emerald-900/30">
                                    +{formatNumber(record.quantity_produced)} {getRecordUnit(record as RecordWithProduct)}
                                </span>
                                {record.quantity_waste && record.quantity_waste > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-red-900/20 text-red-400 border border-red-900/30">
                                        -{formatNumber(record.quantity_waste)} {getRecordUnit(record as RecordWithProduct)}
                                    </span>
                                )}
                                {isAdmin && (
                                    <button
                                        onClick={() => onDeleteRecord(record.id)}
                                        className="p-1 text-red-400/40 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Clock size={36} className="text-[var(--muted-smoke)]/20 mb-4" />
                        <p className="text-sm text-[var(--muted-smoke)] italic">No production recorded yet</p>
                    </div>
                )}
            </div>

            {/* Admin Notice */}
            {!isAdmin && todayHistory.length > 0 && (
                <div className="mt-4 px-4 py-3 bg-amber-900/10 border border-amber-900/20 rounded-xl flex items-center gap-2 text-amber-400 text-xs">
                    <Lock size={14} />
                    <span>Only an administrator can modify entries</span>
                </div>
            )}
        </div>
    )
}
