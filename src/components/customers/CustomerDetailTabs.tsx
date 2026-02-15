import {
    User, Star, FileText, Phone, Mail, MapPin, Calendar, Clock,
    Plus, Minus, History, DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import { cn } from '@/lib/utils'
import type { ICategoryPrice } from '@/hooks/customers'

type TabType = 'overview' | 'loyalty' | 'orders' | 'pricing'

interface LoyaltyTransaction {
    id: string
    transaction_type: string
    points: number
    description?: string | null
    created_at: string
}

interface Order {
    id: string
    order_number: string
    status: string
    total_amount: number
    created_at: string
}

interface CustomerForTabs {
    phone?: string | null
    email?: string | null
    address?: string | null
    date_of_birth?: string | null
    created_at: string
    category?: {
        name: string
        color: string
        price_modifier_type: string
        discount_percentage?: number | null
    } | null
}

interface CustomerDetailTabsProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
    customer: CustomerForTabs
    loyaltyTransactions: LoyaltyTransaction[]
    orders: Order[]
    categoryPrices?: ICategoryPrice[]
}

function formatDate(dateString: string | null) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        pending: 'Pending', preparing: 'Preparing', ready: 'Ready',
        completed: 'Completed', cancelled: 'Cancelled',
    }
    return labels[status] || status
}

