import { useState } from 'react';
import { History, User, Clock, ArrowRight, Search } from 'lucide-react';
import { useSettingsHistory } from '../../hooks/settings';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

const SettingsHistoryPage = () => {
  const { data: history, isLoading } = useSettingsHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const locale = enUS;
  const nameKey = 'name_en' as const;

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  type HistoryItem = {
    id: string;
    old_value: unknown;
    new_value: unknown;
    change_reason?: string | null;
    changed_at: string | null;
    setting?: { key?: string; name_fr?: string; name_en?: string; name_id?: string } | null;
    user?: { display_name?: string; first_name?: string; last_name?: string } | null;
  };

  const filteredHistory = history?.filter((item: HistoryItem) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const setting = item.setting;
    return (
      setting?.key?.toLowerCase().includes(search) ||
      setting?.name_fr?.toLowerCase().includes(search) ||
      setting?.name_en?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <h2 className="text-lg font-bold text-white">Change History</h2>
        <p className="text-sm text-[var(--theme-text-muted)] mt-0.5">
          Log of changes made to settings
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
              placeholder="Search for a setting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)] gap-3">
            <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : !filteredHistory || filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)] gap-3">
            <History size={48} className="opacity-30" />
            <h3 className="text-white font-semibold">No changes</h3>
            <p className="text-sm">Change history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredHistory.map((item: HistoryItem) => {
              const setting = item.setting;
              const user = item.user;
              const userName = user?.display_name ||
                (user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : 'System');

              return (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--theme-text-muted)] shrink-0 mt-0.5">
                    <History size={14} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {setting?.[nameKey] || setting?.name_en || setting?.key || 'Unknown setting'}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--theme-text-muted)] truncate">
                        {setting?.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded">
                        {formatValue(item.old_value)}
                      </span>
                      <ArrowRight size={12} className="text-[var(--theme-text-muted)]" />
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                        {formatValue(item.new_value)}
                      </span>
                    </div>
                    {item.change_reason && (
                      <div className="text-xs text-[var(--theme-text-muted)] italic">
                        Reason: {item.change_reason}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-[var(--theme-text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <User size={10} />
                        {userName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} />
                        {item.changed_at ? formatDistanceToNow(new Date(item.changed_at), {
                          addSuffix: true,
                          locale,
                        }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsHistoryPage;
