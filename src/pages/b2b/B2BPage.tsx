import { useState, useEffect } from 'react'
import { Building2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '../../lib/supabase'
import { logError } from '@/utils/logger'
import B2BHeader from './B2BHeader'
import B2BStats from './B2BStats'
import B2BQuickActions from './B2BQuickActions'
import B2BClientsList from './B2BClientsList'
import B2BRecentOrders from './B2BRecentOrders'

type TabType = 'clients' | 'orders'

interface B2BStatsData {
    totalClients: number
    activeClients: number
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    unpaidAmount: number
}

interface Customer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    customer_type: string
    total_spent: number
    total_visits: number
    is_active: boolean
}

interface RecentOrder {
    id: string
    order_number: string
    customer?: {
        name: string
        company_name: string | null
    }
    total_amount: number
    status: string
    payment_status: string
    order_date: string
}

const B2BPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('clients')
    const [stats, setStats] = useState<B2BStatsData>({
        totalClients: 0,
        activeClients: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        unpaidAmount: 0
    })
    const [customers, setCustomers] = useState<Customer[]>([])
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: customersData } = await supabase
                .from('customers')
                .select('*')
                .eq('customer_type', 'wholesale')
                .order('total_spent', { ascending: false })
                .limit(8)

            if (customersData) {
                setCustomers(customersData as Customer[])
                setStats(s => ({
                    ...s,
                    totalClients: customersData.length,
                    activeClients: (customersData as Customer[]).filter(c => c.is_active).length
                }))
            }

            const { data: ordersData } = await supabase
                .from('b2b_orders')
                .select(`
                    id, order_number, total, status, payment_status, order_date,
                    customer:customers(name, company_name)
                `)
                .order('order_date', { ascending: false })
                .limit(5)
                .returns<RecentOrder[]>()

            if (ordersData) {
                const mappedOrders = ordersData.map(order => ({
                    ...order,
                    total_amount: (order as unknown as { total: number | null }).total ?? 0,
                }))
                setRecentOrders(mappedOrders)

                const { data: allOrders } = await supabase
                    .from('b2b_orders')
                    .select('total, status, payment_status, paid_amount')
                    .neq('status', 'cancelled')

                if (allOrders && allOrders.length > 0) {
                    const typedOrders = allOrders as Array<{
                        total: number | null
                        status: string
                        payment_status: string
                        paid_amount: number | null
                    }>
                    setStats(s => ({
                        ...s,
                        totalOrders: typedOrders.length,
                        pendingOrders: typedOrders.filter(o => ['confirmed', 'processing', 'ready'].includes(o.status)).length,
                        totalRevenue: typedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                        unpaidAmount: typedOrders.reduce((sum, o) => sum + ((o.total || 0) - (o.paid_amount || 0)), 0)
                    }))
                }
            }
        } catch (error) {
            logError('Error fetching B2B data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 overflow-y-auto">
            <B2BHeader />
            <B2BStats stats={stats} />
            <B2BQuickActions />

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-white/5 pb-1">
                <button
                    type="button"
                    className={cn(
                        'px-5 py-2.5 bg-transparent border-none rounded-t-lg text-sm font-medium cursor-pointer transition-all relative',
                        activeTab === 'clients'
                            ? 'text-[var(--color-gold)] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-gold)] after:rounded-t-sm after:content-[""]'
                            : 'text-[var(--theme-text-muted)] hover:text-white'
                    )}
                    onClick={() => setActiveTab('clients')}
                >
                    <Building2 size={16} className="mr-2 inline" />
                    Clients ({customers.length})
                </button>
                <button
                    type="button"
                    className={cn(
                        'px-5 py-2.5 bg-transparent border-none rounded-t-lg text-sm font-medium cursor-pointer transition-all relative',
                        activeTab === 'orders'
                            ? 'text-[var(--color-gold)] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-gold)] after:rounded-t-sm after:content-[""]'
                            : 'text-[var(--theme-text-muted)] hover:text-white'
                    )}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} className="mr-2 inline" />
                    Recent Orders
                </button>
            </div>

            {activeTab === 'clients' && <B2BClientsList customers={customers} loading={loading} />}
            {activeTab === 'orders' && <B2BRecentOrders orders={recentOrders} loading={loading} />}
        </div>
    )
}

export default B2BPage