export function CustomerDetailTabs({
    activeTab, onTabChange, customer, loyaltyTransactions, orders, categoryPrices = [],
}: CustomerDetailTabsProps) {
    const tabs: { key: TabType; icon: React.ReactNode; label: string; count?: number }[] = [
        { key: 'overview', icon: <User size={14} />, label: 'Info' },
        { key: 'loyalty', icon: <Star size={14} />, label: 'Loyalty', count: loyaltyTransactions.length },
        { key: 'orders', icon: <FileText size={14} />, label: 'Orders', count: orders.length },
        ...(customer.category ? [{ key: 'pricing' as TabType, icon: <DollarSign size={14} />, label: 'Pricing', count: categoryPrices.length }] : []),
    ]

    return (
        <>
            {/* Tab Bar */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl mb-6 max-md:flex-wrap">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 px-4 border-none bg-transparent rounded-lg text-sm font-bold text-[var(--theme-text-muted)] cursor-pointer transition-all hover:text-[var(--muted-smoke)]',
                            activeTab === tab.key && 'bg-[var(--onyx-surface)] text-[var(--color-gold)] border border-white/5',
                            'max-md:flex-[0_0_calc(50%-0.25rem)]'
                        )}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.icon}
                        {tab.label} {tab.count !== undefined && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                                Contact Information
                            </h3>
                            <div className="flex flex-col gap-3">
                                {customer.phone && (
                                    <div className="flex items-center gap-3 text-white text-sm">
                                        <Phone size={14} className="text-[var(--theme-text-muted)] shrink-0" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex items-center gap-3 text-white text-sm">
                                        <Mail size={14} className="text-[var(--theme-text-muted)] shrink-0" />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-3 text-white text-sm">
                                        <MapPin size={14} className="text-[var(--theme-text-muted)] shrink-0" />
                                        <span>{customer.address}</span>
                                    </div>
                                )}
                                {customer.date_of_birth && (
                                    <div className="flex items-center gap-3 text-white text-sm">
                                        <Calendar size={14} className="text-[var(--theme-text-muted)] shrink-0" />
                                        <span>Birthday: {formatDate(customer.date_of_birth)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                                Member since
                            </h3>
                            <p className="flex items-center gap-2 m-0 text-[var(--muted-smoke)] text-sm">
                                <Clock size={14} className="text-[var(--theme-text-muted)]" />
                                {formatDate(customer.created_at)}
                            </p>
                        </div>
                        {customer.category && (
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                                    Pricing
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="px-3 py-1.5 rounded-full text-sm font-bold border"
                                        style={{
                                            color: customer.category.color,
                                            borderColor: `${customer.category.color}33`,
                                            backgroundColor: `${customer.category.color}15`,
                                        }}
                                    >
                                        {customer.category.name}
                                    </span>
                                    <span className="text-[var(--muted-smoke)] text-sm">
                                        {customer.category.price_modifier_type === 'retail' && 'Standard price'}
                                        {customer.category.price_modifier_type === 'wholesale' && 'Wholesale price'}
                                        {customer.category.price_modifier_type === 'discount_percentage' &&
                                            `${customer.category.discount_percentage}% discount`}
                                        {customer.category.price_modifier_type === 'custom' && 'Custom price'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'loyalty' && (
                    <div>
                        {loyaltyTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
                                <Star size={48} className="text-white/10 mb-4" />
                                <h3 className="m-0 mb-2 text-[var(--muted-smoke)] text-base font-display">No loyalty transactions</h3>
                                <p className="m-0 text-[var(--theme-text-muted)] text-sm">Points transactions will appear here</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {loyaltyTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center gap-4 py-3.5 px-4 bg-white/[0.02] rounded-xl border border-white/5">
                                        <div className={cn(
                                            'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                                            tx.transaction_type === 'earn' && 'bg-emerald-500/10 text-emerald-400',
                                            tx.transaction_type === 'redeem' && 'bg-amber-500/10 text-amber-400',
                                            (tx.transaction_type === 'adjust' || tx.transaction_type === 'expire') && 'bg-white/5 text-[var(--muted-smoke)]'
                                        )}>
                                            {tx.transaction_type === 'earn' ? <Plus size={14} /> :
                                                tx.transaction_type === 'redeem' ? <Minus size={14} /> :
                                                    <History size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-sm text-white font-medium">
                                                {tx.description || (tx.transaction_type === 'earn' ? 'Points earned' : 'Points redeemed')}
                                            </span>
                                            <span className="block text-xs text-[var(--theme-text-muted)] mt-0.5">{formatDateTime(tx.created_at)}</span>
                                        </div>
                                        <span className={cn(
                                            'text-base font-bold',
                                            tx.transaction_type === 'earn' && 'text-emerald-400',
                                            tx.transaction_type === 'redeem' && 'text-amber-400'
                                        )}>
                                            {tx.transaction_type === 'earn' ? '+' : '-'}{tx.points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
                                <FileText size={48} className="text-white/10 mb-4" />
                                <h3 className="m-0 mb-2 text-[var(--muted-smoke)] text-base font-display">No orders</h3>
                                <p className="m-0 text-[var(--theme-text-muted)] text-sm">Customer orders will appear here</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {orders.map(order => (
                                    <div key={order.id} className="flex items-center gap-4 py-3.5 px-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                                        <div className="flex-1">
                                            <span className="block text-sm font-bold text-white">{order.order_number}</span>
                                            <span className="block text-xs text-[var(--theme-text-muted)] mt-0.5">{formatDateTime(order.created_at)}</span>
                                        </div>
                                        <span className={cn(
                                            'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                                            order.status === 'completed' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                            (order.status === 'pending' || order.status === 'preparing') && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                            order.status === 'ready' && 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                                            order.status === 'cancelled' && 'bg-red-500/10 text-red-400 border-red-500/20'
                                        )}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <span className="text-sm font-bold text-white">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div>
                        {categoryPrices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
                                <DollarSign size={48} className="text-white/10 mb-4" />
                                <h3 className="m-0 mb-2 text-[var(--muted-smoke)] text-base font-display">No custom prices</h3>
                                <p className="m-0 text-[var(--theme-text-muted)] text-sm">
                                    Custom prices for the {customer.category?.name} category will appear here
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] border-b border-white/5">
                                    <span>Product</span>
                                    <span className="text-right">Base Price</span>
                                    <span className="text-right">Custom Price</span>
                                    <span className="text-right">Discount</span>
                                </div>
                                <div className="flex flex-col">
                                    {categoryPrices.map(cp => {
                                        const discount = cp.retail_price > 0
                                            ? Math.round((1 - cp.custom_price / cp.retail_price) * 100)
                                            : 0
                                        return (
                                            <div key={cp.id} className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors items-center">
                                                <div>
                                                    <span className="block text-sm font-medium text-white">{cp.product_name}</span>
                                                    <span className="block text-xs text-[var(--theme-text-muted)] font-mono">{cp.product_sku}</span>
                                                </div>
                                                <span className="text-sm text-[var(--muted-smoke)] text-right font-mono">{formatCurrency(cp.retail_price)}</span>
                                                <span className="text-sm font-bold text-[var(--color-gold)] text-right font-mono">{formatCurrency(cp.custom_price)}</span>
                                                <span className={cn(
                                                    'text-xs font-bold text-right',
                                                    discount > 0 ? 'text-emerald-400' : discount < 0 ? 'text-red-400' : 'text-[var(--muted-smoke)]'
                                                )}>
                                                    {discount > 0 ? `-${discount}%` : discount < 0 ? `+${Math.abs(discount)}%` : '0%'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
