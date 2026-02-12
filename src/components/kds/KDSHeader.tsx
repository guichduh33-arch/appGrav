import { ArrowLeft, Volume2, VolumeX, RefreshCw, AlertTriangle, ClipboardList } from 'lucide-react';
import { LanConnectionIndicator } from '../lan/LanConnectionIndicator';
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
    <header className="flex items-center justify-between h-[70px] px-5 bg-[#2a2a2a] border-b-2 border-[var(--station-color,#333)] max-md:flex-wrap max-md:h-auto max-md:px-4 max-md:py-3 max-md:gap-3">
      <div className="flex items-center gap-4 max-md:order-1">
        <button
          className="bg-[#333] border-none text-white w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#444] hover:scale-105"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5 text-xl font-bold text-pink-300">
          <span>🥐</span>
          <span>The Breakery KDS</span>
        </div>
      </div>

      <div
        className="flex items-center gap-2.5 text-[1.1rem] font-bold py-2.5 px-6 rounded-[30px] text-white max-md:order-2"
        style={{ backgroundColor: stationConfig.color }}
      >
        {stationConfig.icon}
        <span>{stationConfig.name}</span>
      </div>

      <div className="flex items-center gap-4 max-md:order-3 max-md:w-full max-md:justify-between">
        <div className="flex gap-3 max-md:flex-1">
          {urgentCount > 0 && (
            <span className="flex items-center gap-1.5 bg-[#EF4444] text-white py-1.5 px-3.5 rounded-[20px] font-bold animate-pulse-urgent">
              <AlertTriangle size={14} />
              {urgentCount} Urgent
            </span>
          )}
          <span className="py-1.5 px-3.5 rounded-[20px] text-[0.85rem] font-semibold bg-blue-500/20 text-blue-400">{newCount} New</span>
          <span className="py-1.5 px-3.5 rounded-[20px] text-[0.85rem] font-semibold bg-amber-500/20 text-amber-300">{preparingCount} Prep</span>
          <span className="py-1.5 px-3.5 rounded-[20px] text-[0.85rem] font-semibold bg-emerald-500/20 text-emerald-300">{readyCount} Ready</span>
        </div>
        <LanConnectionIndicator
          status={connectionStatus}
          reconnectAttempts={reconnectAttempts}
          className="mr-2 p-2 bg-[#333] rounded-[10px]"
        />
        <button
          className={cn(
            'bg-[#333] border-none text-white w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#444]',
            showAllDayCount && 'bg-[#3B82F6] text-white'
          )}
          onClick={onToggleAllDayCount}
          title="All-Day Count"
        >
          <ClipboardList size={20} />
        </button>
        <button
          className={cn(
            'bg-[#333] border-none text-white w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#444]',
            !soundEnabled && 'text-[#EF4444]'
          )}
          onClick={onSoundToggle}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button
          className="bg-[#333] border-none text-white w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#444]"
          onClick={onRefresh}
        >
          <RefreshCw size={20} />
        </button>
        <div className="font-mono text-xl font-semibold py-2 px-4 bg-[#333] rounded-[10px]">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </header>
  );
}
