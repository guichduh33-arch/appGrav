import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    X, Receipt, Clock, CreditCard, Banknote, QrCode,
    ChevronDown, ChevronUp, ShoppingBag, User, Hash
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { formatPrice } from '../../../utils/helpers'
import './TransactionHistoryModal.css'

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

            const { data, error } = await query.limit(50)

            if (error) {
                console.error('Error fetching orders:', error)
                return []
            }

            // Map total to total_amount for consistency
            type RawOrder = Omit<OrderWithItems, 'total_amount' | 'items'> & {
                total: number;
                order_items?: OrderWithItems['items'];
            };
            const rawOrders = data as unknown as RawOrder[];
            return (rawOrders || []).map((order) => ({
                ...order,
                total_amount: order.total,
                items: order.order_items || []
            })) as OrderWithItems[]
        }
    })

    const getPaymentIcon = (method: string | null) => {
        switch (method) {
            case 'cash': return <Banknote size={16} className="payment-icon payment-icon--cash" />
            case 'qris': return <QrCode size={16} className="payment-icon payment-icon--qris" />
            case 'card':
            case 'edc': return <CreditCard size={16} className="payment-icon payment-icon--card" />
            default: return <CreditCard size={16} />
        }
    }

    const getPaymentLabel = (method: string | null) => {
        switch (method) {
            case 'cash': return 'Cash'
            case 'qris': return 'QRIS'
            case 'card': return 'Carte'
            case 'edc': return 'EDC'
            case 'transfer': return 'Virement'
            default: return method || '-'
        }
    }

    const getOrderTypeLabel = (type: string) => {
        switch (type) {
            case 'dine_in': return 'Sur place'
            case 'takeaway': return 'À emporter'
            case 'delivery': return 'Livraison'
            case 'b2b': return 'B2B'
            default: return type
        }
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
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
        <div className="transaction-history-overlay" onClick={onClose}>
            <div className="transaction-history" onClick={e => e.stopPropagation()}>
                <div className="transaction-history__header">
                    <div className="transaction-history__header-icon">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h2 className="transaction-history__title">
                            Transaction History
                        </h2>
                        <p className="transaction-history__subtitle">
                            {orders.length} transaction{orders.length > 1 ? 's' : ''} this shift
                        </p>
                    </div>
                    <button className="transaction-history__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="transaction-history__stats">
                    <div className="transaction-history__stat">
                        <span className="transaction-history__stat-label">Total</span>
                        <span className="transaction-history__stat-value">{formatPrice(totals.total)}</span>
                    </div>
                    <div className="transaction-history__stat">
                        <Banknote size={14} />
                        <span className="transaction-history__stat-value transaction-history__stat-value--cash">
                            {formatPrice(totals.cash)}
                        </span>
                    </div>
                    <div className="transaction-history__stat">
                        <QrCode size={14} />
                        <span className="transaction-history__stat-value transaction-history__stat-value--qris">
                            {formatPrice(totals.qris)}
                        </span>
                    </div>
                    <div className="transaction-history__stat">
                        <CreditCard size={14} />
                        <span className="transaction-history__stat-value transaction-history__stat-value--card">
                            {formatPrice(totals.card)}
                        </span>
                    </div>
                </div>

                <div className="transaction-history__content">
                    {isLoading ? (
                        <div className="transaction-history__loading">
                            Loading...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="transaction-history__empty">
                            <Receipt size={48} />
                            <p>No transactions for this shift</p>
                        </div>
                    ) : (
                        <div className="transaction-history__list">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className={`transaction-card ${expandedOrder === order.id ? 'is-expanded' : ''}`}
                                >
                                    <div
                                        className="transaction-card__header"
                                        onClick={() => toggleExpand(order.id)}
                                    >
                                        <div className="transaction-card__main">
                                            <div className="transaction-card__number">
                                                <Hash size={14} />
                                                {order.order_number}
                                            </div>
                                            <div className="transaction-card__meta">
                                                <span className="transaction-card__time">
                                                    <Clock size={12} />
                                                    {formatTime(order.created_at)}
                                                </span>
                                                <span className="transaction-card__type">
                                                    {getOrderTypeLabel(order.order_type)}
                                                </span>
                                                {order.table_number && (
                                                    <span className="transaction-card__table">
                                                        Table {order.table_number}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="transaction-card__right">
                                            <div className="transaction-card__payment">
                                                {getPaymentIcon(order.payment_method)}
                                                <span>{getPaymentLabel(order.payment_method)}</span>
                                            </div>
                                            <div className="transaction-card__amount">
                                                {formatPrice(order.total_amount)}
                                            </div>
                                            <button className="transaction-card__expand">
                                                {expandedOrder === order.id ? (
                                                    <ChevronUp size={20} />
                                                ) : (
                                                    <ChevronDown size={20} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedOrder === order.id && (
                                        <div className="transaction-card__details">
                                            {/* Order Info */}
                                            <div className="transaction-card__info">
                                                <div className="transaction-card__info-row">
                                                    <span>ID Transaction</span>
                                                    <span className="transaction-card__id">{order.id.slice(0, 8)}...</span>
                                                </div>
                                                <div className="transaction-card__info-row">
                                                    <span>Date</span>
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>
                                                <div className="transaction-card__info-row">
                                                    <span>Heure commande</span>
                                                    <span>{formatTime(order.created_at)}</span>
                                                </div>
                                                {order.completed_at && (
                                                    <div className="transaction-card__info-row">
                                                        <span>Heure paiement</span>
                                                        <span>{formatTime(order.completed_at)}</span>
                                                    </div>
                                                )}
                                                {order.customer_name && (
                                                    <div className="transaction-card__info-row">
                                                        <span><User size={12} /> Client</span>
                                                        <span>{order.customer_name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Items */}
                                            <div className="transaction-card__items">
                                                <div className="transaction-card__items-header">
                                                    <ShoppingBag size={14} />
                                                    <span>Articles ({order.items.length})</span>
                                                </div>
                                                {order.items.map(item => (
                                                    <div key={item.id} className="transaction-card__item">
                                                        <div className="transaction-card__item-info">
                                                            <span className="transaction-card__item-qty">
                                                                {item.quantity}x
                                                            </span>
                                                            <span className="transaction-card__item-name">
                                                                {item.product_name}
                                                            </span>
                                                            {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                                                <span className="transaction-card__item-mods">
                                                                    + options
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="transaction-card__item-price">
                                                            {formatPrice(item.total_price + item.modifiers_total)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Totals */}
                                            <div className="transaction-card__totals">
                                                <div className="transaction-card__total-row">
                                                    <span>Sous-total</span>
                                                    <span>{formatPrice(order.subtotal)}</span>
                                                </div>
                                                {order.discount_amount > 0 && (
                                                    <div className="transaction-card__total-row transaction-card__total-row--discount">
                                                        <span>Remise</span>
                                                        <span>-{formatPrice(order.discount_amount)}</span>
                                                    </div>
                                                )}
                                                <div className="transaction-card__total-row">
                                                    <span>TVA (10%)</span>
                                                    <span>{formatPrice(order.tax_amount)}</span>
                                                </div>
                                                <div className="transaction-card__total-row transaction-card__total-row--final">
                                                    <span>Total</span>
                                                    <span>{formatPrice(order.total_amount)}</span>
                                                </div>
                                                {order.payment_method === 'cash' && order.cash_received && (
                                                    <>
                                                        <div className="transaction-card__total-row">
                                                            <span>Espèces reçues</span>
                                                            <span>{formatPrice(order.cash_received)}</span>
                                                        </div>
                                                        <div className="transaction-card__total-row">
                                                            <span>Rendu</span>
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
