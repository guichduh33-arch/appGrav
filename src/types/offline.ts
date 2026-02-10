/**
 * Offline Types for AppGrav
 *
 * This file re-exports all types from the offline/ sub-modules
 * for backward compatibility. All existing imports will continue to work.
 *
 * For new code, prefer importing from specific sub-modules:
 * - '@/types/offline/auth'      - Authentication types
 * - '@/types/offline/sync'      - Sync queue types
 * - '@/types/offline/products'  - Product/category/stock types
 * - '@/types/offline/orders'    - Order/payment/session types
 * - '@/types/offline/customers' - Customer/pricing/promotion types
 * - '@/types/offline/settings'  - Settings/tax/payment method types
 * - '@/types/offline/reports'   - Report cache types
 * - '@/types/offline/errors'    - Error types
 */

export * from './offline/index';
