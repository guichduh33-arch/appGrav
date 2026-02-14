import { Calendar, Trash2 } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../../../utils/helpers'

const WASTE_REASONS = [
    { value: 'expired', label: 'Expired' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'quality', label: 'Quality Issue' },
    { value: 'spillage', label: 'Spillage' },
    { value: 'theft', label: 'Theft' },
    { value: 'other', label: 'Other' }
]

interface WasteRecord {
    id: string
    quantity: number
    reason: string | null
    unit_cost: number | null
    created_at: string
    staff_name: string | null
    product: {
        id: string
        name: string
        sku: string
        unit: string
        cost_price: number | null
    } | null
}

// Extract reason type from full reason string (e.g., "Expired: some notes" -> "expired")
const getReasonType = (reason: string | null): string => {
    if (!reason) return 'other'
    const lowerReason = reason.toLowerCase()
    const found = WASTE_REASONS.find(r => lowerReason.startsWith(r.label.toLowerCase()))
    return found ? found.value : 'other'
}

const reasonBadgeStyles: Record<string, string> = {
    expired: 'bg-red-900/20 text-red-400 border-red-900/30',
    damaged: 'bg-amber-900/20 text-amber-400 border-amber-900/30',
    quality: 'bg-amber-900/20 text-amber-400 border-amber-900/30',
    spillage: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
    theft: 'bg-red-900/20 text-red-400 border-red-900/30',
    inventory_adjustment: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]/20',
    other: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
}

interface WastageTableProps {
    records: WasteRecord[]
    isLoading: boolean
}

export default function WastageTable({
    records,
    isLoading,
}: WastageTableProps) {
    if (isLoading) {
        return (
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl flex flex-col items-center justify-center py-16 text-[var(--muted-smoke)]">
                <div className="w-8 h-8 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin mb-3" />
                <span className="text-sm">Loading...</span>
            </div>
        )
    }

    if (records.length === 0) {
        return (
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl flex flex-col items-center justify-center py-16 text-[var(--muted-smoke)]">
                <Trash2 size={48} className="mb-4 opacity-30" />
                <h3 className="text-lg font-medium text-white mb-1">No waste records found</h3>
                <p className="text-sm">Click "Report Waste" to add a new entry</p>
            </div>
        )
    }

    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--stone-text)]/40 uppercase tracking-[0.2em]">
                                Date
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--stone-text)]/40 uppercase tracking-[0.2em]">
                                Item Name
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--stone-text)]/40 uppercase tracking-[0.2em] text-center">
                                Qty
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--stone-text)]/40 uppercase tracking-[0.2em]">
                                Reason
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--stone-text)]/40 uppercase tracking-[0.2em] text-right">
                                Loss Value
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--stone-text)]/40 uppercase tracking-[0.2em]">
                                Recorded By
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-[var(--stone-text)]/40 uppercase tracking-[0.2em]">
                                Notes
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {records.map(record => {
                            const reasonType = getReasonType(record.reason)
                            const badgeStyle = reasonBadgeStyles[reasonType] || reasonBadgeStyles.other

                            return (
                                <tr key={record.id} className="hover:bg-[var(--color-gold)]/[0.03] transition-colors group">
                                    <td className="px-6 py-5 text-sm text-[var(--stone-text)]/70 tabular-nums whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={13} className="text-[var(--muted-smoke)]" />
                                            {formatDateTime(record.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white uppercase">
                                                {record.product?.name}
                                            </span>
                                            <span className="text-[10px] text-[var(--muted-smoke)] mt-0.5">
                                                {record.product?.sku}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[var(--stone-text)]/70 text-center tabular-nums font-semibold">
                                        {Math.abs(record.quantity)} {record.product?.unit}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter border ${badgeStyle}`}>
                                            {record.reason?.split(':')[0] || 'Other'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[var(--color-gold)] font-bold text-right tabular-nums">
                                        {formatCurrency(Math.abs(record.quantity) * (record.unit_cost || 0))}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[var(--stone-text)]/70">
                                        {record.staff_name || '-'}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[var(--muted-smoke)] max-w-[200px] truncate italic">
                                        {record.reason || '-'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
