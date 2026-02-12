import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    Search, Download, Check, Clock,
    RefreshCw, CreditCard,
    Calendar, Filter,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { playOrderReadySound } from '../../utils/audio';
import { useKdsStatusListener } from '../../hooks/pos/useKdsStatusListener';
import { useModuleSettings } from '../../hooks/settings';
import type { TItemStatus } from '../../components/orders/OrderItemStatusBadge';
import type { TKitchenStation } from '../../types/offline';
import OrdersTable from './OrdersTable';
import OrderDetailModal from './OrderDetailModal';
import {
    formatCurrency,
    computeStats,
    exportOrdersCsv,
    getStatusLabel,
    ITEMS_PER_PAGE,
    ORDER_STATUSES,
} from './ordersPageHelpers';
import type { Order, OrderItem, OrderStatus, OrderType, PaymentStatus } from './ordersPageHelpers';
import { logError } from '@/utils/logger'

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
                logError('Error fetching orders:', error);
                return [];
            }

            // Type for raw Supabase response
            type RawOrderItem = Omit<OrderItem, 'item_status'> & { item_status?: string };
            type RawOrder = Omit<Order, 'items'> & { order_items?: RawOrderItem[] };

            const rawOrders = data as RawOrder[];
            return rawOrders.map((order) => ({
                ...order,
                items: (order.order_items || []).map(item => ({
                    ...item,
                    item_status: (item.item_status || 'new') as TItemStatus,
                })),
            }));
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
    const animationTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    // Story 4.7: Update local item status when KDS sends updates via LAN
    const handleItemPreparing = useCallback((_orderId: string, itemIds: string[], _station: TKitchenStation) => {
        itemIds.forEach(id => recentlyUpdatedItemsRef.current.add(id));

        const timeoutId = setTimeout(() => {
            itemIds.forEach(id => recentlyUpdatedItemsRef.current.delete(id));
            animationTimeoutsRef.current.delete(timeoutId);
        }, 2000);
        animationTimeoutsRef.current.add(timeoutId);

        queryClient.invalidateQueries({ queryKey: ['orders-backoffice'] });
    }, [queryClient]);

    const handleItemReady = useCallback((orderId: string, itemIds: string[], _station: TKitchenStation, _preparedAt: string) => {
        itemIds.forEach(id => recentlyUpdatedItemsRef.current.add(id));

        const timeoutId = setTimeout(() => {
            itemIds.forEach(id => recentlyUpdatedItemsRef.current.delete(id));
            animationTimeoutsRef.current.delete(timeoutId);
        }, 2000);
        animationTimeoutsRef.current.add(timeoutId);

        queryClient.invalidateQueries({ queryKey: ['orders-backoffice'] });

        // Check if all items in order are now ready - show notification
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const allItemsReady = order.items.every(item =>
                itemIds.includes(item.id) || item.item_status === 'ready' || item.item_status === 'served'
            );
            if (allItemsReady) {
                const soundEnabled = moduleSettings?.kds?.sound_new_order ?? true;
                if (soundEnabled) {
                    playOrderReadySound();
                }
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
                const q = searchQuery.toLowerCase();
                const matchesNumber = order.order_number?.toLowerCase().includes(q);
                const matchesCustomer = order.customer_name?.toLowerCase().includes(q);
                const matchesId = order.id.toLowerCase().includes(q);
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
    const stats = useMemo(() => computeStats(filteredOrders), [filteredOrders]);

    return (
        <div className="p-lg max-md:p-md h-full overflow-y-auto" style={{ background: 'var(--color-blanc-creme)' }}>
            <header className="flex items-center justify-between mb-lg">
                <h1 className="font-display text-4xl font-bold" style={{ color: 'var(--color-brun-chocolat)' }}>
                    Live Orders
                </h1>
                <div className="flex gap-sm">
                    <button
                        className="btn-secondary"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn-secondary" onClick={() => exportOrdersCsv(filteredOrders, dateFrom, dateTo)}>
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="flex gap-md mb-lg flex-wrap max-md:flex-col">
                <div className="orders-stat flex items-center gap-sm py-md px-lg bg-white rounded-md shadow-sm">
                    <span className="orders-stat-label text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                        Total Orders
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--color-brun-chocolat)' }}>{stats.total}</span>
                </div>
                <div className="orders-stat flex items-center gap-sm py-md px-lg bg-white rounded-md shadow-sm">
                    <span className="orders-stat-label text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                        Total Amount
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--color-brun-chocolat)' }}>{formatCurrency(stats.totalAmount)}</span>
                </div>
                <div className="orders-stat flex items-center gap-sm py-md px-lg bg-white rounded-md shadow-sm border-l-[3px] border-l-success">
                    <Check size={16} className="text-success" />
                    <span className="orders-stat-label text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                        Paid
                    </span>
                    <span className="text-xl font-bold text-success">{stats.paid}</span>
                    <span className="text-sm font-semibold font-mono" style={{ color: 'var(--color-gris-chaud)' }}>
                        {formatCurrency(stats.paidAmount)}
                    </span>
                </div>
                <div className="orders-stat flex items-center gap-sm py-md px-lg bg-white rounded-md shadow-sm" style={{ borderLeft: '3px solid var(--color-urgent)' }}>
                    <Clock size={16} style={{ color: 'var(--color-urgent)' }} />
                    <span className="orders-stat-label text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                        Unpaid
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--color-urgent)' }}>{stats.unpaid}</span>
                    <span className="text-sm font-semibold font-mono" style={{ color: 'var(--color-gris-chaud)' }}>
                        {formatCurrency(stats.unpaidAmount)}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-md mb-lg flex-wrap max-md:flex-col">
                <div className="flex flex-col gap-xs">
                    <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }}>
                        Search
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            className="op-filter-input h-10 pl-9 pr-md bg-white border border-border rounded-sm text-sm min-w-[150px] max-md:w-full"
                            style={{ color: 'var(--color-brun-chocolat)' }}
                            placeholder="Order #, customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-gris-chaud)' }} />
                    </div>
                </div>

                <div className="flex flex-col gap-xs">
                    <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }} htmlFor="date-from">
                        <Calendar size={12} /> Start Date
                    </label>
                    <input
                        id="date-from"
                        type="date"
                        className="op-filter-input h-10 px-md bg-white border border-border rounded-sm text-sm min-w-[150px] max-md:w-full"
                        style={{ color: 'var(--color-brun-chocolat)' }}
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-xs">
                    <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }} htmlFor="date-to">
                        <Calendar size={12} /> End Date
                    </label>
                    <input
                        id="date-to"
                        type="date"
                        className="op-filter-input h-10 px-md bg-white border border-border rounded-sm text-sm min-w-[150px] max-md:w-full"
                        style={{ color: 'var(--color-brun-chocolat)' }}
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-xs">
                    <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }} htmlFor="order-type">
                        <Filter size={12} /> Type
                    </label>
                    <select
                        id="order-type"
                        className="op-filter-input h-10 px-md bg-white border border-border rounded-sm text-sm min-w-[150px]"
                        style={{ color: 'var(--color-brun-chocolat)' }}
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

                <div className="flex flex-col gap-xs">
                    <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--color-gris-chaud)' }} htmlFor="payment-status">
                        <CreditCard size={12} /> Payment
                    </label>
                    <select
                        id="payment-status"
                        className="op-filter-input h-10 px-md bg-white border border-border rounded-sm text-sm min-w-[150px]"
                        style={{ color: 'var(--color-brun-chocolat)' }}
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
            <div className="flex gap-xs items-end flex-wrap mb-lg">
                {ORDER_STATUSES.map(status => (
                    <button
                        key={status}
                        className="op-status-pill py-sm px-md bg-white border border-border rounded-xl text-sm font-medium cursor-pointer transition-all duration-fast ease-standard"
                        style={{
                            color: statusFilter === status ? 'white' : 'var(--color-gris-chaud)',
                            background: statusFilter === status ? 'var(--color-rose-poudre)' : undefined,
                            borderColor: statusFilter === status ? 'var(--color-rose-poudre)' : undefined,
                        }}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status === 'all' ? 'All' : getStatusLabel(status)}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <OrdersTable
                paginatedOrders={paginatedOrders}
                filteredTotal={filteredOrders.length}
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onSelectOrder={setSelectedOrder}
                onPageChange={setCurrentPage}
            />

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    recentlyUpdatedItems={recentlyUpdatedItemsRef.current}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            {/* Scoped styles for focus states and hover effects */}
            <style>{`
                .op-filter-input:focus {
                    outline: none;
                    border-color: var(--color-rose-poudre);
                }
                .op-status-pill:hover {
                    border-color: var(--color-rose-poudre);
                    color: var(--color-rose-poudre);
                }
            `}</style>
        </div>
    );
};

export default OrdersPage;
