/**
 * Offline Report Types
 *
 * Type definitions for offline report caching (Story 8.8)
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

// =====================================================
// Report Cache Types (Story 8.8)
// =====================================================

/**
 * Report type identifiers for offline cache
 */
export type TReportCacheType =
  | 'daily_kpis'
  | 'hourly_sales'
  | 'payment_stats'
  | 'category_sales'
  | 'stock_alerts'
  | 'inventory_valuation';

/**
 * Offline report cache entry
 *
 * Stored in Dexie table: offline_reports_cache
 * Used to cache report data for offline access (7 days)
 *
 * @see Story 8.8: Reports Offline Cache
 */
export interface IOfflineReportCache {
  /** Auto-incremented primary key */
  id?: number;

  /** Type of report cached */
  report_type: TReportCacheType;

  /** Date of the report data (YYYY-MM-DD format) */
  report_date: string;

  /** Cached report data (JSON-serializable) */
  data: Record<string, unknown>;

  /** ISO 8601 timestamp when cached */
  cached_at: string;
}
