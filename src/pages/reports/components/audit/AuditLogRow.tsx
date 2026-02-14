import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AuditLogEntry } from '@/types/reporting';

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

function renderDiff(oldVal: unknown, newVal: unknown) {
  if (!oldVal && !newVal) return <span className="text-[var(--theme-text-muted)]">No changes recorded</span>;

  const oldStr = oldVal ? JSON.stringify(oldVal, null, 2) : null;
  const newStr = newVal ? JSON.stringify(newVal, null, 2) : null;

  return (
    <div className="grid grid-cols-2 gap-4 text-sm font-mono">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Old Value</div>
        {oldStr ? (
          <pre className="bg-red-500/10 p-2 rounded-lg text-red-300 overflow-auto max-h-40 border border-red-500/10">{oldStr}</pre>
        ) : (
          <span className="text-[var(--theme-text-muted)]">-</span>
        )}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">New Value</div>
        {newStr ? (
          <pre className="bg-green-500/10 p-2 rounded-lg text-green-300 overflow-auto max-h-40 border border-green-500/10">{newStr}</pre>
        ) : (
          <span className="text-[var(--theme-text-muted)]">-</span>
        )}
      </div>
    </div>
  );
}

interface AuditLogRowProps {
  log: AuditLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

export function AuditLogRow({ log, isExpanded, onToggle }: AuditLogRowProps) {
  return (
    <div className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
      <div
        className="p-4 cursor-pointer flex justify-between items-start"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getSeverityBadge(log.severity)}
            <span className="font-medium text-white capitalize">
              {log.action_type}
            </span>
            <span className="text-[var(--theme-text-muted)]">on</span>
            <span className="text-white/80">{log.entity_type}</span>
            {log.entity_id && (
              <span className="text-xs text-[var(--theme-text-muted)] font-mono">
                ({log.entity_id.slice(0, 8)}...)
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">{log.reason || 'No reason provided'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-[var(--theme-text-muted)]">
              {new Date(log.created_at).toLocaleDateString()}
            </div>
            <div className="text-xs text-[var(--theme-text-muted)]">
              {new Date(log.created_at).toLocaleTimeString()}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--theme-text-muted)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--theme-text-muted)]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/5 bg-white/[0.01]">
          <div className="pt-4">
            {renderDiff(log.old_value, log.new_value)}
          </div>
        </div>
      )}
    </div>
  );
}
