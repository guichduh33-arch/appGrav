import { Save, X, AlertCircle } from 'lucide-react';

export interface IPrinterFormData {
  name: string;
  printer_type: string;
  connection_type: string;
  connection_string: string;
  paper_width: number;
  is_active: boolean;
  is_default: boolean;
}

const inputClass =
  'w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

const selectClass = `${inputClass} cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239ca3af%27%20stroke-width=%272%27%3E%3Cpath%20d=%27M6%209l6%206%206-6%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-10`;

interface PrinterModalProps {
  isEditing: boolean;
  formData: IPrinterFormData;
  onFormChange: (data: IPrinterFormData) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export function PrinterModal({
  isEditing,
  formData,
  onFormChange,
  onSave,
  onClose,
  isSaving,
}: PrinterModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-display font-bold text-white">
            {isEditing ? 'Edit Printer' : 'New Printer'}
          </h2>
          <button className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Printer name *</label>
            <input
              type="text"
              className={inputClass}
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="e.g. Cash Register Printer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Type *</label>
              <select
                className={selectClass}
                value={formData.printer_type}
                onChange={(e) => onFormChange({ ...formData, printer_type: e.target.value })}
                title="Printer type"
              >
                <option value="receipt">Receipt (POS)</option>
                <option value="kitchen">Kitchen</option>
                <option value="barista">Barista</option>
                <option value="label">Labels</option>
                <option value="report">Reports</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Paper width (mm)</label>
              <select
                className={selectClass}
                value={formData.paper_width}
                onChange={(e) => onFormChange({ ...formData, paper_width: Number(e.target.value) })}
                title="Paper width"
              >
                <option value={80}>80mm (Standard)</option>
                <option value={58}>58mm (Mobile/Compact)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">Connection *</label>
              <select
                className={selectClass}
                value={formData.connection_type}
                onChange={(e) => onFormChange({ ...formData, connection_type: e.target.value })}
                title="Connection type"
              >
                <option value="network">Network (Ethernet/WiFi)</option>
                <option value="usb">USB</option>
                <option value="bluetooth">Bluetooth</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1.5 block">
                {formData.connection_type === 'network' ? 'IP Address:Port *' : 'Connection string'}
              </label>
              <input
                type="text"
                className={inputClass}
                value={formData.connection_string}
                onChange={(e) => onFormChange({ ...formData, connection_string: e.target.value })}
                placeholder={formData.connection_type === 'network' ? '192.168.1.100:9100' : '/dev/usb/lp0'}
              />
              {formData.connection_type === 'network' && (
                <span className="text-[10px] text-[var(--theme-text-muted)] mt-1 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Expected format: IP:PORT (e.g. 192.168.1.100:9100)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--color-gold)]"
                checked={formData.is_default}
                onChange={(e) => onFormChange({ ...formData, is_default: e.target.checked })}
              />
              <span className="text-sm text-white">Use as default for this type</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--color-gold)]"
                checked={formData.is_active}
                onChange={(e) => onFormChange({ ...formData, is_active: e.target.checked })}
              />
              <span className="text-sm text-white">Active</span>
            </label>
          </div>
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
