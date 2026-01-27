import React from 'react';
import { Wifi, WifiOff, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import type { TNetworkMode } from '../../stores/networkStore';

/**
 * Configuration for each network status mode
 */
interface IStatusConfig {
  icon: typeof Wifi;
  color: string;
  bgColor: string;
  labelKey: string;
}

/**
 * Status configuration mapping for network modes
 * - online: Green with Wifi icon
 * - lan-only: Yellow with Radio icon
 * - offline: Red with WifiOff icon
 */
const STATUS_CONFIG: Record<TNetworkMode, IStatusConfig> = {
  online: {
    icon: Wifi,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    labelKey: 'network.online',
  },
  'lan-only': {
    icon: Radio,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    labelKey: 'network.lanOnly',
  },
  offline: {
    icon: WifiOff,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    labelKey: 'network.offline',
  },
} as const;

/**
 * NetworkIndicator component props
 */
interface INetworkIndicatorProps {
  /** Show only icon without text label */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Network status indicator component
 *
 * Displays the current network connectivity status with:
 * - Distinct colors: Green (online), Yellow (LAN-only), Red (offline)
 * - Status icons from Lucide React
 * - Translated status text
 *
 * Accessibility:
 * - role="status" for screen readers
 * - aria-live="polite" for status change announcements
 *
 * NFR Compliance:
 * - NFR-U2: Touch target minimum 44x44px (min-w-[44px] min-h-[44px])
 * - NFR-U3: Visual feedback < 100ms (reactive to store changes)
 * - NFR-U4: Always visible in persistent header
 *
 * @param props - Component props
 * @returns JSX element for network status indicator
 *
 * @example
 * ```tsx
 * // Full indicator with text
 * <NetworkIndicator />
 *
 * // Compact mode (icon only)
 * <NetworkIndicator compact />
 * ```
 */
export const NetworkIndicator: React.FC<INetworkIndicatorProps> = ({
  compact = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const { networkMode } = useNetworkStatus();

  const config = STATUS_CONFIG[networkMode];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        ${config.bgColor}
        min-w-[44px] min-h-[44px]
        transition-colors duration-200
        ${className}
      `.trim()}
      role="status"
      aria-live="polite"
      aria-label={t(config.labelKey)}
    >
      <Icon
        className={`w-5 h-5 ${config.color}`}
        aria-hidden="true"
      />
      {!compact && (
        <span className={`text-sm font-medium ${config.color} whitespace-nowrap`}>
          {t(config.labelKey)}
        </span>
      )}
    </div>
  );
};
