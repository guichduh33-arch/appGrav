import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Payload, ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency } from '@/utils/helpers';

export interface DualSeriesDataPoint {
  /** X-axis label (e.g., "Day 1", "Jan", etc.) */
  label: string;
  /** Current period value */
  current: number;
  /** Previous/comparison period value */
  previous?: number | null;
  /** Original date for current period (for tooltip) */
  currentDate?: string;
  /** Original date for previous period (for tooltip) */
  previousDate?: string;
}

export interface DualSeriesLineChartProps {
  data: DualSeriesDataPoint[];
  /** Label for current period line */
  currentLabel?: string;
  /** Label for previous period line */
  previousLabel?: string;
  /** Value format type */
  format?: 'currency' | 'number' | 'percent';
  /** Height of the chart */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Color for current period line */
  currentColor?: string;
  /** Color for previous period line */
  previousColor?: string;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
  format?: 'currency' | 'number' | 'percent';
  currentLabel?: string;
  previousLabel?: string;
}

/**
 * Custom tooltip for dual series chart
 */
function CustomTooltip({
  active,
  payload,
  format = 'currency',
  currentLabel,
  previousLabel,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString('en-US');
    }
  };

  const currentData = payload.find((p) => p.dataKey === 'current');
  const previousData = payload.find((p) => p.dataKey === 'previous');
  const dataPoint = payload[0]?.payload as DualSeriesDataPoint | undefined;

  const currentValue = typeof currentData?.value === 'number' ? currentData.value : undefined;
  const previousValue = typeof previousData?.value === 'number' ? previousData.value : undefined;

  return (
    <div className="bg-black border border-white/10 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-medium text-white mb-2">{dataPoint?.label}</p>

      {currentValue !== undefined && (
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-0.5 bg-[var(--color-gold)]" />
          <span className="text-[var(--theme-text-muted)]">{currentLabel}:</span>
          <span className="font-medium text-white">{formatValue(currentValue)}</span>
          {dataPoint?.currentDate && (
            <span className="text-white/40 text-xs">({dataPoint.currentDate})</span>
          )}
        </div>
      )}

      {previousValue !== undefined && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-white/40" style={{ borderStyle: 'dashed' }} />
          <span className="text-[var(--theme-text-muted)]">{previousLabel}:</span>
          <span className="font-medium text-white">{formatValue(previousValue)}</span>
          {dataPoint?.previousDate && (
            <span className="text-white/40 text-xs">({dataPoint.previousDate})</span>
          )}
        </div>
      )}

      {/* Variation */}
      {currentValue !== undefined && previousValue !== undefined && previousValue !== 0 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          {(() => {
            const variation = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
            const isPositive = variation > 0;
            return (
              <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{variation.toFixed(1)}% vs previous
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/**
 * Dual series line chart for period comparison
 * Displays current and previous period data on the same chart
 */
export function DualSeriesLineChart({
  data,
  currentLabel = 'This period',
  previousLabel = 'Previous period',
  format = 'currency',
  height = 300,
  showGrid = true,
  currentColor = 'var(--color-gold)',
  previousColor = 'rgba(255,255,255,0.3)',
  className = '',
}: DualSeriesLineChartProps) {
  const hasPreviousData = data.some((d) => d.previous !== null && d.previous !== undefined);

  const formatYAxis = (value: number): string => {
    switch (format) {
      case 'currency':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return formatCurrency(value);
      case 'percent':
        return `${value}%`;
      case 'number':
      default:
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toLocaleString('en-US');
    }
  };

  return (
    <div className={`bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6 ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />}

          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />

          <YAxis
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={formatYAxis}
          />

          <Tooltip
            content={
              <CustomTooltip
                format={format}
                currentLabel={currentLabel}
                previousLabel={previousLabel}
              />
            }
          />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span className="text-sm text-[var(--theme-text-muted)]">{value}</span>
            )}
          />

          {/* Previous period line (dashed, behind) */}
          {hasPreviousData && (
            <Line
              type="monotone"
              dataKey="previous"
              name={previousLabel}
              stroke={previousColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: previousColor, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: previousColor }}
              connectNulls
            />
          )}

          {/* Current period line (solid, in front) */}
          <Line
            type="monotone"
            dataKey="current"
            name={currentLabel}
            stroke={currentColor}
            strokeWidth={2}
            dot={{ fill: currentColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: currentColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Prepare data for dual series chart from two separate data arrays
 * Aligns data points by index (day 1 vs day 1, not by date)
 */
export function prepareDualSeriesData<T>(
  currentData: T[],
  previousData: T[],
  options: {
    valueKey: keyof T;
    labelKey?: keyof T;
    labelPrefix?: string;
    currentDateKey?: keyof T;
    previousDateKey?: keyof T;
  }
): DualSeriesDataPoint[] {
  const { valueKey, labelKey, labelPrefix = 'Day', currentDateKey, previousDateKey } = options;
  const maxLength = Math.max(currentData.length, previousData.length);

  return Array.from({ length: maxLength }, (_, index) => {
    const currentItem = currentData[index];
    const previousItem = previousData[index];

    return {
      label: labelKey && currentItem
        ? String(currentItem[labelKey])
        : `${labelPrefix} ${index + 1}`,
      current: currentItem ? Number(currentItem[valueKey]) : 0,
      previous: previousItem ? Number(previousItem[valueKey]) : null,
      currentDate: currentDateKey && currentItem ? String(currentItem[currentDateKey]) : undefined,
      previousDate: previousDateKey && previousItem ? String(previousItem[previousDateKey]) : undefined,
    };
  });
}
