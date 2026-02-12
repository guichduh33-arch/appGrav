import { useQuery } from '@tanstack/react-query';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { ReportingService } from '@/services/ReportingService';
import { useLowStockItems } from '@/hooks/inventory/useInventoryAlerts';
import { untypedFrom } from '@/lib/supabase';

// Raw row from view_daily_kpis
interface TDailyKpiRow {
  date: string;
  total_revenue: number | null;
  total_orders: number | null;
  completed_orders: number | null;
  cancelled_orders: number | null;
  total_discounts: number | null;
  total_tax: number | null;
  avg_order_value: number | null;
  unique_customers: number | null;
}

// Aggregated payment method for donut chart
export interface TAggregatedPayment {
  method: string;
  total: number;
  count: number;
}

const STALE_5MIN = 5 * 60 * 1000;
const STALE_10MIN = 10 * 60 * 1000;

export function useDashboardData() {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  const thirtyDaysAgo = startOfDay(subDays(today, 29));

  // 1. Today + Yesterday KPIs (direct view query for unique_customers)
  const kpis = useQuery({
    queryKey: ['dashboard', 'kpis-today', todayStr],
    queryFn: async () => {
      const { data, error } = await untypedFrom('view_daily_kpis')
        .select('*')
        .gte('date', yesterdayStr)
        .lte('date', todayStr)
        .returns<TDailyKpiRow[]>();
      if (error) throw error;
      const rows = data || [];
      return {
        today: rows.find(r => r.date === todayStr) ?? null,
        yesterday: rows.find(r => r.date === yesterdayStr) ?? null,
      };
    },
    staleTime: STALE_5MIN,
    refetchInterval: STALE_5MIN,
  });

  // 2. 30-day revenue trend
  const revenueTrend = useQuery({
    queryKey: ['dashboard', 'revenue-trend', todayStr],
    queryFn: () => ReportingService.getDailySales(thirtyDaysAgo, endOfDay(today)),
    staleTime: STALE_10MIN,
  });

  // 3. Top products today
  const topProducts = useQuery({
    queryKey: ['dashboard', 'top-products', todayStr],
    queryFn: () => ReportingService.getProductPerformance(startOfDay(today), endOfDay(today)),
    staleTime: STALE_10MIN,
  });

  // 4. Payment methods (view has 30-day window) - aggregate per method
  const paymentMethods = useQuery({
    queryKey: ['dashboard', 'payment-methods'],
    queryFn: async (): Promise<TAggregatedPayment[]> => {
      const raw = await ReportingService.getPaymentMethodStats();
      const map = new Map<string, TAggregatedPayment>();
      for (const row of raw) {
        const key = row.payment_method;
        const existing = map.get(key);
        if (existing) {
          existing.total += row.total_revenue;
          existing.count += row.transaction_count;
        } else {
          map.set(key, { method: key, total: row.total_revenue, count: row.transaction_count });
        }
      }
      return Array.from(map.values()).sort((a, b) => b.total - a.total);
    },
    staleTime: STALE_10MIN,
  });

  // 5. Low stock alerts (reuse existing hook)
  const lowStock = useLowStockItems();

  return {
    kpis,
    revenueTrend,
    topProducts,
    paymentMethods,
    lowStock,
    isLoading: kpis.isLoading || revenueTrend.isLoading,
  };
}
