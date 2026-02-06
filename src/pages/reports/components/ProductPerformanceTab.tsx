import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Package, Loader2 } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';
import type { ProductPerformanceStat } from '@/types/reporting';

export const ProductPerformanceTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['productPerformance', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getProductPerformance(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const top10 = useMemo(() => products.slice(0, 10), [products]);

  // Export config
  const exportConfig: ExportConfig<ProductPerformanceStat> = useMemo(
    () => ({
      data: products,
      columns: [
        { key: 'product_name', header: 'Product' },
        { key: 'quantity_sold', header: 'Qty Sold' },
        {
          key: 'total_revenue',
          header: 'Revenue',
          align: 'right' as const,
          format: (v: unknown) => formatCurrency(v as number),
        },
        {
          key: 'avg_price',
          header: 'Avg Price',
          align: 'right' as const,
          format: (v: unknown) => formatCurrency(v as number),
        },
      ],
      filename: 'product-performance',
      title: 'Product Performance',
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [products, dateRange],
  );

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading product performance data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: DateRangePicker + ExportButtons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* Chart - Top 10 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Products by Revenue</h3>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : top10.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              layout="vertical"
              data={top10}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="product_name" width={150} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="total_revenue" name="Revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Full Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No data available.
                </td>
              </tr>
            ) : (
              products.map((row) => (
                <tr key={row.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      {row.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {row.quantity_sold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(row.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(row.avg_price)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
