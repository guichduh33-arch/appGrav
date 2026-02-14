import { useState, useEffect } from 'react';
import { Save, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '../../hooks/settings';
import { usePermissions } from '../../hooks/usePermissions';
import { companyAssetsService } from '../../services/storage';
import { toast } from 'sonner';
import { logError } from '@/utils/logger';
import CompanyLogoSection from '@/components/settings/CompanyLogoSection';
import CompanyFormFields from '@/components/settings/CompanyFormFields';

interface ICompanyFormData {
  name: string;
  legal_name: string;
  npwp: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
}

interface IValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  npwp?: string;
}

const COMPANY_SETTINGS_KEYS = {
  name: 'company.name',
  legalName: 'company.legal_name',
  npwp: 'company.npwp',
  address: 'company.address',
  phone: 'company.phone',
  email: 'company.email',
  logoUrl: 'company.logo_url',
} as const;

const defaultFormData: ICompanyFormData = {
  name: '', legal_name: '', npwp: '', address: '', phone: '', email: '', logo_url: '',
};

const parseSettingValue = (value: unknown): string => {
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); return typeof parsed === 'string' ? parsed : ''; }
    catch { return value; }
  }
  return '';
};

const validateForm = (data: ICompanyFormData): IValidationErrors => {
  const errors: IValidationErrors = {};
  if (!data.name?.trim()) errors.name = 'Company name is required';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
  if (data.phone && data.phone.replace(/\D/g, '').length < 8) errors.phone = 'Phone number must have at least 8 digits';
  if (data.npwp && !/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/.test(data.npwp)) errors.npwp = 'Invalid NPWP format (XX.XXX.XXX.X-XXX.XXX)';
  return errors;
};

const CompanySettingsPage = () => {
  const { data: settings, isLoading } = useSettingsByCategory('company');
  const updateSetting = useUpdateSetting();
  const { hasPermission, isAdmin } = usePermissions();
  const canEdit = hasPermission('settings.update') || isAdmin;

  const [formData, setFormData] = useState<ICompanyFormData>(defaultFormData);
  const [errors, setErrors] = useState<IValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings && settings.length > 0) {
      const newFormData: ICompanyFormData = { ...defaultFormData };
      settings.forEach((setting) => {
        const value = parseSettingValue(setting.value);
        switch (setting.key) {
          case COMPANY_SETTINGS_KEYS.name: newFormData.name = value; break;
          case COMPANY_SETTINGS_KEYS.legalName: newFormData.legal_name = value; break;
          case COMPANY_SETTINGS_KEYS.npwp: newFormData.npwp = value; break;
          case COMPANY_SETTINGS_KEYS.address: newFormData.address = value; break;
          case COMPANY_SETTINGS_KEYS.phone: newFormData.phone = value; break;
          case COMPANY_SETTINGS_KEYS.email: newFormData.email = value; break;
          case COMPANY_SETTINGS_KEYS.logoUrl: newFormData.logo_url = value; break;
        }
      });
      setFormData(newFormData);
      setIsDirty(false);
    }
  }, [settings]);

  const handleChange = (field: keyof ICompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field as keyof IValidationErrors]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field as keyof IValidationErrors]; return next; });
    }
  };

  const handleNpwpChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 15);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 5 || i === 8) formatted += '.';
      if (i === 9) formatted += '-';
      if (i === 12) formatted += '.';
      formatted += digits[i];
    }
    handleChange('npwp', formatted);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await companyAssetsService.replaceLogo(file, formData.logo_url || undefined);
      if (!result.success) { toast.error(result.error || 'Failed to upload logo'); return; }
      handleChange('logo_url', result.publicUrl!);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      logError('Logo upload error:', error);
      toast.error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!formData.logo_url) return;
    try {
      await companyAssetsService.deleteLogo(formData.logo_url);
      handleChange('logo_url', '');
      toast.success('Logo removed');
    } catch (error) {
      logError('Logo removal error:', error);
      toast.error(`Failed to remove logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: COMPANY_SETTINGS_KEYS.name, value: formData.name },
        { key: COMPANY_SETTINGS_KEYS.legalName, value: formData.legal_name },
        { key: COMPANY_SETTINGS_KEYS.npwp, value: formData.npwp },
        { key: COMPANY_SETTINGS_KEYS.address, value: formData.address },
        { key: COMPANY_SETTINGS_KEYS.phone, value: formData.phone },
        { key: COMPANY_SETTINGS_KEYS.email, value: formData.email },
        { key: COMPANY_SETTINGS_KEYS.logoUrl, value: formData.logo_url },
      ];
      for (const setting of settingsToSave) {
        await updateSetting.mutateAsync({ key: setting.key, value: setting.value });
      }
      toast.success('Company settings saved');
      setIsDirty(false);
    } catch (error) {
      logError('Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  if (isLoading) {
    return (
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
        <div className="flex flex-col items-center justify-center p-12 gap-4 text-[var(--theme-text-muted)]">
          <div className="w-6 h-6 border-[3px] border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          <span>Loading company settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-display font-bold text-white mb-1">
              <Building2 size={24} className="text-[var(--color-gold)]" />
              Company Information
            </h2>
            <p className="text-sm text-[var(--theme-text-muted)]">
              Configure your company details for receipts and reports
            </p>
          </div>
          {canEdit && isDirty && (
            <button
              className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
      </div>

      <div className="p-6">
        {!canEdit && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl text-[var(--color-warning-text)] text-sm mb-6">
            <AlertCircle size={16} />
            <span>You don't have permission to edit these settings</span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <CompanyLogoSection
            logoUrl={formData.logo_url}
            canEdit={canEdit}
            isUploading={isUploading}
            onUpload={handleLogoUpload}
            onRemove={handleLogoRemove}
          />

          <CompanyFormFields
            formData={formData}
            errors={errors}
            canEdit={canEdit}
            onChange={handleChange}
            onNpwpChange={handleNpwpChange}
          />
        </div>

        {isDirty && (
          <div className="mt-6 px-4 py-3 bg-black/20 border-t border-white/5 rounded-b-xl">
            <div className="flex items-center gap-2 text-sm text-[var(--color-warning-text)]">
              <AlertCircle size={16} />
              <span>You have unsaved changes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySettingsPage;
