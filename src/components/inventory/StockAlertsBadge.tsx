/**
 * StockAlertsBadge Component
 * Story 5.2 - Stock Alerts Offline Display
 *
 * Badge displaying count of stock alerts (warning + critical).
 * Clickable to navigate to stock alerts view.
 *
 * @see AC3: Compteur d'Alertes dans le Header
 * @see AC4: Accès Rapide aux Alertes
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useStockLevelsOffline,
  calculateStockStatus,
  type TStockStatus,
} from '@/hooks/offline/useStockLevelsOffline';

interface IStockAlertsBadgeProps {
  /** Additional CSS classes */
  className?: string;
  /** Show text label alongside badge */
  showLabel?: boolean;
}


/**
 * Badge showing stock alert count with navigation to alerts page
 *
 * @example
 * ```tsx
 * // In sidebar or header
 * <StockAlertsBadge />
 *
 * // With label
 * <StockAlertsBadge showLabel />
 * ```
 */
export const StockAlertsBadge: React.FC<IStockAlertsBadgeProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stockLevels, hasData } = useStockLevelsOffline();

  // Calculate alert counts
  const alertCounts = useMemo(() => {
    if (!hasData || !stockLevels.length) {
      return { total: 0, critical: 0, warning: 0, outOfStock: 0 };
    }

    let critical = 0;
    let warning = 0;
    let outOfStock = 0;

    for (const stock of stockLevels) {
      const status = calculateStockStatus(stock.quantity, stock.min_stock_level);
      if (status === 'out_of_stock') outOfStock++;
      else if (status === 'critical') critical++;
      else if (status === 'warning') warning++;
    }

    return {
      total: critical + warning + outOfStock,
      critical,
      warning,
      outOfStock,
    };
  }, [stockLevels, hasData]);

  // Don't render if no alerts
  if (alertCounts.total === 0) {
    return null;
  }

  // Determine badge severity (red if any critical/out_of_stock, else amber)
  const hasCritical = alertCounts.critical > 0 || alertCounts.outOfStock > 0;
  const badgeColor = hasCritical
    ? 'bg-red-500 text-white'
    : 'bg-amber-500 text-white';

  const handleClick = () => {
    navigate('/inventory?filter=alerts');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md
        hover:opacity-80 transition-opacity cursor-pointer
        ${className}
      `.trim()}
      title={t('inventory.alerts.viewAll')}
      aria-label={t('inventory.alerts.badge', { count: alertCounts.total })}
    >
      <AlertTriangle
        className={`w-4 h-4 ${hasCritical ? 'text-red-500' : 'text-amber-500'}`}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-sm text-gray-600">
          {t('inventory.alerts.title')}
        </span>
      )}
      <span
        className={`
          inline-flex items-center justify-center
          min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full
          ${badgeColor}
        `.trim()}
      >
        {alertCounts.total}
      </span>
    </button>
  );
};

export default StockAlertsBadge;
