import { Mail } from 'lucide-react';

interface AlertPreferencesSectionProps {
  formData: {
    low_stock_alerts: boolean;
    low_stock_threshold: number;
    daily_report: boolean;
    daily_report_time: string;
    daily_report_email: string;
    whatsapp_enabled: boolean;
  };
  errors: {
    daily_report_email?: string;
  };
  canEdit: boolean;
  onChange: (field: string, value: unknown) => void;
}

export function AlertPreferencesSection({ formData, errors, canEdit, onChange }: AlertPreferencesSectionProps) {
  const inputClass = 'bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 w-full px-3 py-2 text-sm';
  const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]';

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <Mail size={20} className="text-[var(--color-gold)]" />
        <div>
          <h3 className="text-base font-semibold text-white">Alert Preferences</h3>
          <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
            Configure which notifications to receive
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Low Stock Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Low Stock Alerts</h4>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Receive email alerts when inventory items fall below threshold
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.low_stock_alerts}
              onChange={(e) => onChange('low_stock_alerts', e.target.checked)}
              disabled={!canEdit}
            />
            <span className="toggle-switch__slider" />
          </label>
        </div>

        {formData.low_stock_alerts && (
          <div className="ml-6">
            <label className={labelClass} htmlFor="low-stock-threshold">Stock Threshold</label>
            <div className="flex items-center gap-2 mt-1.5" style={{ maxWidth: '200px' }}>
              <input
                id="low-stock-threshold"
                type="number"
                className={inputClass}
                value={formData.low_stock_threshold}
                onChange={(e) => onChange('low_stock_threshold', parseInt(e.target.value) || 10)}
                min={1}
                disabled={!canEdit}
              />
              <span className="text-xs text-[var(--theme-text-muted)] whitespace-nowrap">units</span>
            </div>
            <span className="text-xs text-[var(--theme-text-muted)] mt-1 block">Alert when stock falls below this level</span>
          </div>
        )}

        {/* Daily Report */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <h4 className="text-sm font-medium text-white">Daily Sales Report</h4>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Receive a daily summary of sales and transactions
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.daily_report}
              onChange={(e) => onChange('daily_report', e.target.checked)}
              disabled={!canEdit}
            />
            <span className="toggle-switch__slider" />
          </label>
        </div>

        {formData.daily_report && (
          <div className="grid grid-cols-2 gap-4 ml-6">
            <div>
              <label className={labelClass} htmlFor="daily-report-time">Report Time</label>
              <input
                id="daily-report-time"
                type="time"
                className={`${inputClass} mt-1.5`}
                value={formData.daily_report_time}
                onChange={(e) => onChange('daily_report_time', e.target.value)}
                disabled={!canEdit}
              />
              <span className="text-xs text-[var(--theme-text-muted)] mt-1 block">Time to send daily report</span>
            </div>
            <div>
              <label className={labelClass} htmlFor="daily-report-email">Report Email</label>
              <input
                id="daily-report-email"
                type="email"
                className={`${inputClass} mt-1.5 ${errors.daily_report_email ? 'border-red-500/50' : ''}`}
                value={formData.daily_report_email}
                onChange={(e) => onChange('daily_report_email', e.target.value)}
                placeholder="manager@thebreakery.id"
                disabled={!canEdit}
              />
              {errors.daily_report_email && <span className="text-xs text-red-400 mt-1">{errors.daily_report_email}</span>}
              <span className="text-xs text-[var(--theme-text-muted)] mt-1 block">Leave empty to use from email</span>
            </div>
          </div>
        )}

        {/* WhatsApp (Coming Soon) */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 opacity-60">
          <div>
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              WhatsApp Notifications
              <span className="text-[10px] font-bold bg-white/10 text-[var(--theme-text-muted)] px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </h4>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Receive alerts via WhatsApp Business API
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.whatsapp_enabled}
              onChange={(e) => onChange('whatsapp_enabled', e.target.checked)}
              disabled={true}
            />
            <span className="toggle-switch__slider" />
          </label>
        </div>
      </div>
    </div>
  );
}
