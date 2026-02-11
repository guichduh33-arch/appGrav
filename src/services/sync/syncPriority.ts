/**
 * Sync Priority Service
 * Sprint 3 - Offline Improvements
 *
 * Maps entity types to priority levels and provides sorting utilities.
 * Critical operations (void, refund, payments) sync before product updates.
 */

import type { TSyncPriority, TLegacySyncQueueType } from '@/types/offline';
import type { ILegacySyncQueueItem } from '@/types/offline';

/**
 * Numeric weight for each priority level (lower = higher priority)
 */
const PRIORITY_WEIGHT: Record<TSyncPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

/**
 * Default priority for each legacy sync queue type.
 * - critical: void, refund, payment, session_close (financial integrity)
 * - high: order, order_update (customer-facing)
 * - normal: product, stock_movement, customer, category (data sync)
 * - low: settings, audit_log (non-urgent)
 */
const TYPE_PRIORITY_MAP: Record<string, TSyncPriority> = {
  // Critical - financial operations
  void_operations: 'critical',
  refund_operations: 'critical',
  payment: 'critical',
  session_close: 'critical',

  // High - order operations
  order: 'high',
  order_update: 'high',

  // Normal - data operations
  product: 'normal',
  stock_movement: 'normal',
  category: 'normal',
  product_category_price: 'normal',
  customer: 'normal',

  // Low - non-urgent
  audit_logs: 'low',
  settings: 'low',
};

/**
 * Assign a priority level to a queue item based on its type.
 * Uses the item's existing priority if set, otherwise derives from type.
 */
export function assignPriority(
  type: TLegacySyncQueueType | string,
  existingPriority?: TSyncPriority
): TSyncPriority {
  if (existingPriority) return existingPriority;
  return TYPE_PRIORITY_MAP[type] ?? 'normal';
}

/**
 * Compare two priority levels for sorting.
 * Returns negative if a should come first, positive if b should come first.
 */
export function comparePriority(a: TSyncPriority, b: TSyncPriority): number {
  return PRIORITY_WEIGHT[a] - PRIORITY_WEIGHT[b];
}

/**
 * Sort queue items by priority (critical first), then by createdAt (FIFO within priority).
 */
export function sortByPriority(
  items: ILegacySyncQueueItem[]
): ILegacySyncQueueItem[] {
  return [...items].sort((a, b) => {
    const priorityA = assignPriority(a.type, a.priority);
    const priorityB = assignPriority(b.type, b.priority);

    const priorityDiff = comparePriority(priorityA, priorityB);
    if (priorityDiff !== 0) return priorityDiff;

    // FIFO within same priority
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export { PRIORITY_WEIGHT, TYPE_PRIORITY_MAP };
