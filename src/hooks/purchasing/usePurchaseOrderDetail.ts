import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { usePurchaseOrder } from './usePurchaseOrders'
import type { IPODetailItem, IPOHistory, IPOHistoryMetadata, IPOReturn } from '@/components/purchasing/types'

interface IPurchaseOrderDetailData {
  items: IPODetailItem[]
  history: IPOHistory[]
  returns: IPOReturn[]
}

async function fetchPODetailData(purchaseOrderId: string): Promise<IPurchaseOrderDetailData> {
  const [itemsResult, historyResult, returnsResult] = await Promise.all([
    // Fetch Items with product join
    supabase
      .from('purchase_order_items')
      .select('*, product:products(name)')
      .eq('purchase_order_id', purchaseOrderId),

    // Fetch History
    supabase
      .from('purchase_order_history')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId)
      .order('created_at', { ascending: false }),

    // Fetch Returns
    supabase
      .from('purchase_order_returns')
      .select('*, item:purchase_order_items(product_name)')
      .eq('purchase_order_id', purchaseOrderId)
      .order('return_date', { ascending: false }),
  ])

  if (itemsResult.error) throw itemsResult.error
  if (historyResult.error) throw historyResult.error
  if (returnsResult.error) throw returnsResult.error

  // Map items
  const items: IPODetailItem[] = (itemsResult.data || []).map((item: unknown) => {
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
      qc_passed: (i.qc_passed as boolean | null) ?? null,
    }
  })

  // Map history
  const history: IPOHistory[] = (historyResult.data || []).map((h: unknown) => {
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

  // Map returns
  const returns: IPOReturn[] = (returnsResult.data || []).map((r: unknown) => {
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

  return { items, history, returns }
}

export function usePurchaseOrderDetail(purchaseOrderId: string | null) {
  // Fetch main PO data
  const {
    data: purchaseOrder,
    isLoading: isPOLoading,
    error: poError,
    refetch: refetchPO,
  } = usePurchaseOrder(purchaseOrderId)

  // Fetch related data (items, history, returns)
  const {
    data: detailData,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['purchase-order-detail', purchaseOrderId],
    queryFn: () => fetchPODetailData(purchaseOrderId!),
    enabled: !!purchaseOrderId,
  })

  const refetchAll = async () => {
    await Promise.all([refetchPO(), refetchDetail()])
  }

  return {
    purchaseOrder,
    items: detailData?.items || [],
    history: detailData?.history || [],
    returns: detailData?.returns || [],
    isLoading: isPOLoading || isDetailLoading,
    error: poError || detailError,
    refetch: refetchAll,
  }
}
