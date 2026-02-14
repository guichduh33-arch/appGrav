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
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2 px-2">
        Preset Periods
      </span>
      {presets.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => onSelect(preset.key)}
          className={`
            px-3 py-2 text-sm text-left rounded-lg transition-colors
            ${
              activePreset === preset.key
                ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-medium'
                : 'text-white hover:bg-white/[0.02]'
            }
          `}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
