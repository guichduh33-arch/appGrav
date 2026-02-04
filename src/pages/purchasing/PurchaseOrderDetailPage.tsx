import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Edit2,
  DollarSign,
  RotateCcw,
  FileText,
  Send,
  CheckCircle,
  Package,
  XCircle,
  CreditCard,
  Undo2,
  Plus,
  WifiOff,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/helpers'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import {
  usePurchaseOrder,
  useSendToSupplier,
  useConfirmOrder,
  useCancelOrder,
  useReceivePOItem,
  getValidTransitions,
  canReceiveItems,
  TPOStatus,
} from '@/hooks/purchasing'
import PinVerificationModal from '@/components/pos/modals/PinVerificationModal'
import { toast } from 'sonner'
import './PurchaseOrderDetailPage.css'

// ============================================================================
// TYPES
// ============================================================================

interface IPOItem {
  id: string
  product_name: string
  description: string | null
  quantity: number
  unit_price: number
  discount_amount: number
  tax_rate: number
  line_total: number
  quantity_received: number
  quantity_returned: number
}

interface IPOHistoryMetadata {
  items_added?: Array<{ name: string; quantity: number; unit_price: number }>
  items_removed?: Array<{ name: string; quantity: number }>
  items_modified?: Array<{ name: string; field: string; old_value: string; new_value: string }>
  quantity_received?: number
  product_name?: string
  return_quantity?: number
  return_reason?: string
  payment_amount?: number
  payment_method?: string
  old_total?: number
  new_total?: number
  [key: string]: unknown
}

interface IPOHistory {
  id: string
  action_type: string
  previous_status: string | null
  new_status: string | null
  description: string
  metadata: IPOHistoryMetadata | null
  changed_by_name?: string
  created_at: string
}

interface IPOReturn {
  id: string
  purchase_order_item_id: string
  item?: { product_name: string }
  quantity_returned: number
  reason: string
  reason_details: string | null
  return_date: string
  refund_amount: number | null
  status: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { isOnline } = useNetworkStatus()

  // State
  const [items, setItems] = useState<IPOItem[]>([])
  const [history, setHistory] = useState<IPOHistory[]>([])
  const [returns, setReturns] = useState<IPOReturn[]>([])
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IPOItem | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [returnForm, setReturnForm] = useState({
    quantity: 0,
    reason: 'damaged' as string,
    reason_details: '',
    refund_amount: 0,
  })

  // React Query hooks
  const { data: purchaseOrder, isLoading, error } = usePurchaseOrder(id || null)
  const sendToSupplierMutation = useSendToSupplier()
  const confirmOrderMutation = useConfirmOrder()
  const cancelOrderMutation = useCancelOrder()
  const receivePOItemMutation = useReceivePOItem()

  // Fetch additional data (items, history, returns)
  useEffect(() => {
    if (id) {
      fetchAdditionalData()
    }
  }, [id, purchaseOrder])

