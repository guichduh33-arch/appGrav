import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRightLeft, Clock, CheckCircle, XCircle, Eye, Filter, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
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
  const { isOnline } = useNetworkStatus()
  const [statusFilter, setStatusFilter] = useState<TTransferStatus | 'all'>('all')

  // Use the hook instead of direct Supabase calls
  const { data: transfers = [], isLoading, error } = useInternalTransfers(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )

  // Handle new transfer button click
  const handleNewTransfer = () => {
    if (!isOnline) {
      toast.error('Transfers are not available offline')
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

  // Get status label
  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      all: 'All statuses',
      draft: 'Draft',
      pending: 'Pending',
      in_transit: 'In Transit',
      received: 'Received',
      cancelled: 'Cancelled'
    }
    return statusLabels[status] || status
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
      toast.error('Error loading transfers')
    }
  }, [error])

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
          <span>Transfers are not available offline</span>
        </div>
      )}

      {/* Header */}
      <header className="transfers-header">
        <div>
          <h1 className="transfers-title">
            <ArrowRightLeft size={28} />
            Internal Transfers
          </h1>
          <p className="transfers-subtitle">
            Manage transfers between warehouse and sections
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleNewTransfer}
          disabled={!isOnline}
          title={!isOnline ? 'Transfers are not available offline' : undefined}
        >
          <Plus size={18} />
          New Transfer
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
            <div className="transfer-stat__label">Total</div>
          </div>
        </div>
        <div className="transfer-stat">
          <div className="transfer-stat__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="transfer-stat__content">
            <div className="transfer-stat__value">{stats.pending}</div>
            <div className="transfer-stat__label">Pending</div>
          </div>
        </div>
        <div className="transfer-stat">
          <div className="transfer-stat__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="transfer-stat__content">
            <div className="transfer-stat__value">{stats.received}</div>
            <div className="transfer-stat__label">Completed</div>
          </div>
        </div>
        <div className="transfer-stat">
          <div className="transfer-stat__icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Filter size={24} />
          </div>
          <div className="transfer-stat__content">
            <div className="transfer-stat__value">Rp{stats.totalValue.toLocaleString('id-ID')}</div>
            <div className="transfer-stat__label">Total Value</div>
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
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Transfers List */}
      {isLoading ? (
        <div className="transfers-loading">Loading...</div>
      ) : transfers.length === 0 ? (
        <div className="transfers-empty">
          <ArrowRightLeft size={64} />
          <h3>No transfers yet</h3>
          <p>Create your first internal transfer to move stock between locations</p>
          <button
            className="btn btn-primary"
            onClick={handleNewTransfer}
            disabled={!isOnline}
          >
            <Plus size={18} />
            New Transfer
          </button>
        </div>
      ) : (
        <div className="transfers-grid">
          {transfers.map(transfer => {
            const statusConfig = getStatusConfig(transfer.status ?? 'draft')
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
                    {transfer.from_section?.icon} {transfer.from_section?.name ?? transfer.from_location?.name ?? 'Unknown'}
                  </div>
                  <ArrowRightLeft size={20} className="transfer-card__arrow" />
                  <div className="transfer-card__location to">
                    {transfer.to_section?.icon} {transfer.to_section?.name ?? transfer.to_location?.name ?? 'Unknown'}
                  </div>
                </div>

                <div className="transfer-card__info">
                  <div className="transfer-card__info-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US') : '-'}
                    </span>
                  </div>
                  <div className="transfer-card__info-item">
                    <span className="label">Responsible:</span>
                    <span className="value">{transfer.responsible_person}</span>
                  </div>
                  <div className="transfer-card__info-item">
                    <span className="label">Total Items:</span>
                    <span className="value">{transfer.total_items ?? 0}</span>
                  </div>
                  <div className="transfer-card__info-item">
                    <span className="label">Total Value:</span>
                    <span className="value">Rp{(transfer.total_value ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="transfer-card__actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/inventory/transfers/${transfer.id}`)}
                  >
                    <Eye size={16} />
                    View Details
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
