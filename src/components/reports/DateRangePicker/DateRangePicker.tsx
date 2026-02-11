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
          bg-white border border-gray-300 rounded-lg
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors min-w-[240px]
        `}
      >
        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="flex-1 text-left text-sm text-gray-700 truncate">
          {displayText}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-50 mt-2
            bg-white border border-gray-200 rounded-lg shadow-xl
            flex flex-col md:flex-row
          "
        >
          {/* Presets Panel */}
          {showPresets && (
            <div className="p-3 border-b md:border-b-0 md:border-r border-gray-200">
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
              <span className="text-sm font-medium text-gray-700">
                Custom Period
              </span>
              {tempRange && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
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
                caption_label: 'text-sm font-medium text-gray-900',
                nav: 'space-x-1 flex items-center',
                nav_button:
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell:
                  'text-gray-500 rounded-md w-9 font-normal text-[0.8rem] uppercase',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md inline-flex items-center justify-center',
                day_range_start: 'day-range-start bg-blue-600 text-white hover:bg-blue-600',
                day_range_end: 'day-range-end bg-blue-600 text-white hover:bg-blue-600',
                day_selected: 'bg-blue-600 text-white hover:bg-blue-600',
                day_today: 'bg-gray-100 text-gray-900',
                day_outside: 'text-gray-400 opacity-50',
                day_disabled: 'text-gray-400 opacity-50',
                day_range_middle: 'bg-blue-50 text-blue-900',
                day_hidden: 'invisible',
              }}
            />

            {/* Selected Range Display */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {tempRange?.from ? (
                  tempRange.to ? (
                    <>
                      <span className="font-medium">
                        {format(tempRange.from, 'dd MMM yyyy', { locale: enUS })}
                      </span>
                      {' → '}
                      <span className="font-medium">
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
                  px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
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
