/**
 * SyncStatusBadge Component (Story 3.3)
 *
 * Badge showing sync status for offline-created orders.
 * Visual indicators help users understand if orders need syncing.
 */

import { Cloud, CloudOff, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TOfflineOrderSyncStatus } from '@/types/offline';

interface SyncStatusBadgeProps {
  /** Sync status of the order */
  status: TOfflineOrderSyncStatus;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the text label (default: true) */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge showing sync status for offline-created orders
 *
 * Visual indicators:
 * - local: Cloud off (gray) - Order is local only
 * - pending_sync: Cloud with animation (blue) - Waiting to sync
 * - synced: Checkmark (green) - Successfully synced
 * - conflict: Warning triangle (orange) - Sync conflict detected
 *
 * @example
 * ```tsx
 * <SyncStatusBadge status={order.sync_status} />
 * <SyncStatusBadge status="pending_sync" showLabel={false} />
 * <SyncStatusBadge status="synced" size="sm" />
 * ```
 */
export function SyncStatusBadge({
  status,
  className,
  showLabel = true,
  size = 'md',
}: SyncStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const config: Record<
    TOfflineOrderSyncStatus,
    {
      icon: typeof Cloud;
      color: string;
      bgColor: string;
      label: string;
      animate?: boolean;
    }
  > = {
    local: {
      icon: CloudOff,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      label: 'Local',
    },
    pending_sync: {
      icon: RefreshCw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Pending Sync',
      animate: true,
    },
    synced: {
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Synced',
    },
    conflict: {
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: 'Conflict',
    },
  };

  const { icon: Icon, color, bgColor, label, animate } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        color,
        bgColor,
        sizeClasses[size],
        className
      )}
      title={label}
    >
      <Icon
        className={cn(
          iconSizes[size],
          animate && 'animate-spin'
        )}
      />
      {showLabel && <span className="font-medium">{label}</span>}
    </span>
  );
}

/**
 * Check if an order was created offline (has LOCAL- prefix or OFFLINE- order number)
 */
export function isOfflineOrder(orderId: string, orderNumber?: string): boolean {
  return orderId.startsWith('LOCAL-') || (orderNumber?.startsWith('OFFLINE-') ?? false);
}
