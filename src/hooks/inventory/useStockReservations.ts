import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActiveReservations,
  getAvailableStock,
  createReservation,
  cancelReservation,
  fulfillReservation,
  getCustomerReservations,
  type IStockReservation
} from '@/services/inventory/stockReservation'

/**
 * Hook to fetch active stock reservations
 */
export function useStockReservations(productId?: string) {
  return useQuery({
    queryKey: ['stock-reservations', productId],
    queryFn: async (): Promise<IStockReservation[]> => {
      return getActiveReservations(productId)
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

/**
 * Hook to get available stock for a product (minus reservations)
 */
export function useAvailableStock(productId: string | null) {
  return useQuery({
    queryKey: ['available-stock', productId],
    queryFn: async (): Promise<number> => {
      if (!productId) return 0
      return getAvailableStock(productId)
    },
    enabled: !!productId,
    staleTime: 60 * 1000 // 1 minute
  })
}

/**
 * Hook to get reservations for a specific customer
 */
export function useCustomerReservations(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-reservations', customerId],
    queryFn: async () => {
      if (!customerId) return { activeCount: 0, totalReserved: 0, reservations: [] }
      return getCustomerReservations(customerId)
    },
    enabled: !!customerId
  })
}

/**
 * Mutation hook to create a stock reservation
 */
export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      productId: string
      customerId: string
      quantity: number
      reservedUntil: Date
      orderId?: string
      b2bOrderId?: string
      notes?: string
    }) => {
      return createReservation(params)
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['stock-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['available-stock', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['customer-reservations', variables.customerId] })
    }
  })
}

/**
 * Mutation hook to cancel a reservation
 */
export function useCancelReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reservationId, reason }: { reservationId: string; reason?: string }) => {
      return cancelReservation(reservationId, reason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['available-stock'] })
      queryClient.invalidateQueries({ queryKey: ['customer-reservations'] })
    }
  })
}

/**
 * Mutation hook to fulfill a reservation (when order completes)
 */
export function useFulfillReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reservationId: string) => {
      return fulfillReservation(reservationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['available-stock'] })
    }
  })
}
