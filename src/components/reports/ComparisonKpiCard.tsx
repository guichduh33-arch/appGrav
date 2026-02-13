import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export interface ComparisonKpiCardProps {
  label: string;
  currentValue: number;
  previousValue?: number | null;
  format?: 'currency' | 'number' | 'percent';
  /** Invert color logic (red = up for costs/losses) */
  invertColors?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * KPI Card with period comparison
 * Shows current value, previous value, and variation percentage
 */
export function ComparisonKpiCard({
  label,
  currentValue,
  previousValue,
  format = 'currency',
  invertColors = false,
  icon,
  className = '',
}: ComparisonKpiCardProps) {
  const hasComparison = previousValue !== null && previousValue !== undefined;

  // Calculate variation
  const variation = hasComparison
    ? previousValue === 0
      ? currentValue > 0 ? 100 : 0
      : ((currentValue - previousValue) / Math.abs(previousValue)) * 100
    : null;

  const absoluteChange = hasComparison ? currentValue - previousValue : null;

  // Determine if this is a positive change (considering inversion)
  const isPositive = variation !== null ? (invertColors ? variation < 0 : variation > 0) : null;
  const isNegative = variation !== null ? (invertColors ? variation > 0 : variation < 0) : null;

  // Format value based on type
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

  // Get variation display
  const getVariationDisplay = (): string => {
    if (variation === null) return '';
    if (previousValue === 0 && currentValue > 0) return 'New';
    if (!isFinite(variation)) return '—';
    return `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`;
  };

  return (
    <div className={`bg-[var(--theme-bg-secondary)] rounded-xl p-5 border border-[var(--theme-border)] shadow-sm ${className}`}>
      {/* Header with icon and label */}
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="p-2 bg-[var(--theme-bg-tertiary)] rounded-lg">
            {icon}
          </div>
        )}
        <span className="text-sm text-[var(--theme-text-secondary)]">{label}</span>
      </div>

      {/* Current Value */}
      <p className="text-2xl font-bold text-[var(--theme-text-primary)] mb-2 font-display">
        {formatValue(currentValue)}
      </p>

      {/* Comparison Section */}
      {hasComparison && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Value */}
          <span className="text-sm text-[var(--theme-text-muted)]">
            vs {formatValue(previousValue)}
          </span>

          {/* Variation Badge */}
          {variation !== null && (
            <span
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${isPositive
                  ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
                  : isNegative
                    ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'
                    : 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-muted)]'
                }
              `}
            >
              {isPositive && <ArrowUp className="w-3 h-3" />}
              {isNegative && <ArrowDown className="w-3 h-3" />}
              {variation === 0 && <Minus className="w-3 h-3" />}
              {getVariationDisplay()}
            </span>
          )}

          {/* Absolute Change */}
          {absoluteChange !== null && absoluteChange !== 0 && format === 'currency' && (
            <span className={`text-xs ${isPositive ? 'text-[var(--color-success-text)]' : isNegative ? 'text-[var(--color-danger-text)]' : 'text-[var(--theme-text-muted)]'}`}>
              ({absoluteChange > 0 ? '+' : ''}{formatCurrency(absoluteChange)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Grid container for comparison KPI cards
 */
export function ComparisonKpiGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns];

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4 ${className}`}>
      {children}
    </div>
  );
}
