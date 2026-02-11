import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, FileText, Eye, CreditCard, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';
import './B2BPage.css';

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

    return (
        <div className="b2b-page">
            <header className="b2b-page__header">
                <div>
                    <h1 className="b2b-page__title">B2B / Wholesale</h1>
                    <p className="b2b-page__subtitle">Manage your wholesale customers and B2B orders</p>
                </div>
                <div className="b2b-page__actions">
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
            <div className="b2b-stats">
                <div className="b2b-stat-card" onClick={() => navigate('/b2b/orders')} style={{ cursor: 'pointer' }}>
                    <div className="b2b-stat-card__icon clients">
                        <Building2 size={24} />
                    </div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value">{stats.totalClients}</span>
                        <span className="b2b-stat-card__label">B2B Clients</span>
                    </div>
                </div>
                <div className="b2b-stat-card" onClick={() => navigate('/b2b/orders')} style={{ cursor: 'pointer' }}>
                    <div className="b2b-stat-card__icon orders">
                        <FileText size={24} />
                    </div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value">{stats.totalOrders}</span>
                        <span className="b2b-stat-card__label">Orders</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon revenue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value b2b-stat-card__value--sm">
                            {formatCurrency(stats.totalRevenue)}
                        </span>
                        <span className="b2b-stat-card__label">Total Revenue</span>
                    </div>
                </div>
                <div className="b2b-stat-card" onClick={() => navigate('/b2b/payments')} style={{ cursor: 'pointer' }}>
                    <div className="b2b-stat-card__icon pending">
                        <Clock size={24} />
                    </div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value b2b-stat-card__value--sm">
                            {formatCurrency(stats.unpaidAmount)}
                        </span>
                        <span className="b2b-stat-card__label">To Collect</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="b2b-quick-actions">
                <div className="b2b-quick-action" onClick={() => navigate('/b2b/orders')}>
                    <div className="b2b-quick-action__icon">
                        <FileText size={24} />
                    </div>
                    <div className="b2b-quick-action__content">
                        <h3>B2B Orders</h3>
                        <p>Manage all wholesale orders</p>
                    </div>
                    <ArrowRight size={20} />
                </div>
                <div className="b2b-quick-action" onClick={() => navigate('/b2b/payments')}>
                    <div className="b2b-quick-action__icon">
                        <CreditCard size={24} />
                    </div>
                    <div className="b2b-quick-action__content">
                        <h3>Payments</h3>
                        <p>Track collections and outstanding balances</p>
                    </div>
                    <ArrowRight size={20} />
                </div>
                <div className="b2b-quick-action" onClick={() => navigate('/b2b/orders/new')}>
                    <div className="b2b-quick-action__icon">
                        <Plus size={24} />
                    </div>
                    <div className="b2b-quick-action__content">
                        <h3>New Order</h3>
                        <p>Create a B2B order</p>
                    </div>
                    <ArrowRight size={20} />
                </div>
            </div>

            {/* Tabs */}
            <div className="b2b-tabs">
                <button
                    type="button"
                    className={`b2b-tab ${activeTab === 'clients' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('clients')}
                >
                    <Building2 size={16} className="tab-icon" />
                    Clients ({customers.length})
                </button>
                <button
                    type="button"
                    className={`b2b-tab ${activeTab === 'orders' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} className="tab-icon" />
                    Recent Orders
                </button>
            </div>

            {/* Clients Tab */}
            {activeTab === 'clients' && (
                <div className="clients-grid">
                    {loading ? (
                        <div className="b2b-loading">Loading...</div>
                    ) : customers.length === 0 ? (
                        <div className="b2b-empty">
                            <Building2 size={48} />
                            <h3>No B2B clients</h3>
                            <p>Add wholesale clients in the Clients section</p>
                        </div>
                    ) : (
                        customers.map(customer => (
                            <div key={customer.id} className="client-card">
                                <div className="client-card__header">
                                    <div className="client-card__avatar">
                                        {getInitials(customer.company_name || customer.name)}
                                    </div>
                                    <span className={`client-card__status ${customer.is_active ? 'active' : 'inactive'}`}>
                                        {customer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3 className="client-card__name">{customer.company_name || customer.name}</h3>
                                <p className="client-card__type">
                                    {customer.company_name ? customer.name : ''} {customer.phone ? `• ${customer.phone}` : ''}
                                </p>

                                <div className="client-card__stats">
                                    <div className="client-stat">
                                        <span className="client-stat__value">{customer.total_visits}</span>
                                        <span className="client-stat__label">Orders</span>
                                    </div>
                                    <div className="client-stat">
                                        <span className="client-stat__value client-stat__value--sm">
                                            {formatCurrency(customer.total_spent)}
                                        </span>
                                        <span className="client-stat__label">Total Revenue</span>
                                    </div>
                                </div>

                                <div className="client-card__actions">
                                    <button
                                        type="button"
                                        className="btn-secondary client-card__btn"
                                        onClick={() => navigate(`/b2b/orders?customer=${customer.id}`)}
                                    >
                                        <Eye size={16} />
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary client-card__btn"
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
                <div className="b2b-orders-section">
                    <div className="b2b-orders-header">
                        <h3>Recent Orders</h3>
                        <button type="button" className="btn-link" onClick={() => navigate('/b2b/orders')}>
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    {loading ? (
                        <div className="b2b-loading">Loading...</div>
                    ) : recentOrders.length === 0 ? (
                        <div className="b2b-empty">
                            <FileText size={48} />
                            <h3>No B2B Orders</h3>
                            <p>Create your first wholesale order</p>
                            <button type="button" className="btn-primary" onClick={() => navigate('/b2b/orders/new')}>
                                <Plus size={18} />
                                New Order
                            </button>
                        </div>
                    ) : (
                        <div className="b2b-orders-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Client</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th aria-label="Actions"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id} onClick={() => navigate(`/b2b/orders/${order.id}`)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <span className="order-id-value">
                                                    {order.order_number}
                                                </span>
                                            </td>
                                            <td>{order.customer?.company_name || order.customer?.name || '-'}</td>
                                            <td>{formatDate(order.order_date)}</td>
                                            <td className="amount-cell">{formatCurrency(order.total_amount)}</td>
                                            <td>
                                                <span className={`order-status-badge ${order.status}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`payment-badge ${order.payment_status}`}>
                                                    {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status === 'partial' ? '◐ Partial' : '○ Unpaid'}
                                                </span>
                                            </td>
                                            <td>
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
