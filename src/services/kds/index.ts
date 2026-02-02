/**
 * KDS Services Index
 * Story 4.5 - KDS Item Status Update
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Exports all KDS-related services
 */

export {
  markItemsPreparing,
  markItemsReady,
  type IItemStatusResult,
} from './kdsStatusService';

export {
  completeOrder,
  type IOrderCompleteResult,
} from './orderCompletionService';
