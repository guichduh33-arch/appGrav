import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';
import type { CategorySalesStat } from '@/types/reporting';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export const SalesByCategoryTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['salesByCategory', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesByCategory(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const totalRevenue = useMemo(
    () => data.reduce((acc, curr) => acc + curr.total_revenue, 0),
    [data],
  );

  // Export config
  const exportConfig: ExportConfig<CategorySalesStat> = useMemo(
    () => ({
      data,
      columns: [
        { key: 'category_name', header: 'Category' },
        { key: 'transaction_count', header: 'Qty Sold' },
        {
          key: 'total_revenue',
          header: 'Revenue',
          align: 'right' as const,
          format: (v: unknown) => formatCurrency(v as number),
        },
        {
          key: 'total_revenue' as keyof CategorySalesStat,
          header: '% Total',
          align: 'right' as const,
          format: (v: unknown) =>
            totalRevenue > 0
              ? (((v as number) / totalRevenue) * 100).toFixed(1) + '%'
              : '0%',
        },
      ],
      filename: 'sales-by-category',
      title: 'Sales By Category',
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [data, dateRange, totalRevenue],
  );

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading category sales data. Please try again.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PieChart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  // @ts-expect-error recharts type issue with custom data shape
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_revenue"
                  nameKey="category_name"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-900">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                formatCurrency(totalRevenue)
              )}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Top Category</p>
            <p className="text-lg font-bold text-green-900">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : data.length > 0 ? (
                data[0].category_name
              ) : (
                '-'
              )}
            </p>
            <p className="text-xs text-green-700">
              {!isLoading && data.length > 0 ? formatCurrency(data[0].total_revenue) : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.category_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {row.transaction_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(row.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {totalRevenue > 0
                      ? ((row.total_revenue / totalRevenue) * 100).toFixed(1) + '%'
                      : '0%'}
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
