import { useMemo } from 'react';
import { X, CheckCircle } from 'lucide-react';
import type { IKdsOrder } from '@/hooks/kds/useKdsOrderQueue';

interface IKDSAllDayCountProps {
  orders: IKdsOrder[];
  onClose: () => void;
}

interface IProductCount {
  product_name: string;
  total: number;
  prepared: number;
  remaining: number;
}

export function KDSAllDayCount({ orders, onClose }: IKDSAllDayCountProps) {
  const productCounts = useMemo(() => {
    const map = new Map<string, { total: number; prepared: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = map.get(item.product_name) || { total: 0, prepared: 0 };
        existing.total += item.quantity;
        if (item.item_status === 'ready' || item.item_status === 'served') {
          existing.prepared += item.quantity;
        }
        map.set(item.product_name, existing);
      }
    }

    const result: IProductCount[] = [];
    map.forEach((value, key) => {
      result.push({
        product_name: key,
        total: value.total,
        prepared: value.prepared,
        remaining: value.total - value.prepared,
      });
    });

    return result.sort((a, b) => b.remaining - a.remaining);
  }, [orders]);

  const totalItems = productCounts.reduce((sum, p) => sum + p.total, 0);
  const totalPrepared = productCounts.reduce((sum, p) => sum + p.prepared, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">All-Day Count</h2>
          <p className="text-sm text-[#888] mt-1">
            {totalPrepared}/{totalItems} items prepared ({productCounts.length} products)
          </p>
        </div>
        <button
          className="bg-[#333] border-none text-white w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-[#444]"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Summary bar */}
      <div className="mb-6 bg-[#2a2a2a] rounded-xl p-4">
        <div className="flex justify-between text-sm text-[#aaa] mb-2">
          <span>Overall Progress</span>
          <span>{totalItems > 0 ? Math.round((totalPrepared / totalItems) * 100) : 0}%</span>
        </div>
        <div className="w-full h-3 bg-[#333] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-500"
            style={{ width: `${totalItems > 0 ? (totalPrepared / totalItems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productCounts.map((product) => {
          const progress = product.total > 0 ? (product.prepared / product.total) * 100 : 0;
          const isDone = product.remaining === 0;

          return (
            <div
              key={product.product_name}
              className={`bg-[#2a2a2a] rounded-xl p-4 border-2 transition-all ${
                isDone ? 'border-[#10B981]/30 opacity-60' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-white leading-tight flex-1 mr-2">
                  {product.product_name}
                </h3>
                {isDone && <CheckCircle size={18} className="text-[#10B981] shrink-0 mt-0.5" />}
              </div>

              <div className="flex items-end justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#F59E0B]">{product.remaining}</span>
                  <span className="text-sm text-[#888]">remaining</span>
                </div>
                <span className="text-sm text-[#aaa]">
                  {product.prepared}/{product.total}
                </span>
              </div>

              <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone ? 'bg-[#10B981]' : 'bg-[#3B82F6]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {productCounts.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <p className="text-lg">No items to display</p>
        </div>
      )}
    </div>
  );
}
