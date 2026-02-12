import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, FileText, Eye, CreditCard, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';

type TabType = 'clients' | 'orders';

interface B2BStats {
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
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('clients');
    const [stats, setStats] = useState<B2BStats>({
        totalClients: 0,
        activeClients: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        unpaidAmount: 0
    });
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch wholesale customers
            const { data: customersData } = await supabase
                .from('customers')
                .select('*')
                .eq('customer_type', 'wholesale')
                .order('total_spent', { ascending: false })
                .limit(8);

            if (customersData) {
                setCustomers(customersData as Customer[]);
                setStats(s => ({
                    ...s,
                    totalClients: customersData.length,
                    activeClients: (customersData as Customer[]).filter(c => c.is_active).length
                }));
            }

            // Fetch recent B2B orders
            const { data: ordersData } = await supabase
                .from('b2b_orders')
                .select(`
                    id, order_number, total, status, payment_status, order_date,
                    customer:customers(name, company_name)
                `)
                .order('order_date', { ascending: false })
                .limit(5);

            if (ordersData) {
                // Map DB field 'total' to UI field 'total_amount'
                const mappedOrders = ordersData.map(order => ({
                    ...order,
                    total_amount: order.total ?? 0,
                })) as unknown as RecentOrder[]
                setRecentOrders(mappedOrders);

                // Calculate stats from orders
                const { data: allOrders } = await supabase
                    .from('b2b_orders')
                    .select('total, status, payment_status, paid_amount')
                    .neq('status', 'cancelled');

                if (allOrders && allOrders.length > 0) {
                    const typedOrders = allOrders as Array<{
                        total: number | null
                        status: string
                        payment_status: string
                        paid_amount: number | null
                    }>;
                    setStats(s => ({
                        ...s,
                        totalOrders: typedOrders.length,
                        pendingOrders: typedOrders.filter(o => ['confirmed', 'processing', 'ready'].includes(o.status)).length,
                        totalRevenue: typedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                        unpaidAmount: typedOrders.reduce((sum, o) => sum + ((o.total || 0) - (o.paid_amount || 0)), 0)
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching B2B data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            draft: 'Draft',
            confirmed: 'Confirmed',
            processing: 'Processing',
            ready: 'Ready',
            partially_delivered: 'Partial Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return labels[status] || status;
    };

    const statusBadgeStyles: Record<string, string> = {
        pending: 'bg-warning-bg text-warning',
        confirmed: 'bg-info-bg text-info',
        delivered: 'bg-success-bg text-success',
        cancelled: 'bg-[rgba(220,53,69,0.1)] text-[var(--color-urgent)]',
        draft: 'bg-[rgba(108,117,125,0.1)] text-[#6c757d]',
        processing: 'bg-[rgba(234,192,134,0.2)] text-[#b38600]',
        ready: 'bg-[rgba(138,118,171,0.15)] text-[#7c5cbf]',
        partially_delivered: 'bg-[rgba(255,153,0,0.15)] text-[#cc7a00]',
    };

    const paymentBadgeStyles: Record<string, string> = {
        paid: 'text-success',
        unpaid: 'text-[var(--color-urgent)]',
        partial: 'text-warning',
    };

    return (
        <div className="p-lg h-full overflow-y-auto bg-[var(--color-blanc-creme)]">
            <header className="flex items-center justify-between mb-lg">
                <div>
                    <h1 className="font-display text-4xl font-bold text-[var(--color-brun-chocolat)]">B2B / Wholesale</h1>
                    <p className="text-[var(--color-gris-chaud)] text-sm mt-xs">Manage your wholesale customers and B2B orders</p>
                </div>
                <div className="flex gap-sm">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/b2b/payments')}>
                        <CreditCard size={18} />
                        Payments
                    </button>
                    <button type="button" className="btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                        <Plus size={18} />
                        New Order
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 max-md:grid-cols-2 gap-md mb-lg">
                <div
                    className="bg-white rounded-lg shadow p-lg flex items-center gap-md cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-fast ease-standard"
                    onClick={() => navigate('/b2b/orders')}
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-md text-2xl bg-[rgba(186,144,162,0.1)]">
                        <Building2 size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[var(--color-brun-chocolat)]">{stats.totalClients}</span>
                        <span className="text-sm text-[var(--color-gris-chaud)]">B2B Clients</span>
                    </div>
                </div>
                <div
                    className="bg-white rounded-lg shadow p-lg flex items-center gap-md cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-fast ease-standard"
                    onClick={() => navigate('/b2b/orders')}
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-md text-2xl bg-[rgba(123,163,181,0.1)]">
                        <FileText size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[var(--color-brun-chocolat)]">{stats.totalOrders}</span>
                        <span className="text-sm text-[var(--color-gris-chaud)]">Orders</span>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-lg flex items-center gap-md">
                    <div className="w-12 h-12 flex items-center justify-center rounded-md text-2xl bg-[rgba(107,142,107,0.1)]">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-[var(--color-brun-chocolat)]">
                            {formatCurrency(stats.totalRevenue)}
                        </span>
                        <span className="text-sm text-[var(--color-gris-chaud)]">Total Revenue</span>
                    </div>
                </div>
                <div
                    className="bg-white rounded-lg shadow p-lg flex items-center gap-md cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-fast ease-standard"
                    onClick={() => navigate('/b2b/payments')}
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-md text-2xl bg-[rgba(234,192,134,0.1)]">
                        <Clock size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-[var(--color-brun-chocolat)]">
                            {formatCurrency(stats.unpaidAmount)}
                        </span>
                        <span className="text-sm text-[var(--color-gris-chaud)]">To Collect</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-md mb-xl">
                <div
                    className="bg-white rounded-lg shadow p-lg flex items-center gap-md cursor-pointer transition-all duration-fast ease-standard hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => navigate('/b2b/orders')}
                >
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-rose-poudre)] to-[var(--color-rose-hover)] text-white rounded-md flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-[var(--color-brun-chocolat)] mb-xs">B2B Orders</h3>
                        <p className="text-sm text-[var(--color-gris-chaud)]">Manage all wholesale orders</p>
                    </div>
                    <ArrowRight size={20} className="text-[var(--color-gris-chaud)]" />
                </div>
                <div
                    className="bg-white rounded-lg shadow p-lg flex items-center gap-md cursor-pointer transition-all duration-fast ease-standard hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => navigate('/b2b/payments')}
                >
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-rose-poudre)] to-[var(--color-rose-hover)] text-white rounded-md flex items-center justify-center shrink-0">
                        <CreditCard size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-[var(--color-brun-chocolat)] mb-xs">Payments</h3>
                        <p className="text-sm text-[var(--color-gris-chaud)]">Track collections and outstanding balances</p>
                    </div>
                    <ArrowRight size={20} className="text-[var(--color-gris-chaud)]" />
                </div>
                <div
                    className="bg-white rounded-lg shadow p-lg flex items-center gap-md cursor-pointer transition-all duration-fast ease-standard hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => navigate('/b2b/orders/new')}
                >
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-rose-poudre)] to-[var(--color-rose-hover)] text-white rounded-md flex items-center justify-center shrink-0">
                        <Plus size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-[var(--color-brun-chocolat)] mb-xs">New Order</h3>
                        <p className="text-sm text-[var(--color-gris-chaud)]">Create a B2B order</p>
                    </div>
                    <ArrowRight size={20} className="text-[var(--color-gris-chaud)]" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-xs mb-lg border-b border-border pb-xs">
                <button
                    type="button"
                    className={cn(
                        'px-lg py-sm bg-transparent border-none rounded-t-md text-sm font-medium cursor-pointer transition-all duration-fast ease-standard relative',
                        activeTab === 'clients'
                            ? 'text-[var(--color-rose-poudre)] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-rose-poudre)] after:rounded-t-sm after:content-[""]'
                            : 'text-[var(--color-gris-chaud)] hover:text-[var(--color-brun-chocolat)]'
                    )}
                    onClick={() => setActiveTab('clients')}
                >
                    <Building2 size={16} className="mr-2 inline" />
                    Clients ({customers.length})
                </button>
                <button
                    type="button"
                    className={cn(
                        'px-lg py-sm bg-transparent border-none rounded-t-md text-sm font-medium cursor-pointer transition-all duration-fast ease-standard relative',
                        activeTab === 'orders'
                            ? 'text-[var(--color-rose-poudre)] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-rose-poudre)] after:rounded-t-sm after:content-[""]'
                            : 'text-[var(--color-gris-chaud)] hover:text-[var(--color-brun-chocolat)]'
                    )}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} className="mr-2 inline" />
                    Recent Orders
                </button>
            </div>

            {/* Clients Tab */}
            {activeTab === 'clients' && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-md">
                    {loading ? (
                        <div className="flex items-center justify-center p-2xl text-[var(--color-gris-chaud)]">Loading...</div>
                    ) : customers.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-2xl text-center bg-white rounded-lg shadow">
                            <Building2 size={48} className="text-[var(--color-gris-chaud)] opacity-30 mb-md" />
                            <h3 className="text-lg font-semibold text-[var(--color-brun-chocolat)] mb-xs">No B2B clients</h3>
                            <p className="text-[var(--color-gris-chaud)] text-sm mb-lg">Add wholesale clients in the Clients section</p>
                        </div>
                    ) : (
                        customers.map(customer => (
                            <div key={customer.id} className="bg-white rounded-lg shadow p-lg transition-all duration-fast ease-standard hover:shadow-md hover:-translate-y-0.5">
                                <div className="flex items-start justify-between mb-md">
                                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-rose-poudre)] to-[var(--color-rose-hover)] text-white rounded-md flex items-center justify-center font-bold text-lg">
                                        {getInitials(customer.company_name || customer.name)}
                                    </div>
                                    <span className={cn(
                                        'inline-flex px-sm py-xs rounded-xl text-[11px] font-semibold uppercase',
                                        customer.is_active
                                            ? 'bg-success-bg text-success'
                                            : 'bg-[var(--color-urgent-bg)] text-[var(--color-urgent)]'
                                    )}>
                                        {customer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--color-brun-chocolat)] mb-xs">{customer.company_name || customer.name}</h3>
                                <p className="text-sm text-[var(--color-gris-chaud)] mb-md">
                                    {customer.company_name ? customer.name : ''} {customer.phone ? `\u2022 ${customer.phone}` : ''}
                                </p>

                                <div className="flex gap-lg pt-md border-t border-border">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-[var(--color-brun-chocolat)]">{customer.total_visits}</span>
                                        <span className="text-xs text-[var(--color-gris-chaud)]">Orders</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-[var(--color-brun-chocolat)]">
                                            {formatCurrency(customer.total_spent)}
                                        </span>
                                        <span className="text-xs text-[var(--color-gris-chaud)]">Total Revenue</span>
                                    </div>
                                </div>

                                <div className="flex gap-sm mt-md">
                                    <button
                                        type="button"
                                        className="btn-secondary flex-1"
                                        onClick={() => navigate(`/b2b/orders?customer=${customer.id}`)}
                                    >
                                        <Eye size={16} />
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary flex-1"
                                        onClick={() => navigate('/b2b/orders/new')}
                                    >
                                        <Plus size={16} />
                                        Order
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex items-center justify-between p-lg border-b border-border">
                        <h3 className="text-lg font-semibold text-[var(--color-brun-chocolat)]">Recent Orders</h3>
                        <button
                            type="button"
                            className="inline-flex items-center gap-xs bg-transparent border-none text-[var(--color-rose-poudre)] text-sm font-medium cursor-pointer transition-all duration-fast hover:text-[var(--color-rose-hover)]"
                            onClick={() => navigate('/b2b/orders')}
                        >
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center p-2xl text-[var(--color-gris-chaud)]">Loading...</div>
                    ) : recentOrders.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-2xl text-center bg-white rounded-lg shadow">
                            <FileText size={48} className="text-[var(--color-gris-chaud)] opacity-30 mb-md" />
                            <h3 className="text-lg font-semibold text-[var(--color-brun-chocolat)] mb-xs">No B2B Orders</h3>
                            <p className="text-[var(--color-gris-chaud)] text-sm mb-lg">Create your first wholesale order</p>
                            <button type="button" className="btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                                <Plus size={18} />
                                New Order
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Order #</th>
                                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Client</th>
                                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Date</th>
                                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Amount</th>
                                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Status</th>
                                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Payment</th>
                                        <th className="p-md text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border" aria-label="Actions"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr
                                            key={order.id}
                                            onClick={() => navigate(`/b2b/orders/${order.id}`)}
                                            className="cursor-pointer hover:bg-[rgba(186,144,162,0.08)] [&:last-child>td]:border-b-0"
                                        >
                                            <td className="p-md text-sm text-[var(--color-brun-chocolat)] border-b border-border">
                                                <span className="font-mono font-semibold text-[var(--color-rose-poudre)]">
                                                    {order.order_number}
                                                </span>
                                            </td>
                                            <td className="p-md text-sm text-[var(--color-brun-chocolat)] border-b border-border">{order.customer?.company_name || order.customer?.name || '-'}</td>
                                            <td className="p-md text-sm text-[var(--color-brun-chocolat)] border-b border-border">{formatDate(order.order_date)}</td>
                                            <td className="p-md text-sm text-[var(--color-brun-chocolat)] border-b border-border font-semibold">{formatCurrency(order.total_amount)}</td>
                                            <td className="p-md text-sm text-[var(--color-brun-chocolat)] border-b border-border">
                                                <span className={cn(
                                                    'inline-flex px-sm py-xs rounded-xl text-[11px] font-semibold uppercase',
                                                    statusBadgeStyles[order.status] || ''
                                                )}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="p-md text-sm text-[var(--color-brun-chocolat)] border-b border-border">
                                                <span className={cn(
                                                    'inline-flex items-center gap-xs text-sm',
                                                    paymentBadgeStyles[order.payment_status] || ''
                                                )}>
                                                    {order.payment_status === 'paid' ? '\u2713 Paid' : order.payment_status === 'partial' ? '\u25D0 Partial' : '\u25CB Unpaid'}
                                                </span>
                                            </td>
                                            <td className="p-md text-sm text-[var(--color-brun-chocolat)] border-b border-border">
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    title="View details"
                                                    aria-label="View order details"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/b2b/orders/${order.id}`);
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default B2BPage;
