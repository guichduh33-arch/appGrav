import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IPOActivityEntry {
    id: string
    purchase_order_id: string
    action: string
    description: string | null
    performed_by: string | null
    metadata: Record<string, unknown> | null
    created_at: string
}

export function usePOActivityLog(purchaseOrderId: string | undefined) {
    return useQuery({
        queryKey: ['po-activity-log', purchaseOrderId],
        queryFn: async () => {
            if (!purchaseOrderId) return []

            const { data, error } = await supabase
                .from('po_activity_log')
                .select('*')
                .eq('purchase_order_id', purchaseOrderId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return (data ?? []) as IPOActivityEntry[]
        },
        enabled: !!purchaseOrderId,
    })
}
