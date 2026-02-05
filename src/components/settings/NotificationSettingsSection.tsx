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
} from '../../hooks/useSettings';
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
        <div className="toggle-group">
            <div className="toggle-group__info">
                <span className="toggle-group__label">{label}</span>
                {description && <span className="toggle-group__description">{description}</span>}
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
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input
                type={type}
                className="form-input"
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
            alert('Veuillez entrer une adresse email');
            return;
        }
        sendTestEmail.mutate(testEmail, {
            onSuccess: () => alert('Email de test envoyé avec succès'),
            onError: (err) => alert('Erreur lors de l’envoi : ' + (err instanceof Error ? err.message : 'Erreur inconnue')),
        });
    };

    if (isLoading || !settings) {
        return (
            <div className="settings-section">
                <div className="settings-section__header">
                    <h2 className="settings-section__title">Paramètres de Notification</h2>
                </div>
                <div className="settings-section__body--centered">
                    <RefreshCw size={24} className="spinning" />
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <h2 className="settings-section__title">Paramètres de Notification</h2>
                <p className="settings-section__description">
                    Configurez comment le système envoie des alertes et des rapports.
                </p>
            </div>

            <div className="settings-section__body">
                {/* Email Settings */}
                <div className="settings-group">
                    <h3 className="settings-group__title">
                        <Mail size={18} />
                        Configuration Email (SMTP)
                    </h3>
                    <Toggle
                        label="Email activé"
                        description="Activer l’envoi d’emails par le système"
                        checked={settings.email_enabled}
                        onChange={(v) => handleUpdate('email_enabled', v)}
                    />

                    <div className="form-row">
                        <Input
                            label="Serveur SMTP"
                            value={settings.smtp_host}
                            placeholder="smtp.example.com"
                            onChange={(v) => handleUpdate('smtp_host', v)}
                            disabled={!settings.email_enabled}
                        />
                        <Input
                            label="Port SMTP"
                            type="number"
                            value={settings.smtp_port}
                            placeholder="587"
                            onChange={(v) => handleUpdate('smtp_port', Number(v))}
                            disabled={!settings.email_enabled}
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            label="Utilisateur SMTP"
                            value={settings.smtp_user}
                            placeholder="user@example.com"
                            onChange={(v) => handleUpdate('smtp_user', v)}
                            disabled={!settings.email_enabled}
                        />
                        <Input
                            label="Mot de passe SMTP"
                            type="password"
                            value={settings.smtp_password}
                            placeholder="••••••••"
                            onChange={(v) => handleUpdate('smtp_password', v)}
                            disabled={!settings.email_enabled}
                        />
                    </div>

                    <Input
                        label="Email expéditeur"
                        value={settings.from_email}
                        placeholder="noreply@breakery.com"
                        onChange={(v) => handleUpdate('from_email', v)}
                        disabled={!settings.email_enabled}
                    />

                    {/* Test Email */}
                    <div className="notification-test-box">
                        <h4 className="notification-test-header">Tester la configuration</h4>
                        <div className="form-row">
                            <Input
                                label="Email de destination"
                                value={testEmail}
                                placeholder="dest@example.com"
                                onChange={setTestEmail}
                                disabled={!settings.email_enabled}
                            />
                            <button
                                className="btn-secondary btn-test-send"
                                onClick={handleSendTestEmail}
                                disabled={!settings.email_enabled || sendTestEmail.isPending}
                            >
                                {sendTestEmail.isPending ? <RefreshCw size={16} className="spinning" /> : <Send size={16} />}
                                Envoyer test
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alerts Settings */}
                <div className="settings-group">
                    <h3 className="settings-group__title">
                        <Bell size={18} />
                        Alertes et Rapports
                    </h3>
                    <Toggle
                        label="Alertes stock bas"
                        description="Recevoir une notification quand un produit atteint le seuil critique"
                        checked={settings.low_stock_alerts}
                        onChange={(v) => handleUpdate('low_stock_alerts', v)}
                    />
                    <Toggle
                        label="Rapport journalier"
                        description="Recevoir un résumé des ventes chaque soir"
                        checked={settings.daily_report}
                        onChange={(v) => handleUpdate('daily_report', v)}
                    />

                    {settings.daily_report && (
                        <div className="form-group daily-report-time-input">
                            <label className="form-label" htmlFor="daily-report-time">
                                <Clock size={14} />
                                Heure d’envoi
                            </label>
                            <input
                                id="daily-report-time"
                                type="time"
                                className="form-input"
                                value={settings.daily_report_time}
                                onChange={(e) => handleUpdate('daily_report_time', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Other integrations */}
                <div className="settings-group">
                    <h3 className="settings-group__title">
                        <MessageSquare size={18} />
                        Canaux supplémentaires
                    </h3>
                    <Toggle
                        label="WhatsApp (Bêta)"
                        description="Bientôt disponible : notifications via WhatsApp Business API"
                        checked={settings.whatsapp_enabled}
                        onChange={(v) => handleUpdate('whatsapp_enabled', v)}
                        disabled={true}
                    />
                </div>
            </div>
        </div>
    );
}
