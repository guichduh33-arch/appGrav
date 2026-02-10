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
          text-sm font-medium rounded-lg border
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isEnabled
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <GitCompare className="w-4 h-4" />
        <span>
          {isEnabled ? (
            <>
              Compare: {activeOption.label}
              {comparisonRange && (
                <span className="text-xs text-blue-500 ml-1">
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
          <div className="absolute z-50 mt-1 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
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
                    w-full text-left px-3 py-2 rounded-md
                    flex items-start gap-3
                    transition-colors
                    ${comparisonType === option.value
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {comparisonType === option.value ? (
                      <Check className="w-4 h-4 text-blue-600" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Comparison range preview */}
            {comparisonRange && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="text-xs text-gray-500 mb-1">Comparison period:</div>
                <div className="text-sm font-medium text-gray-900">
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
        bg-blue-100 text-blue-700
        ${className}
      `}
    >
      <GitCompare className="w-3 h-3" />
      {label}
      {comparisonRange && (
        <span className="text-blue-500">
          ({format(comparisonRange.from, 'dd/MM', { locale: enUS })} - {format(comparisonRange.to, 'dd/MM', { locale: enUS })})
        </span>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="hover:text-blue-900 ml-1"
        >
          ×
        </button>
      )}
    </span>
  );
}
