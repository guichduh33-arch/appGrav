import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Clock, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { HourlyHeatmap } from '@/components/reports/HourlyHeatmap';
import { ComparisonToggle } from '@/components/reports/ComparisonToggle';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import { SalesByHourTable } from './SalesByHourTable';

export function SalesByHourTab() {
  const {
    dateRange, comparisonRange, comparisonType, setComparisonType, isComparisonEnabled,
  } = useDateRange({ defaultPreset: 'last7days', enableComparison: true });

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-by-hour', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesByHour(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const { data: comparisonRawData } = useQuery({
    queryKey: ['sales-by-hour-comparison', comparisonRange?.from, comparisonRange?.to],
    queryFn: () => ReportingService.getSalesByHour(comparisonRange!.from, comparisonRange!.to),
    staleTime: 5 * 60 * 1000,
    enabled: isComparisonEnabled && !!comparisonRange,
  });

  const hourlyData = useMemo(() => {
    if (!data) return [];
    const hourMap = new Map<number, { orders: number; revenue: number; count: number }>();
    data.forEach((d) => {
      const hour = d.hour_of_day;
      const existing = hourMap.get(hour) || { orders: 0, revenue: 0, count: 0 };
      hourMap.set(hour, { orders: existing.orders + (d.order_count || 0), revenue: existing.revenue + (d.total_revenue || 0), count: existing.count + 1 });
    });
    const result = [];
    for (let h = 0; h < 24; h++) {
      const hd = hourMap.get(h) || { orders: 0, revenue: 0, count: 0 };
      result.push({ hour: h, label: `${h.toString().padStart(2, '0')}:00`, orders: hd.orders, revenue: hd.revenue, avgRevenue: hd.count > 0 ? hd.revenue / hd.count : 0 });
    }
    return result;
  }, [data]);

  const comparisonHourlyData = useMemo(() => {
    if (!comparisonRawData || !isComparisonEnabled) return [];
    const hourMap = new Map<number, { orders: number; revenue: number; count: number }>();
    comparisonRawData.forEach((d) => {
      const hour = d.hour_of_day;
      const existing = hourMap.get(hour) || { orders: 0, revenue: 0, count: 0 };
      hourMap.set(hour, { orders: existing.orders + (d.order_count || 0), revenue: existing.revenue + (d.total_revenue || 0), count: existing.count + 1 });
    });
    const result = [];
    for (let h = 0; h < 24; h++) {
      const hd = hourMap.get(h) || { orders: 0, revenue: 0, count: 0 };
      result.push({ hour: h, label: `${h.toString().padStart(2, '0')}:00`, orders: hd.orders, revenue: hd.revenue });
    }
    return result;
  }, [comparisonRawData, isComparisonEnabled]);

  const groupedData = useMemo(() => {
    if (!isComparisonEnabled || comparisonHourlyData.length === 0) return [];
    return hourlyData.map((h, i) => ({ label: h.label, current: h.revenue, previous: comparisonHourlyData[i]?.revenue ?? 0 }));
  }, [hourlyData, comparisonHourlyData, isComparisonEnabled]);

  const peakHours = useMemo(() => {
    if (hourlyData.length === 0) return { peakHour: 0, peakRevenue: 0, peakOrders: 0 };
    const sorted = [...hourlyData].sort((a, b) => b.revenue - a.revenue);
    return { peakHour: sorted[0].hour, peakRevenue: sorted[0].revenue, peakOrders: sorted[0].orders };
  }, [hourlyData]);

  const totals = useMemo(() => ({
    totalRevenue: hourlyData.reduce((sum, h) => sum + h.revenue, 0),
    totalOrders: hourlyData.reduce((sum, h) => sum + h.orders, 0),
  }), [hourlyData]);

  const heatmapData = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({ day_of_week: new Date(d.report_date).getDay(), hour_of_day: d.hour_of_day, total_revenue: d.total_revenue || 0, order_count: d.order_count || 0 }));
  }, [data]);

  const exportConfig: ExportConfig<{ hour: number; label: string; orders: number; revenue: number }> = useMemo(() => ({
    data: hourlyData,
    columns: [
      { key: 'label', header: 'Hour' },
      { key: 'orders', header: 'Orders', align: 'right' as const },
      { key: 'revenue', header: 'Revenue', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
    ],
    filename: 'sales-by-hour',
    title: 'Sales by Hour',
    dateRange,
    summaries: [
      { label: 'Peak Hour', value: `${peakHours.peakHour.toString().padStart(2, '0')}:00` },
      { label: 'Total Revenue', value: formatCurrencyPdf(totals.totalRevenue) },
    ],
  }), [hourlyData, dateRange, peakHours, totals]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';

  const getBarColor = (revenue: number, maxRevenue: number) => {
    const intensity = maxRevenue > 0 ? revenue / maxRevenue : 0;
    if (intensity > 0.8) return '#10B981';
    if (intensity > 0.5) return '#3B82F6';
    if (intensity > 0.2) return '#F59E0B';
    return 'rgba(255,255,255,0.15)';
  };

  const maxRevenue = Math.max(...hourlyData.map((h) => h.revenue), 1);

  if (error) return <div className="p-8 text-center text-red-400">Error loading data</div>;
  if (isLoading) return <ReportSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
        <div className="flex items-center gap-3">
          <ComparisonToggle comparisonType={comparisonType} comparisonRange={comparisonRange} onComparisonTypeChange={setComparisonType} />
          <ExportButtons config={exportConfig} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-emerald-500/10 rounded-lg"><Clock className="w-5 h-5 text-emerald-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Peak Hour</span></div>
          <p className="text-2xl font-bold text-emerald-400">{`${peakHours.peakHour.toString().padStart(2, '0')}:00`}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Peak Hour Revenue</span></div>
          <p className="text-2xl font-bold text-white">{formatCurrency(peakHours.peakRevenue)}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-purple-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Total Revenue</span></div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totals.totalRevenue)}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-amber-500/10 rounded-lg"><ShoppingCart className="w-5 h-5 text-amber-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Total Orders</span></div>
          <p className="text-2xl font-bold text-white">{totals.totalOrders}</p>
        </div>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Sales Distribution by Hour</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} interval={1} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} />
            <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} labelFormatter={(label) => `Hour: ${label}`} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
            <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
              {hourlyData.map((entry, index) => (<Cell key={`cell-${index}`} fill={getBarColor(entry.revenue, maxRevenue)} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div><span className="text-sm text-[var(--theme-text-muted)]">Peak (80%+)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div><span className="text-sm text-[var(--theme-text-muted)]">High (50-80%)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div><span className="text-sm text-[var(--theme-text-muted)]">Medium (20-50%)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/15"></div><span className="text-sm text-[var(--theme-text-muted)]">Low (&lt;20%)</span></div>
        </div>
      </div>

      {isComparisonEnabled && groupedData.length > 0 && (
        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Hourly Comparison: Current vs {comparisonType === 'last_year' ? 'Last Year' : 'Previous Period'}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} interval={1} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} />
              <Tooltip formatter={(value, name) => [formatCurrency(value as number), name === 'current' ? 'Current' : 'Previous']} labelFormatter={(label) => `Hour: ${label}`} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Legend formatter={(value) => value === 'current' ? 'Current Period' : 'Previous Period'} wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
              <Bar dataKey="current" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="previous" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {heatmapData.length > 0 && <HourlyHeatmap data={heatmapData} />}

      <SalesByHourTable hourlyData={hourlyData} totalRevenue={totals.totalRevenue} formatCurrency={formatCurrency} />
    </div>
  );
}
