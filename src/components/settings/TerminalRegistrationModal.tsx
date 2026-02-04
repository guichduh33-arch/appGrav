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

  // Generate preview device ID
  const previewDeviceId = deviceId || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

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
    <div className="modal-backdrop is-active" onClick={onClose}>
      <div className="modal modal-md is-active" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <div>
            <h2 className="modal__title">
              <Monitor size={24} />
              Register POS Terminal
            </h2>
            <p className="modal__subtitle">
              Configure this device as a POS terminal
            </p>
          </div>
          <button className="modal__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Device ID (readonly) */}
            <div className="form-group">
              <label className="form-label">
                <Wifi size={16} style={{ marginRight: '0.5rem' }} />
                Device ID
              </label>
              <input
                type="text"
                className="form-input"
                value={previewDeviceId}
                readOnly
                style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#f3f4f6' }}
              />
              <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                Auto-generated unique identifier for this device
              </small>
            </div>

            {/* Terminal Name */}
            <div className="form-group">
              <label className="form-label">
                <Monitor size={16} style={{ marginRight: '0.5rem' }} />
                Terminal Name *
              </label>
              <input
                type="text"
                className="form-input"
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
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} style={{ marginRight: '0.5rem' }} />
                Location
              </label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Main Floor, Near Entrance"
                maxLength={200}
              />
            </div>

            {/* Is Hub Checkbox */}
            <div className="form-group">
              <label
                className="form-checkbox"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={isHub}
                  onChange={(e) => setIsHub(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <div>
                  <span style={{ fontWeight: 500 }}>
                    This terminal is the main hub
                  </span>
                  <small style={{ display: 'block', color: '#6b7280', marginTop: '0.25rem' }}>
                    The hub coordinates LAN communication between devices
                  </small>
                </div>
              </label>
            </div>

            {/* Error Display */}
            {(validationError || error) && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                }}
              >
                {validationError || error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-lg"
              disabled={isLoading || !terminalName.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner" style={{ marginRight: '0.5rem' }} />
                  Registering...
                </>
              ) : (
                <>
                  <Check size={18} />
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
