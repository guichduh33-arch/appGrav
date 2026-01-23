import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import KDSOrderCard from '../../components/kds/KDSOrderCard'
import { ArrowLeft, Volume2, VolumeX, RefreshCw, ChefHat, Coffee, Store, Users } from 'lucide-react'
import './KDSMainPage.css'

interface OrderItem {
    id: string
    product_name: string
    quantity: number
    modifiers?: string
    notes?: string
    item_status: 'new' | 'preparing' | 'ready' | 'served'
    dispatch_station: string
}

interface Order {
    id: string
    order_number: string
    order_type: 'dine_in' | 'takeaway' | 'delivery' | 'b2b'
    table_name?: string
    customer_name?: string
    items: OrderItem[]
    created_at: string
    status: string
}

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

// Notification sound
const playNotificationSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const audioContext = new AudioContextClass()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 880
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
        console.log('Audio not available')
    }
}

export default function KDSMainPage() {
    const { station } = useParams<{ station: string }>()
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [lastOrderCount, setLastOrderCount] = useState(0)
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const stationConfig = station ? STATION_CONFIG[station] : null

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

            // Transform data
            const transformedOrders: Order[] = (data || [])
                .map((order: any) => {
                    // Map items with modifiers
                    let items = (order.order_items || []).map((item: any) => {
                        // Parse modifiers if stored as JSON
                        let modifiersText = ''
                        if (item.modifiers) {
                            try {
                                const mods = typeof item.modifiers === 'string'
                                    ? JSON.parse(item.modifiers)
                                    : item.modifiers
                                if (Array.isArray(mods)) {
                                    modifiersText = mods.map((m: any) => m.name || m).filter(Boolean).join(', ')
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
                            item_status: item.item_status || 'new',
                            dispatch_station: item.dispatch_station || 'none'
                        }
                    })

                    // Filter by station (unless waiter)
                    if (station !== 'waiter' && stationConfig) {
                        items = items.filter((item: OrderItem) =>
                            item.dispatch_station === stationConfig.dbStation
                        )
                    }

                    return {
                        id: order.id,
                        order_number: order.order_number,
                        order_type: order.order_type,
                        table_name: order.table_number ? `Table ${order.table_number}` : undefined,
                        customer_name: order.customer_name,
                        items,
                        created_at: order.created_at,
                        status: order.status
                    }
                })
                .filter((order: Order) => order.items.length > 0)

            // Check for new orders and play sound
            if (soundEnabled && transformedOrders.length > lastOrderCount && lastOrderCount > 0) {
                playNotificationSound()
            }
            setLastOrderCount(transformedOrders.length)

            setOrders(transformedOrders)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [station, stationConfig, soundEnabled, lastOrderCount])

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

    // Handle item status updates
    const handleStartPreparing = async (orderId: string, itemIds: string[]) => {
        try {
            await supabase
                .from('order_items')
                .update({ item_status: 'preparing' })
                .in('id', itemIds)

            // Check if all items in order are preparing
            const order = orders.find(o => o.id === orderId)
            if (order) {
                const allPreparing = order.items.every(item =>
                    itemIds.includes(item.id) || item.item_status !== 'new'
                )
                if (allPreparing) {
                    await supabase
                        .from('orders')
                        .update({ status: 'preparing' })
                        .eq('id', orderId)
                }
            }

            fetchOrders()
        } catch (error) {
            console.error('Error updating item status:', error)
        }
    }

    const handleMarkReady = async (_orderId: string, itemIds: string[]) => {
        try {
            await supabase
                .from('order_items')
                .update({
                    item_status: 'ready',
                    prepared_at: new Date().toISOString()
                })
                .in('id', itemIds)

            fetchOrders()
        } catch (error) {
            console.error('Error updating item status:', error)
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
                        <span className="kds-header__stat kds-header__stat--new">{newOrders.length} New</span>
                        <span className="kds-header__stat kds-header__stat--preparing">{preparingOrders.length} Prep</span>
                        <span className="kds-header__stat kds-header__stat--ready">{readyOrders.length} Ready</span>
                    </div>
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
                    <div className="kds-orders-grid">
                        {orders.map((order) => (
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
                                onStartPreparing={handleStartPreparing}
                                onMarkReady={handleMarkReady}
                                onMarkServed={handleMarkServed}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
