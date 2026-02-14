import { Clock } from 'lucide-react'
import { formatDateTime } from './b2bOrderDetailHelpers'
import type { HistoryEntry } from './b2bOrderDetailTypes'

interface B2BOrderHistoryTabProps {
    history: HistoryEntry[]
}

export default function B2BOrderHistoryTab({ history }: B2BOrderHistoryTabProps) {
    return (
        <div className="p-4">
            {history.map(entry => (
                <div key={entry.id} className="flex gap-4 py-4 border-b border-white/5 last:border-b-0">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/[0.04] rounded-full text-[var(--theme-text-muted)] shrink-0">
                        <Clock size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-white mb-1">{entry.description}</p>
                        <span className="text-xs text-[var(--theme-text-muted)]">{formatDateTime(entry.created_at)}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
