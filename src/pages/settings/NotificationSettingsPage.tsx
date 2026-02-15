import { useState, useEffect } from 'react';
import { Save, Bell, AlertCircle, Loader2 } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '../../hooks/settings';
import { usePermissions } from '../../hooks/usePermissions';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { logError } from '@/utils/logger';
import { SmtpConfigSection } from './notifications/SmtpConfigSection';
import { AlertPreferencesSection } from './notifications/AlertPreferencesSection';
import { EventPreferencesSection } from './notifications/EventPreferencesSection';

interface INotificationFormData {
  smtp_enabled: boolean; smtp_host: string; smtp_port: number;
  smtp_user: string; smtp_password: string; smtp_secure: boolean;
  from_email: string; from_name: string; low_stock_alerts: boolean;
  low_stock_threshold: number; daily_report: boolean; daily_report_time: string;
  daily_report_email: string; whatsapp_enabled: boolean;
}

interface IValidationErrors {
  smtp_host?: string; smtp_port?: string; smtp_user?: string;
  from_email?: string; daily_report_email?: string;
}

const NOTIFICATION_SETTINGS_KEYS = {
  smtpEnabled: 'notifications.smtp_enabled',
  smtpHost: 'notifications.smtp_host',
  smtpPort: 'notifications.smtp_port',
  smtpUser: 'notifications.smtp_user',
  smtpPassword: 'notifications.smtp_password',
  smtpSecure: 'notifications.smtp_secure',
  fromEmail: 'notifications.from_email',
  fromName: 'notifications.from_name',
  lowStockAlerts: 'notifications.low_stock_alerts',
  lowStockThreshold: 'notifications.low_stock_threshold',
  dailyReport: 'notifications.daily_report',
  dailyReportTime: 'notifications.daily_report_time',
  dailyReportEmail: 'notifications.daily_report_email',
  whatsappEnabled: 'notifications.whatsapp_enabled',
} as const;

const defaultFormData: INotificationFormData = {
  smtp_enabled: false,
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_password: '',
  smtp_secure: true,
  from_email: '',
  from_name: 'The Breakery',
  low_stock_alerts: true,
  low_stock_threshold: 10,
  daily_report: false,
  daily_report_time: '08:00',
  daily_report_email: '',
  whatsapp_enabled: false,
};

const parseSettingValue = <T,>(value: unknown, defaultVal: T): T => {
  if (value === null || value === undefined) return defaultVal;
  if (typeof value === typeof defaultVal) return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed as T;
    } catch {
      if (typeof defaultVal === 'string') return value as T;
      if (typeof defaultVal === 'number') return Number(value) as T;
      if (typeof defaultVal === 'boolean') return (value === 'true') as T;
    }
  }
  return defaultVal;
};

const validateForm = (data: INotificationFormData): IValidationErrors => {
  const errors: IValidationErrors = {};
  if (data.smtp_enabled) {
    if (!data.smtp_host?.trim()) errors.smtp_host = 'SMTP host is required';
    if (!data.smtp_port || data.smtp_port < 1 || data.smtp_port > 65535) errors.smtp_port = 'Port must be between 1 and 65535';
    if (!data.smtp_user?.trim()) errors.smtp_user = 'SMTP username is required';
    if (data.from_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.from_email)) errors.from_email = 'Invalid email format';
  }
  if (data.daily_report && data.daily_report_email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.daily_report_email)) errors.daily_report_email = 'Invalid email format';
  }
  return errors;
};

