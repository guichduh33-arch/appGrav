// Inventory-related hooks - modular exports
export { useInventoryItems, type TInventoryItem } from './useInventoryItems'
export { useStockAdjustment, useSuppliers, type IStockAdjustmentParams, type TStockAdjustmentType } from './useStockAdjustment'
export { useStockMovements, useProductStockMovements, type IStockMovement, type IStockMovementsFilter, type TMovementFilterType } from './useStockMovements'
export { useInventoryAlerts, useLowStockItems, useReorderSuggestions } from './useInventoryAlerts'
export { useStockReservations, useCreateReservation, useCancelReservation } from './useStockReservations'
export { useProductRecipe, useRecipeAvailability } from './useProductRecipe'
