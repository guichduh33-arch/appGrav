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

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--onyx-surface)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.75rem',
  color: '#fff',
};

export function ServiceSpeedTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['kds-service-speed', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getKdsServiceSpeed(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

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
    return <div className="p-8 text-center text-red-400">Error loading data</div>;
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Timer className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Avg Prep Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(summary.avgPrep)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Fastest Station</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{summary.fastest}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Slowest Station</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{summary.slowest}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Items Prepared</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalItems.toLocaleString()}</p>
        </div>
      </div>

      {/* Avg Prep Time by Station */}
      {stationStats.length > 0 && (
        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Average Prep Time by Station</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stationStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fontSize: 13, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
              <YAxis
                tickFormatter={(v) => formatTime(v)}
                tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                stroke="rgba(255,255,255,0.1)"
                label={{ value: 'Prep Time', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--theme-text-muted)' } }}
              />
              <Tooltip
                formatter={(value) => [formatTime(Number(value)), 'Avg Prep Time']}
                labelFormatter={(label) => `Station: ${label}`}
                contentStyle={TOOLTIP_STYLE}
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
        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Average Prep Time by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" interval={0} />
              <YAxis
                tickFormatter={(v) => formatTime(v)}
                tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                stroke="rgba(255,255,255,0.1)"
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'avgSeconds') return [formatTime(Number(value)), 'Avg Prep Time'];
                  return [Number(value), 'Items'];
                }}
                labelFormatter={(label) => `Hour: ${label}`}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend
                formatter={(value) => value === 'avgSeconds' ? 'Avg Prep Time' : 'Items'}
                wrapperStyle={{ color: 'var(--theme-text-muted)' }}
              />
              <Bar dataKey="avgSeconds" name="avgSeconds" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Station Breakdown Table */}
      {stationStats.length > 0 && (
        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Station Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Station</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Items</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Avg Time</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Min Time</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Max Time</th>
                </tr>
              </thead>
              <tbody>
                {stationStats.map((row) => (
                  <tr key={row.station} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.fill }} />
                        {row.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.itemCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-white text-right font-medium">{formatTime(row.avgSeconds)}</td>
                    <td className="px-6 py-4 text-sm text-emerald-400 text-right">{formatTime(row.minSeconds)}</td>
                    <td className="px-6 py-4 text-sm text-red-400 text-right">{formatTime(row.maxSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stationStats.length === 0 && (
        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-12 text-center">
          <Timer className="mx-auto mb-4 text-[var(--theme-text-muted)]" size={48} />
          <h3 className="text-lg font-semibold text-[var(--theme-text-muted)] mb-2">No Data Available</h3>
          <p className="text-sm text-[var(--theme-text-muted)]">No prepared items found for the selected date range.</p>
        </div>
      )}
    </div>
  );
}
