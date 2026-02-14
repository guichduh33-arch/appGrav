import { RefreshCw, Cloud, History, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { IOfflinePeriod } from '@/services/sync/offlinePeriod';

function formatDurationMs(ms: number): string {
  if (ms === 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

interface OfflineHistorySectionProps {
  offlinePeriods: IOfflinePeriod[];
  periodStats: {
    totalPeriods: number;
    totalDurationMs: number;
    averageDurationMs: number;
    totalTransactions: number;
    totalSynced: number;
    totalFailed: number;
  } | null;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function OfflineHistorySection({
  offlinePeriods, periodStats, isLoading, isExpanded, onToggle,
}: OfflineHistorySectionProps) {
  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 bg-[var(--onyx-surface)] rounded-xl border border-white/5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--theme-text-muted)]" />
          <h2 className="text-lg font-semibold text-white">Offline History</h2>
          {periodStats && (
            <span className="text-sm text-[var(--theme-text-muted)]">
              ({periodStats.totalPeriods} {periodStats.totalPeriods === 1 ? 'period' : 'periods'})
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--theme-text-muted)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--theme-text-muted)]" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4">
          {/* Stats Summary */}
          {periodStats && periodStats.totalPeriods > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Total offline duration</p>
                <p className="text-lg font-semibold text-white">
                  {formatDurationMs(periodStats.totalDurationMs)}
                </p>
              </div>
              <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Average duration</p>
                <p className="text-lg font-semibold text-white">
                  {formatDurationMs(periodStats.averageDurationMs)}
                </p>
              </div>
              <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1">Transactions synced</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {periodStats.totalSynced}
                </p>
              </div>
              <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-1">Failed</p>
                <p className="text-lg font-semibold text-red-400">
                  {periodStats.totalFailed}
                </p>
              </div>
            </div>
          )}

          {/* Period History Table */}
          <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    {['Period', 'Duration', 'Trans.', 'Synced', 'Failed'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] ${i >= 2 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading...
                      </td>
                    </tr>
                  ) : offlinePeriods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                        <Cloud className="w-8 h-8 mx-auto mb-2 text-[var(--theme-text-muted)]" />
                        No offline periods recorded
                      </td>
                    </tr>
                  ) : (
                    offlinePeriods.map((period) => (
                      <tr key={period.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm text-white">
                          <div>
                            {format(new Date(period.start_time), 'dd/MM/yyyy HH:mm', { locale: enUS })}
                          </div>
                          {period.end_time && (
                            <div className="text-xs text-[var(--theme-text-muted)]">
                              &rarr; {format(new Date(period.end_time), 'HH:mm', { locale: enUS })}
                            </div>
                          )}
                          {!period.end_time && (
                            <div className="text-xs text-amber-400 font-medium">In progress...</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--theme-text-secondary)]">
                          {period.duration_ms ? formatDurationMs(period.duration_ms) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-white">
                          {period.transactions_created}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-medium ${period.transactions_synced > 0 ? 'text-emerald-400' : 'text-[var(--theme-text-muted)]'}`}>
                            {period.transactions_synced}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-medium ${period.transactions_failed > 0 ? 'text-red-400' : 'text-[var(--theme-text-muted)]'}`}>
                            {period.transactions_failed}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
