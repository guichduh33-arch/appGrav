import { useState } from 'react';
import { Monitor, Wifi, MapPin, Server, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { useTerminal } from '../../hooks/useTerminal';
import TerminalRegistrationModal from './TerminalRegistrationModal';

export default function TerminalSettingsSection() {
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

  // Unregistered state
  if (!isRegistered) {
    return (
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Monitor size={20} className="text-[var(--color-gold)]" />
            POS Terminal
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center gap-4 py-8 text-center border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
            <Monitor size={48} className="text-[var(--theme-text-muted)]" />
            <h4 className="text-base font-semibold text-white">Terminal not registered</h4>
            <p className="text-sm text-[var(--theme-text-muted)] max-w-[280px]">
              Register this device to enable LAN communication and offline sync
            </p>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-colors"
              onClick={() => setShowRegistrationModal(true)}
            >
              <Monitor size={18} />
              Register Terminal
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

  // Registered state
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Monitor size={20} className="text-[var(--color-gold)]" />
          POS Terminal
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              serverSynced
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {serverSynced ? 'Synced' : 'Pending Sync'}
          </span>
          {!serverSynced && (
            <button
              className="p-1.5 hover:bg-white/[0.04] rounded-xl transition-colors"
              onClick={syncPendingChanges}
              disabled={isLoading}
              title="Sync Now"
            >
              <RefreshCw size={14} className={`text-[var(--theme-text-secondary)] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Device ID */}
        <SettingsRow icon={<Wifi size={16} />} label="Device ID">
          <span className="font-mono text-sm text-[var(--theme-text-secondary)]">{deviceId}</span>
        </SettingsRow>

        {/* Terminal Name */}
        <SettingsRow icon={<Monitor size={16} />} label="Terminal Name">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="bg-black/40 border border-white/10 rounded-xl text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 px-3 py-1.5 text-sm w-48"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <button
                className="p-1.5 bg-[var(--color-gold)] text-black rounded-lg hover:opacity-90 transition-colors"
                onClick={handleSaveName}
              >
                <Check size={14} />
              </button>
              <button
                className="p-1.5 border border-white/10 text-white rounded-lg hover:border-white/20 transition-colors"
                onClick={handleCancelEdit}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">{terminalName}</span>
              <button
                className="p-1 hover:bg-white/[0.04] rounded-lg transition-colors"
                onClick={() => { setEditName(terminalName || ''); setIsEditing(true); }}
              >
                <Edit2 size={14} className="text-[var(--theme-text-muted)]" />
              </button>
            </div>
          )}
        </SettingsRow>

        {/* Location */}
        {location && (
          <SettingsRow icon={<MapPin size={16} />} label="Location">
            <span className="text-sm text-white">{location}</span>
          </SettingsRow>
        )}

        {/* Hub Status */}
        <SettingsRow icon={<Server size={16} />} label="Hub Status">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isHub}
              onChange={(e) => updateIsHub(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 text-[var(--color-gold)] focus:ring-[var(--color-gold)]/20"
            />
            <span className="text-sm text-white">
              {isHub ? 'This is the main hub' : 'Not a hub'}
            </span>
          </label>
        </SettingsRow>

        {/* Status */}
        <SettingsRow icon={null} label="Status">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {status}
          </span>
        </SettingsRow>
      </div>
    </div>
  );
}

function SettingsRow({
  icon, label, children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2 text-[var(--theme-text-muted)]">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
