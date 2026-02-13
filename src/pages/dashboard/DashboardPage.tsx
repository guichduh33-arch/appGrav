import { useState, useEffect } from 'react';

import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,


  RefreshCw,
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
import { DashboardKpiCard } from './DashboardKpiCard';
import { InventoryMonitor, type InventoryItem } from './InventoryMonitor';
import { formatCurrency } from '@/utils/helpers';
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
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    setLastRefresh(format(new Date(), 'HH:mm'));
  }, [kpis.dataUpdatedAt]);

  const todayKpi = kpis.data?.today;
  const trendData = revenueTrend.data ?? [];
  const topProductsList = (topProducts.data ?? []).slice(0, 5);
  const paymentData = paymentMethods.data ?? [];
  const lowStockItems: InventoryItem[] = (lowStock.data ?? [])
    .filter(i => i.severity !== 'normal')
    .slice(0, 10)
    .map(i => ({
      id: i.id,
      name: i.name,
      current_stock: i.current_stock,
      min_stock_level: i.min_stock_level,
      unit_name: i.unit_name,
      severity: i.severity,
      supplier_name: (i as any).supplier_name,
    }));

  const displayName = user?.display_name || user?.name || 'there';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* ---- Executive Summary Header ---- */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--theme-text-primary)] font-display">
          Executive Summary
        </h1>
        <p className="text-sm text-[var(--theme-text-secondary)] mt-1">
          {getGreeting()}, {displayName}. Here's what's happening at The Breakery today.
        </p>
      </div>

      {/* ---- KPI Cards Row (Stitch-style) ---- */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKpiCard
            label="Total Sales"
            value={formatCurrency(todayKpi?.total_revenue ?? 0)}
            icon={<DollarSign size={18} className="text-[var(--color-success-text)]" />}
            iconColor="var(--color-success-text)"
          />
          <DashboardKpiCard
            label="Active Orders"
            value={String(todayKpi?.total_orders ?? 0)}
            icon={<ShoppingBag size={18} className="text-[#3b82f6]" />}
            iconColor="#3b82f6"
          />
          <DashboardKpiCard
            label="Stock Alerts"
            value={String(lowStockItems.length)}
            icon={<AlertTriangle size={18} className="text-[var(--color-warning-text)]" />}
            iconColor="var(--color-warning-text)"
          />
          <DashboardKpiCard
            label="Avg Order"
            value={formatCurrency(todayKpi?.avg_order_value ?? 0)}
            icon={<TrendingUp size={18} className="text-[var(--color-gold)]" />}
            iconColor="var(--color-gold)"
          />
        </div>
      )}

      {/* ---- Sales Performance Chart ---- */}
      <div className="bg-[var(--theme-bg-secondary)] rounded-2xl p-6 border border-[var(--theme-border)] shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
            Sales Performance
          </h3>
          <span className="text-xs text-[var(--theme-text-muted)]">Last 30 days</span>
        </div>
        <p className="text-xs text-[var(--theme-text-muted)] mb-4">Weekly overview of revenue streams</p>

        {revenueTrend.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : trendData.length === 0 ? (
          <p className="text-sm text-[var(--theme-text-muted)] text-center py-16">No data available</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A55C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C9A55C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={d => format(parseISO(d), 'dd MMM')}
                  tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatAxisValue}
                  tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--theme-bg-tertiary)',
                    borderColor: 'var(--theme-border)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: 'var(--theme-text-primary)',
                  }}
                  itemStyle={{ color: 'var(--color-gold)' }}
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Revenue']}
                  labelFormatter={d => format(parseISO(String(d)), 'dd MMM yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="total_sales"
                  stroke="#C9A55C"
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#9A7B3A' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ---- Two-column: Top Products + Payment Methods ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products */}
        <div className="bg-[var(--theme-bg-secondary)] rounded-2xl p-6 border border-[var(--theme-border)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-4 uppercase tracking-wider">
            Top Products Today
          </h3>
          {topProducts.isLoading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : topProductsList.length === 0 ? (
            <p className="text-sm text-[var(--theme-text-muted)] text-center py-8">No sales today yet</p>
          ) : (
            <div className="space-y-4">
              {topProductsList.map((product, i) => {
                const maxQty = topProductsList[0]?.quantity_sold || 1;
                const barWidth = (product.quantity_sold / maxQty) * 100;
                return (
                  <div key={product.product_id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--theme-text-muted)] w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[var(--theme-text-primary)] truncate">{product.product_name}</span>
                        <span className="text-[var(--theme-text-secondary)] ml-2 shrink-0">{product.quantity_sold} sold</span>
                      </div>
                      <div className="h-2 bg-[var(--theme-bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] rounded-full transition-all duration-500"
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
        <div className="bg-[var(--theme-bg-secondary)] rounded-2xl p-6 border border-[var(--theme-border)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--theme-text-secondary)] mb-4 uppercase tracking-wider">
            Payment Methods (30 Days)
          </h3>
          {paymentMethods.isLoading ? (
            <Skeleton className="h-48 w-48 mx-auto rounded-full" />
          ) : paymentData.length === 0 ? (
            <p className="text-sm text-[var(--theme-text-muted)] text-center py-8">No payment data</p>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--theme-bg-tertiary)',
                        borderColor: 'var(--theme-border)',
                        borderRadius: '12px',
                        color: 'var(--theme-text-primary)',
                      }}
                      formatter={(v) => formatCurrency(Number(v ?? 0))}
                    />
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
                      <span className="text-[var(--theme-text-secondary)] capitalize">{entry.method}</span>
                      <span className="text-[var(--theme-text-muted)] ml-auto">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Inventory Monitor (Stitch-style) ---- */}
      <InventoryMonitor items={lowStockItems} isLoading={lowStock.isLoading} />

      {/* ---- Sync Status Footer ---- */}
      <div className="flex items-center justify-center gap-2 py-3 text-[var(--theme-text-muted)]">
        <RefreshCw size={12} className="text-[var(--color-success-text)]" />
        <span className="text-xs">
          Sync Complete — Dashboard data refreshed at {lastRefresh || '--:--'}
        </span>
      </div>
    </div>
  );
}
