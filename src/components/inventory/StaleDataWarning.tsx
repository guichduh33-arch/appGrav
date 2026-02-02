/**
 * StaleDataWarning Component
 * Story 5.2 - Stock Alerts Offline Display
 *
 * Warning banner shown when cached data may be outdated.
 * Displays when offline for extended period (> STALE_DATA_THRESHOLD_MS).
 *
 * @see AC2: Avertissement Données Obsolètes
 */

import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, id } from 'date-fns/locale';
import { isDataStale } from '@/types/offline';

interface IStaleDataWarningProps {
  /** ISO timestamp of last sync */
  lastSyncAt: string | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get date-fns locale based on i18n language
 */
function getLocale(language: string) {
  switch (language) {
    case 'fr':
      return fr;
    case 'id':
      return id;
    default:
      return enUS;
  }
}

/**
 * Warning banner for potentially stale cached data
 *
 * Only renders when data is considered stale (> 1 hour since last sync).
 * Uses orange styling to indicate warning without being alarming.
 *
 * @example
 * ```tsx
 * const { lastSyncAt, isOffline } = useStockLevelsOffline();
 *
 * {isOffline && <StaleDataWarning lastSyncAt={lastSyncAt} />}
 * ```
 */
export const StaleDataWarning: React.FC<IStaleDataWarningProps> = ({
  lastSyncAt,
  className = '',
}) => {
  const { t, i18n } = useTranslation();

  // Check if data is stale
  const stale = useMemo(() => isDataStale(lastSyncAt), [lastSyncAt]);

  // Don't render if data is fresh
  if (!stale) {
    return null;
  }

  // Format relative time
  const timeAgo = lastSyncAt
    ? formatDistanceToNow(new Date(lastSyncAt), {
        addSuffix: true,
        locale: getLocale(i18n.language),
      })
    : t('inventory.offline.never_synced', 'jamais');

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        bg-orange-50 border border-orange-200
        ${className}
      `.trim()}
      role="alert"
      aria-live="polite"
    >
      <Clock
        className="w-5 h-5 text-orange-600 shrink-0"
        aria-hidden="true"
      />
      <p className="text-sm text-orange-800">
        {t('inventory.alerts.staleWarning', { time: timeAgo })}
      </p>
    </div>
  );
};

export default StaleDataWarning;
