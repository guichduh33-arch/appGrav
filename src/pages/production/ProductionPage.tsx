import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Minus, Trash2, Save, Factory, TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { Product, ProductionRecord } from '../../types/database';
import toast from 'react-hot-toast';

interface ProductionItem {
    productId: string;
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
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState<ProductionRecord[]>([]);
    const [debugInfo, setDebugInfo] = useState<string>('');

    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Derive unique categories
    const categories = ['All', ...Array.from(new Set(availableProducts.map(p => (p as any).category?.name).filter(Boolean)))];

    // Filter available products
    const filteredProducts = availableProducts.filter(p => {
        const matchesSearch = searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (p as any).category?.name === selectedCategory;
        const notAdded = !productionItems.find(item => item.productId === p.id);

        // Show dropdown only if searching OR if a category is selected (to browse)
        // If searchQuery is empty but category is selected, we want to see products in that category

        return matchesSearch && matchesCategory && notAdded;
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || filteredProducts.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredProducts.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
                break;
            case 'Enter':
                e.preventDefault();
                addProduct(filteredProducts[selectedIndex] as any);
                setShowDropdown(false);
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchHistory();
    }, [selectedDate]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`*, category:categories(*)`)
                .order('name');

            if (error) {
                setDebugInfo(`Error: ${error.message}`);
                throw error;
            }
            setAvailableProducts((data as any) || []);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            setDebugInfo(`Error catch: ${error.message || error}`);
            toast.error('Erreur lors du chargement des produits');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            // Format date for DB query YYYY-MM-DD
            const dateStr = selectedDate.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('production_records')
                .select(`
                    *,
                    product:products(name)
                `)
                .eq('production_date', dateStr)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

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

    const addProduct = (product: Product & { category: any }) => {
        const existing = productionItems.find(item => item.productId === product.id);
        if (existing) {
            updateValues(product.id, 'quantity', 1);
        } else {
            setProductionItems([...productionItems, {
                productId: product.id,
                name: product.name,
                category: product.category?.name || 'Général',
                icon: product.category?.icon || '📦',
                quantity: 1,
                wasted: 0,
                wasteReason: ''
            }]);
        }
        setSearchQuery('');
    };