const NotificationSettingsPage = () => {
  const { data: settings, isLoading } = useSettingsByCategory('notifications');
  const updateSetting = useUpdateSetting();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('settings.update');

  const [formData, setFormData] = useState<INotificationFormData>(defaultFormData);
  const [errors, setErrors] = useState<IValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);

  useEffect(() => {
    if (settings && settings.length > 0) {
      const newFormData: INotificationFormData = { ...defaultFormData };
      settings.forEach((setting) => {
        switch (setting.key) {
          case NOTIFICATION_SETTINGS_KEYS.smtpEnabled: newFormData.smtp_enabled = parseSettingValue(setting.value, false); break;
          case NOTIFICATION_SETTINGS_KEYS.smtpHost: newFormData.smtp_host = parseSettingValue(setting.value, ''); break;
          case NOTIFICATION_SETTINGS_KEYS.smtpPort: newFormData.smtp_port = parseSettingValue(setting.value, 587); break;
          case NOTIFICATION_SETTINGS_KEYS.smtpUser: newFormData.smtp_user = parseSettingValue(setting.value, ''); break;
          case NOTIFICATION_SETTINGS_KEYS.smtpPassword:
            if (setting.value && String(setting.value).length > 0) setHasExistingPassword(true);
            newFormData.smtp_password = '';
            break;
          case NOTIFICATION_SETTINGS_KEYS.smtpSecure: newFormData.smtp_secure = parseSettingValue(setting.value, true); break;
          case NOTIFICATION_SETTINGS_KEYS.fromEmail: newFormData.from_email = parseSettingValue(setting.value, ''); break;
          case NOTIFICATION_SETTINGS_KEYS.fromName: newFormData.from_name = parseSettingValue(setting.value, 'The Breakery'); break;
          case NOTIFICATION_SETTINGS_KEYS.lowStockAlerts: newFormData.low_stock_alerts = parseSettingValue(setting.value, true); break;
          case NOTIFICATION_SETTINGS_KEYS.lowStockThreshold: newFormData.low_stock_threshold = parseSettingValue(setting.value, 10); break;
          case NOTIFICATION_SETTINGS_KEYS.dailyReport: newFormData.daily_report = parseSettingValue(setting.value, false); break;
          case NOTIFICATION_SETTINGS_KEYS.dailyReportTime: newFormData.daily_report_time = parseSettingValue(setting.value, '08:00'); break;
          case NOTIFICATION_SETTINGS_KEYS.dailyReportEmail: newFormData.daily_report_email = parseSettingValue(setting.value, ''); break;
          case NOTIFICATION_SETTINGS_KEYS.whatsappEnabled: newFormData.whatsapp_enabled = parseSettingValue(setting.value, false); break;
        }
      });
      setFormData(newFormData);
      setIsDirty(false);
    }
  }, [settings]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setTestResult(null);
    if (field === 'smtp_password') setPasswordChanged(true);
    if (errors[field as keyof IValidationErrors]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field as keyof IValidationErrors]; return next; });
    }
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: NOTIFICATION_SETTINGS_KEYS.smtpEnabled, value: formData.smtp_enabled },
        { key: NOTIFICATION_SETTINGS_KEYS.smtpHost, value: formData.smtp_host },
        { key: NOTIFICATION_SETTINGS_KEYS.smtpPort, value: formData.smtp_port },
        { key: NOTIFICATION_SETTINGS_KEYS.smtpUser, value: formData.smtp_user },
        ...(passwordChanged && formData.smtp_password ? [{ key: NOTIFICATION_SETTINGS_KEYS.smtpPassword, value: formData.smtp_password }] : []),
        { key: NOTIFICATION_SETTINGS_KEYS.smtpSecure, value: formData.smtp_secure },
        { key: NOTIFICATION_SETTINGS_KEYS.fromEmail, value: formData.from_email },
        { key: NOTIFICATION_SETTINGS_KEYS.fromName, value: formData.from_name },
        { key: NOTIFICATION_SETTINGS_KEYS.lowStockAlerts, value: formData.low_stock_alerts },
        { key: NOTIFICATION_SETTINGS_KEYS.lowStockThreshold, value: formData.low_stock_threshold },
        { key: NOTIFICATION_SETTINGS_KEYS.dailyReport, value: formData.daily_report },
        { key: NOTIFICATION_SETTINGS_KEYS.dailyReportTime, value: formData.daily_report_time },
        { key: NOTIFICATION_SETTINGS_KEYS.dailyReportEmail, value: formData.daily_report_email },
        { key: NOTIFICATION_SETTINGS_KEYS.whatsappEnabled, value: formData.whatsapp_enabled },
      ];
      for (const setting of settingsToSave) {
        await updateSetting.mutateAsync({ key: setting.key, value: setting.value });
      }
      toast.success('Notification settings saved');
      setIsDirty(false);
      if (passwordChanged && formData.smtp_password) setHasExistingPassword(true);
      setPasswordChanged(false);
      setFormData((prev) => ({ ...prev, smtp_password: '' }));
    } catch (error) {
      logError('Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!formData.smtp_host || !formData.smtp_user || !formData.from_email) {
      toast.error('Please fill in SMTP settings before testing');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const { error } = await supabase.functions.invoke('send-test-email', {
        headers: { 'x-session-token': sessionStorage.getItem('breakery-session-token') || '' },
        body: {
          smtp_host: formData.smtp_host,
          smtp_port: formData.smtp_port,
          smtp_user: formData.smtp_user,
          ...(passwordChanged && formData.smtp_password ? { smtp_password: formData.smtp_password } : { use_stored_password: true }),
          smtp_secure: formData.smtp_secure,
          from_email: formData.from_email,
          from_name: formData.from_name,
          to_email: formData.from_email,
        },
      });
      if (error) throw error;
      setTestResult('success');
      toast.success('Test email sent successfully');
    } catch (error) {
      logError('Test email error:', error);
      setTestResult('error');
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center gap-2 py-20 text-[var(--theme-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
        <span>Loading notification settings...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-[var(--color-gold)]" />
            Notification Settings
          </h1>
          <p className="text-[var(--theme-text-muted)] mt-1">
            Configure email notifications and alert preferences
          </p>
        </div>
        {canEdit && isDirty && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving || hasErrors}
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-400" />
          <span className="text-sm text-amber-300">You don't have permission to edit these settings</span>
        </div>
      )}

      <div className="space-y-6">
        <SmtpConfigSection
          formData={formData}
          errors={errors}
          canEdit={canEdit}
          hasExistingPassword={hasExistingPassword}
          passwordChanged={passwordChanged}
          onChange={handleChange}
          onTestEmail={handleTestEmail}
          isTesting={isTesting}
          testResult={testResult}
        />

        <AlertPreferencesSection
          formData={formData}
          errors={errors}
          canEdit={canEdit}
          onChange={handleChange}
        />

        <EventPreferencesSection canEdit={canEdit} />
      </div>

      {/* Unsaved changes notice */}
      {isDirty && (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-400" />
          <span className="text-sm text-amber-300">You have unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsPage;
