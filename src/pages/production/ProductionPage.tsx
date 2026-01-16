import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Minus, Trash2, Save, Factory, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// Mock products for production
const AVAILABLE_PRODUCTS = [
    { id: 1, name: 'Croissant', category: 'Viennoiseries', icon: '🥐' },
    { id: 2, name: 'Pain au Chocolat', category: 'Viennoiseries', icon: '🍫' },
    { id: 3, name: 'Baguette Tradition', category: 'Pains', icon: '🥖' },
    { id: 4, name: 'Pain de Campagne', category: 'Pains', icon: '🍞' },
    { id: 5, name: 'Tarte aux Fruits', category: 'Pâtisseries', icon: '🥧' },
    { id: 6, name: 'Éclair Chocolat', category: 'Pâtisseries', icon: '🍫' },
    { id: 7, name: 'Bagel Nature', category: 'Bagels', icon: '🥯' },
];

interface ProductionItem {
    productId: number;
    name: string;
    category: string;
    icon: string;
    quantity: number;
    wasted: number;
    wasteReason: string;
}

const ProductionPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [productionItems, setProductionItems] = useState<ProductionItem[]>([
        { productId: 1, name: 'Croissant', category: 'Viennoiseries', icon: '🥐', quantity: 24, wasted: 0, wasteReason: '' },
        { productId: 2, name: 'Pain au Chocolat', category: 'Viennoiseries', icon: '🍫', quantity: 18, wasted: 2, wasteReason: 'Trop cuit' },
        { productId: 3, name: 'Baguette Tradition', category: 'Pains', icon: '🥖', quantity: 12, wasted: 0, wasteReason: '' },
    ]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const navigateDate = (direction: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + direction);
        setSelectedDate(newDate);
    };

    const addProduct = (product: typeof AVAILABLE_PRODUCTS[0]) => {
        const existing = productionItems.find(item => item.productId === product.id);
        if (existing) {
            updateValues(product.id, 'quantity', 1);
        } else {
            setProductionItems([...productionItems, {
                productId: product.id,
                name: product.name,
                category: product.category,
                icon: product.icon,
                quantity: 1,
                wasted: 0,
                wasteReason: ''
            }]);
        }
        setSearchQuery('');
    };

    const updateValues = (productId: number, field: 'quantity' | 'wasted', delta: number) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, [field]: Math.max(0, item[field] + delta) }
                    : item
            )
        );
    };

    const updateReason = (productId: number, reason: string) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, wasteReason: reason }
                    : item
            )
        );
    };

    const removeItem = (productId: number) => {
        setProductionItems(items => items.filter(item => item.productId !== productId));
    };

    const filteredProducts = searchQuery
        ? AVAILABLE_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !productionItems.find(item => item.productId === p.id)
        )
        : [];

    const totalItems = productionItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalWaste = productionItems.reduce((sum, item) => sum + item.wasted, 0);

    // Mock history data
    const todayHistory = [
        { product: 'Croissant', qty: '+24', time: '06:30' },
        { product: 'Pain au Chocolat', qty: '+18', time: '06:35' },
        { product: 'Baguette', qty: '+12', time: '07:00' },
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 min-h-screen">
            {/* Header with Date Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Factory className="text-blue-600" size={32} />
                        Production
                    </h1>
                    <p className="text-gray-500 mt-1">Planifiez et enregistrez la production du jour.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                    <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)}>
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-2 px-4 min-w-[240px] justify-center font-medium text-gray-700">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="capitalize">{formatDate(selectedDate)}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigateDate(1)}>
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content - Product Entry */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Saisie de production</h2>
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    placeholder="Rechercher un produit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {/* Search Results Dropdown */}
                                {filteredProducts.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                                        {filteredProducts.map(product => (
                                            <button
                                                key={product.id}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors"
                                                onClick={() => addProduct(product)}
                                            >
                                                <span className="text-2xl">{product.icon}</span>
                                                <div>
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.category}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {productionItems.length > 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">Produit</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Production</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Pertes</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Raison</th>
                                            <th className="w-[5%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productionItems.map(item => (
                                            <tr key={item.productId} className="group hover:bg-gray-50/50 transition-colors">
                                                {/* Product Info */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-lg">
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.category}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Production Quantity */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            aria-label="Decrease production quantity"
                                                            onClick={() => updateValues(item.productId, 'quantity', -1)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className="w-12 text-center font-bold text-gray-900 text-lg tabular-nums">
                                                            {item.quantity}
                                                        </div>
                                                        <button
                                                            aria-label="Increase production quantity"
                                                            onClick={() => updateValues(item.productId, 'quantity', 1)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Waste Quantity */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            aria-label="Decrease waste quantity"
                                                            onClick={() => updateValues(item.productId, 'wasted', -1)}
                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className={`w-12 text-center font-bold text-lg tabular-nums ${item.wasted > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                                                            {item.wasted}
                                                        </div>
                                                        <button
                                                            aria-label="Increase waste quantity"
                                                            onClick={() => updateValues(item.productId, 'wasted', 1)}
                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Waste Reason */}
                                                <td className="py-4 px-4">
                                                    {item.wasted > 0 ? (
                                                        <input
                                                            type="text"
                                                            placeholder="Note..."
                                                            value={item.wasteReason}
                                                            onChange={(e) => updateReason(item.productId, e.target.value)}
                                                            className="w-full text-sm px-3 py-1.5 bg-white border border-red-200 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div className="h-8"></div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-4 text-right">
                                                    <button
                                                        onClick={() => removeItem(item.productId)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Aucun produit sélectionné</h3>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                    Utilisez la barre de recherche ci-dessus pour ajouter des produits à la liste de production.
                                </p>
                            </div>
                        )}

                        {productionItems.length > 0 && (
                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <Button variant="ghost" className="text-gray-500">Annuler</Button>
                                <Button className="pl-4 pr-6">
                                    <Save size={18} className="mr-2" />
                                    Enregistrer la production
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar - Summary & History */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-600" />
                            Résumé du Jour
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 text-sm">Produits différents</span>
                                <span className="font-bold text-gray-900">{productionItems.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-blue-700 text-sm font-medium">Total produits</span>
                                <span className="font-bold text-blue-700 text-xl">{totalItems}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-red-700 text-sm font-medium">Pertes déclarées</span>
                                <span className="font-bold text-red-700 text-xl">{totalWaste}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Historique récent</h3>
                            <button className="text-xs text-blue-600 font-medium hover:underline">Voir tout</button>
                        </div>

                        <div className="space-y-4">
                            {todayHistory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between group">
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{item.product}</div>
                                        <div className="text-xs text-gray-400">{item.time}</div>
                                    </div>
                                    <Badge variant="success" className="font-mono">{item.qty}</Badge>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                <AlertCircle size={12} />
                                Synchronisé automatiquement
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProductionPage;
