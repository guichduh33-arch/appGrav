import { useState, useEffect } from 'react'
import { Calendar, Package, TrendingDown, TrendingUp, Filter, Search, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import './StockMovementsPage.css'

interface StockLocation {
    id: string
    name: string
    code: string
    location_type: string
}

interface Product {
    id: string
    name: string
    sku: string
}

interface StockMovement {
    id: string
    product_id: string
    product_name: string
    product_sku: string
    from_location_id: string | null
    from_location_name: string | null
    to_location_id: string | null
    to_location_name: string | null
    movement_type: string
    quantity: number
    unit: string
    unit_cost: number | null
    total_cost: number | null
    reference_type: string | null
    reference_number: string | null
    notes: string | null
    created_by_name: string | null
    created_at: string
}

const MOVEMENT_TYPES = [
    { value: 'transfer', label: 'Transfert', color: '#3b82f6' },
    { value: 'adjustment', label: 'Ajustement', color: '#8b5cf6' },
    { value: 'production_input', label: 'Entrée Production', color: '#10b981' },
    { value: 'production_output', label: 'Sortie Production', color: '#f59e0b' },
    { value: 'waste', label: 'Perte/Gaspillage', color: '#ef4444' },
    { value: 'receipt', label: 'Réception', color: '#06b6d4' },
    { value: 'sale', label: 'Vente', color: '#ec4899' },
    { value: 'return', label: 'Retour', color: '#84cc16' }
]

export default function StockMovementsPage() {
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [locations, setLocations] = useState<StockLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<string>('all')
    const [filterLocation, setFilterLocation] = useState<string>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    useEffect(() => {
        fetchLocations()
        fetchMovements()
    }, [])

    const fetchLocations = async () => {
        const { data } = await supabase
            .from('stock_locations')
            .select('*')
            .eq('is_active', true)
            .order('name')
        if (data) setLocations(data)
    }

    const fetchMovements = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('stock_movements')
                .select(`
                    *,
                    product:products(name, sku),
                    from_location:stock_locations!stock_movements_from_location_id_fkey(name),
                    to_location:stock_locations!stock_movements_to_location_id_fkey(name)
                `)
                .order('created_at', { ascending: false })
                .limit(500)

            if (error) throw error

            const formattedData: StockMovement[] = (data || []).map((m: any) => ({
                id: m.id,
                product_id: m.product_id,
                product_name: m.product?.name || 'Unknown',
                product_sku: m.product?.sku || '',
                from_location_id: m.from_location_id,
                from_location_name: m.from_location?.name || null,
                to_location_id: m.to_location_id,
                to_location_name: m.to_location?.name || null,
                movement_type: m.movement_type,
                quantity: m.quantity,
                unit: m.unit,
                unit_cost: m.unit_cost,
                total_cost: m.total_cost,
                reference_type: m.reference_type,
                reference_number: m.reference_number,
                notes: m.notes,
                created_by_name: m.created_by_name,
                created_at: m.created_at
            }))

            setMovements(formattedData)
        } catch (error) {
            console.error('Error fetching movements:', error)
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }

    const getMovementTypeLabel = (type: string) => {
        const found = MOVEMENT_TYPES.find(t => t.value === type)
        return found ? found.label : type
    }

    const getMovementTypeColor = (type: string) => {
        const found = MOVEMENT_TYPES.find(t => t.value === type)
        return found ? found.color : '#6b7280'
    }

    const filteredMovements = movements.filter(m => {
        const matchesSearch = searchTerm === '' ||
            m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === 'all' || m.movement_type === filterType

        const matchesLocation = filterLocation === 'all' ||
            m.from_location_id === filterLocation ||
            m.to_location_id === filterLocation

        const matchesDateFrom = dateFrom === '' || new Date(m.created_at) >= new Date(dateFrom)
        const matchesDateTo = dateTo === '' || new Date(m.created_at) <= new Date(dateTo + 'T23:59:59')

        return matchesSearch && matchesType && matchesLocation && matchesDateFrom && matchesDateTo
    })

    const totalMovements = filteredMovements.length
    const totalValue = filteredMovements.reduce((sum, m) => sum + (m.total_cost || 0), 0)

    return (
        <div className="stock-movements-page">
            {/* Header */}
            <header className="stock-movements-header">
                <div>
                    <h1 className="stock-movements-title">
                        <Package size={28} />
                        Mouvements de Stock
                    </h1>
                    <p className="stock-movements-subtitle">
                        Historique complet des mouvements de stock
                    </p>
                </div>
                <button className="btn btn-secondary">
                    <Download size={18} />
                    Exporter
                </button>
            </header>

            {/* Stats */}
            <div className="stock-movements-stats">
                <div className="stock-movement-stat">
                    <div className="stock-movement-stat__icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        <Package size={24} />
                    </div>
                    <div className="stock-movement-stat__content">
                        <div className="stock-movement-stat__value">{totalMovements}</div>
                        <div className="stock-movement-stat__label">Mouvements</div>
                    </div>
                </div>
                <div className="stock-movement-stat">
                    <div className="stock-movement-stat__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stock-movement-stat__content">
                        <div className="stock-movement-stat__value">
                            {filteredMovements.filter(m => m.to_location_id !== null).length}
                        </div>
                        <div className="stock-movement-stat__label">Entrées</div>
                    </div>
                </div>
                <div className="stock-movement-stat">
                    <div className="stock-movement-stat__icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div className="stock-movement-stat__content">
                        <div className="stock-movement-stat__value">
                            {filteredMovements.filter(m => m.from_location_id !== null).length}
                        </div>
                        <div className="stock-movement-stat__label">Sorties</div>
                    </div>
                </div>
                <div className="stock-movement-stat">
                    <div className="stock-movement-stat__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="stock-movement-stat__content">
                        <div className="stock-movement-stat__value">€{totalValue.toFixed(2)}</div>
                        <div className="stock-movement-stat__label">Valeur Totale</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="stock-movements-filters">
                <div className="stock-movements-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par produit, SKU, référence..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                    <option value="all">Tous les types</option>
                    {MOVEMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>

                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="filter-select">
                    <option value="all">Tous les emplacements</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="filter-date"
                    placeholder="Date début"
                />

                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="filter-date"
                    placeholder="Date fin"
                />
            </div>

            {/* Movements Table */}
            {loading ? (
                <div className="stock-movements-loading">Chargement...</div>
            ) : filteredMovements.length === 0 ? (
                <div className="stock-movements-empty">
                    <Package size={64} />
                    <h3>Aucun mouvement</h3>
                    <p>Aucun mouvement de stock trouvé</p>
                </div>
            ) : (
                <div className="stock-movements-table-container">
                    <table className="stock-movements-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Produit</th>
                                <th>De</th>
                                <th>Vers</th>
                                <th>Quantité</th>
                                <th>Coût</th>
                                <th>Référence</th>
                                <th>Créé par</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovements.map(movement => (
                                <tr key={movement.id}>
                                    <td>{new Date(movement.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <span
                                            className="movement-type-badge"
                                            style={{
                                                background: `${getMovementTypeColor(movement.movement_type)}20`,
                                                color: getMovementTypeColor(movement.movement_type)
                                            }}
                                        >
                                            {getMovementTypeLabel(movement.movement_type)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="product-info">
                                            <span className="product-name">{movement.product_name}</span>
                                            {movement.product_sku && (
                                                <span className="product-sku">{movement.product_sku}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{movement.from_location_name || '-'}</td>
                                    <td>{movement.to_location_name || '-'}</td>
                                    <td className="quantity-cell">{movement.quantity} {movement.unit}</td>
                                    <td>{movement.total_cost ? `€${movement.total_cost.toFixed(2)}` : '-'}</td>
                                    <td>{movement.reference_number || '-'}</td>
                                    <td>{movement.created_by_name || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
