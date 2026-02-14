import { RefreshCw, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { ISyncQueueItem } from '@/services/sync/syncQueue';

const TYPE_COLORS: Record<string, string> = {
  order: 'bg-blue-500/20 text-blue-400',
  payment: 'bg-emerald-500/20 text-emerald-400',
  stock_movement: 'bg-amber-500/20 text-amber-400',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  syncing: 'bg-blue-500/20 text-blue-400',
  synced: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
};

interface SyncQueueTableProps {
  items: ISyncQueueItem[];
  isLoading: boolean;
  selectedTab: 'pending' | 'failed' | 'all';
  counts: { pending: number; syncing: number; failed: number; total: number; synced: number };
  onTabChange: (tab: 'pending' | 'failed' | 'all') => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SyncQueueTable({
  items, isLoading, selectedTab, counts,
  onTabChange, onRetry, onRemove,
}: SyncQueueTableProps) {
  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-white/5">
        {([
          { key: 'pending' as const, label: `Pending (${counts.pending + counts.syncing})`, active: 'border-[var(--color-gold)] text-[var(--color-gold)]' },
          { key: 'failed' as const, label: `Failed (${counts.failed})`, active: 'border-red-400 text-red-400' },
          { key: 'all' as const, label: `All (${counts.total})`, active: 'border-white text-white' },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === tab.key
                ? tab.active
                : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                {['Type', 'Created At', 'Status', 'Attempts', 'Error', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] ${h === 'Actions' ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                    {selectedTab === 'failed' ? 'No failed items' : 'No pending items'}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[item.type] || 'bg-white/10 text-[var(--theme-text-secondary)]'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--theme-text-secondary)]">
                      {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: enUS })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[item.status] || 'bg-white/10 text-[var(--theme-text-secondary)]'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--theme-text-secondary)]">
                      {item.attempts}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-400 max-w-[200px] truncate" title={item.lastError || ''}>
                      {item.lastError || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'failed' && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onRetry(item.id)}
                            className="p-1 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Retry"
                          >
                            <RotateCcw className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue Info */}
      <div className="mt-4 text-sm text-[var(--theme-text-muted)] flex items-center justify-between">
        <p>Queue: {counts.total} / 500 items</p>
        <p>Synced: {counts.synced}</p>
      </div>
    </>
  );
}
