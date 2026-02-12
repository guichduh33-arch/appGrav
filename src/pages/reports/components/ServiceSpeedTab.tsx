import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Timer, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { useDateRange } from '@/hooks/reports/useDateRange';

const STATION_COLORS: Record<string, string> = {
  kitchen: '#EF4444',
  barista: '#8B5CF6',
  display: '#10B981',
};

const STATION_LABELS: Record<string, string> = {
  kitchen: 'Kitchen',
  barista: 'Barista',
  display: 'Display',
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function ServiceSpeedTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['kds-service-speed', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getKdsServiceSpeed(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Aggregate by station
  const stationStats = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map<string, { totalSeconds: number; count: number; max: number; min: number }>();

    for (const row of data) {
      const existing = map.get(row.dispatch_station) || { totalSeconds: 0, count: 0, max: 0, min: Infinity };
      existing.totalSeconds += Number(row.avg_prep_seconds) * row.item_count;
      existing.count += row.item_count;
      existing.max = Math.max(existing.max, row.max_prep_seconds);
      existing.min = Math.min(existing.min, row.min_prep_seconds);
      map.set(row.dispatch_station, existing);
    }

    return Array.from(map.entries()).map(([station, stats]) => ({
      station,
      label: STATION_LABELS[station] || station,
      avgSeconds: stats.count > 0 ? Math.round(stats.totalSeconds / stats.count) : 0,
      maxSeconds: stats.max,
      minSeconds: stats.min === Infinity ? 0 : stats.min,
      itemCount: stats.count,
      fill: STATION_COLORS[station] || '#6B7280',
    }));
  }, [data]);

  // Aggregate by hour
  const hourlyStats = useMemo(() => {
    if (!data || data.length === 0) return [];

    const hourMap = new Map<number, { totalSeconds: number; count: number }>();

    for (const row of data) {
      const existing = hourMap.get(row.hour_of_day) || { totalSeconds: 0, count: 0 };
      existing.totalSeconds += Number(row.avg_prep_seconds) * row.item_count;
      existing.count += row.item_count;
      hourMap.set(row.hour_of_day, existing);
    }

    const result = [];
    for (let h = 0; h < 24; h++) {
      const hourData = hourMap.get(h);
      if (hourData && hourData.count > 0) {
        result.push({
          hour: h,
          label: `${h.toString().padStart(2, '0')}:00`,
          avgSeconds: Math.round(hourData.totalSeconds / hourData.count),
          items: hourData.count,
        });
      }
    }
    return result;
  }, [data]);

  // Summary stats
  const summary = useMemo(() => {
    if (stationStats.length === 0) {
      return { avgPrep: 0, fastest: '-', slowest: '-', totalItems: 0 };
    }

    const totalItems = stationStats.reduce((sum, s) => sum + s.itemCount, 0);
    const weightedAvg = stationStats.reduce((sum, s) => sum + s.avgSeconds * s.itemCount, 0) / totalItems;

    const sorted = [...stationStats].sort((a, b) => a.avgSeconds - b.avgSeconds);
    return {
      avgPrep: Math.round(weightedAvg),
      fastest: sorted[0]?.label || '-',
      slowest: sorted[sorted.length - 1]?.label || '-',
      totalItems,
    };
  }, [stationStats]);

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading data</div>;
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Timer className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Avg Prep Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatTime(summary.avgPrep)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Fastest Station</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{summary.fastest}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Slowest Station</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{summary.slowest}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Items Prepared</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.totalItems.toLocaleString()}</p>
        </div>
      </div>

      {/* Avg Prep Time by Station */}
      {stationStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Average Prep Time by Station</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stationStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 13 }} />
              <YAxis
                tickFormatter={(v) => formatTime(v)}
                tick={{ fontSize: 12 }}
                label={{ value: 'Prep Time', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                formatter={(value) => [formatTime(Number(value)), 'Avg Prep Time']}
                labelFormatter={(label) => `Station: ${label}`}
              />
              <Bar dataKey="avgSeconds" name="Avg Prep Time" radius={[6, 6, 0, 0]}>
                {stationStats.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Avg Prep Time by Hour */}
      {hourlyStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Average Prep Time by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
              <YAxis
                tickFormatter={(v) => formatTime(v)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'avgSeconds') return [formatTime(Number(value)), 'Avg Prep Time'];
                  return [Number(value), 'Items'];
                }}
                labelFormatter={(label) => `Hour: ${label}`}
              />
              <Legend formatter={(value) => value === 'avgSeconds' ? 'Avg Prep Time' : 'Items'} />
              <Bar dataKey="avgSeconds" name="avgSeconds" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Table */}
      {stationStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Station Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Min Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Max Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stationStats.map((row) => (
                  <tr key={row.station} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.fill }} />
                        {row.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.itemCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatTime(row.avgSeconds)}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">{formatTime(row.minSeconds)}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right">{formatTime(row.maxSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stationStats.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Timer className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-500">No prepared items found for the selected date range.</p>
        </div>
      )}
    </div>
  );
}
