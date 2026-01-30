// Centralized hooks exports

// Product hooks
export * from './products'

// Settings hooks
export * from './settings'

// Shift hooks
export * from './shift'

// Inventory hooks (new modular structure)
export * from './inventory'

// Individual hooks
export * from './useLanDevices'
export * from './useNetworkAlerts'
export * from './useNetworkStatus'
export * from './useOfflineData'
export * from './useOrders'
export * from './usePermissions'
export * from './usePermissionsUnified'
// useRLSValidation is empty - excluded from barrel export
export * from './useSyncQueue'
export * from './useSyncReport'
export * from './useTerminal'

// Legacy exports for backward compatibility
export { useShift } from './useShift'
