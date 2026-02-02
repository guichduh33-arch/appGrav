import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ArrowRightLeft, Clock, CheckCircle, XCircle, Eye, Filter, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useInternalTransfers } from '@/hooks/inventory'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import type { TTransferStatus } from '@/types/database'
import './InternalTransfersPage.css'

// Status icons mapping
const STATUS_ICONS = {
  draft: Clock,
  pending: Clock,
  in_transit: ArrowRightLeft,
  received: CheckCircle,
  cancelled: XCircle
} as const

// Status colors
const STATUS_COLORS = {
  draft: '#6b7280',
  pending: '#f59e0b',
  in_transit: '#3b82f6',
  received: '#10b981',
  cancelled: '#ef4444'
} as const

export default function InternalTransfersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isOnline } = useNetworkStatus()
  const [statusFilter, setStatusFilter] = useState<TTransferStatus | 'all'>('all')

  // Use the hook instead of direct Supabase calls
  const { data: transfers = [], isLoading, error } = useInternalTransfers(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )

  // Handle new transfer button click
  const handleNewTransfer = () => {
    if (!isOnline) {
      toast.error(t('inventory.transfers.offline.blocked'))
      return
    }
    navigate('/inventory/transfers/new')
  }

  // Calculate stats using useMemo
  const stats = useMemo(() => ({
    total: transfers.length,
    pending: transfers.filter(t => t.status === 'pending' || t.status === 'in_transit').length,
    received: transfers.filter(t => t.status === 'received').length,
    totalValue: transfers.reduce((sum, t) => sum + (t.total_value ?? 0), 0)
  }), [transfers])

  // Get status label from translations
  const getStatusLabel = (status: string): string => {
    return t(`inventory.transfers.status.${status}`, status)
  }

  // Get status config for display
  const getStatusConfig = (status: string) => {
    const key = status as keyof typeof STATUS_ICONS
    return {
      label: getStatusLabel(status),
      color: STATUS_COLORS[key] ?? '#6b7280',
      icon: STATUS_ICONS[key] ?? Clock
    }
  }

  // Show error toast only once when error occurs
  useEffect(() => {
    if (error) {
      toast.error(t('inventory.transfers.messages.loadError'))
    }
  }, [error, t])

  return (
    <div className="internal-transfers-page">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="offline-banner" style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#b45309'
        }}>
          <WifiOff size={18} />
          <span>{t('inventory.transfers.offline.blocked')}</span>
        </div>
      )}

      {/* Header */}
      <header className="transfers-header">
        <div>
          <h1 className="transfers-title">
            <ArrowRightLeft size={28} />
            {t('inventory.transfers.title')}
          </h1>
          <p className="transfers-subtitle">
            {t('inventory.transfers.subtitle')}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleNewTransfer}
          disabled={!isOnline}
          title={!isOnline ? t('inventory.transfers.offline.blocked') : undefined}
        >
          <Plus size={18} />
          {t('inventory.transfers.newTransfer')}
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
            <div className="transfer-stat__label">{t('inventory.transfers.stats.total')}</div>
          </div>
        </div>
        <div className="transfer-stat">
          <div className="transfer-stat__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="transfer-stat__content">
            <div className="transfer-stat__value">{stats.pending}</div>
            <div className="transfer-stat__label">{t('inventory.transfers.stats.pending')}</div>
          </div>
        </div>
        <div className="transfer-stat">
          <div className="transfer-stat__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="transfer-stat__content">
            <div className="transfer-stat__value">{stats.received}</div>
            <div className="transfer-stat__label">{t('inventory.transfers.stats.completed')}</div>
          </div>
        </div>
        <div className="transfer-stat">
          <div className="transfer-stat__icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Filter size={24} />
          </div>
          <div className="transfer-stat__content">
            <div className="transfer-stat__value">Rp{stats.totalValue.toLocaleString('id-ID')}</div>
            <div className="transfer-stat__label">{t('inventory.transfers.stats.totalValue')}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="transfers-filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TTransferStatus | 'all')}
          className="status-filter"
        >
          <option value="all">{t('inventory.transfers.status.all')}</option>
          <option value="draft">{t('inventory.transfers.status.draft')}</option>
          <option value="pending">{t('inventory.transfers.status.pending')}</option>
          <option value="in_transit">{t('inventory.transfers.status.in_transit')}</option>
          <option value="received">{t('inventory.transfers.status.received')}</option>
          <option value="cancelled">{t('inventory.transfers.status.cancelled')}</option>
        </select>
      </div>

      {/* Transfers List */}
      {isLoading ? (
        <div className="transfers-loading">{t('common.loading')}</div>
      ) : transfers.length === 0 ? (
        <div className="transfers-empty">
          <ArrowRightLeft size={64} />
          <h3>{t('inventory.transfers.empty.title')}</h3>
          <p>{t('inventory.transfers.empty.description')}</p>
          <button
            className="btn btn-primary"
            onClick={handleNewTransfer}
            disabled={!isOnline}
          >
            <Plus size={18} />
            {t('inventory.transfers.newTransfer')}
          </button>
        </div>
      ) : (
        <div className="transfers-grid">
          {transfers.map(transfer => {
            const statusConfig = getStatusConfig(transfer.status)
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
                    {transfer.from_location?.name ?? t('common.unknown')}
                  </div>
                  <ArrowRightLeft size={20} className="transfer-card__arrow" />
                  <div className="transfer-card__location to">
                    {transfer.to_location?.name ?? t('common.unknown')}
                  </div>
                </div>

                <div className="transfer-card__info">
                  <div className="transfer-card__info-item">
                    <span className="label">{t('inventory.transfers.form.date')}:</span>
                    <span className="value">
                      {new Date(transfer.transfer_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="transfer-card__info-item">
                    <span className="label">{t('inventory.transfers.form.responsible')}:</span>
                    <span className="value">{transfer.responsible_person}</span>
                  </div>
                  <div className="transfer-card__info-item">
                    <span className="label">{t('inventory.transfers.form.totalItems')}:</span>
                    <span className="value">{transfer.total_items ?? 0}</span>
                  </div>
                  <div className="transfer-card__info-item">
                    <span className="label">{t('inventory.transfers.stats.totalValue')}:</span>
                    <span className="value">Rp{(transfer.total_value ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="transfer-card__actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/inventory/transfers/${transfer.id}`)}
                  >
                    <Eye size={16} />
                    {t('inventory.transfers.actions.viewDetails')}
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
