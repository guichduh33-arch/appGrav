import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    Search, Download, ChevronLeft, ChevronRight, Check, Clock,
    RefreshCw, X, ShoppingBag, User, Hash, CreditCard, Banknote, QrCode,
    Calendar, Filter, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';
import { playOrderReadySound } from '../../utils/audio';
import { useKdsStatusListener } from '../../hooks/pos/useKdsStatusListener';
import { useModuleSettings } from '../../hooks/useSettings';
import { OrderItemStatusBadge, type TItemStatus } from '../../components/orders/OrderItemStatusBadge';
import type { TKitchenStation } from '../../types/offline';
import './OrdersPage.css';

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    modifiers: Record<string, any> | null;
    modifiers_total: number;
    item_status: TItemStatus;
    dispatch_station?: string;
}

interface Order {
    id: string;
    order_number: string;
    order_type: string;
    table_number: string | null;
    customer_name: string | null;
    status: string;
    payment_status: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    payment_method: string | null;
    cash_received: number | null;
    change_given: number | null;
    created_at: string;
    completed_at: string | null;
    items: OrderItem[];
}

type OrderStatus = 'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type OrderType = 'all' | 'dine_in' | 'takeaway' | 'delivery' | 'b2b';
type PaymentStatus = 'all' | 'paid' | 'unpaid';

const ITEMS_PER_PAGE = 20;

