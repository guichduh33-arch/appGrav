import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { playOrderReadySound } from '../../utils/audio';
import { useKdsStatusListener } from '../../hooks/pos/useKdsStatusListener';
import { useModuleSettings } from '../../hooks/settings';
import type { TItemStatus } from '../../components/orders/OrderItemStatusBadge';
import type { TKitchenStation } from '../../types/offline';
import OrdersHeader from './OrdersHeader';
import OrdersStats from './OrdersStats';
import OrdersFilters from './OrdersFilters';
import OrdersTable from './OrdersTable';
import OrderDetailModal from './OrderDetailModal';
import {
    computeStats,
    ITEMS_PER_PAGE,
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
        refetchInterval: 30000
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

    useKdsStatusListener({
        onItemPreparing: handleItemPreparing,
        onItemReady: handleItemReady,
        enabled: true,
    });

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

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, typeFilter, paymentFilter, searchQuery, dateFrom, dateTo]);

    const stats = useMemo(() => computeStats(filteredOrders), [filteredOrders]);

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 max-md:p-4 overflow-y-auto">
            <OrdersHeader
                isFetching={isFetching}
                filteredOrders={filteredOrders}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onRefetch={() => refetch()}
            />

            <OrdersStats stats={stats} />

            <OrdersFilters
                searchQuery={searchQuery}
                dateFrom={dateFrom}
                dateTo={dateTo}
                typeFilter={typeFilter}
                paymentFilter={paymentFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearchQuery}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onTypeChange={setTypeFilter}
                onPaymentChange={setPaymentFilter}
                onStatusChange={setStatusFilter}
            />

            <OrdersTable
                paginatedOrders={paginatedOrders}
                filteredTotal={filteredOrders.length}
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onSelectOrder={setSelectedOrder}
                onPageChange={setCurrentPage}
            />

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    recentlyUpdatedItems={recentlyUpdatedItemsRef.current}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default OrdersPage;
