/**
 * KDSCountdownBar Component
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Displays a countdown bar with progress indicator and cancel button
 * when an order is about to be auto-removed from the KDS display.
 */

import { memo } from 'react';
import { X, Clock } from 'lucide-react';
import './KDSCountdownBar.css';

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
    <div className="kds-countdown-bar" role="alert" aria-live="polite">
      <div className="kds-countdown-bar__content">
        <Clock size={16} className="kds-countdown-bar__icon" aria-hidden="true" />
        <span className="kds-countdown-bar__text">
          Auto-remove in {timeRemaining}s
        </span>
        <button
          className="kds-countdown-bar__cancel"
          onClick={onCancel}
          aria-label="Keep"
        >
          <X size={16} />
          Keep
        </button>
      </div>
      <div className="kds-countdown-bar__progress">
        <div
          className="kds-countdown-bar__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
});

export default KDSCountdownBar;
