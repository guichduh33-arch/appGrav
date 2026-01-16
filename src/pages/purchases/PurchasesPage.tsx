import { useState } from 'react';
import { Factory, FileText, Plus, Phone, Mail, MapPin, Eye, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import './PurchasesPage.css';

type TabType = 'suppliers' | 'orders';

// Mock suppliers
const MOCK_SUPPLIERS = [
    {
        id: 1,
        name: 'Flour Mill Indonesia',
        category: 'Farines & Ingrédients',
        contact: 'Pak Hendra',
        phone: '+62 812 1234 5678',
        email: 'orders@flourmill.id',
        address: 'Surabaya, East Java',
        icon: '🌾',
        totalOrders: 24,
        lastOrder: '2025-01-10'
    },
    {
        id: 2,
        name: 'Java Coffee Beans',
        category: 'Café',
        contact: 'Ibu Sari',
        phone: '+62 813 9876 5432',
        email: 'supply@javacoffee.id',
        address: 'Malang, East Java',
        icon: '☕',
        totalOrders: 18,
        lastOrder: '2025-01-08'
    },
    {
        id: 3,
        name: 'Lombok Dairy Co.',
        category: 'Produits Laitiers',
        contact: 'Komang Wira',
        phone: '+62 817 5555 1234',
        email: 'info@lombokdairy.com',
        address: 'Mataram, Lombok',
        icon: '🥛',
        totalOrders: 32,
        lastOrder: '2025-01-14'
    },
    {
        id: 4,
        name: 'Tropical Fruits Bali',
        category: 'Fruits Frais',
        contact: 'Made Astawa',
        phone: '+62 811 2222 3333',
        email: 'order@tropicalfruits.id',
        address: 'Denpasar, Bali',
        icon: '🍓',
        totalOrders: 12,
        lastOrder: '2025-01-12'
    },
];

// Mock purchase orders
const MOCK_PO = [
    {
        id: 'PO-2025-0042',
        supplier: 'Lombok Dairy Co.',
        date: '2025-01-14',
        expectedDate: '2025-01-15',
        items: 8,
        total: 2850000,
        status: 'sent'
    },
    {
        id: 'PO-2025-0041',
        supplier: 'Java Coffee Beans',
        date: '2025-01-12',
        expectedDate: '2025-01-14',
        items: 4,
        total: 4500000,
        status: 'received'
    },
    {
        id: 'PO-2025-0040',
        supplier: 'Flour Mill Indonesia',
        date: '2025-01-10',
        expectedDate: '2025-01-12',
        items: 6,
        total: 3200000,
        status: 'received'
    },
    {
        id: 'PO-2025-0039',
        supplier: 'Tropical Fruits Bali',
        date: '2025-01-08',
        expectedDate: '2025-01-09',
        items: 12,
        total: 1800000,
        status: 'partial'
    },
];

const PurchasesPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('suppliers');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Brouillon';
            case 'sent': return 'Envoyée';
            case 'partial': return 'Partielle';
            case 'received': return 'Reçue';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    return (
        <div className="purchases-page">
            <header className="purchases-page__header">
                <h1 className="purchases-page__title">Achats</h1>
                <div className="purchases-page__actions">
                    <button className="btn-primary">
                        <Plus size={18} />
                        Nouveau Bon de Commande
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="purchases-tabs">
                <button
                    className={`purchases-tab ${activeTab === 'suppliers' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    <Factory size={16} />
                    Fournisseurs
                </button>
                <button
                    className={`purchases-tab ${activeTab === 'orders' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <FileText size={16} />
                    Bons de Commande
                </button>
            </div>

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
                <div className="suppliers-grid">
                    {MOCK_SUPPLIERS.map(supplier => (
                        <div key={supplier.id} className="supplier-card">
                            <div className="supplier-card__header">
                                <div className="supplier-card__avatar">
                                    {supplier.icon}
                                </div>
                                <div className="supplier-card__info">
                                    <div className="supplier-card__name">{supplier.name}</div>
                                    <div className="supplier-card__category">{supplier.category}</div>
                                </div>
                            </div>

                            <div className="supplier-card__contact">
                                <div className="supplier-card__contact-item">
                                    <Phone size={14} />
                                    {supplier.phone}
                                </div>
                                <div className="supplier-card__contact-item">
                                    <Mail size={14} />
                                    {supplier.email}
                                </div>
                                <div className="supplier-card__contact-item">
                                    <MapPin size={14} />
                                    {supplier.address}
                                </div>
                            </div>

                            <div className="supplier-card__stats">
                                <div className="supplier-stat">
                                    <span className="supplier-stat__value">{supplier.totalOrders}</span>
                                    <span className="supplier-stat__label">Commandes</span>
                                </div>
                                <div className="supplier-stat">
                                    <span className="supplier-stat__value">{formatDate(supplier.lastOrder)}</span>
                                    <span className="supplier-stat__label">Dernière commande</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Purchase Orders Tab */}
            {activeTab === 'orders' && (
                <div className="po-table-container">
                    <table className="po-table">
                        <thead>
                            <tr>
                                <th>N° PO</th>
                                <th>Fournisseur</th>
                                <th>Date</th>
                                <th>Livraison prévue</th>
                                <th>Articles</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_PO.map(po => (
                                <tr key={po.id}>
                                    <td>
                                        <span className="po-number">{po.id}</span>
                                    </td>
                                    <td>{po.supplier}</td>
                                    <td>{formatDate(po.date)}</td>
                                    <td>{formatDate(po.expectedDate)}</td>
                                    <td>{po.items} produits</td>
                                    <td className="amount-cell">{formatCurrency(po.total)}</td>
                                    <td>
                                        <span className={`po-status ${po.status}`}>
                                            {getStatusLabel(po.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="po-actions">
                                            <button className="btn-icon" title="Voir détail">
                                                <Eye size={16} />
                                            </button>
                                            {po.status === 'sent' && (
                                                <button className="btn-icon" title="Réceptionner">
                                                    <Package size={16} />
                                                </button>
                                            )}
                                        </div>
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

export default PurchasesPage;
