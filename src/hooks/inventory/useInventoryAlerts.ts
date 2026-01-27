import { useQuery } from '@tanstack/react-query'
import {
  getLowStockItems,
  getReorderSuggestions,
  getProductionSuggestions,
  type ILowStockItem,
  type IReorderSuggestion,
  type IProductionSuggestion
} from '@/services/inventory/inventoryAlerts'

/**
 * Hook to fetch low stock items
 * Refetches every 5 minutes
 */
export function useLowStockItems() {
  return useQuery({
    queryKey: ['inventory-alerts', 'low-stock'],
    queryFn: async (): Promise<ILowStockItem[]> => {
      return getLowStockItems()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  })
}

/**
 * Hook to fetch reorder suggestions
 */
export function useReorderSuggestions() {
  return useQuery({
    queryKey: ['inventory-alerts', 'reorder-suggestions'],
    queryFn: async (): Promise<IReorderSuggestion[]> => {
      return getReorderSuggestions()
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * Hook to fetch production suggestions
 */
export function useProductionSuggestions() {
  return useQuery({
    queryKey: ['inventory-alerts', 'production-suggestions'],
    queryFn: async (): Promise<IProductionSuggestion[]> => {
      return getProductionSuggestions()
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * Combined hook for all inventory alerts
 * Useful for dashboard displays
 */
export function useInventoryAlerts() {
  const lowStock = useLowStockItems()
  const reorder = useReorderSuggestions()
  const production = useProductionSuggestions()

  return {
    lowStockItems: lowStock.data || [],
    reorderSuggestions: reorder.data || [],
    productionSuggestions: production.data || [],
    isLoading: lowStock.isLoading || reorder.isLoading || production.isLoading,
    error: lowStock.error || reorder.error || production.error,
    // Summary counts
    counts: {
      lowStock: lowStock.data?.length || 0,
      criticalStock: lowStock.data?.filter(i => i.severity === 'critical').length || 0,
      reorderNeeded: reorder.data?.length || 0,
      productionNeeded: production.data?.length || 0
    }
  }
}
