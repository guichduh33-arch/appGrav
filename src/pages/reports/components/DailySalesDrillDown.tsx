import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import { ReportBreadcrumb, BreadcrumbLevel } from '@/components/reports/ReportBreadcrumb';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';

interface OrderDetail {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  payment_method: string;
  items_count: number;
  staff_name: string | null;
}

async function getOrdersForDate(date: string): Promise<OrderDetail[]> {
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      total,
      payment_method,
      user_profiles:user_id(full_name)
    `)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .not('status', 'eq', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const orderIds = (data || []).map(o => o.id);
  const { data: itemCounts } = await supabase
    .from('order_items')
    .select('order_id')
    .in('order_id', orderIds);

  const countMap = new Map<string, number>();
  (itemCounts || []).forEach(item => {
    countMap.set(item.order_id, (countMap.get(item.order_id) || 0) + 1);
  });

  return (data || []).map(order => ({
    id: order.id,
    order_number: order.order_number || order.id.slice(0, 8),
    created_at: order.created_at,
    total: order.total || 0,
    payment_method: order.payment_method || 'unknown',
    items_count: countMap.get(order.id) || 0,
    staff_name: Array.isArray(order.user_profiles)
      ? order.user_profiles[0]?.full_name
      : (order.user_profiles as { full_name?: string } | null)?.full_name || null,
  }));
}

function KpiCard({ icon, bg, label, value }: {
  icon: React.ReactNode; bg: string; label: string; value: string | null;
}) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
        <span className="text-sm text-[var(--theme-text-muted)]">{label}</span>
      </div>
      {value === null ? (
        <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

interface DailySalesDrillDownProps {
  drillDate: string;
  breadcrumbLevels: BreadcrumbLevel[];
  onDrillReset: () => void;
}

export function DailySalesDrillDown({ drillDate, breadcrumbLevels, onDrillReset }: DailySalesDrillDownProps) {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['dailySalesOrders', drillDate],
    queryFn: () => getOrdersForDate(drillDate),
    staleTime: 5 * 60 * 1000,
    enabled: !!drillDate,
  });

  const dayTotals = {
    revenue: orders.reduce((s, o) => s + o.total, 0),
    orderCount: orders.length,
    avgBasket: orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0,
  };

  const ordersExportConfig: ExportConfig<OrderDetail> = useMemo(() => ({
    data: orders,
    columns: [
      { key: 'order_number', header: 'Order #' },
      { key: 'created_at', header: 'Time', format: (v) => new Date(v as string).toLocaleTimeString() },
      { key: 'items_count', header: 'Items', align: 'right' as const },
      { key: 'total', header: 'Total', align: 'right' as const, format: (v) => formatCurrency(v as number) },
      { key: 'payment_method', header: 'Payment' },
      { key: 'staff_name', header: 'Staff' },
    ],
    filename: `orders-${drillDate}`,
    title: `Orders for ${drillDate ? new Date(drillDate).toLocaleDateString() : ''}`,
  }), [orders, drillDate]);

  return (
    <div className="space-y-6">
      <ReportBreadcrumb levels={breadcrumbLevels} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onDrillReset}
          className="flex items-center gap-2 text-[var(--color-gold)] hover:text-[var(--color-gold)]/80 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Daily Sales
        </button>
        <ExportButtons config={ordersExportConfig} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard icon={<DollarSign className="w-5 h-5 text-blue-400" />} bg="bg-blue-500/10"
          label="Day Revenue" value={ordersLoading ? null : formatCurrency(dayTotals.revenue)} />
        <KpiCard icon={<ShoppingCart className="w-5 h-5 text-emerald-400" />} bg="bg-emerald-500/10"
          label="Orders" value={ordersLoading ? null : dayTotals.orderCount.toString()} />
        <KpiCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} bg="bg-purple-500/10"
          label="Avg Basket" value={ordersLoading ? null : formatCurrency(dayTotals.avgBasket)} />
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">
            Orders for {new Date(drillDate).toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Order #</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Time</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Items</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Total</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Payment</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ordersLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--theme-text-muted)]" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">
                    No orders for this date.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-sm font-medium text-white">{order.order_number}</td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{order.items_count}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--color-gold)] text-right">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-white/5 text-white/70 rounded-full capitalize">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">{order.staff_name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
