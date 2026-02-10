import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  format,
  parseISO,
  isValid,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

export interface DateRange {
  from: Date;
  to: Date;
}

export type PresetKey =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'custom';

export type ComparisonType = 'previous' | 'last_year' | 'custom' | null;

export interface DatePreset {
  key: PresetKey;
  label: string;
  getRange: () => DateRange;
}

const DATE_FORMAT = 'yyyy-MM-dd';

function getPresets(): DatePreset[] {
  const now = new Date();

  return [
    {
      key: 'today',
      label: 'Today',
      getRange: () => ({
        from: startOfDay(now),
        to: endOfDay(now),
      }),
    },
    {
      key: 'yesterday',
      label: 'Yesterday',
      getRange: () => ({
        from: startOfDay(subDays(now, 1)),
        to: endOfDay(subDays(now, 1)),
      }),
    },
    {
      key: 'last7days',
      label: 'Last 7 days',
      getRange: () => ({
        from: startOfDay(subDays(now, 6)),
        to: endOfDay(now),
      }),
    },
    {
      key: 'last30days',
      label: 'Last 30 days',
      getRange: () => ({
        from: startOfDay(subDays(now, 29)),
        to: endOfDay(now),
      }),
    },
    {
      key: 'thisWeek',
      label: 'This week',
      getRange: () => ({
        from: startOfWeek(now, { locale: enUS }),
        to: endOfWeek(now, { locale: enUS }),
      }),
    },
    {
      key: 'lastWeek',
      label: 'Last week',
      getRange: () => ({
        from: startOfWeek(subWeeks(now, 1), { locale: enUS }),
        to: endOfWeek(subWeeks(now, 1), { locale: enUS }),
      }),
    },
    {
      key: 'thisMonth',
      label: 'This month',
      getRange: () => ({
        from: startOfMonth(now),
        to: endOfMonth(now),
      }),
    },
    {
      key: 'lastMonth',
      label: 'Last month',
      getRange: () => ({
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
      }),
    },
    {
      key: 'thisYear',
      label: 'This year',
      getRange: () => ({
        from: startOfYear(now),
        to: endOfYear(now),
      }),
    },
  ];
}

export interface UseDateRangeOptions {
  defaultPreset?: PresetKey;
  syncWithUrl?: boolean;
  urlParamFrom?: string;
  urlParamTo?: string;
  urlParamPreset?: string;
  /** Enable comparison mode */
  enableComparison?: boolean;
}

export interface UseDateRangeReturn {
  dateRange: DateRange;
  activePreset: PresetKey;
  presets: DatePreset[];
  setDateRange: (range: DateRange) => void;
  setPreset: (key: PresetKey) => void;
  formatDate: (date: Date) => string;
  formatRange: () => string;
  isCustomRange: boolean;
  /** Comparison features */
  comparisonRange: DateRange | null;
  comparisonType: ComparisonType;
  setComparisonType: (type: ComparisonType) => void;
  setCustomComparisonRange: (range: DateRange) => void;
  isComparisonEnabled: boolean;
}

/**
 * Calculate comparison range based on type
 */
function calculateComparisonRange(
  currentRange: DateRange,
  comparisonType: ComparisonType
): DateRange | null {
  if (!comparisonType || comparisonType === 'custom') return null;

  const days = differenceInDays(currentRange.to, currentRange.from);

  if (comparisonType === 'previous') {
    // Previous period: same duration, just before
    const prevTo = subDays(currentRange.from, 1);
    const prevFrom = subDays(prevTo, days);
    return { from: startOfDay(prevFrom), to: endOfDay(prevTo) };
  }

  if (comparisonType === 'last_year') {
    // Same period last year
    return {
      from: startOfDay(subYears(currentRange.from, 1)),
      to: endOfDay(subYears(currentRange.to, 1)),
    };
  }

  return null;
}

