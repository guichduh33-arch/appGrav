import { useState, useEffect, useMemo } from 'react'
import {
    Factory, ShoppingCart, Package, Trash2, ArrowUpCircle,
    Filter, TrendingUp, TrendingDown, Clock, Truck, ArrowRight,
    Search, Calendar
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import './StockMovementsPage.css'

interface StockMovement {
    id: string
    product_id: string
    product_name: string
    product_sku: string
    product_unit: string
    product_cost: number
    movement_type: string
    quantity: number
    reason: string | null
    reference_id: string | null
    created_at: string
    staff_name: string | null
}

type MovementType = 'all' | 'production_in' | 'production_out' | 'stock_in' | 'sale' | 'waste' | 'adjustment' | 'transfer'

const MOVEMENT_CONFIG: Record<string, {
    label: string
    icon: React.ReactNode
    bgColor: string
    textColor: string
    borderColor: string
    description: string
}> = {
    production_in: {
        label: 'Production In',
        icon: <Factory size={16} />,
        bgColor: '#FEF3C7',
        textColor: '#B45309',
        borderColor: '#FCD34D',
        description: 'Produits finis/semi-finis produits'
    },
    production_out: {
        label: 'Production Out',
        icon: <Package size={16} />,
        bgColor: '#FDF2F8',
        textColor: '#BE185D',
        borderColor: '#F9A8D4',
        description: 'Ingredients utilises en production'
    },
    stock_in: {
        label: 'Entree Stock',
        icon: <Truck size={16} />,
        bgColor: '#D1FAE5',
        textColor: '#047857',
        borderColor: '#6EE7B7',
        description: 'Achat / Reception fournisseur'
    },
    purchase: {
        label: 'Achat',
        icon: <Truck size={16} />,
        bgColor: '#D1FAE5',
        textColor: '#047857',
        borderColor: '#6EE7B7',
        description: 'Commande fournisseur recue'
    },
    sale: {
        label: 'Vente',
        icon: <ShoppingCart size={16} />,
        bgColor: '#DBEAFE',
        textColor: '#1D4ED8',
        borderColor: '#93C5FD',
        description: 'Vendu au POS'
    },
    waste: {
        label: 'Perte',
        icon: <Trash2 size={16} />,
        bgColor: '#FEE2E2',
        textColor: '#DC2626',
        borderColor: '#FCA5A5',
        description: 'Perte / Casse'
    },
    adjustment: {
        label: 'Ajustement',
        icon: <ArrowUpCircle size={16} />,
        bgColor: '#F3F4F6',
        textColor: '#4B5563',
        borderColor: '#D1D5DB',
        description: 'Ajustement de stock'
    },
    adjustment_in: {
        label: 'Ajustement +',
        icon: <ArrowUpCircle size={16} />,
        bgColor: '#D1FAE5',
        textColor: '#047857',
        borderColor: '#6EE7B7',
        description: 'Ajustement positif'
    },
    adjustment_out: {
        label: 'Ajustement -',
        icon: <ArrowUpCircle size={16} />,
        bgColor: '#FEE2E2',
        textColor: '#DC2626',
        borderColor: '#FCA5A5',
        description: 'Ajustement negatif'
    },
    transfer: {
        label: 'Transfert',
        icon: <ArrowRight size={16} />,
        bgColor: '#E0E7FF',
        textColor: '#4338CA',
        borderColor: '#A5B4FC',
        description: 'Transfert entre emplacements'
    }
}

export default function StockMovementsPage() {
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<MovementType>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    useEffect(() => {
        fetchMovements()
    }, [])

    const fetchMovements = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('stock_movements')
                .select(`
                    *,
                    product:products(name, sku, unit, cost_price),
                    staff:user_profiles!stock_movements_staff_id_fkey(display_name)
                `)
                .order('created_at', { ascending: false })
                .limit(500)

            if (error) throw error

            const rawData = data as unknown as Array<{
                id: string;
                product_id: string;
                product?: { name?: string; sku?: string; unit?: string; cost_price?: number };
                staff?: { display_name?: string };
                movement_type: string;
                quantity: number;
                reason?: string | null;
                reference_id?: string | null;
                created_at: string;
            }>;
            const formattedData: StockMovement[] = rawData.map((m) => ({
                id: m.id,
                product_id: m.product_id,
                product_name: m.product?.name || 'Inconnu',
                product_sku: m.product?.sku || '',
                product_unit: m.product?.unit || 'pcs',
                product_cost: m.product?.cost_price || 0,
                movement_type: m.movement_type,
                quantity: m.quantity,
                reason: m.reason ?? null,
                reference_id: m.reference_id ?? null,
                created_at: m.created_at,
                staff_name: m.staff?.display_name || null
            }))

            setMovements(formattedData)
        } catch (error) {
            console.error('Error fetching movements:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter movements
    const filteredMovements = useMemo(() => {
        return movements.filter(m => {
            // Search filter
            if (searchTerm) {
                const search = searchTerm.toLowerCase()
                const matchesProduct = m.product_name.toLowerCase().includes(search)
                const matchesSku = m.product_sku.toLowerCase().includes(search)
                const matchesReason = m.reason?.toLowerCase().includes(search)
                if (!matchesProduct && !matchesSku && !matchesReason) return false
            }

            // Type filter
            if (filterType !== 'all' && m.movement_type !== filterType) return false

            // Date filters
            if (dateFrom && new Date(m.created_at) < new Date(dateFrom)) return false
            if (dateTo && new Date(m.created_at) > new Date(dateTo + 'T23:59:59')) return false

            return true
        })
    }, [movements, searchTerm, filterType, dateFrom, dateTo])

    // Calculate stats
    const stats = useMemo(() => {
        const totalIn = filteredMovements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0)
        const totalOut = filteredMovements.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0)
        const productionIn = filteredMovements.filter(m => m.movement_type === 'production_in').reduce((sum, m) => sum + m.quantity, 0)
        const productionOut = filteredMovements.filter(m => m.movement_type === 'production_out').reduce((sum, m) => sum + Math.abs(m.quantity), 0)
        const totalInValue = filteredMovements.filter(m => m.quantity > 0).reduce((sum, m) => sum + (m.quantity * m.product_cost), 0)
        const totalOutValue = filteredMovements.filter(m => m.quantity < 0).reduce((sum, m) => sum + (Math.abs(m.quantity) * m.product_cost), 0)

        return { totalIn, totalOut, productionIn, productionOut, totalInValue, totalOutValue }
    }, [filteredMovements])

    // Get movement type counts for filter buttons
    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        movements.forEach(m => {
            counts[m.movement_type] = (counts[m.movement_type] || 0) + 1
        })
        return counts
    }, [movements])

    const getMovementConfig = (type: string) => {
        return MOVEMENT_CONFIG[type] || {
            label: type,
            icon: <Package size={16} />,
            bgColor: '#F3F4F6',
            textColor: '#6B7280',
            borderColor: '#E5E7EB',
            description: 'Mouvement'
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return {
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
    }

    if (loading) {
        return (
            <div className="movements-loading">
                <div className="spinner" />
                <p>Chargement des mouvements...</p>
            </div>
        )
    }

    return (
        <div className="stock-movements-page-new">
            {/* Stats Cards */}
            <div className="movements-stats">
                {/* Total Movements */}
                <div className="stat-card stat-primary">
                    <div className="stat-label">Total Mouvements</div>
                    <div className="stat-value">{filteredMovements.length}</div>
                    <div className="stat-sub">enregistrements</div>
                </div>

                {/* Total In */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-green">
                        <TrendingUp size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Entrees</div>
                        <div className="stat-value text-green">+{stats.totalIn}</div>
                        <div className="stat-sub text-green">+{formatCurrency(stats.totalInValue)}</div>
                    </div>
                </div>

                {/* Total Out */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-red">
                        <TrendingDown size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Sorties</div>
                        <div className="stat-value text-red">-{stats.totalOut}</div>
                        <div className="stat-sub text-red">-{formatCurrency(stats.totalOutValue)}</div>
                    </div>
                </div>

                {/* Production In */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-amber">
                        <Factory size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Production In</div>
                        <div className="stat-value text-amber">+{stats.productionIn}</div>
                    </div>
                </div>

                {/* Production Out */}
                <div className="stat-card">
                    <div className="stat-icon stat-icon-pink">
                        <Package size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Production Out</div>
                        <div className="stat-value text-pink">-{stats.productionOut}</div>
                    </div>
                </div>
            </div>

            {/* Search & Date Filters */}
            <div className="movements-search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par produit, SKU, raison..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="date-filters">
                    <div className="date-input-wrapper">
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            placeholder="Date debut"
                        />
                    </div>
                    <span className="date-separator">a</span>
                    <div className="date-input-wrapper">
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            placeholder="Date fin"
                        />
                    </div>
                </div>
            </div>

            {/* Type Filters */}
            <div className="movements-filters">
                <div className="filter-label">
                    <Filter size={18} />
                    <span>Filtrer:</span>
                </div>

                <button
                    onClick={() => setFilterType('all')}
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                >
                    Tous ({movements.length})
                </button>

                {Object.entries(MOVEMENT_CONFIG).map(([type, config]) => {
                    const count = typeCounts[type] || 0
                    if (count === 0) return null
                    return (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as MovementType)}
                            className={`filter-btn ${filterType === type ? 'active' : ''}`}
                            style={{
                                '--btn-bg': filterType === type ? config.bgColor : 'white',
                                '--btn-color': filterType === type ? config.textColor : '#6B7280',
                                '--btn-border': filterType === type ? config.borderColor : '#E5E7EB'
                            } as React.CSSProperties}
                        >
                            {config.icon}
                            {config.label} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Movements List */}
            <div className="movements-list-card">
                <div className="movements-list-header">
                    <h3>Historique des Mouvements ({filteredMovements.length})</h3>
                </div>

                {filteredMovements.length > 0 ? (
                    <div className="movements-list">
                        {filteredMovements.map((movement) => {
                            const config = getMovementConfig(movement.movement_type)
                            const { date, time } = formatDate(movement.created_at)
                            const isPositive = movement.quantity > 0
                            const value = Math.abs(movement.quantity * movement.product_cost)

                            return (
                                <div key={movement.id} className="movement-item">
                                    {/* Type Icon */}
                                    <div
                                        className="movement-icon"
                                        style={{
                                            background: config.bgColor,
                                            borderColor: config.borderColor,
                                            color: config.textColor
                                        }}
                                    >
                                        {config.icon}
                                    </div>

                                    {/* Product & Details */}
                                    <div className="movement-details">
                                        <div className="movement-product">
                                            <span className="product-name">{movement.product_name}</span>
                                            {movement.product_sku && (
                                                <span className="product-sku">{movement.product_sku}</span>
                                            )}
                                        </div>
                                        <div className="movement-meta">
                                            <span
                                                className="movement-type-badge"
                                                style={{
                                                    background: config.bgColor,
                                                    color: config.textColor
                                                }}
                                            >
                                                {config.label}
                                            </span>
                                            <span className="movement-desc">{config.description}</span>
                                        </div>
                                        {movement.reason && (
                                            <div className="movement-reason" title={movement.reason}>
                                                {movement.reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity & Value */}
                                    <div className="movement-quantity">
                                        <div className={`qty-value ${isPositive ? 'positive' : 'negative'}`}>
                                            {isPositive ? '+' : ''}{movement.quantity} {movement.product_unit}
                                        </div>
                                        <div className={`qty-cost ${isPositive ? 'positive' : 'negative'}`}>
                                            {isPositive ? '+' : '-'}{formatCurrency(value)}
                                        </div>
                                    </div>

                                    {/* Date & Staff */}
                                    <div className="movement-date">
                                        <div className="date-value">{date}</div>
                                        <div className="time-value">
                                            <Clock size={12} />
                                            {time}
                                        </div>
                                        {movement.staff_name && (
                                            <div className="staff-name">{movement.staff_name}</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="movements-empty">
                        <Package size={48} />
                        <p className="empty-title">Aucun mouvement</p>
                        <p className="empty-desc">
                            {filterType !== 'all'
                                ? 'Aucun mouvement de ce type trouve'
                                : 'Les mouvements de stock apparaitront ici'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
