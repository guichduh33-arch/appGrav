import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  BarChart3, Receipt, Star, AlertTriangle, Loader2,
} from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';

interface KpiRow { label: string; value: string; trend: string }

function TrendBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {Math.abs(value).toFixed(1)}%
    </div>
  );
}

function KpiCard({
  icon, iconBg, label, trend, children,
}: {
  icon: React.ReactNode; iconBg: string; label: string;
  trend?: number; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      {children}
    </div>
  );
}

export function OverviewTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });

  // Calculate previous period (same duration, immediately before current)
  const previousPeriod = useMemo(() => {
    const durationMs = dateRange.to.getTime() - dateRange.from.getTime();
    return {
      from: new Date(dateRange.from.getTime() - durationMs),
      to: new Date(dateRange.from.getTime()),
    };
  }, [dateRange]);

  const {
    data: comparisonData, isLoading: comparisonLoading, error: comparisonError,
  } = useQuery({
    queryKey: ['overview-comparison', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesComparison(
      dateRange.from, dateRange.to, previousPeriod.from, previousPeriod.to,
    ),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: summaryData, isLoading: summaryLoading, error: summaryError,
  } = useQuery({
    queryKey: ['overview-summary', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getDashboardSummary(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = comparisonLoading || summaryLoading;
  const error = comparisonError || summaryError;

  const current = comparisonData?.find((c) => c.period_label === 'current');
  const previous = comparisonData?.find((c) => c.period_label === 'previous');

  const calcTrend = (curr: number, prev: number): number => {
    if (!prev) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const revenueTrend = calcTrend(current?.total_revenue ?? 0, previous?.total_revenue ?? 0);
  const ordersTrend = calcTrend(current?.transaction_count ?? 0, previous?.transaction_count ?? 0);
  const atvTrend = calcTrend(current?.avg_basket ?? 0, previous?.avg_basket ?? 0);
  const netRevenueTrend = calcTrend(current?.net_revenue ?? 0, previous?.net_revenue ?? 0);

  const totalTax = (current?.total_revenue ?? 0) * 10 / 110;
  const previousTax = (previous?.total_revenue ?? 0) * 10 / 110;
  const taxTrend = calcTrend(totalTax, previousTax);

  const exportConfig: ExportConfig<KpiRow> = useMemo(() => ({
    data: [
      { label: 'Revenue', value: String(current?.total_revenue ?? 0), trend: `${revenueTrend.toFixed(1)}%` },
      { label: 'Orders', value: String(current?.transaction_count ?? 0), trend: `${ordersTrend.toFixed(1)}%` },
      { label: 'ATV', value: String(current?.avg_basket ?? 0), trend: `${atvTrend.toFixed(1)}%` },
      { label: 'Net Revenue', value: String(current?.net_revenue ?? 0), trend: `${netRevenueTrend.toFixed(1)}%` },
      { label: 'Total Tax', value: String(Math.round(totalTax)), trend: `${taxTrend.toFixed(1)}%` },
      { label: 'Top Product', value: summaryData?.top_product ? `${summaryData.top_product.name} (${summaryData.top_product.qty})` : 'N/A', trend: '' },
      { label: 'Low Stock Alerts', value: String(summaryData?.low_stock_alerts ?? 0), trend: '' },
    ],
    columns: [
      { key: 'label', header: 'KPI' },
      { key: 'value', header: 'Value' },
      { key: 'trend', header: 'Trend vs Previous' },
    ],
    filename: 'overview-report',
    title: 'Overview Report',
    dateRange: { from: dateRange.from, to: dateRange.to },
  }), [current, summaryData, dateRange, revenueTrend, ordersTrend, atvTrend, netRevenueTrend]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading overview data. Please try again.
      </div>
    );
  }

  const LoadingValue = () => <Loader2 className="w-6 h-6 animate-spin" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50" label="Revenue"
          trend={isLoading ? undefined : revenueTrend}
        >
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <LoadingValue /> : formatCurrency(current?.total_revenue ?? 0)}
          </p>
        </KpiCard>

        <KpiCard
          icon={<ShoppingBag className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50" label="Orders"
          trend={isLoading ? undefined : ordersTrend}
        >
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <LoadingValue /> : (current?.transaction_count ?? 0).toLocaleString()}
          </p>
        </KpiCard>

        <KpiCard
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50" label="Avg Transaction Value"
          trend={isLoading ? undefined : atvTrend}
        >
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <LoadingValue /> : formatCurrency(current?.avg_basket ?? 0)}
          </p>
        </KpiCard>

        <KpiCard
          icon={<Receipt className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-50" label="Net Revenue (excl. Tax)"
          trend={isLoading ? undefined : netRevenueTrend}
        >
          <p className="text-2xl font-bold text-green-600">
            {isLoading ? <LoadingValue /> : formatCurrency(current?.net_revenue ?? 0)}
          </p>
        </KpiCard>

        <KpiCard
          icon={<Star className="w-5 h-5 text-yellow-600" />}
          iconBg="bg-yellow-50" label="Top Product"
        >
          {isLoading ? <LoadingValue /> : summaryData?.top_product ? (
            <>
              <p className="text-lg font-bold text-gray-900 truncate">{summaryData.top_product.name}</p>
              <p className="text-sm text-gray-500">{summaryData.top_product.qty} units sold</p>
            </>
          ) : (
            <p className="text-lg text-gray-400">No data</p>
          )}
        </KpiCard>

        <KpiCard
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-50" label="Low Stock Alerts"
        >
          <p className={`text-2xl font-bold ${(summaryData?.low_stock_alerts ?? 0) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {isLoading ? <LoadingValue /> : summaryData?.low_stock_alerts ?? 0}
          </p>
          {!isLoading && (summaryData?.low_stock_alerts ?? 0) > 0 && (
            <p className="text-sm text-red-500 mt-1">Items need restocking</p>
          )}
        </KpiCard>
      </div>
    </div>
  );
}

export { OverviewTab as default };