    const updateValues = (productId: string, field: 'quantity' | 'wasted', delta: number) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, [field]: Math.max(0, item[field] + delta) }
                    : item
            )
        );
    };

    const updateReason = (productId: string, reason: string) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, wasteReason: reason }
                    : item
            )
        );
    };

    const removeItem = (productId: string) => {
        setProductionItems(items => items.filter(item => item.productId !== productId));
    };

    const handleSave = async () => {
        if (productionItems.length === 0) return;
        setIsSaving(true);
        const toastId = toast.loading('Enregistrement...');

        try {
            const dateStr = selectedDate.toISOString().split('T')[0];

            // 1. Create production records
            for (const item of productionItems) {
                // Insert record
                const { data: record, error: insertError } = await supabase
                    .from('production_records')
                    .insert({
                        product_id: item.productId,
                        quantity_produced: item.quantity,
                        quantity_waste: item.wasted,
                        production_date: dateStr,
                        notes: item.wasteReason ? `Déchet: ${item.wasteReason}` : null,
                        stock_updated: false
                    } as any)
                    .select()
                    .single();

                if (insertError) throw insertError;

                // 2. Process stock movements via RPC
                if (record) {
                    const { error: rpcError } = await supabase.rpc('process_production', {
                        production_uuid: (record as any).id
                    } as any);

                    if (rpcError) throw rpcError;
                }
            }

            toast.success('Production enregistrée avec succès', { id: toastId });
            setProductionItems([]);
            fetchHistory(); // Refresh sidebar
        } catch (error) {
            console.error('Error saving production:', error);
            toast.error('Erreur lors de l\'enregistrement', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };



    const totalItems = productionItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalWaste = productionItems.reduce((sum, item) => sum + item.wasted, 0);

    // Summary from history
    const historyTotal = history.reduce((sum, item) => sum + item.quantity_produced, 0);
    const historyWaste = history.reduce((sum, item) => sum + (item.quantity_waste || 0), 0);

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
                    {/* DEBUG PANEL */}
                    <div className="text-xs font-mono bg-yellow-100 p-2 mt-2 rounded border border-yellow-300 text-yellow-800">
                        DEBUG: {debugInfo}
                    </div>
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
                        <div className="flex flex-col gap-6 mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Saisie de production</h2>
                                <p className="text-gray-500 text-sm">Ajoutez des produits à la liste de production.</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Search Bar - Full Width / Large */}
                                <div className="relative w-full" ref={searchContainerRef}>
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                    <input
                                        type="text"
                                        className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-lg shadow-sm"
                                        placeholder="Rechercher un produit..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setShowDropdown(true)}
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoading}
                                    />

                                    {/* Category Filter Pills (Inside search area context or just below) */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                                    ? 'bg-gray-900 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {cat === 'All' ? 'Tous' : cat}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {showDropdown && filteredProducts.length > 0 && (
                                        <div className="absolute top-[calc(100%+8px)] left-0 mt-2 w-full bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[500px] overflow-y-auto ring-1 ring-black/5">
                                            <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {filteredProducts.map((product: any, index: number) => (
                                                    <button
                                                        key={product.id}
                                                        className={`flex items-center gap-4 p-3 rounded-xl text-left transition-all duration-200 ${index === selectedIndex
                                                            ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-200 shadow-sm'
                                                            : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                        onClick={() => {
                                                            addProduct(product);
                                                            // Keep dropdown open if just selecting with mouse? Maybe close for efficiency.
                                                            // Actually better to close to see the table.
                                                            setShowDropdown(false);
                                                        }}
                                                    >
                                                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl shadow-sm ${index === selectedIndex ? 'bg-white' : 'bg-gray-100'
                                                            }`}>
                                                            {product.category?.icon || '📦'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold truncate">{product.name}</div>
                                                            <div className="flex items-center gap-2 text-xs opacity-70">
                                                                <span className="truncate max-w-[100px] inline-block bg-gray-200/50 px-1.5 py-0.5 rounded">{product.category?.name}</span>
                                                                {product.current_stock !== undefined && (
                                                                    <span className={product.current_stock < 0 ? 'text-red-500 font-medium' : ''}>
                                                                        Stock: {product.current_stock}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {index === selectedIndex && (
                                                            <div className="hidden sm:block text-xs font-bold text-blue-600 px-2 py-1 bg-blue-100/50 rounded-lg">
                                                                ↵
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            {filteredProducts.length === 0 && (
                                                <div className="p-8 text-center text-gray-500">Aucun résultat trouvé</div>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                {isLoading ? (
                                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-500 animate-spin">
                                        <Loader2 size={32} />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Search size={32} />
                                    </div>
                                )}
                                <h3 className="text-lg font-medium text-gray-900">
                                    {isLoading ? 'Chargement...' : 'Aucun produit sélectionné'}
                                </h3>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                    {isLoading
                                        ? 'Veuillez patienter pendant le chargement des produits...'
                                        : 'Utilisez la barre de recherche ci-dessus pour ajouter des produits à la liste de production.'
                                    }
                                </p>
                            </div>
                        )}

                        {productionItems.length > 0 && (
                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <Button variant="ghost" className="text-gray-500" onClick={() => setProductionItems([])} disabled={isSaving}>Annuler</Button>
                                <Button className="pl-4 pr-6" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
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
                                <span className="text-gray-600 text-sm">Entrées Production</span>
                                <span className="font-bold text-gray-900">{history.length + productionItems.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-blue-700 text-sm font-medium">Total produits</span>
                                <span className="font-bold text-blue-700 text-xl">{historyTotal + totalItems}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-red-700 text-sm font-medium">Pertes déclarées</span>
                                <span className="font-bold text-red-700 text-xl">{historyWaste + totalWaste}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Historique récent ({history.length})</h3>
                            {history.length > 0 && (
                                <button className="text-xs text-blue-600 font-medium hover:underline">Voir tout</button>
                            )}
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.length > 0 ? (
                                history.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between group border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{(record as any).product?.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(record.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="success" className="font-mono mb-1 block">+{record.quantity_produced}</Badge>
                                            {record.quantity_waste > 0 && (
                                                <Badge variant="danger" className="font-mono text-[10px] py-0">-{record.quantity_waste}</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Aucune production enregistrée pour ce jour.
                                </div>
                            )}
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
