import { useState } from 'react';
import {
    Bell,
    Mail,
    Send,
    Clock,
    MessageSquare,
    RefreshCw,
} from 'lucide-react';
import {
    useNotificationSettings,
    useUpdateNotificationSetting,
    useSendTestEmail,
} from '../../hooks/settings';
import type { NotificationSettings } from '../../types/settings';

interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex-1">
                <span className="text-sm font-medium text-white">{label}</span>
                {description && <span className="block text-xs text-[var(--theme-text-muted)] mt-0.5">{description}</span>}
            </div>
            <div
                className={`toggle-switch ${checked ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
                onClick={() => !disabled && onChange(!checked)}
            />
        </div>
    );
}

interface InputProps {
    label: string;
    type?: string;
    value: string | number;
    placeholder?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

function Input({ label, type = 'text', value, placeholder, onChange, disabled }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</label>
            <input
                type={type}
                className="bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 px-3 py-2 text-sm"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
        </div>
    );
}

export default function NotificationSettingsSection() {
    const { data: settings, isLoading } = useNotificationSettings();
    const updateSetting = useUpdateNotificationSetting();
    const sendTestEmail = useSendTestEmail();
    const [testEmail, setTestEmail] = useState('');

    const handleUpdate = (key: keyof NotificationSettings, value: unknown) => {
        updateSetting.mutate({ key, value });
    };

    const handleSendTestEmail = () => {
        if (!testEmail) {
            alert('Please enter an email address');
            return;
        }
        sendTestEmail.mutate(testEmail, {
            onSuccess: () => alert('Test email sent successfully'),
            onError: (err) => alert('Error sending email: ' + (err instanceof Error ? err.message : 'Unknown error')),
        });
    };

    if (isLoading || !settings) {
        return (
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Notification Settings</h2>
                <div className="flex items-center justify-center gap-2 py-8 text-[var(--theme-text-muted)]">
                    <RefreshCw size={24} className="animate-spin" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-white">Notification Settings</h2>
                <p className="text-sm text-[var(--theme-text-muted)] mt-1">
                    Configure how the system sends alerts and reports.
                </p>
            </div>

            {/* Email Settings */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                    <Mail size={18} className="text-[var(--color-gold)]" />
                    <h3 className="text-base font-semibold text-white">Email Configuration (SMTP)</h3>
                </div>
                <div className="p-6 space-y-3">
                    <Toggle
                        label="Email enabled"
                        description="Enable email sending by the system"
                        checked={settings.email_enabled}
                        onChange={(v) => handleUpdate('email_enabled', v)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="SMTP Server"
                            value={settings.smtp_host}
                            placeholder="smtp.example.com"
                            onChange={(v) => handleUpdate('smtp_host', v)}
                            disabled={!settings.email_enabled}
                        />
                        <Input
                            label="SMTP Port"
                            type="number"
                            value={settings.smtp_port}
                            placeholder="587"
                            onChange={(v) => handleUpdate('smtp_port', Number(v))}
                            disabled={!settings.email_enabled}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="SMTP User"
                            value={settings.smtp_user}
                            placeholder="user@example.com"
                            onChange={(v) => handleUpdate('smtp_user', v)}
                            disabled={!settings.email_enabled}
                        />
                        <Input
                            label="SMTP Password"
                            type="password"
                            value={settings.smtp_password}
                            placeholder="--------"
                            onChange={(v) => handleUpdate('smtp_password', v)}
                            disabled={!settings.email_enabled}
                        />
                    </div>

                    <Input
                        label="From Email"
                        value={settings.from_email}
                        placeholder="noreply@breakery.com"
                        onChange={(v) => handleUpdate('from_email', v)}
                        disabled={!settings.email_enabled}
                    />

                    {/* Test Email */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-4">
                        <h4 className="text-sm font-semibold text-white mb-3">Test Configuration</h4>
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <Input
                                    label="Destination Email"
                                    value={testEmail}
                                    placeholder="dest@example.com"
                                    onChange={setTestEmail}
                                    disabled={!settings.email_enabled}
                                />
                            </div>
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors text-sm disabled:opacity-50 whitespace-nowrap"
                                onClick={handleSendTestEmail}
                                disabled={!settings.email_enabled || sendTestEmail.isPending}
                            >
                                {sendTestEmail.isPending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                                Send Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts Settings */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                    <Bell size={18} className="text-[var(--color-gold)]" />
                    <h3 className="text-base font-semibold text-white">Alerts and Reports</h3>
                </div>
                <div className="p-6 space-y-3">
                    <Toggle
                        label="Low stock alerts"
                        description="Receive a notification when a product reaches critical threshold"
                        checked={settings.low_stock_alerts}
                        onChange={(v) => handleUpdate('low_stock_alerts', v)}
                    />
                    <Toggle
                        label="Daily report"
                        description="Receive a sales summary every evening"
                        checked={settings.daily_report}
                        onChange={(v) => handleUpdate('daily_report', v)}
                    />

                    {settings.daily_report && (
                        <div className="ml-6 flex items-center gap-2">
                            <Clock size={14} className="text-[var(--theme-text-muted)]" />
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]" htmlFor="daily-report-time">
                                Send Time
                            </label>
                            <input
                                id="daily-report-time"
                                type="time"
                                className="bg-black/40 border border-white/10 rounded-xl text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 px-3 py-1.5 text-sm"
                                value={settings.daily_report_time}
                                onChange={(e) => handleUpdate('daily_report_time', e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Other integrations */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                    <MessageSquare size={18} className="text-[var(--color-gold)]" />
                    <h3 className="text-base font-semibold text-white">Additional Channels</h3>
                </div>
                <div className="p-6">
                    <Toggle
                        label="WhatsApp (Beta)"
                        description="Coming soon: notifications via WhatsApp Business API"
                        checked={settings.whatsapp_enabled}
                        onChange={(v) => handleUpdate('whatsapp_enabled', v)}
                        disabled={true}
                    />
                </div>
            </div>
        </div>
    );
}
