import { useState, useEffect } from 'react';
import {
  Save,
  Bell,
  AlertCircle,
  Loader2,
  Mail,
  Send,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Server,
} from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '../../hooks/settings';
import { usePermissions } from '../../hooks/usePermissions';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { logError } from '@/utils/logger'

// Notification settings form data interface
interface INotificationFormData {
  // SMTP Configuration
  smtp_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
  // Alert Preferences
  low_stock_alerts: boolean;
  low_stock_threshold: number;
  daily_report: boolean;
  daily_report_time: string;
  daily_report_email: string;
  // WhatsApp (future)
  whatsapp_enabled: boolean;
}

// Validation errors interface
interface IValidationErrors {
  smtp_host?: string;
  smtp_port?: string;
  smtp_user?: string;
  from_email?: string;
  daily_report_email?: string;
}

// Setting key constants
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

// Default form values
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

/**
 * Parse JSONB value from settings
 */
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

/**
 * Validate notification form data
 */
const validateForm = (data: INotificationFormData): IValidationErrors => {
  const errors: IValidationErrors = {};

  // Only validate SMTP fields if SMTP is enabled
  if (data.smtp_enabled) {
    if (!data.smtp_host?.trim()) {
      errors.smtp_host = 'SMTP host is required';
    }

    if (!data.smtp_port || data.smtp_port < 1 || data.smtp_port > 65535) {
      errors.smtp_port = 'Port must be between 1 and 65535';
    }

    if (!data.smtp_user?.trim()) {
      errors.smtp_user = 'SMTP username is required';
    }

    if (data.from_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.from_email)) {
      errors.from_email = 'Invalid email format';
    }
  }

  // Validate daily report email if daily report is enabled
  if (data.daily_report && data.daily_report_email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.daily_report_email)) {
      errors.daily_report_email = 'Invalid email format';
    }
  }

  return errors;
};

