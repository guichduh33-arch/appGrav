import { useState, useEffect, useCallback } from 'react'
import { Clock, CheckCircle, ChefHat, AlertTriangle, Pause, Play, Smartphone, Wifi } from 'lucide-react'
import { useOrderAutoRemove } from '@/hooks/kds/useOrderAutoRemove'
import { KDSCountdownBar } from './KDSCountdownBar'
import './KDSOrderCard.css'

interface OrderItem {
    id: string
    product_name: string
    quantity: number
    modifiers?: string
    notes?: string
    item_status: 'new' | 'preparing' | 'ready' | 'served'
    dispatch_station: string
    is_held: boolean // Story 8.4
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
    source?: 'pos' | 'mobile' | 'web' | 'lan' // Story 8.1 + Story 4.3
    onStartPreparing: (orderId: string, itemIds: string[]) => void
    onMarkReady: (orderId: string, itemIds: string[]) => void
    onMarkServed: (orderId: string, itemIds: string[]) => void
    onToggleHold?: (itemId: string, currentHoldStatus: boolean) => void // Story 8.4
    onOrderComplete?: (orderId: string) => void // Story 4.6
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
    source,
    onStartPreparing,
    onMarkReady,
    onMarkServed,
    onToggleHold,
    onOrderComplete,
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

    // Story 4.6: Auto-remove when all items are ready (except waiter station)
    const isWaiterStation = station === 'waiter'
    const allItemsReady = stationItems.every(
        item => item.item_status === 'ready' || item.item_status === 'served'
    )

    // Stable callback for auto-remove completion
    const handleAutoRemoveComplete = useCallback(() => {
        if (onOrderComplete) {
            onOrderComplete(orderId)
        }
    }, [onOrderComplete, orderId])

    const {
        isCountingDown,
        timeRemaining,
        cancelAutoRemove,
        isExiting,
    } = useOrderAutoRemove({
        orderId,
        allItemsReady: allItemsReady && overallStatus === 'ready',
        isWaiterStation,
        autoRemoveDelay: 5000, // 5 seconds
        onComplete: handleAutoRemoveComplete,
    })

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

    // Build dynamic class names for card state
    const cardClassNames = [
        'kds-order-card',
        `kds-order-card--${overallStatus}`,
        `kds-order-card--${urgency}`,
        isCountingDown && 'kds-order-card--countdown',
        isExiting && 'kds-order-card--exiting',
    ].filter(Boolean).join(' ')

    return (
        <div className={cardClassNames}>
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
                    {/* Story 8.1: Mobile order indicator */}
                    {source === 'mobile' && (
                        <span className="kds-order-card__source kds-order-card__source--mobile">
                            <Smartphone size={14} />
                        </span>
                    )}
                    {/* Story 4.3: LAN order indicator */}
                    {source === 'lan' && (
                        <span className="kds-order-card__source kds-order-card__source--lan">
                            <Wifi size={14} />
                            LAN
                        </span>
                    )}
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
                        className={`kds-order-card__item kds-order-card__item--${item.item_status} ${item.is_held ? 'kds-order-card__item--held' : ''}`}
                    >
                        <div className="kds-order-card__item-main">
                            <span className="kds-order-card__item-qty">{item.quantity}×</span>
                            <span className="kds-order-card__item-name">{item.product_name}</span>
                            {/* Story 8.4: Hold indicator */}
                            {item.is_held && (
                                <span className="kds-order-card__item-held-badge">HOLD</span>
                            )}
                            {item.item_status === 'ready' && !item.is_held && (
                                <CheckCircle className="kds-order-card__item-ready" size={18} />
                            )}
                            {item.item_status === 'preparing' && !item.is_held && (
                                <ChefHat className="kds-order-card__item-preparing" size={18} />
                            )}
                            {/* Story 8.4: Hold button */}
                            {onToggleHold && item.item_status !== 'served' && (
                                <button
                                    className={`kds-order-card__hold-btn ${item.is_held ? 'kds-order-card__hold-btn--held' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleHold(item.id, item.is_held)
                                    }}
                                    title={item.is_held ? 'Reprendre' : 'Mettre en attente'}
                                >
                                    {item.is_held ? <Play size={14} /> : <Pause size={14} />}
                                </button>
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

            {/* Story 4.6: Auto-remove countdown bar */}
            {isCountingDown && (
                <KDSCountdownBar
                    timeRemaining={timeRemaining}
                    totalTime={5}
                    onCancel={cancelAutoRemove}
                />
            )}
        </div>
    )
}
