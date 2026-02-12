import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Building2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '../../hooks/settings';
import { usePermissions } from '../../hooks/usePermissions';
import { companyAssetsService } from '../../services/storage';
import { toast } from 'sonner';
import { logError } from '@/utils/logger'

// Company form data interface
interface ICompanyFormData {
  name: string;
  legal_name: string;
  npwp: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
}

// Validation errors interface
interface IValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  npwp?: string;
}

// Setting key constants
const COMPANY_SETTINGS_KEYS = {
  name: 'company.name',
  legalName: 'company.legal_name',
  npwp: 'company.npwp',
  address: 'company.address',
  phone: 'company.phone',
  email: 'company.email',
  logoUrl: 'company.logo_url',
} as const;

// Default form values
const defaultFormData: ICompanyFormData = {
  name: '',
  legal_name: '',
  npwp: '',
  address: '',
  phone: '',
  email: '',
  logo_url: '',
};

/**
 * Parse JSONB value from settings
 */
const parseSettingValue = (value: unknown): string => {
  if (typeof value === 'string') {
    // Value might be JSON-encoded string
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'string' ? parsed : '';
    } catch {
      return value;
    }
  }
  return '';
};

/**
 * Validate company form data
 */
const validateForm = (data: ICompanyFormData): IValidationErrors => {
  const errors: IValidationErrors = {};

  // Company name is required
  if (!data.name?.trim()) {
    errors.name = 'Company name is required';
  }

  // Email validation (optional but must be valid if provided)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Phone validation (optional but must have at least 8 digits if provided)
  if (data.phone && data.phone.replace(/\D/g, '').length < 8) {
    errors.phone = 'Phone number must have at least 8 digits';
  }

  // NPWP format validation (optional but must match format if provided)
  // Format: XX.XXX.XXX.X-XXX.XXX (15 digits with separators)
  if (data.npwp && !/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/.test(data.npwp)) {
    errors.npwp = 'Invalid NPWP format (XX.XXX.XXX.X-XXX.XXX)';
  }

  return errors;
};

