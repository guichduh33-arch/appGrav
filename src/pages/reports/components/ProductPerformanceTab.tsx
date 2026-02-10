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
  LineChart,
  Line,
} from 'recharts';
import { Package, Loader2, ArrowLeft, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { ReportBreadcrumb } from '@/components/reports/ReportBreadcrumb';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { useDrillDown } from '@/hooks/reports/useDrillDown';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { formatCurrency } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';
import type { ProductPerformanceStat } from '@/types/reporting';

interface ProductDailySales {
  date: string;
  quantity: number;
  revenue: number;
  order_count: number;
}

async function getProductSalesHistory(productId: string, from: Date, to: Date): Promise<ProductDailySales[]> {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      unit_price,
      order:orders!inner(created_at)
    `)
    .eq('product_id', productId)
    .gte('order.created_at', fromStr)
    .lte('order.created_at', toStr + 'T23:59:59');

  if (error) throw error;

  // Aggregate by date
  const dateMap = new Map<string, { qty: number; revenue: number; orders: Set<string> }>();

  for (const item of data || []) {
    const orderRaw = item.order;
    const orderData = Array.isArray(orderRaw) ? orderRaw[0] : orderRaw;
    if (!orderData?.created_at) continue;

    const date = orderData.created_at.split('T')[0];
    const existing = dateMap.get(date) || { qty: 0, revenue: 0, orders: new Set<string>() };
    existing.qty += item.quantity || 0;
    existing.revenue += (item.quantity || 0) * (item.unit_price || 0);
    dateMap.set(date, existing);
  }

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      quantity: data.qty,
      revenue: data.revenue,
      order_count: data.orders.size || 1, // At least 1 order per day with items
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const ProductPerformanceTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const filtersState = useReportFilters({
    enabledFilters: ['category', 'order_type'],
    syncWithUrl: true,
  });
  const { filters } = filtersState;
  const { isDrilledIn, currentParams, drillInto, drillReset, breadcrumbLevels } = useDrillDown({
    baseLevelName: 'Product Performance',
    syncWithUrl: true,
  });

  // Main data query
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['productPerformance', dateRange.from, dateRange.to, filters.category, filters.order_type],
    queryFn: () => ReportingService.getProductPerformance(
      dateRange.from, dateRange.to,
      { categoryId: filters.category, orderType: filters.order_type }
    ),
    staleTime: 5 * 60 * 1000,
    enabled: !isDrilledIn,
  });

  // Drill-down data query
  const productId = currentParams?.productId;
  const productName = currentParams?.productName;
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['productHistory', productId, dateRange.from, dateRange.to],
    queryFn: () => getProductSalesHistory(productId!, dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: isDrilledIn && !!productId,
  });

  const top10 = useMemo(() => products.slice(0, 10), [products]);

  // Export config for main view
  const exportConfig: ExportConfig<ProductPerformanceStat> = useMemo(
    () => ({
      data: products,
      columns: [
        { key: 'product_name', header: 'Product' },
        { key: 'category_name', header: 'Category' },
        { key: 'quantity_sold', header: 'Qty Sold', align: 'right' as const },
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
        {
          key: 'margin_percentage',
          header: 'Margin %',
          align: 'right' as const,
          format: (v: unknown) => `${(v as number).toFixed(1)}%`,
        },
      ],
      filename: 'product-performance',
      title: 'Product Performance',
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [products, dateRange],
  );

  // Export config for drill-down
  const historyExportConfig: ExportConfig<ProductDailySales> = useMemo(
    () => ({
      data: history,
      columns: [
        { key: 'date', header: 'Date', format: (v: unknown) => new Date(v as string).toLocaleDateString() },
        { key: 'quantity', header: 'Qty Sold', align: 'right' as const },
        { key: 'revenue', header: 'Revenue', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
      ],
      filename: `product-${productName || 'history'}`,
      title: `Sales History: ${productName || 'Product'}`,
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [history, productName, dateRange],
  );

  const handleProductClick = (productId: string, productName: string) => {
    drillInto(productName, { productId, productName });
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading product performance data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  // Drill-down view: Product sales history
  if (isDrilledIn && productId) {
    const totals = {
      revenue: history.reduce((s, h) => s + h.revenue, 0),
      quantity: history.reduce((s, h) => s + h.quantity, 0),
      avgDaily: history.length > 0 ? history.reduce((s, h) => s + h.revenue, 0) / history.length : 0,
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
            Back to Products
          </button>
          <ExportButtons config={historyExportConfig} />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {historyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(totals.revenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Total Qty Sold</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {historyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totals.quantity.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Avg Daily Revenue</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {historyLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(totals.avgDaily)}
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend: {productName}</h3>
          {historyLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No sales data for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={history} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'Revenue' ? formatCurrency(value as number) : value,
                    name
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="quantity" name="Quantity" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Daily Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Daily Sales: {productName}</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    No sales data.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.quantity}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Main view: Product Performance
  return (
    <div className="space-y-6">
      {/* Header: DateRangePicker + ExportButtons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* Filters */}
      <ReportFilters
        filtersState={filtersState}
        enabledFilters={['category', 'order_type']}
      />

      {/* Chart - Top 10 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Products by Revenue</h3>
        {top10.length === 0 ? (
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
              <Bar
                dataKey="total_revenue"
                name="Revenue"
                fill="#4f46e5"
                radius={[0, 4, 4, 0]}
                onClick={(_, index) => {
                  const product = top10[index];
                  if (product) {
                    handleProductClick(product.product_id, product.product_name);
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Full Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Products</h3>
          <p className="text-sm text-gray-500">Click a row to see sales history</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No data available.
                </td>
              </tr>
            ) : (
              products.map((row) => (
                <tr
                  key={row.product_id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleProductClick(row.product_id, row.product_name)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      {row.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.category_name || 'Uncategorized'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${(row.margin_percentage || 0) >= 30 ? 'text-green-600' : (row.margin_percentage || 0) >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {(row.margin_percentage || 0).toFixed(1)}%
                    </span>
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
