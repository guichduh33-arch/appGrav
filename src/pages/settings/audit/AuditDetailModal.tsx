import { X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { IAuditLogWithUser } from '@/hooks/useAuditLogs';

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-emerald-500/20 text-emerald-400',
  logout: 'bg-white/10 text-[var(--theme-text-secondary)]',
  create: 'bg-blue-500/20 text-blue-400',
  update: 'bg-amber-500/20 text-amber-400',
  delete: 'bg-red-500/20 text-red-400',
  view: 'bg-purple-500/20 text-purple-400',
  export: 'bg-cyan-500/20 text-cyan-400',
  default: 'bg-white/10 text-[var(--theme-text-secondary)]',
};

interface AuditDetailModalProps {
  log: IAuditLogWithUser;
  onClose: () => void;
}

export function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
  const getActionColor = (action: string) => ACTION_COLORS[action] || ACTION_COLORS.default;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Log Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/[0.04] rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[var(--theme-text-secondary)]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Date</label>
                <p className="font-medium text-white mt-1">
                  {format(new Date(log.created_at), 'PPpp', { locale: enUS })}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">User</label>
                <p className="font-medium text-white mt-1">
                  {log.user_profiles?.display_name || log.user_profiles?.name || '-'}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Action</label>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Module</label>
                <p className="font-medium text-white mt-1">{log.table_name || '-'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Record ID</label>
                <p className="font-mono text-sm text-[var(--theme-text-secondary)] mt-1">{log.record_id || '-'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">IP Address</label>
                <p className="font-mono text-sm text-[var(--theme-text-secondary)] mt-1">{log.ip_address || '-'}</p>
              </div>
            </div>

            {log.user_agent && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">User Agent</label>
                <p className="text-sm text-[var(--theme-text-secondary)] break-all mt-1">{log.user_agent}</p>
              </div>
            )}

            {log.old_values && Object.keys(log.old_values).length > 0 && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2 block">
                  Old Values
                </label>
                <pre className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300 overflow-x-auto">
                  {JSON.stringify(log.old_values, null, 2)}
                </pre>
              </div>
            )}

            {log.new_values && Object.keys(log.new_values).length > 0 && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2 block">
                  New Values
                </label>
                <pre className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-300 overflow-x-auto">
                  {JSON.stringify(log.new_values, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
