import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertTriangle, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { useTransfer, useReceiveTransfer } from '@/hooks/inventory'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'
import { TransferInfoSection } from './transfer-detail/TransferInfoSection'
import { TransferItemsTable } from './transfer-detail/TransferItemsTable'

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
      logError('Reception error:', err)
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
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-center p-16 text-sm text-[var(--theme-text-muted)]">Loading...</div>
      </div>
    )
  }

  // Not found state
  if (!transfer) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <AlertTriangle size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-white m-0 mb-2">Error</h3>
          <p className="text-sm text-[var(--theme-text-muted)] m-0 mb-6">Transfer not found</p>
          <button
            className="px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
            onClick={() => navigate('/inventory/transfers')}
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  const isReceived = transfer.status === 'received'

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 mb-6 text-amber-400 text-sm font-medium">
          <WifiOff size={18} />
          <span>Reception is blocked while offline</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--theme-text-secondary)] bg-transparent border border-white/10 rounded-lg hover:border-white/20 hover:text-white transition-all"
          onClick={() => navigate('/inventory/transfers')}
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </header>

      {/* Transfer Info + Route + Status */}
      <TransferInfoSection
        transfer={transfer}
        isReceived={isReceived}
        hasVariances={hasVariances}
      />

      {/* Items Table */}
      <TransferItemsTable
        items={transfer.items}
        isReceived={isReceived}
        canReceive={!!canReceive}
        itemQuantities={itemQuantities}
        validationErrors={validationErrors}
        onQuantityChange={handleQuantityChange}
        getVariance={getVariance}
      />

      {/* Reception Notes */}
      {!isReceived && (
        <div className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">
            Reception Notes
            {hasVariances && <span className="text-red-400 ml-1">*</span>}
          </label>
          <textarea
            className={cn(
              'w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white text-sm resize-y',
              'focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20',
              'placeholder:text-[var(--theme-text-muted)]',
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
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">Notes</label>
          <div className="p-4 bg-[var(--onyx-surface)] border border-white/5 rounded-xl text-[var(--theme-text-secondary)] text-sm whitespace-pre-wrap">{transfer.notes}</div>
        </div>
      )}

      {/* Actions */}
      {!isReceived && (
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5 md:flex-col-reverse">
          <button
            className="px-5 py-2.5 bg-transparent border border-white/10 text-white text-sm font-medium rounded-xl hover:border-white/20 transition-all md:w-full"
            onClick={() => navigate('/inventory/transfers')}
          >
            Cancel
          </button>
          <button
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed md:w-full"
            onClick={handleReceive}
            disabled={!canReceive || receiveTransferMutation.isPending}
          >
            <CheckCircle size={16} />
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
