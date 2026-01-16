import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportingService } from '../../../services/ReportingService';
import { AuditLogEntry } from '../../../types/reporting';
import { AlertCircle } from 'lucide-react';

export const AuditTab = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ReportingService.getAuditLogs()
            .then(setLogs)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>{t('common.loading')}</div>;



    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <AlertCircle size={18} /> {t('reporting.audit.title')}
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">{t('reporting.audit.no_suspicious_activity')}</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                            log.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {log.severity}
                                        </span>
                                        <span className="font-medium text-gray-900">{log.action_type} on {log.entity_type}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{log.reason}</p>
                                    {/* Try to visualize diffs if encoded in a way we understand */}
                                    {/* The trigger sends JSONB for old/new, but let's assume reason text is enough for MVP, or custom rendering */}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
