import { useState } from 'react';
import {
  Server, Eye, EyeOff, Send, Loader2,
  CheckCircle, XCircle,
} from 'lucide-react';

interface SmtpConfigSectionProps {
  formData: {
    smtp_enabled: boolean;
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string;
    smtp_secure: boolean;
    from_email: string;
    from_name: string;
  };
  errors: {
    smtp_host?: string;
    smtp_port?: string;
    smtp_user?: string;
    from_email?: string;
  };
  canEdit: boolean;
  hasExistingPassword: boolean;
  passwordChanged: boolean;
  onChange: (field: string, value: unknown) => void;
  onTestEmail: () => void;
  isTesting: boolean;
  testResult: 'success' | 'error' | null;
}

export function SmtpConfigSection({
  formData, errors, canEdit, hasExistingPassword, passwordChanged,
  onChange, onTestEmail, isTesting, testResult,
}: SmtpConfigSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputClass = 'bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 w-full px-3 py-2 text-sm';
  const errorInputClass = 'border-red-500/50 focus:border-red-400';
  const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]';

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server size={20} className="text-[var(--color-gold)]" />
          <div>
            <h3 className="text-base font-semibold text-white">SMTP Configuration</h3>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Configure email server settings for sending notifications
            </p>
          </div>
        </div>
        <label className="toggle-switch ml-auto">
          <input
            type="checkbox"
            checked={formData.smtp_enabled}
            onChange={(e) => onChange('smtp_enabled', e.target.checked)}
            disabled={!canEdit}
          />
          <span className="toggle-switch__slider" />
        </label>
      </div>

      {formData.smtp_enabled && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* SMTP Host */}
            <div>
              <label className={labelClass} htmlFor="smtp-host">
                SMTP Host <span className="text-red-400">*</span>
              </label>
              <input
                id="smtp-host"
                type="text"
                className={`${inputClass} mt-1.5 ${errors.smtp_host ? errorInputClass : ''}`}
                value={formData.smtp_host}
                onChange={(e) => onChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
                disabled={!canEdit}
              />
              {errors.smtp_host && <span className="text-xs text-red-400 mt-1">{errors.smtp_host}</span>}
            </div>

            {/* SMTP Port */}
            <div>
              <label className={labelClass} htmlFor="smtp-port">
                SMTP Port <span className="text-red-400">*</span>
              </label>
              <input
                id="smtp-port"
                type="number"
                className={`${inputClass} mt-1.5 ${errors.smtp_port ? errorInputClass : ''}`}
                value={formData.smtp_port}
                onChange={(e) => onChange('smtp_port', parseInt(e.target.value) || 587)}
                placeholder="587"
                min={1}
                max={65535}
                disabled={!canEdit}
              />
              {errors.smtp_port && <span className="text-xs text-red-400 mt-1">{errors.smtp_port}</span>}
              <span className="text-xs text-[var(--theme-text-muted)] mt-1 block">Common: 587 (TLS), 465 (SSL), 25</span>
            </div>

            {/* SMTP Username */}
            <div>
              <label className={labelClass} htmlFor="smtp-user">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="smtp-user"
                type="text"
                className={`${inputClass} mt-1.5 ${errors.smtp_user ? errorInputClass : ''}`}
                value={formData.smtp_user}
                onChange={(e) => onChange('smtp_user', e.target.value)}
                placeholder="your-email@gmail.com"
                disabled={!canEdit}
              />
              {errors.smtp_user && <span className="text-xs text-red-400 mt-1">{errors.smtp_user}</span>}
            </div>

            {/* SMTP Password */}
            <div>
              <label className={labelClass} htmlFor="smtp-password">Password</label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  id="smtp-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass} flex-1`}
                  value={formData.smtp_password}
                  onChange={(e) => onChange('smtp_password', e.target.value)}
                  placeholder={hasExistingPassword ? '--------  (saved)' : 'Enter password'}
                  disabled={!canEdit}
                />
                <button
                  type="button"
                  className="p-2 hover:bg-white/[0.04] rounded-xl transition-colors text-[var(--theme-text-muted)]"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="text-xs text-[var(--theme-text-muted)] mt-1 block">
                {hasExistingPassword && !passwordChanged
                  ? 'Password is stored securely. Leave empty to keep current password.'
                  : 'For Gmail, use an App Password'}
              </span>
            </div>

            {/* From Email */}
            <div>
              <label className={labelClass} htmlFor="from-email">
                From Email <span className="text-red-400">*</span>
              </label>
              <input
                id="from-email"
                type="email"
                className={`${inputClass} mt-1.5 ${errors.from_email ? errorInputClass : ''}`}
                value={formData.from_email}
                onChange={(e) => onChange('from_email', e.target.value)}
                placeholder="noreply@thebreakery.id"
                disabled={!canEdit}
              />
              {errors.from_email && <span className="text-xs text-red-400 mt-1">{errors.from_email}</span>}
            </div>

            {/* From Name */}
            <div>
              <label className={labelClass} htmlFor="from-name">From Name</label>
              <input
                id="from-name"
                type="text"
                className={`${inputClass} mt-1.5`}
                value={formData.from_name}
                onChange={(e) => onChange('from_name', e.target.value)}
                placeholder="The Breakery"
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* TLS Toggle */}
          <label className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.smtp_secure}
              onChange={(e) => onChange('smtp_secure', e.target.checked)}
              disabled={!canEdit}
              className="rounded border-white/10"
            />
            <span>Use TLS/SSL encryption</span>
          </label>

          {/* Test Email */}
          {canEdit && (
            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors disabled:opacity-50"
                onClick={onTestEmail}
                disabled={isTesting || !formData.smtp_host || !formData.smtp_user}
              >
                {isTesting ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : testResult === 'success' ? (
                  <><CheckCircle size={16} className="text-emerald-400" /> Test Successful</>
                ) : testResult === 'error' ? (
                  <><XCircle size={16} className="text-red-400" /> Test Failed</>
                ) : (
                  <><Send size={16} /> Send Test Email</>
                )}
              </button>
              <span className="text-sm text-[var(--theme-text-muted)]">
                Test email will be sent to {formData.from_email || 'the from address'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
