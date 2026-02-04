import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import KDSOrderCard from '../../components/kds/KDSOrderCard'
import { ArrowLeft, Volume2, VolumeX, RefreshCw, ChefHat, Coffee, Store, Users, AlertTriangle } from 'lucide-react'
import { broadcastOrderStatus } from '../../services/display/displayBroadcast'
import { markItemsPreparing, markItemsReady, completeOrder } from '../../services/kds'
import { useLanClient } from '../../hooks/lan/useLanClient'
import { useKdsOrderReceiver } from '../../hooks/kds/useKdsOrderReceiver'
import { useKdsOrderQueue, type IKdsOrder, type IKdsOrderItem } from '../../hooks/kds/useKdsOrderQueue'
import { LanConnectionIndicator } from '../../components/lan/LanConnectionIndicator'
import { playNewOrderSound } from '../../utils/audio'
import type { IKdsNewOrderPayload, TKitchenStation } from '../../types/offline'
import './KDSMainPage.css'

// Story 4.4: Use IKdsOrder and IKdsOrderItem from hook for type consistency

const STATION_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string; dbStation: string }> = {
    hot_kitchen: {
        name: 'Hot Kitchen',
        icon: <ChefHat size={24} />,
        color: '#EF4444',
        dbStation: 'kitchen'
    },
    barista: {
        name: 'Barista',
        icon: <Coffee size={24} />,
        color: '#8B5CF6',
        dbStation: 'barista'
    },
    display: {
        name: 'Display',
        icon: <Store size={24} />,
        color: '#10B981',
        dbStation: 'display'
    },
    waiter: {
        name: 'Waiter',
        icon: <Users size={24} />,
        color: '#3B82F6',
        dbStation: 'all'
    }
}

// KDS Configuration Constants
// TODO: Make configurable via settings (Story 4.x)
const KDS_URGENT_THRESHOLD_SECONDS = 600 // 10 minutes - orders older than this are marked urgent

