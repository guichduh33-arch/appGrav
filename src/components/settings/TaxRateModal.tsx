import { Save, X } from 'lucide-react';

interface TaxRateFormData {
  code: string;
  name: string;
  rate: number;
  is_inclusive: boolean;
  is_default: boolean;
  is_active: boolean;
}

interface TaxRateModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: TaxRateFormData;
  isSaving: boolean;
  onClose: () => void;
  onFormChange: (data: TaxRateFormData) => void;
  onSave: () => void;
}

const INPUT_CLASS = 'w-full h-12 px-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed';
const LABEL_CLASS = 'block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2';

const TaxRateModal = ({
  isOpen, isEditing, formData, isSaving,
  onClose, onFormChange, onSave,
}: TaxRateModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-[9999]" onClick={onClose}>
      <div className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white m-0">
            {isEditing ? 'Edit Tax Rate' : 'New Tax Rate'}
          </h2>
          <button className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:bg-white/5 hover:text-white" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1 mb-6">
            <div>
              <label className={LABEL_CLASS}>Code *</label>
              <input
                type="text"
                className={INPUT_CLASS}
                value={formData.code}
                onChange={(e) => onFormChange({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="PPN_10"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Rate (%) *</label>
              <input
                type="number"
                className={INPUT_CLASS}
                value={formData.rate}
                onChange={(e) => onFormChange({ ...formData, rate: Number(e.target.value) })}
                min={0}
                max={100}
                step={0.01}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className={LABEL_CLASS}>Name *</label>
            <input
              type="text"
              className={INPUT_CLASS}
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="VAT 10%"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white">
              <input
                type="checkbox"
                checked={formData.is_inclusive}
                onChange={(e) => onFormChange({ ...formData, is_inclusive: e.target.checked })}
                className="w-[18px] h-[18px] accent-[var(--color-gold)]"
              />
              <span>Tax-inclusive price (tax included in displayed price)</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => onFormChange({ ...formData, is_active: e.target.checked })}
                className="w-[18px] h-[18px] accent-[var(--color-gold)]"
              />
              <span>Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5 bg-black/20">
          <button className="px-4 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-all" onClick={onClose}>
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
};

export default TaxRateModal;
