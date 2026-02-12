import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardData, type TAggregatedPayment } from '@/hooks/useDashboardData';
import { ComparisonKpiCard, ComparisonKpiGrid } from '@/components/reports/ComparisonKpiCard';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

const PAYMENT_COLORS: Record<string, string> = {
  cash: '#22c55e',
  card: '#3b82f6',
  qris: '#a855f7',
  edc: '#f59e0b',
  transfer: '#06b6d4',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatAxisValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}


export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const { kpis, revenueTrend, topProducts, paymentMethods, lowStock, isLoading } = useDashboardData();

  const todayKpi = kpis.data?.today;
  const yesterdayKpi = kpis.data?.yesterday;
  const trendData = revenueTrend.data ?? [];
  const topProductsList = (topProducts.data ?? []).slice(0, 5);
  const paymentData = paymentMethods.data ?? [];
  const lowStockItems = (lowStock.data ?? []).filter(i => i.severity !== 'normal').slice(0, 10);

  const displayName = user?.display_name || user?.name || 'there';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), 'EEEE, d MMMM yyyy')} — The Breakery Dashboard
          </p>
        </div>
      </div>

      {/* Section 1: KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <ComparisonKpiGrid columns={4}>
          <ComparisonKpiCard
            label="Revenue"
            currentValue={todayKpi?.total_revenue ?? 0}
            previousValue={yesterdayKpi?.total_revenue ?? null}
            format="currency"
            icon={<DollarSign size={18} className="text-green-600" />}
          />
          <ComparisonKpiCard
            label="Orders"
            currentValue={todayKpi?.total_orders ?? 0}
            previousValue={yesterdayKpi?.total_orders ?? null}
            format="number"
            icon={<ShoppingBag size={18} className="text-blue-600" />}
          />
          <ComparisonKpiCard
            label="Avg Order"
            currentValue={todayKpi?.avg_order_value ?? 0}
            previousValue={yesterdayKpi?.avg_order_value ?? null}
            format="currency"
            icon={<TrendingUp size={18} className="text-amber-600" />}
          />
          <ComparisonKpiCard
            label="Customers"
            currentValue={todayKpi?.unique_customers ?? 0}
            previousValue={yesterdayKpi?.unique_customers ?? null}
            format="number"
            icon={<Users size={18} className="text-purple-600" />}
          />
        </ComparisonKpiGrid>
      )}

      {/* Section 2: Revenue Trend */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend (Last 30 Days)</h3>
        {revenueTrend.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : trendData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">No data available</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={d => format(parseISO(d), 'dd MMM')}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatAxisValue}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Revenue']}
                  labelFormatter={d => format(parseISO(String(d)), 'dd MMM yyyy')}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Area
                  type="monotone"
                  dataKey="total_sales"
                  stroke="#3b82f6"
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Section 3: Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Products Today</h3>
          {topProducts.isLoading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : topProductsList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No sales today yet</p>
          ) : (
            <div className="space-y-4">
              {topProductsList.map((product, i) => {
                const maxQty = topProductsList[0]?.quantity_sold || 1;
                const barWidth = (product.quantity_sold / maxQty) * 100;
                return (
                  <div key={product.product_id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400 w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 truncate">{product.product_name}</span>
                        <span className="text-gray-500 ml-2 shrink-0">{product.quantity_sold} sold</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods Donut */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Methods (30 Days)</h3>
          {paymentMethods.isLoading ? (
            <Skeleton className="h-48 w-48 mx-auto rounded-full" />
          ) : paymentData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No payment data</p>
          ) : (
            <div className="flex items-center justify-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData as unknown as Record<string, unknown>[]}
                      dataKey="total"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {paymentData.map((entry: TAggregatedPayment) => (
                        <Cell key={entry.method} fill={PAYMENT_COLORS[entry.method] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {paymentData.map((entry: TAggregatedPayment) => {
                  const grandTotal = paymentData.reduce((s, e) => s + e.total, 0);
                  const pct = grandTotal > 0 ? ((entry.total / grandTotal) * 100).toFixed(0) : '0';
                  return (
                    <div key={entry.method} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: PAYMENT_COLORS[entry.method] || '#9ca3af' }}
                      />
                      <span className="text-gray-700 capitalize">{entry.method}</span>
                      <span className="text-gray-400 ml-auto">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Inventory Alerts */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Inventory Alerts</h3>
            {lowStockItems.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {lowStockItems.length}
              </span>
            )}
          </div>
          <Link
            to="/inventory"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {lowStock.isLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : lowStockItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">All stock levels are healthy</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-right">Stock</th>
                  <th className="pb-2 font-medium text-right">Min Level</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-medium text-gray-900">{item.name}</td>
                    <td className="py-2.5 text-right text-gray-600">
                      {item.current_stock} {item.unit_name}
                    </td>
                    <td className="py-2.5 text-right text-gray-600">{item.min_stock_level}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          item.severity === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {item.severity === 'critical' && <AlertTriangle size={10} />}
                        {item.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
