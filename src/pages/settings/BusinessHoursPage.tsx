import { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle } from 'lucide-react';
import { useBusinessHours, useUpdateBusinessHours } from '../../hooks/settings';
import type { BusinessHours } from '../../types/settings';
import { toast } from 'sonner';

const DAY_NAMES: Record<string, string[]> = {
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
};

const timeInputClass =
  'h-8 px-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none';

const BusinessHoursPage = () => {
  const { data: businessHours, isLoading } = useBusinessHours();
  const updateHours = useUpdateBusinessHours();

  const [localHours, setLocalHours] = useState<BusinessHours[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const dayNames = DAY_NAMES.en;

  useEffect(() => {
    if (businessHours) {
      setLocalHours([...businessHours].sort((a, b) => a.day_of_week - b.day_of_week));
      setPendingChanges(new Set());
    }
  }, [businessHours]);

  const handleChange = (dayOfWeek: number, field: keyof BusinessHours, value: unknown) => {
    setLocalHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
    setPendingChanges((prev) => new Set(prev).add(dayOfWeek));
  };

  const handleToggleClosed = (dayOfWeek: number) => {
    const hours = localHours.find((h) => h.day_of_week === dayOfWeek);
    if (hours) {
      handleChange(dayOfWeek, 'is_closed', !hours.is_closed);
    }
  };

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;

    setIsSaving(true);
    const errors: number[] = [];

    try {
      for (const dayOfWeek of pendingChanges) {
        const hours = localHours.find((h) => h.day_of_week === dayOfWeek);
        if (!hours) continue;

        try {
          await updateHours.mutateAsync({
            dayOfWeek,
            updates: {
              open_time: hours.open_time,
              close_time: hours.close_time,
              is_closed: hours.is_closed,
              break_start: hours.break_start,
              break_end: hours.break_end,
            },
          });
        } catch {
          errors.push(dayOfWeek);
        }
      }

      if (errors.length === 0) {
        toast.success('Business hours saved');
        setPendingChanges(new Set());
      } else {
        toast.error(`Error on ${errors.length} day(s)`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const applyToAll = (sourceDay: BusinessHours) => {
    setLocalHours((prev) =>
      prev.map((h) => ({
        ...h,
        open_time: sourceDay.open_time,
        close_time: sourceDay.close_time,
        is_closed: sourceDay.is_closed,
        break_start: sourceDay.break_start,
        break_end: sourceDay.break_end,
      }))
    );
    setPendingChanges(new Set([0, 1, 2, 3, 4, 5, 6]));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
        <div className="animate-spin w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full mr-3" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-white">Business Hours</h2>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            Configure the opening hours of your establishment
          </p>
        </div>
        {pendingChanges.size > 0 && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-opacity disabled:opacity-50"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
          </button>
        )}
      </div>

      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        {localHours.map((hours) => (
          <div
            key={hours.day_of_week}
            className={`flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-b-0 transition-colors
              ${hours.is_closed ? 'opacity-50' : ''}
              ${pendingChanges.has(hours.day_of_week) ? 'bg-[var(--color-gold)]/5' : 'hover:bg-white/[0.02]'}
            `}
          >
            {/* Day name + toggle */}
            <div className="w-32 flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-white">
                {dayNames[hours.day_of_week]}
              </span>
              <div
                className={`w-9 h-5 rounded-full cursor-pointer transition-all relative shrink-0
                  after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all
                  ${!hours.is_closed ? 'bg-[var(--color-gold)] after:left-[18px]' : 'bg-white/10'}
                `}
                onClick={() => handleToggleClosed(hours.day_of_week)}
                title={hours.is_closed ? 'Open' : 'Close'}
              />
            </div>

            {!hours.is_closed ? (
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Open</label>
                  <input
                    type="time"
                    className={timeInputClass}
                    value={hours.open_time || ''}
                    onChange={(e) => handleChange(hours.day_of_week, 'open_time', e.target.value || null)}
                  />
                </div>
                <span className="text-[var(--theme-text-muted)]">-</span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Close</label>
                  <input
                    type="time"
                    className={timeInputClass}
                    value={hours.close_time || ''}
                    onChange={(e) => handleChange(hours.day_of_week, 'close_time', e.target.value || null)}
                  />
                </div>

                <div className="flex items-center gap-1.5 ml-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Break:</span>
                  <input
                    type="time"
                    className={`${timeInputClass} w-24`}
                    value={hours.break_start || ''}
                    onChange={(e) => handleChange(hours.day_of_week, 'break_start', e.target.value || null)}
                    placeholder="Start"
                  />
                  <span className="text-[var(--theme-text-muted)]">-</span>
                  <input
                    type="time"
                    className={`${timeInputClass} w-24`}
                    value={hours.break_end || ''}
                    onChange={(e) => handleChange(hours.day_of_week, 'break_end', e.target.value || null)}
                    placeholder="End"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[var(--theme-text-muted)] text-sm flex-1">
                <Clock size={14} />
                Closed
              </div>
            )}

            <button
              className="text-xs text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-white/5"
              onClick={() => applyToAll(hours)}
              title="Apply to all days"
            >
              Apply to all
            </button>
          </div>
        ))}
      </div>

      {pendingChanges.size > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle size={16} />
          <span>
            {pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default BusinessHoursPage;
