import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface OfflineReportBannerProps {
  /** Whether the app is offline */
  isOffline: boolean;
  /** Last successful sync date */
  lastSyncDate: Date | null;
  /** Whether the current date range exceeds cached data */
  isDateRangeExceedsCache?: boolean;
  /** Whether data is currently syncing */
  isSyncing?: boolean;
  className?: string;
}

/**
 * Banner component to indicate offline mode in reports
 * Shows last sync date and warnings when data is unavailable
 */
export function OfflineReportBanner({
  isOffline,
  lastSyncDate,
  isDateRangeExceedsCache = false,
  isSyncing = false,
  className = '',
}: OfflineReportBannerProps) {
  // Show nothing if online and not syncing and no issues
  if (!isOffline && !isSyncing && !isDateRangeExceedsCache) {
    return null;
  }

  // Syncing indicator (subtle, bottom right toast would be better but this is simpler)
  if (isSyncing && !isOffline) {
    return (
      <div
        className={`
          flex items-center gap-2 px-4 py-2
          bg-blue-50 border border-blue-200 rounded-lg
          text-sm text-blue-700
          ${className}
        `}
      >
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Syncing reports...</span>
      </div>
    );
  }

  // Date range exceeds cache (online but requesting old data)
  if (isDateRangeExceedsCache && !isOffline) {
    return (
      <div
        className={`
          flex items-center gap-2 px-4 py-3
          bg-yellow-50 border border-yellow-200 rounded-lg
          text-sm text-yellow-800
          ${className}
        `}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>
          Offline cache only contains 7 days of data. Older data requires an internet connection.
        </span>
      </div>
    );
  }

  // Offline mode banner
  if (isOffline) {
    return (
      <div
        className={`
          flex items-center justify-between gap-4 px-4 py-3
          bg-yellow-50 border border-yellow-200 rounded-lg
          ${className}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <WifiOff className="w-4 h-4 text-yellow-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Offline Mode
            </p>
            <p className="text-xs text-yellow-600">
              {lastSyncDate ? (
                <>
                  Data as of {format(lastSyncDate, 'dd MMM yyyy HH:mm', { locale: fr })}
                </>
              ) : (
                'No cached data available'
              )}
            </p>
          </div>
        </div>

        {isDateRangeExceedsCache && (
          <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
            7 days max
          </div>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Compact offline indicator for use in report headers
 */
export function OfflineIndicatorBadge({
  isOffline,
  lastSyncDate,
  className = '',
}: {
  isOffline: boolean;
  lastSyncDate: Date | null;
  className?: string;
}) {
  if (!isOffline) return null;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        text-xs font-medium rounded-full
        bg-yellow-100 text-yellow-700
        ${className}
      `}
      title={lastSyncDate ? `Last sync: ${format(lastSyncDate, 'dd/MM/yyyy HH:mm')}` : 'No cached data'}
    >
      <WifiOff className="w-3 h-3" />
      Offline
    </span>
  );
}
