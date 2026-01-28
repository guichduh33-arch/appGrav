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
  format,
  parseISO,
  isValid,
} from 'date-fns';
import { fr } from 'date-fns/locale';

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
      label: "Aujourd'hui",
      getRange: () => ({
        from: startOfDay(now),
        to: endOfDay(now),
      }),
    },
    {
      key: 'yesterday',
      label: 'Hier',
      getRange: () => ({
        from: startOfDay(subDays(now, 1)),
        to: endOfDay(subDays(now, 1)),
      }),
    },
    {
      key: 'last7days',
      label: '7 derniers jours',
      getRange: () => ({
        from: startOfDay(subDays(now, 6)),
        to: endOfDay(now),
      }),
    },
    {
      key: 'last30days',
      label: '30 derniers jours',
      getRange: () => ({
        from: startOfDay(subDays(now, 29)),
        to: endOfDay(now),
      }),
    },
    {
      key: 'thisWeek',
      label: 'Cette semaine',
      getRange: () => ({
        from: startOfWeek(now, { locale: fr }),
        to: endOfWeek(now, { locale: fr }),
      }),
    },
    {
      key: 'lastWeek',
      label: 'Semaine dernière',
      getRange: () => ({
        from: startOfWeek(subWeeks(now, 1), { locale: fr }),
        to: endOfWeek(subWeeks(now, 1), { locale: fr }),
      }),
    },
    {
      key: 'thisMonth',
      label: 'Ce mois',
      getRange: () => ({
        from: startOfMonth(now),
        to: endOfMonth(now),
      }),
    },
    {
      key: 'lastMonth',
      label: 'Mois dernier',
      getRange: () => ({
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
      }),
    },
    {
      key: 'thisYear',
      label: 'Cette année',
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
}

export function useDateRange(options: UseDateRangeOptions = {}): UseDateRangeReturn {
  const {
    defaultPreset = 'last30days',
    syncWithUrl = true,
    urlParamFrom = 'from',
    urlParamTo = 'to',
    urlParamPreset = 'preset',
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const presets = useMemo(() => getPresets(), []);

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

  const initial = useMemo(() => getInitialRange(), [getInitialRange]);
  const [dateRange, setDateRangeState] = useState<DateRange>(initial.range);
  const [activePreset, setActivePreset] = useState<PresetKey>(initial.preset);

  const updateUrlParams = useCallback(
    (range: DateRange, preset: PresetKey) => {
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
        return newParams;
      }, { replace: true });
    },
    [syncWithUrl, setSearchParams, urlParamFrom, urlParamTo, urlParamPreset]
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

  const formatDate = useCallback((date: Date): string => {
    return format(date, 'dd MMM yyyy', { locale: fr });
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
  };
}
