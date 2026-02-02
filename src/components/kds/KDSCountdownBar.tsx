/**
 * KDSCountdownBar Component
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Displays a countdown bar with progress indicator and cancel button
 * when an order is about to be auto-removed from the KDS display.
 */

import { X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './KDSCountdownBar.css';

interface IKDSCountdownBarProps {
  /** Seconds remaining until auto-remove */
  timeRemaining: number;
  /** Total countdown time in seconds */
  totalTime: number;
  /** Callback to cancel the auto-remove */
  onCancel: () => void;
}

export function KDSCountdownBar({
  timeRemaining,
  totalTime,
  onCancel,
}: IKDSCountdownBarProps) {
  const { t } = useTranslation();
  const progressPercent = (timeRemaining / totalTime) * 100;

  return (
    <div className="kds-countdown-bar">
      <div className="kds-countdown-bar__content">
        <Clock size={16} className="kds-countdown-bar__icon" />
        <span className="kds-countdown-bar__text">
          {t('kds.autoRemove.countdown', { seconds: timeRemaining })}
        </span>
        <button
          className="kds-countdown-bar__cancel"
          onClick={onCancel}
          aria-label={t('kds.autoRemove.cancel')}
        >
          <X size={16} />
          {t('kds.autoRemove.cancel')}
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
}

export default KDSCountdownBar;
