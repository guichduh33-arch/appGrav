// Centralized hooks exports

// Product hooks
export * from './products'

// Settings hooks
export * from './settings'

// Shift hooks
export * from './shift'

// Individual hooks
export * from './useInventory'
export * from './useOrders'
export * from './usePermissions'
// useRLSValidation is empty - excluded from barrel export
export * from './useStock'

// Legacy exports for backward compatibility
export { useShift } from './useShift'
