import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface SyncSettingsCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function SyncSettingsCard({ icon, title, children }: SyncSettingsCardProps) {
  return (
    <Card className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {children}
      </CardContent>
    </Card>
  );
}

interface NumericFieldProps {
  label: string;
  hint?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
}

export function NumericField({ label, hint, suffix, value, onChange }: NumericFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label className="text-sm text-[var(--theme-text-secondary)]">{label}</label>
        {hint && <span className="text-xs text-[var(--theme-text-muted)] ml-2">= {hint}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 px-3 py-1.5 text-sm w-28 text-right"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min={0}
        />
        {suffix && <span className="text-xs text-[var(--theme-text-muted)] w-12">{suffix}</span>}
      </div>
    </div>
  );
}