export default function KDSMainPage() {
    const { station } = useParams<{ station: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [soundEnabled, setSoundEnabled] = useState(true)
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
    // Story 4.4 Fix: Use ref instead of state to avoid dependency cycle in fetchOrders
    const lastOrderCountRef = useRef(0)

    const stationConfig = station ? STATION_CONFIG[station] : null

    // Story 4.4: Use KDS Order Queue hook for state management
    const {
        orders,
        urgentOrders,
        normalOrders,
        urgentCount,
        addOrder,
        setOrders,
        updateOrderItem,
        removeOrder,
    } = useKdsOrderQueue({
        urgentThresholdSeconds: KDS_URGENT_THRESHOLD_SECONDS,
        onOrderBecameUrgent: () => {
            if (soundEnabled) {
                playNewOrderSound()
            }
        },
    })

    // Story 4.2: LAN Client Connection
    const {
        connectionStatus,
        reconnectAttempts,
    } = useLanClient({
        deviceType: 'kds',
        deviceName: 'Kitchen Display',
        station: stationConfig?.dbStation,
        autoConnect: true,
    })

    // Memoize existing order IDs for duplicate detection
    const existingOrderIds = useMemo(() => new Set(orders.map(o => o.id)), [orders])

    // Story 4.3: Callback to handle orders received via LAN
    // Story 4.4: Uses addOrder from useKdsOrderQueue for FIFO insertion
    const handleLanOrder = useCallback((payload: IKdsNewOrderPayload, source: 'lan') => {
        // Convert LAN payload to IKdsOrder format
        const newOrder: IKdsOrder = {
            id: payload.order_id,
            order_number: payload.order_number,
            order_type: payload.order_type,
            table_name: payload.table_number ? `Table ${payload.table_number}` : undefined,
            items: payload.items.map(item => ({
                id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                modifiers: item.modifiers.join(', '),
                notes: item.notes || undefined,
                item_status: 'new' as const,
                dispatch_station: payload.station,
                is_held: false,
            })),
            created_at: payload.timestamp,
            status: 'preparing',
            source: source, // Mark as LAN source
        }

        // Story 4.4: Use hook's addOrder which handles FIFO sorting and duplicate detection
        addOrder(newOrder)

        // Update order count for sound tracking (using ref)
        lastOrderCountRef.current += 1
    }, [addOrder])

    // Story 4.3: KDS Order Receiver via LAN
    useKdsOrderReceiver({
        station: (stationConfig?.dbStation as TKitchenStation) || 'kitchen',
        soundEnabled,
        playSound: playNewOrderSound,
        onNewOrder: handleLanOrder,
        existingOrderIds,
    })

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    // Fetch orders for this station
    const fetchOrders = useCallback(async () => {
        if (!stationConfig) return

        try {
            // Fetch orders with items - using direct columns and safe optional joins
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    order_type,
                    status,
                    created_at,
                    table_number,
                    customer_name,
                    order_items(
                        id,
                        product_name,
                        quantity,
                        notes,
                        item_status,
                        dispatch_station,
                        modifiers
                    )
                `)
                .in('status', ['new', 'preparing', 'ready'])
                .order('created_at', { ascending: true })

            if (error) throw error

            // Define types for Supabase raw data
            type RawOrderItem = {
                id: string;
                product_name?: string;
                quantity: number;
                notes?: string;
                item_status?: string;
                dispatch_station?: string;
                modifiers?: string | Array<{ name?: string }>;
                is_held?: boolean; // Story 8.4
            };
            type RawOrder = {
                id: string;
                order_number: string;
                order_type: string;
                table_number?: string | null;
                customer_name?: string | null;
                created_at: string;
                status: string;
                source?: string; // Story 8.1
                order_items?: RawOrderItem[];
            };

            // Transform data with cast through unknown
            const rawOrders = data as unknown as RawOrder[];
            const transformedOrders: IKdsOrder[] = (rawOrders || [])
                .map((order) => {
                    // Map items with modifiers
                    let items = (order.order_items || []).map((item) => {
                        // Parse modifiers if stored as JSON
                        let modifiersText = ''
                        if (item.modifiers) {
                            try {
                                const mods = typeof item.modifiers === 'string'
                                    ? JSON.parse(item.modifiers)
                                    : item.modifiers
                                if (Array.isArray(mods)) {
                                    modifiersText = mods.map((m: { name?: string } | string) => typeof m === 'object' ? m.name : m).filter(Boolean).join(', ')
                                }
                            } catch {
                                modifiersText = String(item.modifiers)
                            }
                        }

                        return {
                            id: item.id,
                            product_name: item.product_name || 'Unknown',
                            quantity: item.quantity,
                            modifiers: modifiersText,
                            notes: item.notes,
                            item_status: (item.item_status || 'new') as IKdsOrderItem['item_status'],
                            dispatch_station: item.dispatch_station || 'none',
                            is_held: item.is_held || false // Story 8.4
                        }
                    })

                    // Filter by station (unless waiter)
                    if (station !== 'waiter' && stationConfig) {
                        items = items.filter((item) =>
                            item.dispatch_station === stationConfig.dbStation
                        )
                    }

                    return {
                        id: order.id,
                        order_number: order.order_number,
                        order_type: order.order_type as IKdsOrder['order_type'],
                        table_name: order.table_number ? `Table ${order.table_number}` : undefined,
                        customer_name: order.customer_name ?? undefined,
                        items,
                        created_at: order.created_at,
                        status: order.status,
                        source: (order.source || 'pos') as IKdsOrder['source'] // Story 8.1
                    }
                })
                .filter((order) => order.items.length > 0)

            // Check for new orders and play sound (using ref to avoid dependency cycle)
            if (soundEnabled && transformedOrders.length > lastOrderCountRef.current && lastOrderCountRef.current > 0) {
                playNewOrderSound()
            }
            lastOrderCountRef.current = transformedOrders.length

            setOrders(transformedOrders)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [station, stationConfig, soundEnabled, setOrders])

    // Initial fetch and set up polling
    useEffect(() => {
        fetchOrders()

        // Poll every 5 seconds
        refreshIntervalRef.current = setInterval(fetchOrders, 5000)

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current)
            }
        }
    }, [fetchOrders])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('kds-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
                fetchOrders()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchOrders])

    // Note: Story 4.3 - LAN order reception is now handled by useKdsOrderReceiver hook
    // which uses the payload directly instead of refetching from Supabase.
    // Supabase Realtime subscription above serves as fallback when LAN is unavailable.

    // Handle item status updates - Story 4.5: Optimistic updates + LAN notification
    const handleStartPreparing = async (orderId: string, itemIds: string[]) => {
        const order = orders.find(o => o.id === orderId)
        if (!order) return

        // Store previous statuses for potential rollback
        const previousStatuses = new Map(
            order.items.filter(item => itemIds.includes(item.id)).map(item => [item.id, item.item_status])
        )

        // Optimistic update - instant UI feedback using hook's updateOrderItem
        itemIds.forEach(itemId => {
            updateOrderItem(orderId, itemId, { item_status: 'preparing' })
        })

        // Send to Supabase + LAN via service
        const result = await markItemsPreparing(
            orderId,
            order.order_number,
            itemIds,
            (stationConfig?.dbStation || 'kitchen') as TKitchenStation
        )

        if (!result.success) {
            console.error('Error updating item status:', result.error)
            // Surgical rollback - restore only affected items' previous statuses
            previousStatuses.forEach((status, itemId) => {
                updateOrderItem(orderId, itemId, { item_status: status })
            })
            toast.error(result.error || 'Error updating status')
        }
    }

    // Story 4.5: Mark items ready with optimistic update + LAN notification
    const handleMarkReady = async (orderId: string, itemIds: string[]) => {
        const order = orders.find(o => o.id === orderId)
        if (!order) return

        // Store previous statuses for potential rollback
        const previousStatuses = new Map(
            order.items.filter(item => itemIds.includes(item.id)).map(item => [item.id, item.item_status])
        )

        // Optimistic update - instant UI feedback using hook's updateOrderItem
        itemIds.forEach(itemId => {
            updateOrderItem(orderId, itemId, { item_status: 'ready' })
        })

        // Send to Supabase + LAN via service
        const result = await markItemsReady(
            orderId,
            order.order_number,
            itemIds,
            (stationConfig?.dbStation || 'kitchen') as TKitchenStation
        )

        if (!result.success) {
            console.error('Error updating item status:', result.error)
            // Surgical rollback - restore only affected items' previous statuses
            previousStatuses.forEach((status, itemId) => {
                updateOrderItem(orderId, itemId, { item_status: status })
            })
            toast.error(result.error || 'Error updating status')
        } else {
            // Story 8.7: Broadcast order ready to Customer Display if all items ready
            const allReady = order.items.every(item =>
                itemIds.includes(item.id) || item.item_status === 'ready' || item.item_status === 'served'
            )
            if (allReady) {
                broadcastOrderStatus(orderId, order.order_number, 'ready')
            }
        }
    }

    // Story 8.4: Toggle item hold status
    const handleToggleHold = async (itemId: string, currentHoldStatus: boolean) => {
        try {
            await supabase
                .from('order_items')
                .update({ is_held: !currentHoldStatus })
                .eq('id', itemId)

            fetchOrders()
        } catch (error) {
            console.error('Error toggling hold status:', error)
        }
    }

    const handleMarkServed = async (orderId: string, itemIds: string[]) => {
        try {
            await supabase
                .from('order_items')
                .update({
                    item_status: 'served',
                    served_at: new Date().toISOString()
                })
                .in('id', itemIds)

            // Check if all items in order are served
            const order = orders.find(o => o.id === orderId)
            if (order) {
                const allServed = order.items.every(item =>
                    itemIds.includes(item.id) || item.item_status === 'served'
                )
                if (allServed) {
                    await supabase
                        .from('orders')
                        .update({ status: 'served' })
                        .eq('id', orderId)
                }
            }

            fetchOrders()
        } catch (error) {
            console.error('Error updating item status:', error)
        }
    }

    // Story 4.6: Handle order completion (auto-remove)
    const handleOrderComplete = useCallback(async (orderId: string) => {
        const order = orders.find(o => o.id === orderId)
        if (!order) return

        // Update Supabase and send LAN notification via service
        const result = await completeOrder(
            orderId,
            order.order_number,
            (stationConfig?.dbStation as TKitchenStation) || 'kitchen'
        )

        if (result.success) {
            // Remove order from local state (already animated out)
            removeOrder(orderId)

            // Broadcast order ready to Customer Display
            broadcastOrderStatus(orderId, order.order_number, 'ready')
        } else {
            console.error('Failed to complete order:', result.error)
            // Refetch in case of error to ensure state consistency
            fetchOrders()
        }
    }, [orders, stationConfig, fetchOrders, removeOrder])

    if (!station || !stationConfig) {
        navigate('/kds')
        return null
    }

    // Separate orders by status
    const newOrders = orders.filter(o => o.items.some(i => i.item_status === 'new'))
    const preparingOrders = orders.filter(o =>
        o.items.some(i => i.item_status === 'preparing') &&
        !o.items.some(i => i.item_status === 'new')
    )
    const readyOrders = orders.filter(o =>
        o.items.every(i => i.item_status === 'ready' || i.item_status === 'served')
    )

    return (
        <div className="kds-app" style={{ '--station-color': stationConfig.color } as React.CSSProperties}>
            {/* Header */}
            <header className="kds-header">
                <div className="kds-header__left">
                    <button className="kds-header__back" onClick={() => navigate('/kds')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="kds-header__logo">
                        <span>🥐</span>
                        <span>The Breakery KDS</span>
                    </div>
                </div>

                <div className="kds-header__station" style={{ backgroundColor: stationConfig.color }}>
                    {stationConfig.icon}
                    <span>{stationConfig.name}</span>
                </div>

                <div className="kds-header__right">
                    <div className="kds-header__stats">
                        {/* Story 4.4: Urgent orders badge */}
                        {urgentCount > 0 && (
                            <span className="kds-header__stat kds-header__stat--urgent">
                                <AlertTriangle size={14} />
                                {urgentCount} Urgent
                            </span>
                        )}
                        <span className="kds-header__stat kds-header__stat--new">{newOrders.length} New</span>
                        <span className="kds-header__stat kds-header__stat--preparing">{preparingOrders.length} Prep</span>
                        <span className="kds-header__stat kds-header__stat--ready">{readyOrders.length} Ready</span>
                    </div>
                    {/* Story 4.2: LAN Connection Indicator */}
                    <LanConnectionIndicator
                        status={connectionStatus}
                        reconnectAttempts={reconnectAttempts}
                        className="kds-header__lan-indicator"
                    />
                    <button
                        className={`kds-header__sound ${!soundEnabled ? 'kds-header__sound--muted' : ''}`}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button className="kds-header__refresh" onClick={fetchOrders}>
                        <RefreshCw size={20} />
                    </button>
                    <div className="kds-header__time">
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="kds-main">
                {loading ? (
                    <div className="kds-loading">
                        <RefreshCw className="kds-loading__spinner" size={48} />
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="kds-empty">
                        <div className="kds-empty__icon">{stationConfig.icon}</div>
                        <h2>No Orders</h2>
                        <p>Waiting for new orders...</p>
                    </div>
                ) : (
                    <>
                        {/* Story 4.4: Urgent Orders Section */}
                        {urgentOrders.length > 0 && (
                            <div className="kds-section kds-section--urgent">
                                <h2 className="kds-section__title">
                                    <AlertTriangle size={20} />
                                    URGENT ({urgentOrders.length})
                                </h2>
                                <div className="kds-orders-grid">
                                    {urgentOrders.map((order) => (
                                        <KDSOrderCard
                                            key={order.id}
                                            orderId={order.id}
                                            orderNumber={order.order_number}
                                            orderType={order.order_type}
                                            tableName={order.table_name}
                                            customerName={order.customer_name}
                                            items={order.items}
                                            createdAt={order.created_at}
                                            station={station}
                                            source={order.source}
                                            onStartPreparing={handleStartPreparing}
                                            onMarkReady={handleMarkReady}
                                            onMarkServed={handleMarkServed}
                                            onToggleHold={handleToggleHold}
                                            onOrderComplete={handleOrderComplete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Story 4.4: Normal Orders Section */}
                        <div className="kds-section kds-section--normal">
                            {urgentOrders.length > 0 && (
                                <h2 className="kds-section__title">
                                    Waiting ({normalOrders.length})
                                </h2>
                            )}
                            <div className="kds-orders-grid">
                                {normalOrders.map((order) => (
                                    <KDSOrderCard
                                        key={order.id}
                                        orderId={order.id}
                                        orderNumber={order.order_number}
                                        orderType={order.order_type}
                                        tableName={order.table_name}
                                        customerName={order.customer_name}
                                        items={order.items}
                                        createdAt={order.created_at}
                                        station={station}
                                        source={order.source}
                                        onStartPreparing={handleStartPreparing}
                                        onMarkReady={handleMarkReady}
                                        onMarkServed={handleMarkServed}
                                        onToggleHold={handleToggleHold}
                                        onOrderComplete={handleOrderComplete}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
