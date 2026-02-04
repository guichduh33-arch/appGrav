/**
 * OfflineStockBanner Component
 * Story 5.1 - Offline Stock Levels Cache
 *
 * Displays a banner when viewing stock in offline mode.
 * Indicates read-only status and last sync timestamp.
 */

import React from 'react';
import { WifiOff, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface IOfflineStockBannerProps {
  /** ISO timestamp of last sync */
  lastSyncAt: string | null;
  /** Number of cached stock items */
  cacheCount?: number;
  /** Additional CSS classes */
  className?: string;
}


/**
 * Banner indicating offline stock viewing mode
 *
 * @example
 * ```tsx
 * <OfflineStockBanner
 *   lastSyncAt="2026-02-02T10:00:00Z"
 *   cacheCount={150}
 * />
 * ```
 */
export const OfflineStockBanner: React.FC<IOfflineStockBannerProps> = ({
  lastSyncAt,
  cacheCount,
  className = '',
}) => {
  // Format relative time
  const syncTimeText = lastSyncAt
    ? formatDistanceToNow(new Date(lastSyncAt), {
        addSuffix: true,
        locale: enUS,
      })
    : 'never';

  return (
    <div
      className={`
        flex items-center justify-between gap-4 px-4 py-3 rounded-lg
        bg-amber-50 border border-amber-200
        ${className}
      `.trim()}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Read-only mode
          </p>
          <p className="text-xs text-amber-600">
            Stock adjustments are disabled offline
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-amber-600">
        <Clock className="w-4 h-4" aria-hidden="true" />
        <span>
          Last sync:{' '}
          <strong>{syncTimeText}</strong>
        </span>
        {cacheCount !== undefined && cacheCount > 0 && (
          <span className="px-2 py-0.5 bg-amber-100 rounded-full">
            {cacheCount} products
          </span>
        )}
      </div>
    </div>
  );
};

export default OfflineStockBanner;
