/**
 * Customer Hooks
 * Story 6.1 - Customers Offline Cache
 *
 * Exports all customer-related hooks for POS and customer management.
 */

export {
  useSearchCustomersOffline,
  useCustomerByIdOffline,
  useCustomersLastSync,
  useOfflineCustomerCount,
  type IOfflineCustomer,
  type IUseSearchCustomersOfflineReturn,
  type IUseCustomerByIdOfflineReturn,
  type IUseCustomersLastSyncReturn,
  type IUseOfflineCustomerCountReturn,
} from './useCustomersOffline';

export {
  useCustomerCategories,
  useCreateCustomerCategory,
  useUpdateCustomerCategory,
  useDeleteCustomerCategory,
  type ICustomerCategory,
} from './useCustomerCategories';

export {
  useCustomers,
  useCustomerById,
  useCustomerOrders,
  useLoyaltyTransactions,
  useLoyaltyTiers,
  useAddLoyaltyPoints,
  useRedeemLoyaltyPoints,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  type ICustomerWithCategory,
} from './useCustomers';
