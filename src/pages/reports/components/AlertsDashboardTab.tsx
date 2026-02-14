import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Filter } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import {
  getSystemAlerts,
  getAlertCounts,
  resolveAlert,
  markAlertAsRead,
  ISystemAlert,
  AlertType,
} from '@/services/reports/anomalyAlerts';
import { AlertKpiCards } from './alerts/AlertKpiCards';
import { AlertListItem } from './alerts/AlertListItem';
import { AlertResolveDialog } from './alerts/AlertResolveDialog';

type AlertSeverity = 'info' | 'warning' | 'critical';

const ALERT_TYPES = [
  'all',
  'high_discount',
  'excessive_discount',
  'high_void',
  'stock_anomaly',
  'price_change',
  'unusual_activity',
  'late_payment',
  'low_stock',
  'negative_stock',
] as const;

const SEVERITIES = ['all', 'critical', 'warning', 'info'] as const;
const STATUS_OPTIONS = ['unresolved', 'resolved', 'all'] as const;

const formatAlertType = (type: string) => {
  return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export function AlertsDashboardTab() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('unresolved');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ISystemAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ['alertCounts'],
    queryFn: getAlertCounts,
    staleTime: 30 * 1000,
  });

  const { data: alerts = [], isLoading: alertsLoading, error } = useQuery({
    queryKey: ['systemAlerts', typeFilter, severityFilter, statusFilter],
    queryFn: () =>
      getSystemAlerts({
        alertType: typeFilter !== 'all' ? (typeFilter as AlertType) : undefined,
        severity: severityFilter !== 'all' ? (severityFilter as AlertSeverity) : undefined,
        unresolvedOnly: statusFilter === 'unresolved',
      }),
    staleTime: 30 * 1000,
  });

  const filteredAlerts = useMemo(() => {
    if (statusFilter === 'resolved') {
      return alerts.filter((a) => a.is_resolved);
    }
    return alerts;
  }, [alerts, statusFilter]);

  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredAlerts]);

  const resolveMutation = useMutation({
    mutationFn: ({ alertId, notes }: { alertId: string; notes: string }) =>
      resolveAlert(alertId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['alertCounts'] });
      setResolveDialogOpen(false);
      setSelectedAlert(null);
      setResolveNotes('');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (alertId: string) => markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertCounts'] });
    },
  });

  const handleOpenResolve = (alert: ISystemAlert) => {
    setSelectedAlert(alert);
    setResolveDialogOpen(true);
    if (!alert.is_read) {
      markReadMutation.mutate(alert.id);
    }
  };

  const handleResolve = () => {
    if (selectedAlert) {
      resolveMutation.mutate({ alertId: selectedAlert.id, notes: resolveNotes });
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading alerts. Please try again.
      </div>
    );
  }

  if (countsLoading && alertsLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AlertKpiCards counts={counts} />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--theme-text-muted)]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          >
            {ALERT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : formatAlertType(type)}
              </option>
            ))}
          </select>
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
        >
          {SEVERITIES.map((sev) => (
            <option key={sev} value={sev}>
              {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Alerts List */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">System Alerts</h3>
        </div>

        <div>
          {sortedAlerts.length === 0 ? (
            <div className="p-8 text-center text-[var(--theme-text-muted)]">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No alerts to display.</p>
            </div>
          ) : (
            sortedAlerts.map((alert) => (
              <AlertListItem
                key={alert.id}
                alert={alert}
                onResolve={handleOpenResolve}
              />
            ))
          )}
        </div>
      </div>

      {resolveDialogOpen && selectedAlert && (
        <AlertResolveDialog
          alert={selectedAlert}
          resolveNotes={resolveNotes}
          onNotesChange={setResolveNotes}
          onClose={() => setResolveDialogOpen(false)}
          onResolve={handleResolve}
          isPending={resolveMutation.isPending}
        />
      )}
    </div>
  );
}
