import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Tag, Plus, Search, Edit, Trash2, Eye, Percent, Gift,
    Calendar, Clock, Users, TrendingDown, AlertCircle, CheckCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { Promotion, PromotionType } from '../../types/database'
import './PromotionsPage.css'

const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
    percentage: 'Réduction %',
    fixed_amount: 'Montant fixe',
    buy_x_get_y: 'Achetez X obtenez Y',
    free_product: 'Produit offert',
    fixed: 'Montant fixe',
    free: 'Gratuit'
}

const PROMOTION_TYPE_ICONS: Record<PromotionType, React.ReactNode> = {
    percentage: <Percent size={16} />,
    fixed_amount: <TrendingDown size={16} />,
    buy_x_get_y: <Gift size={16} />,
    free_product: <Gift size={16} />,
    fixed: <TrendingDown size={16} />,
    free: <Gift size={16} />
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
]

export default function PromotionsPage() {
    const navigate = useNavigate()
    const [promotions, setPromotions] = useState<Promotion[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<PromotionType | 'all'>('all')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

    useEffect(() => {
        fetchPromotions()
    }, [])

    const fetchPromotions = async () => {
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setPromotions(data)
        } catch (error) {
            console.error('Error fetching promotions:', error)
        } finally {
            setLoading(false)
        }
    }

    const isPromotionActive = (promo: Promotion): boolean => {
        if (!promo.is_active) return false

        const now = new Date()

        // Check date range
        if (promo.start_date && new Date(promo.start_date) > now) return false
        if (promo.end_date && new Date(promo.end_date) < now) return false

        // Check usage limits
        if (promo.max_uses_total && (promo.current_uses ?? 0) >= promo.max_uses_total) return false

        return true
    }

    const filteredPromotions = promotions.filter(promo => {
        const matchesSearch =
            promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.description?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === 'all' || promo.promotion_type === filterType

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && isPromotionActive(promo)) ||
            (filterStatus === 'inactive' && !isPromotionActive(promo))

        return matchesSearch && matchesType && matchesStatus
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return

        try {
            const { error } = await supabase
                .from('promotions')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchPromotions()
        } catch (error) {
            console.error('Error deleting promotion:', error)
        }
    }

    const handleToggleActive = async (promo: Promotion) => {
        try {
            const { error } = await supabase
                .from('promotions')
                .update({ is_active: !promo.is_active })
                .eq('id', promo.id)

            if (error) throw error
            await fetchPromotions()
        } catch (error) {
            console.error('Error updating promotion:', error)
        }
    }

    const formatPromotionValue = (promo: Promotion): string => {
        switch (promo.promotion_type) {
            case 'percentage':
                return `${promo.discount_percentage}% de réduction`
            case 'fixed_amount':
                return `${formatCurrency(promo.discount_amount || 0)} de réduction`
            case 'buy_x_get_y':
                return `Achetez ${promo.buy_quantity}, obtenez ${promo.get_quantity} gratuit`
            case 'free_product':
                return 'Produit gratuit'
            default:
                return '-'
        }
    }

    const formatTimeConstraints = (promo: Promotion): string[] => {
        const constraints: string[] = []

        if (promo.start_date || promo.end_date) {
            const start = promo.start_date ? new Date(promo.start_date).toLocaleDateString('fr-FR') : '...'
            const end = promo.end_date ? new Date(promo.end_date).toLocaleDateString('fr-FR') : '...'
            constraints.push(`Du ${start} au ${end}`)
        }

        if (promo.days_of_week && promo.days_of_week.length > 0) {
            const days = promo.days_of_week
                .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label.substring(0, 3))
                .join(', ')
            constraints.push(`Jours: ${days}`)
        }

        if (promo.time_start && promo.time_end) {
            constraints.push(`${promo.time_start} - ${promo.time_end}`)
        }

        return constraints
    }

    const stats = {
        total: promotions.length,
        active: promotions.filter(isPromotionActive).length,
        inactive: promotions.filter(p => !isPromotionActive(p)).length,
        expired: promotions.filter(p =>
            p.end_date && new Date(p.end_date) < new Date()
        ).length
    }

    return (
        <div className="promotions-page">
            {/* Header */}
            <header className="promotions-header">
                <div className="promotions-header__info">
                    <h1 className="promotions-header__title">
                        <Tag size={28} />
                        Gestion des Promotions
                    </h1>
                    <p className="promotions-header__subtitle">
                        Créez des promotions avec règles temporelles et conditions d'achat
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/products/promotions/new')}
                >
                    <Plus size={18} />
                    Nouvelle Promotion
                </button>
            </header>

            {/* Stats */}
            <div className="promotions-stats">
                <div className="stat-card">
                    <Tag size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Promotions</span>
                    </div>
                </div>
                <div className="stat-card active">
                    <CheckCircle size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.active}</span>
                        <span className="stat-label">Actives</span>
                    </div>
                </div>
                <div className="stat-card inactive">
                    <AlertCircle size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.inactive}</span>
                        <span className="stat-label">Inactives</span>
                    </div>
                </div>
                <div className="stat-card expired">
                    <Calendar size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.expired}</span>
                        <span className="stat-label">Expirées</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="promotions-filters">
                <div className="promotions-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, code ou description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as PromotionType | 'all')}
                    className="filter-select"
                >
                    <option value="all">Tous les types</option>
                    <option value="percentage">Réduction %</option>
                    <option value="fixed_amount">Montant fixe</option>
                    <option value="buy_x_get_y">Achetez X obtenez Y</option>
                    <option value="free_product">Produit offert</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="filter-select"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actives</option>
                    <option value="inactive">Inactives</option>
                </select>
            </div>

            {/* Promotions List */}
            {loading ? (
                <div className="promotions-loading">
                    <div className="spinner"></div>
                    <span>Chargement des promotions...</span>
                </div>
            ) : filteredPromotions.length === 0 ? (
                <div className="promotions-empty">
                    <Tag size={64} />
                    <h3>Aucune promotion trouvée</h3>
                    <p>
                        {searchTerm || filterType !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Commencez par créer votre première promotion'}
                    </p>
                </div>
            ) : (
                <div className="promotions-grid">
                    {filteredPromotions.map(promo => {
                        const active = isPromotionActive(promo)
                        const timeConstraints = formatTimeConstraints(promo)

                        return (
                            <div
                                key={promo.id}
                                className={`promotion-card ${!active ? 'inactive' : ''}`}
                            >
                                <div className="promotion-card__header">
                                    <div className="promotion-card__type">
                                        {PROMOTION_TYPE_ICONS[promo.promotion_type as PromotionType]}
                                        <span>{PROMOTION_TYPE_LABELS[promo.promotion_type as PromotionType]}</span>
                                    </div>
                                    <span className={`status-badge ${active ? 'active' : 'inactive'}`}>
                                        {active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="promotion-card__content">
                                    <h3 className="promotion-card__name">{promo.name}</h3>
                                    <div className="promotion-card__code">Code: {promo.code}</div>

                                    {promo.description && (
                                        <p className="promotion-card__description">{promo.description}</p>
                                    )}

                                    <div className="promotion-card__value">
                                        {formatPromotionValue(promo)}
                                    </div>

                                    {timeConstraints.length > 0 && (
                                        <div className="promotion-card__constraints">
                                            <Clock size={14} />
                                            <div className="constraints-list">
                                                {timeConstraints.map((constraint, idx) => (
                                                    <span key={idx}>{constraint}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {promo.min_purchase_amount && (
                                        <div className="promotion-card__requirement">
                                            Achat minimum: {formatCurrency(promo.min_purchase_amount)}
                                        </div>
                                    )}

                                    {(promo.max_uses_total || promo.max_uses_per_customer) && (
                                        <div className="promotion-card__usage">
                                            <Users size={14} />
                                            <span>
                                                {promo.current_uses} / {promo.max_uses_total || '∞'} utilisations
                                            </span>
                                            {promo.max_uses_per_customer && (
                                                <span className="per-customer">
                                                    (Max {promo.max_uses_per_customer}/client)
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="promotion-card__meta">
                                        <span className="priority-badge">
                                            Priorité: {promo.priority}
                                        </span>
                                        {promo.is_stackable && (
                                            <span className="stackable-badge">Cumulable</span>
                                        )}
                                    </div>
                                </div>

                                <div className="promotion-card__actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => navigate(`/products/promotions/${promo.id}`)}
                                        title="Voir détails"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => navigate(`/products/promotions/${promo.id}/edit`)}
                                        title="Modifier"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className={`btn-icon ${promo.is_active ? 'active' : 'inactive'}`}
                                        onClick={() => handleToggleActive(promo)}
                                        title={promo.is_active ? 'Désactiver' : 'Activer'}
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    <button
                                        className="btn-icon danger"
                                        onClick={() => handleDelete(promo.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
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
