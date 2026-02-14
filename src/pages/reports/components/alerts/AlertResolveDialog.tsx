import { X, Loader2 } from 'lucide-react';
import type { ISystemAlert } from '@/services/reports/anomalyAlerts';

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'critical':
      return <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Critical</span>;
    case 'warning':
      return <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Warning</span>;
    default:
      return <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Info</span>;
  }
}

function formatAlertType(type: string) {
  return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

interface AlertResolveDialogProps {
  alert: ISystemAlert;
  resolveNotes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onResolve: () => void;
  isPending: boolean;
}

export function AlertResolveDialog({
  alert,
  resolveNotes,
  onNotesChange,
  onClose,
  onResolve,
  isPending,
}: AlertResolveDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/10 shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Resolve Alert</h3>
          <button
            onClick={onClose}
            className="text-[var(--theme-text-muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {getSeverityBadge(alert.severity)}
              <span className="text-xs text-[var(--theme-text-muted)]">
                {formatAlertType(alert.alert_type)}
              </span>
            </div>
            <h4 className="font-medium text-white">{alert.title}</h4>
            {alert.description && (
              <p className="text-sm text-[var(--theme-text-muted)] mt-1">{alert.description}</p>
            )}
          </div>

          <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Resolution Notes
          </label>
          <textarea
            value={resolveNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Describe how this alert was resolved..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none min-h-[100px]"
          />
        </div>
        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-transparent border border-white/10 text-white hover:border-white/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onResolve}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
