import React, { useState, useEffect, useCallback } from 'react'
import { Clock, CheckCircle, CheckCheck, ChefHat, AlertTriangle, Pause, Play, Smartphone, Wifi, UtensilsCrossed, Package, Bike, Building2, MapPin, User } from 'lucide-react'
import { useOrderAutoRemove } from '@/hooks/kds/useOrderAutoRemove'
import { useKDSConfigSettings } from '@/hooks/settings/useModuleConfigSettings'
import { KDSCountdownBar } from './KDSCountdownBar'
import { OrderProgressBar } from './OrderProgressBar'
import { cn } from '@/lib/utils'

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

const ORDER_TYPE_ICONS: Record<string, { label: string; Icon: typeof UtensilsCrossed; color: string }> = {
    dine_in: { label: 'Dine In', Icon: UtensilsCrossed, color: '#C9A55C' }, // Aged Gold
    takeaway: { label: 'Takeaway', Icon: Package, color: '#D4B465' },
    delivery: { label: 'Delivery', Icon: Bike, color: '#9CA3AF' },
    b2b: { label: 'B2B', Icon: Building2, color: '#4A5D4E' } // Olive
}

function KDSOrderCard({
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
    const kdsConfig = useKDSConfigSettings()

    // Calculate elapsed time with cleanup to prevent setState on unmounted component
    useEffect(() => {
        let isMounted = true
        const startTime = new Date(createdAt).getTime()

        const updateElapsed = () => {
            if (!isMounted) return
            const now = Date.now()
            setElapsedTime(Math.floor((now - startTime) / 1000))
        }

        updateElapsed()
        const interval = setInterval(updateElapsed, 1000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [createdAt])

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Get urgency level based on elapsed time
    const getUrgencyLevel = () => {
        if (elapsedTime > kdsConfig.urgencyCriticalSeconds) return 'critical'
        if (elapsedTime > kdsConfig.urgencyWarningSeconds) return 'warning'
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
    const orderConfig = ORDER_TYPE_ICONS[orderType] || ORDER_TYPE_ICONS.dine_in

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
        autoRemoveDelay: kdsConfig.autoRemoveDelayMs,
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

    return (
        <div className={cn(
            'relative bg-[var(--kds-surface)] rounded-lg overflow-hidden flex flex-col transition-all duration-300 border-2 border-transparent motion-reduce:transition-none',
            overallStatus === 'new' && 'border-[var(--kds-accent,#ec5b13)] shadow-[0_0_15px_rgba(236,91,19,0.2)] animate-pulse-new motion-reduce:animate-none',
            overallStatus === 'preparing' && 'border-[#A6634B]',
            overallStatus === 'ready' && 'border-[#4A5D4E] bg-gradient-to-br from-[#1a1a1d] to-[#1a2a1a]', // Subtle olive gradient
            overallStatus === 'served' && 'opacity-50 border-[#333]',
            urgency === 'warning' && 'shadow-[0_0_20px_rgba(166,99,75,0.3)]',
            urgency === 'critical' && 'animate-pulse-critical motion-reduce:animate-none',
            isCountingDown && 'shadow-[0_0_20px_rgba(74,93,78,0.4)] border-[#4A5D4E] motion-reduce:shadow-[0_0_5px_rgba(74,93,78,0.3)]',
            isExiting && 'animate-card-exit pointer-events-none motion-reduce:animate-none motion-reduce:opacity-0'
        )}>
            {/* Header */}
            <div className="flex justify-between items-center py-3 px-4 bg-[var(--kds-bg)] border-b border-[var(--kds-border)]">
                <div className="flex items-center gap-2.5">
                    <span className="text-[28px] font-extrabold text-white">#{orderNumber}</span>
                    <span
                        className="text-[0.9rem] font-bold py-2 px-4 rounded-[20px] text-white whitespace-nowrap inline-flex items-center gap-1.5"
                        style={{ backgroundColor: orderConfig.color }}
                    >
                        <orderConfig.Icon size={16} />
                        {orderConfig.label}
                    </span>
                    {/* Story 8.1: Mobile order indicator */}
                    {source === 'mobile' && (
                        <span className="flex items-center justify-center w-9 h-9 rounded-md bg-[#8B5CF6] text-white animate-pulse-mobile motion-reduce:animate-none">
                            <Smartphone size={14} />
                        </span>
                    )}
                    {/* Story 4.3: LAN order indicator */}
                    {source === 'lan' && (
                        <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-[#10B981] text-white text-xs font-semibold rounded-md">
                            <Wifi size={14} />
                            LAN
                        </span>
                    )}
                </div>
                <div className={cn(
                    'flex items-center gap-1.5 font-mono text-[20px] font-semibold py-1.5 px-3 rounded-lg bg-[var(--kds-surface-elevated)]',
                    urgency === 'normal' && 'text-[#4A5D4E]', // Olive
                    urgency === 'warning' && 'text-[var(--kds-accent,#ec5b13)] bg-[rgba(236,91,19,0.15)]', // KDS Orange
                    urgency === 'critical' && 'text-[#991B1B] bg-[rgba(153,27,27,0.2)]' // Deep Red
                )}>
                    <Clock size={16} />
                    <span>{formatTime(elapsedTime)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            {overallStatus !== 'served' && (
                <OrderProgressBar elapsedSeconds={elapsedTime} maxMinutes={kdsConfig.urgencyCriticalSeconds / 60 || 20} />
            )}

            {/* Customer/Table Info */}
            {(tableName || customerName) && (
                <div className="flex gap-4 py-2 px-4 bg-[var(--kds-bg)] text-[0.9rem] text-[#aaa]">
                    {tableName && <span className="flex items-center gap-1"><MapPin size={14} /> {tableName}</span>}
                    {customerName && <span className="flex items-center gap-1"><User size={14} /> {customerName}</span>}
                </div>
            )}

            {/* Items List */}
            <div className="flex-1 py-3 px-4 flex flex-col gap-2.5 overflow-y-auto max-h-[250px]">
                {stationItems.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            'py-2.5 px-3 bg-[var(--kds-bg)] rounded-lg border-l-4 transition-all duration-300',
                            item.item_status === 'new' && 'border-l-[var(--kds-accent,#ec5b13)] shadow-[inset_4px_0_0_var(--kds-accent,#ec5b13)]',
                            item.item_status === 'preparing' && 'border-l-[#A6634B] bg-[rgba(166,99,75,0.1)]',
                            item.item_status === 'ready' && 'border-l-[#4A5D4E] bg-[rgba(74,93,78,0.1)] line-through opacity-70',
                            item.item_status === 'served' && 'border-l-[#333] opacity-40 line-through',
                            item.is_held && '!border-l-[#991B1B] !bg-[rgba(153,27,27,0.15)] opacity-90'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[22px] font-extrabold text-[#F59E0B] min-w-[35px]">{item.quantity}x</span>
                            <span className={cn(
                                'text-lg font-semibold text-white flex-1',
                                item.is_held && 'text-red-300'
                            )}>{item.product_name}</span>
                            {/* Story 8.4: Hold indicator */}
                            {item.is_held && (
                                <span className="py-0.5 px-2 bg-[#DC2626] text-white text-[0.7rem] font-bold rounded uppercase animate-blink-hold motion-reduce:animate-none">HOLD</span>
                            )}
                            {item.item_status === 'ready' && !item.is_held && (
                                <CheckCircle className="text-[#10B981]" size={18} />
                            )}
                            {item.item_status === 'preparing' && !item.is_held && (
                                <ChefHat className="text-[#F59E0B] animate-spin motion-reduce:animate-none" style={{ animationDuration: '2s' }} size={18} />
                            )}
                            {/* Story 8.4: Hold button */}
                            {onToggleHold && item.item_status !== 'served' && (
                                <button
                                    className={cn(
                                        'w-9 h-9 border-none rounded-md bg-[#374151] text-[#9CA3AF] cursor-pointer flex items-center justify-center transition-all duration-200 ml-auto shrink-0 hover:bg-[#4B5563] hover:text-white',
                                        item.is_held && 'bg-[#DC2626] text-white hover:bg-[#EF4444]'
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleHold(item.id, item.is_held)
                                    }}
                                    title={item.is_held ? 'Resume' : 'Hold'}
                                    aria-label={item.is_held ? 'Resume item' : 'Hold item'}
                                >
                                    {item.is_held ? <Play size={14} /> : <Pause size={14} />}
                                </button>
                            )}
                        </div>
                        {item.modifiers && (
                            <div className="mt-1.5 pl-[43px] text-sm text-[#10B981] italic">
                                {item.modifiers}
                            </div>
                        )}
                        {item.notes && (
                            <div className="mt-1.5 py-1.5 px-2.5 ml-[43px] bg-[rgba(239,68,68,0.2)] rounded-md text-sm text-[#EF4444] flex items-center gap-1.5">
                                <AlertTriangle size={12} /> {item.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="py-3 px-4 bg-[var(--kds-bg)] border-t border-[var(--kds-border)]">
                {overallStatus === 'new' && (
                    <button
                        className="w-full py-4 px-5 border-none rounded-[10px] text-lg min-h-[48px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 bg-gradient-to-br from-[#ec5b13] to-[#c44a0f] text-white hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(236,91,19,0.4)]"
                        onClick={handleStartPreparing}
                    >
                        <Play size={20} fill="currentColor" />
                        START
                    </button>
                )}
                {overallStatus === 'preparing' && (
                    <button
                        className="w-full py-4 px-5 border-none rounded-[10px] text-lg min-h-[48px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 bg-gradient-to-br from-[#4A5D4E] to-[#2D3A31] text-white hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(74,93,78,0.4)]"
                        onClick={handleMarkReady}
                    >
                        <CheckCircle size={20} />
                        READY
                    </button>
                )}
                {overallStatus === 'ready' && station === 'waiter' && (
                    <button
                        className="w-full py-4 px-5 border-none rounded-[10px] text-lg min-h-[48px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 bg-gradient-to-br from-[#6B7280] to-[#4B5563] text-white hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(107,114,128,0.4)]"
                        onClick={handleMarkServed}
                    >
                        <CheckCheck size={20} />
                        SERVED
                    </button>
                )}
            </div>

            {/* Story 4.6: Auto-remove countdown bar */}
            {isCountingDown && (
                <KDSCountdownBar
                    timeRemaining={timeRemaining}
                    totalTime={kdsConfig.autoRemoveDelayMs / 1000}
                    onCancel={cancelAutoRemove}
                />
            )}
        </div>
    )
}

export default React.memo(KDSOrderCard)
