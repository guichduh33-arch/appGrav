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
            'relative bg-[var(--kds-surface)] rounded-xl overflow-hidden flex flex-col transition-all duration-300 border border-[var(--kds-border)] motion-reduce:transition-none',
            overallStatus === 'new' && 'border-[var(--kds-accent)] shadow-[0_0_15px_rgba(236,91,19,0.15)] animate-pulse-new motion-reduce:animate-none',
            overallStatus === 'preparing' && 'border-amber-600/50',
            overallStatus === 'ready' && 'border-emerald-600/50',
            overallStatus === 'served' && 'opacity-50 border-white/5',
            urgency === 'warning' && 'shadow-[0_0_20px_rgba(236,91,19,0.2)]',
            urgency === 'critical' && 'animate-pulse-critical motion-reduce:animate-none',
            isCountingDown && 'shadow-[0_0_20px_rgba(74,93,78,0.4)] border-emerald-600/50 motion-reduce:shadow-[0_0_5px_rgba(74,93,78,0.3)]',
            isExiting && 'animate-card-exit pointer-events-none motion-reduce:animate-none motion-reduce:opacity-0'
        )}>
            {/* Status badge top */}
            <div className={cn(
                'py-1 px-4 text-[10px] font-bold tracking-widest uppercase text-center',
                overallStatus === 'new' && 'bg-[var(--kds-accent)]/20 text-[var(--kds-accent)]',
                overallStatus === 'preparing' && 'bg-amber-500/15 text-amber-400',
                overallStatus === 'ready' && 'bg-emerald-500/15 text-emerald-400',
                overallStatus === 'served' && 'bg-white/5 text-[var(--muted-smoke)]',
            )}>
                {overallStatus}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center py-2.5 px-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-extrabold text-[var(--stone-text)]">#{orderNumber}</span>
                    <span
                        className="text-xs font-bold py-1 px-2.5 rounded-full text-white whitespace-nowrap inline-flex items-center gap-1"
                        style={{ backgroundColor: orderConfig.color }}
                    >
                        <orderConfig.Icon size={12} />
                        {orderConfig.label}
                    </span>
                    {/* Story 8.1: Mobile order indicator */}
                    {source === 'mobile' && (
                        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-violet-600/80 text-white animate-pulse-mobile motion-reduce:animate-none">
                            <Smartphone size={12} />
                        </span>
                    )}
                    {/* Story 4.3: LAN order indicator */}
                    {source === 'lan' && (
                        <span className="inline-flex items-center gap-1 py-0.5 px-2 bg-emerald-600/80 text-white text-[10px] font-semibold rounded-md">
                            <Wifi size={12} />
                            LAN
                        </span>
                    )}
                </div>
                <div className={cn(
                    'flex items-center gap-1.5 font-mono text-base font-semibold py-1 px-2.5 rounded-lg bg-[var(--kds-surface-elevated)]',
                    urgency === 'normal' && 'text-[var(--muted-smoke)]',
                    urgency === 'warning' && 'text-[var(--kds-accent)] bg-[var(--kds-accent)]/10',
                    urgency === 'critical' && 'text-red-500 bg-red-500/10'
                )}>
                    <Clock size={14} />
                    <span>{formatTime(elapsedTime)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            {overallStatus !== 'served' && (
                <OrderProgressBar elapsedSeconds={elapsedTime} maxMinutes={kdsConfig.urgencyCriticalSeconds / 60 || 20} />
            )}

            {/* Customer/Table Info */}
            {(tableName || customerName) && (
                <div className="flex gap-4 py-1.5 px-4 border-b border-white/5 text-xs text-[var(--muted-smoke)]">
                    {tableName && <span className="flex items-center gap-1"><MapPin size={12} /> {tableName}</span>}
                    {customerName && <span className="flex items-center gap-1"><User size={12} /> {customerName}</span>}
                </div>
            )}

            {/* Items List */}
            <div className="flex-1 py-2.5 px-3 flex flex-col gap-2 overflow-y-auto max-h-[250px]">
                {stationItems.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            'py-2 px-2.5 bg-[var(--kds-bg)] rounded-lg border-l-3 transition-all duration-300',
                            item.item_status === 'new' && 'border-l-[var(--kds-accent)]',
                            item.item_status === 'preparing' && 'border-l-amber-500 bg-amber-500/5',
                            item.item_status === 'ready' && 'border-l-emerald-500 bg-emerald-500/5 line-through opacity-70',
                            item.item_status === 'served' && 'border-l-white/10 opacity-40 line-through',
                            item.is_held && '!border-l-red-700 !bg-red-900/15 opacity-90'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-[var(--kds-accent)] min-w-[30px]">{item.quantity}x</span>
                            <span className={cn(
                                'text-sm font-semibold text-[var(--stone-text)] flex-1',
                                item.is_held && 'text-red-300'
                            )}>{item.product_name}</span>
                            {/* Story 8.4: Hold indicator */}
                            {item.is_held && (
                                <span className="py-0.5 px-1.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase animate-blink-hold motion-reduce:animate-none">HOLD</span>
                            )}
                            {item.item_status === 'ready' && !item.is_held && (
                                <CheckCircle className="text-emerald-500" size={16} />
                            )}
                            {item.item_status === 'preparing' && !item.is_held && (
                                <ChefHat className="text-amber-400 animate-spin motion-reduce:animate-none" style={{ animationDuration: '2s' }} size={16} />
                            )}
                            {/* Story 8.4: Hold button */}
                            {onToggleHold && item.item_status !== 'served' && (
                                <button
                                    className={cn(
                                        'w-8 h-8 border-none rounded-md bg-[var(--kds-surface-elevated)] text-[var(--muted-smoke)] cursor-pointer flex items-center justify-center transition-all duration-200 ml-auto shrink-0 hover:bg-[var(--kds-surface-hover)] hover:text-white',
                                        item.is_held && 'bg-red-700 text-white hover:bg-red-600'
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleHold(item.id, item.is_held)
                                    }}
                                    title={item.is_held ? 'Resume' : 'Hold'}
                                    aria-label={item.is_held ? 'Resume item' : 'Hold item'}
                                >
                                    {item.is_held ? <Play size={12} /> : <Pause size={12} />}
                                </button>
                            )}
                        </div>
                        {item.modifiers && (
                            <div className="mt-1 pl-[38px] text-xs text-emerald-400 italic">
                                {item.modifiers}
                            </div>
                        )}
                        {item.notes && (
                            <div className="mt-1 py-1 px-2 ml-[38px] bg-red-500/10 rounded-md text-xs text-red-400 flex items-center gap-1.5">
                                <AlertTriangle size={11} /> {item.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="py-2.5 px-3 border-t border-white/5">
                {overallStatus === 'new' && (
                    <button
                        className="w-full py-3 px-4 border-none rounded-lg text-sm min-h-[44px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 bg-[var(--kds-accent)] text-white hover:brightness-110 hover:shadow-[0_4px_20px_rgba(236,91,19,0.3)]"
                        onClick={handleStartPreparing}
                    >
                        <Play size={16} fill="currentColor" />
                        START
                    </button>
                )}
                {overallStatus === 'preparing' && (
                    <button
                        className="w-full py-3 px-4 border-none rounded-lg text-sm min-h-[44px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 bg-emerald-700 text-white hover:bg-emerald-600 hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                        onClick={handleMarkReady}
                    >
                        <CheckCircle size={16} />
                        READY
                    </button>
                )}
                {overallStatus === 'ready' && station === 'waiter' && (
                    <button
                        className="w-full py-3 px-4 border-none rounded-lg text-sm min-h-[44px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 bg-[var(--kds-surface-elevated)] text-[var(--stone-text)] hover:bg-[var(--kds-surface-hover)] hover:shadow-[0_4px_20px_rgba(107,114,128,0.2)]"
                        onClick={handleMarkServed}
                    >
                        <CheckCheck size={16} />
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
