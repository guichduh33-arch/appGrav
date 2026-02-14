interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({ label, description, checked, onChange, disabled }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <span className="block text-xs text-[var(--theme-text-muted)] mt-0.5">{description}</span>
        )}
      </div>
      <div
        className={`w-11 h-6 rounded-full cursor-pointer transition-all relative shrink-0
          after:content-[""] after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.3)] after:transition-all
          ${checked ? 'bg-[var(--color-gold)] after:left-[21px]' : 'bg-white/10'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && onChange(!checked)}
        role="switch"
        aria-checked={checked}
      />
    </div>
  );
}
