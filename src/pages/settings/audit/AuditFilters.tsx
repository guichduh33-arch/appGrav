import { Search, Calendar, User, RefreshCw } from 'lucide-react';

interface AuditUser {
  id: string;
  name: string;
}

interface AuditFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  dateRange: 'today' | '7days' | '30days' | 'custom';
  onDateRangeChange: (v: 'today' | '7days' | '30days' | 'custom') => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
  filterAction: string;
  onFilterActionChange: (v: string) => void;
  filterUser: string;
  onFilterUserChange: (v: string) => void;
  users: AuditUser[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AuditFilters({
  searchQuery, onSearchChange, dateRange, onDateRangeChange,
  customStart, customEnd, onCustomStartChange, onCustomEndChange,
  filterAction, onFilterActionChange, filterUser, onFilterUserChange,
  users, isLoading, onRefresh,
}: AuditFiltersProps) {
  const inputClass = 'bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 px-3 py-2 text-sm';

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className={`${inputClass} w-full pl-10 pr-4`}
            aria-label="Search"
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--theme-text-muted)]" />
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as 'today' | '7days' | '30days' | 'custom')}
            className={inputClass}
            title="Date Range"
            aria-label="Date Range"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className={inputClass}
              title="Start Date"
              aria-label="Start Date"
            />
            <span className="text-[var(--theme-text-muted)]">&rarr;</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className={inputClass}
              title="End Date"
              aria-label="End Date"
            />
          </>
        )}

        {/* Action Filter */}
        <select
          value={filterAction}
          onChange={(e) => onFilterActionChange(e.target.value)}
          className={inputClass}
          title="Filter by action"
          aria-label="Filter by action"
        >
          <option value="">All actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="view">View</option>
        </select>

        {/* User Filter */}
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--theme-text-muted)]" />
          <select
            value={filterUser}
            onChange={(e) => onFilterUserChange(e.target.value)}
            className={inputClass}
            title="Filter by user"
            aria-label="Filter by user"
          >
            <option value="">All users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 hover:bg-white/[0.04] rounded-xl transition-colors"
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-[var(--theme-text-secondary)] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
