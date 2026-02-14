import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, CreditCard, Search,
    TrendingUp, Clock, CheckCircle, AlertCircle,
    Download, BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import {
    generateAgingReport, exportOutstandingCSV, downloadCSV, applyFIFOPayment,
    type IAgingReport, type IOutstandingOrder,
} from '../../services/b2b/arService'
import { useAuthStore } from '../../stores/authStore'
import { logError } from '@/utils/logger'
import B2BPaymentsReceivedTab from './B2BPaymentsReceivedTab'
import B2BPaymentsOutstandingTab from './B2BPaymentsOutstandingTab'
import B2BPaymentsAgingTab from './B2BPaymentsAgingTab'
import B2BFIFOPaymentModal from './B2BFIFOPaymentModal'

interface Payment {
    id: string
    payment_number: string
    order_id: string
    order?: { order_number: string }
    customer_id: string
    customer?: { name: string; company_name: string | null }
    amount: number
    payment_method: string
    payment_date: string
    reference_number: string | null
    bank_name: string | null
    status: string
    notes: string | null
    created_at: string
}

interface OutstandingOrder {
    id: string
    order_number: string
    customer?: { name: string; company_name: string | null }
    total_amount: number
    amount_due: number
    due_date: string | null
    payment_status: string
}

type TabType = 'received' | 'outstanding' | 'aging'

const statIconStyles: Record<string, string> = {
    success: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    info: 'bg-blue-500/10 text-blue-400',
    danger: 'bg-red-500/10 text-red-400',
}

