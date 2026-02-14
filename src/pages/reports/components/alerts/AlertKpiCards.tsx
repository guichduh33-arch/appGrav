import { AlertTriangle, AlertCircle, Bell, CheckCircle } from 'lucide-react';

interface AlertCounts {
  critical?: number;
  warning?: number;
  unread?: number;
  total?: number;
}

export function AlertKpiCards({ counts }: { counts?: AlertCounts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Critical</span>
        </div>
        <p className="text-2xl font-bold text-red-400">
          {counts?.critical || 0}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Warning</span>
        </div>
        <p className="text-2xl font-bold text-amber-400">
          {counts?.warning || 0}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Unread</span>
        </div>
        <p className="text-2xl font-bold text-blue-400">
          {counts?.unread || 0}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/5 rounded-lg">
            <CheckCircle className="w-5 h-5 text-[var(--theme-text-muted)]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Unresolved</span>
        </div>
        <p className="text-2xl font-bold text-white">
          {counts?.total || 0}
        </p>
      </div>
    </div>
  );
}
