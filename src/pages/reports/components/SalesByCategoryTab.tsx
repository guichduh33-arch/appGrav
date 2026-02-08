import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Loader2, ArrowLeft, Package } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { ReportBreadcrumb } from '@/components/reports/ReportBreadcrumb';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { useDrillDown } from '@/hooks/reports/useDrillDown';
import { formatCurrency } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';
import type { CategorySalesStat } from '@/types/reporting';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

interface ProductInCategory {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
  avg_price: number;
}

async function getProductsInCategory(categoryId: string, from: Date, to: Date): Promise<ProductInCategory[]> {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      unit_price,
      product:products!inner(id, name, category_id)
    `)
    .eq('product.category_id', categoryId)
    .gte('created_at', fromStr)
    .lte('created_at', toStr + 'T23:59:59');

  if (error) throw error;

  // Aggregate by product
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();

  for (const item of data || []) {
    const productData = item.product;
    const product = Array.isArray(productData) ? productData[0] : productData;
    if (!product) continue;

    const existing = productMap.get(product.id) || { name: product.name, qty: 0, revenue: 0 };
    existing.qty += item.quantity || 0;
    existing.revenue += (item.quantity || 0) * (item.unit_price || 0);
    productMap.set(product.id, existing);
  }

  return Array.from(productMap.entries())
    .map(([id, data]) => ({
      product_id: id,
      product_name: data.name,
      quantity_sold: data.qty,
      total_revenue: data.revenue,
      avg_price: data.qty > 0 ? data.revenue / data.qty : 0,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue);
}

export const SalesByCategoryTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const { isDrilledIn, currentParams, drillInto, drillReset, breadcrumbLevels } = useDrillDown({
    baseLevelName: 'Sales by Category',
    syncWithUrl: true,
  });

  // Main data query
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['salesByCategory', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesByCategory(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: !isDrilledIn,
  });

  // Drill-down data query
  const categoryId = currentParams?.categoryId;
  const categoryName = currentParams?.categoryName;
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['categoryProducts', categoryId, dateRange.from, dateRange.to],
    queryFn: () => getProductsInCategory(categoryId!, dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: isDrilledIn && !!categoryId,
  });

  const totalRevenue = useMemo(
    () => data.reduce((acc, curr) => acc + curr.total_revenue, 0),
    [data],
  );

  // Export config for main view
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

  // Export config for drill-down
  const productsExportConfig: ExportConfig<ProductInCategory> = useMemo(
    () => ({
      data: products,
      columns: [
        { key: 'product_name', header: 'Product' },
        { key: 'quantity_sold', header: 'Qty Sold', align: 'right' as const },
        { key: 'total_revenue', header: 'Revenue', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
        { key: 'avg_price', header: 'Avg Price', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
      ],
      filename: `category-${categoryName || 'products'}`,
      title: `Products in ${categoryName || 'Category'}`,
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [products, categoryName, dateRange],
  );

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    drillInto(categoryName, { categoryId, categoryName });
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading category sales data. Please try again.
      </div>
    );
  }

  // Drill-down view: Products in category
  if (isDrilledIn && categoryId) {
    const categoryTotal = products.reduce((s, p) => s + p.total_revenue, 0);

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
            Back to Categories
          </button>
          <ExportButtons config={productsExportConfig} />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Category Revenue</p>
            <p className="text-2xl font-bold text-blue-900">
              {productsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(categoryTotal)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Products</p>
            <p className="text-2xl font-bold text-green-900">
              {productsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : products.length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Total Qty Sold</p>
            <p className="text-2xl font-bold text-purple-900">
              {productsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : products.reduce((s, p) => s + p.quantity_sold, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Products in {categoryName}</h3>
          {productsLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No products found in this category.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, products.length * 40)}>
              <BarChart layout="vertical" data={products.slice(0, 15)} margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="product_name" width={150} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="total_revenue" name="Revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Products in {categoryName}</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((row) => (
                  <tr key={row.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        {row.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.quantity_sold}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(row.total_revenue)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(row.avg_price)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Main view: Categories
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
                  onClick={(_, index) => {
                    const category = data[index];
                    if (category) {
                      handleCategoryClick(category.category_id, category.category_name);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
          <p className="text-sm text-gray-500">Click a row to see products in that category</p>
        </div>
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
              data.map((row, index) => (
                <tr
                  key={row.category_id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleCategoryClick(row.category_id, row.category_name)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {row.category_name}
                    </div>
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
