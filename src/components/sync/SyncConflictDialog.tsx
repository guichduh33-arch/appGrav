/**
 * SyncConflictDialog Component
 * Sprint 3 - Offline Improvements
 *
 * Dialog showing sync conflict details with side-by-side comparison
 * and action buttons for resolution (Keep Local / Keep Server / Skip).
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { ISyncConflict, TSyncConflictResolution } from '@/types/offline';
import { SyncConflictDiff } from './SyncConflictDiff';
import { useState } from 'react';

interface SyncConflictDialogProps {
  conflict: ISyncConflict | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (conflict: ISyncConflict, resolution: TSyncConflictResolution) => Promise<void>;
}

function getConflictTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    duplicate: 'Duplicate Entry',
    fk_violation: 'Missing Reference',
    version_mismatch: 'Version Conflict',
    deleted: 'Deleted on Server',
  };
  return labels[type] ?? type;
}

function getConflictTypeBadge(type: string): 'destructive' | 'secondary' | 'outline' {
  if (type === 'version_mismatch' || type === 'deleted') return 'destructive';
  if (type === 'duplicate') return 'secondary';
  return 'outline';
}

export function SyncConflictDialog({
  conflict,
  open,
  onOpenChange,
  onResolve,
}: SyncConflictDialogProps) {
  const [isResolving, setIsResolving] = useState(false);

  if (!conflict) return null;

  const handleResolve = async (resolution: TSyncConflictResolution) => {
    setIsResolving(true);
    try {
      await onResolve(conflict, resolution);
      onOpenChange(false);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sync Conflict
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant={getConflictTypeBadge(conflict.conflictType)}>
              {getConflictTypeLabel(conflict.conflictType)}
            </Badge>
            <span>
              {conflict.entityType} &middot; {conflict.entityId.slice(0, 8)}...
            </span>
          </DialogDescription>
        </DialogHeader>

        <SyncConflictDiff
          localData={conflict.localData}
          serverData={conflict.serverData}
        />

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => handleResolve('skip')}
            disabled={isResolving}
            className="gap-1.5"
          >
            <X className="h-4 w-4" />
            Skip
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleResolve('keep_server')}
            disabled={isResolving}
            className="gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            Keep Server
          </Button>
          <Button
            onClick={() => handleResolve('keep_local')}
            disabled={isResolving}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Keep Local
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
