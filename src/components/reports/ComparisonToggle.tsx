import { useState } from 'react';
import { GitCompare, ChevronDown, Check } from 'lucide-react';
import { ComparisonType, DateRange } from '@/hooks/reports/useDateRange';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export interface ComparisonToggleProps {
  comparisonType: ComparisonType;
  comparisonRange: DateRange | null;
  onComparisonTypeChange: (type: ComparisonType) => void;
  disabled?: boolean;
  className?: string;
}

const COMPARISON_OPTIONS: { value: ComparisonType; label: string; description: string }[] = [
  { value: null, label: 'No comparison', description: 'Show only current period' },
  { value: 'previous', label: 'Previous period', description: 'Compare to the period just before' },
  { value: 'last_year', label: 'Same period last year', description: 'Compare to the same dates one year ago' },
];

/**
 * Toggle component for enabling/configuring period comparison
 */
export function ComparisonToggle({
  comparisonType,
  comparisonRange,
  onComparisonTypeChange,
  disabled = false,
  className = '',
}: ComparisonToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeOption = COMPARISON_OPTIONS.find((o) => o.value === comparisonType) || COMPARISON_OPTIONS[0];
  const isEnabled = comparisonType !== null;

  const formatComparisonRange = (): string => {
    if (!comparisonRange) return '';
    return `${format(comparisonRange.from, 'dd MMM', { locale: enUS })} - ${format(comparisonRange.to, 'dd MMM yyyy', { locale: enUS })}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-3 py-2
          text-sm font-medium rounded-xl border
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isEnabled
            ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20'
            : 'bg-transparent border-white/10 text-white hover:border-white/20'
          }
        `}
      >
        <GitCompare className="w-4 h-4" />
        <span>
          {isEnabled ? (
            <>
              Compare: {activeOption.label}
              {comparisonRange && (
                <span className="text-xs text-[var(--color-gold)]/70 ml-1">
                  ({formatComparisonRange()})
                </span>
              )}
            </>
          ) : (
            'Compare'
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute z-50 mt-1 right-0 w-72 bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-lg">
            <div className="p-2">
              {COMPARISON_OPTIONS.map((option) => (
                <button
                  key={option.value ?? 'none'}
                  type="button"
                  onClick={() => {
                    onComparisonTypeChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg
                    flex items-start gap-3
                    transition-colors
                    ${comparisonType === option.value
                      ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                      : 'hover:bg-white/[0.02] text-white'
                    }
                  `}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {comparisonType === option.value ? (
                      <Check className="w-4 h-4 text-[var(--color-gold)]" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-[var(--theme-text-muted)]">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Comparison range preview */}
            {comparisonRange && (
              <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 rounded-b-xl">
                <div className="text-xs text-[var(--theme-text-muted)] mb-1">Comparison period:</div>
                <div className="text-sm font-medium text-white">
                  {formatComparisonRange()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact badge showing comparison status
 */
export function ComparisonBadge({
  comparisonType,
  comparisonRange,
  onClear,
  className = '',
}: {
  comparisonType: ComparisonType;
  comparisonRange: DateRange | null;
  onClear?: () => void;
  className?: string;
}) {
  if (!comparisonType) return null;

  const label = comparisonType === 'previous' ? 'vs Previous' : comparisonType === 'last_year' ? 'vs Last Year' : 'vs Custom';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        text-xs font-medium rounded-full
        bg-[var(--color-gold)]/10 text-[var(--color-gold)]
        ${className}
      `}
    >
      <GitCompare className="w-3 h-3" />
      {label}
      {comparisonRange && (
        <span className="text-[var(--color-gold)]/70">
          ({format(comparisonRange.from, 'dd/MM', { locale: enUS })} - {format(comparisonRange.to, 'dd/MM', { locale: enUS })})
        </span>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="hover:text-white ml-1"
        >
          x
        </button>
      )}
    </span>
  );
}
