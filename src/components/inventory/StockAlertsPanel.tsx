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
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  useStockLevelsOffline,
  calculateStockStatus,
  type TStockStatus,
} from '@/hooks/offline/useStockLevelsOffline';
import { logError } from '@/utils/logger'

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
      return <XCircle className="w-4 h-4 text-[var(--color-danger)]" aria-hidden="true" />;
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" aria-hidden="true" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" aria-hidden="true" />;
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
      return 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--theme-border)]';
    case 'critical':
      return 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--theme-border)]';
    case 'warning':
      return 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--theme-border)]';
    default:
      return 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--theme-border)]';
  }
}

/**
 * Panel showing stock alerts with filtering capability
 */
export const StockAlertsPanel: React.FC<IStockAlertsPanelProps> = ({
  initialFilter = 'all',
  className = '',
  maxItems = 0,
}) => {
  const { stockLevels, hasData } = useStockLevelsOffline();
  const [filter, setFilter] = useState<TAlertFilter>(initialFilter);

  // Load product names from offline cache
  const products = useLiveQuery(async () => {
    try {
      const allProducts = await db.offline_products.toArray();
      return new Map(allProducts.map((p) => [p.id, p.name]));
    } catch (error) {
      logError('[StockAlertsPanel] Error loading products:', error);
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
      className={`bg-[var(--theme-bg-secondary)] rounded-lg border border-[var(--theme-border)] shadow-sm ${className}`}
      role="region"
      aria-label="Stock Alerts"
    >
      {/* Header with filter tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[var(--theme-text-primary)] font-display">
            Stock Alerts
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] rounded-full border border-[var(--theme-border)]">
            {counts.all}
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-[var(--theme-text-muted)] mr-1" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded transition-colors ${filter === 'all'
                ? 'bg-[var(--color-gold)] text-[var(--theme-bg-primary)] font-bold'
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)]'
              }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-2 py-1 text-xs rounded transition-colors ${filter === 'critical'
                ? 'bg-[var(--color-danger)] text-white font-bold'
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)]'
              }`}
          >
            Critical ({counts.critical})
          </button>
          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`px-2 py-1 text-xs rounded transition-colors ${filter === 'warning'
                ? 'bg-[var(--color-warning)] text-white font-bold'
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)]'
              }`}
          >
            Warning ({counts.warning})
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div className="divide-y divide-[var(--theme-border)]">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-[var(--theme-text-muted)]">
            No alerts
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between px-4 py-3 hover:bg-[var(--theme-bg-tertiary)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={item.status} />
                <div>
                  <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                    {item.productName}
                  </p>
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    Min stock: {item.minStockLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--theme-text-primary)]">
                    {item.quantity}
                  </p>
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    Current stock
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeClasses(
                    item.status
                  )}`}
                >
                  {item.status === 'out_of_stock'
                    ? 'Out of Stock'
                    : item.status === 'critical'
                      ? 'Critical'
                      : 'Warning'}
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
