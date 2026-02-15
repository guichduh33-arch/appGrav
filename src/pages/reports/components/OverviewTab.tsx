import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  BarChart3, Receipt, Star, AlertTriangle, Landmark, Package, Printer, Users,
} from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ComparisonToggle } from '@/components/reports/ComparisonToggle';
import { ComparisonKpiCard, ComparisonKpiGrid } from '@/components/reports/ComparisonKpiCard';
import { exportReportToPdf } from '@/services/export/pdfExportService';

interface KpiRow { label: string; value: string; trend: string }

function TrendBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
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
    <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
          <span className="text-sm text-[var(--theme-text-muted)]">{label}</span>
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      {children}
    </div>
  );
}

export function OverviewTab() {
  const {
    dateRange, comparisonRange, comparisonType, setComparisonType, isComparisonEnabled,
  } = useDateRange({ defaultPreset: 'last7days', enableComparison: true });

  // Use comparison range from hook if comparison enabled, otherwise default to previous period
  const previousPeriod = useMemo(() => {
    if (isComparisonEnabled && comparisonRange) {
      return comparisonRange;
    }
    const durationMs = dateRange.to.getTime() - dateRange.from.getTime();
    return {
      from: new Date(dateRange.from.getTime() - durationMs),
      to: new Date(dateRange.from.getTime()),
    };
  }, [dateRange, comparisonRange, isComparisonEnabled]);

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

  const { data: uniqueCustomers } = useQuery({
    queryKey: ['overview-unique-customers', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getUniqueCustomerCount(dateRange.from, dateRange.to),
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
  const itemsSoldTrend = calcTrend(current?.items_sold ?? 0, previous?.items_sold ?? 0);
  const atvTrend = calcTrend(current?.avg_basket ?? 0, previous?.avg_basket ?? 0);
  const netRevenueTrend = calcTrend(current?.net_revenue ?? 0, previous?.net_revenue ?? 0);

  const totalTax = (current?.total_revenue ?? 0) * 10 / 110;
  const previousTax = (previous?.total_revenue ?? 0) * 10 / 110;
  const taxTrend = calcTrend(totalTax, previousTax);

  const exportConfig: ExportConfig<KpiRow> = useMemo(() => ({
    data: [
      { label: 'Revenue', value: String(current?.total_revenue ?? 0), trend: `${revenueTrend.toFixed(1)}%` },
      { label: 'Orders', value: String(current?.transaction_count ?? 0), trend: `${ordersTrend.toFixed(1)}%` },
      { label: 'Items Sold', value: String(current?.items_sold ?? 0), trend: `${itemsSoldTrend.toFixed(1)}%` },
      { label: 'ATV', value: String(current?.avg_basket ?? 0), trend: `${atvTrend.toFixed(1)}%` },
      { label: 'Net Revenue', value: String(current?.net_revenue ?? 0), trend: `${netRevenueTrend.toFixed(1)}%` },
      { label: 'Total Tax', value: String(Math.round(totalTax)), trend: `${taxTrend.toFixed(1)}%` },
      { label: 'Unique Customers', value: String(uniqueCustomers ?? 0), trend: '' },
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
  }), [current, summaryData, uniqueCustomers, dateRange, revenueTrend, ordersTrend, itemsSoldTrend, atvTrend, netRevenueTrend]);

  const handlePrintPdf = useCallback(() => {
    if (!exportConfig.data.length) return
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const rows = exportConfig.data.map(r => [r.label, r.value, r.trend])
    exportReportToPdf('Overview Report', ['KPI', 'Value', 'Trend vs Previous'], rows,
      { 'Period': `${fmt(dateRange.from)} - ${fmt(dateRange.to)}` })
  }, [exportConfig, dateRange])

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading overview data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton variant="kpi" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
        <div className="flex items-center gap-3">
          <ComparisonToggle
            comparisonType={comparisonType}
            comparisonRange={comparisonRange}
            onComparisonTypeChange={setComparisonType}
          />
          <ExportButtons config={exportConfig} />
          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={!exportConfig.data.length}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors bg-transparent border border-white/10 text-white hover:border-white/20 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed"
            title="Print / Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Use ComparisonKpiCard when comparison is active */}
      {isComparisonEnabled ? (
        <ComparisonKpiGrid columns={3}>
          <ComparisonKpiCard
            label="Revenue"
            currentValue={current?.total_revenue ?? 0}
            previousValue={previous?.total_revenue ?? null}
            format="currency"
            icon={<DollarSign className="w-5 h-5 text-blue-400" />}
          />
          <ComparisonKpiCard
            label="Orders"
            currentValue={current?.transaction_count ?? 0}
            previousValue={previous?.transaction_count ?? null}
            format="number"
            icon={<ShoppingBag className="w-5 h-5 text-indigo-400" />}
          />
          <ComparisonKpiCard
            label="Items Sold"
            currentValue={current?.items_sold ?? 0}
            previousValue={previous?.items_sold ?? null}
            format="number"
            icon={<Package className="w-5 h-5 text-cyan-400" />}
          />
          <ComparisonKpiCard
            label="Avg Transaction Value"
            currentValue={current?.avg_basket ?? 0}
            previousValue={previous?.avg_basket ?? null}
            format="currency"
            icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
          />
          <ComparisonKpiCard
            label="Net Revenue (excl. Tax)"
            currentValue={current?.net_revenue ?? 0}
            previousValue={previous?.net_revenue ?? null}
            format="currency"
            icon={<Receipt className="w-5 h-5 text-emerald-400" />}
          />
          <ComparisonKpiCard
            label="Total Tax (10%)"
            currentValue={totalTax}
            previousValue={previousTax}
            format="currency"
            icon={<Landmark className="w-5 h-5 text-amber-400" />}
          />
        </ComparisonKpiGrid>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard icon={<DollarSign className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10" label="Revenue" trend={revenueTrend}>
            <p className="text-2xl font-bold text-white">{formatCurrency(current?.total_revenue ?? 0)}</p>
          </KpiCard>
          <KpiCard icon={<ShoppingBag className="w-5 h-5 text-indigo-400" />} iconBg="bg-indigo-500/10" label="Orders" trend={ordersTrend}>
            <p className="text-2xl font-bold text-white">{(current?.transaction_count ?? 0).toLocaleString()}</p>
          </KpiCard>
          <KpiCard icon={<Package className="w-5 h-5 text-cyan-400" />} iconBg="bg-cyan-500/10" label="Items Sold" trend={itemsSoldTrend}>
            <p className="text-2xl font-bold text-white">{(current?.items_sold ?? 0).toLocaleString()}</p>
          </KpiCard>
          <KpiCard icon={<BarChart3 className="w-5 h-5 text-purple-400" />} iconBg="bg-purple-500/10" label="Avg Transaction Value" trend={atvTrend}>
            <p className="text-2xl font-bold text-white">{formatCurrency(current?.avg_basket ?? 0)}</p>
          </KpiCard>
          <KpiCard icon={<Receipt className="w-5 h-5 text-emerald-400" />} iconBg="bg-emerald-500/10" label="Net Revenue (excl. Tax)" trend={netRevenueTrend}>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(current?.net_revenue ?? 0)}</p>
          </KpiCard>
          <KpiCard icon={<Landmark className="w-5 h-5 text-amber-400" />} iconBg="bg-amber-500/10" label="Total Tax (10%)" trend={taxTrend}>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalTax)}</p>
          </KpiCard>
          <KpiCard icon={<Users className="w-5 h-5 text-teal-400" />} iconBg="bg-teal-500/10" label="Unique Customers">
            <p className="text-2xl font-bold text-white">{(uniqueCustomers ?? 0).toLocaleString()}</p>
          </KpiCard>
          <KpiCard icon={<Star className="w-5 h-5 text-[var(--color-gold)]" />} iconBg="bg-[var(--color-gold)]/10" label="Top Product">
            {summaryData?.top_product ? (<>
              <p className="text-lg font-bold text-white truncate">{summaryData.top_product.name}</p>
              <p className="text-sm text-[var(--theme-text-muted)]">{summaryData.top_product.qty} units sold</p>
            </>) : (<p className="text-lg text-[var(--theme-text-muted)]">No data</p>)}
          </KpiCard>
          <KpiCard icon={<AlertTriangle className="w-5 h-5 text-red-400" />} iconBg="bg-red-500/10" label="Low Stock Alerts">
            <p className={`text-2xl font-bold ${(summaryData?.low_stock_alerts ?? 0) > 0 ? 'text-red-400' : 'text-white'}`}>
              {summaryData?.low_stock_alerts ?? 0}
            </p>
            {(summaryData?.low_stock_alerts ?? 0) > 0 && (
              <p className="text-sm text-red-400/80 mt-1">Items need restocking</p>
            )}
          </KpiCard>
        </div>
      )}
    </div>
  );
}

export { OverviewTab as default };
