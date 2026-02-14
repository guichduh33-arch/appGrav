import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ComparisonToggle } from '@/components/reports/ComparisonToggle';
import { DualSeriesLineChart, prepareDualSeriesData } from '@/components/reports/DualSeriesLineChart';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { useDrillDown } from '@/hooks/reports/useDrillDown';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { formatCurrency } from '@/utils/helpers';
import type { DailySalesStat } from '@/types/reporting';
import { DailySalesDrillDown } from './DailySalesDrillDown';

function KpiCard({ icon, bg, label, value }: {
  icon: React.ReactNode; bg: string; label: string; value: string | null;
}) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
        <span className="text-sm text-[var(--theme-text-muted)]">{label}</span>
      </div>
      {value === null ? (
        <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

export const DailySalesTab = () => {
  const {
    dateRange, comparisonRange, comparisonType, setComparisonType, isComparisonEnabled,
  } = useDateRange({ defaultPreset: 'last30days', enableComparison: true });
  const filtersState = useReportFilters({
    enabledFilters: ['category', 'order_type'],
    syncWithUrl: true,
  });
  const { isDrilledIn, currentParams, drillInto, drillReset, breadcrumbLevels } = useDrillDown({
    baseLevelName: 'Daily Sales',
    syncWithUrl: true,
  });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['dailySales', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getDailySales(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: !isDrilledIn,
  });

  const { data: comparisonData = [] } = useQuery({
    queryKey: ['dailySales-comparison', comparisonRange?.from, comparisonRange?.to],
    queryFn: () => ReportingService.getDailySales(comparisonRange!.from, comparisonRange!.to),
    staleTime: 5 * 60 * 1000,
    enabled: isComparisonEnabled && !!comparisonRange && !isDrilledIn,
  });

  const dualSeriesData = useMemo(() => {
    if (!isComparisonEnabled || comparisonData.length === 0) return [];
    return prepareDualSeriesData<DailySalesStat>(data, comparisonData, {
      valueKey: 'total_sales', labelKey: 'date', currentDateKey: 'date', previousDateKey: 'date',
    });
  }, [data, comparisonData, isComparisonEnabled]);

  const totals = useMemo(() => {
    if (data.length === 0) return { revenue: 0, orders: 0, avgDaily: 0, avgBasket: 0 };
    const revenue = data.reduce((s, d) => s + (d.total_sales || 0), 0);
    const orderCount = data.reduce((s, d) => s + (d.total_orders || 0), 0);
    return { revenue, orders: orderCount, avgDaily: revenue / data.length, avgBasket: orderCount > 0 ? revenue / orderCount : 0 };
  }, [data]);

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

  const handleRowClick = (date: string) => {
    const formattedDate = new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
    drillInto(formattedDate, { date });
  };

  if (error) {
    return <div className="p-8 text-center text-red-400">Error loading daily sales data. Please try again.</div>;
  }

  if (isLoading) return <ReportSkeleton />;

  if (isDrilledIn && currentParams?.date) {
    return <DailySalesDrillDown drillDate={currentParams.date} breadcrumbLevels={breadcrumbLevels} onDrillReset={drillReset} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <div className="flex items-center gap-3">
          <ComparisonToggle comparisonType={comparisonType} comparisonRange={comparisonRange} onComparisonTypeChange={setComparisonType} />
          <ExportButtons config={exportConfig} />
        </div>
      </div>

      <ReportFilters filtersState={filtersState} enabledFilters={['category', 'order_type']} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<DollarSign className="w-5 h-5 text-blue-400" />} bg="bg-blue-500/10" label="Total Revenue" value={formatCurrency(totals.revenue)} />
        <KpiCard icon={<ShoppingCart className="w-5 h-5 text-emerald-400" />} bg="bg-emerald-500/10" label="Total Orders" value={totals.orders.toLocaleString()} />
        <KpiCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} bg="bg-purple-500/10" label="Avg Daily Revenue" value={formatCurrency(totals.avgDaily)} />
        <KpiCard icon={<DollarSign className="w-5 h-5 text-amber-400" />} bg="bg-amber-500/10" label="Avg Basket" value={formatCurrency(totals.avgBasket)} />
      </div>

      {isComparisonEnabled && dualSeriesData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Period Comparison</h3>
          <DualSeriesLineChart data={dualSeriesData} currentLabel="Current period" previousLabel={comparisonType === 'last_year' ? 'Same period last year' : 'Previous period'} format="currency" height={300} />
        </div>
      )}

      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Sales Performance</h3>
        {data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[var(--theme-text-muted)]">No data available for this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis yAxisId="left" orientation="left" stroke="var(--color-gold)" tick={{ fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: 'rgba(255,255,255,0.4)' }} />
              <Tooltip formatter={(value, name) => { if (name === 'Revenue' || name === 'Net Revenue') return formatCurrency((value as number) ?? 0); return (value as number) ?? 0; }} labelFormatter={(label) => new Date(label).toLocaleDateString()} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
              <Bar yAxisId="left" dataKey="total_sales" name="Revenue" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="total_orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Daily Breakdown</h3>
          <p className="text-sm text-[var(--theme-text-muted)]">Click a row to see orders for that day</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Orders</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Net (ex. Tax)</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Avg Basket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">No data available.</td></tr>
              ) : (
                data.map((row) => (
                  <tr key={row.date} className="hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => handleRowClick(row.date)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-gold)] font-medium">
                      {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--theme-text-muted)] text-right">{row.total_orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">{formatCurrency(row.total_sales)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--theme-text-muted)] text-right">{formatCurrency(row.net_revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--theme-text-muted)] text-right">{formatCurrency(row.avg_basket)}</td>
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
