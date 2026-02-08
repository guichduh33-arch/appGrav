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
import { DollarSign, ShoppingCart, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { ReportBreadcrumb } from '@/components/reports/ReportBreadcrumb';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { useDrillDown } from '@/hooks/reports/useDrillDown';
import { formatCurrency } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';
import type { DailySalesStat } from '@/types/reporting';

interface OrderDetail {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  payment_method: string;
  items_count: number;
  staff_name: string | null;
}

async function getOrdersForDate(date: string): Promise<OrderDetail[]> {
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      total,
      payment_method,
      user_profiles:user_id(full_name)
    `)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .not('status', 'eq', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get item counts
  const orderIds = (data || []).map(o => o.id);
  const { data: itemCounts } = await supabase
    .from('order_items')
    .select('order_id')
    .in('order_id', orderIds);

  const countMap = new Map<string, number>();
  (itemCounts || []).forEach(item => {
    countMap.set(item.order_id, (countMap.get(item.order_id) || 0) + 1);
  });

  return (data || []).map(order => ({
    id: order.id,
    order_number: order.order_number || order.id.slice(0, 8),
    created_at: order.created_at,
    total: order.total || 0,
    payment_method: order.payment_method || 'unknown',
    items_count: countMap.get(order.id) || 0,
    staff_name: Array.isArray(order.user_profiles)
      ? order.user_profiles[0]?.full_name
      : (order.user_profiles as { full_name?: string } | null)?.full_name || null,
  }));
}

export const DailySalesTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const { isDrilledIn, currentParams, drillInto, drillReset, breadcrumbLevels } = useDrillDown({
    baseLevelName: 'Daily Sales',
    syncWithUrl: true,
  });

  // Main data query
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['dailySales', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getDailySales(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: !isDrilledIn,
  });

  // Drill-down data query
  const drillDate = currentParams?.date;
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['dailySalesOrders', drillDate],
    queryFn: () => getOrdersForDate(drillDate!),
    staleTime: 5 * 60 * 1000,
    enabled: isDrilledIn && !!drillDate,
  });

  // KPI totals
  const totals = useMemo(() => {
    if (data.length === 0) {
      return { revenue: 0, orders: 0, avgDaily: 0, avgBasket: 0 };
    }
    const revenue = data.reduce((s, d) => s + (d.total_sales || 0), 0);
    const orderCount = data.reduce((s, d) => s + (d.total_orders || 0), 0);
    return {
      revenue,
      orders: orderCount,
      avgDaily: revenue / data.length,
      avgBasket: orderCount > 0 ? revenue / orderCount : 0,
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

  // Export config for drill-down
  const ordersExportConfig: ExportConfig<OrderDetail> = useMemo(() => ({
    data: orders,
    columns: [
      { key: 'order_number', header: 'Order #' },
      { key: 'created_at', header: 'Time', format: (v) => new Date(v as string).toLocaleTimeString() },
      { key: 'items_count', header: 'Items', align: 'right' as const },
      { key: 'total', header: 'Total', align: 'right' as const, format: (v) => formatCurrency(v as number) },
      { key: 'payment_method', header: 'Payment' },
      { key: 'staff_name', header: 'Staff' },
    ],
    filename: `orders-${drillDate}`,
    title: `Orders for ${drillDate ? new Date(drillDate).toLocaleDateString() : ''}`,
  }), [orders, drillDate]);

  const handleRowClick = (date: string) => {
    const formattedDate = new Date(date).toLocaleDateString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
    drillInto(formattedDate, { date });
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading daily sales data. Please try again.
      </div>
    );
  }

  // Drill-down view: Orders for specific date
  if (isDrilledIn && drillDate) {
    const dayTotals = {
      revenue: orders.reduce((s, o) => s + o.total, 0),
      orderCount: orders.length,
      avgBasket: orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0,
    };

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <ReportBreadcrumb levels={breadcrumbLevels} />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={drillReset}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Daily Sales
          </button>
          <ExportButtons config={ordersExportConfig} />
        </div>

        {/* Day Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard icon={<DollarSign className="w-5 h-5 text-blue-600" />} bg="bg-blue-50"
            label="Day Revenue" value={ordersLoading ? null : formatCurrency(dayTotals.revenue)} />
          <KpiCard icon={<ShoppingCart className="w-5 h-5 text-green-600" />} bg="bg-green-50"
            label="Orders" value={ordersLoading ? null : dayTotals.orderCount.toString()} />
          <KpiCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} bg="bg-purple-50"
            label="Avg Basket" value={ordersLoading ? null : formatCurrency(dayTotals.avgBasket)} />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Orders for {new Date(drillDate).toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No orders for this date.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{order.items_count}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                          {order.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.staff_name || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Main view: Daily Sales
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
          <div className="h-80 animate-pulse bg-gray-100 rounded-lg" />
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
                formatter={(value, name) => {
                  if (name === 'Revenue' || name === 'Net Revenue') return formatCurrency((value as number) ?? 0);
                  return (value as number) ?? 0;
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Breakdown</h3>
          <p className="text-sm text-gray-500">Click a row to see orders for that day</p>
        </div>
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
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No data available.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.date}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(row.date)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
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
      {value === null ? (
        <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}
