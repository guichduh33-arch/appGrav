import { useState } from 'react';
import { Building2, Plus, FileText, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import './B2BPage.css';

type TabType = 'clients' | 'orders';

// Mock B2B clients
const MOCK_CLIENTS = [
    {
        id: 1,
        name: 'Hotel Katamaran',
        type: 'Hôtel',
        contact: 'Komang Agus',
        phone: '+62 812 3456 7890',
        email: 'procurement@katamaran.id',
        address: 'Kuta, Lombok',
        status: 'active',
        totalOrders: 48,
        totalRevenue: 28500000,
        lastOrder: '2025-01-14'
    },
    {
        id: 2,
        name: 'Warung Sunset',
        type: 'Restaurant',
        contact: 'Made Putra',
        phone: '+62 811 2345 6789',
        email: 'order@warungsunset.com',
        address: 'Senggigi, Lombok',
        status: 'active',
        totalOrders: 32,
        totalRevenue: 15200000,
        lastOrder: '2025-01-12'
    },
    {
        id: 3,
        name: 'Villa Harmony',
        type: 'Villa',
        contact: 'Sarah Wong',
        phone: '+62 817 8901 2345',
        email: 'concierge@villaharmony.com',
        address: 'Gili Air',
        status: 'active',
        totalOrders: 24,
        totalRevenue: 12800000,
        lastOrder: '2025-01-10'
    },
    {
        id: 4,
        name: 'Café Tropicana',
        type: 'Café',
        contact: 'Wayan Adi',
        phone: '+62 813 4567 8901',
        email: 'manager@tropicana.id',
        address: 'Mataram',
        status: 'inactive',
        totalOrders: 8,
        totalRevenue: 3200000,
        lastOrder: '2024-12-15'
    },
];

// Mock B2B orders
const MOCK_ORDERS = [
    {
        id: 'B2B-0024',
        client: 'Hotel Katamaran',
        date: '2025-01-14',
        deliveryDate: '2025-01-15',
        items: 12,
        total: 1850000,
        status: 'confirmed',
        paymentStatus: 'paid'
    },
    {
        id: 'B2B-0023',
        client: 'Warung Sunset',
        date: '2025-01-12',
        deliveryDate: '2025-01-13',
        items: 8,
        total: 920000,
        status: 'delivered',
        paymentStatus: 'paid'
    },
    {
        id: 'B2B-0022',
        client: 'Villa Harmony',
        date: '2025-01-10',
        deliveryDate: '2025-01-11',
        items: 6,
        total: 680000,
        status: 'delivered',
        paymentStatus: 'unpaid'
    },
    {
        id: 'B2B-0021',
        client: 'Hotel Katamaran',
        date: '2025-01-08',
        deliveryDate: '2025-01-09',
        items: 15,
        total: 2150000,
        status: 'delivered',
        paymentStatus: 'paid'
    },
];

const B2BPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('clients');

    const activeClients = MOCK_CLIENTS.filter(c => c.status === 'active').length;
    const totalRevenue = MOCK_CLIENTS.reduce((sum, c) => sum + c.totalRevenue, 0);
    const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'confirmed').length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'confirmed': return 'Confirmée';
            case 'delivered': return 'Livrée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    return (
        <div className="b2b-page">
            <header className="b2b-page__header">
                <h1 className="b2b-page__title">B2B / Wholesale</h1>
                <div className="b2b-page__actions">
                    <button className="btn-primary">
                        <Plus size={18} />
                        Nouveau Client
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="b2b-stats">
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon clients">🏢</div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value">{MOCK_CLIENTS.length}</span>
                        <span className="b2b-stat-card__label">Clients B2B</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon orders">📦</div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value">{activeClients}</span>
                        <span className="b2b-stat-card__label">Clients Actifs</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon revenue">💰</div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value b2b-stat-card__value--sm">
                            {formatCurrency(totalRevenue)}
                        </span>
                        <span className="b2b-stat-card__label">CA Total</span>
                    </div>
                </div>
                <div className="b2b-stat-card">
                    <div className="b2b-stat-card__icon pending">⏳</div>
                    <div className="b2b-stat-card__info">
                        <span className="b2b-stat-card__value">{pendingOrders}</span>
                        <span className="b2b-stat-card__label">Commandes en cours</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="b2b-tabs">
                <button
                    className={`b2b-tab ${activeTab === 'clients' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('clients')}
                >
                    <Building2 size={16} className="tab-icon" />
                    Clients
                </button>
                <button
                    className={`b2b-tab ${activeTab === 'orders' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} className="tab-icon" />
                    Commandes
                </button>
            </div>

            {/* Clients Tab */}
            {activeTab === 'clients' && (
                <div className="clients-grid">
                    {MOCK_CLIENTS.map(client => (
                        <div key={client.id} className="client-card">
                            <div className="client-card__header">
                                <div className="client-card__avatar">
                                    {getInitials(client.name)}
                                </div>
                                <span className={`client-card__status ${client.status}`}>
                                    {client.status === 'active' ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                            <h3 className="client-card__name">{client.name}</h3>
                            <p className="client-card__type">{client.type} • {client.contact}</p>

                            <div className="client-card__stats">
                                <div className="client-stat">
                                    <span className="client-stat__value">{client.totalOrders}</span>
                                    <span className="client-stat__label">Commandes</span>
                                </div>
                                <div className="client-stat">
                                    <span className="client-stat__value client-stat__value--sm">
                                        {formatCurrency(client.totalRevenue)}
                                    </span>
                                    <span className="client-stat__label">CA Total</span>
                                </div>
                            </div>

                            <div className="client-card__actions">
                                <button className="btn-secondary client-card__btn">
                                    <Eye size={16} />
                                    Voir
                                </button>
                                <button className="btn-primary client-card__btn">
                                    <Plus size={16} />
                                    Commander
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="b2b-orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>N° Commande</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Livraison</th>
                                <th>Articles</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Paiement</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_ORDERS.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <span className="order-id-value">
                                            {order.id}
                                        </span>
                                    </td>
                                    <td>{order.client}</td>
                                    <td>{formatDate(order.date)}</td>
                                    <td>{formatDate(order.deliveryDate)}</td>
                                    <td>{order.items} produits</td>
                                    <td className="amount-cell">{formatCurrency(order.total)}</td>
                                    <td>
                                        <span className={`order-status-badge ${order.status}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`payment-badge ${order.paymentStatus}`}>
                                            {order.paymentStatus === 'paid' ? '✓ Payé' : '○ Impayé'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-secondary" title="Voir détail" aria-label="Voir détail de la commande">
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
    );
};

export default B2BPage;
