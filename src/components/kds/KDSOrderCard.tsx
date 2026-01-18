import { useState, useEffect } from 'react'
import { Clock, CheckCircle, ChefHat, AlertTriangle } from 'lucide-react'
import './KDSOrderCard.css'

interface OrderItem {
    id: string
    product_name: string
    quantity: number
    modifiers?: string
    notes?: string
    item_status: 'new' | 'preparing' | 'ready' | 'served'
    dispatch_station: string
}

interface KDSOrderCardProps {
    orderId: string
    orderNumber: string
    orderType: 'dine_in' | 'takeaway' | 'delivery' | 'b2b'
    tableName?: string
    customerName?: string
    items: OrderItem[]
    createdAt: string
    station: string
    onStartPreparing: (orderId: string, itemIds: string[]) => void
    onMarkReady: (orderId: string, itemIds: string[]) => void
    onMarkServed: (orderId: string, itemIds: string[]) => void
}

const ORDER_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    dine_in: { label: 'Dine In', icon: '🍽️', color: '#10B981' },
    takeaway: { label: 'Takeaway', icon: '🥡', color: '#F59E0B' },
    delivery: { label: 'Delivery', icon: '🚴', color: '#3B82F6' },
    b2b: { label: 'B2B', icon: '🏢', color: '#8B5CF6' }
}

export default function KDSOrderCard({
    orderId,
    orderNumber,
    orderType,
    tableName,
    customerName,
    items,
    createdAt,
    station,
    onStartPreparing,
    onMarkReady,
    onMarkServed
}: KDSOrderCardProps) {
    const [elapsedTime, setElapsedTime] = useState(0)

    // Calculate elapsed time
    useEffect(() => {
        const startTime = new Date(createdAt).getTime()

        const updateElapsed = () => {
            const now = Date.now()
            setElapsedTime(Math.floor((now - startTime) / 1000))
        }

        updateElapsed()
        const interval = setInterval(updateElapsed, 1000)

        return () => clearInterval(interval)
    }, [createdAt])

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Get urgency level based on elapsed time
    const getUrgencyLevel = () => {
        if (elapsedTime > 600) return 'critical' // > 10 min
        if (elapsedTime > 300) return 'warning'  // > 5 min
        return 'normal'
    }

    // Filter items for this station (for waiter station, show all)
    const stationItems = station === 'waiter'
        ? items
        : items.filter(item => item.dispatch_station === station || item.dispatch_station === 'kitchen' && station === 'hot_kitchen')

    // Get overall status
    const getOverallStatus = () => {
        if (stationItems.every(item => item.item_status === 'served')) return 'served'
        if (stationItems.every(item => item.item_status === 'ready' || item.item_status === 'served')) return 'ready'
        if (stationItems.some(item => item.item_status === 'preparing')) return 'preparing'
        return 'new'
    }

    const overallStatus = getOverallStatus()
    const urgency = getUrgencyLevel()
    const orderConfig = ORDER_TYPE_CONFIG[orderType] || ORDER_TYPE_CONFIG.dine_in

    const handleStartPreparing = () => {
        const itemIds = stationItems.filter(i => i.item_status === 'new').map(i => i.id)
        if (itemIds.length > 0) {
            onStartPreparing(orderId, itemIds)
        }
    }

    const handleMarkReady = () => {
        const itemIds = stationItems.filter(i => i.item_status === 'preparing').map(i => i.id)
        if (itemIds.length > 0) {
            onMarkReady(orderId, itemIds)
        }
    }

    const handleMarkServed = () => {
        const itemIds = stationItems.filter(i => i.item_status === 'ready').map(i => i.id)
        if (itemIds.length > 0) {
            onMarkServed(orderId, itemIds)
        }
    }

    if (stationItems.length === 0) return null

    return (
        <div className={`kds-order-card kds-order-card--${overallStatus} kds-order-card--${urgency}`}>
            {/* Header */}
            <div className="kds-order-card__header">
                <div className="kds-order-card__order-info">
                    <span className="kds-order-card__number">#{orderNumber}</span>
                    <span
                        className="kds-order-card__type"
                        style={{ backgroundColor: orderConfig.color }}
                    >
                        {orderConfig.icon} {orderConfig.label}
                    </span>
                </div>
                <div className={`kds-order-card__timer kds-order-card__timer--${urgency}`}>
                    <Clock size={16} />
                    <span>{formatTime(elapsedTime)}</span>
                </div>
            </div>

            {/* Customer/Table Info */}
            {(tableName || customerName) && (
                <div className="kds-order-card__customer">
                    {tableName && <span className="kds-order-card__table">📍 {tableName}</span>}
                    {customerName && <span className="kds-order-card__name">👤 {customerName}</span>}
                </div>
            )}

            {/* Items List */}
            <div className="kds-order-card__items">
                {stationItems.map((item) => (
                    <div
                        key={item.id}
                        className={`kds-order-card__item kds-order-card__item--${item.item_status}`}
                    >
                        <div className="kds-order-card__item-main">
                            <span className="kds-order-card__item-qty">{item.quantity}×</span>
                            <span className="kds-order-card__item-name">{item.product_name}</span>
                            {item.item_status === 'ready' && (
                                <CheckCircle className="kds-order-card__item-ready" size={18} />
                            )}
                            {item.item_status === 'preparing' && (
                                <ChefHat className="kds-order-card__item-preparing" size={18} />
                            )}
                        </div>
                        {item.modifiers && (
                            <div className="kds-order-card__item-modifiers">
                                {item.modifiers}
                            </div>
                        )}
                        {item.notes && (
                            <div className="kds-order-card__item-notes">
                                <AlertTriangle size={12} /> {item.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="kds-order-card__actions">
                {overallStatus === 'new' && (
                    <button
                        className="kds-order-card__btn kds-order-card__btn--start"
                        onClick={handleStartPreparing}
                    >
                        <ChefHat size={20} />
                        Start
                    </button>
                )}
                {overallStatus === 'preparing' && (
                    <button
                        className="kds-order-card__btn kds-order-card__btn--ready"
                        onClick={handleMarkReady}
                    >
                        <CheckCircle size={20} />
                        Ready
                    </button>
                )}
                {overallStatus === 'ready' && station === 'waiter' && (
                    <button
                        className="kds-order-card__btn kds-order-card__btn--served"
                        onClick={handleMarkServed}
                    >
                        <CheckCircle size={20} />
                        Served
                    </button>
                )}
            </div>
        </div>
    )
}
