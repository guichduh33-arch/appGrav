import { Truck } from 'lucide-react'
import { formatDate } from './b2bOrderDetailHelpers'
import type { Delivery } from './b2bOrderDetailTypes'

interface B2BOrderDeliveriesTabProps {
    deliveries: Delivery[]
}

export default function B2BOrderDeliveriesTab({ deliveries }: B2BOrderDeliveriesTabProps) {
    if (deliveries.length === 0) {
        return (
            <div className="b2b-deliveries-list">
                <div className="empty-state">
                    <Truck size={32} />
                    <p>No deliveries recorded</p>
                </div>
            </div>
        )
    }

    return (
        <div className="b2b-deliveries-list">
            <table>
                <thead>
                    <tr>
                        <th>Delivery #</th>
                        <th>Scheduled</th>
                        <th>Delivered</th>
                        <th>Driver</th>
                        <th>Received by</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {deliveries.map(delivery => (
                        <tr key={delivery.id}>
                            <td><span className="delivery-number">{delivery.delivery_number}</span></td>
                            <td>{formatDate(delivery.scheduled_date)}</td>
                            <td>{formatDate(delivery.actual_date)}</td>
                            <td>{delivery.driver_name || '-'}</td>
                            <td>{delivery.received_by || '-'}</td>
                            <td>
                                <span className={`delivery-badge delivery-badge--${delivery.status}`}>
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
