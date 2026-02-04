/**
 * PendingSyncPanel Component (Story 3.8)
 *
 * Sheet panel displaying sync queue items grouped by entity type.
 * Allows retry and delete actions on failed items.
 */

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
 * Get entity label
 */
function getEntityLabel(entity: TSyncEntity): string {
  const labels: Record<TSyncEntity, string> = {
    pos_sessions: 'POS Sessions',
    orders: 'Orders',
    order_items: 'Order Items',
    payments: 'Payments',
    customers: 'Customers',
    products: 'Products',
    categories: 'Categories',
  };
  return labels[entity] || entity;
}

export function PendingSyncPanel({ open, onOpenChange }: PendingSyncPanelProps) {
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
              Pending Sync
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
              <span className="ml-1.5">Refresh</span>
            </Button>
          </div>
          <SheetDescription>
            {pendingTotal > 0
              ? `${pendingTotal} items pending`
              : 'No items pending'}
            {statusCounts.syncing > 0 && (
              <span className="ml-2 text-yellow-600">
                ({statusCounts.syncing} syncing)
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">No items pending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entitiesWithItems.map((entity) => {
                const items = groupedItems[entity];
                if (!items || items.length === 0) return null;

                return (
                  <div key={entity}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
                      {getEntityLabel(entity)} ({items.length})
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
