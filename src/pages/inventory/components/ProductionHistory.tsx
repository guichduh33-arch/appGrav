import { Clock, Trash2, Eye, Lock, CheckCircle, PlayCircle, Thermometer, Snowflake, Timer } from 'lucide-react'
import type { Product, ProductionRecord } from '../../../types/database'
import type { ProductUOM } from '../StockProductionPage'
import { supabase } from '../../../lib/supabase'
import { toast } from 'sonner'

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending: { label: 'Pending', icon: <Clock size={10} />, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    in_progress: { label: 'In Progress', icon: <PlayCircle size={10} />, className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    proofing: { label: 'Proofing', icon: <Timer size={10} />, className: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    baking: { label: 'Baking', icon: <Thermometer size={10} />, className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    cooling: { label: 'Cooling', icon: <Snowflake size={10} />, className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    completed: { label: 'Done', icon: <CheckCircle size={10} />, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

const STATUS_FLOW = ['pending', 'in_progress', 'proofing', 'baking', 'cooling', 'completed']

interface ProductionHistoryProps {
    todayHistory: (ProductionRecord & { product?: Product })[]
    isAdmin: boolean
    onDeleteRecord: (recordId: string) => void
    onStatusChange?: () => void
}

export default function ProductionHistory({
    todayHistory,
    isAdmin,
    onDeleteRecord,
    onStatusChange,
}: ProductionHistoryProps) {
    const handleStatusChange = async (recordId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('production_records')
                .update({ status: newStatus } as never)
                .eq('id', recordId)
            if (error) throw error
            toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
            onStatusChange?.()
        } catch (err) {
            toast.error('Failed to update status')
        }
    }

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
                    todayHistory.map(record => {
                        const status = (record as Record<string, unknown>).status as string || 'pending'
                        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
                        const estCompletion = (record as Record<string, unknown>).estimated_completion as string | null

                        return (
                            <div
                                key={record.id}
                                className="px-4 py-3 bg-[var(--theme-bg-primary)] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-white truncate">
                                            {record.product?.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[var(--muted-smoke)] mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} />
                                                {record.created_at
                                                    ? new Date(record.created_at).toLocaleTimeString('en-US', {
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : ''}
                                            </span>
                                            {estCompletion && (
                                                <span className="flex items-center gap-1 text-[var(--color-gold)]">
                                                    <Timer size={11} />
                                                    ETA {new Date(estCompletion).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
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
                                {/* Status row with transition control */}
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${cfg.className}`}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                    {isAdmin && status !== 'completed' && (
                                        <select
                                            value={status}
                                            onChange={(e) => handleStatusChange(record.id, e.target.value)}
                                            className="ml-auto px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-[10px] font-medium text-[var(--muted-smoke)] focus:border-[var(--color-gold)] focus:outline-none cursor-pointer"
                                            aria-label="Change status"
                                        >
                                            {STATUS_FLOW.map(s => (
                                                <option key={s} value={s}>
                                                    {STATUS_CONFIG[s].label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        )
                    })
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
