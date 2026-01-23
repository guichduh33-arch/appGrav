import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import toast from 'react-hot-toast';

interface TaxRateFormData {
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  rate: number;
  is_inclusive: boolean;
  is_default: boolean;
  is_active: boolean;
}

const emptyForm: TaxRateFormData = {
  code: '',
  name_fr: '',
  name_en: '',
  name_id: '',
  rate: 0,
  is_inclusive: true,
  is_default: false,
  is_active: true,
};

const TaxSettingsPage = () => {
  const { i18n } = useTranslation();
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

  // Language
  const lang = i18n.language?.substring(0, 2) || 'fr';
  const nameKey = `name_${lang}` as 'name_fr' | 'name_en' | 'name_id';

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
      name_fr: rate.name_fr,
      name_en: rate.name_en,
      name_id: rate.name_id,
      rate: rate.rate,
      is_inclusive: rate.is_inclusive,
      is_default: rate.is_default,
      is_active: rate.is_active,
    });
    setShowModal(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.code || !formData.name_fr) {
      toast.error('Le code et le nom sont requis');
      return;
    }

    try {
      if (editingRate) {
        await updateTaxRate.mutateAsync({
          id: editingRate.id,
          updates: formData,
        });
        toast.success('Taux de taxe mis à jour');
      } else {
        await createTaxRate.mutateAsync(formData as Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Taux de taxe créé');
      }
      setShowModal(false);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Handle delete
  const handleDelete = async (rate: TaxRate) => {
    if (rate.is_default) {
      toast.error('Impossible de supprimer le taux par défaut');
      return;
    }

    if (!confirm(`Supprimer le taux "${rate[nameKey]}" ?`)) return;

    try {
      await deleteTaxRate.mutateAsync(rate.id);
      toast.success('Taux de taxe supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
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

      toast.success(`${rate[nameKey]} défini par défaut`);
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  // Handle setting change
  const handleSettingChange = async (key: string, value: unknown) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast.success('Paramètre enregistré');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
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
              <h2 className="settings-section__title">Taux de Taxe (PPN)</h2>
              <p className="settings-section__description">
                Gérez les taux de TVA applicables aux produits
              </p>
            </div>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              Nouveau Taux
            </button>
          </div>
        </div>

        <div className="settings-section__body">
          {isLoading ? (
            <div className="settings-section__loading">
              <div className="spinner" />
              <span>Chargement...</span>
            </div>
          ) : taxRates?.length === 0 ? (
            <div className="settings-section__empty">
              <Percent size={48} />
              <h3>Aucun taux de taxe</h3>
              <p>Créez votre premier taux de taxe pour commencer.</p>
              <button className="btn-primary" onClick={openCreateModal}>
                <Plus size={16} />
                Créer un taux
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
                          Par défaut
                        </span>
                      )}
                      {!rate.is_active && (
                        <span className="tax-rate-item__inactive-badge">
                          Inactif
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
                        title="Définir par défaut"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      className="btn-ghost"
                      onClick={() => openEditModal(rate)}
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-ghost btn-ghost--danger"
                      onClick={() => handleDelete(rate)}
                      title="Supprimer"
                      disabled={rate.is_default}
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
          <h2 className="settings-section__title">Paramètres de Facturation</h2>
          <p className="settings-section__description">
            Configuration de l'affichage et du calcul des taxes
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
                {editingRate ? 'Modifier le Taux' : 'Nouveau Taux de Taxe'}
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
                  <label className="form-label">Taux (%) *</label>
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
                <label className="form-label">Nom (Français) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  placeholder="PPN 10%"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nom (Anglais)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="VAT 10%"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom (Indonésien)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name_id}
                    onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
                    placeholder="PPN 10%"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_inclusive}
                    onChange={(e) => setFormData({ ...formData, is_inclusive: e.target.checked })}
                  />
                  <span>Prix TTC (taxe incluse dans le prix affiché)</span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Actif</span>
                </label>
              </div>
            </div>

            <div className="settings-modal__footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createTaxRate.isPending || updateTaxRate.isPending}
              >
                <Save size={16} />
                {editingRate ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaxSettingsPage;
