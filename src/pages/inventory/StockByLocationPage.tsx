import { useState } from 'react'
import { MapPin, Search, Package, AlertTriangle } from 'lucide-react'
import {
    useStockLocations,
    useStockBalances,
    type IStockBalance as StockBalance,
} from '@/hooks/inventory/useStockByLocation'
import { useInventoryConfigSettings } from '@/hooks/settings/useModuleConfigSettings'
import { cn } from '@/lib/utils'

export default function StockByLocationPage() {
    const { data: balances = [], isLoading: loading } = useStockBalances()
    const { data: locations = [] } = useStockLocations()
    const invConfig = useInventoryConfigSettings()
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
        <div className="mx-auto max-w-[1600px] p-6">
            <header className="mb-6">
                <div>
                    <h1 className="mb-2 flex items-center gap-4 text-3xl font-bold text-foreground">
                        <MapPin size={28} />
                        Stock by Location
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Real-time view of stock at each location
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-border bg-card py-3 pl-12 pr-4 text-foreground"
                    />
                </div>
                <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="cursor-pointer rounded-lg border border-border bg-card px-4 py-3 text-foreground"
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
                <div className="flex items-center justify-center p-16 text-muted-foreground">Loading...</div>
            ) : Object.keys(groupedByLocation).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-16 text-center">
                    <Package size={64} className="mb-4 text-muted-foreground/60" />
                    <h3 className="mb-2 text-xl font-bold text-foreground">No stock</h3>
                    <p className="text-muted-foreground">No products in stock at any location</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {Object.entries(groupedByLocation).map(([locationId, { location_name, location_code, items }]) => {
                        const totalValue = items.reduce((sum, item) => sum + item.stock_value, 0)
                        const lowStockCount = items.filter(item => item.current_stock < invConfig.stockWarningThreshold).length

                        return (
                            <div key={locationId} className="rounded-lg border border-border bg-card p-5">
                                <div className="mb-4 flex items-start justify-between border-b border-border pb-4">
                                    <div>
                                        <h3 className="mb-1 text-xl font-bold text-foreground">{location_name}</h3>
                                        <span className="text-sm text-muted-foreground">{location_code}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                                            <Package size={16} />
                                            {items.length} products
                                        </div>
                                        {lowStockCount > 0 && (
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                                                <AlertTriangle size={16} />
                                                {lowStockCount} low
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4 text-sm text-muted-foreground">
                                    Total value: <strong className="text-lg text-foreground">IDR {totalValue.toLocaleString()}</strong>
                                </div>

                                <div>
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border-b border-border bg-muted/50 p-2.5 text-left text-xs font-semibold uppercase text-muted-foreground">Product</th>
                                                <th className="border-b border-border bg-muted/50 p-2.5 text-left text-xs font-semibold uppercase text-muted-foreground">Stock</th>
                                                <th className="border-b border-border bg-muted/50 p-2.5 text-left text-xs font-semibold uppercase text-muted-foreground">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr
                                                    key={item.product_id}
                                                    className={cn(
                                                        item.current_stock < invConfig.stockWarningThreshold && 'bg-warning/5'
                                                    )}
                                                >
                                                    <td className="border-b border-border p-2.5 text-sm text-muted-foreground">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium text-foreground">{item.product_name}</span>
                                                            {item.sku && <span className="text-xs text-muted-foreground">{item.sku}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-border p-2.5 text-sm font-semibold">
                                                        {item.current_stock > 0 ? (
                                                            <span className="text-success">
                                                                {item.current_stock} {item.stock_unit}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">0</span>
                                                        )}
                                                    </td>
                                                    <td className="border-b border-border p-2.5 text-sm text-muted-foreground">IDR {item.stock_value.toLocaleString()}</td>
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
