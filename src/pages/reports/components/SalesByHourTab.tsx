import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { HourlyHeatmap } from '@/components/reports/HourlyHeatmap';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

export function SalesByHourTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-by-hour', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesByHour(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Aggregate by hour across all days
  const hourlyData = useMemo(() => {
    if (!data) return [];

    const hourMap = new Map<number, { orders: number; revenue: number; count: number }>();

    data.forEach((d) => {
      const hour = d.hour_of_day;
      const existing = hourMap.get(hour) || { orders: 0, revenue: 0, count: 0 };
      hourMap.set(hour, {
        orders: existing.orders + (d.order_count || 0),
        revenue: existing.revenue + (d.total_revenue || 0),
        count: existing.count + 1,
      });
    });

    // Fill all 24 hours
    const result = [];
    for (let h = 0; h < 24; h++) {
      const hourData = hourMap.get(h) || { orders: 0, revenue: 0, count: 0 };
      result.push({
        hour: h,
        label: `${h.toString().padStart(2, '0')}:00`,
        orders: hourData.orders,
        revenue: hourData.revenue,
        avgRevenue: hourData.count > 0 ? hourData.revenue / hourData.count : 0,
      });
    }

    return result;
  }, [data]);

  // Find peak hours
  const peakHours = useMemo(() => {
    if (hourlyData.length === 0) return { peakHour: 0, peakRevenue: 0, peakOrders: 0 };

    const sorted = [...hourlyData].sort((a, b) => b.revenue - a.revenue);
    const peak = sorted[0];

    return {
      peakHour: peak.hour,
      peakRevenue: peak.revenue,
      peakOrders: peak.orders,
    };
  }, [hourlyData]);

  // Totals
  const totals = useMemo(() => {
    return {
      totalRevenue: hourlyData.reduce((sum, h) => sum + h.revenue, 0),
      totalOrders: hourlyData.reduce((sum, h) => sum + h.orders, 0),
    };
  }, [hourlyData]);

  // Transform data for heatmap (extract day_of_week from report_date)
  const heatmapData = useMemo(() => {
    if (!data) return [];

    return data.map((d) => {
      const date = new Date(d.report_date);
      return {
        day_of_week: date.getDay(), // 0 = Sunday, 6 = Saturday
        hour_of_day: d.hour_of_day,
        total_revenue: d.total_revenue || 0,
        order_count: d.order_count || 0,
      };
    });
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<{ hour: number; label: string; orders: number; revenue: number }> = useMemo(() => ({
    data: hourlyData,
    columns: [
      { key: 'label', header: 'Heure' },
      { key: 'orders', header: 'Commandes', align: 'right' as const },
      { key: 'revenue', header: 'CA', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
    ],
    filename: 'ventes_par_heure',
    title: 'Ventes par Heure',
    dateRange,
    summaries: [
      { label: 'Heure de pointe', value: `${peakHours.peakHour.toString().padStart(2, '0')}:00` },
      { label: 'CA Total', value: formatCurrencyPdf(totals.totalRevenue) },
    ],
  }), [hourlyData, dateRange, peakHours, totals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  // Color based on revenue intensity
  const getBarColor = (revenue: number, maxRevenue: number) => {
    const intensity = maxRevenue > 0 ? revenue / maxRevenue : 0;
    if (intensity > 0.8) return '#10B981'; // Green - Peak
    if (intensity > 0.5) return '#3B82F6'; // Blue - High
    if (intensity > 0.2) return '#F59E0B'; // Orange - Medium
    return '#9CA3AF'; // Gray - Low
  };

  const maxRevenue = Math.max(...hourlyData.map((h) => h.revenue), 1);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Heure de pointe</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${peakHours.peakHour.toString().padStart(2, '0')}:00`}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">CA Heure pointe</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(peakHours.peakRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">CA Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(totals.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Total Commandes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totals.totalOrders}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribution des ventes par heure</h3>

        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), 'CA']}
                labelFormatter={(label) => `Heure: ${label}`}
              />
              <Bar dataKey="revenue" name="CA" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.revenue, maxRevenue)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Pointe (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">Élevé (50-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-sm text-gray-600">Moyen (20-50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400"></div>
            <span className="text-sm text-gray-600">Faible (&lt;20%)</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      {!isLoading && heatmapData.length > 0 && (
        <HourlyHeatmap data={heatmapData} />
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail par heure</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% du Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {hourlyData.filter((h) => h.orders > 0).map((row) => (
                <tr key={row.hour} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.label}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.orders}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(row.revenue)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${totals.totalRevenue > 0 ? (row.revenue / totals.totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-gray-600 w-12 text-right">
                        {totals.totalRevenue > 0 ? ((row.revenue / totals.totalRevenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
