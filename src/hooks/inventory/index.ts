// Inventory-related hooks - modular exports
export { useInventoryItems, type TInventoryItem } from './useInventoryItems'
export { useStockAdjustment, useSuppliers, type IStockAdjustmentParams, type TStockAdjustmentType } from './useStockAdjustment'
export { useStockMovements, useProductStockMovements, type IStockMovement, type IStockMovementsFilter, type TMovementFilterType } from './useStockMovements'
export { useInventoryAlerts, useLowStockItems, useReorderSuggestions } from './useInventoryAlerts'
export { useStockReservations, useCreateReservation, useCancelReservation } from './useStockReservations'
export { useProductRecipe, useRecipeAvailability } from './useProductRecipe'

// Internal Transfers (Story 5.4, 5.5)
export {
  useInternalTransfers,
  useTransfer,
  useCreateTransfer,
  useUpdateTransferStatus,
  useReceiveTransfer,
  type ITransferFilters,
  type ICreateTransferParams,
  type IUpdateTransferStatusParams,
  type IReceiveTransferParams,
} from './useInternalTransfers'

// Stock Locations (Story 5.4)
export {
  useLocations,
  useLocation,
  useLocationsByType,
  type ILocationFilters,
} from './useLocations'

// Sections (Section Stock Model)
export {
  useSections,
  useSection,
  useSectionsByType,
  type ISectionFilters,
} from './useSections'
