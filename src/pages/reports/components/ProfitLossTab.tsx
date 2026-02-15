import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Percent, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ComparisonToggle } from '@/components/reports/ComparisonToggle';
import { ComparisonKpiCard, ComparisonKpiGrid } from '@/components/reports/ComparisonKpiCard';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IProfitLossReport } from '@/types/reporting';
import { ProfitLossKpis } from './profit-loss/ProfitLossKpis';
import { ProfitLossChart } from './profit-loss/ProfitLossChart';
import { ProfitLossTable } from './profit-loss/ProfitLossTable';

export function ProfitLossTab() {
  const {
    dateRange, comparisonRange, comparisonType, setComparisonType, isComparisonEnabled,
  } = useDateRange({ defaultPreset: 'last30days', enableComparison: true });
  const [chartView, setChartView] = useState<'bar' | 'line'>('bar');

  const { data, isLoading, error } = useQuery({
    queryKey: ['profit-loss', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getProfitLoss(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const { data: comparisonPLData } = useQuery({
    queryKey: ['profit-loss-comparison', comparisonRange?.from, comparisonRange?.to],
    queryFn: () => ReportingService.getProfitLoss(comparisonRange!.from, comparisonRange!.to),
    staleTime: 5 * 60 * 1000,
    enabled: isComparisonEnabled && !!comparisonRange,
  });

  // H5: Waste cost for period
  const { data: wasteCost = 0 } = useQuery({
    queryKey: ['pl-waste-cost', dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('quantity, unit_cost')
        .eq('movement_type', 'waste')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
      if (error) throw error
      return (data || []).reduce((sum, r) => sum + Math.abs(r.quantity) * (r.unit_cost || 0), 0)
    },
    staleTime: 5 * 60 * 1000,
  });

  const totals = useMemo(() => {
    if (!data || data.length === 0) {
      return { grossRevenue: 0, cogs: 0, grossProfit: 0, marginPercentage: 0, taxCollected: 0, totalDiscounts: 0 };
    }
    const grossRevenue = data.reduce((sum, d) => sum + (d.gross_revenue || 0), 0);
    const cogs = data.reduce((sum, d) => sum + (d.cogs || 0), 0);
    const grossProfit = data.reduce((sum, d) => sum + (d.gross_profit || 0), 0);
    const taxCollected = data.reduce((sum, d) => sum + (d.tax_collected || 0), 0);
    const totalDiscounts = data.reduce((sum, d) => sum + (d.total_discounts || 0), 0);
    const marginPercentage = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    return { grossRevenue, cogs, grossProfit, marginPercentage, taxCollected, totalDiscounts };
  }, [data]);

  const prevTotals = useMemo(() => {
    if (!comparisonPLData || comparisonPLData.length === 0 || !isComparisonEnabled) return null;
    const grossRevenue = comparisonPLData.reduce((sum, d) => sum + (d.gross_revenue || 0), 0);
    const cogs = comparisonPLData.reduce((sum, d) => sum + (d.cogs || 0), 0);
    const grossProfit = comparisonPLData.reduce((sum, d) => sum + (d.gross_profit || 0), 0);
    const marginPercentage = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    return { grossRevenue, cogs, grossProfit, marginPercentage };
  }, [comparisonPLData, isComparisonEnabled]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime())
      .map((d) => ({
        date: new Date(d.report_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        revenue: d.gross_revenue,
        cogs: d.cogs,
        profit: d.gross_profit,
        margin: d.margin_percentage,
      }));
  }, [data]);

  const exportConfig: ExportConfig<IProfitLossReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'report_date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'order_count', header: 'Orders', align: 'right' as const },
      { key: 'gross_revenue', header: 'Gross Revenue', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
      { key: 'cogs', header: 'Cost', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
      { key: 'gross_profit', header: 'Gross Profit', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
      { key: 'margin_percentage', header: 'Margin %', align: 'right' as const, format: (v) => `${Number(v).toFixed(1)}%` },
      { key: 'tax_collected', header: 'Tax', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
    ],
    filename: 'profit-loss',
    title: 'Profit & Loss Report',
    dateRange,
    summaries: [
      { label: 'Total Revenue', value: formatCurrencyPdf(totals.grossRevenue) },
      { label: 'Gross Profit', value: formatCurrencyPdf(totals.grossProfit) },
      { label: 'Margin %', value: `${totals.marginPercentage.toFixed(1)}%` },
    ],
  }), [data, dateRange, totals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return <div className="p-8 text-center text-red-400">Error loading data</div>;
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <div className="flex items-center gap-3">
          <ComparisonToggle
            comparisonType={comparisonType}
            comparisonRange={comparisonRange}
            onComparisonTypeChange={setComparisonType}
          />
          <ExportButtons config={exportConfig} />
        </div>
      </div>

      {/* H5: Waste Cost Summary */}
      {wasteCost > 0 && (
        <div className="flex items-center gap-4 px-5 py-3 bg-red-500/5 border border-red-500/10 rounded-xl text-sm">
          <Trash2 size={16} className="text-red-400 shrink-0" />
          <span className="text-white/80">
            Waste cost this period: <strong className="text-red-400">{formatCurrency(wasteCost)}</strong>
          </span>
          {totals.grossRevenue > 0 && (
            <span className="text-white/50 ml-auto">
              {((wasteCost / totals.grossRevenue) * 100).toFixed(1)}% of revenue
            </span>
          )}
        </div>
      )}

      {isComparisonEnabled && prevTotals ? (
        <ComparisonKpiGrid columns={4}>
          <ComparisonKpiCard
            label="Gross Revenue"
            currentValue={totals.grossRevenue}
            previousValue={prevTotals.grossRevenue}
            format="currency"
            icon={<DollarSign className="w-5 h-5 text-blue-400" />}
          />
          <ComparisonKpiCard
            label="Cost of Sales"
            currentValue={totals.cogs}
            previousValue={prevTotals.cogs}
            format="currency"
            invertColors
            icon={<TrendingDown className="w-5 h-5 text-red-400" />}
          />
          <ComparisonKpiCard
            label="Gross Profit"
            currentValue={totals.grossProfit}
            previousValue={prevTotals.grossProfit}
            format="currency"
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          />
          <ComparisonKpiCard
            label="Margin %"
            currentValue={totals.marginPercentage}
            previousValue={prevTotals.marginPercentage}
            format="percent"
            icon={<Percent className="w-5 h-5 text-purple-400" />}
          />
        </ComparisonKpiGrid>
      ) : (
        <ProfitLossKpis
          grossRevenue={totals.grossRevenue}
          cogs={totals.cogs}
          grossProfit={totals.grossProfit}
          marginPercentage={totals.marginPercentage}
          formatCurrency={formatCurrency}
        />
      )}

      <ProfitLossChart
        chartData={chartData}
        chartView={chartView}
        setChartView={setChartView}
        formatCurrency={formatCurrency}
      />

      <ProfitLossTable data={data} formatCurrency={formatCurrency} />
    </div>
  );
}
