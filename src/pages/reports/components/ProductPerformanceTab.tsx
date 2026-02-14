import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowLeft } from 'lucide-react';
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
import { DrillDownKpis } from './product-performance/DrillDownKpis';
import { DrillDownChart } from './product-performance/DrillDownChart';
import { DrillDownTable } from './product-performance/DrillDownTable';
import { ProductTable } from './product-performance/ProductTable';

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
      order_count: data.orders.size || 1,
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

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['productPerformance', dateRange.from, dateRange.to, filters.category, filters.order_type],
    queryFn: () => ReportingService.getProductPerformance(
      dateRange.from, dateRange.to,
      { categoryId: filters.category, orderType: filters.order_type }
    ),
    staleTime: 5 * 60 * 1000,
    enabled: !isDrilledIn,
  });

  const productId = currentParams?.productId;
  const productName = currentParams?.productName;
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['productHistory', productId, dateRange.from, dateRange.to],
    queryFn: () => getProductSalesHistory(productId!, dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: isDrilledIn && !!productId,
  });

  const top10 = useMemo(() => products.slice(0, 10), [products]);

  const exportConfig: ExportConfig<ProductPerformanceStat> = useMemo(
    () => ({
      data: products,
      columns: [
        { key: 'product_name', header: 'Product' },
        { key: 'category_name', header: 'Category' },
        { key: 'quantity_sold', header: 'Qty Sold', align: 'right' as const },
        { key: 'total_revenue', header: 'Revenue', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
        { key: 'avg_price', header: 'Avg Price', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
        { key: 'margin_percentage', header: 'Margin %', align: 'right' as const, format: (v: unknown) => `${(v as number).toFixed(1)}%` },
      ],
      filename: 'product-performance',
      title: 'Product Performance',
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [products, dateRange],
  );

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
      <div className="p-8 text-center text-red-400">
        Error loading product performance data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  // Drill-down view
  if (isDrilledIn && productId) {
    const totals = {
      revenue: history.reduce((s, h) => s + h.revenue, 0),
      quantity: history.reduce((s, h) => s + h.quantity, 0),
      avgDaily: history.length > 0 ? history.reduce((s, h) => s + h.revenue, 0) / history.length : 0,
    };

    return (
      <div className="space-y-6">
        <ReportBreadcrumb levels={breadcrumbLevels} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={drillReset}
            className="flex items-center gap-2 text-[var(--color-gold)] hover:text-[var(--color-gold-light)] text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <ExportButtons config={historyExportConfig} />
        </div>
        <DrillDownKpis totals={totals} isLoading={historyLoading} />
        <DrillDownChart productName={productName || ''} history={history} isLoading={historyLoading} />
        <DrillDownTable productName={productName || ''} history={history} isLoading={historyLoading} />
      </div>
    );
  }

  // Main view
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <ReportFilters filtersState={filtersState} enabledFilters={['category', 'order_type']} />

      {/* Chart - Top 10 */}
      <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-4">Top 10 Products by Revenue</h3>
        {top10.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[var(--muted-smoke)]">
            No data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart layout="vertical" data={top10} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'var(--muted-smoke)', fontSize: 11 }} />
              <YAxis type="category" dataKey="product_name" width={150} stroke="rgba(255,255,255,0.3)" tick={{ fill: '#fff', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar
                dataKey="total_revenue"
                name="Revenue"
                fill="var(--color-gold)"
                radius={[0, 4, 4, 0]}
                onClick={(_, index) => {
                  const product = top10[index];
                  if (product) handleProductClick(product.product_id, product.product_name);
                }}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <ProductTable products={products} onProductClick={handleProductClick} />
    </div>
  );
};
