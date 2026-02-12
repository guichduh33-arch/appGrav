import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRightLeft, Clock, CheckCircle, XCircle, Eye, Filter, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { useInternalTransfers } from '@/hooks/inventory'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import type { TTransferStatus } from '@/types/database'

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
    <div className="p-xl max-w-[1600px] mx-auto">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-3 px-4 mb-4 rounded-lg border border-warning bg-warning/10 text-[#b45309]">
          <WifiOff size={18} />
          <span>Transfers are not available offline</span>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-start mb-xl">
        <div>
          <h1 className="flex items-center gap-md text-3xl font-bold text-white m-0 mb-sm">
            <ArrowRightLeft size={28} />
            Internal Transfers
          </h1>
          <p className="text-base text-[var(--color-gray-400)] m-0">
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-lg mb-xl">
        <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <ArrowRightLeft size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-white leading-none mb-1">{stats.total}</div>
            <div className="text-sm text-[var(--color-gray-400)]">Total</div>
          </div>
        </div>
        <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-white leading-none mb-1">{stats.pending}</div>
            <div className="text-sm text-[var(--color-gray-400)]">Pending</div>
          </div>
        </div>
        <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-white leading-none mb-1">{stats.received}</div>
            <div className="text-sm text-[var(--color-gray-400)]">Completed</div>
          </div>
        </div>
        <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Filter size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-white leading-none mb-1">Rp{stats.totalValue.toLocaleString('id-ID')}</div>
            <div className="text-sm text-[var(--color-gray-400)]">Total Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-lg">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TTransferStatus | 'all')}
          className="py-3 px-4 bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg text-white text-sm cursor-pointer"
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
        <div className="flex items-center justify-center p-3xl text-lg text-[var(--color-gray-400)]">Loading...</div>
      ) : transfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-3xl bg-[var(--color-gray-800)] border-2 border-dashed border-[var(--color-gray-700)] rounded-xl text-center [&>svg]:text-[var(--color-gray-600)] [&>svg]:mb-md">
          <ArrowRightLeft size={64} />
          <h3 className="text-xl font-bold text-white m-0 mb-sm">No transfers yet</h3>
          <p className="text-base text-[var(--color-gray-400)] m-0 mb-lg">Create your first internal transfer to move stock between locations</p>
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] max-md:grid-cols-1 gap-lg">
          {transfers.map(transfer => {
            const statusConfig = getStatusConfig(transfer.status ?? 'draft')
            const StatusIcon = statusConfig.icon

            return (
              <div key={transfer.id} className="bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg p-lg transition-all duration-200 hover:border-primary hover:shadow-md">
                <div className="flex justify-between items-center mb-md pb-md border-b border-[var(--color-gray-700)]">
                  <div className="flex items-center gap-2 text-lg font-bold text-white">
                    <ArrowRightLeft size={18} />
                    {transfer.transfer_number}
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${statusConfig.color}20`,
                      color: statusConfig.color
                    }}
                  >
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex items-center gap-md mb-lg p-md bg-[var(--color-gray-800)]/80 rounded-md">
                  <div className="flex-1 text-center text-sm font-semibold text-primary">
                    {transfer.from_section?.icon} {transfer.from_section?.name ?? transfer.from_location?.name ?? 'Unknown'}
                  </div>
                  <ArrowRightLeft size={20} className="text-[var(--color-gray-500)] shrink-0" />
                  <div className="flex-1 text-center text-sm font-semibold text-success">
                    {transfer.to_section?.icon} {transfer.to_section?.name ?? transfer.to_location?.name ?? 'Unknown'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sm mb-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--color-gray-500)] uppercase tracking-wider">Date:</span>
                    <span className="text-sm text-white font-medium">
                      {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US') : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--color-gray-500)] uppercase tracking-wider">Responsible:</span>
                    <span className="text-sm text-white font-medium">{transfer.responsible_person}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--color-gray-500)] uppercase tracking-wider">Total Items:</span>
                    <span className="text-sm text-white font-medium">{transfer.total_items ?? 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--color-gray-500)] uppercase tracking-wider">Total Value:</span>
                    <span className="text-sm text-white font-medium">Rp{(transfer.total_value ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-sm">
                  <button
                    type="button"
                    className="btn btn-secondary py-2 px-4 text-sm"
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
