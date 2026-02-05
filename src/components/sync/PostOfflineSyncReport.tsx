/**
 * Post-Offline Sync Report Component
 * Story 3.3 - Post-Offline Sync Report
 *
 * Modal that displays sync results after coming back online.
 * Shows: duration offline, transactions created, synced, failed.
 */

import React from 'react';
import { X, CheckCircle, AlertCircle, Clock, ShoppingCart, Upload, XCircle } from 'lucide-react';
import type { IOfflinePeriod } from '@/types/offline';

interface IPostOfflineSyncReportProps {
  period: IOfflinePeriod;
  onClose: () => void;
  onRetryFailed?: () => void;
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number | null): string {
  if (!ms) return '-';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Post-Offline Sync Report Modal
 *
 * Displays a summary of what happened during an offline period:
 * - How long the system was offline
 * - How many transactions were created
 * - How many were successfully synced
 * - How many failed (with retry option)
 */
export const PostOfflineSyncReport: React.FC<IPostOfflineSyncReportProps> = ({
  period,
  onClose,
  onRetryFailed,
}) => {
  const hasFailures = period.transactions_failed > 0;
  const allSynced = period.transactions_synced === period.transactions_created && !hasFailures;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className={`
          px-6 py-4 rounded-t-lg flex items-center justify-between
          ${allSynced ? 'bg-green-50' : hasFailures ? 'bg-red-50' : 'bg-blue-50'}
        `}>
          <div className="flex items-center gap-3">
            {allSynced ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : hasFailures ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-blue-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              Sync Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Status message */}
          <p className="text-gray-600">
            {allSynced
              ? 'All transactions have been synced successfully.'
              : hasFailures
              ? 'Some transactions could not be synced.'
              : 'Sync complete.'}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Offline Duration</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(period.duration_ms)}
              </p>
            </div>

            {/* Transactions created */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">Created</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {period.transactions_created}
              </p>
            </div>

            {/* Synced */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Synced</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {period.transactions_synced}
              </p>
            </div>

            {/* Failed */}
            <div className={`rounded-lg p-4 ${hasFailures ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className={`flex items-center gap-2 mb-1 ${hasFailures ? 'text-red-600' : 'text-gray-500'}`}>
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Failed</span>
              </div>
              <p className={`text-2xl font-bold ${hasFailures ? 'text-red-600' : 'text-gray-900'}`}>
                {period.transactions_failed}
              </p>
            </div>
          </div>

          {/* Failure warning */}
          {hasFailures && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Failed transactions will be retried automatically. You can also retry them manually from the sync dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
          {hasFailures && onRetryFailed && (
            <button
              onClick={onRetryFailed}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry Failed
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
