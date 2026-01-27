import { useState } from 'react';
import { Monitor, Wifi, MapPin, Server, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { useTerminal } from '../../hooks/useTerminal';
import { useTranslation } from 'react-i18next';
import TerminalRegistrationModal from './TerminalRegistrationModal';

export default function TerminalSettingsSection() {
  const { t } = useTranslation();
  const {
    deviceId,
    terminalName,
    isHub,
    location,
    status,
    isRegistered,
    serverSynced,
    isLoading,
    updateTerminalName,
    updateIsHub,
    syncPendingChanges,
  } = useTerminal();

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(terminalName || '');

  const handleSaveName = async () => {
    if (editName.trim() && editName.trim() !== terminalName) {
      await updateTerminalName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(terminalName || '');
    setIsEditing(false);
  };

  // If not registered, show registration prompt
  if (!isRegistered) {
    return (
      <div className="settings-section">
        <div className="settings-section__header">
          <h3 className="settings-section__title">
            <Monitor size={20} />
            {t('settings.terminal.title', 'POS Terminal')}
          </h3>
        </div>
        <div className="settings-section__content">
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '2px dashed #d1d5db',
            }}
          >
            <Monitor size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
            <h4 style={{ marginBottom: '0.5rem' }}>
              {t('settings.terminal.notRegistered', 'Terminal Not Registered')}
            </h4>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {t('settings.terminal.notRegisteredHelp', 'Register this device to enable LAN communication and offline sync')}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowRegistrationModal(true)}
            >
              <Monitor size={18} />
              {t('settings.terminal.registerNow', 'Register Terminal')}
            </button>
          </div>
        </div>

        {showRegistrationModal && (
          <TerminalRegistrationModal
            onClose={() => setShowRegistrationModal(false)}
            onRegistered={() => setShowRegistrationModal(false)}
          />
        )}
      </div>
    );
  }

  // Registered terminal view
  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h3 className="settings-section__title">
          <Monitor size={20} />
          {t('settings.terminal.title', 'POS Terminal')}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Sync Status Badge */}
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: serverSynced ? '#dcfce7' : '#fef3c7',
              color: serverSynced ? '#166534' : '#92400e',
            }}
          >
            {serverSynced
              ? t('settings.terminal.synced', 'Synced')
              : t('settings.terminal.pendingSync', 'Pending Sync')}
          </span>
          {!serverSynced && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={syncPendingChanges}
              disabled={isLoading}
              title={t('settings.terminal.syncNow', 'Sync Now')}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      <div className="settings-section__content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Device ID */}
          <div className="settings-item">
            <div className="settings-item__label">
              <Wifi size={16} />
              {t('settings.terminal.deviceId', 'Device ID')}
            </div>
            <div className="settings-item__value" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {deviceId}
            </div>
          </div>

          {/* Terminal Name */}
          <div className="settings-item">
            <div className="settings-item__label">
              <Monitor size={16} />
              {t('settings.terminal.name', 'Terminal Name')}
            </div>
            <div className="settings-item__value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '200px' }}
                    autoFocus
                  />
                  <button className="btn btn-sm btn-primary" onClick={handleSaveName}>
                    <Check size={14} />
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span>{terminalName}</span>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setEditName(terminalName || '');
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Location */}
          {location && (
            <div className="settings-item">
              <div className="settings-item__label">
                <MapPin size={16} />
                {t('settings.terminal.location', 'Location')}
              </div>
              <div className="settings-item__value">{location}</div>
            </div>
          )}

          {/* Hub Status */}
          <div className="settings-item">
            <div className="settings-item__label">
              <Server size={16} />
              {t('settings.terminal.hubStatus', 'Hub Status')}
            </div>
            <div className="settings-item__value">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isHub}
                  onChange={(e) => updateIsHub(e.target.checked)}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <span>
                  {isHub
                    ? t('settings.terminal.isHubYes', 'This is the main hub')
                    : t('settings.terminal.isHubNo', 'Not a hub')}
                </span>
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="settings-item">
            <div className="settings-item__label">
              {t('settings.terminal.status', 'Status')}
            </div>
            <div className="settings-item__value">
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: status === 'active' ? '#dcfce7' : '#fef3c7',
                  color: status === 'active' ? '#166534' : '#92400e',
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
