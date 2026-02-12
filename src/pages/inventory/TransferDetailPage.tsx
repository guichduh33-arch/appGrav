import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, CheckCircle, Clock, Package, AlertTriangle, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { useTransfer, useReceiveTransfer } from '@/hooks/inventory'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import { cn } from '@/lib/utils'

// Status colors
const STATUS_COLORS = {
  draft: '#6b7280',
  pending: '#f59e0b',
  in_transit: '#3b82f6',
  received: '#10b981',
  cancelled: '#ef4444'
} as const

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isOnline } = useNetworkStatus()

  const { data: transfer, isLoading, error } = useTransfer(id ?? null)
  const receiveTransferMutation = useReceiveTransfer()

  // State for editable quantities
  const [itemQuantities, setItemQuantities] = useState<Map<string, number>>(new Map())
  const [receptionNotes, setReceptionNotes] = useState('')
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map())

  // Initialize quantities from transfer items
  useEffect(() => {
    if (transfer?.items) {
      const initialQuantities = new Map<string, number>()
      transfer.items.forEach(item => {
        initialQuantities.set(item.id, item.quantity_requested)
      })
      setItemQuantities(initialQuantities)
    }
  }, [transfer])

  // Check if transfer can be received
  const canReceive = useMemo(() => {
    return isOnline
      && transfer
      && (transfer.status === 'pending' || transfer.status === 'in_transit')
  }, [isOnline, transfer])

  // Calculate variance for each item
  const getVariance = (itemId: string, quantityRequested: number): number => {
    const received = itemQuantities.get(itemId) ?? quantityRequested
    return received - quantityRequested
  }

  // Check if there are any variances
  const hasVariances = useMemo(() => {
    if (!transfer?.items) return false
    return transfer.items.some(item => {
      const variance = getVariance(item.id, item.quantity_requested)
      return variance !== 0
    })
  }, [transfer, itemQuantities])

  // Validate form
  const validateForm = (): boolean => {
    const errors = new Map<string, string>()

    if (!transfer?.items) return false

    for (const item of transfer.items) {
      const quantity = itemQuantities.get(item.id) ?? 0

      if (quantity < 0) {
        errors.set(item.id, 'Quantity cannot be negative')
      }

      if (quantity > item.quantity_requested && !receptionNotes.trim()) {
        errors.set(item.id, 'Receiving more than requested requires a note')
      }
    }

    setValidationErrors(errors)
    return errors.size === 0
  }

  // Handle quantity change
  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setItemQuantities(prev => new Map(prev).set(itemId, numValue))
    // Clear validation error for this item
    setValidationErrors(prev => {
      const newErrors = new Map(prev)
      newErrors.delete(itemId)
      return newErrors
    })
  }

  // Handle reception
  const handleReceive = async () => {
    if (!canReceive || !transfer) return

    if (!validateForm()) {
      toast.error('Please fix the errors before proceeding')
      return
    }

    const items = transfer.items.map(item => ({
      itemId: item.id,
      quantityReceived: itemQuantities.get(item.id) ?? item.quantity_requested
    }))

    try {
      await receiveTransferMutation.mutateAsync({
        transferId: transfer.id,
        items,
        receptionNotes: receptionNotes.trim() || undefined
      })
      toast.success('Transfer received successfully')
      navigate('/inventory/transfers')
    } catch (err) {
      console.error('Reception error:', err)
      const message = err instanceof Error ? err.message : 'Error receiving transfer'
      if (message.includes('already been received') || message.includes('another user')) {
        toast.error(message)
      } else {
        toast.error('Error receiving transfer. Please try again.')
      }
    }
  }

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error('Error loading transfer')
    }
  }, [error])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 md:p-4 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-center p-12 text-lg text-gray-400">Loading...</div>
      </div>
    )
  }

  // Not found state
  if (!transfer) {
    return (
      <div className="p-6 md:p-4 max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white m-0 mb-2">Error</h3>
          <p className="text-base text-gray-400 m-0 mb-6">Transfer not found</p>
          <button className="btn btn-primary" onClick={() => navigate('/inventory/transfers')}>
            Back
          </button>
        </div>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[transfer.status as keyof typeof STATUS_COLORS] ?? '#6b7280'
  const isReceived = transfer.status === 'received'

  // Get status label
  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      pending: 'Pending',
      in_transit: 'In Transit',
      received: 'Received',
      cancelled: 'Cancelled'
    }
    return statusLabels[status] || status
  }

  return (
    <div className="p-6 md:p-4 max-w-[1200px] mx-auto">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 mb-6 text-amber-700">
          <WifiOff size={18} />
          <span>Reception is blocked while offline</span>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-6 md:flex-col md:items-start md:gap-4">
          <button className="btn btn-ghost" onClick={() => navigate('/inventory/transfers')}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-4 text-2xl font-bold text-white m-0">
              <ArrowRightLeft size={28} />
              {transfer.transfer_number}
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit"
              style={{ background: `${statusColor}20`, color: statusColor }}
            >
              {isReceived ? <CheckCircle size={14} /> : <Clock size={14} />}
              {getStatusLabel(transfer.status ?? 'draft')}
            </span>
          </div>
        </div>
      </header>

      {/* Route Information */}
      <div className="flex items-center gap-6 p-4 bg-gray-800 border border-gray-700 rounded-lg mb-4 md:flex-col md:gap-4">
        <div className="flex-1 text-center">
          <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">From</span>
          <span className="block text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
            {transfer.from_section?.icon && `${transfer.from_section.icon} `}
            {transfer.from_section?.name ?? transfer.from_location?.name ?? 'Unknown'}
          </span>
        </div>
        <ArrowRightLeft size={32} className="text-gray-500 shrink-0 md:rotate-90" />
        <div className="flex-1 text-center">
          <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">To</span>
          <span className="block text-lg font-semibold text-emerald-500">
            {transfer.to_section?.icon && `${transfer.to_section.icon} `}
            {transfer.to_section?.name ?? transfer.to_location?.name ?? 'Unknown'}
          </span>
        </div>
      </div>

      {/* Transfer Info */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] md:grid-cols-2 gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Date</span>
          <span className="text-base text-white font-medium">
            {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US') : '-'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Responsible</span>
          <span className="text-base text-white font-medium">{transfer.responsible_person}</span>
        </div>
        {isReceived && transfer.approved_at && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Received On</span>
            <span className="text-base text-white font-medium">
              {new Date(transfer.approved_at).toLocaleDateString('en-US')}
            </span>
          </div>
        )}
      </div>

      {/* Already Received Notice */}
      {isReceived && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500 rounded-lg mb-4 text-emerald-500 font-medium">
          <CheckCircle size={20} />
          <span>This transfer has already been received</span>
        </div>
      )}

      {/* Variance Warning */}
      {hasVariances && !isReceived && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500 rounded-lg mb-4 text-amber-500 font-medium">
          <AlertTriangle size={20} />
          <span>There are variances between requested and received quantities</span>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg mb-4 overflow-hidden">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white p-4 m-0 border-b border-gray-700">
          <Package size={20} />
          Items ({transfer.items.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 md:px-3 md:py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-700/50 border-b border-gray-700">Product</th>
                <th className="px-4 py-3 md:px-3 md:py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-700/50 border-b border-gray-700">Qty Requested</th>
                <th className="px-4 py-3 md:px-3 md:py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-700/50 border-b border-gray-700">Qty Received</th>
                <th className="px-4 py-3 md:px-3 md:py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-700/50 border-b border-gray-700">Variance</th>
              </tr>
            </thead>
            <tbody>
              {transfer.items.map(item => {
                const quantityReceived = isReceived
                  ? item.quantity_received
                  : (itemQuantities.get(item.id) ?? item.quantity_requested)
                const variance = isReceived
                  ? (item.quantity_received ?? 0) - item.quantity_requested
                  : getVariance(item.id, item.quantity_requested)
                const hasError = validationErrors.has(item.id)

                return (
                  <tr key={item.id} className={hasError ? 'bg-red-500/5' : ''}>
                    <td className="px-4 py-3 md:px-3 md:py-2 border-b border-gray-700 align-middle last:border-b-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-white">{item.product?.name ?? 'Unknown'}</span>
                        {item.product?.sku && (
                          <span className="text-xs text-gray-500">{item.product.sku}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-3 md:py-2 border-b border-gray-700 align-middle text-center last:border-b-0">
                      <span className="text-sm text-gray-400">{item.quantity_requested}</span>
                    </td>
                    <td className="px-4 py-3 md:px-3 md:py-2 border-b border-gray-700 align-middle text-center last:border-b-0">
                      {isReceived ? (
                        <span className="text-sm text-white font-semibold">{item.quantity_received ?? 0}</span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            className={cn(
                              'w-20 md:w-[60px] px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm text-center',
                              'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                              'disabled:opacity-50 disabled:cursor-not-allowed',
                              hasError && 'border-red-500'
                            )}
                            value={quantityReceived ?? ''}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            min="0"
                            step="0.01"
                            disabled={!canReceive}
                          />
                          {hasError && (
                            <span className="text-xs text-red-500">{validationErrors.get(item.id)}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-3 md:py-2 border-b border-gray-700 align-middle text-center last:border-b-0">
                      <span className={cn(
                        'text-sm font-semibold text-gray-400',
                        variance > 0 && 'text-emerald-500',
                        variance < 0 && 'text-red-500'
                      )}>
                        {variance > 0 ? '+' : ''}{variance}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reception Notes */}
      {!isReceived && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Reception Notes
            {hasVariances && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            className={cn(
              'w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-inherit resize-y',
              'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            value={receptionNotes}
            onChange={(e) => setReceptionNotes(e.target.value)}
            placeholder="Add any notes about the reception..."
            rows={3}
            disabled={!canReceive}
          />
        </div>
      )}

      {/* Existing Notes */}
      {transfer.notes && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">Notes</label>
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm whitespace-pre-wrap">{transfer.notes}</div>
        </div>
      )}

      {/* Actions */}
      {!isReceived && (
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-700 md:flex-col-reverse">
          <button
            className="btn btn-secondary md:w-full"
            onClick={() => navigate('/inventory/transfers')}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary md:w-full"
            onClick={handleReceive}
            disabled={!canReceive || receiveTransferMutation.isPending}
          >
            <CheckCircle size={18} />
            {receiveTransferMutation.isPending
              ? 'Loading...'
              : 'Receive Transfer'
            }
          </button>
        </div>
      )}
    </div>
  )
}
