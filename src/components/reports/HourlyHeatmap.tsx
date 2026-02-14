import { useMemo } from 'react';
import { formatCurrency } from '@/utils/helpers';

interface HourlyHeatmapProps {
  data: Array<{
    day_of_week: number; // 0 = Sunday, 6 = Saturday
    hour_of_day: number; // 0-23
    total_revenue: number;
    order_count: number;
  }>;
  onCellClick?: (day: number, hour: number) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function interpolateColor(intensity: number): string {
  // From transparent dark (0) to gold (1)
  if (intensity === 0) return 'rgba(255,255,255,0.02)';
  const r = Math.round(55 + intensity * 200);
  const g = Math.round(55 + intensity * 145);
  const b = Math.round(55 + intensity * 10);
  return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.6})`;
}

export function HourlyHeatmap({ data, onCellClick }: HourlyHeatmapProps) {
  // Create 7x24 grid
  const grid = useMemo(() => {
    const matrix: Array<Array<{ revenue: number; orders: number }>> = [];

    // Initialize empty grid
    for (let day = 0; day < 7; day++) {
      matrix[day] = [];
      for (let hour = 0; hour < 24; hour++) {
        matrix[day][hour] = { revenue: 0, orders: 0 };
      }
    }

    // Fill with data
    data.forEach((d) => {
      const day = d.day_of_week;
      const hour = d.hour_of_day;
      if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
        matrix[day][hour] = {
          revenue: matrix[day][hour].revenue + d.total_revenue,
          orders: matrix[day][hour].orders + d.order_count,
        };
      }
    });

    return matrix;
  }, [data]);

  // Find max revenue for intensity scaling
  const maxRevenue = useMemo(() => {
    let max = 0;
    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.revenue > max) max = cell.revenue;
      });
    });
    return max || 1;
  }, [grid]);

  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Sales Heatmap (Day x Hour)</h3>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex">
            <div className="w-12" /> {/* Spacer for day labels */}
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-[var(--theme-text-muted)] pb-1"
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {DAYS.map((dayName, dayIndex) => (
            <div key={dayIndex} className="flex items-center">
              {/* Day label */}
              <div className="w-12 text-sm font-medium text-[var(--theme-text-muted)] pr-2">
                {dayName}
              </div>

              {/* Hour cells */}
              {grid[dayIndex].map((cell, hour) => {
                const intensity = cell.revenue / maxRevenue;
                const bgColor = interpolateColor(intensity);

                return (
                  <div
                    key={hour}
                    className="flex-1 aspect-square min-h-[28px] border border-white/5 cursor-pointer transition-all hover:scale-110 hover:z-10 hover:shadow-md relative group"
                    style={{ backgroundColor: bgColor }}
                    onClick={() => onCellClick?.(dayIndex, hour)}
                    title={`${dayName} ${hour}:00 - ${formatCurrency(cell.revenue)} (${cell.orders} orders)`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                      <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap border border-white/10">
                        <div className="font-semibold">{dayName} {hour.toString().padStart(2, '0')}:00</div>
                        <div className="text-[var(--color-gold)]">{formatCurrency(cell.revenue)}</div>
                        <div>{cell.orders} orders</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-white/5">
            <span className="text-sm text-[var(--theme-text-muted)]">Intensity:</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: interpolateColor(0) }} />
              <span className="text-xs text-[var(--theme-text-muted)]">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: interpolateColor(0.5) }} />
              <span className="text-xs text-[var(--theme-text-muted)]">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: interpolateColor(1) }} />
              <span className="text-xs text-[var(--theme-text-muted)]">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HourlyHeatmap;
