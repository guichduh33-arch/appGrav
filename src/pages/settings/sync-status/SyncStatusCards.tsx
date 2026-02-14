import { Cloud, CloudOff, AlertCircle, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const STATUS_CONFIG = {
  idle: { icon: Cloud, label: 'Idle', dot: 'bg-white/30' },
  syncing: { icon: RefreshCw, label: 'Syncing', dot: 'bg-amber-400' },
  complete: { icon: CheckCircle, label: 'Complete', dot: 'bg-emerald-400' },
  error: { icon: AlertCircle, label: 'Error', dot: 'bg-red-400' },
} as const;

interface SyncStatusCardsProps {
  syncStatus: keyof typeof STATUS_CONFIG;
  isSyncing: boolean;
  counts: { pending: number; failed: number; synced: number };
  lastSyncAt: Date | null;
  isOnline: boolean;
}

export function SyncStatusCards({
  syncStatus, isSyncing, counts, lastSyncAt, isOnline,
}: SyncStatusCardsProps) {
  const config = STATUS_CONFIG[syncStatus];
  const StatusIcon = config.icon;

  return (
    <>
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Current Status */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 text-[var(--theme-text-secondary)] ${isSyncing ? 'animate-spin' : ''}`} />
            <p className="text-lg font-bold text-white capitalize">{config.label}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CloudOff className="w-4 h-4 text-amber-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Pending
            </p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{counts.pending}</p>
        </div>

        {/* Failed */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Failed
            </p>
          </div>
          <p className="text-2xl font-bold text-red-400">{counts.failed}</p>
        </div>

        {/* Last Sync */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[var(--theme-text-muted)]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Last Sync
            </p>
          </div>
          <p className="text-sm font-bold text-white">
            {lastSyncAt
              ? format(lastSyncAt, 'dd/MM HH:mm', { locale: enUS })
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Network Warning */}
      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CloudOff className="w-6 h-6 text-amber-400" />
          <div>
            <p className="font-medium text-amber-300">Offline Mode</p>
            <p className="text-sm text-amber-400/70">
              Synchronization will resume automatically when connection is restored.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
