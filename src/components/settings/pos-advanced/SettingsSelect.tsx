interface SettingsSelectProps {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export function SettingsSelect({ label, value, options, onChange, disabled }: SettingsSelectProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
        {label}
      </label>
      <select
        className="w-44 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239ca3af%27%20stroke-width=%272%27%3E%3Cpath%20d=%27M6%209l6%206%206-6%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