export function useDateRange(options: UseDateRangeOptions = {}): UseDateRangeReturn {
  const {
    defaultPreset = 'last30days',
    syncWithUrl = true,
    urlParamFrom = 'from',
    urlParamTo = 'to',
    urlParamPreset = 'preset',
    enableComparison = false,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const presets = useMemo(() => getPresets(), []);

  // Comparison state
  const [comparisonType, setComparisonTypeState] = useState<ComparisonType>(null);
  const [customComparisonRange, setCustomComparisonRangeState] = useState<DateRange | null>(null);

  // Parse dates from URL or use default preset
  const getInitialRange = useCallback((): { range: DateRange; preset: PresetKey } => {
    if (syncWithUrl) {
      const fromParam = searchParams.get(urlParamFrom);
      const toParam = searchParams.get(urlParamTo);
      const presetParam = searchParams.get(urlParamPreset) as PresetKey | null;

      if (presetParam && presetParam !== 'custom') {
        const preset = presets.find((p) => p.key === presetParam);
        if (preset) {
          return { range: preset.getRange(), preset: presetParam };
        }
      }

      if (fromParam && toParam) {
        const from = parseISO(fromParam);
        const to = parseISO(toParam);
        if (isValid(from) && isValid(to)) {
          return {
            range: { from: startOfDay(from), to: endOfDay(to) },
            preset: 'custom',
          };
        }
      }
    }

    const preset = presets.find((p) => p.key === defaultPreset) || presets[2]; // fallback to last7days
    return { range: preset.getRange(), preset: defaultPreset };
  }, [searchParams, syncWithUrl, urlParamFrom, urlParamTo, urlParamPreset, presets, defaultPreset]);

  // Parse comparison from URL
  const getInitialComparison = useCallback((): ComparisonType => {
    if (!syncWithUrl || !enableComparison) return null;
    const compareParam = searchParams.get('compare') as ComparisonType;
    if (compareParam === 'previous' || compareParam === 'last_year' || compareParam === 'custom') {
      return compareParam;
    }
    return null;
  }, [searchParams, syncWithUrl, enableComparison]);

  const initial = useMemo(() => getInitialRange(), [getInitialRange]);
  const initialComparison = useMemo(() => getInitialComparison(), [getInitialComparison]);
  const [dateRange, setDateRangeState] = useState<DateRange>(initial.range);
  const [activePreset, setActivePreset] = useState<PresetKey>(initial.preset);

  // Initialize comparison type from URL
  useState(() => {
    if (initialComparison) {
      setComparisonTypeState(initialComparison);
    }
  });

  const updateUrlParams = useCallback(
    (range: DateRange, preset: PresetKey, comparison: ComparisonType = comparisonType) => {
      if (!syncWithUrl) return;

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (preset === 'custom') {
          newParams.set(urlParamFrom, format(range.from, DATE_FORMAT));
          newParams.set(urlParamTo, format(range.to, DATE_FORMAT));
          newParams.delete(urlParamPreset);
        } else {
          newParams.set(urlParamPreset, preset);
          newParams.delete(urlParamFrom);
          newParams.delete(urlParamTo);
        }
        // Handle comparison params
        if (comparison && enableComparison) {
          newParams.set('compare', comparison);
        } else {
          newParams.delete('compare');
          newParams.delete('compareFrom');
          newParams.delete('compareTo');
        }
        return newParams;
      }, { replace: true });
    },
    [syncWithUrl, setSearchParams, urlParamFrom, urlParamTo, urlParamPreset, comparisonType, enableComparison]
  );

  const setDateRange = useCallback(
    (range: DateRange) => {
      setDateRangeState(range);
      setActivePreset('custom');
      updateUrlParams(range, 'custom');
    },
    [updateUrlParams]
  );

  const setPreset = useCallback(
    (key: PresetKey) => {
      const preset = presets.find((p) => p.key === key);
      if (preset) {
        const range = preset.getRange();
        setDateRangeState(range);
        setActivePreset(key);
        updateUrlParams(range, key);
      }
    },
    [presets, updateUrlParams]
  );

  const setComparisonType = useCallback(
    (type: ComparisonType) => {
      setComparisonTypeState(type);
      if (type === null) {
        setCustomComparisonRangeState(null);
      }
      updateUrlParams(dateRange, activePreset, type);
    },
    [dateRange, activePreset, updateUrlParams]
  );

  const setCustomComparisonRange = useCallback(
    (range: DateRange) => {
      setCustomComparisonRangeState(range);
      setComparisonTypeState('custom');
      if (syncWithUrl && enableComparison) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('compare', 'custom');
          newParams.set('compareFrom', format(range.from, DATE_FORMAT));
          newParams.set('compareTo', format(range.to, DATE_FORMAT));
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, enableComparison, setSearchParams]
  );

  // Calculate comparison range based on type
  const comparisonRange = useMemo((): DateRange | null => {
    if (!comparisonType) return null;
    if (comparisonType === 'custom') return customComparisonRange;
    return calculateComparisonRange(dateRange, comparisonType);
  }, [dateRange, comparisonType, customComparisonRange]);

  const formatDate = useCallback((date: Date): string => {
    return format(date, 'dd MMM yyyy', { locale: enUS });
  }, []);

  const formatRange = useCallback((): string => {
    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  }, [dateRange, formatDate]);

  return {
    dateRange,
    activePreset,
    presets,
    setDateRange,
    setPreset,
    formatDate,
    formatRange,
    isCustomRange: activePreset === 'custom',
    // Comparison
    comparisonRange,
    comparisonType,
    setComparisonType,
    setCustomComparisonRange,
    isComparisonEnabled: comparisonType !== null,
  };
}
