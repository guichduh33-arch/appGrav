import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageX, Calendar, DollarSign, Package } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IUnsoldProductsReport } from '@/types/reporting';

export function UnsoldProductsTab() {
  const [minDays, setMinDays] = useState(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ['unsold-products'],
    queryFn: () => ReportingService.getUnsoldProducts(),
    staleTime: 5 * 60 * 1000,
  });

  // Filter by minimum days
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => item.days_since_sale >= minDays);
  }, [data, minDays]);

  // Summary stats
  const summary = useMemo(() => {
    const items = filteredData;
    return {
      totalProducts: items.length,
      totalStockValue: items.reduce((sum, item) => sum + (item.stock_value || 0), 0),
      avgDaysSinceLastSale: items.length > 0
        ? Math.round(items.reduce((sum, item) => sum + item.days_since_sale, 0) / items.length)
        : 0,
    };
  }, [filteredData]);

  // Export config
  const exportConfig: ExportConfig<IUnsoldProductsReport> = useMemo(() => ({
    data: filteredData,
    columns: [
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'product_name', header: 'Product' },
      { key: 'category_name', header: 'Category', format: (v) => (v as string) || '-' },
      { key: 'current_stock', header: 'Stock', align: 'right' as const },
      { key: 'last_sale_at', header: 'Last Sale', format: (v) => v ? new Date(v as string).toLocaleDateString('en-US') : 'Never' },
      { key: 'days_since_sale', header: 'Days', align: 'right' as const },
      { key: 'total_units_sold', header: 'Sold (Total)', align: 'right' as const },
      { key: 'stock_value', header: 'Stock Value', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
    ],
    filename: 'unsold-products',
    title: 'Unsold Products',
    summaries: [
      { label: 'Unsold Products', value: summary.totalProducts.toString() },
      { label: 'Stock Value', value: formatCurrencyPdf(summary.totalStockValue) },
      { label: 'Avg Days Without Sale', value: `${summary.avgDaysSinceLastSale}d` },
    ],
  }), [filteredData, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getDaysBadge = (days: number) => {
    if (days >= 90) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          {days}j
        </span>
      );
    }
    if (days >= 60) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          {days}j
        </span>
      );
    }
    if (days >= 30) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          {days}j
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
        {days}j
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Unsold Products</h2>

          {/* Days Filter */}
          <select
            value={minDays}
            onChange={(e) => setMinDays(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>More than 7 days</option>
            <option value={14}>More than 14 days</option>
            <option value={30}>More than 30 days</option>
            <option value={60}>More than 60 days</option>
            <option value={90}>More than 90 days</option>
          </select>
        </div>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <PackageX className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Unsold Products</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.totalProducts}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Locked Stock Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalStockValue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Avg Days Without Sale</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {`${summary.avgDaysSinceLastSale}d`}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Products unsold for {minDays}+ days</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sale</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{row.product_name}</p>
                          {row.sku && <p className="text-xs text-gray-500">{row.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.category_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {row.current_stock} {row.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.last_sale_at
                        ? new Date(row.last_sale_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-gray-400 italic">Never sold</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getDaysBadge(row.days_since_sale)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {row.total_units_sold}
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-600 text-right font-medium">
                      {formatCurrency(row.stock_value)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No unsold products for {minDays}+ days
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
