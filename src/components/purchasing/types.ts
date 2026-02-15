import type { IPurchaseOrder } from '@/hooks/purchasing'

// Extended PO Item with reception tracking
export interface IPODetailItem {
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
  qc_passed: boolean | null
}

// History metadata for different action types
export interface IPOHistoryMetadata {
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

// History entry
export interface IPOHistory {
  id: string
  action_type: string
  previous_status: string | null
  new_status: string | null
  description: string
  metadata: IPOHistoryMetadata | null
  changed_by_name?: string
  created_at: string
}

// Return record
export interface IPOReturn {
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

// Return form state
export interface IReturnFormState {
  quantity: number
  reason: string
  reason_details: string
  refund_amount: number
}

// Props for detail page sub-components
export interface IPODetailHeaderProps {
  purchaseOrder: IPurchaseOrder
  validActions: string[]
  isOnline: boolean
  onBack: () => void
  onEdit: () => void
  onSendToSupplier: () => void
  onConfirmOrder: () => void
  onCancelOrder: () => void
  isSending?: boolean
  isConfirming?: boolean
}

export interface IPOInfoCardProps {
  purchaseOrder: IPurchaseOrder
}

export interface IPOItemsTableProps {
  items: IPODetailItem[]
  purchaseOrder: IPurchaseOrder
  isOnline: boolean
  isReceiving: boolean
  onReceiveItem: (itemId: string, quantity: number) => void
  onOpenReturnModal: (item: IPODetailItem) => void
  onToggleQC?: (itemId: string, qcPassed: boolean | null) => void
}

export interface IPOReturnsSectionProps {
  returns: IPOReturn[]
}

export interface IPOHistoryTimelineProps {
  history: IPOHistory[]
}

export interface IPOSummarySidebarProps {
  purchaseOrder: IPurchaseOrder
  isOnline: boolean
  onMarkAsPaid: () => void
}

export interface IPOReturnModalProps {
  isOpen: boolean
  item: IPODetailItem | null
  formState: IReturnFormState
  onFormChange: (state: IReturnFormState) => void
  onSubmit: () => void
  onClose: () => void
}

export interface IPOCancelModalProps {
  isOpen: boolean
  reason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  onClose: () => void
  isLoading?: boolean
}
