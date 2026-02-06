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
  Legend,
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';
import type { DailySalesStat } from '@/types/reporting';

export const DailySalesTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['dailySales', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getDailySales(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // KPI totals
  const totals = useMemo(() => {
    if (data.length === 0) {
      return { revenue: 0, orders: 0, avgDaily: 0, avgBasket: 0 };
    }
    const revenue = data.reduce((s, d) => s + (d.total_sales || 0), 0);
    const orders = data.reduce((s, d) => s + (d.total_orders || 0), 0);
    return {
      revenue,
      orders,
      avgDaily: revenue / data.length,
      avgBasket: orders > 0 ? revenue / orders : 0,
    };
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<DailySalesStat> = useMemo(() => ({
    data,
    columns: [
      { key: 'date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString() },
      { key: 'total_orders', header: 'Orders' },
      { key: 'total_sales', header: 'Revenue', format: (v) => formatCurrency(v as number) },
      { key: 'net_revenue', header: 'Net Revenue', format: (v) => formatCurrency(v as number) },
      { key: 'avg_basket', header: 'Avg Basket', format: (v) => formatCurrency(v as number) },
    ],
    filename: 'daily-sales',
    title: 'Daily Sales Report',
    dateRange: { from: dateRange.from, to: dateRange.to },
  }), [data, dateRange]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading daily sales data. Please try again.
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<DollarSign className="w-5 h-5 text-blue-600" />} bg="bg-blue-50"
          label="Total Revenue" value={isLoading ? null : formatCurrency(totals.revenue)} />
        <KpiCard icon={<ShoppingCart className="w-5 h-5 text-green-600" />} bg="bg-green-50"
          label="Total Orders" value={isLoading ? null : totals.orders.toLocaleString()} />
        <KpiCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} bg="bg-purple-50"
          label="Avg Daily Revenue" value={isLoading ? null : formatCurrency(totals.avgDaily)} />
        <KpiCard icon={<DollarSign className="w-5 h-5 text-amber-600" />} bg="bg-amber-50"
          label="Avg Basket" value={isLoading ? null : formatCurrency(totals.avgBasket)} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Performance</h3>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                formatter={(value: any, name: any) => {
                  if (name === 'Revenue' || name === 'Net Revenue') return formatCurrency(value);
                  return value;
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="total_sales" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="total_orders" name="Orders" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net (ex. Tax)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Basket</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No data available.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {row.total_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(row.total_sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(row.net_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(row.avg_basket)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function KpiCard({ icon, bg, label, value }: {
  icon: React.ReactNode; bg: string; label: string; value: string | null;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value === null ? <Loader2 className="w-6 h-6 animate-spin" /> : value}
      </p>
    </div>
  );
}
