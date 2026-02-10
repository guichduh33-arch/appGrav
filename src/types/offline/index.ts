/**
 * Offline Types - Barrel Export
 *
 * Re-exports all offline type sub-modules for backward compatibility.
 * All existing imports like `from '@/types/offline'` will continue to work.
 *
 * Sub-modules:
 * - auth.ts     - Offline authentication types (Stories 1.1, 1.2)
 * - sync.ts     - Sync queue and period types (Stories 3.1, 3.3, 3.4)
 * - products.ts - Product, category, modifier, recipe, stock types (Stories 2.x, 5.x)
 * - orders.ts   - Order, payment, session, kitchen dispatch types (Stories 3.x)
 * - customers.ts - Customer, pricing, promotion types (Stories 6.x)
 * - settings.ts - Settings, tax, payment method, business hours types (Story 1.5)
 * - reports.ts  - Report cache types (Story 8.8)
 * - errors.ts   - Error types and OfflineError class
 */

export * from './auth';
export * from './sync';
export * from './products';
export * from './orders';
export * from './customers';
export * from './settings';
export * from './reports';
export * from './errors';
