/**
 * PendingSyncItem Component (Story 3.8)
 *
 * Displays a single sync queue item with status and actions.
 * Failed items show error message and retry/delete buttons.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Trash2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { ISyncQueueItem, TSyncStatus } from '@/types/offline';

interface PendingSyncItemProps {
  item: ISyncQueueItem;
  onRetry: (itemId: number) => Promise<boolean>;
  onDelete: (itemId: number) => Promise<boolean>;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get status icon and color
 */
function getStatusConfig(status: TSyncStatus): {
  icon: typeof Clock;
  color: string;
  bgColor: string;
} {
  switch (status) {
    case 'pending':
      return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' };
    case 'syncing':
      return { icon: Loader2, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    case 'failed':
      return { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
    default:
      return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-50' };
  }
}

/**
 * Truncate entity ID for display
 */
function truncateId(entityId: string): string {
  if (entityId.length <= 20) return entityId;
  return `${entityId.slice(0, 10)}...${entityId.slice(-6)}`;
}

export function PendingSyncItem({ item, onRetry, onDelete }: PendingSyncItemProps) {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { icon: StatusIcon, color, bgColor } = getStatusConfig(item.status);
  const isFailed = item.status === 'failed';
  const isSyncing = item.status === 'syncing';

  const handleRetry = async () => {
    if (!item.id) return;
    setIsRetrying(true);
    try {
      await onRetry(item.id);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async () => {
    if (!item.id) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Entity ID and status */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-full',
              bgColor
            )}
          >
            <StatusIcon
              className={cn(
                'h-3.5 w-3.5',
                color,
                isSyncing && 'animate-spin'
              )}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-mono truncate" title={item.entityId}>
              {truncateId(item.entityId)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(item.created_at)}
              {item.retries > 0 && (
                <span className="ml-2">
                  ({item.retries} {item.retries === 1 ? 'retry' : 'retries'})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions for failed items */}
        {isFailed && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-7 px-2"
            >
              {isRetrying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span className="ml-1 text-xs">{t('sync.panel.retry')}</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('sync.panel.deleteConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('sync.panel.deleteWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('sync.panel.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Error message for failed items */}
      {isFailed && item.lastError && (
        <div className="mt-1.5 ml-8 p-2 rounded bg-red-50 border border-red-100">
          <p className="text-xs text-red-700">
            <span className="font-medium">{t('sync.panel.error')}:</span>{' '}
            {item.lastError}
          </p>
        </div>
      )}
    </div>
  );
}
