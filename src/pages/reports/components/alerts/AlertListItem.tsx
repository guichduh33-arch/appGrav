import { AlertTriangle, AlertCircle, Bell, CheckCircle } from 'lucide-react';
import type { ISystemAlert } from '@/services/reports/anomalyAlerts';

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-amber-400" />;
    default:
      return <Bell className="w-5 h-5 text-blue-400" />;
  }
}

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

interface AlertListItemProps {
  alert: ISystemAlert;
  onResolve: (alert: ISystemAlert) => void;
}

export function AlertListItem({ alert, onResolve }: AlertListItemProps) {
  return (
    <div
      className={`p-4 hover:bg-white/[0.02] transition-colors border-b border-white/5 ${
        !alert.is_read ? 'bg-blue-500/[0.03]' : ''
      } ${alert.is_resolved ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getSeverityIcon(alert.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {getSeverityBadge(alert.severity)}
            <span className="text-xs text-[var(--theme-text-muted)] bg-white/5 px-2 py-0.5 rounded">
              {formatAlertType(alert.alert_type)}
            </span>
            {alert.is_resolved && (
              <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Resolved
              </span>
            )}
          </div>
          <h4 className="font-medium text-white">{alert.title}</h4>
          {alert.description && (
            <p className="text-sm text-[var(--theme-text-muted)] mt-1">{alert.description}</p>
          )}
          {alert.resolution_notes && (
            <p className="text-sm text-green-400/80 mt-2 italic">
              Resolution: {alert.resolution_notes}
            </p>
          )}
          <p className="text-xs text-[var(--theme-text-muted)] mt-2">
            {new Date(alert.created_at).toLocaleString()}
          </p>
        </div>
        {!alert.is_resolved && (
          <button
            onClick={() => onResolve(alert)}
            className="px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 rounded-lg transition-colors"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
