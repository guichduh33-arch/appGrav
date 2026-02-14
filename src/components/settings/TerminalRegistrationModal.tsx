import { useState } from 'react';
import { X, Monitor, Wifi, MapPin, Check } from 'lucide-react';
import { useTerminal } from '../../hooks/useTerminal';

interface TerminalRegistrationModalProps {
  onClose: () => void;
  onRegistered?: () => void;
}

export default function TerminalRegistrationModal({
  onClose,
  onRegistered,
}: TerminalRegistrationModalProps) {
  const { registerTerminal, isLoading, error, deviceId } = useTerminal();

  const [terminalName, setTerminalName] = useState('');
  const [location, setLocation] = useState('');
  const [isHub, setIsHub] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const previewDeviceId = deviceId || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

  const inputClass = 'bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 w-full px-3 py-2 text-sm';
  const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] flex items-center gap-2';

  const validateForm = (): boolean => {
    if (!terminalName.trim()) {
      setValidationError('Terminal name is required');
      return false;
    }
    if (terminalName.trim().length < 3) {
      setValidationError('Terminal name must be at least 3 characters');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await registerTerminal(
      terminalName.trim(),
      isHub,
      location.trim() || undefined
    );
    if (result.success) {
      onRegistered?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl max-w-lg w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Monitor size={20} className="text-[var(--color-gold)]" />
              Register POS Terminal
            </h2>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Configure this device as a POS terminal
            </p>
          </div>
          <button
            className="p-2 hover:bg-white/[0.04] rounded-xl transition-colors"
            onClick={onClose}
          >
            <X size={20} className="text-[var(--theme-text-secondary)]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Device ID */}
            <div>
              <label className={labelClass}>
                <Wifi size={14} />
                Device ID
              </label>
              <input
                type="text"
                className={`${inputClass} mt-1.5 font-mono text-xs bg-black/60`}
                value={previewDeviceId}
                readOnly
              />
              <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                Auto-generated unique identifier for this device
              </p>
            </div>

            {/* Terminal Name */}
            <div>
              <label className={labelClass}>
                <Monitor size={14} />
                Terminal Name *
              </label>
              <input
                type="text"
                className={`${inputClass} mt-1.5`}
                value={terminalName}
                onChange={(e) => setTerminalName(e.target.value)}
                placeholder="e.g., Cashier 1"
                autoFocus
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>
                <MapPin size={14} />
                Location
              </label>
              <input
                type="text"
                className={`${inputClass} mt-1.5`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Main Floor, Near Entrance"
                maxLength={200}
              />
            </div>

            {/* Is Hub Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isHub}
                onChange={(e) => setIsHub(e.target.checked)}
                className="w-5 h-5 rounded border-white/10 text-[var(--color-gold)] focus:ring-[var(--color-gold)]/20"
              />
              <div>
                <span className="text-sm font-medium text-white">This terminal is the main hub</span>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  The hub coordinates LAN communication between devices
                </p>
              </div>
            </label>

            {/* Error Display */}
            {(validationError || error) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                {validationError || error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 text-sm"
              disabled={isLoading || !terminalName.trim()}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Register Terminal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
