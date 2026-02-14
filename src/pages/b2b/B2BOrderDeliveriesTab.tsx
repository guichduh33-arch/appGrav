import { cn } from '@/lib/utils'
import { Truck } from 'lucide-react'
import { formatDate } from './b2bOrderDetailHelpers'
import type { Delivery } from './b2bOrderDetailTypes'

interface B2BOrderDeliveriesTabProps {
    deliveries: Delivery[]
}

const deliveryBadgeStyles: Record<string, string> = {
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    in_transit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export default function B2BOrderDeliveriesTab({ deliveries }: B2BOrderDeliveriesTabProps) {
    if (deliveries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-[var(--theme-text-muted)]">
                <Truck size={32} className="opacity-30 mb-3" />
                <p>No deliveries recorded</p>
            </div>
        )
    }

    return (
        <div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {['Delivery #', 'Scheduled', 'Delivered', 'Driver', 'Received by', 'Status'].map(th => (
                            <th key={th} className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] border-b border-white/5">{th}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {deliveries.map(delivery => (
                        <tr key={delivery.id} className="border-b border-white/5 [&:last-child]:border-b-0">
                            <td className="p-4 text-sm">
                                <span className="font-mono font-semibold text-[var(--color-gold)]">{delivery.delivery_number}</span>
                            </td>
                            <td className="p-4 text-sm text-[var(--theme-text-muted)]">{formatDate(delivery.scheduled_date)}</td>
                            <td className="p-4 text-sm text-[var(--theme-text-muted)]">{formatDate(delivery.actual_date)}</td>
                            <td className="p-4 text-sm text-white">{delivery.driver_name || '-'}</td>
                            <td className="p-4 text-sm text-white">{delivery.received_by || '-'}</td>
                            <td className="p-4 text-sm">
                                <span className={cn(
                                    'inline-flex px-2 py-1 rounded-full text-[10px] font-semibold uppercase border',
                                    deliveryBadgeStyles[delivery.status] || ''
                                )}>
                                    {delivery.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