const NotificationSettingsPage = () => {
  const { data: settings, isLoading } = useSettingsByCategory('notifications');
  const updateSetting = useUpdateSetting();
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission('settings.update');

  // Form state
  const [formData, setFormData] = useState<INotificationFormData>(defaultFormData);
  const [errors, setErrors] = useState<IValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  // Track whether SMTP password was explicitly changed by user (never load actual password from server)
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);

  // Initialize form from settings
  useEffect(() => {
    if (settings && settings.length > 0) {
      const newFormData: INotificationFormData = { ...defaultFormData };

      settings.forEach((setting) => {
        switch (setting.key) {
          case NOTIFICATION_SETTINGS_KEYS.smtpEnabled:
            newFormData.smtp_enabled = parseSettingValue(setting.value, false);
            break;
          case NOTIFICATION_SETTINGS_KEYS.smtpHost:
            newFormData.smtp_host = parseSettingValue(setting.value, '');
            break;
          case NOTIFICATION_SETTINGS_KEYS.smtpPort:
            newFormData.smtp_port = parseSettingValue(setting.value, 587);
            break;
          case NOTIFICATION_SETTINGS_KEYS.smtpUser:
            newFormData.smtp_user = parseSettingValue(setting.value, '');
            break;
          case NOTIFICATION_SETTINGS_KEYS.smtpPassword:
            // SECURITY: Never load actual password into client state
            // Only track whether a password exists server-side
            if (setting.value && String(setting.value).length > 0) {
              setHasExistingPassword(true);
            }
            newFormData.smtp_password = '';
            break;
          case NOTIFICATION_SETTINGS_KEYS.smtpSecure:
            newFormData.smtp_secure = parseSettingValue(setting.value, true);
            break;
          case NOTIFICATION_SETTINGS_KEYS.fromEmail:
            newFormData.from_email = parseSettingValue(setting.value, '');
            break;
          case NOTIFICATION_SETTINGS_KEYS.fromName:
            newFormData.from_name = parseSettingValue(setting.value, 'The Breakery');
            break;
          case NOTIFICATION_SETTINGS_KEYS.lowStockAlerts:
            newFormData.low_stock_alerts = parseSettingValue(setting.value, true);
            break;
          case NOTIFICATION_SETTINGS_KEYS.lowStockThreshold:
            newFormData.low_stock_threshold = parseSettingValue(setting.value, 10);
            break;
          case NOTIFICATION_SETTINGS_KEYS.dailyReport:
            newFormData.daily_report = parseSettingValue(setting.value, false);
            break;
          case NOTIFICATION_SETTINGS_KEYS.dailyReportTime:
            newFormData.daily_report_time = parseSettingValue(setting.value, '08:00');
            break;
          case NOTIFICATION_SETTINGS_KEYS.dailyReportEmail:
            newFormData.daily_report_email = parseSettingValue(setting.value, '');
            break;
          case NOTIFICATION_SETTINGS_KEYS.whatsappEnabled:
            newFormData.whatsapp_enabled = parseSettingValue(setting.value, false);
            break;
        }
      });

      setFormData(newFormData);
      setIsDirty(false);
    }
  }, [settings]);

  // Handle field change
  const handleChange = <K extends keyof INotificationFormData>(
    field: K,
    value: INotificationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setTestResult(null);

    // Track password changes explicitly
    if (field === 'smtp_password') {
      setPasswordChanged(true);
    }

    // Clear error for this field
    if (errors[field as keyof IValidationErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof IValidationErrors];
        return next;
      });
    }
  };

  // Handle form submission
  const handleSave = async () => {
    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);

    try {
      // Save all settings (only include password if explicitly changed)
      const settingsToSave = [
        { key: NOTIFICATION_SETTINGS_KEYS.smtpEnabled, value: formData.smtp_enabled },
        { key: NOTIFICATION_SETTINGS_KEYS.smtpHost, value: formData.smtp_host },
        { key: NOTIFICATION_SETTINGS_KEYS.smtpPort, value: formData.smtp_port },
        { key: NOTIFICATION_SETTINGS_KEYS.smtpUser, value: formData.smtp_user },
        // SECURITY: Only save password if user explicitly typed a new one
        ...(passwordChanged && formData.smtp_password
          ? [{ key: NOTIFICATION_SETTINGS_KEYS.smtpPassword, value: formData.smtp_password }]
          : []),
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
        await updateSetting.mutateAsync({
          key: setting.key,
          value: setting.value,
        });
      }

      toast.success('Notification settings saved');
      setIsDirty(false);
      if (passwordChanged && formData.smtp_password) {
        setHasExistingPassword(true);
      }
      setPasswordChanged(false);
      setFormData((prev) => ({ ...prev, smtp_password: '' }));
    } catch (error) {
      logError('Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle test email
  const handleTestEmail = async () => {
    // Validate SMTP settings first
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
          // Only send password if user typed a new one; Edge Function reads from DB otherwise
          ...(passwordChanged && formData.smtp_password ? { smtp_password: formData.smtp_password } : { use_stored_password: true }),
          smtp_secure: formData.smtp_secure,
          from_email: formData.from_email,
          from_name: formData.from_name,
          to_email: formData.from_email, // Send test to sender email
        },
      });

      if (error) throw error;

      setTestResult('success');
      toast.success('Test email sent successfully');
    } catch (error) {
      logError('Test email error:', error);
      setTestResult('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to send test email';
      toast.error(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  // Check for validation errors
  const hasErrors = Object.keys(errors).length > 0;

  if (isLoading) {
    return (
      <div className="settings-section">
        <div className="settings-section__body settings-section__loading">
          <div className="spinner" />
          <span>Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title">
              <Bell size={24} />
              Notification Settings
            </h2>
            <p className="settings-section__description">
              Configure email notifications and alert preferences
            </p>
          </div>
          {canEdit && isDirty && (
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={isSaving || hasErrors}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="settings-section__body">
        {!canEdit && (
          <div className="settings-section__readonly-notice">
            <AlertCircle size={16} />
            <span>You don't have permission to edit these settings</span>
          </div>
        )}

        {/* SMTP Configuration Section */}
        <div className="settings-subsection">
          <div className="settings-subsection__header">
            <Server size={20} />
            <div>
              <h3 className="settings-subsection__title">SMTP Configuration</h3>
              <p className="settings-subsection__description">
                Configure email server settings for sending notifications
              </p>
            </div>
            <label className="toggle-switch ml-auto">
              <input
                type="checkbox"
                checked={formData.smtp_enabled}
                onChange={(e) => handleChange('smtp_enabled', e.target.checked)}
                disabled={!canEdit}
              />
              <span className="toggle-switch__slider" />
            </label>
          </div>

          {formData.smtp_enabled && (
            <div className="settings-subsection__content">
              <div className="form-grid form-grid--2col">
                {/* SMTP Host */}
                <div className="form-group">
                  <label className="form-label" htmlFor="smtp-host">
                    SMTP Host <span className="form-required">*</span>
                  </label>
                  <input
                    id="smtp-host"
                    type="text"
                    className={`form-input ${errors.smtp_host ? 'form-input--error' : ''}`}
                    value={formData.smtp_host}
                    onChange={(e) => handleChange('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    disabled={!canEdit}
                  />
                  {errors.smtp_host && (
                    <span className="form-error">{errors.smtp_host}</span>
                  )}
                </div>

                {/* SMTP Port */}
                <div className="form-group">
                  <label className="form-label" htmlFor="smtp-port">
                    SMTP Port <span className="form-required">*</span>
                  </label>
                  <input
                    id="smtp-port"
                    type="number"
                    className={`form-input ${errors.smtp_port ? 'form-input--error' : ''}`}
                    value={formData.smtp_port}
                    onChange={(e) => handleChange('smtp_port', parseInt(e.target.value) || 587)}
                    placeholder="587"
                    min={1}
                    max={65535}
                    disabled={!canEdit}
                  />
                  {errors.smtp_port && (
                    <span className="form-error">{errors.smtp_port}</span>
                  )}
                  <span className="form-hint">Common: 587 (TLS), 465 (SSL), 25</span>
                </div>

                {/* SMTP Username */}
                <div className="form-group">
                  <label className="form-label" htmlFor="smtp-user">
                    Username <span className="form-required">*</span>
                  </label>
                  <input
                    id="smtp-user"
                    type="text"
                    className={`form-input ${errors.smtp_user ? 'form-input--error' : ''}`}
                    value={formData.smtp_user}
                    onChange={(e) => handleChange('smtp_user', e.target.value)}
                    placeholder="your-email@gmail.com"
                    disabled={!canEdit}
                  />
                  {errors.smtp_user && (
                    <span className="form-error">{errors.smtp_user}</span>
                  )}
                </div>

                {/* SMTP Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="smtp-password">
                    Password
                  </label>
                  <div className="form-input-group">
                    <input
                      id="smtp-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={formData.smtp_password}
                      onChange={(e) => handleChange('smtp_password', e.target.value)}
                      placeholder={hasExistingPassword ? '••••••••  (saved)' : 'Enter password'}
                      disabled={!canEdit}
                    />
                    <button
                      type="button"
                      className="form-input-group__btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="form-hint">
                    {hasExistingPassword && !passwordChanged
                      ? 'Password is stored securely. Leave empty to keep current password.'
                      : 'For Gmail, use an App Password'}
                  </span>
                </div>

                {/* From Email */}
                <div className="form-group">
                  <label className="form-label" htmlFor="from-email">
                    From Email <span className="form-required">*</span>
                  </label>
                  <input
                    id="from-email"
                    type="email"
                    className={`form-input ${errors.from_email ? 'form-input--error' : ''}`}
                    value={formData.from_email}
                    onChange={(e) => handleChange('from_email', e.target.value)}
                    placeholder="noreply@thebreakery.id"
                    disabled={!canEdit}
                  />
                  {errors.from_email && (
                    <span className="form-error">{errors.from_email}</span>
                  )}
                </div>

                {/* From Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="from-name">
                    From Name
                  </label>
                  <input
                    id="from-name"
                    type="text"
                    className="form-input"
                    value={formData.from_name}
                    onChange={(e) => handleChange('from_name', e.target.value)}
                    placeholder="The Breakery"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              {/* TLS/SSL Toggle */}
              <div className="form-group form-group--inline mt-4">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.smtp_secure}
                    onChange={(e) => handleChange('smtp_secure', e.target.checked)}
                    disabled={!canEdit}
                  />
                  <span>Use TLS/SSL encryption</span>
                </label>
              </div>

              {/* Test Email Button */}
              {canEdit && (
                <div className="settings-subsection__actions mt-4">
                  <button
                    type="button"
                    className={`btn-secondary ${testResult === 'success' ? 'btn-secondary--success' : testResult === 'error' ? 'btn-secondary--error' : ''}`}
                    onClick={handleTestEmail}
                    disabled={isTesting || !formData.smtp_host || !formData.smtp_user}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : testResult === 'success' ? (
                      <>
                        <CheckCircle size={16} />
                        Test Successful
                      </>
                    ) : testResult === 'error' ? (
                      <>
                        <XCircle size={16} />
                        Test Failed
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Test Email
                      </>
                    )}
                  </button>
                  <span className="text-sm text-gray-500">
                    Test email will be sent to {formData.from_email || 'the from address'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alert Preferences Section */}
        <div className="settings-subsection mt-6">
          <div className="settings-subsection__header">
            <Mail size={20} />
            <div>
              <h3 className="settings-subsection__title">Alert Preferences</h3>
              <p className="settings-subsection__description">
                Configure which notifications to receive
              </p>
            </div>
          </div>

          <div className="settings-subsection__content">
            {/* Low Stock Alerts */}
            <div className="settings-toggle-item">
              <div className="settings-toggle-item__content">
                <h4 className="settings-toggle-item__title">Low Stock Alerts</h4>
                <p className="settings-toggle-item__description">
                  Receive email alerts when inventory items fall below threshold
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.low_stock_alerts}
                  onChange={(e) => handleChange('low_stock_alerts', e.target.checked)}
                  disabled={!canEdit}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {formData.low_stock_alerts && (
              <div className="form-group mt-3 ml-6">
                <label className="form-label" htmlFor="low-stock-threshold">
                  Stock Threshold
                </label>
                <div className="form-input-with-suffix" style={{ maxWidth: '200px' }}>
                  <input
                    id="low-stock-threshold"
                    type="number"
                    className="form-input"
                    value={formData.low_stock_threshold}
                    onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value) || 10)}
                    min={1}
                    disabled={!canEdit}
                  />
                  <span className="form-input-suffix">units</span>
                </div>
                <span className="form-hint">Alert when stock falls below this level</span>
              </div>
            )}

            {/* Daily Report */}
            <div className="settings-toggle-item mt-4">
              <div className="settings-toggle-item__content">
                <h4 className="settings-toggle-item__title">Daily Sales Report</h4>
                <p className="settings-toggle-item__description">
                  Receive a daily summary of sales and transactions
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.daily_report}
                  onChange={(e) => handleChange('daily_report', e.target.checked)}
                  disabled={!canEdit}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {formData.daily_report && (
              <div className="form-grid form-grid--2col mt-3 ml-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="daily-report-time">
                    Report Time
                  </label>
                  <input
                    id="daily-report-time"
                    type="time"
                    className="form-input"
                    value={formData.daily_report_time}
                    onChange={(e) => handleChange('daily_report_time', e.target.value)}
                    disabled={!canEdit}
                  />
                  <span className="form-hint">Time to send daily report</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="daily-report-email">
                    Report Email
                  </label>
                  <input
                    id="daily-report-email"
                    type="email"
                    className={`form-input ${errors.daily_report_email ? 'form-input--error' : ''}`}
                    value={formData.daily_report_email}
                    onChange={(e) => handleChange('daily_report_email', e.target.value)}
                    placeholder="manager@thebreakery.id"
                    disabled={!canEdit}
                  />
                  {errors.daily_report_email && (
                    <span className="form-error">{errors.daily_report_email}</span>
                  )}
                  <span className="form-hint">Leave empty to use from email</span>
                </div>
              </div>
            )}

            {/* WhatsApp (Coming Soon) */}
            <div className="settings-toggle-item mt-4 opacity-60">
              <div className="settings-toggle-item__content">
                <h4 className="settings-toggle-item__title">
                  WhatsApp Notifications
                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </h4>
                <p className="settings-toggle-item__description">
                  Receive alerts via WhatsApp Business API
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.whatsapp_enabled}
                  onChange={(e) => handleChange('whatsapp_enabled', e.target.checked)}
                  disabled={true}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Unsaved changes notice */}
        {isDirty && (
          <div className="settings-section__footer">
            <div className="settings-unsaved-notice">
              <AlertCircle size={16} />
              <span>You have unsaved changes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
