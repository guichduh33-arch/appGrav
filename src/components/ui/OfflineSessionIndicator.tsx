import React from 'react';
import { UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';

/**
 * OfflineSessionIndicator component props
 */
interface IOfflineSessionIndicatorProps {
  /** Show only icon without text label */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Offline Session indicator component
 *
 * Displays when the user authenticated using offline cached credentials.
 * This indicates that:
 * - Authentication was done against local bcrypt hash
 * - Some features requiring online verification may be limited
 * - Data will be synced when connection is restored
 *
 * Story 1.2: Offline PIN Authentication
 *
 * Accessibility:
 * - role="status" for screen readers
 * - aria-live="polite" for status announcements
 *
 * @param props - Component props
 * @returns JSX element for offline session indicator or null if online session
 *
 * @example
 * ```tsx
 * // Full indicator with text
 * <OfflineSessionIndicator />
 *
 * // Compact mode (icon only)
 * <OfflineSessionIndicator compact />
 * ```
 */
export const OfflineSessionIndicator: React.FC<IOfflineSessionIndicatorProps> = ({
  compact = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const { isOfflineSession } = useAuthStore();

  // Only show when session was authenticated offline
  if (!isOfflineSession) {
    return null;
  }

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        bg-amber-100
        min-w-[44px] min-h-[44px]
        transition-colors duration-200
        ${className}
      `.trim()}
      role="status"
      aria-live="polite"
      aria-label={t('auth.offline.sessionIndicator')}
      title={t('auth.offline.sessionIndicator')}
    >
      <UserX
        className="w-5 h-5 text-amber-600"
        aria-hidden="true"
      />
      {!compact && (
        <span className="text-sm font-medium text-amber-600 whitespace-nowrap">
          {t('auth.offline.sessionIndicator')}
        </span>
      )}
    </div>
  );
};
