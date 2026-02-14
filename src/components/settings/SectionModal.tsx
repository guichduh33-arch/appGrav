import { Layers, X, Save, ShoppingCart, Factory, Warehouse } from 'lucide-react';

type TSectionType = 'warehouse' | 'production' | 'sales';

interface SectionFormData {
  name: string;
  code: string;
  description: string;
  section_type: TSectionType;
  icon: string;
}

const SECTION_TYPES = [
  { value: 'warehouse' as const, label: 'Warehouse / Storage', icon: <Warehouse size={20} />, bgClass: 'bg-blue-500/10 text-blue-400', borderClass: 'border-blue-500/30' },
  { value: 'production' as const, label: 'Production', icon: <Factory size={20} />, bgClass: 'bg-emerald-500/10 text-emerald-400', borderClass: 'border-emerald-500/30' },
  { value: 'sales' as const, label: 'Point of Sale', icon: <ShoppingCart size={20} />, bgClass: 'bg-amber-500/10 text-amber-400', borderClass: 'border-amber-500/30' },
];

interface SectionModalProps {
  isOpen: boolean;
  editingSection: { id: string } | null;
  sectionForm: SectionFormData;
  savingSection: boolean;
  onClose: () => void;
  onSectionNameChange: (name: string) => void;
  onFormChange: (form: SectionFormData) => void;
  onSave: () => void;
}

const SectionModal = ({
  isOpen, editingSection, sectionForm, savingSection,
  onClose, onSectionNameChange, onFormChange, onSave,
}: SectionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-white/5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] text-black flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white m-0">
              {editingSection ? 'Edit Section' : 'New Section'}
            </h2>
            <p className="text-sm text-[var(--theme-text-muted)] mt-1 m-0">
              {editingSection ? 'Edit section information' : 'Create a new section to organize your stock'}
            </p>
          </div>
          <button className="ml-auto p-2 cursor-pointer text-[var(--theme-text-muted)] rounded-lg transition-all hover:bg-white/5 hover:text-white bg-transparent border-none" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">
              Section Name *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
              value={sectionForm.name}
              onChange={(e) => onSectionNameChange(e.target.value)}
              placeholder="e.g. Kitchen, Bar, Warehouse..."
              autoFocus
              aria-label="Section name"
            />
          </div>

          <div className="grid grid-cols-[1fr_100px] gap-4 max-[500px]:grid-cols-1 mb-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">
                Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                value={sectionForm.code}
                onChange={(e) => onFormChange({ ...sectionForm, code: e.target.value })}
                placeholder="kitchen"
                aria-label="Section code"
              />
              <p className="text-xs text-[var(--theme-text-muted)] mt-2">Unique identifier. Auto-generated.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">
                Icon
              </label>
              <input
                type="text"
                className="w-20 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-center text-2xl placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
                value={sectionForm.icon}
                onChange={(e) => onFormChange({ ...sectionForm, icon: e.target.value })}
                placeholder=""
                maxLength={4}
                aria-label="Section icon"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">
              Description
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
              value={sectionForm.description}
              onChange={(e) => onFormChange({ ...sectionForm, description: e.target.value })}
              placeholder="Section description..."
              aria-label="Section description"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">Section Type *</label>
            <div className="flex flex-col gap-3">
              {SECTION_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-4 p-4 bg-white/[0.02] border-2 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04]
                    ${sectionForm.section_type === type.value ? `border-[var(--color-gold)] bg-[var(--color-gold)]/5` : 'border-white/5'}`}
                >
                  <input
                    type="radio"
                    name="section_type"
                    value={type.value}
                    checked={sectionForm.section_type === type.value}
                    onChange={() => onFormChange({ ...sectionForm, section_type: type.value })}
                    className="w-5 h-5 mt-0.5 accent-[var(--color-gold)] shrink-0"
                  />
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${type.bgClass}`}>
                    {type.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-semibold text-white mb-1">{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-white/5 bg-black/20">
          <button className="px-4 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-all" onClick={onClose}>
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSave}
            disabled={savingSection || !sectionForm.name.trim()}
          >
            <Save size={18} />
            {savingSection ? 'Saving...' : (editingSection ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionModal;
