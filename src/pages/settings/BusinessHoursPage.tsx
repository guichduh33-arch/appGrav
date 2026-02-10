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

const BusinessHoursPage = () => {
  const { data: businessHours, isLoading } = useBusinessHours();
  const updateHours = useUpdateBusinessHours();

  const [localHours, setLocalHours] = useState<BusinessHours[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Use English day names
  const dayNames = DAY_NAMES.en;

  // Initialize local state
  useEffect(() => {
    if (businessHours) {
      setLocalHours([...businessHours].sort((a, b) => a.day_of_week - b.day_of_week));
      setPendingChanges(new Set());
    }
  }, [businessHours]);

  // Handle change
  const handleChange = (dayOfWeek: number, field: keyof BusinessHours, value: unknown) => {
    setLocalHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
    setPendingChanges((prev) => new Set(prev).add(dayOfWeek));
  };

  // Handle toggle closed
  const handleToggleClosed = (dayOfWeek: number) => {
    const hours = localHours.find((h) => h.day_of_week === dayOfWeek);
    if (hours) {
      handleChange(dayOfWeek, 'is_closed', !hours.is_closed);
    }
  };

  // Save all changes
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

  // Apply to all days
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
      <div className="settings-section">
        <div className="settings-section__body settings-section__loading">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title">Business Hours</h2>
            <p className="settings-section__description">
              Configure the opening hours of your establishment
            </p>
          </div>
          {pendingChanges.size > 0 && (
            <button
              className="btn-primary"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
            </button>
          )}
        </div>
      </div>

      <div className="settings-section__body">
        <div className="business-hours-list">
          {localHours.map((hours) => (
            <div
              key={hours.day_of_week}
              className={`business-hours-item ${hours.is_closed ? 'is-closed' : ''} ${
                pendingChanges.has(hours.day_of_week) ? 'has-changes' : ''
              }`}
            >
              <div className="business-hours-item__day">
                <span className="business-hours-item__day-name">
                  {dayNames[hours.day_of_week]}
                </span>
                <button
                  className={`toggle-mini ${!hours.is_closed ? 'is-on' : ''}`}
                  onClick={() => handleToggleClosed(hours.day_of_week)}
                  title={hours.is_closed ? 'Open' : 'Close'}
                />
              </div>

              {!hours.is_closed ? (
                <div className="business-hours-item__times">
                  <div className="business-hours-item__time-group">
                    <label>Opening</label>
                    <input
                      type="time"
                      className="business-hours-input"
                      value={hours.open_time || ''}
                      onChange={(e) => handleChange(hours.day_of_week, 'open_time', e.target.value || null)}
                    />
                  </div>
                  <span className="business-hours-item__separator">-</span>
                  <div className="business-hours-item__time-group">
                    <label>Closing</label>
                    <input
                      type="time"
                      className="business-hours-input"
                      value={hours.close_time || ''}
                      onChange={(e) => handleChange(hours.day_of_week, 'close_time', e.target.value || null)}
                    />
                  </div>

                  <div className="business-hours-item__break">
                    <span className="business-hours-item__break-label">Break:</span>
                    <input
                      type="time"
                      className="business-hours-input business-hours-input--small"
                      value={hours.break_start || ''}
                      onChange={(e) => handleChange(hours.day_of_week, 'break_start', e.target.value || null)}
                      placeholder="Start"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      className="business-hours-input business-hours-input--small"
                      value={hours.break_end || ''}
                      onChange={(e) => handleChange(hours.day_of_week, 'break_end', e.target.value || null)}
                      placeholder="End"
                    />
                  </div>
                </div>
              ) : (
                <div className="business-hours-item__closed">
                  <Clock size={16} />
                  Closed
                </div>
              )}

              <div className="business-hours-item__actions">
                <button
                  className="btn-ghost btn-ghost--small"
                  onClick={() => applyToAll(hours)}
                  title="Apply to all days"
                >
                  Apply to all
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pendingChanges.size > 0 && (
        <div className="settings-section__footer">
          <div className="settings-unsaved-notice">
            <AlertCircle size={16} />
            <span>
              {pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessHoursPage;