const OrdersPage = () => {
    const queryClient = useQueryClient();
    const { data: moduleSettings } = useModuleSettings();

    const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
    const [typeFilter, setTypeFilter] = useState<OrderType>('all');
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Fetch orders from Supabase
    const { data: ordersData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['orders-backoffice', dateFrom, dateTo],
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
                        modifiers_total,
                        item_status,
                        dispatch_station
                    )
                `)
                .order('created_at', { ascending: false });

            // Date filtering
            if (dateFrom) {
                query = query.gte('created_at', `${dateFrom}T00:00:00`);
            }
            if (dateTo) {
                query = query.lte('created_at', `${dateTo}T23:59:59`);
            }

            const { data, error } = await query.limit(500);

            if (error) {
                console.error('Error fetching orders:', error);
                return [];
            }

            // Type for raw Supabase response
            type RawOrderItem = Omit<OrderItem, 'item_status'> & { item_status?: string };
            type RawOrder = Omit<Order, 'items'> & { order_items?: RawOrderItem[] };

            const rawOrders = data as unknown as RawOrder[];
            return rawOrders.map((order) => ({
                ...order,
                items: (order.order_items || []).map(item => ({
                    ...item,
                    item_status: (item.item_status || 'new') as TItemStatus,
                })),
            })) as Order[];
        },
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const orders = ordersData || [];

    // Real-time subscription for live updates
    useEffect(() => {
        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                () => {
                    // Invalidate and refetch orders on any change
                    queryClient.invalidateQueries({ queryKey: ['orders-backoffice'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // Story 4.7: Track recently updated items for animation
    const recentlyUpdatedItemsRef = useRef<Set<string>>(new Set());
    // Track timeouts for cleanup to prevent memory leaks
    const animationTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    // Story 4.7: Update local item status when KDS sends updates via LAN
    const handleItemPreparing = useCallback((_orderId: string, itemIds: string[], _station: TKitchenStation) => {
        // Mark items as recently updated for animation
        itemIds.forEach(id => recentlyUpdatedItemsRef.current.add(id));

        // Track timeout for cleanup to prevent memory leaks
        const timeoutId = setTimeout(() => {
            itemIds.forEach(id => recentlyUpdatedItemsRef.current.delete(id));
            animationTimeoutsRef.current.delete(timeoutId);
        }, 2000);
        animationTimeoutsRef.current.add(timeoutId);

        // Invalidate query to refetch with updated statuses
        queryClient.invalidateQueries({ queryKey: ['orders-backoffice'] });
    }, [queryClient]);

    const handleItemReady = useCallback((orderId: string, itemIds: string[], _station: TKitchenStation, _preparedAt: string) => {
        // Mark items as recently updated for animation
        itemIds.forEach(id => recentlyUpdatedItemsRef.current.add(id));

        // Track timeout for cleanup to prevent memory leaks
        const timeoutId = setTimeout(() => {
            itemIds.forEach(id => recentlyUpdatedItemsRef.current.delete(id));
            animationTimeoutsRef.current.delete(timeoutId);
        }, 2000);
        animationTimeoutsRef.current.add(timeoutId);

        // Invalidate query to refetch with updated statuses
        queryClient.invalidateQueries({ queryKey: ['orders-backoffice'] });

        // Check if all items in order are now ready - show notification
        // Note: Using orders from closure - may be slightly stale but acceptable for notification
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const allItemsReady = order.items.every(item =>
                itemIds.includes(item.id) || item.item_status === 'ready' || item.item_status === 'served'
            );
            if (allItemsReady) {
                // Play notification sound if enabled in settings (AC3)
                const soundEnabled = moduleSettings?.kds?.sound_new_order ?? true;
                if (soundEnabled) {
                    playOrderReadySound();
                }

                // Show toast notification
                toast.success(`Order #${order.order_number} is ready!`, {
                    duration: 5000,
                    position: 'top-right',
                });
            }
        }
    }, [orders, queryClient, moduleSettings]);

    // Story 4.7: KDS Status Listener for real-time item updates via LAN
    useKdsStatusListener({
        onItemPreparing: handleItemPreparing,
        onItemReady: handleItemReady,
        enabled: true,
    });

    // Cleanup animation timeouts on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            animationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
            animationTimeoutsRef.current.clear();
        };
    }, []);

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (statusFilter !== 'all' && order.status !== statusFilter) return false;
            if (typeFilter !== 'all' && order.order_type !== typeFilter) return false;
            if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesNumber = order.order_number?.toLowerCase().includes(query);
                const matchesCustomer = order.customer_name?.toLowerCase().includes(query);
                const matchesId = order.id.toLowerCase().includes(query);
                if (!matchesNumber && !matchesCustomer && !matchesId) return false;
            }
            return true;
        });
    }, [orders, statusFilter, typeFilter, paymentFilter, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, typeFilter, paymentFilter, searchQuery, dateFrom, dateTo]);

    // Stats
    const stats = useMemo(() => {
        const today = filteredOrders;
        return {
            total: today.length,
            totalAmount: today.reduce((sum, o) => sum + o.total, 0),
            paid: today.filter(o => o.payment_status === 'paid').length,
            unpaid: today.filter(o => o.payment_status === 'unpaid' || o.payment_status === 'pending').length,
            paidAmount: today.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0),
            unpaidAmount: today.filter(o => o.payment_status === 'unpaid' || o.payment_status === 'pending').reduce((sum, o) => sum + o.total, 0)
        };
    }, [filteredOrders]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderTypeLabel = (type: string) => {
        switch (type) {
            case 'dine_in': return 'Dine In';
            case 'takeaway': return 'Takeaway';
            case 'delivery': return 'Delivery';
            case 'b2b': return 'B2B';
            default: return type;
        }
    };

    const getOrderTypeIcon = (type: string) => {
        switch (type) {
            case 'dine_in': return '🍽️';
            case 'takeaway': return '📦';
            case 'delivery': return '🚗';
            case 'b2b': return '🏢';
            default: return '📋';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'preparing': return 'Preparing';
            case 'ready': return 'Ready';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const getPaymentIcon = (method: string | null) => {
        switch (method) {
            case 'cash': return <Banknote size={14} className="payment-method-icon payment-method-icon--cash" />;
            case 'qris': return <QrCode size={14} className="payment-method-icon payment-method-icon--qris" />;
            case 'card':
            case 'edc': return <CreditCard size={14} className="payment-method-icon payment-method-icon--card" />;
            default: return <CreditCard size={14} />;
        }
    };

    const getPaymentMethodLabel = (method: string | null) => {
        switch (method) {
            case 'cash': return 'Cash';
            case 'qris': return 'QRIS';
            case 'card': return 'Card';
            case 'edc': return 'EDC';
            case 'transfer': return 'Transfer';
            default: return method || '-';
        }
    };

    const handleExport = () => {
        // Export filtered orders as CSV
        const headers = ['Order #', 'Date', 'Type', 'Customer', 'Amount', 'Status', 'Payment', 'Method'];
        const rows = filteredOrders.map(order => [
            order.order_number,
            formatFullDate(order.created_at),
            getOrderTypeLabel(order.order_type),
            order.customer_name || '-',
            order.total,
            getStatusLabel(order.status),
            order.payment_status === 'paid' ? 'Paid' : 'Unpaid',
            getPaymentMethodLabel(order.payment_method)
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders_${dateFrom}_${dateTo}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="orders-page">
            <header className="orders-page__header">
                <h1 className="orders-page__title">Live Orders</h1>
                <div className="orders-page__actions">
                    <button
                        className="btn-secondary"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw size={18} className={isFetching ? 'spinning' : ''} />
                        Refresh
                    </button>
                    <button className="btn-secondary" onClick={handleExport}>
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="orders-stats">
                <div className="orders-stat">
                    <span className="orders-stat__label">Total Orders</span>
                    <span className="orders-stat__value">{stats.total}</span>
                </div>
                <div className="orders-stat">
                    <span className="orders-stat__label">Total Amount</span>
                    <span className="orders-stat__value">{formatCurrency(stats.totalAmount)}</span>
                </div>
                <div className="orders-stat orders-stat--success">
                    <Check size={16} />
                    <span className="orders-stat__label">Paid</span>
                    <span className="orders-stat__value">{stats.paid}</span>
                    <span className="orders-stat__amount">{formatCurrency(stats.paidAmount)}</span>
                </div>
                <div className="orders-stat orders-stat--warning">
                    <Clock size={16} />
                    <span className="orders-stat__label">Unpaid</span>
                    <span className="orders-stat__value">{stats.unpaid}</span>
                    <span className="orders-stat__amount">{formatCurrency(stats.unpaidAmount)}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                <div className="filter-group">
                    <label className="filter-group__label">Search</label>
                    <div className="filter-group__search-wrapper">
                        <input
                            type="text"
                            className="filter-group__input filter-group__input--with-icon"
                            placeholder="Order #, customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={16} className="filter-group__input-icon" />
                    </div>
                </div>

                <div className="filter-group">
                    <label className="filter-group__label" htmlFor="date-from">
                        <Calendar size={12} /> Start Date
                    </label>
                    <input
                        id="date-from"
                        type="date"
                        className="filter-group__input"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-group__label" htmlFor="date-to">
                        <Calendar size={12} /> End Date
                    </label>
                    <input
                        id="date-to"
                        type="date"
                        className="filter-group__input"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-group__label" htmlFor="order-type">
                        <Filter size={12} /> Type
                    </label>
                    <select
                        id="order-type"
                        className="filter-group__input"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as OrderType)}
                    >
                        <option value="all">All</option>
                        <option value="dine_in">Dine In</option>
                        <option value="takeaway">Takeaway</option>
                        <option value="delivery">Delivery</option>
                        <option value="b2b">B2B</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-group__label" htmlFor="payment-status">
                        <CreditCard size={12} /> Payment
                    </label>
                    <select
                        id="payment-status"
                        className="filter-group__input"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus)}
                    >
                        <option value="all">All</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="status-filters status-filters--mb">
                {(['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'] as OrderStatus[]).map(status => (
                    <button
                        key={status}
                        className={`status-pill ${statusFilter === status ? 'is-active' : ''}`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status === 'all' ? 'All' : getStatusLabel(status)}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                {isLoading ? (
                    <div className="orders-loading">
                        <RefreshCw size={32} className="spinning" />
                        <p>Loading orders...</p>
                    </div>
                ) : paginatedOrders.length > 0 ? (
                    <>
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        className={order.payment_status !== 'paid' ? 'is-unpaid' : ''}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td>
                                            <span className="order-number">#{order.order_number}</span>
                                        </td>
                                        <td>
                                            <div>{formatTime(order.created_at)}</div>
                                            <div className="order-date-sub">
                                                {formatDate(order.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`order-type-badge ${order.order_type}`}>
                                                {getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}
                                                {order.table_number && ` - T${order.table_number}`}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="order-customer">
                                                {order.customer_name || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="order-items-count">
                                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                            </span>
                                        </td>
                                        <td>
                                            <span className="order-amount">{formatCurrency(order.total)}</span>
                                        </td>
                                        <td>
                                            <span className={`order-status ${order.status}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="payment-info">
                                                <span className={`payment-status ${order.payment_status}`}>
                                                    {order.payment_status === 'paid' ? (
                                                        <><Check size={14} /> Paid</>
                                                    ) : (
                                                        <><Clock size={14} /> Unpaid</>
                                                    )}
                                                </span>
                                                {order.payment_status === 'paid' && order.payment_method && (
                                                    <span className="payment-method">
                                                        {getPaymentIcon(order.payment_method)}
                                                        {getPaymentMethodLabel(order.payment_method)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-view-order"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                }}
                                            >
                                                <Eye size={14} /> Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="orders-pagination">
                            <div className="pagination-info">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                            </div>
                            <div className="pagination-buttons">
                                <button
                                    className="pagination-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-btn ${currentPage === pageNum ? 'is-active' : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    className="pagination-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    aria-label="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="orders-empty">
                        <div className="orders-empty__icon">📋</div>
                        <div className="orders-empty__text">No orders found</div>
                        <div className="orders-empty__subtext">Adjust your filters to see more results</div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="order-detail-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="order-detail__header">
                            <div className="order-detail__title-group">
                                <h2 className="order-detail__title">
                                    <Hash size={20} />
                                    Order #{selectedOrder.order_number}
                                </h2>
                                <span className={`order-status ${selectedOrder.status}`}>
                                    {getStatusLabel(selectedOrder.status)}
                                </span>
                            </div>
                            <button className="order-detail__close" onClick={() => setSelectedOrder(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="order-detail__content">
                            {/* Order Info */}
                            <div className="order-detail__info-grid">
                                <div className="order-detail__info-item">
                                    <span className="order-detail__info-label">Transaction ID</span>
                                    <span className="order-detail__info-value order-detail__info-value--mono">
                                        {selectedOrder.id.slice(0, 8)}...
                                    </span>
                                </div>
                                <div className="order-detail__info-item">
                                    <span className="order-detail__info-label">Date & Time</span>
                                    <span className="order-detail__info-value">
                                        {formatFullDate(selectedOrder.created_at)}
                                    </span>
                                </div>
                                <div className="order-detail__info-item">
                                    <span className="order-detail__info-label">Type</span>
                                    <span className="order-detail__info-value">
                                        {getOrderTypeIcon(selectedOrder.order_type)} {getOrderTypeLabel(selectedOrder.order_type)}
                                        {selectedOrder.table_number && ` - Table ${selectedOrder.table_number}`}
                                    </span>
                                </div>
                                {selectedOrder.customer_name && (
                                    <div className="order-detail__info-item">
                                        <span className="order-detail__info-label">
                                            <User size={12} /> Customer
                                        </span>
                                        <span className="order-detail__info-value">
                                            {selectedOrder.customer_name}
                                        </span>
                                    </div>
                                )}
                                <div className="order-detail__info-item">
                                    <span className="order-detail__info-label">Payment Status</span>
                                    <span className={`payment-status ${selectedOrder.payment_status}`}>
                                        {selectedOrder.payment_status === 'paid' ? (
                                            <><Check size={14} /> Paid</>
                                        ) : (
                                            <><Clock size={14} /> Unpaid</>
                                        )}
                                    </span>
                                </div>
                                {selectedOrder.payment_method && (
                                    <div className="order-detail__info-item">
                                        <span className="order-detail__info-label">Payment Method</span>
                                        <span className="order-detail__info-value">
                                            {getPaymentIcon(selectedOrder.payment_method)}
                                            {getPaymentMethodLabel(selectedOrder.payment_method)}
                                        </span>
                                    </div>
                                )}
                                {selectedOrder.completed_at && (
                                    <div className="order-detail__info-item">
                                        <span className="order-detail__info-label">Payment Time</span>
                                        <span className="order-detail__info-value">
                                            {formatFullDate(selectedOrder.completed_at)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="order-detail__items">
                                <div className="order-detail__items-header">
                                    <ShoppingBag size={16} />
                                    <span>Items ({selectedOrder.items.length})</span>
                                </div>
                                <div className="order-detail__items-list">
                                    {selectedOrder.items.map(item => (
                                        <div key={item.id} className="order-detail__item">
                                            <div className="order-detail__item-info">
                                                <span className="order-detail__item-qty">{item.quantity}x</span>
                                                <span className="order-detail__item-name">{item.product_name}</span>
                                                {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                                    <span className="order-detail__item-mods">
                                                        + options ({formatCurrency(item.modifiers_total)})
                                                    </span>
                                                )}
                                            </div>
                                            {/* Story 4.7: Item status badge with animation */}
                                            <OrderItemStatusBadge
                                                status={item.item_status}
                                                animate={recentlyUpdatedItemsRef.current.has(item.id)}
                                                size="sm"
                                            />
                                            <span className="order-detail__item-price">
                                                {formatCurrency(item.total_price + (item.modifiers_total || 0))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Totals */}
                            <div className="order-detail__totals">
                                <div className="order-detail__total-row">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                </div>
                                {selectedOrder.discount_amount > 0 && (
                                    <div className="order-detail__total-row order-detail__total-row--discount">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="order-detail__total-row">
                                    <span>Tax (10%)</span>
                                    <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                                </div>
                                <div className="order-detail__total-row order-detail__total-row--final">
                                    <span>Total</span>
                                    <span>{formatCurrency(selectedOrder.total)}</span>
                                </div>
                                {selectedOrder.payment_method === 'cash' && selectedOrder.cash_received && (
                                    <>
                                        <div className="order-detail__total-row">
                                            <span>Cash Received</span>
                                            <span>{formatCurrency(selectedOrder.cash_received)}</span>
                                        </div>
                                        <div className="order-detail__total-row">
                                            <span>Change</span>
                                            <span>{formatCurrency(selectedOrder.change_given || 0)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
