import { X, Save } from 'lucide-react';
import type { CategoryFormData } from '@/hooks/settings/useCategorySettings';

// Predefined color palette
const COLOR_PALETTE = [
  { value: '#EF4444', name: 'Red' },
  { value: '#F97316', name: 'Orange' },
  { value: '#EAB308', name: 'Yellow' },
  { value: '#22C55E', name: 'Green' },
  { value: '#14B8A6', name: 'Teal' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#EC4899', name: 'Pink' },
  { value: '#6B7280', name: 'Gray' },
  { value: '#1F2937', name: 'Dark' },
];

// Dispatch stations
const DISPATCH_STATIONS: { value: 'barista' | 'kitchen' | 'display' | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'barista', label: 'Barista' },
  { value: 'display', label: 'Display' },
];

interface CategoryFormModalProps {
  isEditing: boolean;
  formData: CategoryFormData;
  onChange: (data: CategoryFormData) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export function CategoryFormModal({
  isEditing,
  formData,
  onChange,
  onSave,
  onClose,
  isSaving,
}: CategoryFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none transition-colors text-sm"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="Category name"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-lg transition-all ${
                    formData.color === color.value
                      ? 'ring-2 ring-[var(--color-gold)] ring-offset-2 ring-offset-[var(--theme-bg-secondary)] scale-110'
                      : 'ring-1 ring-white/10 hover:ring-white/30'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => onChange({ ...formData, color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Dispatch Station */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Dispatch Station</label>
            <select
              className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none transition-colors text-sm"
              value={formData.dispatch_station}
              onChange={(e) =>
                onChange({
                  ...formData,
                  dispatch_station: e.target.value as 'barista' | 'kitchen' | 'display' | 'none',
                })
              }
            >
              {DISPATCH_STATIONS.map((station) => (
                <option key={station.value} value={station.value}>
                  {station.label}
                </option>
              ))}
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.show_in_pos}
                  onChange={(e) => onChange({ ...formData, show_in_pos: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-[var(--color-gold)] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <div>
                <span className="text-sm text-white group-hover:text-white/90">Show in POS</span>
                <p className="text-xs text-[var(--theme-text-muted)]">Category appears in the POS product grid</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_raw_material}
                  onChange={(e) => onChange({ ...formData, is_raw_material: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-[var(--color-gold)] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <div>
                <span className="text-sm text-white group-hover:text-white/90">Raw Material Category</span>
                <p className="text-xs text-[var(--theme-text-muted)]">Mark as raw material for inventory management</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-[var(--color-gold)] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm text-white group-hover:text-white/90">Active</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button
            className="px-4 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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

export default CategoryFormModal;
