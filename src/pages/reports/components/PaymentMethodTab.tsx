import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';
import type { PaymentMethodStat } from '@/types/reporting';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28'];

export const PaymentMethodTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  // Note: getPaymentMethodStats doesn't accept date params yet; DatePicker is visual only for now
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['paymentMethodStats'],
    queryFn: () => ReportingService.getPaymentMethodStats(),
    staleTime: 5 * 60 * 1000,
  });

  const totalRevenue = useMemo(
    () => data.reduce((acc, curr) => acc + curr.total_revenue, 0),
    [data],
  );

  // Export config
  const exportConfig: ExportConfig<PaymentMethodStat> = useMemo(
    () => ({
      data,
      columns: [
        { key: 'payment_method', header: 'Payment Method' },
        { key: 'transaction_count', header: 'Transactions' },
        {
          key: 'total_revenue',
          header: 'Revenue',
          align: 'right' as const,
          format: (v: unknown) => formatCurrency(v as number),
        },
        {
          key: 'total_revenue' as keyof PaymentMethodStat,
          header: '% Total',
          align: 'right' as const,
          format: (v: unknown) =>
            totalRevenue > 0
              ? (((v as number) / totalRevenue) * 100).toFixed(1) + '%'
              : '0%',
        },
      ],
      filename: 'payment-methods',
      title: 'Payment Method Statistics',
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [data, dateRange, totalRevenue],
  );

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading payment method data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header: DateRangePicker + ExportButtons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-80">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis dataKey="payment_method" type="category" width={100} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="total_revenue" name="Total Revenue" fill="#8884d8">
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Top Payment Method</p>
            <p className="text-lg font-bold text-indigo-900">
              {data.length > 0 ? data[0].payment_method : '-'}
            </p>
            <p className="text-xs text-indigo-700">
              {data.length > 0 ? formatCurrency(data[0].total_revenue) : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.payment_method} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.payment_method}
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
