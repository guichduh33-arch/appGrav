/**
 * PendingSyncPanel Component (Story 3.8)
 *
 * Sheet panel displaying sync queue items grouped by entity type.
 * Allows retry and delete actions on failed items.
 */

import { useTranslation } from 'react-i18next';
import { RefreshCw, Loader2, Cloud, CheckCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePendingSyncItems } from '@/hooks/sync/usePendingSyncItems';
import { PendingSyncItem } from './PendingSyncItem';
import type { TSyncEntity } from '@/types/offline';

interface PendingSyncPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Entity display order (matches sync priority)
 */
const ENTITY_ORDER: TSyncEntity[] = [
  'pos_sessions',
  'orders',
  'order_items',
  'payments',
  'customers',
  'products',
  'categories',
];

/**
 * Get entity label translation key
 */
function getEntityLabelKey(entity: TSyncEntity): string {
  return `sync.entity.${entity}`;
}

export function PendingSyncPanel({ open, onOpenChange }: PendingSyncPanelProps) {
  const { t } = useTranslation();
  const {
    groupedItems,
    totalCount,
    statusCounts,
    isLoading,
    refresh,
    retry,
    remove,
  } = usePendingSyncItems();

  // Filter entities that have items
  const entitiesWithItems = ENTITY_ORDER.filter(
    (entity) => groupedItems[entity]?.length > 0
  );

  const pendingTotal = statusCounts.pending + statusCounts.failed;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              {t('sync.panel.title')}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1.5">{t('sync.panel.refresh')}</span>
            </Button>
          </div>
          <SheetDescription>
            {pendingTotal > 0
              ? t('sync.panel.subtitle', { count: pendingTotal })
              : t('sync.panel.noItems')}
            {statusCounts.syncing > 0 && (
              <span className="ml-2 text-yellow-600">
                ({statusCounts.syncing} {t('sync.status.syncing').toLowerCase()})
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">{t('sync.panel.noItems')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entitiesWithItems.map((entity) => {
                const items = groupedItems[entity];
                if (!items || items.length === 0) return null;

                return (
                  <div key={entity}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
                      {t(getEntityLabelKey(entity))} ({items.length})
                    </h3>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <PendingSyncItem
                          key={item.id}
                          item={item}
                          onRetry={retry}
                          onDelete={remove}
                        />
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