const CompanySettingsPage = () => {
  const { data: settings, isLoading } = useSettingsByCategory('company');
  const updateSetting = useUpdateSetting();
  const { hasPermission, isAdmin } = usePermissions();

  const canEdit = hasPermission('settings.update') || isAdmin;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ICompanyFormData>(defaultFormData);
  const [errors, setErrors] = useState<IValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form from settings
  useEffect(() => {
    if (settings && settings.length > 0) {
      const newFormData: ICompanyFormData = { ...defaultFormData };

      settings.forEach((setting) => {
        const value = parseSettingValue(setting.value);
        switch (setting.key) {
          case COMPANY_SETTINGS_KEYS.name:
            newFormData.name = value;
            break;
          case COMPANY_SETTINGS_KEYS.legalName:
            newFormData.legal_name = value;
            break;
          case COMPANY_SETTINGS_KEYS.npwp:
            newFormData.npwp = value;
            break;
          case COMPANY_SETTINGS_KEYS.address:
            newFormData.address = value;
            break;
          case COMPANY_SETTINGS_KEYS.phone:
            newFormData.phone = value;
            break;
          case COMPANY_SETTINGS_KEYS.email:
            newFormData.email = value;
            break;
          case COMPANY_SETTINGS_KEYS.logoUrl:
            newFormData.logo_url = value;
            break;
        }
      });

      setFormData(newFormData);
      setIsDirty(false);
    }
  }, [settings]);

  // Handle field change
  const handleChange = (field: keyof ICompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // Clear error for this field
    if (errors[field as keyof IValidationErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof IValidationErrors];
        return next;
      });
    }
  };

  // Handle NPWP input with auto-formatting
  const handleNpwpChange = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '').slice(0, 15);

    // Auto-format as XX.XXX.XXX.X-XXX.XXX
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 5 || i === 8) formatted += '.';
      if (i === 9) formatted += '-';
      if (i === 12) formatted += '.';
      formatted += digits[i];
    }

    handleChange('npwp', formatted);
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Use service to replace logo (handles upload + old logo deletion)
      const result = await companyAssetsService.replaceLogo(file, formData.logo_url || undefined);

      if (!result.success) {
        toast.error(result.error || 'Failed to upload logo');
        return;
      }

      // Update form data with new URL
      handleChange('logo_url', result.publicUrl!);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      logError('Logo upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to upload logo: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle logo removal
  const handleLogoRemove = async () => {
    if (!formData.logo_url) return;

    try {
      // Use service to delete logo
      await companyAssetsService.deleteLogo(formData.logo_url);
      handleChange('logo_url', '');
      toast.success('Logo removed');
    } catch (error) {
      logError('Logo removal error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to remove logo: ${errorMessage}`);
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
      // Save all settings
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
        await updateSetting.mutateAsync({
          key: setting.key,
          value: setting.value,
        });
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

  // Check for validation errors
  const hasErrors = Object.keys(errors).length > 0;

  if (isLoading) {
    return (
      <div className="settings-section">
        <div className="settings-section__body settings-section__loading">
          <div className="spinner" />
          <span>Loading company settings...</span>
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
              <Building2 size={24} />
              Company Information
            </h2>
            <p className="settings-section__description">
              Configure your company details for receipts and reports
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

        <div className="company-settings-form">
          {/* Logo Section */}
          <div className="company-settings-form__logo-section">
            <label className="form-label">Company Logo</label>
            <div className="company-logo-upload">
              {formData.logo_url ? (
                <div className="company-logo-preview">
                  <img src={formData.logo_url} alt="Company logo" />
                  {canEdit && (
                    <button
                      type="button"
                      className="company-logo-preview__remove"
                      onClick={handleLogoRemove}
                      title="Remove logo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="company-logo-placeholder">
                  <Building2 size={48} />
                  <span>No logo uploaded</span>
                </div>
              )}
              {canEdit && (
                <div className="company-logo-upload__actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </>
                    )}
                  </button>
                  <span className="company-logo-upload__hint">
                    PNG, JPG up to 2MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="company-settings-form__fields">
            {/* Company Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="company-name">
                Company Name <span className="form-required">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="The Breakery"
                disabled={!canEdit}
              />
              {errors.name && (
                <span className="form-error">{errors.name}</span>
              )}
            </div>

            {/* Legal Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="legal-name">Legal Name</label>
              <input
                id="legal-name"
                type="text"
                className="form-input"
                value={formData.legal_name}
                onChange={(e) => handleChange('legal_name', e.target.value)}
                placeholder="PT The Breakery Indonesia"
                disabled={!canEdit}
              />
            </div>

            {/* NPWP */}
            <div className="form-group">
              <label className="form-label" htmlFor="npwp">NPWP (Tax Number)</label>
              <input
                id="npwp"
                type="text"
                className={`form-input ${errors.npwp ? 'form-input--error' : ''}`}
                value={formData.npwp}
                onChange={(e) => handleNpwpChange(e.target.value)}
                placeholder="XX.XXX.XXX.X-XXX.XXX"
                disabled={!canEdit}
              />
              {errors.npwp && (
                <span className="form-error">{errors.npwp}</span>
              )}
              <span className="form-hint">Indonesian tax identification number</span>
            </div>

            {/* Address */}
            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="address">Address</label>
              <textarea
                id="address"
                className="form-input form-textarea"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Jl. Raya Senggigi No. 123, Lombok Barat, NTB 83355"
                rows={3}
                disabled={!canEdit}
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+62 370 123 4567"
                disabled={!canEdit}
              />
              {errors.phone && (
                <span className="form-error">{errors.phone}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@thebreakery.id"
                disabled={!canEdit}
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
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

export default CompanySettingsPage;
