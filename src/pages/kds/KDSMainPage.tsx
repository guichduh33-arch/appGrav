import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ChefHat, Coffee, Store, Users, RefreshCw } from 'lucide-react'
import { useLanClient } from '../../hooks/lan/useLanClient'
import { useKdsOrderReceiver } from '../../hooks/kds/useKdsOrderReceiver'
import { useKdsOrderQueue, type IKdsOrder, type IKdsOrderItem } from '../../hooks/kds/useKdsOrderQueue'
import { useKDSConfigSettings } from '../../hooks/settings/useModuleConfigSettings'
import { useKdsOrderActions } from '../../hooks/kds/useKdsOrderActions'
import { useKdsUrgentAlertLoop } from '../../hooks/kds/useKdsUrgentAlertLoop'
import { KDSHeader } from '../../components/kds/KDSHeader'
import { KDSOrderGrid } from '../../components/kds/KDSOrderGrid'
import { KDSAllDayCount } from '../../components/kds/KDSAllDayCount'
import { playNewOrderSound, playUrgentSound } from '../../utils/audio'
import { logError } from '@/utils/logger'
import type { IKdsNewOrderPayload, TKitchenStation } from '../../types/offline'

const KDS_ACCENT = '#ec5b13'

const STATION_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string; dbStation: string }> = {
    hot_kitchen: {
        name: 'Hot Kitchen',
        icon: <ChefHat size={24} />,
        color: '#A6634B', // Clay Terracotta
        dbStation: 'kitchen'
    },
    barista: {
        name: 'Barista',
        icon: <Coffee size={24} />,
        color: '#C9A55C', // Aged Gold
        dbStation: 'barista'
    },
    display: {
        name: 'Display',
        icon: <Store size={24} />,
        color: '#4A5D4E', // Olive Muted
        dbStation: 'display'
    },
    waiter: {
        name: 'Waiter',
        icon: <Users size={24} />,
        color: '#E5E7EB', // Stone Text
        dbStation: 'all'
    }
}

