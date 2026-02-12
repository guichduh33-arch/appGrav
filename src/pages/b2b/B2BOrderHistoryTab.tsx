import { Clock } from 'lucide-react'
import { formatDateTime } from './b2bOrderDetailHelpers'
import type { HistoryEntry } from './b2bOrderDetailTypes'

interface B2BOrderHistoryTabProps {
    history: HistoryEntry[]
}

export default function B2BOrderHistoryTab({ history }: B2BOrderHistoryTabProps) {
    return (
        <div className="p-md">
            {history.map(entry => (
                <div key={entry.id} className="flex gap-md py-md border-b border-border last:border-b-0">
                    <div className="w-8 h-8 flex items-center justify-center bg-[var(--color-blanc-creme)] rounded-full text-[var(--color-gris-chaud)] shrink-0">
                        <Clock size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-[var(--color-brun-chocolat)] mb-1">{entry.description}</p>
                        <span className="text-xs text-[var(--color-gris-chaud)]">{formatDateTime(entry.created_at)}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
