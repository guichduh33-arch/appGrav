/**
 * KDS Hooks Index
 * Story 4.3 - Order Dispatch to KDS via LAN
 * Story 4.4 - KDS Order Queue Display
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Exports all KDS-related hooks
 */

export { useKdsOrderReceiver } from './useKdsOrderReceiver';
export type {
  IUseKdsOrderReceiverOptions,
  IUseKdsOrderReceiverResult,
} from './useKdsOrderReceiver';

export { useKdsOrderQueue } from './useKdsOrderQueue';
export type {
  IKdsOrder,
  IKdsOrderItem,
  IUseKdsOrderQueueOptions,
  IUseKdsOrderQueueResult,
} from './useKdsOrderQueue';

export { useOrderAutoRemove } from './useOrderAutoRemove';
export type {
  IUseOrderAutoRemoveOptions,
  IUseOrderAutoRemoveResult,
} from './useOrderAutoRemove';
