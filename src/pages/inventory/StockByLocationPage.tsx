import { useState } from 'react'
import { MapPin, Search, Package, AlertTriangle } from 'lucide-react'
import {
    useStockLocations,
    useStockBalances,
    type IStockBalance as StockBalance,
} from '@/hooks/inventory/useStockByLocation'
import './StockByLocationPage.css'

export default function StockByLocationPage() {
    const { data: balances = [], isLoading: loading } = useStockBalances()
    const { data: locations = [] } = useStockLocations()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

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
                        Stock by Location
                    </h1>
                    <p className="stock-location-subtitle">
                        Real-time view of stock at each location
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="stock-location-filters">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search for a product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="location-select"
                    aria-label="Filter by location"
                >
                    <option value="all">All locations</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>
            </div>

            {/* Stock by Location */}
            {loading ? (
                <div className="stock-location-loading">Loading...</div>
            ) : Object.keys(groupedByLocation).length === 0 ? (
                <div className="stock-location-empty">
                    <Package size={64} />
                    <h3>No stock</h3>
                    <p>No products in stock at any location</p>
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
                                            {items.length} products
                                        </div>
                                        {lowStockCount > 0 && (
                                            <div className="stat-badge warning">
                                                <AlertTriangle size={16} />
                                                {lowStockCount} low
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="location-card__value">
                                    Total value: <strong>IDR {totalValue.toLocaleString()}</strong>
                                </div>

                                <div className="location-card__items">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Stock</th>
                                                <th>Value</th>
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
                                                    <td>IDR {item.stock_value.toLocaleString()}</td>
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
