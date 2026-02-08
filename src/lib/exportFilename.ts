/**
 * Utility for standardized export filename generation
 * Format: {report_name}_{from_date}_{to_date}.{extension}
 */

/**
 * Build a standardized export filename
 * @param reportName - Report name in kebab-case (e.g., 'daily-sales')
 * @param dateRange - Optional date range { from: Date, to: Date }
 * @param extension - File extension without dot (e.g., 'csv', 'pdf')
 * @returns Standardized filename
 */
export function buildExportFilename(
  reportName: string,
  dateRange?: { from: Date; to: Date } | null,
  extension: 'csv' | 'pdf' = 'csv'
): string {
  // Convert to kebab-case if not already
  const kebabName = reportName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (dateRange) {
    const fromStr = formatDateForFilename(dateRange.from);
    const toStr = formatDateForFilename(dateRange.to);
    return `${kebabName}_${fromStr}_${toStr}.${extension}`;
  }

  // If no date range, use current date
  const today = formatDateForFilename(new Date());
  return `${kebabName}_${today}.${extension}`;
}

/**
 * Format date as YYYY-MM-DD for filename
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Common report name mappings for consistency
 */
export const REPORT_NAMES = {
  dailySales: 'daily-sales',
  salesByCategory: 'sales-by-category',
  productPerformance: 'product-performance',
  stockMovement: 'stock-movements',
  paymentMethod: 'payment-by-method',
  profitLoss: 'profit-loss',
  salesByHour: 'sales-by-hour',
  salesByCustomer: 'sales-by-customer',
  salesCancellation: 'sales-cancellation',
  stockWarning: 'stock-warnings',
  expiredStock: 'expired-stock',
  unsoldProducts: 'unsold-products',
  sessionCashBalance: 'session-cash-balance',
  b2bReceivables: 'b2b-receivables',
  purchaseBySupplier: 'purchase-by-supplier',
  purchaseDetails: 'purchase-details',
  purchaseByDate: 'purchase-by-date',
  outstandingPayments: 'outstanding-payments',
  priceChanges: 'price-changes',
  deletedProducts: 'deleted-products',
  discountsVoids: 'discounts-voids',
  auditLog: 'audit-log',
  inventory: 'inventory',
} as const;
