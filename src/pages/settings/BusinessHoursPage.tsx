import { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle, Plus, Trash2, CalendarDays, Zap } from 'lucide-react';
import { useBusinessHours, useUpdateBusinessHours, useSettingsByCategory, useUpdateSetting } from '../../hooks/settings';
import { useBusinessHolidays, useCreateHoliday, useDeleteHoliday } from '../../hooks/settings/useBusinessHolidays';
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
  const currentYear = new Date().getFullYear();
  const { data: holidays = [] } = useBusinessHolidays(currentYear);
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();

  const { data: posSettings } = useSettingsByCategory('pos_config');
  const updateSetting = useUpdateSetting();

  const peakEnabled = posSettings?.find(s => s.key === 'pos_config.peak_pricing_enabled')?.value === true;
  const peakStart = String(posSettings?.find(s => s.key === 'pos_config.peak_time_start')?.value ?? '11:00');
  const peakEnd = String(posSettings?.find(s => s.key === 'pos_config.peak_time_end')?.value ?? '14:00');
  const peakMarkup = Number(posSettings?.find(s => s.key === 'pos_config.peak_pricing_markup_percent')?.value ?? 0);

  const handlePeakChange = async (key: string, value: unknown) => {
    try {
      await updateSetting.mutateAsync({ key: `pos_config.${key}`, value });
      toast.success('Peak pricing updated');
    } catch { toast.error('Failed to update'); }
  };

  const [localHours, setLocalHours] = useState<BusinessHours[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayRecurring, setHolidayRecurring] = useState(false);

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

      {/* Holidays & Special Dates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <CalendarDays size={20} className="text-[var(--color-gold)]" />
              Holidays & Special Dates
            </h2>
            <p className="text-sm text-[var(--theme-text-muted)] mt-1">
              Days your establishment will be closed or have modified hours
            </p>
          </div>
          <button
            onClick={() => setShowHolidayForm(!showHolidayForm)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Add Holiday
          </button>
        </div>

        {showHolidayForm && (
          <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 mb-3 flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)] mb-1">Name</label>
              <input
                type="text"
                value={holidayName}
                onChange={e => setHolidayName(e.target.value)}
                placeholder="e.g. Nyepi, Idul Fitri"
                className="w-full h-8 px-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
              />
            </div>
            <div className="w-40">
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)] mb-1">Date</label>
              <input
                type="date"
                value={holidayDate}
                onChange={e => setHolidayDate(e.target.value)}
                className="w-full h-8 px-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer py-1">
              <input type="checkbox" checked={holidayRecurring} onChange={e => setHolidayRecurring(e.target.checked)} className="accent-[var(--color-gold)]" />
              Recurring yearly
            </label>
            <button
              onClick={async () => {
                if (!holidayName.trim() || !holidayDate) { toast.error('Name and date required'); return; }
                try {
                  await createHoliday.mutateAsync({ name: holidayName.trim(), date: holidayDate, is_recurring: holidayRecurring, is_closed: true });
                  toast.success('Holiday added');
                  setHolidayName(''); setHolidayDate(''); setHolidayRecurring(false); setShowHolidayForm(false);
                } catch { toast.error('Failed to add holiday'); }
              }}
              disabled={createHoliday.isPending}
              className="h-8 px-4 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {createHoliday.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}

        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
          {holidays.length === 0 ? (
            <div className="px-5 py-8 text-center text-[var(--theme-text-muted)] text-sm">
              No holidays configured for {currentYear}
            </div>
          ) : (
            holidays.map(h => (
              <div key={h.id} className="flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                <div className="w-24 text-sm text-white/70">
                  {new Date(h.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 text-sm font-medium text-white">{h.name}</div>
                {h.is_recurring && (
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full">
                    Yearly
                  </span>
                )}
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                  h.is_closed ? 'bg-red-400/10 text-red-400' : 'bg-amber-400/10 text-amber-400'
                }`}>
                  {h.is_closed ? 'Closed' : 'Modified Hours'}
                </span>
                <button
                  onClick={async () => {
                    try { await deleteHoliday.mutateAsync(h.id); toast.success('Holiday removed'); }
                    catch { toast.error('Failed to delete'); }
                  }}
                  className="p-1.5 hover:bg-red-400/10 rounded-lg text-red-400/60 hover:text-red-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Peak Pricing */}
      <div>
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-1">
          <Zap size={20} className="text-[var(--color-gold)]" />
          Peak Pricing
        </h2>
        <p className="text-sm text-[var(--theme-text-muted)] mb-3">
          Automatically adjust prices during high-traffic hours
        </p>
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium">Enable peak pricing</span>
            <div
              className={`w-9 h-5 rounded-full cursor-pointer transition-all relative shrink-0
                after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all
                ${peakEnabled ? 'bg-[var(--color-gold)] after:left-[18px]' : 'bg-white/10'}
              `}
              onClick={() => handlePeakChange('peak_pricing_enabled', !peakEnabled)}
            />
          </div>
          {peakEnabled && (
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Start</label>
                <input type="time" value={peakStart} onChange={e => handlePeakChange('peak_time_start', e.target.value)} className={timeInputClass} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">End</label>
                <input type="time" value={peakEnd} onChange={e => handlePeakChange('peak_time_end', e.target.value)} className={timeInputClass} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">Markup %</label>
                <input type="number" min={0} max={100} step={1} value={peakMarkup} onChange={e => handlePeakChange('peak_pricing_markup_percent', Number(e.target.value))}
                  className="h-8 px-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessHoursPage;
