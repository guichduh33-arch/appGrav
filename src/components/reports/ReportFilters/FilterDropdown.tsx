import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import type { FilterOption } from '@/hooks/reports/useReportFilters';

export interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FilterDropdown({
  label,
  icon,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">{label}</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-2 px-3 py-2
          bg-black/40 border rounded-xl text-left
          transition-colors min-w-[180px]
          ${
            isOpen
              ? 'border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/20'
              : 'border-white/10 hover:border-white/20'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {icon && <span className="text-[var(--theme-text-muted)] flex-shrink-0">{icon}</span>}
        <span
          className={`flex-1 text-sm truncate ${
            selectedOption ? 'text-white' : 'text-[var(--theme-text-muted)]'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-50 mt-1 w-full min-w-[240px]
            bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-lg
            overflow-hidden
          "
        >
          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-2 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="
                    w-full pl-8 pr-3 py-2
                    text-sm bg-black/40 border border-white/10 rounded-lg text-white
                    placeholder:text-[var(--theme-text-muted)]
                    focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20
                  "
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-[var(--theme-text-muted)] text-center">
                No results
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-left
                    hover:bg-white/[0.02] transition-colors
                    ${option.value === value ? 'bg-[var(--color-gold)]/10' : ''}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm truncate ${
                        option.value === value ? 'text-[var(--color-gold)] font-medium' : 'text-white'
                      }`}
                    >
                      {option.label}
                    </div>
                    {option.sublabel && (
                      <div className="text-xs text-[var(--theme-text-muted)] truncate">{option.sublabel}</div>
                    )}
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