  const fetchAdditionalData = async () => {
    if (!id) return

    try {
      // Fetch Items
      const { data: poItems, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*, product:products(name)')
        .eq('purchase_order_id', id)

      if (itemsError) throw itemsError
      if (poItems) {
        const mappedItems: IPOItem[] = (poItems as unknown[]).map((item: unknown) => {
          const i = item as Record<string, unknown>
          const product = i.product as { name?: string } | null
          return {
            id: i.id as string,
            product_name: product?.name || (i.product_name as string) || 'Unknown',
            description: (i.description as string) || (i.notes as string) || null,
            quantity: i.quantity as number,
            unit_price: i.unit_price as number,
            discount_amount: (i.discount_amount as number) || 0,
            tax_rate: (i.tax_rate as number) || 0,
            line_total: i.line_total as number,
            quantity_received: (i.quantity_received as number) || 0,
            quantity_returned: (i.quantity_returned as number) || 0,
          }
        })
        setItems(mappedItems)
      }

      // Fetch History
      const { data: poHistory, error: historyError } = await supabase
        .from('purchase_order_history')
        .select('*')
        .eq('purchase_order_id', id)
        .order('created_at', { ascending: false })

      if (historyError) throw historyError
      if (poHistory) {
        const mappedHistory: IPOHistory[] = (poHistory as unknown[]).map((h: unknown) => {
          const hist = h as Record<string, unknown>
          return {
            id: hist.id as string,
            action_type: hist.action_type as string,
            previous_status: (hist.previous_status as string) || null,
            new_status: (hist.new_status as string) || null,
            description: (hist.description as string) || (hist.action_type as string),
            metadata: (hist.metadata as IPOHistoryMetadata) || null,
            changed_by_name: undefined,
            created_at: hist.created_at as string,
          }
        })
        setHistory(mappedHistory)
      }

      // Fetch Returns
      const { data: poReturns, error: returnsError } = await supabase
        .from('purchase_order_returns')
        .select('*, item:purchase_order_items(product_name)')
        .eq('purchase_order_id', id)
        .order('return_date', { ascending: false })

      if (returnsError) throw returnsError
      if (poReturns) {
        const mappedReturns: IPOReturn[] = (poReturns as unknown[]).map((r: unknown) => {
          const ret = r as Record<string, unknown>
          const item = ret.item as { product_name?: string } | null
          return {
            id: ret.id as string,
            purchase_order_item_id: ret.purchase_order_item_id as string,
            item: { product_name: item?.product_name || 'Unknown' },
            quantity_returned: ret.quantity_returned as number,
            reason: ret.reason as string,
            reason_details: (ret.reason_details as string) || null,
            return_date: ret.return_date as string,
            refund_amount: (ret.refund_amount as number) || null,
            status: ret.status as string,
          }
        })
        setReturns(mappedReturns)
      }
    } catch (err) {
      console.error('Error fetching additional data:', err)
    }
  }

  // ============================================================================
  // WORKFLOW ACTIONS
  // ============================================================================

  const handleSendToSupplier = async () => {
    if (!id || !isOnline) return

    try {
      await sendToSupplierMutation.mutateAsync(id)
      toast.success(t('purchasing.workflow.success.sent'))
      fetchAdditionalData()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_TRANSITION') {
        toast.error(t('purchasing.workflow.invalidTransition'))
      } else {
        toast.error(t('purchasing.workflow.error.sent'))
      }
    }
  }

