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
        <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
            <header className="mb-8">
                <div>
                    <h1 className="mb-1 flex items-center gap-3 text-2xl font-bold text-white">
                        <MapPin size={24} className="text-[var(--color-gold)]" />
                        Stock by Location
                    </h1>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                        Real-time view of stock at each location
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="mb-6 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search for a product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                    />
                </div>
                <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="cursor-pointer rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
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
                <div className="flex items-center justify-center p-16 text-sm text-[var(--theme-text-muted)]">Loading...</div>
            ) : Object.keys(groupedByLocation).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-[var(--onyx-surface)] p-16 text-center">
                    <Package size={56} className="mb-4 text-white/10" />
                    <h3 className="mb-2 text-lg font-bold text-white">No stock</h3>
                    <p className="text-sm text-[var(--theme-text-muted)]">No products in stock at any location</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {Object.entries(groupedByLocation).map(([locationId, { location_name, location_code, items }]) => {
                        const totalValue = items.reduce((sum, item) => sum + item.stock_value, 0)
                        const lowStockCount = items.filter(item => item.current_stock < invConfig.stockWarningThreshold).length

                        return (
                            <div key={locationId} className="rounded-xl border border-white/5 bg-[var(--onyx-surface)] p-5">
                                <div className="mb-4 flex items-start justify-between border-b border-white/5 pb-4">
                                    <div>
                                        <h3 className="mb-1 text-lg font-bold text-white">{location_name}</h3>
                                        <span className="text-xs text-[var(--theme-text-muted)]">{location_code}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--color-gold)15', color: 'var(--color-gold)' }}>
                                            <Package size={14} />
                                            {items.length} products
                                        </div>
                                        {lowStockCount > 0 && (
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                                <AlertTriangle size={14} />
                                                {lowStockCount} low
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4 text-sm text-[var(--theme-text-muted)]">
                                    Total value: <strong className="text-lg text-white">IDR {totalValue.toLocaleString()}</strong>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border-b border-white/5 bg-black/20 p-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
                                                <th className="border-b border-white/5 bg-black/20 p-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Stock</th>
                                                <th className="border-b border-white/5 bg-black/20 p-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr
                                                    key={item.product_id}
                                                    className={cn(
                                                        'border-b border-white/5 transition-colors hover:bg-white/[0.02]',
                                                        item.current_stock < invConfig.stockWarningThreshold && 'bg-amber-500/5'
                                                    )}
                                                >
                                                    <td className="p-2.5 text-sm">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-medium text-white">{item.product_name}</span>
                                                            {item.sku && <span className="text-[10px] text-[var(--theme-text-muted)]">{item.sku}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-2.5 text-sm font-semibold">
                                                        {item.current_stock > 0 ? (
                                                            <span className="text-emerald-400">
                                                                {item.current_stock} {item.stock_unit}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[var(--theme-text-muted)]">0</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2.5 text-sm text-[var(--theme-text-secondary)]">IDR {item.stock_value.toLocaleString()}</td>
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
