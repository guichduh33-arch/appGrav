import { ArrowLeft, Volume2, VolumeX, RefreshCw, AlertTriangle, ClipboardList } from 'lucide-react';
import { LanConnectionIndicator } from '../lan/LanConnectionIndicator';
import { BreakeryLogo } from '@/components/ui/BreakeryLogo';
import type { TLanConnectionStatus } from '@/stores/lanStore';
import { cn } from '@/lib/utils';

interface IKDSHeaderProps {
  stationConfig: { name: string; icon: React.ReactNode; color: string };
  urgentCount: number;
  newCount: number;
  preparingCount: number;
  readyCount: number;
  connectionStatus: TLanConnectionStatus;
  reconnectAttempts: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onRefresh: () => void;
  onBack: () => void;
  currentTime: Date;
  showAllDayCount: boolean;
  onToggleAllDayCount: () => void;
}

export function KDSHeader({
  stationConfig,
  urgentCount,
  newCount,
  preparingCount,
  readyCount,
  connectionStatus,
  reconnectAttempts,
  soundEnabled,
  onSoundToggle,
  onRefresh,
  onBack,
  currentTime,
  showAllDayCount,
  onToggleAllDayCount,
}: IKDSHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[64px] px-5 border-b border-[var(--kds-accent)]/10 bg-[var(--kds-bg)]/80 backdrop-blur-md max-md:flex-wrap max-md:h-auto max-md:px-4 max-md:py-3 max-md:gap-3">
      {/* Left: Back + Brand */}
      <div className="flex items-center gap-4 max-md:order-1">
        <button
          className="bg-[var(--kds-surface-elevated)] border-none text-[var(--stone-text)] w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[var(--kds-surface-hover)] hover:scale-105"
          onClick={onBack}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <BreakeryLogo size="sm" variant="light" showText={false} />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--kds-accent)]">The Breakery</span>
            <span className="text-sm font-semibold tracking-widest uppercase text-[var(--stone-text)]">{stationConfig.name}</span>
          </div>
        </div>
      </div>

      {/* Center: Status badges */}
      <div className="flex items-center gap-3 max-md:order-2 max-md:w-full max-md:justify-center">
        {urgentCount > 0 && (
          <span className="flex items-center gap-1.5 bg-red-900/80 text-white py-1 px-3 rounded-full text-xs font-bold animate-pulse-urgent">
            <AlertTriangle size={13} />
            {urgentCount} Urgent
          </span>
        )}
        <span className="py-1 px-3 rounded-full text-xs font-semibold bg-[var(--kds-accent)]/15 text-[var(--kds-accent)]">{newCount} New</span>
        <span className="py-1 px-3 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400">{preparingCount} Prep</span>
        <span className="py-1 px-3 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400">{readyCount} Ready</span>
      </div>

      {/* Right: Controls + Live + Clock */}
      <div className="flex items-center gap-3 max-md:order-3 max-md:w-full max-md:justify-between">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 mr-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] tracking-widest uppercase text-[var(--muted-smoke)]">Live</span>
        </div>
        <LanConnectionIndicator
          status={connectionStatus}
          reconnectAttempts={reconnectAttempts}
          className="p-1.5 bg-[var(--kds-surface-elevated)] rounded-lg"
        />
        <button
          className={cn(
            'bg-[var(--kds-surface-elevated)] border-none text-[var(--stone-text)] w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[var(--kds-surface-hover)]',
            showAllDayCount && 'bg-[var(--kds-accent)] text-white shadow-[0_0_10px_rgba(236,91,19,0.3)]'
          )}
          onClick={onToggleAllDayCount}
          aria-label="Toggle all-day count"
          title="All-Day Count"
        >
          <ClipboardList size={18} />
        </button>
        <button
          className={cn(
            'bg-[var(--kds-surface-elevated)] border-none text-[var(--stone-text)] w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[var(--kds-surface-hover)]',
            !soundEnabled && 'text-red-500'
          )}
          onClick={onSoundToggle}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          className="bg-[var(--kds-surface-elevated)] border-none text-[var(--stone-text)] w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[var(--kds-surface-hover)]"
          onClick={onRefresh}
          aria-label="Refresh orders"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
        <div className="text-lg font-bold tabular-nums text-[var(--stone-text)] py-1.5 px-3 bg-[var(--kds-surface-elevated)] rounded-lg">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </header>
  );
}
