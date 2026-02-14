import { Save, X } from 'lucide-react';
import type { PaymentType } from '@/types/settings';

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

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'other', label: 'Other' },
];

const ICONS = [
  'Banknote', 'CreditCard', 'Building', 'Wallet', 'QrCode', 'Smartphone', 'Globe', 'DollarSign',
];

const inputClass =
  'w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

const selectClass = `${inputClass} cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239ca3af%27%20stroke-width=%272%27%3E%3Cpath%20d=%27M6%209l6%206%206-6%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-10`;

interface PaymentMethodModalProps {
  isEditing: boolean;
  formData: PaymentMethodFormData;
  onFormChange: (data: PaymentMethodFormData) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export function PaymentMethodModal({
  isEditing,
  formData,
  onFormChange,
  onSave,
  onClose,
  isSaving,
}: PaymentMethodModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-display font-bold text-white">
            {isEditing ? 'Edit Payment Method' : 'New Payment Method'}
          </h2>
          <button className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Code *</label>
              <input
                type="text"
                className={inputClass}
                value={formData.code}
                onChange={(e) => onFormChange({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="CASH"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Type *</label>
              <select
                className={selectClass}
                value={formData.payment_type}
                onChange={(e) => onFormChange({ ...formData, payment_type: e.target.value as PaymentType })}
              >
                {PAYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Name *</label>
            <input
              type="text"
              className={inputClass}
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="Cash"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Icon</label>
            <select
              className={selectClass}
              value={formData.icon}
              onChange={(e) => onFormChange({ ...formData, icon: e.target.value })}
            >
              {ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 py-1 cursor-pointer">
            <input
              type="checkbox"
              className="accent-[var(--color-gold)]"
              checked={formData.requires_reference}
              onChange={(e) => onFormChange({ ...formData, requires_reference: e.target.checked })}
            />
            <span className="text-sm text-white">Requires reference (transaction number)</span>
          </label>

          <label className="flex items-center gap-3 py-1 cursor-pointer">
            <input
              type="checkbox"
              className="accent-[var(--color-gold)]"
              checked={formData.is_active}
              onChange={(e) => onFormChange({ ...formData, is_active: e.target.checked })}
            />
            <span className="text-sm text-white">Active</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors" onClick={onClose}>
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-opacity disabled:opacity-50"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save size={16} />
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { PaymentMethodFormData };
