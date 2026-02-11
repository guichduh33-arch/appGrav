import { Clock } from 'lucide-react'
import { formatDateTime } from './b2bOrderDetailHelpers'
import type { HistoryEntry } from './b2bOrderDetailTypes'

interface B2BOrderHistoryTabProps {
    history: HistoryEntry[]
}

export default function B2BOrderHistoryTab({ history }: B2BOrderHistoryTabProps) {
    return (
        <div className="b2b-history-list">
            {history.map(entry => (
                <div key={entry.id} className="history-entry">
                    <div className="history-entry__icon">
                        <Clock size={16} />
                    </div>
                    <div className="history-entry__content">
                        <p className="history-entry__description">{entry.description}</p>
                        <span className="history-entry__date">{formatDateTime(entry.created_at)}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