export default function B2BPaymentsPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [activeTab, setActiveTab] = useState<TabType>('received')
    const [payments, setPayments] = useState<Payment[]>([])
    const [outstandingOrders, setOutstandingOrders] = useState<OutstandingOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [methodFilter, setMethodFilter] = useState<string>('all')
    const [dateFilter, setDateFilter] = useState<string>('all')
    const [agingReport, setAgingReport] = useState<IAgingReport | null>(null)
    const [agingLoading, setAgingLoading] = useState(false)
    const [showFIFOModal, setShowFIFOModal] = useState(false)
    const [fifoCustomerId, setFifoCustomerId] = useState('')
    const [fifoCustomerName, setFifoCustomerName] = useState('')
    const [fifoAmount, setFifoAmount] = useState('')
    const [fifoMethod, setFifoMethod] = useState('transfer')
    const [fifoReference, setFifoReference] = useState('')
    const [fifoProcessing, setFifoProcessing] = useState(false)

    useEffect(() => { fetchPayments(); fetchOutstandingOrders() }, [])

    const fetchPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_payments')
                .select(`*, order:b2b_orders(order_number), customer:customers(name, company_name)`)
                .eq('status', 'completed').returns<Payment[]>()
                .order('payment_date', { ascending: false })
            if (error) throw error
            if (data) setPayments(data)
        } catch (error) { logError('Error fetching payments:', error) }
        finally { setLoading(false) }
    }

    const fetchOutstandingOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_orders')
                .select(`id, order_number, total, paid_amount, delivery_date, payment_status, customer:customers(name, company_name)`)
                .in('payment_status', ['unpaid', 'partial']).neq('status', 'cancelled')
                .order('delivery_date', { ascending: true, nullsFirst: false }).returns<OutstandingOrder[]>()
            if (error) throw error
            if (data) {
                setOutstandingOrders(data.map(order => ({
                    id: order.id, order_number: order.order_number, customer: order.customer,
                    total_amount: (order as unknown as { total: number | null }).total ?? 0,
                    amount_due: ((order as unknown as { total: number | null }).total ?? 0) - ((order as unknown as { paid_amount: number | null }).paid_amount ?? 0),
                    due_date: (order as unknown as { delivery_date: string | null }).delivery_date,
                    payment_status: order.payment_status ?? 'unpaid',
                })))
            }
        } catch (error) { logError('Error fetching outstanding orders:', error) }
    }

    const loadAgingReport = useCallback(async () => {
        setAgingLoading(true)
        try { setAgingReport(await generateAgingReport()) }
        catch (error) { logError('Error loading aging report:', error); toast.error('Failed to load aging report') }
        finally { setAgingLoading(false) }
    }, [])

    useEffect(() => { if (activeTab === 'aging' && !agingReport) loadAgingReport() }, [activeTab, agingReport, loadAgingReport])

    const handleExportCSV = useCallback(async () => {
        if (!agingReport) return
        const csv = exportOutstandingCSV(agingReport.buckets.flatMap(b => b.orders))
        downloadCSV(csv, `outstanding-orders-${new Date().toISOString().split('T')[0]}.csv`)
        toast.success('CSV exported')
    }, [agingReport])

    const handleFIFOPayment = useCallback(async () => {
        if (!fifoCustomerId || !fifoAmount || Number(fifoAmount) <= 0) { toast.error('Please enter a valid amount'); return }
        setFifoProcessing(true)
        try {
            const result = await applyFIFOPayment(fifoCustomerId, Number(fifoAmount), fifoMethod, fifoReference || null, user?.id || '')
            if (result.success && result.allocations) {
                toast.success(`Payment allocated to ${result.allocations.allocations.length} order(s). Total: ${formatCurrency(result.allocations.totalAllocated)}`)
                if (result.allocations.remainingAmount > 0) toast.info(`Remaining: ${formatCurrency(result.allocations.remainingAmount)}`)
                setShowFIFOModal(false); setFifoAmount(''); setFifoReference('')
                fetchOutstandingOrders(); fetchPayments(); setAgingReport(null)
            } else { toast.error(result.error || 'Payment failed') }
        } catch (error) { logError('FIFO payment error:', error); toast.error('Payment processing failed') }
        finally { setFifoProcessing(false) }
    }, [fifoCustomerId, fifoAmount, fifoMethod, fifoReference, user?.id])

    const openFIFOForCustomer = useCallback((customerId: string, customerName: string) => {
        setFifoCustomerId(customerId); setFifoCustomerName(customerName)
        setFifoAmount(''); setFifoReference(''); setFifoMethod('transfer'); setShowFIFOModal(true)
    }, [])

    const getDateRange = (filter: string) => {
        const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        switch (filter) {
            case 'today': return { start: today, end: now }
            case 'week': { const ws = new Date(today); ws.setDate(today.getDate() - 7); return { start: ws, end: now } }
            case 'month': return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: now }
            default: return null
        }
    }

    const filteredPayments = payments.filter(payment => {
        const sl = searchTerm.toLowerCase()
        const ms = payment.payment_number?.toLowerCase().includes(sl) || payment.order?.order_number?.toLowerCase().includes(sl) || payment.customer?.name?.toLowerCase().includes(sl) || payment.customer?.company_name?.toLowerCase().includes(sl)
        const mm = methodFilter === 'all' || payment.payment_method === methodFilter
        let md = true
        if (dateFilter !== 'all') { const r = getDateRange(dateFilter); if (r) { const pd = new Date(payment.payment_date); md = pd >= r.start && pd <= r.end } }
        return ms && mm && md
    })

    const filteredOutstanding = outstandingOrders.filter(order => {
        const sl = searchTerm.toLowerCase()
        return order.order_number.toLowerCase().includes(sl) || order.customer?.name?.toLowerCase().includes(sl) || order.customer?.company_name?.toLowerCase().includes(sl)
    })

    const stats = {
        totalReceived: payments.reduce((sum, p) => sum + p.amount, 0),
        totalOutstanding: outstandingOrders.reduce((sum, o) => sum + o.amount_due, 0),
        paymentsCount: payments.length,
        outstandingCount: outstandingOrders.length,
        overdueCount: outstandingOrders.filter(o => o.due_date && new Date(o.due_date) < new Date()).length
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const customerGroups = agingReport
        ? agingReport.buckets.flatMap(b => b.orders).reduce<Record<string, { name: string; orders: IOutstandingOrder[]; totalDue: number }>>((acc, order) => {
            if (!acc[order.customer_id]) acc[order.customer_id] = { name: order.company_name || order.customer_name, orders: [], totalDue: 0 }
            acc[order.customer_id].orders.push(order); acc[order.customer_id].totalDue += order.amount_due
            return acc
        }, {}) : {}

    const PAYMENT_METHODS_KEYS = ['cash', 'transfer', 'check', 'card', 'qris', 'credit', 'store_credit']
    const PAYMENT_METHODS_LABELS: Record<string, string> = { cash: 'Cash', transfer: 'Transfer', check: 'Check', card: 'Card', qris: 'QRIS', credit: 'Credit', store_credit: 'Store Credit' }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        className="inline-flex items-center gap-2 px-3 py-2 bg-transparent border border-white/10 text-white rounded-xl text-sm transition-colors hover:border-white/20"
                        onClick={() => navigate('/b2b/orders')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="flex items-center gap-3 font-display text-2xl font-bold text-white">
                            <CreditCard size={28} className="text-[var(--color-gold)]" />
                            B2B Payments
                        </h1>
                        <p className="text-[var(--theme-text-muted)] text-sm mt-1">
                            Manage payments and receivables tracking
                        </p>
                    </div>
                </div>
                {activeTab === 'aging' && agingReport && (
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110"
                        onClick={handleExportCSV}
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 mb-8">
                {[
                    { icon: TrendingUp, style: 'success', value: formatCurrency(stats.totalReceived), label: 'Total Received' },
                    { icon: Clock, style: 'warning', value: formatCurrency(stats.totalOutstanding), label: 'Outstanding' },
                    { icon: CheckCircle, style: 'info', value: stats.paymentsCount, label: 'Payments Received' },
                    { icon: AlertCircle, style: 'danger', value: stats.overdueCount, label: 'Overdue' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', statIconStyles[stat.style])}>
                            <stat.icon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white">{stat.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/5 mb-6">
                {([
                    { key: 'received' as TabType, icon: CheckCircle, label: `Received (${payments.length})` },
                    { key: 'outstanding' as TabType, icon: Clock, label: `Outstanding (${outstandingOrders.length})` },
                    { key: 'aging' as TabType, icon: BarChart3, label: 'Aging Report' },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        className={cn(
                            'flex items-center gap-2 px-5 py-2.5 bg-transparent border-none border-b-2 border-b-transparent text-sm font-medium cursor-pointer transition-all -mb-px',
                            activeTab === tab.key
                                ? 'text-[var(--color-gold)] !border-b-[var(--color-gold)]'
                                : 'text-[var(--theme-text-muted)] hover:text-white'
                        )}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            {activeTab !== 'aging' && (
                <div className="flex gap-4 mb-6 flex-wrap">
                    <div className="flex-1 min-w-[250px] max-w-[350px] flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-[var(--color-gold)] focus-within:ring-1 focus-within:ring-[var(--color-gold)]/20">
                        <Search size={20} className="text-[var(--theme-text-muted)]" />
                        <input
                            type="text" placeholder="Search..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[var(--theme-text-muted)]"
                        />
                    </div>
                    {activeTab === 'received' && (
                        <>
                            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
                                className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white cursor-pointer focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
                            >
                                <option value="all">All methods</option>
                                {PAYMENT_METHODS_KEYS.map(key => (<option key={key} value={key}>{PAYMENT_METHODS_LABELS[key]}</option>))}
                            </select>
                            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                                className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white cursor-pointer focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
                            >
                                <option value="all">All dates</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 days</option>
                                <option value="month">This month</option>
                            </select>
                        </>
                    )}
                </div>
            )}

            {/* Content */}
            {loading && activeTab !== 'aging' ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-[var(--theme-text-muted)] bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                    <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
                    <span>Loading...</span>
                </div>
            ) : activeTab === 'received' ? (
                <B2BPaymentsReceivedTab payments={filteredPayments} formatDate={formatDate} />
            ) : activeTab === 'outstanding' ? (
                <B2BPaymentsOutstandingTab orders={filteredOutstanding} formatDate={formatDate} />
            ) : (
                <B2BPaymentsAgingTab
                    agingReport={agingReport} agingLoading={agingLoading}
                    customerGroups={customerGroups} onRefresh={loadAgingReport} onOpenFIFO={openFIFOForCustomer}
                />
            )}

            {showFIFOModal && (
                <B2BFIFOPaymentModal
                    customerName={fifoCustomerName} amount={fifoAmount} method={fifoMethod} reference={fifoReference}
                    processing={fifoProcessing} onAmountChange={setFifoAmount} onMethodChange={setFifoMethod}
                    onReferenceChange={setFifoReference} onSubmit={handleFIFOPayment} onClose={() => setShowFIFOModal(false)}
                />
            )}
        </div>
    )
}
