import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Users, AlertTriangle, Clock, Building2, Phone } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IB2BReceivablesReport } from '@/types/reporting';

export function B2BReceivablesTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['b2b-receivables'],
    queryFn: () => ReportingService.getB2BReceivables(),
    staleTime: 5 * 60 * 1000,
  });

  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalCustomers: 0, totalOutstanding: 0, overdueCustomers: 0, avgDaysOverdue: 0 };
    }

    const customersWithDebt = data.filter((c) => c.outstanding_amount > 0);
    const overdueCustomers = customersWithDebt.filter((c) => c.days_overdue > 30);

    return {
      totalCustomers: customersWithDebt.length,
      totalOutstanding: customersWithDebt.reduce((sum, c) => sum + c.outstanding_amount, 0),
      overdueCustomers: overdueCustomers.length,
      avgDaysOverdue: customersWithDebt.length > 0
        ? Math.round(customersWithDebt.reduce((sum, c) => sum + c.days_overdue, 0) / customersWithDebt.length)
        : 0,
    };
  }, [data]);

  const exportConfig: ExportConfig<IB2BReceivablesReport> = useMemo(() => ({
    data: data?.filter((c) => c.outstanding_amount > 0) || [],
    columns: [
      { key: 'customer_name', header: 'Client' },
      { key: 'company_name', header: 'Company', format: (v) => (v as string) || '-' },
      { key: 'phone', header: 'Phone', format: (v) => (v as string) || '-' },
      { key: 'credit_limit', header: 'Credit Limit', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'outstanding_amount', header: 'Outstanding', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'unpaid_order_count', header: 'Invoices', align: 'right' as const },
      { key: 'days_overdue', header: 'Days Overdue', align: 'right' as const },
    ],
    filename: 'b2b-receivables',
    title: 'B2B Receivables',
    summaries: [
      { label: 'Clients with Balance', value: summary.totalCustomers.toString() },
      { label: 'Total Outstanding', value: formatCurrencyPdf(summary.totalOutstanding) },
      { label: 'Overdue Clients', value: summary.overdueCustomers.toString() },
    ],
  }), [data, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getOverdueBadge = (days: number) => {
    if (days <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
          Current
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <Clock className="w-3 h-3" />
          {days}d
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" />
          {days}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertTriangle className="w-3 h-3" />
        {days}d
      </span>
    );
  };

  const getCreditUsage = (outstanding: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(100, (outstanding / limit) * 100);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading data
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  const customersWithDebt = data?.filter((c) => c.outstanding_amount > 0) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">B2B Receivables</h2>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Clients with Balance</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalCustomers}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(summary.totalOutstanding)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Overdue Clients (&gt;30d)</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{summary.overdueCustomers}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Avg. Days Overdue</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{`${summary.avgDaysOverdue}d`}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">B2B Clients with Outstanding Balance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Client</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Contact</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Credit Limit</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Outstanding</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Usage</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Invoices</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {customersWithDebt.length > 0 ? (
                customersWithDebt.map((row) => {
                  const usage = getCreditUsage(row.outstanding_amount, row.credit_limit);
                  return (
                    <tr key={row.customer_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Building2 className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{row.customer_name}</p>
                            {row.company_name && (
                              <p className="text-xs text-[var(--theme-text-muted)]">{row.company_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {row.phone && (
                          <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                            <Phone className="w-3 h-3" />
                            {row.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">
                        {formatCurrency(row.credit_limit)}
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-400 text-right font-medium">
                        {formatCurrency(row.outstanding_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                usage >= 90 ? 'bg-red-500' : usage >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${usage}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--theme-text-muted)] w-10">{usage.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white text-right">{row.unpaid_order_count}</td>
                      <td className="px-6 py-4 text-center">
                        {getOverdueBadge(row.days_overdue)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                    No B2B client outstanding balance
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
