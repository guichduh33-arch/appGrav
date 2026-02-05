import { useState, useEffect } from 'react'
import { MapPin, Search, Package, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import './StockByLocationPage.css'

interface StockBalance {
    product_id: string
    product_name: string
    sku: string
    location_id: string
    location_name: string
    location_code: string
    location_type: string
    current_stock: number
    stock_unit: string
    stock_value: number
}

interface Location {
    id: string
    name: string
    code: string
    location_type: string
}

export default function StockByLocationPage() {
    const [balances, setBalances] = useState<StockBalance[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

    useEffect(() => {
        fetchLocations()
        fetchBalances()
    }, [])

    const fetchLocations = async () => {
        const { data } = await supabase
            .from('stock_locations')
            .select('*')
            .neq('is_active', false)
            .order('name')
        if (data) setLocations(data)
    }

    const fetchBalances = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('stock_balances')
                .select('*')
                .order('location_name')
                .order('product_name')

            if (error) throw error
            setBalances((data ?? []) as unknown as StockBalance[])
        } catch (error) {
            console.error('Error fetching balances:', error)
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }

    const filteredBalances = balances.filter(b => {
        const matchesSearch = searchTerm === '' ||
            b.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLocation = selectedLocation === 'all' || b.location_id === selectedLocation
        return matchesSearch && matchesLocation
    })

    const groupedByLocation = filteredBalances.reduce((acc, balance) => {
        if (!acc[balance.location_id]) {
            acc[balance.location_id] = {
                location_name: balance.location_name,
                location_code: balance.location_code,
                items: []
            }
        }
        acc[balance.location_id].items.push(balance)
        return acc
    }, {} as Record<string, { location_name: string; location_code: string; items: StockBalance[] }>)

    return (
        <div className="stock-by-location-page">
            <header className="stock-location-header">
                <div>
                    <h1 className="stock-location-title">
                        <MapPin size={28} />
                        Stock par Emplacement
                    </h1>
                    <p className="stock-location-subtitle">
                        Vue en temps réel du stock de chaque emplacement
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="stock-location-filters">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="location-select"
                    aria-label="Filtrer par emplacement"
                >
                    <option value="all">Tous les emplacements</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>
            </div>

            {/* Stock by Location */}
            {loading ? (
                <div className="stock-location-loading">Chargement...</div>
            ) : Object.keys(groupedByLocation).length === 0 ? (
                <div className="stock-location-empty">
                    <Package size={64} />
                    <h3>Aucun stock</h3>
                    <p>Aucun produit en stock dans les emplacements</p>
                </div>
            ) : (
                <div className="locations-grid">
                    {Object.entries(groupedByLocation).map(([locationId, { location_name, location_code, items }]) => {
                        const totalValue = items.reduce((sum, item) => sum + item.stock_value, 0)
                        const lowStockCount = items.filter(item => item.current_stock < 10).length

                        return (
                            <div key={locationId} className="location-card">
                                <div className="location-card__header">
                                    <div>
                                        <h3>{location_name}</h3>
                                        <span className="location-code">{location_code}</span>
                                    </div>
                                    <div className="location-stats">
                                        <div className="stat-badge">
                                            <Package size={16} />
                                            {items.length} produits
                                        </div>
                                        {lowStockCount > 0 && (
                                            <div className="stat-badge warning">
                                                <AlertTriangle size={16} />
                                                {lowStockCount} faibles
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="location-card__value">
                                    Valeur totale: <strong>€{totalValue.toFixed(2)}</strong>
                                </div>

                                <div className="location-card__items">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Produit</th>
                                                <th>Stock</th>
                                                <th>Valeur</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr key={item.product_id} className={item.current_stock < 10 ? 'low-stock' : ''}>
                                                    <td>
                                                        <div className="product-cell">
                                                            <span className="product-name">{item.product_name}</span>
                                                            {item.sku && <span className="product-sku">{item.sku}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="stock-cell">
                                                        {item.current_stock > 0 ? (
                                                            <span className="stock-positive">
                                                                {item.current_stock} {item.stock_unit}
                                                            </span>
                                                        ) : (
                                                            <span className="stock-zero">0</span>
                                                        )}
                                                    </td>
                                                    <td>€{item.stock_value.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