export default function KDSMainPage() {
    const kdsConfig = useKDSConfigSettings()
    const { station } = useParams<{ station: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [showAllDayCount, setShowAllDayCount] = useState(false)
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const lastOrderCountRef = useRef(0)

    const stationConfig = station ? STATION_CONFIG[station] : null

    const {
        orders, urgentOrders, normalOrders, urgentCount,
        addOrder, setOrders, updateOrderItem, removeOrder,
    } = useKdsOrderQueue({
        urgentThresholdSeconds: kdsConfig.urgencyCriticalSeconds,
        onOrderBecameUrgent: () => {
            if (soundEnabled) {
                playUrgentSound()
            }
        },
    })

    // Repeated urgent alert loop (every 30s while critical orders exist)
    useKdsUrgentAlertLoop({
        criticalCount: urgentCount,
        soundEnabled,
    })

    // LAN Client Connection
    const { connectionStatus, reconnectAttempts } = useLanClient({
        deviceType: 'kds',
        deviceName: 'Kitchen Display',
        station: stationConfig?.dbStation,
        autoConnect: true,
    })

    const existingOrderIds = useMemo(() => new Set(orders.map(o => o.id)), [orders])

    // Handle orders received via LAN
    const handleLanOrder = useCallback((payload: IKdsNewOrderPayload, source: 'lan') => {
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
            source: source,
        }
        addOrder(newOrder)
        lastOrderCountRef.current += 1
    }, [addOrder])

    useKdsOrderReceiver({
        station: (stationConfig?.dbStation as TKitchenStation) || 'kitchen',
        soundEnabled,
        playSound: playNewOrderSound,
        onNewOrder: handleLanOrder,
        existingOrderIds,
    })

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    // Fetch orders for this station
    const fetchOrders = useCallback(async () => {
        if (!stationConfig) return

        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, order_number, order_type, status, created_at, table_number, customer_name,
                    order_items(id, product_name, quantity, notes, item_status, dispatch_station, modifiers)
                `)
                .in('status', ['new', 'preparing', 'ready'])
                .order('created_at', { ascending: true })

            if (error) throw error

            type RawOrderItem = {
                id: string; product_name?: string; quantity: number; notes?: string;
                item_status?: string; dispatch_station?: string;
                modifiers?: string | Array<{ name?: string }>; is_held?: boolean;
            }
            type RawOrder = {
                id: string; order_number: string; order_type: string;
                table_number?: string | null; customer_name?: string | null;
                created_at: string; status: string; source?: string; order_items?: RawOrderItem[];
            }

            const rawOrders = data as RawOrder[]
            const transformedOrders: IKdsOrder[] = (rawOrders || [])
                .map((order) => {
                    let items: IKdsOrderItem[] = (order.order_items || []).map((item) => {
                        let modifiersText = ''
                        if (item.modifiers) {
                            try {
                                const mods = typeof item.modifiers === 'string'
                                    ? JSON.parse(item.modifiers) : item.modifiers
                                if (Array.isArray(mods)) {
                                    modifiersText = mods.map((m: { name?: string } | string) =>
                                        typeof m === 'object' ? m.name : m).filter(Boolean).join(', ')
                                }
                            } catch { modifiersText = String(item.modifiers) }
                        }
                        return {
                            id: item.id, product_name: item.product_name || 'Unknown',
                            quantity: item.quantity, modifiers: modifiersText, notes: item.notes,
                            item_status: (item.item_status || 'new') as IKdsOrderItem['item_status'],
                            dispatch_station: item.dispatch_station || 'none',
                            is_held: item.is_held || false,
                        }
                    })

                    if (station !== 'waiter' && stationConfig) {
                        items = items.filter((item) => item.dispatch_station === stationConfig.dbStation)
                    }

                    return {
                        id: order.id, order_number: order.order_number,
                        order_type: order.order_type as IKdsOrder['order_type'],
                        table_name: order.table_number ? `Table ${order.table_number}` : undefined,
                        customer_name: order.customer_name ?? undefined,
                        items, created_at: order.created_at, status: order.status,
                        source: (order.source || 'pos') as IKdsOrder['source'],
                    }
                })
                .filter((order) => order.items.length > 0)

            if (soundEnabled && transformedOrders.length > lastOrderCountRef.current && lastOrderCountRef.current > 0) {
                playNewOrderSound()
            }
            lastOrderCountRef.current = transformedOrders.length
            setOrders(transformedOrders)
        } catch (error) {
            logError('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [station, stationConfig, soundEnabled, setOrders])

    // Polling + initial fetch
    useEffect(() => {
        fetchOrders()
        refreshIntervalRef.current = setInterval(fetchOrders, kdsConfig.pollIntervalMs)
        return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current) }
    }, [fetchOrders])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('kds-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchOrders())
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [fetchOrders])

    // Extracted action handlers
    const {
        handleStartPreparing, handleMarkReady, handleMarkServed,
        handleToggleHold, handleOrderComplete,
    } = useKdsOrderActions({
        orders, stationConfig, updateOrderItem, removeOrder, fetchOrders,
    })

    if (!station || !stationConfig) {
        navigate('/kds')
        return null
    }

    const newOrders = orders.filter(o => o.items.some(i => i.item_status === 'new'))
    const preparingOrders = orders.filter(o =>
        o.items.some(i => i.item_status === 'preparing') && !o.items.some(i => i.item_status === 'new')
    )
    const readyOrders = orders.filter(o =>
        o.items.every(i => i.item_status === 'ready' || i.item_status === 'served')
    )

    return (
        <div data-kds className="flex flex-col h-screen overflow-hidden bg-[var(--kds-bg)] text-white" style={{ '--station-color': stationConfig.color, '--kds-accent': KDS_ACCENT } as React.CSSProperties}>
            <KDSHeader
                stationConfig={stationConfig}
                urgentCount={urgentCount}
                newCount={newOrders.length}
                preparingCount={preparingOrders.length}
                readyCount={readyOrders.length}
                connectionStatus={connectionStatus}
                reconnectAttempts={reconnectAttempts}
                soundEnabled={soundEnabled}
                onSoundToggle={() => setSoundEnabled(!soundEnabled)}
                onRefresh={fetchOrders}
                onBack={() => navigate('/kds')}
                currentTime={currentTime}
                showAllDayCount={showAllDayCount}
                onToggleAllDayCount={() => setShowAllDayCount(!showAllDayCount)}
            />

            <main className="flex-1 overflow-y-auto p-5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-[#888]">
                        <RefreshCw className="animate-spin" size={48} />
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-[120px] h-[120px] rounded-[30px] bg-[var(--kds-surface)] flex items-center justify-center mb-6 text-[var(--station-color)] [&_svg]:w-[60px] [&_svg]:h-[60px]">{stationConfig.icon}</div>
                        <h2 className="text-[2rem] m-0 mb-2 text-white">No Orders</h2>
                        <p className="text-[1.1rem] text-[#888] m-0">Waiting for new orders...</p>
                    </div>
                ) : showAllDayCount ? (
                    <KDSAllDayCount
                        orders={orders}
                        onClose={() => setShowAllDayCount(false)}
                    />
                ) : (
                    <KDSOrderGrid
                        urgentOrders={urgentOrders}
                        normalOrders={normalOrders}
                        station={station}
                        onStartPreparing={handleStartPreparing}
                        onMarkReady={handleMarkReady}
                        onMarkServed={handleMarkServed}
                        onToggleHold={handleToggleHold}
                        onOrderComplete={handleOrderComplete}
                    />
                )}
            </main>
        </div>
    )
}
