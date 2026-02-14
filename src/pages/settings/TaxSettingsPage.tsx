import { useState, useEffect } from 'react';
import {
  useTaxRates,
  useCreateTaxRate,
  useUpdateTaxRate,
  useDeleteTaxRate,
  useSettingsByCategory,
  useUpdateSetting,
} from '../../hooks/settings';
import SettingField from '../../components/settings/SettingField';
import TaxRatesSection from '../../components/settings/TaxRatesSection';
import TaxRateModal from '../../components/settings/TaxRateModal';
import type { TaxRate } from '../../types/settings';
import { toast } from 'sonner';
import { logError } from '@/utils/logger';

interface TaxRateFormData {
  code: string;
  name: string;
  rate: number;
  is_inclusive: boolean;
  is_default: boolean;
  is_active: boolean;
}

const emptyForm: TaxRateFormData = {
  code: '', name: '', rate: 0, is_inclusive: true, is_default: false, is_active: true,
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
  const nameKey = 'name_en' as const;

  useEffect(() => {
    if (settings) {
      const initialValues: Record<string, unknown> = {};
      settings.forEach((setting) => { initialValues[setting.key] = setting.value; });
      setSettingValues(initialValues);
    }
  }, [settings]);

  const openCreateModal = () => { setEditingRate(null); setFormData(emptyForm); setShowModal(true); };

  const openEditModal = (rate: TaxRate) => {
    setEditingRate(rate);
    setFormData({
      code: rate.code, name: rate.name_en || rate.name_fr || '', rate: rate.rate,
      is_inclusive: rate.is_inclusive ?? false, is_default: rate.is_default ?? false, is_active: rate.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) { toast.error('Code and name are required'); return; }
    const dataToSave = {
      code: formData.code, name_fr: formData.name, name_en: formData.name, name_id: formData.name,
      rate: formData.rate, is_inclusive: formData.is_inclusive, is_default: formData.is_default, is_active: formData.is_active,
    };
    try {
      if (editingRate) {
        await updateTaxRate.mutateAsync({ id: editingRate.id, updates: dataToSave });
        toast.success('Tax rate updated');
      } else {
        await createTaxRate.mutateAsync(dataToSave as Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Tax rate created');
      }
      setShowModal(false);
    } catch (error) {
      logError('Tax rate save error:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving tax rate');
    }
  };

  const handleDelete = async (rate: TaxRate) => {
    if (rate.is_default) { toast.error('Cannot delete default tax rate'); return; }
    if (!confirm(`Delete rate "${rate[nameKey]}"?`)) return;
    try {
      await deleteTaxRate.mutateAsync(rate.id);
      toast.success('Tax rate deleted');
    } catch (error) {
      logError('Tax rate delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Error deleting tax rate');
    }
  };

  const handleSetDefault = async (rate: TaxRate) => {
    try {
      const currentDefault = taxRates?.find((r) => r.is_default);
      if (currentDefault) await updateTaxRate.mutateAsync({ id: currentDefault.id, updates: { is_default: false } });
      await updateTaxRate.mutateAsync({ id: rate.id, updates: { is_default: true } });
      await updateSetting.mutateAsync({ key: 'tax.default_rate', value: rate.code });
      toast.success(`${rate[nameKey]} set as default`);
    } catch (error) {
      logError('Set default tax rate error:', error);
      toast.error(error instanceof Error ? error.message : 'Error setting default tax rate');
    }
  };

  const handleSettingChange = async (key: string, value: unknown) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast.success('Setting saved');
    } catch (error) {
      logError('Setting save error:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving setting');
    }
  };

  const isLoading = loadingRates || loadingSettings;

  return (
    <>
      <TaxRatesSection
        taxRates={taxRates}
        isLoading={isLoading}
        nameKey={nameKey}
        onCreateRate={openCreateModal}
        onEditRate={openEditModal}
        onDeleteRate={handleDelete}
        onSetDefault={handleSetDefault}
      />

      {/* Tax Settings Section */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-display font-bold text-white mb-1">Billing Settings</h2>
          <p className="text-sm text-[var(--theme-text-muted)]">
            Configure tax display and calculation
          </p>
        </div>
        <div className="p-6">
          {loadingSettings ? (
            <div className="flex flex-col items-center justify-center p-12 gap-4 text-[var(--theme-text-muted)]">
              <div className="w-6 h-6 border-[3px] border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col">
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

      <TaxRateModal
        isOpen={showModal}
        isEditing={!!editingRate}
        formData={formData}
        isSaving={createTaxRate.isPending || updateTaxRate.isPending}
        onClose={() => setShowModal(false)}
        onFormChange={setFormData}
        onSave={handleSave}
      />
    </>
  );
};

export default TaxSettingsPage;
