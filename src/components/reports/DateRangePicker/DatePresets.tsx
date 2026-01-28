import { DatePreset, PresetKey } from '@/hooks/reports/useDateRange';

export interface DatePresetsProps {
  presets: DatePreset[];
  activePreset: PresetKey;
  onSelect: (key: PresetKey) => void;
  className?: string;
}

export function DatePresets({
  presets,
  activePreset,
  onSelect,
  className = '',
}: DatePresetsProps) {
  return (
    <div className={`flex flex-col gap-1 min-w-[160px] ${className}`}>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
        Périodes prédéfinies
      </span>
      {presets.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => onSelect(preset.key)}
          className={`
            px-3 py-2 text-sm text-left rounded-md transition-colors
            ${
              activePreset === preset.key
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
