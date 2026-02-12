import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle,
  Percent,
} from 'lucide-react';
import {
  useTaxRates,
  useCreateTaxRate,
  useUpdateTaxRate,
  useDeleteTaxRate,
  useSettingsByCategory,
  useUpdateSetting,
} from '../../hooks/settings';
import SettingField from '../../components/settings/SettingField';
import type { TaxRate } from '../../types/settings';
import { toast } from 'sonner';
import { logError } from '@/utils/logger'

interface TaxRateFormData {
  code: string;
  name: string;
  rate: number;
  is_inclusive: boolean;
  is_default: boolean;
  is_active: boolean;
}

const emptyForm: TaxRateFormData = {
  code: '',
  name: '',
  rate: 0,
  is_inclusive: true,
  is_default: false,
  is_active: true,
};

const TaxSettingsPage = () => {
  const { data: taxRates, isLoading: loadingRates } = useTaxRates();
  const { data: settings, isLoading: loadingSettings } = useSettingsByCategory('tax');
  const createTaxRate = useCreateTaxRate();
  const updateTaxRate = useUpdateTaxRate();
  const deleteTaxRate = useDeleteTaxRate();
  const updateSetting = useUpdateSetting();

  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);
  const [formData, setFormData] = useState<TaxRateFormData>(emptyForm);
  const [settingValues, setSettingValues] = useState<Record<string, unknown>>({});

  // Use English
  const nameKey = 'name_en' as const;

  // Initialize settingValues when settings are loaded
  useEffect(() => {
    if (settings) {
      const initialValues: Record<string, unknown> = {};
      settings.forEach((setting) => {
        initialValues[setting.key] = setting.value;
      });
      setSettingValues(initialValues);
    }
  }, [settings]);

  // Open create modal
  const openCreateModal = () => {
    setEditingRate(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (rate: TaxRate) => {
    setEditingRate(rate);
    setFormData({
      code: rate.code,
      name: rate.name_en || rate.name_fr || '',
      rate: rate.rate,
      is_inclusive: rate.is_inclusive ?? false,
      is_default: rate.is_default ?? false,
      is_active: rate.is_active ?? true,
    });
    setShowModal(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Code and name are required');
      return;
    }

    // Copy name to all language columns for DB compatibility
    const dataToSave = {
      code: formData.code,
      name_fr: formData.name,
      name_en: formData.name,
      name_id: formData.name,
      rate: formData.rate,
      is_inclusive: formData.is_inclusive,
      is_default: formData.is_default,
      is_active: formData.is_active,
    };

    try {
      if (editingRate) {
        await updateTaxRate.mutateAsync({
          id: editingRate.id,
          updates: dataToSave,
        });
        toast.success('Tax rate updated');
      } else {
        await createTaxRate.mutateAsync(dataToSave as Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Tax rate created');
      }
      setShowModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving tax rate';
      logError('Tax rate save error:', error);
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async (rate: TaxRate) => {
    if (rate.is_default) {
      toast.error('Cannot delete default tax rate');
      return;
    }

    if (!confirm(`Delete rate "${rate[nameKey]}"?`)) return;

    try {
      await deleteTaxRate.mutateAsync(rate.id);
      toast.success('Tax rate deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error deleting tax rate';
      logError('Tax rate delete error:', error);
      toast.error(message);
    }
  };

  // Set as default
  const handleSetDefault = async (rate: TaxRate) => {
    try {
      // Unset previous default
      const currentDefault = taxRates?.find((r) => r.is_default);
      if (currentDefault) {
        await updateTaxRate.mutateAsync({
          id: currentDefault.id,
          updates: { is_default: false },
        });
      }

      // Set new default
      await updateTaxRate.mutateAsync({
        id: rate.id,
        updates: { is_default: true },
      });

      // Update the setting
      await updateSetting.mutateAsync({
        key: 'tax.default_rate',
        value: rate.code,
      });

      toast.success(`${rate[nameKey]} set as default`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error setting default tax rate';
      logError('Set default tax rate error:', error);
      toast.error(message);
    }
  };

  // Handle setting change
  const handleSettingChange = async (key: string, value: unknown) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast.success('Setting saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving setting';
      logError('Setting save error:', error);
      toast.error(message);
    }
  };

  const isLoading = loadingRates || loadingSettings;

  return (
    <>
      {/* Tax Rates Section */}
      <div className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__header-content">
            <div>
              <h2 className="settings-section__title">Tax Rates (PPN)</h2>
              <p className="settings-section__description">
                Manage applicable VAT rates for products
              </p>
            </div>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              New Rate
            </button>
          </div>
        </div>

        <div className="settings-section__body">
          {isLoading ? (
            <div className="settings-section__loading">
              <div className="spinner" />
              <span>Loading...</span>
            </div>
          ) : taxRates?.length === 0 ? (
            <div className="settings-section__empty">
              <Percent size={48} />
              <h3>No tax rates</h3>
              <p>Create your first tax rate to get started.</p>
              <button className="btn-primary" onClick={openCreateModal}>
                <Plus size={16} />
                Create Rate
              </button>
            </div>
          ) : (
            <div className="tax-rates-list">
              {taxRates?.map((rate) => (
                <div
                  key={rate.id}
                  className={`tax-rate-item ${!rate.is_active ? 'is-inactive' : ''}`}
                >
                  <div className="tax-rate-item__info">
                    <div className="tax-rate-item__header">
                      <span className="tax-rate-item__code">{rate.code}</span>
                      {rate.is_default && (
                        <span className="tax-rate-item__default-badge">
                          <CheckCircle size={12} />
                          Default
                        </span>
                      )}
                      {!rate.is_active && (
                        <span className="tax-rate-item__inactive-badge">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="tax-rate-item__name">{rate[nameKey]}</div>
                    <div className="tax-rate-item__details">
                      <span className="tax-rate-item__rate">{rate.rate}%</span>
                      <span className="tax-rate-item__type">
                        {rate.is_inclusive ? 'TTC' : 'HT'}
                      </span>
                    </div>
                  </div>

                  <div className="tax-rate-item__actions">
                    {!rate.is_default && rate.is_active && (
                      <button
                        className="btn-ghost"
                        onClick={() => handleSetDefault(rate)}
                        title="Set as default"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      className="btn-ghost"
                      onClick={() => openEditModal(rate)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-ghost btn-ghost--danger"
                      onClick={() => handleDelete(rate)}
                      title="Delete"
                      disabled={rate.is_default ?? false}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tax Settings Section */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">Billing Settings</h2>
          <p className="settings-section__description">
            Configure tax display and calculation
          </p>
        </div>

        <div className="settings-section__body">
          {loadingSettings ? (
            <div className="settings-section__loading">
              <div className="spinner" />
            </div>
          ) : (
            <div className="settings-list">
              {settings?.map((setting) => (
                <SettingField
                  key={setting.key}
                  setting={setting}
                  value={settingValues[setting.key] ?? setting.value}
                  onChange={(value) => {
                    setSettingValues((prev) => ({ ...prev, [setting.key]: value }));
                    handleSettingChange(setting.key, value);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="settings-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal__header">
              <h2 className="settings-modal__title">
                {editingRate ? 'Edit Tax Rate' : 'New Tax Rate'}
              </h2>
              <button className="settings-modal__close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="settings-modal__body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="PPN_10"
                    disabled={!!editingRate}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rate (%) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                    min={0}
                    max={100}
                    step={0.01}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VAT 10%"
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_inclusive}
                    onChange={(e) => setFormData({ ...formData, is_inclusive: e.target.checked })}
                  />
                  <span>Tax-inclusive price (tax included in displayed price)</span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div className="settings-modal__footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createTaxRate.isPending || updateTaxRate.isPending}
              >
                <Save size={16} />
                {editingRate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaxSettingsPage;
