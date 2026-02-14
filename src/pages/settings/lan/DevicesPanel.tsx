import {
  Wifi, WifiOff, Monitor, Smartphone, RefreshCw, QrCode, Copy, Check, ChefHat,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { ILanDevice } from '@/hooks/useLanDevices';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const DEVICE_TYPE_LABELS: Record<string, string> = {
  pos: 'POS Terminal',
  kds: 'Kitchen Display',
  display: 'Customer Display',
  mobile: 'Mobile Server',
};

function DeviceIcon({ type, size = 20 }: { type: string; size?: number }) {
  switch (type) {
    case 'pos': return <Monitor size={size} />;
    case 'kds': return <ChefHat size={size} />;
    case 'display': return <Monitor size={size} />;
    case 'mobile': return <Smartphone size={size} />;
    default: return <Wifi size={size} />;
  }
}

interface DevicesPanelProps {
  devices: ILanDevice[];
  isLoading: boolean;
  deviceId: string | null;
  hubAddress: string | null;
  onForceRefresh: (deviceId: string) => void;
}

export function DevicesPanel({ devices, isLoading, deviceId, hubAddress, onForceRefresh }: DevicesPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    const address = hubAddress || `${window.location.hostname}:3001`;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4 max-[900px]:grid-cols-1">
      {/* Devices List */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-semibold text-white m-0 flex items-center gap-2">Connected Devices</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[var(--theme-text-muted)] text-sm">
            <RefreshCw size={20} className="animate-spin" />
            <span>Loading devices...</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-[var(--theme-text-muted)]">
            <WifiOff size={40} />
            <h4 className="text-base font-semibold text-white m-0">No devices connected</h4>
            <p className="text-sm m-0 max-w-[280px]">Start the hub and connect devices via QR code or manual IP entry.</p>
          </div>
        ) : (
          <div className="p-2 flex flex-col gap-1">
            {devices.map((device) => (
              <DeviceRow
                key={device.deviceId}
                device={device}
                isCurrentDevice={device.deviceId === deviceId}
                onForceRefresh={() => onForceRefresh(device.deviceId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* QR Code & Connection Info */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-semibold text-white m-0 flex items-center gap-2">
            <QrCode size={18} />
            Device Setup
          </h3>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 p-6 bg-white/[0.02] rounded-xl border-2 border-dashed border-white/10 text-[var(--theme-text-muted)]">
            <QrCode size={120} strokeWidth={1} />
            <p className="text-xs text-center text-[var(--theme-text-muted)] m-0">
              Scan this QR code from a mobile device to connect
            </p>
          </div>

          <InfoRow label="Hub Address" value={hubAddress || `${window.location.hostname}:3001`}>
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] cursor-pointer transition-all duration-150 shrink-0 hover:bg-white/[0.04] hover:text-white"
              onClick={handleCopyAddress}
              title="Copy address"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </InfoRow>

          <InfoRow label="Device ID" value={deviceId || 'Not assigned'} />
          <InfoRow label="Protocol" value="BroadcastChannel + Supabase Realtime" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</label>
      <div className="flex items-center gap-1.5">
        <code className="text-xs bg-black/40 px-2 py-1 rounded-lg text-white flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{value}</code>
        {children}
      </div>
    </div>
  );
}

function DeviceRow({
  device, isCurrentDevice, onForceRefresh,
}: {
  device: ILanDevice;
  isCurrentDevice: boolean;
  onForceRefresh: () => void;
}) {
  const lastSeen = device.lastHeartbeat
    ? formatDistanceToNow(new Date(device.lastHeartbeat), { addSuffix: true, locale: enUS })
    : 'Unknown';

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-150 relative hover:bg-white/[0.02]',
      isCurrentDevice && 'bg-[var(--color-gold)]/5'
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full shrink-0',
        device.status === 'online' && 'bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.5)]',
        device.status === 'idle' && 'bg-amber-400',
        device.status !== 'online' && device.status !== 'idle' && 'bg-[var(--theme-text-muted)]'
      )} />
      <div className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
        device.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-[var(--theme-text-muted)]'
      )}>
        <DeviceIcon type={device.deviceType} size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
          {device.deviceName}
          {isCurrentDevice && <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">This device</span>}
          {device.isHub && <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-emerald-500/20 text-emerald-400">Hub</span>}
        </div>
        <div className="text-xs text-[var(--theme-text-muted)] flex items-center gap-1 flex-wrap">
          <span>{DEVICE_TYPE_LABELS[device.deviceType] || device.deviceType}</span>
          {device.ipAddress && (
            <>
              <span className="text-white/20">|</span>
              <span>{device.ipAddress}</span>
            </>
          )}
          <span className="text-white/20">|</span>
          <span>Last seen {lastSeen}</span>
        </div>
      </div>
      {!isCurrentDevice && device.status === 'online' && (
        <button
          className="bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl px-2 py-1 text-xs"
          onClick={onForceRefresh}
          title="Force device to re-fetch data"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
}
