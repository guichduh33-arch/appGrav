import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, CheckCircle, Clock, Package, AlertTriangle, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { useTransfer, useReceiveTransfer } from '@/hooks/inventory'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import './TransferDetailPage.css'

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
    } catch (err: any) {
      console.error('Reception error:', err)
      const message = err?.message || 'Error receiving transfer'
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
      <div className="transfer-detail-page">
        <div className="transfer-detail-loading">Loading...</div>
      </div>
    )
  }

  // Not found state
  if (!transfer) {
    return (
      <div className="transfer-detail-page">
        <div className="transfer-detail-error">
          <AlertTriangle size={48} />
          <h3>Error</h3>
          <p>Transfer not found</p>
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
    <div className="transfer-detail-page">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <WifiOff size={18} />
          <span>Reception is blocked while offline</span>
        </div>
      )}

      {/* Header */}
      <header className="transfer-detail-header">
        <div className="transfer-detail-header__left">
          <button className="btn btn-ghost" onClick={() => navigate('/inventory/transfers')}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="transfer-detail-header__info">
            <h1 className="transfer-detail-title">
              <ArrowRightLeft size={28} />
              {transfer.transfer_number}
            </h1>
            <span
              className="transfer-detail-status"
              style={{ background: `${statusColor}20`, color: statusColor }}
            >
              {isReceived ? <CheckCircle size={14} /> : <Clock size={14} />}
              {getStatusLabel(transfer.status ?? 'draft')}
            </span>
          </div>
        </div>
      </header>

      {/* Route Information */}
      <div className="transfer-detail-route">
        <div className="route-location from">
          <span className="route-label">From</span>
          <span className="route-name">
            {transfer.from_section?.icon && `${transfer.from_section.icon} `}
            {transfer.from_section?.name ?? transfer.from_location?.name ?? 'Unknown'}
          </span>
        </div>
        <ArrowRightLeft size={32} className="route-arrow" />
        <div className="route-location to">
          <span className="route-label">To</span>
          <span className="route-name">
            {transfer.to_section?.icon && `${transfer.to_section.icon} `}
            {transfer.to_section?.name ?? transfer.to_location?.name ?? 'Unknown'}
          </span>
        </div>
      </div>

      {/* Transfer Info */}
      <div className="transfer-detail-info">
        <div className="info-item">
          <span className="info-label">Date</span>
          <span className="info-value">
            {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US') : '-'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Responsible</span>
          <span className="info-value">{transfer.responsible_person}</span>
        </div>
        {isReceived && transfer.approved_at && (
          <div className="info-item">
            <span className="info-label">Received On</span>
            <span className="info-value">
              {new Date(transfer.approved_at).toLocaleDateString('en-US')}
            </span>
          </div>
        )}
      </div>

      {/* Already Received Notice */}
      {isReceived && (
        <div className="already-received-notice">
          <CheckCircle size={20} />
          <span>This transfer has already been received</span>
        </div>
      )}

      {/* Variance Warning */}
      {hasVariances && !isReceived && (
        <div className="variance-warning">
          <AlertTriangle size={20} />
          <span>There are variances between requested and received quantities</span>
        </div>
      )}

      {/* Items Table */}
      <div className="transfer-detail-items">
        <h2 className="items-title">
          <Package size={20} />
          Items ({transfer.items.length})
        </h2>

        <div className="items-table-wrapper">
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-center">Qty Requested</th>
                <th className="text-center">Qty Received</th>
                <th className="text-center">Variance</th>
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
                  <tr key={item.id} className={hasError ? 'has-error' : ''}>
                    <td>
                      <div className="product-cell">
                        <span className="product-name">{item.product?.name ?? 'Unknown'}</span>
                        {item.product?.sku && (
                          <span className="product-sku">{item.product.sku}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="quantity-requested">{item.quantity_requested}</span>
                    </td>
                    <td className="text-center">
                      {isReceived ? (
                        <span className="quantity-received">{item.quantity_received ?? 0}</span>
                      ) : (
                        <div className="quantity-input-wrapper">
                          <input
                            type="number"
                            className={`quantity-input ${hasError ? 'input-error' : ''}`}
                            value={quantityReceived ?? ''}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            min="0"
                            step="0.01"
                            disabled={!canReceive}
                          />
                          {hasError && (
                            <span className="error-message">{validationErrors.get(item.id)}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={`variance ${variance > 0 ? 'positive' : variance < 0 ? 'negative' : ''}`}>
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
        <div className="reception-notes-section">
          <label className="notes-label">
            Reception Notes
            {hasVariances && <span className="required">*</span>}
          </label>
          <textarea
            className="reception-notes-input"
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
        <div className="existing-notes-section">
          <label className="notes-label">Notes</label>
          <div className="existing-notes">{transfer.notes}</div>
        </div>
      )}

      {/* Actions */}
      {!isReceived && (
        <div className="transfer-detail-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/inventory/transfers')}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
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
