import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ComparisonToggle } from '@/components/reports/ComparisonToggle';
import { ComparisonKpiCard, ComparisonKpiGrid } from '@/components/reports/ComparisonKpiCard';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IProfitLossReport } from '@/types/reporting';

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

  // Comparison period data
  const { data: comparisonPLData } = useQuery({
    queryKey: ['profit-loss-comparison', comparisonRange?.from, comparisonRange?.to],
    queryFn: () => ReportingService.getProfitLoss(comparisonRange!.from, comparisonRange!.to),
    staleTime: 5 * 60 * 1000,
    enabled: isComparisonEnabled && !!comparisonRange,
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        grossRevenue: 0,
        cogs: 0,
        grossProfit: 0,
        marginPercentage: 0,
        taxCollected: 0,
        totalDiscounts: 0,
      };
    }

    const grossRevenue = data.reduce((sum, d) => sum + (d.gross_revenue || 0), 0);
    const cogs = data.reduce((sum, d) => sum + (d.cogs || 0), 0);
    const grossProfit = data.reduce((sum, d) => sum + (d.gross_profit || 0), 0);
    const taxCollected = data.reduce((sum, d) => sum + (d.tax_collected || 0), 0);
    const totalDiscounts = data.reduce((sum, d) => sum + (d.total_discounts || 0), 0);
    const marginPercentage = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    return { grossRevenue, cogs, grossProfit, marginPercentage, taxCollected, totalDiscounts };
  }, [data]);

  // Comparison period totals
  const prevTotals = useMemo(() => {
    if (!comparisonPLData || comparisonPLData.length === 0 || !isComparisonEnabled) return null;
    const grossRevenue = comparisonPLData.reduce((sum, d) => sum + (d.gross_revenue || 0), 0);
    const cogs = comparisonPLData.reduce((sum, d) => sum + (d.cogs || 0), 0);
    const grossProfit = comparisonPLData.reduce((sum, d) => sum + (d.gross_profit || 0), 0);
    const marginPercentage = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    return { grossRevenue, cogs, grossProfit, marginPercentage };
  }, [comparisonPLData, isComparisonEnabled]);

  // Format for chart
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

  // Export config
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
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Summary Cards */}
      {isComparisonEnabled && prevTotals ? (
        <ComparisonKpiGrid columns={4}>
          <ComparisonKpiCard
            label="Gross Revenue"
            currentValue={totals.grossRevenue}
            previousValue={prevTotals.grossRevenue}
            format="currency"
            icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          />
          <ComparisonKpiCard
            label="Cost of Sales"
            currentValue={totals.cogs}
            previousValue={prevTotals.cogs}
            format="currency"
            invertColors
            icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          />
          <ComparisonKpiCard
            label="Gross Profit"
            currentValue={totals.grossProfit}
            previousValue={prevTotals.grossProfit}
            format="currency"
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          />
          <ComparisonKpiCard
            label="Margin %"
            currentValue={totals.marginPercentage}
            previousValue={prevTotals.marginPercentage}
            format="percent"
            icon={<Percent className="w-5 h-5 text-purple-600" />}
          />
        </ComparisonKpiGrid>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Gross Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totals.grossRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-600">Cost of Sales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totals.cogs)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Gross Profit</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.grossProfit)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Margin %</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {`${totals.marginPercentage.toFixed(1)}%`}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profit/Loss Trend</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chartView === 'bar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setChartView('line')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chartView === 'line' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Line
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            {chartView === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value as number), name === 'revenue' ? 'Revenue' : name === 'cogs' ? 'Cost' : 'Profit']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Gross Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cogs" name="Cost" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value as number), name === 'revenue' ? 'Revenue' : name === 'cogs' ? 'Cost' : 'Profit']}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cogs" name="Cost" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Profit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin %</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No data
                  </td>
                </tr>
              ) : (
                data?.map((row) => (
                  <tr key={row.report_date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(row.report_date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.order_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(row.gross_revenue)}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(row.cogs)}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">{formatCurrency(row.gross_profit)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        row.margin_percentage >= 30 ? 'bg-green-100 text-green-800' :
                        row.margin_percentage >= 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row.margin_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(row.tax_collected || 0)}</td>
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
