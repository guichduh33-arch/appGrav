import { ArrowRightLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

// Status colors
const STATUS_COLORS = {
  draft: '#6b7280',
  pending: '#f59e0b',
  in_transit: '#3b82f6',
  received: '#10b981',
  cancelled: '#ef4444'
} as const

interface TransferData {
  transfer_number?: string | null
  status?: string | null
  transfer_date?: string | null
  responsible_person?: string | null
  approved_at?: string | null
  from_section?: { icon?: string | null; name?: string | null } | null
  from_location?: { name?: string | null } | null
  to_section?: { icon?: string | null; name?: string | null } | null
  to_location?: { name?: string | null } | null
}

interface TransferInfoSectionProps {
  transfer: TransferData
  isReceived: boolean
  hasVariances: boolean
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft', pending: 'Pending', in_transit: 'In Transit',
    received: 'Received', cancelled: 'Cancelled',
  }
  return labels[status] || status
}

export function TransferInfoSection({ transfer, isReceived, hasVariances }: TransferInfoSectionProps) {
  const statusColor = STATUS_COLORS[transfer.status as keyof typeof STATUS_COLORS] ?? '#6b7280'

  return (
    <>
      {/* Title + Status */}
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-white m-0">
          <ArrowRightLeft size={24} className="text-[var(--color-gold)]" />
          {transfer.transfer_number}
        </h1>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit"
          style={{ background: `${statusColor}15`, color: statusColor }}
        >
          {isReceived ? <CheckCircle size={12} /> : <Clock size={12} />}
          {getStatusLabel(transfer.status ?? 'draft')}
        </span>
      </div>

      {/* Route Information */}
      <div className="flex items-center gap-6 p-4 bg-[var(--onyx-surface)] border border-white/5 rounded-xl mb-4 md:flex-col md:gap-4">
        <div className="flex-1 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">From</span>
          <span className="block text-base font-semibold text-[var(--color-gold)]">
            {transfer.from_section?.icon && `${transfer.from_section.icon} `}
            {transfer.from_section?.name ?? transfer.from_location?.name ?? 'Unknown'}
          </span>
        </div>
        <ArrowRightLeft size={28} className="text-white/10 shrink-0 md:rotate-90" />
        <div className="flex-1 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">To</span>
          <span className="block text-base font-semibold text-emerald-400">
            {transfer.to_section?.icon && `${transfer.to_section.icon} `}
            {transfer.to_section?.name ?? transfer.to_location?.name ?? 'Unknown'}
          </span>
        </div>
      </div>

      {/* Transfer Info */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] md:grid-cols-2 gap-4 p-4 bg-[var(--onyx-surface)] border border-white/5 rounded-xl mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Date</span>
          <span className="text-sm text-white font-medium">
            {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US') : '-'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Responsible</span>
          <span className="text-sm text-white font-medium">{transfer.responsible_person}</span>
        </div>
        {isReceived && transfer.approved_at && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Received On</span>
            <span className="text-sm text-white font-medium">
              {new Date(transfer.approved_at).toLocaleDateString('en-US')}
            </span>
          </div>
        )}
      </div>

      {/* Already Received Notice */}
      {isReceived && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 text-emerald-400 text-sm font-medium">
          <CheckCircle size={18} />
          <span>This transfer has already been received</span>
        </div>
      )}

      {/* Variance Warning */}
      {hasVariances && !isReceived && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4 text-amber-400 text-sm font-medium">
          <AlertTriangle size={18} />
          <span>There are variances between requested and received quantities</span>
        </div>
      )}
    </>
  )
}
