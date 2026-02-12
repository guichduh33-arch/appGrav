import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/helpers'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import {
  usePurchaseOrderDetail,
  useSendToSupplier,
  useConfirmOrder,
  useCancelOrder,
  useReceivePOItem,
  getValidTransitions,
  canReceiveItems,
  type TPOStatus,
} from '@/hooks/purchasing'
import {
  PODetailHeader,
  POInfoCard,
  POItemsTable,
  POReturnsSection,
  POHistoryTimeline,
  POSummarySidebar,
  POReturnModal,
  POCancelModal,
  type IPODetailItem,
  type IReturnFormState,
} from '@/components/purchasing'
import PinVerificationModal from '@/components/pos/modals/PinVerificationModal'
import { toast } from 'sonner'
import './PurchaseOrderDetailPage.css'

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { isOnline } = useNetworkStatus()

  // Modal states
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IPODetailItem | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [returnForm, setReturnForm] = useState<IReturnFormState>({
    quantity: 0,
    reason: 'damaged',
    reason_details: '',
    refund_amount: 0,
  })

  // Data hooks
  const { purchaseOrder, items, history, returns, isLoading, error, refetch } =
    usePurchaseOrderDetail(id || null)

  // Mutation hooks
  const sendToSupplierMutation = useSendToSupplier()
  const confirmOrderMutation = useConfirmOrder()
  const cancelOrderMutation = useCancelOrder()
  const receivePOItemMutation = useReceivePOItem()

  // Workflow actions
  const handleSendToSupplier = async () => {
    if (!id || !isOnline) return
    try {
      await sendToSupplierMutation.mutateAsync(id)
      toast.success('Purchase order sent to supplier')
      refetch()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_TRANSITION') {
        toast.error('Invalid status transition')
      } else {
        toast.error('Failed to send purchase order')
      }
    }
  }

  const handleConfirmOrder = async () => {
    if (!id || !isOnline) return
    try {
      await confirmOrderMutation.mutateAsync(id)
      toast.success('Purchase order confirmed')
      refetch()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_TRANSITION') {
        toast.error('Invalid status transition')
      } else {
        toast.error('Failed to confirm purchase order')
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
      toast.success('Purchase order cancelled')
      setShowCancelModal(false)
      setCancelReason('')
      refetch()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_TRANSITION') {
        toast.error('Invalid status transition')
      } else {
        toast.error('Failed to cancel purchase order')
      }
    }
  }

  // Payment action
  const handleMarkAsPaid = async () => {
    if (!purchaseOrder || !isOnline) return
    try {
      const paymentDate = new Date().toISOString()
      const { error } = await supabase
        .from('purchase_orders')
        .update({ payment_status: 'paid', payment_date: paymentDate } as never)
        .eq('id', id!)

      if (error) throw error

      await supabase.from('purchase_order_history').insert({
        purchase_order_id: id!,
        action_type: 'payment_made',
        previous_status: purchaseOrder.payment_status,
        new_status: 'paid',
        description: `Full payment made - ${formatCurrency(purchaseOrder.total_amount)}`,
        metadata: {
          payment_amount: purchaseOrder.total_amount,
          previous_payment_status: purchaseOrder.payment_status,
          payment_date: paymentDate,
        },
      } as never)

      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] })
      refetch()
      toast.success('Payment status updated')
    } catch (err) {
      logError('Error updating payment status:', err)
      toast.error('Failed to update payment status')
    }
  }

  // Item reception
  const handleReceiveItem = async (itemId: string, quantityReceived: number) => {
    if (!isOnline || !id) return
    if (!purchaseOrder || !canReceiveItems(purchaseOrder.status as TPOStatus)) {
      toast.error('Cannot receive items in this status')
      return
    }
    try {
      const result = await receivePOItemMutation.mutateAsync({
        purchaseOrderId: id,
        itemId,
        quantityReceived,
      })
      if (result.newPOStatus === 'received') {
        toast.success('All items received')
      } else if (result.delta !== 0) {
        toast.success('Item received successfully')
      }
      refetch()
    } catch (err) {
      const error = err as Error
      if (error.message === 'INVALID_PO_STATUS') {
        toast.error('Cannot receive items in this status')
      } else {
        logError('Error receiving item:', err)
        toast.error('Failed to receive item')
      }
    }
  }

  // Return handling
  const handleOpenReturnModal = (item: IPODetailItem) => {
    setSelectedItem(item)
    setReturnForm({ quantity: 0, reason: 'damaged', reason_details: '', refund_amount: 0 })
    setShowReturnModal(true)
  }

  const handleSubmitReturn = async () => {
    if (!selectedItem || returnForm.quantity <= 0) {
      toast.error('Please enter a valid quantity')
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
        description: `Returned ${returnForm.quantity} unit(s) of ${selectedItem.product_name}`,
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

      refetch()
      setShowReturnModal(false)
      toast.success('Return submitted successfully')
    } catch (err) {
      logError('Error submitting return:', err)
      toast.error('Failed to submit return')
    }
  }

  // Edit with PIN verification
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

  // Get valid workflow actions
  const validActions = purchaseOrder ? getValidTransitions(purchaseOrder.status as TPOStatus) : []

  // Loading / Error states
  if (isLoading) {
    return <div className="po-detail-loading">Loading...</div>
  }

  if (error || !purchaseOrder) {
    return <div className="po-detail-error">Purchase order not found</div>
  }

  return (
    <div className="po-detail-page">
      <PODetailHeader
        purchaseOrder={purchaseOrder}
        validActions={validActions}
        isOnline={isOnline}
        onBack={() => navigate('/purchasing/purchase-orders')}
        onEdit={handleEditClick}
        onSendToSupplier={handleSendToSupplier}
        onConfirmOrder={handleConfirmOrder}
        onCancelOrder={() => setShowCancelModal(true)}
        isSending={sendToSupplierMutation.isPending}
        isConfirming={confirmOrderMutation.isPending}
      />

      <div className="po-detail-page__content">
        <div className="po-detail-page__main">
          <POInfoCard purchaseOrder={purchaseOrder} />

          <POItemsTable
            items={items}
            purchaseOrder={purchaseOrder}
            isOnline={isOnline}
            isReceiving={receivePOItemMutation.isPending}
            onReceiveItem={handleReceiveItem}
            onOpenReturnModal={handleOpenReturnModal}
          />

          <POReturnsSection returns={returns} />

          <POHistoryTimeline history={history} />
        </div>

        <POSummarySidebar
          purchaseOrder={purchaseOrder}
          isOnline={isOnline}
          onMarkAsPaid={handleMarkAsPaid}
        />
      </div>

      <POReturnModal
        isOpen={showReturnModal}
        item={selectedItem}
        formState={returnForm}
        onFormChange={setReturnForm}
        onSubmit={handleSubmitReturn}
        onClose={() => setShowReturnModal(false)}
      />

      <POCancelModal
        isOpen={showCancelModal}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleCancelOrder}
        onClose={() => setShowCancelModal(false)}
        isLoading={cancelOrderMutation.isPending}
      />

      {showPinModal && (
        <PinVerificationModal
          title="Manager Verification Required"
          message="Please enter manager PIN to edit this received order"
          onVerify={handlePinVerify}
          onClose={() => setShowPinModal(false)}
          allowedRoles={['manager', 'admin']}
        />
      )}
    </div>
  )
}

import { logError } from '@/utils/logger'