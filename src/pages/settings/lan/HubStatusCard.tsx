import { Wifi, WifiOff, Power, PowerOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
  const hours = Math.floor(ms / 3600000);
  const mins = Math.round((ms % 3600000) / 60000);
  return `${hours}h ${mins}min`;
}

interface HubStatusCardProps {
  isRunning: boolean;
  status: { uptime: number };
  error: string | null;
  deviceCount: number;
  onToggle: () => void;
}

export function HubStatusCard({ isRunning, status, error, deviceCount, onToggle }: HubStatusCardProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 px-6 py-4 rounded-xl border transition-all duration-200',
      isRunning
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : 'bg-red-500/10 border-red-500/20'
    )}>
      <div className={cn(
        'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
        isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      )}>
        {isRunning ? <Wifi size={24} /> : <WifiOff size={24} />}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold m-0 text-white">
          LAN Hub {isRunning ? 'Active' : 'Inactive'}
        </h3>
        <div className="text-sm text-[var(--theme-text-muted)] mt-0.5 flex items-center gap-2">
          {isRunning ? (
            <>
              <span>{deviceCount} device{deviceCount !== 1 ? 's' : ''} connected</span>
              <span className="text-white/20">|</span>
              <span>Uptime: {formatDuration(status.uptime)}</span>
            </>
          ) : (
            <span>Hub is not running. Start it to enable LAN communication.</span>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
      </div>
      <div className="shrink-0">
        <button
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-150',
            isRunning
              ? 'bg-transparent border border-red-500/30 text-red-400 hover:border-red-500/50'
              : 'bg-emerald-500 border border-emerald-500 text-black hover:opacity-90'
          )}
          onClick={onToggle}
        >
          {isRunning ? <PowerOff size={18} /> : <Power size={18} />}
          {isRunning ? 'Stop Hub' : 'Start Hub'}
        </button>
      </div>
    </div>
  );
}
