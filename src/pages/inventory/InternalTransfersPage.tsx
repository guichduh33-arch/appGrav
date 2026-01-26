import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRightLeft, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import './InternalTransfersPage.css'

interface Transfer {
    id: string
    transfer_number: string
    from_location_name: string
    to_location_name: string
    status: string
    responsible_person: string
    transfer_date: string
    total_items: number
    total_value: number
    created_at: string
}

const STATUS_CONFIG = {
    draft: { label: 'Brouillon', color: '#6b7280', icon: Clock },
    pending: { label: 'En Attente', color: '#f59e0b', icon: Clock },
    in_transit: { label: 'En Transit', color: '#3b82f6', icon: ArrowRightLeft },
    received: { label: 'Reçu', color: '#10b981', icon: CheckCircle },
    cancelled: { label: 'Annulé', color: '#ef4444', icon: XCircle }
}

export default function InternalTransfersPage() {
    const navigate = useNavigate()
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')

    useEffect(() => {
        fetchTransfers()
    }, [])

    const fetchTransfers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('internal_transfers')
                .select(`
                    *,
                    from_location:stock_locations!internal_transfers_from_location_id_fkey(name),
                    to_location:stock_locations!internal_transfers_to_location_id_fkey(name)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            const rawData = data as unknown as Array<{
                id: string;
                transfer_number: string;
                from_location?: { name: string };
                to_location?: { name: string };
                status: string;
                responsible_person?: string;
                requested_by?: string;
                transfer_date?: string;
                created_at: string;
                total_items?: number;
                total_value?: number;
            }>;
            const formattedData: Transfer[] = rawData.map((t) => ({
                id: t.id,
                transfer_number: t.transfer_number,
                from_location_name: t.from_location?.name || 'Unknown',
                to_location_name: t.to_location?.name || 'Unknown',
                status: t.status,
                responsible_person: t.responsible_person || t.requested_by || '',
                transfer_date: t.transfer_date || t.created_at.split('T')[0],
                total_items: t.total_items || 0,
                total_value: t.total_value || 0,
                created_at: t.created_at
            }))

            setTransfers(formattedData)
        } catch (error) {
            console.error('Error fetching transfers:', error)
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }

    const filteredTransfers = transfers.filter(t =>
        statusFilter === 'all' || t.status === statusFilter
    )

    const stats = {
        total: transfers.length,
        pending: transfers.filter(t => t.status === 'pending' || t.status === 'in_transit').length,
        received: transfers.filter(t => t.status === 'received').length,
        totalValue: transfers.reduce((sum, t) => sum + t.total_value, 0)
    }

    return (
        <div className="internal-transfers-page">
            {/* Header */}
            <header className="transfers-header">
                <div>
                    <h1 className="transfers-title">
                        <ArrowRightLeft size={28} />
                        Transferts Internes
                    </h1>
                    <p className="transfers-subtitle">
                        Gérez les transferts entre le dépôt et les sections
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/inventory/transfers/new')}>
                    <Plus size={18} />
                    Nouveau Transfert
                </button>
            </header>

            {/* Stats */}
            <div className="transfers-stats">
                <div className="transfer-stat">
                    <div className="transfer-stat__icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        <ArrowRightLeft size={24} />
                    </div>
                    <div className="transfer-stat__content">
                        <div className="transfer-stat__value">{stats.total}</div>
                        <div className="transfer-stat__label">Total Transferts</div>
                    </div>
                </div>
                <div className="transfer-stat">
                    <div className="transfer-stat__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                        <Clock size={24} />
                    </div>
                    <div className="transfer-stat__content">
                        <div className="transfer-stat__value">{stats.pending}</div>
                        <div className="transfer-stat__label">En Cours</div>
                    </div>
                </div>
                <div className="transfer-stat">
                    <div className="transfer-stat__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="transfer-stat__content">
                        <div className="transfer-stat__value">{stats.received}</div>
                        <div className="transfer-stat__label">Complétés</div>
                    </div>
                </div>
                <div className="transfer-stat">
                    <div className="transfer-stat__icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                        <Filter size={24} />
                    </div>
                    <div className="transfer-stat__content">
                        <div className="transfer-stat__value">€{stats.totalValue.toFixed(2)}</div>
                        <div className="transfer-stat__label">Valeur Totale</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="transfers-filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-filter">
                    <option value="all">Tous les statuts</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Transfers List */}
            {loading ? (
                <div className="transfers-loading">Chargement...</div>
            ) : filteredTransfers.length === 0 ? (
                <div className="transfers-empty">
                    <ArrowRightLeft size={64} />
                    <h3>Aucun transfert</h3>
                    <p>Commencez par créer votre premier transfert</p>
                    <button className="btn btn-primary" onClick={() => navigate('/inventory/transfers/new')}>
                        <Plus size={18} />
                        Nouveau Transfert
                    </button>
                </div>
            ) : (
                <div className="transfers-grid">
                    {filteredTransfers.map(transfer => {
                        const statusConfig = STATUS_CONFIG[transfer.status as keyof typeof STATUS_CONFIG]
                        const StatusIcon = statusConfig.icon

                        return (
                            <div key={transfer.id} className="transfer-card">
                                <div className="transfer-card__header">
                                    <div className="transfer-card__number">
                                        <ArrowRightLeft size={18} />
                                        {transfer.transfer_number}
                                    </div>
                                    <span
                                        className="transfer-card__status"
                                        style={{
                                            background: `${statusConfig.color}20`,
                                            color: statusConfig.color
                                        }}
                                    >
                                        <StatusIcon size={14} />
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="transfer-card__route">
                                    <div className="transfer-card__location from">
                                        {transfer.from_location_name}
                                    </div>
                                    <ArrowRightLeft size={20} className="transfer-card__arrow" />
                                    <div className="transfer-card__location to">
                                        {transfer.to_location_name}
                                    </div>
                                </div>

                                <div className="transfer-card__info">
                                    <div className="transfer-card__info-item">
                                        <span className="label">Date:</span>
                                        <span className="value">{new Date(transfer.transfer_date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="transfer-card__info-item">
                                        <span className="label">Responsable:</span>
                                        <span className="value">{transfer.responsible_person}</span>
                                    </div>
                                    <div className="transfer-card__info-item">
                                        <span className="label">Articles:</span>
                                        <span className="value">{transfer.total_items}</span>
                                    </div>
                                    <div className="transfer-card__info-item">
                                        <span className="label">Valeur:</span>
                                        <span className="value">€{transfer.total_value.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="transfer-card__actions">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => navigate(`/inventory/transfers/${transfer.id}`)}
                                    >
                                        <Eye size={16} />
                                        Voir Détails
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
