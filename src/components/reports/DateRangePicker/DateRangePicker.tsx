import { useState, useRef, useEffect } from 'react';
import { DayPicker, DateRange as DayPickerRange } from 'react-day-picker';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { DateRange, PresetKey, useDateRange, UseDateRangeOptions } from '@/hooks/reports/useDateRange';
import { DatePresets } from './DatePresets';
import 'react-day-picker/dist/style.css';

export interface DateRangePickerProps extends UseDateRangeOptions {
  className?: string;
  showPresets?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  onChange?: (range: DateRange) => void;
}

export function DateRangePicker({
  className = '',
  showPresets = true,
  minDate,
  maxDate,
  disabled = false,
  onChange,
  ...options
}: DateRangePickerProps) {
  const {
    dateRange,
    activePreset,
    presets,
    setDateRange,
    setPreset,
    formatDate,
    isCustomRange,
  } = useDateRange(options);

  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DayPickerRange | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Sync temp range with actual range when opening
  useEffect(() => {
    if (isOpen) {
      setTempRange({ from: dateRange.from, to: dateRange.to });
    }
  }, [isOpen, dateRange]);

  const handleRangeSelect = (range: DayPickerRange | undefined) => {
    setTempRange(range);
  };

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to) {
      const newRange: DateRange = { from: tempRange.from, to: tempRange.to };
      setDateRange(newRange);
      onChange?.(newRange);
      setIsOpen(false);
    }
  };

  const handlePresetSelect = (key: PresetKey) => {
    setPreset(key);
    const preset = presets.find((p) => p.key === key);
    if (preset) {
      const range = preset.getRange();
      onChange?.(range);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempRange(undefined);
  };

  const displayText = isCustomRange
    ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : presets.find((p) => p.key === activePreset)?.label || 'Select a period';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2
          bg-black/40 border border-white/10 rounded-xl
          hover:border-white/20 focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors min-w-[240px]
        `}
      >
        <Calendar className="w-4 h-4 text-[var(--theme-text-muted)] flex-shrink-0" />
        <span className="flex-1 text-left text-sm text-white truncate">
          {displayText}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[var(--theme-text-muted)] flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-50 mt-2
            bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-xl
            flex flex-col md:flex-row
          "
        >
          {/* Presets Panel */}
          {showPresets && (
            <div className="p-3 border-b md:border-b-0 md:border-r border-white/10">
              <DatePresets
                presets={presets}
                activePreset={activePreset}
                onSelect={handlePresetSelect}
              />
            </div>
          )}

          {/* Calendar Panel */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">
                Custom Period
              </span>
              {tempRange && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-[var(--theme-text-muted)] hover:text-white flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={handleRangeSelect}
              locale={enUS}
              numberOfMonths={2}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
              ]}
              classNames={{
                months: 'flex flex-col md:flex-row gap-4',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium text-white',
                nav: 'space-x-1 flex items-center',
                nav_button:
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/[0.05] text-white',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell:
                  'text-[var(--theme-text-muted)] rounded-md w-9 font-normal text-[0.8rem] uppercase',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/[0.05] rounded-md inline-flex items-center justify-center text-white',
                day_range_start: 'day-range-start bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold)]',
                day_range_end: 'day-range-end bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold)]',
                day_selected: 'bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold)]',
                day_today: 'bg-white/10 text-white',
                day_outside: 'text-white/20 opacity-50',
                day_disabled: 'text-white/20 opacity-50',
                day_range_middle: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
                day_hidden: 'invisible',
              }}
            />

            {/* Selected Range Display */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-[var(--theme-text-muted)]">
                {tempRange?.from ? (
                  tempRange.to ? (
                    <>
                      <span className="font-medium text-white">
                        {format(tempRange.from, 'dd MMM yyyy', { locale: enUS })}
                      </span>
                      {' -> '}
                      <span className="font-medium text-white">
                        {format(tempRange.to, 'dd MMM yyyy', { locale: enUS })}
                      </span>
                    </>
                  ) : (
                    <span>Select the end date</span>
                  )
                ) : (
                  <span>Select a period</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleApply}
                disabled={!tempRange?.from || !tempRange?.to}
                className="
                  px-4 py-2 bg-[var(--color-gold)] text-black text-sm font-bold rounded-xl
                  hover:bg-[var(--color-gold)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
