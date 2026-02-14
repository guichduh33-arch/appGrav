import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { useDrillDown } from '@/hooks/reports/useDrillDown';
import { formatCurrency } from '@/utils/helpers';
import type { CategorySalesStat } from '@/types/reporting';
import { SalesByCategoryDrillDown } from './SalesByCategoryDrillDown';

const COLORS = ['#D4A843', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const SalesByCategoryTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const { isDrilledIn, currentParams, drillInto, drillReset, breadcrumbLevels } = useDrillDown({
    baseLevelName: 'Sales by Category', syncWithUrl: true,
  });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['salesByCategory', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesByCategory(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: !isDrilledIn,
  });

  const totalRevenue = useMemo(() => data.reduce((acc, curr) => acc + curr.total_revenue, 0), [data]);

  const exportConfig: ExportConfig<CategorySalesStat> = useMemo(() => ({
    data,
    columns: [
      { key: 'category_name', header: 'Category' },
      { key: 'transaction_count', header: 'Qty Sold' },
      { key: 'total_revenue', header: 'Revenue', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
      { key: 'total_revenue' as keyof CategorySalesStat, header: '% Total', align: 'right' as const, format: (v: unknown) => totalRevenue > 0 ? (((v as number) / totalRevenue) * 100).toFixed(1) + '%' : '0%' },
    ],
    filename: 'sales-by-category',
    title: 'Sales By Category',
    dateRange: { from: dateRange.from, to: dateRange.to },
  }), [data, dateRange, totalRevenue]);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    drillInto(categoryName, { categoryId, categoryName });
  };

  if (error) return <div className="p-8 text-center text-red-400">Error loading category sales data. Please try again.</div>;
  if (isLoading) return <ReportSkeleton />;

  if (isDrilledIn && currentParams?.categoryId) {
    return (
      <SalesByCategoryDrillDown
        categoryId={currentParams.categoryId}
        categoryName={currentParams.categoryName || ''}
        dateRange={dateRange}
        breadcrumbLevels={breadcrumbLevels}
        onDrillReset={drillReset}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5 h-80">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--theme-text-muted)]">No data available for this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  // @ts-expect-error -- recharts ChartDataInput requires index signature; interface CategorySalesStat lacks it
                  data={data}
                  cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8"
                  dataKey="total_revenue" nameKey="category_name"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  onClick={(_, index) => { const cat = data[index]; if (cat) handleCategoryClick(cat.category_id, cat.category_name); }}
                  style={{ cursor: 'pointer' }}
                >
                  {data.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
            <p className="text-sm text-blue-400 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-medium">Top Category</p>
            <p className="text-lg font-bold text-white">{data.length > 0 ? data[0].category_name : '-'}</p>
            <p className="text-xs text-emerald-400/70">{data.length > 0 ? formatCurrency(data[0].total_revenue) : ''}</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
          <p className="text-sm text-[var(--theme-text-muted)]">Click a row to see products in that category</p>
        </div>
        <table className="min-w-full">
          <thead className="bg-white/[0.02]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Category</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Qty Sold</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">% Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">No data available.</td></tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.category_id} className="hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => handleCategoryClick(row.category_id, row.category_name)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-gold)]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {row.category_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--theme-text-muted)] text-right">{row.transaction_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">{formatCurrency(row.total_revenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--theme-text-muted)] text-right">
                    {totalRevenue > 0 ? ((row.total_revenue / totalRevenue) * 100).toFixed(1) + '%' : '0%'}
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
