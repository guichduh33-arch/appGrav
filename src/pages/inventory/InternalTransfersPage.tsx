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
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-3 px-4 mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <WifiOff size={18} />
          <span className="text-sm font-medium">Transfers are not available offline</span>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white m-0 mb-1">
            <ArrowRightLeft size={24} className="text-[var(--color-gold)]" />
            Internal Transfers
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)] m-0">
            Manage transfers between warehouse and sections
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleNewTransfer}
          disabled={!isOnline}
          title={!isOnline ? 'Transfers are not available offline' : undefined}
        >
          <Plus size={18} />
          New Transfer
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-8">
        {[
          { value: stats.total, label: 'TOTAL', icon: ArrowRightLeft, accent: 'var(--color-gold)' },
          { value: stats.pending, label: 'PENDING', icon: Clock, accent: '#f59e0b' },
          { value: stats.received, label: 'COMPLETED', icon: CheckCircle, accent: '#10b981' },
          { value: `Rp${stats.totalValue.toLocaleString('id-ID')}`, label: 'TOTAL VALUE', icon: Filter, accent: '#8b5cf6' },
        ].map(({ value, label, icon: Icon, accent }) => (
          <div key={label} className="flex items-center gap-4 p-4 bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ background: `${accent}15`, color: accent }}
            >
              <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-white leading-none mb-1 truncate">{value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TTransferStatus | 'all')}
          className="py-2.5 px-4 bg-black/40 border border-white/10 rounded-xl text-white text-sm cursor-pointer focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
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
        <div className="flex items-center justify-center p-16 text-sm text-[var(--theme-text-muted)]">Loading...</div>
      ) : transfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[var(--onyx-surface)] border-2 border-dashed border-white/10 rounded-xl text-center">
          <ArrowRightLeft size={56} className="text-white/10 mb-4" />
          <h3 className="text-lg font-bold text-white m-0 mb-2">No transfers yet</h3>
          <p className="text-sm text-[var(--theme-text-muted)] m-0 mb-6">Create your first internal transfer to move stock between locations</p>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
            onClick={handleNewTransfer}
            disabled={!isOnline}
          >
            <Plus size={18} />
            New Transfer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] max-md:grid-cols-1 gap-4">
          {transfers.map(transfer => {
            const statusConfig = getStatusConfig(transfer.status ?? 'draft')
            const StatusIcon = statusConfig.icon

            return (
              <div key={transfer.id} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02]">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2 text-base font-bold text-white">
                    <ArrowRightLeft size={16} className="text-[var(--color-gold)]" />
                    {transfer.transfer_number}
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${statusConfig.color}15`,
                      color: statusConfig.color
                    }}
                  >
                    <StatusIcon size={12} />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4 p-3 bg-black/20 rounded-lg">
                  <div className="flex-1 text-center text-sm font-semibold text-[var(--color-gold)]">
                    {transfer.from_section?.icon} {transfer.from_section?.name ?? transfer.from_location?.name ?? 'Unknown'}
                  </div>
                  <ArrowRightLeft size={16} className="text-white/20 shrink-0" />
                  <div className="flex-1 text-center text-sm font-semibold text-emerald-400">
                    {transfer.to_section?.icon} {transfer.to_section?.name ?? transfer.to_location?.name ?? 'Unknown'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'DATE', value: transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US') : '-' },
                    { label: 'RESPONSIBLE', value: transfer.responsible_person },
                    { label: 'TOTAL ITEMS', value: transfer.total_items ?? 0 },
                    { label: 'TOTAL VALUE', value: `Rp${(transfer.total_value ?? 0).toLocaleString('id-ID')}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</span>
                      <span className="text-sm text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 w-full justify-center py-2 px-4 text-sm font-medium bg-transparent border border-white/10 text-white rounded-lg hover:border-white/20 hover:bg-white/[0.02] transition-all"
                  onClick={() => navigate(`/inventory/transfers/${transfer.id}`)}
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
