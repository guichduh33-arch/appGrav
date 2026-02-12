/**
 * KDSCountdownBar Component
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Displays a countdown bar with progress indicator and cancel button
 * when an order is about to be auto-removed from the KDS display.
 */

import { memo } from 'react';
import { X, Clock } from 'lucide-react';

interface IKDSCountdownBarProps {
  /** Seconds remaining until auto-remove */
  timeRemaining: number;
  /** Total countdown time in seconds */
  totalTime: number;
  /** Callback to cancel the auto-remove */
  onCancel: () => void;
}

export const KDSCountdownBar = memo(function KDSCountdownBar({
  timeRemaining,
  totalTime,
  onCancel,
}: IKDSCountdownBarProps) {
  const progressPercent = (timeRemaining / totalTime) * 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/95 rounded-b-xl py-2 px-3 z-10" role="alert" aria-live="polite">
      <div className="flex items-center gap-2 text-white font-semibold text-sm">
        <Clock size={16} className="animate-countdown-pulse motion-reduce:!animate-none" aria-hidden="true" />
        <span className="flex-1">
          Auto-remove in {timeRemaining}s
        </span>
        <button
          className="flex items-center gap-1 py-1 px-3 bg-white/20 border border-white/40 rounded-md text-white font-semibold text-[0.85rem] cursor-pointer transition-all duration-200 hover:bg-white/30 active:scale-[0.98]"
          onClick={onCancel}
          aria-label="Keep"
        >
          <X size={16} />
          Keep
        </button>
      </div>
      <div className="h-1 bg-white/30 rounded-sm mt-2 overflow-hidden">
        <div
          className="h-full bg-white rounded-sm transition-[width] duration-1000 motion-reduce:!transition-none"
          style={{ width: `${progressPercent}%`, transitionTimingFunction: 'linear' }}
        />
      </div>
    </div>
  );
});

export default KDSCountdownBar;
