import { cn } from '@/lib/utils'
import { Truck } from 'lucide-react'
import { formatDate } from './b2bOrderDetailHelpers'
import type { Delivery } from './b2bOrderDetailTypes'

interface B2BOrderDeliveriesTabProps {
    deliveries: Delivery[]
}

const deliveryBadgeStyles: Record<string, string> = {
    delivered: 'bg-[rgba(107,142,107,0.15)] text-success',
    pending: 'bg-[rgba(234,192,134,0.2)] text-[#b38600]',
    in_transit: 'bg-[rgba(123,163,181,0.15)] text-info',
}

export default function B2BOrderDeliveriesTab({ deliveries }: B2BOrderDeliveriesTabProps) {
    if (deliveries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-2xl text-[var(--color-gris-chaud)]">
                <Truck size={32} className="opacity-30 mb-sm" />
                <p>No deliveries recorded</p>
            </div>
        )
    }

    return (
        <div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Delivery #</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Scheduled</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Delivered</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Driver</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Received by</th>
                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {deliveries.map(delivery => (
                        <tr key={delivery.id} className="[&:last-child>td]:border-b-0">
                            <td className="p-md text-sm border-b border-border">
                                <span className="font-mono font-semibold text-[var(--color-rose-poudre)]">{delivery.delivery_number}</span>
                            </td>
                            <td className="p-md text-sm border-b border-border">{formatDate(delivery.scheduled_date)}</td>
                            <td className="p-md text-sm border-b border-border">{formatDate(delivery.actual_date)}</td>
                            <td className="p-md text-sm border-b border-border">{delivery.driver_name || '-'}</td>
                            <td className="p-md text-sm border-b border-border">{delivery.received_by || '-'}</td>
                            <td className="p-md text-sm border-b border-border">
                                <span className={cn(
                                    'inline-flex px-2 py-1 rounded-xl text-[10px] font-semibold uppercase',
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
