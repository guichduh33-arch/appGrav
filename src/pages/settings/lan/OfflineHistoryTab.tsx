import { RefreshCw, CheckCircle, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { IOfflinePeriod } from '@/services/sync/offlinePeriod';
import { cn } from '@/lib/utils';

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
  const hours = Math.floor(ms / 3600000);
  const mins = Math.round((ms % 3600000) / 60000);
  return `${hours}h ${mins}min`;
}

interface OfflineHistoryTabProps {
  offlinePeriods: IOfflinePeriod[];
  offlineStats: {
    totalPeriods: number;
    totalDurationMs: number;
    averageDurationMs: number;
    totalTransactions: number;
    totalSynced: number;
    totalFailed: number;
  } | null;
  isLoading: boolean;
}

export function OfflineHistoryTab({ offlinePeriods, offlineStats, isLoading }: OfflineHistoryTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Stats Summary */}
      {offlineStats && offlineStats.totalPeriods > 0 && (
        <div className="grid grid-cols-4 gap-2 max-[700px]:grid-cols-2">
          {[
            { label: 'Total Incidents', value: String(offlineStats.totalPeriods) },
            { label: 'Total Downtime', value: formatDuration(offlineStats.totalDurationMs) },
            { label: 'Avg Duration', value: formatDuration(offlineStats.averageDurationMs) },
            { label: 'Offline Transactions', value: String(offlineStats.totalTransactions) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xl font-bold text-white">{value}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Offline Periods List */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-semibold text-white m-0 flex items-center gap-2">Offline Period Log</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[var(--theme-text-muted)] text-sm">
            <RefreshCw size={20} className="animate-spin" />
            <span>Loading history...</span>
          </div>
        ) : offlinePeriods.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-[var(--theme-text-muted)]">
            <CheckCircle size={40} className="text-emerald-400" />
            <h4 className="text-base font-semibold text-white m-0">No offline periods recorded</h4>
            <p className="text-sm m-0 max-w-[280px]">The system has been continuously online.</p>
          </div>
        ) : (
          <div className="p-2 flex flex-col">
            {offlinePeriods.map((period) => (
              <OfflinePeriodRow key={period.id} period={period} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfflinePeriodRow({ period }: { period: IOfflinePeriod }) {
  const startTime = new Date(period.start_time);
  const endTime = period.end_time ? new Date(period.end_time) : null;
  const isActive = !period.end_time;

  return (
    <div className={cn(
      'flex items-start gap-2 px-4 py-2 rounded-xl transition-colors duration-150 hover:bg-white/[0.02]',
      isActive && 'bg-amber-500/10'
    )}>
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5',
        isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-[var(--theme-text-muted)]'
      )}>
        {isActive ? (
          <Activity size={16} className="animate-pulse" />
        ) : (
          <Clock size={16} />
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
          {format(startTime, 'MMM d, HH:mm', { locale: enUS })}
          {endTime && (
            <>
              <span className="text-[var(--theme-text-muted)] opacity-50">&rarr;</span>
              {format(endTime, 'HH:mm', { locale: enUS })}
            </>
          )}
          {isActive && <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-amber-500/20 text-amber-400 animate-pulse">Ongoing</span>}
        </div>
        <div className="text-xs text-[var(--theme-text-muted)] flex items-center gap-1 flex-wrap mt-0.5">
          {period.duration_ms != null && (
            <span>Duration: {formatDuration(period.duration_ms)}</span>
          )}
          {period.transactions_created > 0 && (
            <>
              <span className="text-white/20">|</span>
              <span>{period.transactions_created} transactions</span>
            </>
          )}
          {period.transactions_synced > 0 && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-emerald-400">{period.transactions_synced} synced</span>
            </>
          )}
          {period.transactions_failed > 0 && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-red-400">{period.transactions_failed} failed</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
