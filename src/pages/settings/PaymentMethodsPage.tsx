import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
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
import { PaymentMethodModal } from './payment-methods/PaymentMethodModal';
import type { PaymentMethodFormData } from './payment-methods/PaymentMethodModal';
import { toast } from 'sonner';
import { logError } from '@/utils/logger'

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

const ICON_MAP: Record<string, React.ReactNode> = {
  Banknote: <Banknote size={20} />, CreditCard: <CreditCard size={20} />,
  Building: <Building size={20} />, Wallet: <Wallet size={20} />,
  QrCode: <QrCode size={20} />, Smartphone: <Smartphone size={20} />,
  Globe: <Globe size={20} />, DollarSign: <DollarSign size={20} />,
};
const getPaymentIcon = (name: string) => ICON_MAP[name] ?? <Wallet size={20} />;

const PaymentMethodsPage = () => {
  const { data: methods, isLoading } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodFormData>(emptyForm);

  const nameKey = 'name_en' as const;

  const openCreateModal = () => {
    setEditingMethod(null);
    setFormData({
      ...emptyForm,
      sort_order: (methods?.length || 0) * 10 + 10,
    });
    setShowModal(true);
  };

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

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Code and name are required');
      return;
    }

    const dataToSave = {
      code: formData.code, payment_type: formData.payment_type, icon: formData.icon,
      is_active: formData.is_active, is_default: formData.is_default,
      requires_reference: formData.requires_reference, sort_order: formData.sort_order,
      settings: formData.settings as Record<string, unknown> | null,
      name: formData.name, name_fr: formData.name, name_en: formData.name,
      name_id: formData.name, type: formData.payment_type,
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

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      const currentDefault = methods?.find((m) => m.is_default);
      if (currentDefault) {
        await updateMethod.mutateAsync({
          id: currentDefault.id,
          updates: { is_default: false },
        });
      }
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

  const groupedMethods = methods?.reduce((acc: Record<string, PaymentMethod[]>, method: PaymentMethod) => {
    const type = method.payment_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>) || {};

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white">Payment Methods</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mt-1">
              Configure payment methods accepted at POS
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={openCreateModal}>
            <Plus size={16} />
            New Payment Method
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
            <div className="animate-spin w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full mr-3" />
            <span>Loading...</span>
          </div>
        ) : methods?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)]">
            <Wallet size={48} className="mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-white mb-1">No payment methods</h3>
            <p className="text-sm mb-4">Create your first payment method.</p>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={openCreateModal}>
              <Plus size={16} />
              Create Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {PAYMENT_TYPES.map((type) => {
              const typeMethods = groupedMethods?.[type.value] || [];
              if (typeMethods.length === 0) return null;

              return (
                <div key={type.value}>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] flex items-center gap-2 mb-3">
                    {type.icon}
                    {type.label}
                  </h3>
                  <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                    {typeMethods.map((method: PaymentMethod) => (
                      <div
                        key={method.id}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors ${!method.is_active ? 'opacity-40' : ''}`}
                      >
                        <GripVertical size={16} className="text-[var(--theme-text-muted)] shrink-0 cursor-grab" />
                        <div className="p-2 rounded-lg bg-white/5 text-[var(--color-gold)] shrink-0">
                          {getPaymentIcon(method.icon ?? '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{method[nameKey]}</span>
                            {method.is_default && (
                              <span className="text-emerald-400">
                                <CheckCircle size={14} />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--theme-text-muted)]">{method.code}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className={`w-9 h-5 rounded-full cursor-pointer transition-all relative shrink-0 after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all ${method.is_active ? 'bg-[var(--color-gold)] after:left-[18px]' : 'bg-white/10'}`}
                            onClick={() => handleToggleActive(method)}
                            title={method.is_active ? 'Disable' : 'Enable'}
                          />
                          {!method.is_default && method.is_active && (
                            <button className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-emerald-400 hover:bg-white/5 transition-colors" onClick={() => handleSetDefault(method)} title="Set as default">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors" onClick={() => openEditModal(method)} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-30" onClick={() => handleDelete(method)} title="Delete" disabled={method.is_default ?? false}>
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

      {showModal && (
        <PaymentMethodModal
          isEditing={!!editingMethod}
          formData={formData}
          onFormChange={setFormData}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isSaving={createMethod.isPending || updateMethod.isPending}
        />
      )}
    </>
  );
};

export default PaymentMethodsPage;
