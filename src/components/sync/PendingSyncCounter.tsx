/**
 * PendingSyncCounter Component (Story 3.8)
 *
 * Badge displaying pending sync count in the header.
 * Clicking opens the PendingSyncPanel for details.
 *
 * Features:
 * - Hidden when no items pending
 * - Animated icon when syncing
 * - Orange badge when has failed items
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { PendingSyncPanel } from './PendingSyncPanel';

interface PendingSyncCounterProps {
  className?: string;
}

export function PendingSyncCounter({ className }: PendingSyncCounterProps) {
  const { t } = useTranslation();
  const [panelOpen, setPanelOpen] = useState(false);
  const { pendingTotal, counts, isSyncing } = useSyncQueue();

  // Don't render if no pending items (AC6)
  if (pendingTotal === 0 && !isSyncing) {
    return null;
  }

  // Determine badge variant based on state
  const hasFailed = counts.failed > 0;
  const badgeVariant = hasFailed ? 'destructive' : 'secondary';

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setPanelOpen(true)}
        className={cn(
          'relative h-9 px-2 gap-1.5',
          className
        )}
        title={t('sync.counter.pending', { count: pendingTotal })}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : hasFailed ? (
          <CloudOff className="h-4 w-4 text-orange-500" />
        ) : (
          <Cloud className="h-4 w-4 text-blue-600" />
        )}

        <Badge
          variant={badgeVariant}
          className={cn(
            'min-w-[1.25rem] h-5 px-1.5 text-xs font-medium',
            hasFailed && 'bg-orange-500 hover:bg-orange-500/80',
            !hasFailed && 'bg-blue-100 text-blue-700 hover:bg-blue-100'
          )}
        >
          {pendingTotal}
        </Badge>
      </Button>

      <PendingSyncPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </>
  );
}