  const handleConfirmOrder = async () => {
    if (!id || !isOnline) return

    try {
      await confirmOrderMutation.mutateAsync(id)
      toast.success(t('purchasing.workflow.success.confirmed'))
      fetchAdditionalData()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_TRANSITION') {
        toast.error(t('purchasing.workflow.invalidTransition'))
      } else {
        toast.error(t('purchasing.workflow.error.confirmed'))
      }
    }
  }

  const handleCancelOrder = async () => {
    if (!id || !isOnline) return

    try {
      await cancelOrderMutation.mutateAsync({
        purchaseOrderId: id,
        reason: cancelReason || undefined,
      })
      toast.success(t('purchasing.workflow.success.cancelled'))
      setShowCancelModal(false)
      setCancelReason('')
      fetchAdditionalData()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_TRANSITION') {
        toast.error(t('purchasing.workflow.invalidTransition'))
      } else {
        toast.error(t('purchasing.workflow.error.cancelled'))
      }
    }
  }

  // ============================================================================
  // OTHER ACTIONS
  // ============================================================================

  const handleMarkAsPaid = async () => {
    if (!purchaseOrder || !isOnline) return

    try {
      const paymentDate = new Date().toISOString()

      const { error } = await supabase
        .from('purchase_orders')
        .update({
          payment_status: 'paid',
          payment_date: paymentDate,
        } as never)
        .eq('id', id!)

      if (error) throw error

      await supabase.from('purchase_order_history').insert({
        purchase_order_id: id!,
        action_type: 'payment_made',
        previous_status: purchaseOrder.payment_status,
        new_status: 'paid',
        description: `Paiement complet effectué - ${formatCurrency(purchaseOrder.total_amount)}`,
        metadata: {
          payment_amount: purchaseOrder.total_amount,
          previous_payment_status: purchaseOrder.payment_status,
          payment_date: paymentDate,
        },
      } as never)

      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] })
      fetchAdditionalData()
      toast.success(t('purchasing.orders.updateSuccess'))
    } catch (err) {
      console.error('Error updating payment status:', err)
      toast.error(t('purchasing.orders.updateError'))
    }
  }

  const handleReceiveItem = async (itemId: string, quantityReceived: number) => {
    if (!isOnline || !id) return

    // Validate PO status before attempting reception
    if (!purchaseOrder || !canReceiveItems(purchaseOrder.status as TPOStatus)) {
      toast.error(t('purchasing.reception.invalidStatus'))
      return
    }

    try {
      const result = await receivePOItemMutation.mutateAsync({
        purchaseOrderId: id,
        itemId,
        quantityReceived,
      })

      // Show appropriate success message based on new status
      if (result.newPOStatus === 'received') {
        toast.success(t('purchasing.reception.allReceived'))
      } else if (result.delta !== 0) {
        toast.success(t('purchasing.reception.success'))
      }

      fetchAdditionalData()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_PO_STATUS') {
        toast.error(t('purchasing.reception.invalidStatus'))
      } else {
        console.error('Error receiving item:', err)
        toast.error(t('purchasing.reception.error'))
      }
    }
  }

  const handleOpenReturnModal = (item: IPOItem) => {
    setSelectedItem(item)
    setReturnForm({
      quantity: 0,
      reason: 'damaged',
      reason_details: '',
      refund_amount: 0,
    })
    setShowReturnModal(true)
  }

  const handleSubmitReturn = async () => {
    if (!selectedItem || returnForm.quantity <= 0) {
      toast.error(t('purchasing.detail.returnModal.invalidQuantity'))
      return
    }

    try {
      await supabase.from('purchase_order_returns').insert({
        purchase_order_id: id!,
        purchase_order_item_id: selectedItem.id,
        quantity_returned: returnForm.quantity,
        reason: returnForm.reason || 'other',
        reason_details: returnForm.reason_details || null,
        refund_amount: returnForm.refund_amount || null,
        return_date: new Date().toISOString(),
      } as never)

      await supabase.from('purchase_order_history').insert({
        purchase_order_id: id!,
        action_type: 'item_returned',
        description: `Retour de ${returnForm.quantity} unité(s) de ${selectedItem.product_name}`,
        metadata: {
          product_name: selectedItem.product_name,
          return_quantity: returnForm.quantity,
          return_reason: returnForm.reason,
          return_reason_details: returnForm.reason_details || null,
          refund_amount: returnForm.refund_amount || null,
        },
      } as never)

      const newTotalReturned =
        parseFloat(selectedItem.quantity_returned.toString()) + returnForm.quantity
      await supabase
        .from('purchase_order_items')
        .update({ quantity_returned: newTotalReturned } as never)
        .eq('id', selectedItem.id)

      fetchAdditionalData()
      setShowReturnModal(false)
      toast.success(t('purchasing.orders.updateSuccess'))
    } catch (err) {
      console.error('Error submitting return:', err)
      toast.error(t('purchasing.orders.updateError'))
    }
  }

  const requiresPinToEdit =
    purchaseOrder?.status === 'received' || purchaseOrder?.status === 'partially_received'

  const handleEditClick = () => {
    if (requiresPinToEdit) {
      setShowPinModal(true)
    } else {
      navigate(`/purchasing/purchase-orders/${id}/edit`)
    }
  }

  const handlePinVerify = (verified: boolean) => {
    setShowPinModal(false)
    if (verified) {
      navigate(`/purchasing/purchase-orders/${id}/edit`)
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getStatusLabel = (status: string): string => {
    return t(`purchasing.orders.status.${status}`, status)
  }

  const getReturnReasonLabel = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      damaged: t('purchasing.detail.returnModal.reasonDamaged'),
      wrong_item: t('purchasing.detail.returnModal.reasonWrongItem'),
      quality_issue: t('purchasing.detail.returnModal.reasonQualityIssue'),
      excess_quantity: t('purchasing.detail.returnModal.reasonExcessQuantity'),
      other: t('purchasing.detail.returnModal.reasonOther'),
    }
    return reasonMap[reason] || reason
  }

  const getPaymentStatusLabel = (status: string): string => {
    return t(`purchasing.orders.payment.${status}`, status)
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return <Plus size={16} />
      case 'sent':
        return <Send size={16} />
      case 'confirmed':
        return <CheckCircle size={16} />
      case 'received':
      case 'partially_received':
        return <Package size={16} />
      case 'cancelled':
        return <XCircle size={16} />
      case 'payment_made':
        return <CreditCard size={16} />
      case 'item_returned':
        return <Undo2 size={16} />
      case 'modified':
        return <Edit2 size={16} />
      default:
        return <FileText size={16} />
    }
  }

  const getActionColor = (actionType: string): string => {
    switch (actionType) {
      case 'created':
      case 'sent':
      case 'modified':
        return 'history-icon--info'
      case 'confirmed':
      case 'partially_received':
        return 'history-icon--warning'
      case 'received':
      case 'payment_made':
        return 'history-icon--success'
      case 'cancelled':
      case 'item_returned':
        return 'history-icon--danger'
      default:
        return ''
    }
  }

  const getActionLabel = (actionType: string): string => {
    const labelMap: Record<string, string> = {
      created: t('purchasing.detail.history.created'),
      sent: t('purchasing.detail.history.sent'),
      confirmed: t('purchasing.detail.history.confirmed'),
      received: t('purchasing.detail.history.received'),
      partially_received: t('purchasing.detail.history.partiallyReceived'),
      cancelled: t('purchasing.detail.history.cancelled'),
      payment_made: t('purchasing.detail.history.paymentMade'),
      item_returned: t('purchasing.detail.history.itemReturned'),
      modified: t('purchasing.detail.history.modified'),
    }
    return labelMap[actionType] || actionType
  }

  // Get valid workflow actions for current status
  const validActions = purchaseOrder
    ? getValidTransitions(purchaseOrder.status as TPOStatus)
    : []

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return <div className="po-detail-loading">{t('purchasing.detail.loading')}</div>
  }

  if (error || !purchaseOrder) {
    return <div className="po-detail-error">{t('purchasing.detail.notFound')}</div>
  }

  return (
    <div className="po-detail-page">
      {/* Offline Warning Banner */}
      {!isOnline && (
        <div className="po-offline-banner">
          <WifiOff size={20} />
          <span>{t('purchasing.workflow.offlineWarning')}</span>
        </div>
      )}

      {/* Header */}
      <div className="po-detail-page__header">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/purchasing/purchase-orders')}
        >
          <ArrowLeft size={20} />
          {t('purchasing.detail.back')}
        </button>
        <div className="po-detail-page__title-section">
          <h1 className="po-detail-page__title">{purchaseOrder.po_number}</h1>
          <span className={`status-badge status-badge--${purchaseOrder.status}`}>
            {getStatusLabel(purchaseOrder.status)}
          </span>
        </div>
        <div className="po-detail-page__actions">
          {/* Workflow Action Buttons */}
          {validActions.includes('send') && (
            <button
              className="btn btn-primary"
              onClick={handleSendToSupplier}
              disabled={!isOnline || sendToSupplierMutation.isPending}
            >
              <Send size={18} />
              {t('purchasing.workflow.sendToSupplier')}
            </button>
          )}
          {validActions.includes('confirm') && (
            <button
              className="btn btn-success"
              onClick={handleConfirmOrder}
              disabled={!isOnline || confirmOrderMutation.isPending}
            >
              <CheckCircle size={18} />
              {t('purchasing.workflow.confirmOrder')}
            </button>
          )}
          {validActions.includes('cancel') && (
            <button
              className="btn btn-danger"
              onClick={() => setShowCancelModal(true)}
              disabled={!isOnline}
            >
              <XCircle size={18} />
              {t('purchasing.workflow.cancelOrder')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleEditClick} disabled={!isOnline}>
            <Edit2 size={20} />
            {t('purchasing.detail.edit')}
          </button>
        </div>
      </div>

      <div className="po-detail-page__content">
        {/* Main Content */}
        <div className="po-detail-page__main">
          {/* PO Info */}
          <div className="po-detail-card">
            <h2>{t('purchasing.detail.orderInfo')}</h2>
            <div className="po-detail-grid">
              <div className="po-detail-field">
                <label>{t('purchasing.detail.supplier')}</label>
                <div className="po-detail-value">
                  <strong>{purchaseOrder.supplier?.name}</strong>
                </div>
              </div>
              <div className="po-detail-field">
                <label>{t('purchasing.detail.orderDate')}</label>
                <div className="po-detail-value">
                  {new Date(purchaseOrder.order_date).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="po-detail-field">
                <label>{t('purchasing.detail.expectedDelivery')}</label>
                <div className="po-detail-value">
                  {purchaseOrder.expected_delivery_date
                    ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('fr-FR')
                    : '-'}
                </div>
              </div>
              <div className="po-detail-field">
                <label>{t('purchasing.detail.actualDelivery')}</label>
                <div className="po-detail-value">
                  {purchaseOrder.actual_delivery_date
                    ? new Date(purchaseOrder.actual_delivery_date).toLocaleDateString('fr-FR')
                    : '-'}
                </div>
              </div>
              {purchaseOrder.notes && (
                <div className="po-detail-field po-detail-field--full">
                  <label>{t('purchasing.detail.notes')}</label>
                  <div className="po-detail-value">{purchaseOrder.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="po-detail-card">
            <h2>{t('purchasing.detail.items')}</h2>
            <div className="po-items-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('purchasing.detail.product')}</th>
                    <th>{t('purchasing.detail.quantity')}</th>
                    <th>{t('purchasing.detail.unitPrice')}</th>
                    <th>{t('purchasing.detail.discount')}</th>
                    <th>{t('purchasing.detail.tax')}</th>
                    <th>{t('purchasing.detail.total')}</th>
                    <th>{t('purchasing.detail.received')}</th>
                    <th>{t('purchasing.detail.returned')}</th>
                    <th>{t('purchasing.detail.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.product_name}</strong>
                        {item.description && <div className="po-item-desc">{item.description}</div>}
                      </td>
                      <td>{parseFloat(item.quantity.toString()).toFixed(2)}</td>
                      <td>{formatCurrency(parseFloat(item.unit_price.toString()))}</td>
                      <td>{formatCurrency(parseFloat(item.discount_amount.toString()))}</td>
                      <td>{parseFloat(item.tax_rate.toString())}%</td>
                      <td>
                        <strong>{formatCurrency(parseFloat(item.line_total.toString()))}</strong>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={parseFloat(item.quantity.toString())}
                          step="0.01"
                          key={`receive-${item.id}-${item.quantity_received}`}
                          defaultValue={parseFloat(item.quantity_received.toString())}
                          onBlur={(e) => {
                            const newValue = parseFloat(e.target.value) || 0
                            const currentValue = parseFloat(item.quantity_received.toString())
                            if (newValue !== currentValue) {
                              handleReceiveItem(item.id, newValue)
                            }
                          }}
                          className="po-receive-input"
                          disabled={
                            !isOnline ||
                            !canReceiveItems(purchaseOrder?.status as TPOStatus) ||
                            receivePOItemMutation.isPending
                          }
                        />
                      </td>
                      <td>{parseFloat(item.quantity_returned.toString()).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleOpenReturnModal(item)}
                          disabled={parseFloat(item.quantity_received.toString()) === 0 || !isOnline}
                        >
                          <RotateCcw size={14} />
                          {t('purchasing.detail.returnItem')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returns */}
          {returns.length > 0 && (
            <div className="po-detail-card">
              <h2>{t('purchasing.detail.returnsTitle')}</h2>
              <div className="po-returns-list">
                {returns.map((ret) => (
                  <div key={ret.id} className="po-return-item">
                    <div className="po-return-item__header">
                      <span className="po-return-item__product">{ret.item?.product_name}</span>
                      <span className={`status-badge status-badge--${ret.status}`}>
                        {ret.status}
                      </span>
                    </div>
                    <div className="po-return-item__body">
                      <div>
                        {t('purchasing.detail.quantity')}:{' '}
                        <strong>{parseFloat(ret.quantity_returned.toString())}</strong>
                      </div>
                      <div>
                        {t('purchasing.detail.returnModal.reasonLabel')}:{' '}
                        <strong>{getReturnReasonLabel(ret.reason)}</strong>
                      </div>
                      {ret.reason_details && <div>{ret.reason_details}</div>}
                      {ret.refund_amount && (
                        <div>
                          {t('purchasing.detail.returnModal.refundLabel')}:{' '}
                          <strong>{formatCurrency(parseFloat(ret.refund_amount.toString()))}</strong>
                        </div>
                      )}
                      <div className="po-return-item__date">
                        {new Date(ret.return_date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="po-detail-card">
            <h2>{t('purchasing.detail.historyTitle')}</h2>
            <div className="po-history-timeline">
              {history.map((entry) => (
                <div key={entry.id} className="po-history-item">
                  <div className={`po-history-item__icon ${getActionColor(entry.action_type)}`}>
                    {getActionIcon(entry.action_type)}
                  </div>
                  <div className="po-history-item__content">
                    <div className="po-history-item__header">
                      <span className="po-history-item__action">
                        {getActionLabel(entry.action_type)}
                      </span>
                      {entry.previous_status && entry.new_status && (
                        <div className="po-history-item__status-change">
                          <span className={`status-badge status-badge--${entry.previous_status}`}>
                            {getStatusLabel(entry.previous_status)}
                          </span>
                          <span className="po-history-arrow">→</span>
                          <span className={`status-badge status-badge--${entry.new_status}`}>
                            {getStatusLabel(entry.new_status)}
                          </span>
                        </div>
                      )}
                    </div>

                    {entry.metadata && (
                      <div className="po-history-item__details">
                        {entry.metadata.items_added && entry.metadata.items_added.length > 0 && (
                          <div className="po-history-detail">
                            <span className="po-history-detail__label">
                              {t('purchasing.detail.history.itemsAdded')}:
                            </span>
                            <ul className="po-history-detail__list">
                              {entry.metadata.items_added.map((item, i) => (
                                <li key={i}>
                                  {item.quantity}x {item.name} @ {formatCurrency(item.unit_price)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {entry.metadata.items_removed && entry.metadata.items_removed.length > 0 && (
                          <div className="po-history-detail">
                            <span className="po-history-detail__label">
                              {t('purchasing.detail.history.itemsRemoved')}:
                            </span>
                            <ul className="po-history-detail__list">
                              {entry.metadata.items_removed.map((item, i) => (
                                <li key={i}>
                                  {item.quantity}x {item.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {entry.metadata.items_modified &&
                          entry.metadata.items_modified.length > 0 && (
                            <div className="po-history-detail">
                              <span className="po-history-detail__label">
                                {t('purchasing.detail.history.modifications')}:
                              </span>
                              <ul className="po-history-detail__list">
                                {entry.metadata.items_modified.map((item, i) => (
                                  <li key={i}>
                                    {item.name}: {item.field} {item.old_value} → {item.new_value}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {entry.metadata.quantity_received && entry.metadata.product_name && (
                          <div className="po-history-detail">
                            <span className="po-history-detail__label">
                              {t('purchasing.detail.history.reception')}:
                            </span>
                            <span>
                              {entry.metadata.quantity_received} {entry.metadata.product_name}
                            </span>
                          </div>
                        )}
                        {entry.metadata.return_quantity && entry.metadata.product_name && (
                          <div className="po-history-detail">
                            <span className="po-history-detail__label">
                              {t('purchasing.detail.history.return')}:
                            </span>
                            <span>
                              {entry.metadata.return_quantity} {entry.metadata.product_name}
                              {entry.metadata.return_reason && (
                                <span className="po-history-detail__reason">
                                  ({getReturnReasonLabel(entry.metadata.return_reason)})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {entry.metadata.payment_amount && (
                          <div className="po-history-detail">
                            <span className="po-history-detail__label">
                              {t('purchasing.detail.history.amount')}:
                            </span>
                            <span>{formatCurrency(entry.metadata.payment_amount)}</span>
                            {entry.metadata.payment_method && (
                              <span className="po-history-detail__method">
                                ({entry.metadata.payment_method})
                              </span>
                            )}
                          </div>
                        )}
                        {entry.metadata.old_total !== undefined &&
                          entry.metadata.new_total !== undefined && (
                            <div className="po-history-detail">
                              <span className="po-history-detail__label">
                                {t('purchasing.detail.history.totalChange')}:
                              </span>
                              <span>
                                {formatCurrency(entry.metadata.old_total)} →{' '}
                                {formatCurrency(entry.metadata.new_total)}
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    <div className="po-history-item__footer">
                      <span className="po-history-item__date">
                        {new Date(entry.created_at).toLocaleString('fr-FR')}
                      </span>
                      {entry.changed_by_name && (
                        <span className="po-history-item__user">par {entry.changed_by_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="po-detail-page__sidebar">
          {/* Summary */}
          <div className="po-detail-card">
            <h3>{t('purchasing.detail.summaryTitle')}</h3>
            <div className="po-summary-line">
              <span>{t('purchasing.detail.subtotal')}</span>
              <span>{formatCurrency(parseFloat(purchaseOrder.subtotal.toString()))}</span>
            </div>
            {parseFloat(purchaseOrder.discount_amount.toString()) > 0 && (
              <div className="po-summary-line po-summary-line--discount">
                <span>{t('purchasing.detail.discountAmount')}</span>
                <span>-{formatCurrency(parseFloat(purchaseOrder.discount_amount.toString()))}</span>
              </div>
            )}
            <div className="po-summary-line">
              <span>{t('purchasing.detail.taxAmount')}</span>
              <span>{formatCurrency(parseFloat(purchaseOrder.tax_amount.toString()))}</span>
            </div>
            <div className="po-summary-divider"></div>
            <div className="po-summary-total">
              <span>{t('purchasing.detail.totalAmount')}</span>
              <span>{formatCurrency(parseFloat(purchaseOrder.total_amount.toString()))}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="po-detail-card">
            <h3>{t('purchasing.detail.paymentStatusTitle')}</h3>
            <div className="po-payment-status">
              <span className={`status-badge status-badge--${purchaseOrder.payment_status}`}>
                {getPaymentStatusLabel(purchaseOrder.payment_status)}
              </span>
              {purchaseOrder.payment_date && (
                <div className="po-payment-date">
                  {t('purchasing.detail.paidOn')}{' '}
                  {new Date(purchaseOrder.payment_date).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
            {purchaseOrder.payment_status !== 'paid' && (
              <button
                className="btn btn-success btn-block"
                onClick={handleMarkAsPaid}
                disabled={!isOnline}
                style={{ marginTop: 'var(--space-md)' }}
              >
                <DollarSign size={18} />
                {t('purchasing.detail.markAsPaid')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedItem && (
        <div className="modal-backdrop is-active" onClick={() => setShowReturnModal(false)}>
          <div className="modal is-active" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{t('purchasing.detail.returnModal.title')}</h2>
              <p className="modal__subtitle">{selectedItem.product_name}</p>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>{t('purchasing.detail.returnModal.quantityLabel')} *</label>
                <input
                  type="number"
                  min="0"
                  max={
                    parseFloat(selectedItem.quantity_received.toString()) -
                    parseFloat(selectedItem.quantity_returned.toString())
                  }
                  step="0.01"
                  value={returnForm.quantity}
                  onChange={(e) =>
                    setReturnForm({ ...returnForm, quantity: parseFloat(e.target.value) || 0 })
                  }
                />
                <small>
                  {t('purchasing.detail.returnModal.quantityMax')}:{' '}
                  {(
                    parseFloat(selectedItem.quantity_received.toString()) -
                    parseFloat(selectedItem.quantity_returned.toString())
                  ).toFixed(2)}
                </small>
              </div>
              <div className="form-group">
                <label>{t('purchasing.detail.returnModal.reasonLabel')} *</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                >
                  <option value="damaged">{t('purchasing.detail.returnModal.reasonDamaged')}</option>
                  <option value="wrong_item">
                    {t('purchasing.detail.returnModal.reasonWrongItem')}
                  </option>
                  <option value="quality_issue">
                    {t('purchasing.detail.returnModal.reasonQualityIssue')}
                  </option>
                  <option value="excess_quantity">
                    {t('purchasing.detail.returnModal.reasonExcessQuantity')}
                  </option>
                  <option value="other">{t('purchasing.detail.returnModal.reasonOther')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('purchasing.detail.returnModal.detailsLabel')}</label>
                <textarea
                  rows={3}
                  value={returnForm.reason_details}
                  onChange={(e) => setReturnForm({ ...returnForm, reason_details: e.target.value })}
                  placeholder={t('purchasing.detail.returnModal.detailsPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('purchasing.detail.returnModal.refundLabel')}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={returnForm.refund_amount}
                  onChange={(e) =>
                    setReturnForm({ ...returnForm, refund_amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                {t('purchasing.detail.returnModal.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSubmitReturn}>
                {t('purchasing.detail.returnModal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-backdrop is-active" onClick={() => setShowCancelModal(false)}>
          <div className="modal is-active" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{t('purchasing.workflow.cancelConfirmTitle')}</h2>
            </div>
            <div className="modal__body">
              <p>{t('purchasing.workflow.cancelConfirmMessage')}</p>
              <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                <label>{t('purchasing.workflow.cancelReasonLabel')}</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={t('purchasing.workflow.cancelReasonPlaceholder')}
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                {t('purchasing.detail.returnModal.cancel')}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
              >
                {t('purchasing.workflow.cancelOrder')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      {showPinModal && (
        <PinVerificationModal
          title={t('purchasing.detail.pinModal.title')}
          message={t('purchasing.detail.pinModal.message')}
          onVerify={handlePinVerify}
          onClose={() => setShowPinModal(false)}
          allowedRoles={['manager', 'admin']}
        />
      )}
    </div>
  )
}
