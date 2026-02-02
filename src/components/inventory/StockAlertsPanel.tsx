/**
 * StockAlertsPanel Component
 * Story 5.2 - Stock Alerts Offline Display
 *
 * Displays list of products with low stock levels.
 * Shows warning (< 10) and critical (< 5) alerts with filtering.
 *
 * @see AC1: Alertes Stock Bas sur Dashboard Offline
 */

import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, XCircle, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  useStockLevelsOffline,
  calculateStockStatus,
  type TStockStatus,
} from '@/hooks/offline/useStockLevelsOffline';

interface IStockAlertsPanelProps {
  /** Initial filter to apply */
  initialFilter?: TAlertFilter;
  /** Additional CSS classes */
  className?: string;
  /** Maximum items to show (0 = all) */
  maxItems?: number;
}

type TAlertFilter = 'all' | 'critical' | 'warning';

interface IStockAlertItem {
  productId: string;
  productName: string;
  quantity: number;
  minStockLevel: number;
  status: TStockStatus;
}


/**
 * Get priority for sorting (lower = higher priority)
 */
function getStatusPriority(status: TStockStatus): number {
  switch (status) {
    case 'out_of_stock':
      return 0;
    case 'critical':
      return 1;
    case 'warning':
      return 2;
    default:
      return 3;
  }
}

/**
 * Get icon for status
 */
function StatusIcon({ status }: { status: TStockStatus }) {
  switch (status) {
    case 'out_of_stock':
      return <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />;
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-amber-500" aria-hidden="true" />;
    default:
      return null;
  }
}

/**
 * Get CSS classes for status badge
 */
function getStatusBadgeClasses(status: TStockStatus): string {
  switch (status) {
    case 'out_of_stock':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'critical':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'warning':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    default:
      return 'bg-green-50 text-green-600 border-green-200';
  }
}

/**
 * Panel showing stock alerts with filtering capability
 *
 * @example
 * ```tsx
 * // Show all alerts
 * <StockAlertsPanel />
 *
 * // Show only critical with max 5 items
 * <StockAlertsPanel initialFilter="critical" maxItems={5} />
 * ```
 */
export const StockAlertsPanel: React.FC<IStockAlertsPanelProps> = ({
  initialFilter = 'all',
  className = '',
  maxItems = 0,
}) => {
  const { t } = useTranslation();
  const { stockLevels, hasData } = useStockLevelsOffline();
  const [filter, setFilter] = useState<TAlertFilter>(initialFilter);

  // Load product names from offline cache
  const products = useLiveQuery(async () => {
    try {
      const allProducts = await db.offline_products.toArray();
      return new Map(allProducts.map((p) => [p.id, p.name]));
    } catch (error) {
      console.error('[StockAlertsPanel] Error loading products:', error);
      return new Map<string, string>();
    }
  }, []);

  // Build alert items with product names
  const alertItems = useMemo((): IStockAlertItem[] => {
    if (!hasData || !stockLevels.length || !products) {
      return [];
    }

    const items: IStockAlertItem[] = [];

    for (const stock of stockLevels) {
      const status = calculateStockStatus(stock.quantity, stock.min_stock_level);
      if (status === 'ok') continue;

      items.push({
        productId: stock.product_id,
        productName: products.get(stock.product_id) || stock.product_id,
        quantity: stock.quantity,
        minStockLevel: stock.min_stock_level,
        status,
      });
    }

    // Sort by severity (out_of_stock > critical > warning)
    items.sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));

    return items;
  }, [stockLevels, hasData, products]);

  // Apply filter
  const filteredItems = useMemo(() => {
    let items = alertItems;

    if (filter === 'critical') {
      items = items.filter(
        (item) => item.status === 'critical' || item.status === 'out_of_stock'
      );
    } else if (filter === 'warning') {
      items = items.filter((item) => item.status === 'warning');
    }

    if (maxItems > 0) {
      items = items.slice(0, maxItems);
    }

    return items;
  }, [alertItems, filter, maxItems]);

  // Count by category for filter tabs
  const counts = useMemo(() => {
    const critical = alertItems.filter(
      (i) => i.status === 'critical' || i.status === 'out_of_stock'
    ).length;
    const warning = alertItems.filter((i) => i.status === 'warning').length;
    return { all: alertItems.length, critical, warning };
  }, [alertItems]);

  // Don't render if no alerts
  if (alertItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
      role="region"
      aria-label={t('inventory.alerts.title')}
    >
      {/* Header with filter tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-900">
            {t('inventory.alerts.title')}
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            {counts.all}
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-gray-400 mr-1" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filter === 'all'
                ? 'bg-gray-200 text-gray-900 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t('inventory.alerts.filterAll')} ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filter === 'critical'
                ? 'bg-red-100 text-red-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t('inventory.alerts.filterCritical')} ({counts.critical})
          </button>
          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filter === 'warning'
                ? 'bg-amber-100 text-amber-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t('inventory.alerts.filterWarning')} ({counts.warning})
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div className="divide-y divide-gray-100">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            {t('inventory.alerts.noAlerts')}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={item.status} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('inventory.alerts.minStock')}: {item.minStockLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('inventory.alerts.currentStock')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeClasses(
                    item.status
                  )}`}
                >
                  {item.status === 'out_of_stock'
                    ? t('inventory.alerts.outOfStock')
                    : item.status === 'critical'
                    ? t('inventory.alerts.critical')
                    : t('inventory.alerts.warning')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockAlertsPanel;
