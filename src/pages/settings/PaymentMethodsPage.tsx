import { useState } from 'react';
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
  Smartphone,
  Globe,
  DollarSign,
} from 'lucide-react';
import {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '../../hooks/settings';
import type { PaymentMethod, PaymentType } from '../../types/settings';
import { toast } from 'sonner';
import { logError } from '@/utils/logger'

interface PaymentMethodFormData {
  code: string;
  name: string;
  payment_type: PaymentType;
  icon: string;
  is_active: boolean;
  is_default: boolean;
  requires_reference: boolean;
  sort_order: number;
  settings: Record<string, unknown>;
}

const emptyForm: PaymentMethodFormData = {
  code: '',
  name: '',
  payment_type: 'cash',
  icon: 'Banknote',
  is_active: true,
  is_default: false,
  requires_reference: false,
  sort_order: 0,
  settings: {},
};

const PAYMENT_TYPES: { value: PaymentType; label: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: 'Cash', icon: <Banknote size={16} /> },
  { value: 'card', label: 'Card', icon: <CreditCard size={16} /> },
  { value: 'transfer', label: 'Transfer', icon: <Building size={16} /> },
  { value: 'ewallet', label: 'E-Wallet', icon: <Wallet size={16} /> },
  { value: 'other', label: 'Other', icon: <QrCode size={16} /> },
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
    case 'Smartphone': return <Smartphone size={20} />;
    case 'Globe': return <Globe size={20} />;
    case 'DollarSign': return <DollarSign size={20} />;
    default: return <Wallet size={20} />;
  }
};

const PaymentMethodsPage = () => {
  const { data: methods, isLoading } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodFormData>(emptyForm);

  // Use English
  const nameKey = 'name_en' as const;

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
      name: method.name_en || method.name_fr || '',
      payment_type: method.payment_type as PaymentType,
      icon: method.icon ?? '',
      is_active: method.is_active ?? true,
      is_default: method.is_default ?? false,
      requires_reference: method.requires_reference ?? false,
      sort_order: method.sort_order ?? 0,
      settings: (method.settings as Record<string, unknown>) ?? {},
    });
    setShowModal(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Code and name are required');
      return;
    }

    // Build save data - include all required fields for the PaymentMethod type
    const dataToSave = {
      code: formData.code,
      payment_type: formData.payment_type,
      icon: formData.icon,
      is_active: formData.is_active,
      is_default: formData.is_default,
      requires_reference: formData.requires_reference,
      sort_order: formData.sort_order,
      settings: formData.settings as Record<string, unknown> | null,
      // Copy name to all language columns for DB compatibility
      name: formData.name, // Legacy field
      name_fr: formData.name,
      name_en: formData.name,
      name_id: formData.name,
      type: formData.payment_type, // Legacy field mirrors payment_type
    };

    try {
      if (editingMethod) {
        await updateMethod.mutateAsync({
          id: editingMethod.id,
          updates: dataToSave as Partial<PaymentMethod>,
        });
        toast.success('Payment method updated');
      } else {
        await createMethod.mutateAsync(dataToSave as Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Payment method created');
      }
      setShowModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving payment method';
      logError('Payment method save error:', error);
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async (method: PaymentMethod) => {
    if (method.is_default) {
      toast.error('Cannot delete default payment method');
      return;
    }

    if (!confirm(`Delete "${method[nameKey]}"?`)) return;

    try {
      await deleteMethod.mutateAsync(method.id);
      toast.success('Payment method deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error deleting payment method';
      logError('Payment method delete error:', error);
      toast.error(message);
    }
  };

  // Toggle active
  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      await updateMethod.mutateAsync({
        id: method.id,
        updates: { is_active: !method.is_active },
      });
      toast.success(method.is_active ? 'Payment method disabled' : 'Payment method enabled');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error toggling status';
      logError('Payment method toggle error:', error);
      toast.error(message);
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

      toast.success(`${method[nameKey]} set as default`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error setting default';
      logError('Set default payment method error:', error);
      toast.error(message);
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
              <h2 className="settings-section__title">Payment Methods</h2>
              <p className="settings-section__description">
                Configure payment methods accepted at POS
              </p>
            </div>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              New Payment Method
            </button>
          </div>
        </div>

        <div className="settings-section__body">
          {isLoading ? (
            <div className="settings-section__loading">
              <div className="spinner" />
              <span>Loading...</span>
            </div>
          ) : methods?.length === 0 ? (
            <div className="settings-section__empty">
              <Wallet size={48} />
              <h3>No payment methods</h3>
              <p>Create your first payment method.</p>
              <button className="btn-primary" onClick={openCreateModal}>
                <Plus size={16} />
                Create Payment Method
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
                              title={method.is_active ? 'Disable' : 'Enable'}
                            />
                            {!method.is_default && method.is_active && (
                              <button
                                className="btn-icon"
                                onClick={() => handleSetDefault(method)}
                                title="Set as default"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button
                              className="btn-icon"
                              onClick={() => openEditModal(method)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-icon btn-icon--danger"
                              onClick={() => handleDelete(method)}
                              title="Delete"
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
                {editingMethod ? 'Edit Payment Method' : 'New Payment Method'}
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
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Cash"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
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
                  <span>Requires reference (transaction number)</span>
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
                disabled={createMethod.isPending || updateMethod.isPending}
              >
                <Save size={16} />
                {editingMethod ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentMethodsPage;
