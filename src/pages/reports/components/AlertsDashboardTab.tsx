import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  CheckCircle,
  Loader2,
  Filter,
  X,
} from 'lucide-react';
import {
  getSystemAlerts,
  getAlertCounts,
  resolveAlert,
  markAlertAsRead,
  ISystemAlert,
} from '@/services/reports/anomalyAlerts';

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

export function AlertsDashboardTab() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('unresolved');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ISystemAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  // Fetch alert counts
  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ['alertCounts'],
    queryFn: getAlertCounts,
    staleTime: 30 * 1000,
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading, error } = useQuery({
    queryKey: ['systemAlerts', typeFilter, severityFilter, statusFilter],
    queryFn: () =>
      getSystemAlerts({
        alertType: typeFilter !== 'all' ? (typeFilter as any) : undefined,
        severity: severityFilter !== 'all' ? (severityFilter as any) : undefined,
        unresolvedOnly: statusFilter === 'unresolved',
      }),
    staleTime: 30 * 1000,
  });

  // Filter resolved/unresolved locally if showing all
  const filteredAlerts = useMemo(() => {
    if (statusFilter === 'resolved') {
      return alerts.filter((a) => a.is_resolved);
    }
    return alerts;
  }, [alerts, statusFilter]);

  // Sort: critical first, then by date
  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredAlerts]);

  // Resolve mutation
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

  // Mark as read mutation
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 text-xs font-bold uppercase bg-red-100 text-red-700 rounded">Critical</span>;
      case 'warning':
        return <span className="px-2 py-0.5 text-xs font-bold uppercase bg-orange-100 text-orange-700 rounded">Warning</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-bold uppercase bg-blue-100 text-blue-700 rounded">Info</span>;
    }
  };

  const formatAlertType = (type: string) => {
    return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading alerts. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {countsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : counts?.critical || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Warning</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {countsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : counts?.warning || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Unread</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {countsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : counts?.unread || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600">Total Unresolved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {countsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : counts?.total || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {alertsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : sortedAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No alerts to display.</p>
            </div>
          ) : (
            sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !alert.is_read ? 'bg-blue-50/30' : ''
                } ${alert.is_resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {formatAlertType(alert.alert_type)}
                      </span>
                      {alert.is_resolved && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    {alert.description && (
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    )}
                    {alert.resolution_notes && (
                      <p className="text-sm text-green-700 mt-2 italic">
                        Resolution: {alert.resolution_notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!alert.is_resolved && (
                    <button
                      onClick={() => handleOpenResolve(alert)}
                      className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolve Dialog */}
      {resolveDialogOpen && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Resolve Alert</h3>
              <button
                onClick={() => setResolveDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  <span className="text-xs text-gray-500">
                    {formatAlertType(selectedAlert.alert_type)}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">{selectedAlert.title}</h4>
                {selectedAlert.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedAlert.description}</p>
                )}
              </div>

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Resolution Notes
              </label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Describe how this alert was resolved..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setResolveDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {resolveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
