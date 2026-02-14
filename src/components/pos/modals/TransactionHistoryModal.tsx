import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    X, Receipt, Clock, CreditCard, Banknote, QrCode,
    ChevronDown, ChevronUp, ShoppingBag, User, Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '../../../lib/supabase'
import { formatPrice } from '../../../utils/helpers'
import { logError } from '@/utils/logger'

interface TransactionHistoryModalProps {
    sessionId?: string
    sessionOpenedAt?: string
    onClose: () => void
}

interface OrderWithItems {
    id: string
    order_number: string
    order_type: string
    table_number: string | null
    customer_name: string | null
    status: string
    payment_status: string
    subtotal: number
    discount_amount: number
    tax_amount: number
    total_amount: number
    payment_method: string | null
    cash_received: number | null
    change_given: number | null
    created_at: string
    completed_at: string | null
    items: {
        id: string
        product_name: string
        quantity: number
        unit_price: number
        total_price: number
        modifiers: Array<{ name: string; price?: number }> | null
        modifiers_total: number
    }[]
}

export default function TransactionHistoryModal({
    sessionId,
    sessionOpenedAt,
    onClose
}: TransactionHistoryModalProps) {
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

    // Fetch orders for current shift
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['shift-orders-history', sessionId || sessionOpenedAt],
        queryFn: async () => {
            let query = supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    order_type,
                    table_number,
                    customer_name,
                    status,
                    payment_status,
                    subtotal,
                    discount_amount,
                    tax_amount,
                    total,
                    payment_method,
                    cash_received,
                    change_given,
                    created_at,
                    completed_at,
                    order_items (
                        id,
                        product_name,
                        quantity,
                        unit_price,
                        total_price,
                        modifiers,
                        modifiers_total
                    )
                `)
                .order('created_at', { ascending: false })

            // Filter by session opened_at if provided
            if (sessionOpenedAt) {
                query = query.gte('created_at', sessionOpenedAt)
            }

            type RawOrder = Omit<OrderWithItems, 'total_amount' | 'items'> & {
                total: number;
                order_items?: OrderWithItems['items'];
            };

            const { data, error } = await query.limit(50).returns<RawOrder[]>()

            if (error) {
                logError('Error fetching orders:', error)
                return []
            }

            // Map total to total_amount for consistency
            const rawOrders = data ?? [];
            return rawOrders.map((order) => ({
                ...order,
                total_amount: order.total,
                items: order.order_items || []
            })) as OrderWithItems[]
        }
    })

    const getPaymentIcon = (method: string | null) => {
        switch (method) {
            case 'cash': return <Banknote size={16} className="text-emerald-500" />
            case 'qris': return <QrCode size={16} className="text-blue-500" />
            case 'card':
            case 'edc': return <CreditCard size={16} className="text-violet-500" />
            default: return <CreditCard size={16} />
        }
    }

    const getPaymentLabel = (method: string | null) => {
        switch (method) {
            case 'cash': return 'Cash'
            case 'qris': return 'QRIS'
            case 'card': return 'Card'
            case 'edc': return 'EDC'
            case 'transfer': return 'Transfer'
            default: return method || '-'
        }
    }

    const getOrderTypeLabel = (type: string) => {
        switch (type) {
            case 'dine_in': return 'Dine In'
            case 'takeaway': return 'Takeaway'
            case 'delivery': return 'Delivery'
            case 'b2b': return 'B2B'
            default: return type
        }
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const toggleExpand = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    // Calculate totals
    const totals = orders.reduce((acc, order) => ({
        count: acc.count + 1,
        total: acc.total + order.total_amount,
        cash: acc.cash + (order.payment_method === 'cash' ? order.total_amount : 0),
        qris: acc.qris + (order.payment_method === 'qris' ? order.total_amount : 0),
        card: acc.card + (['card', 'edc'].includes(order.payment_method || '') ? order.total_amount : 0)
    }), { count: 0, total: 0, cash: 0, qris: 0, card: 0 })

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="flex w-full max-w-[600px] max-h-[90vh] flex-col rounded-xl bg-[var(--theme-bg-primary)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] max-[480px]:max-h-screen max-[480px]:rounded-none"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Receipt size={24} className="text-[var(--color-gold)]" />
                        <div>
                            <h2 className="m-0 text-lg font-bold text-white">
                                Transaction History
                            </h2>
                            <p className="mt-1 text-sm text-[var(--theme-text-secondary)]">
                                {orders.length} transaction{orders.length > 1 ? 's' : ''} this shift
                            </p>
                        </div>
                    </div>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="flex gap-4 border-b border-white/5 bg-[var(--theme-bg-secondary)] px-6 py-4 max-[480px]:flex-wrap">
                    <div className="flex flex-1 flex-col items-start gap-1 rounded-lg bg-[var(--theme-bg-tertiary)] px-4 py-2">
                        <span className="text-xs text-[var(--theme-text-muted)]">Total</span>
                        <span className="font-bold text-white">{formatPrice(totals.total)}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--theme-bg-tertiary)] px-4 py-2">
                        <Banknote size={14} />
                        <span className="font-bold text-emerald-500">
                            {formatPrice(totals.cash)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--theme-bg-tertiary)] px-4 py-2">
                        <QrCode size={14} />
                        <span className="font-bold text-blue-500">
                            {formatPrice(totals.qris)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--theme-bg-tertiary)] px-4 py-2">
                        <CreditCard size={14} />
                        <span className="font-bold text-violet-500">
                            {formatPrice(totals.card)}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-4 p-12 text-[var(--theme-text-muted)]">
                            Loading...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 p-12 text-[var(--theme-text-muted)]">
                            <Receipt size={48} />
                            <p className="m-0">No transactions for this shift</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className={cn(
                                        'overflow-hidden rounded-xl bg-[var(--theme-bg-secondary)] transition-all duration-200',
                                        expandedOrder === order.id && 'bg-[var(--theme-bg-tertiary)]'
                                    )}
                                >
                                    <div
                                        className="flex cursor-pointer items-center justify-between p-4 transition-colors duration-150 hover:bg-white/5"
                                        onClick={() => toggleExpand(order.id)}
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 font-bold text-white">
                                                <Hash size={14} />
                                                {order.order_number}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-[var(--theme-text-secondary)]">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatTime(order.created_at)}
                                                </span>
                                                <span className="rounded bg-white/10 px-2 py-0.5">
                                                    {getOrderTypeLabel(order.order_type)}
                                                </span>
                                                {order.table_number && (
                                                    <span className="text-[var(--color-gold)]">
                                                        Table {order.table_number}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-end max-[480px]:gap-2">
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary)]">
                                                {getPaymentIcon(order.payment_method)}
                                                <span>{getPaymentLabel(order.payment_method)}</span>
                                            </div>
                                            <div className="min-w-[100px] text-right text-base font-bold text-white">
                                                {formatPrice(order.total_amount)}
                                            </div>
                                            <button className="cursor-pointer border-none bg-transparent p-1 text-[var(--theme-text-secondary)] transition-colors duration-150 hover:text-white">
                                                {expandedOrder === order.id ? (
                                                    <ChevronUp size={20} />
                                                ) : (
                                                    <ChevronDown size={20} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedOrder === order.id && (
                                        <div className="flex flex-col gap-4 border-t border-white/5 p-4">
                                            {/* Order Info */}
                                            <div className="grid grid-cols-2 gap-2 max-[480px]:grid-cols-1">
                                                <div className="flex justify-between rounded-md bg-[var(--theme-bg-tertiary)] px-2 py-1.5 text-xs">
                                                    <span className="flex items-center gap-1 text-[var(--theme-text-secondary)]">Transaction ID</span>
                                                    <span className="font-medium font-mono text-[var(--theme-text-primary)]">{order.id.slice(0, 8)}...</span>
                                                </div>
                                                <div className="flex justify-between rounded-md bg-[var(--theme-bg-tertiary)] px-2 py-1.5 text-xs">
                                                    <span className="flex items-center gap-1 text-[var(--theme-text-secondary)]">Date</span>
                                                    <span className="font-medium text-[var(--theme-text-primary)]">{formatDate(order.created_at)}</span>
                                                </div>
                                                <div className="flex justify-between rounded-md bg-[var(--theme-bg-tertiary)] px-2 py-1.5 text-xs">
                                                    <span className="flex items-center gap-1 text-[var(--theme-text-secondary)]">Order Time</span>
                                                    <span className="font-medium text-[var(--theme-text-primary)]">{formatTime(order.created_at)}</span>
                                                </div>
                                                {order.completed_at && (
                                                    <div className="flex justify-between rounded-md bg-[var(--theme-bg-tertiary)] px-2 py-1.5 text-xs">
                                                        <span className="flex items-center gap-1 text-[var(--theme-text-secondary)]">Payment Time</span>
                                                        <span className="font-medium text-[var(--theme-text-primary)]">{formatTime(order.completed_at)}</span>
                                                    </div>
                                                )}
                                                {order.customer_name && (
                                                    <div className="flex justify-between rounded-md bg-[var(--theme-bg-tertiary)] px-2 py-1.5 text-xs">
                                                        <span className="flex items-center gap-1 text-[var(--theme-text-secondary)]"><User size={12} /> Customer</span>
                                                        <span className="font-medium text-[var(--theme-text-primary)]">{order.customer_name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Items */}
                                            <div className="rounded-lg bg-[var(--theme-bg-tertiary)] p-3">
                                                <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-2 text-xs font-semibold text-[var(--theme-text-secondary)]">
                                                    <ShoppingBag size={14} />
                                                    <span>Items ({order.items.length})</span>
                                                </div>
                                                {order.items.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="min-w-[28px] font-semibold text-[var(--theme-text-secondary)]">
                                                                {item.quantity}x
                                                            </span>
                                                            <span className="text-white">
                                                                {item.product_name}
                                                            </span>
                                                            {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                                                <span className="text-[0.7rem] text-[var(--color-gold)]">
                                                                    + options
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-[var(--theme-text-secondary)]">
                                                            {formatPrice(item.total_price + item.modifiers_total)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Totals */}
                                            <div className="rounded-lg bg-[var(--theme-bg-tertiary)] p-3">
                                                <div className="flex justify-between py-1.5 text-sm text-[var(--theme-text-secondary)]">
                                                    <span>Subtotal</span>
                                                    <span>{formatPrice(order.subtotal)}</span>
                                                </div>
                                                {order.discount_amount > 0 && (
                                                    <div className="flex justify-between py-1.5 text-sm text-amber-400">
                                                        <span>Discount</span>
                                                        <span>-{formatPrice(order.discount_amount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-1.5 text-sm text-[var(--theme-text-secondary)]">
                                                    <span>Tax (10%)</span>
                                                    <span>{formatPrice(order.tax_amount)}</span>
                                                </div>
                                                <div className="mt-1.5 flex justify-between border-t border-white/5 pt-3 text-base font-bold text-white">
                                                    <span>Total</span>
                                                    <span>{formatPrice(order.total_amount)}</span>
                                                </div>
                                                {order.payment_method === 'cash' && order.cash_received && (
                                                    <>
                                                        <div className="flex justify-between py-1.5 text-sm text-[var(--theme-text-secondary)]">
                                                            <span>Cash Received</span>
                                                            <span>{formatPrice(order.cash_received)}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1.5 text-sm text-[var(--theme-text-secondary)]">
                                                            <span>Change</span>
                                                            <span>{formatPrice(order.change_given || 0)}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
