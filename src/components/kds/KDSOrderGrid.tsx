import { AlertTriangle } from 'lucide-react';
import KDSOrderCard from './KDSOrderCard';
import type { IKdsOrder } from '@/hooks/kds/useKdsOrderQueue';

interface IKDSOrderGridProps {
  urgentOrders: IKdsOrder[];
  normalOrders: IKdsOrder[];
  station: string;
  onStartPreparing: (orderId: string, itemIds: string[]) => void;
  onMarkReady: (orderId: string, itemIds: string[]) => void;
  onMarkServed: (orderId: string, itemIds: string[]) => void;
  onToggleHold: (itemId: string, currentHoldStatus: boolean) => void;
  onOrderComplete: (orderId: string) => void;
}

const GRID_CLASSES = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';

function OrderCard({ order, station, handlers }: {
  order: IKdsOrder;
  station: string;
  handlers: Pick<IKDSOrderGridProps, 'onStartPreparing' | 'onMarkReady' | 'onMarkServed' | 'onToggleHold' | 'onOrderComplete'>;
}) {
  return (
    <KDSOrderCard
      orderId={order.id}
      orderNumber={order.order_number}
      orderType={order.order_type}
      tableName={order.table_name}
      customerName={order.customer_name}
      items={order.items}
      createdAt={order.created_at}
      station={station}
      source={order.source}
      onStartPreparing={handlers.onStartPreparing}
      onMarkReady={handlers.onMarkReady}
      onMarkServed={handlers.onMarkServed}
      onToggleHold={handlers.onToggleHold}
      onOrderComplete={handlers.onOrderComplete}
    />
  );
}

export function KDSOrderGrid({
  urgentOrders,
  normalOrders,
  station,
  onStartPreparing,
  onMarkReady,
  onMarkServed,
  onToggleHold,
  onOrderComplete,
}: IKDSOrderGridProps) {
  const handlers = { onStartPreparing, onMarkReady, onMarkServed, onToggleHold, onOrderComplete };

  return (
    <>
      {/* Urgent Orders Section */}
      {urgentOrders.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30">
          <h2 className="flex items-center gap-2 text-[1.1rem] font-bold mb-4 py-2 px-4 rounded-lg bg-[#EF4444] text-white animate-pulse-urgent">
            <AlertTriangle size={20} />
            URGENT ({urgentOrders.length})
          </h2>
          <div className={GRID_CLASSES}>
            {urgentOrders.map((order) => (
              <OrderCard key={order.id} order={order} station={station} handlers={handlers} />
            ))}
          </div>
        </div>
      )}

      {/* Normal Orders Section */}
      <div className="mb-6">
        {urgentOrders.length > 0 && (
          <h2 className="flex items-center gap-2 text-[1.1rem] font-bold mb-4 py-2 px-4 rounded-lg bg-[#2a2a2a] text-[#888]">
            Waiting ({normalOrders.length})
          </h2>
        )}
        <div className={GRID_CLASSES}>
          {normalOrders.map((order) => (
            <OrderCard key={order.id} order={order} station={station} handlers={handlers} />
          ))}
        </div>
      </div>
    </>
  );
}
