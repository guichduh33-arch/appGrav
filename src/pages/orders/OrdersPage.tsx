import { useState, useMemo } from 'react';
import { FileText, Search, Download, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import './OrdersPage.css';

// Mock order data - in production this would come from Supabase
const MOCK_ORDERS = [
    {
        id: '0042',
        created_at: '2025-01-15T10:30:00',
        type: 'dine-in',
        table: 'T5',
        items: [
            { name: 'Cappuccino', qty: 2, modifiers: 'Glacé, Oat Milk' },
            { name: 'Croissant', qty: 1 }
        ],
        total: 98000,
        status: 'completed',
        payment_status: 'paid',
        payment_method: 'cash'
    },
    {
        id: '0041',
        created_at: '2025-01-15T10:15:00',
        type: 'takeaway',
        items: [
            { name: 'Latte', qty: 1, modifiers: 'Hot, Normal Milk' },
            { name: 'Pain au Chocolat', qty: 2 }
        ],
        total: 85000,
        status: 'ready',
        payment_status: 'paid',
        payment_method: 'card'
    },
    {
        id: '0040',
        created_at: '2025-01-15T09:45:00',
        type: 'dine-in',
        table: 'T2',
        items: [
            { name: 'Americano', qty: 2 },
            { name: 'Bagel Saumon', qty: 1 }
        ],
        total: 145000,
        status: 'preparing',
        payment_status: 'unpaid'
    },
    {
        id: '0039',
        created_at: '2025-01-15T09:30:00',
        type: 'delivery',
        items: [
            { name: 'Flat White', qty: 1 },
            { name: 'Croissant', qty: 2 },
            { name: 'Pain aux Raisins', qty: 1 }
        ],
        total: 120000,
        status: 'new',
        payment_status: 'paid',
        payment_method: 'online'
    },
    {
        id: '0038',
        created_at: '2025-01-15T09:00:00',
        type: 'takeaway',
        items: [
            { name: 'Espresso Double', qty: 1 }
        ],
        total: 35000,
        status: 'completed',
        payment_status: 'paid',
        payment_method: 'cash'
    },
];

type OrderStatus = 'all' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type OrderType = 'all' | 'dine-in' | 'takeaway' | 'delivery';

const OrdersPage = () => {
    const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
    const [typeFilter, setTypeFilter] = useState<OrderType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredOrders = useMemo(() => {
        return MOCK_ORDERS.filter(order => {
            if (statusFilter !== 'all' && order.status !== statusFilter) return false;
            if (typeFilter !== 'all' && order.type !== typeFilter) return false;
            if (searchQuery && !order.id.includes(searchQuery)) return false;
            return true;
        });
    }, [statusFilter, typeFilter, searchQuery]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const getOrderTypeLabel = (type: string) => {
        switch (type) {
            case 'dine-in': return '🍽️ Sur place';
            case 'takeaway': return '📦 À emporter';
            case 'delivery': return '🚗 Livraison';
            default: return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new': return 'Nouveau';
            case 'preparing': return 'En prépa.';
            case 'ready': return 'Prêt';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    return (
        <div className="orders-page">
            <header className="orders-page__header">
                <h1 className="orders-page__title">Historique Commandes</h1>
                <div className="orders-page__actions">
                    <button className="btn-secondary">
                        <Download size={18} />
                        Exporter
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="orders-filters">
                <div className="filter-group">
                    <label className="filter-group__label">Rechercher</label>
                    <div className="filter-group__search-wrapper">
                        <input
                            type="text"
                            className="filter-group__input filter-group__input--with-icon"
                            placeholder="N° commande..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={16} className="filter-group__input-icon" />
                    </div>
                </div>

                <div className="filter-group">
                    <label className="filter-group__label" htmlFor="date-from">Date début</label>
                    <input
                        id="date-from"
                        type="date"
                        className="filter-group__input"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-group__label" htmlFor="date-to">Date fin</label>
                    <input
                        id="date-to"
                        type="date"
                        className="filter-group__input"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-group__label" htmlFor="order-type">Type</label>
                    <select
                        id="order-type"
                        className="filter-group__input"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as OrderType)}
                        aria-label="Type de commande"
                    >
                        <option value="all">Tous</option>
                        <option value="dine-in">Sur place</option>
                        <option value="takeaway">À emporter</option>
                        <option value="delivery">Livraison</option>
                    </select>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="status-filters status-filters--mb">
                {(['all', 'new', 'preparing', 'ready', 'completed'] as OrderStatus[]).map(status => (
                    <button
                        key={status}
                        className={`status-pill ${statusFilter === status ? 'is-active' : ''}`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status === 'all' ? 'Tous' : getStatusLabel(status)}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                {filteredOrders.length > 0 ? (
                    <>
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Heure</th>
                                    <th>Type</th>
                                    <th>Articles</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Paiement</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <span className="order-number">#{order.id}</span>
                                        </td>
                                        <td>
                                            <div>{formatTime(order.created_at)}</div>
                                            <div className="order-date-sub">
                                                {formatDate(order.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`order-type-badge ${order.type}`}>
                                                {getOrderTypeLabel(order.type)}
                                                {order.table && ` - ${order.table}`}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="order-items-count">
                                                {order.items.reduce((sum, item) => sum + item.qty, 0)} articles
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
                                            <span className={`payment-status ${order.payment_status}`}>
                                                {order.payment_status === 'paid' ? (
                                                    <><Check size={14} /> Payé</>
                                                ) : (
                                                    <><Clock size={14} /> Impayé</>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-view-order">
                                                <FileText size={14} /> Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="orders-pagination">
                            <div className="pagination-info">
                                Affichage 1-{filteredOrders.length} sur {filteredOrders.length} commandes
                            </div>
                            <div className="pagination-buttons">
                                <button className="pagination-btn" disabled title="Page précédente" aria-label="Page précédente">
                                    <ChevronLeft size={18} />
                                </button>
                                <button className="pagination-btn is-active">1</button>
                                <button className="pagination-btn" disabled title="Page suivante" aria-label="Page suivante">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="orders-empty">
                        <div className="orders-empty__icon">📋</div>
                        <div className="orders-empty__text">Aucune commande trouvée</div>
                        <div className="orders-empty__subtext">Modifiez vos filtres pour voir plus de résultats</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
