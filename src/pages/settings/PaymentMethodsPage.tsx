import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle,
  GripVertical,
  Banknote,
  CreditCard,
  Building,
  Wallet,
  QrCode,
} from 'lucide-react';
import {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '../../hooks/settings';
import type { PaymentMethod, PaymentType } from '../../types/settings';
import toast from 'react-hot-toast';

interface PaymentMethodFormData {
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  payment_type: PaymentType;
  icon: string;
  is_active: boolean;
  is_default: boolean;
  requires_reference: boolean;
  sort_order: number;
}

const emptyForm: PaymentMethodFormData = {
  code: '',
  name_fr: '',
  name_en: '',
  name_id: '',
  payment_type: 'cash',
  icon: 'Banknote',
  is_active: true,
  is_default: false,
  requires_reference: false,
  sort_order: 0,
};

const PAYMENT_TYPES: { value: PaymentType; label: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: 'Espèces', icon: <Banknote size={16} /> },
  { value: 'card', label: 'Carte', icon: <CreditCard size={16} /> },
  { value: 'transfer', label: 'Virement', icon: <Building size={16} /> },
  { value: 'ewallet', label: 'E-Wallet', icon: <Wallet size={16} /> },
  { value: 'other', label: 'Autre', icon: <QrCode size={16} /> },
];

const ICONS = [
  'Banknote', 'CreditCard', 'Building', 'Wallet', 'QrCode', 'Smartphone', 'Globe', 'DollarSign',
];

const getPaymentIcon = (iconName: string) => {
  switch (iconName) {
    case 'Banknote': return <Banknote size={20} />;
    case 'CreditCard': return <CreditCard size={20} />;
    case 'Building': return <Building size={20} />;
    case 'Wallet': return <Wallet size={20} />;
    case 'QrCode': return <QrCode size={20} />;
    default: return <Wallet size={20} />;
  }
};

const PaymentMethodsPage = () => {
  const { i18n } = useTranslation();
  const { data: methods, isLoading } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodFormData>(emptyForm);

  // Language
  const lang = i18n.language?.substring(0, 2) || 'fr';
  const nameKey = `name_${lang}` as 'name_fr' | 'name_en' | 'name_id';

  // Open create modal
  const openCreateModal = () => {
    setEditingMethod(null);
    setFormData({
      ...emptyForm,
      sort_order: (methods?.length || 0) * 10 + 10,
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      code: method.code,
      name_fr: method.name_fr,
      name_en: method.name_en,
      name_id: method.name_id,
      payment_type: method.payment_type as PaymentType,
      icon: method.icon ?? '',
      is_active: method.is_active ?? true,
      is_default: method.is_default ?? false,
      requires_reference: method.requires_reference ?? false,
      sort_order: method.sort_order ?? 0,
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
      if (editingMethod) {
        await updateMethod.mutateAsync({
          id: editingMethod.id,
          updates: formData,
        });
        toast.success('Mode de paiement mis à jour');
      } else {
        await createMethod.mutateAsync(formData);
        toast.success('Mode de paiement créé');
      }
      setShowModal(false);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Handle delete
  const handleDelete = async (method: PaymentMethod) => {
    if (method.is_default) {
      toast.error('Impossible de supprimer le mode par défaut');
      return;
    }

    if (!confirm(`Supprimer "${method[nameKey]}" ?`)) return;

    try {
      await deleteMethod.mutateAsync(method.id);
      toast.success('Mode de paiement supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Toggle active
  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      await updateMethod.mutateAsync({
        id: method.id,
        updates: { is_active: !method.is_active },
      });
      toast.success(method.is_active ? 'Désactivé' : 'Activé');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Set as default
  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      // Unset previous default
      const currentDefault = methods?.find((m) => m.is_default);
      if (currentDefault) {
        await updateMethod.mutateAsync({
          id: currentDefault.id,
          updates: { is_default: false },
        });
      }

      // Set new default
      await updateMethod.mutateAsync({
        id: method.id,
        updates: { is_default: true },
      });

      toast.success(`${method[nameKey]} défini par défaut`);
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Group methods by type
  const groupedMethods = methods?.reduce((acc: Record<string, PaymentMethod[]>, method: PaymentMethod) => {
    const type = method.payment_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>) || {};

  return (
    <>
      <div className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__header-content">
            <div>
              <h2 className="settings-section__title">Modes de Paiement</h2>
              <p className="settings-section__description">
                Configurez les moyens de paiement acceptés au POS
              </p>
            </div>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              Nouveau Mode
            </button>
          </div>
        </div>

        <div className="settings-section__body">
          {isLoading ? (
            <div className="settings-section__loading">
              <div className="spinner" />
              <span>Chargement...</span>
            </div>
          ) : methods?.length === 0 ? (
            <div className="settings-section__empty">
              <Wallet size={48} />
              <h3>Aucun mode de paiement</h3>
              <p>Créez votre premier mode de paiement.</p>
              <button className="btn-primary" onClick={openCreateModal}>
                <Plus size={16} />
                Créer un mode
              </button>
            </div>
          ) : (
            <div className="payment-methods-grid">
              {PAYMENT_TYPES.map((type) => {
                const typeMethods = groupedMethods?.[type.value] || [];
                if (typeMethods.length === 0) return null;

                return (
                  <div key={type.value} className="payment-methods-group">
                    <h3 className="payment-methods-group__title">
                      {type.icon}
                      {type.label}
                    </h3>
                    <div className="payment-methods-list">
                      {typeMethods.map((method: PaymentMethod) => (
                        <div
                          key={method.id}
                          className={`payment-method-item ${!method.is_active ? 'is-inactive' : ''}`}
                        >
                          <div className="payment-method-item__drag">
                            <GripVertical size={16} />
                          </div>
                          <div className="payment-method-item__icon">
                            {getPaymentIcon(method.icon ?? '')}
                          </div>
                          <div className="payment-method-item__info">
                            <div className="payment-method-item__name">
                              {method[nameKey]}
                              {method.is_default && (
                                <span className="payment-method-item__default">
                                  <CheckCircle size={12} />
                                </span>
                              )}
                            </div>
                            <div className="payment-method-item__code">{method.code}</div>
                          </div>
                          <div className="payment-method-item__actions">
                            <button
                              className={`toggle-mini ${method.is_active ? 'is-on' : ''}`}
                              onClick={() => handleToggleActive(method)}
                              title={method.is_active ? 'Désactiver' : 'Activer'}
                            />
                            {!method.is_default && method.is_active && (
                              <button
                                className="btn-icon"
                                onClick={() => handleSetDefault(method)}
                                title="Définir par défaut"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button
                              className="btn-icon"
                              onClick={() => openEditModal(method)}
                              title="Modifier"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-icon btn-icon--danger"
                              onClick={() => handleDelete(method)}
                              title="Supprimer"
                              disabled={method.is_default ?? false}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
                {editingMethod ? 'Modifier le Mode' : 'Nouveau Mode de Paiement'}
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
                    placeholder="CASH"
                    disabled={!!editingMethod}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-input form-select"
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as PaymentType })}
                  >
                    {PAYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nom (Français) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  placeholder="Espèces"
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
                    placeholder="Cash"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom (Indonésien)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name_id}
                    onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
                    placeholder="Tunai"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Icône</label>
                <select
                  className="form-input form-select"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  {ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.requires_reference}
                    onChange={(e) => setFormData({ ...formData, requires_reference: e.target.checked })}
                  />
                  <span>Nécessite une référence (numéro de transaction)</span>
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
                disabled={createMethod.isPending || updateMethod.isPending}
              >
                <Save size={16} />
                {editingMethod ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentMethodsPage;
