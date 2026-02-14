import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import { ExpensesKpis } from './expenses/ExpensesKpis';
import { ExpensesCharts } from './expenses/ExpensesCharts';
import { ExpensesTable } from './expenses/ExpensesTable';

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  created_by: string;
}

// Note: expenses table doesn't exist yet - this is a placeholder
async function getExpenses(_from: Date, _to: Date): Promise<Expense[]> {
  return [];
}

export function ExpensesTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'thisMonth' });

  // Feature not yet available - expenses table doesn't exist
  const isFeatureAvailable = false;

  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', dateRange.from, dateRange.to],
    queryFn: () => getExpenses(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: isFeatureAvailable,
  });

  const categoryData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const categoryMap = new Map<string, { total: number; count: number }>();
    data.forEach((d) => {
      const existing = categoryMap.get(d.category) || { total: 0, count: 0 };
      categoryMap.set(d.category, { total: existing.total + d.amount, count: existing.count + 1 });
    });
    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({ category, total: stats.total, count: stats.count }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const dailyData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const dayMap = new Map<string, number>();
    data.forEach((d) => {
      const date = d.expense_date.split('T')[0];
      dayMap.set(date, (dayMap.get(date) || 0) + d.amount);
    });
    return Array.from(dayMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        amount,
      }));
  }, [data]);

  const summary = useMemo(() => {
    if (!data || data.length === 0) return { totalExpenses: 0, totalAmount: 0, avgExpense: 0 };
    const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);
    return { totalExpenses: data.length, totalAmount, avgExpense: totalAmount / data.length };
  }, [data]);

  const exportConfig: ExportConfig<Expense> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'expense_date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'category', header: 'Category' },
      { key: 'description', header: 'Description' },
      { key: 'amount', header: 'Amount', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'payment_method', header: 'Payment Method' },
      { key: 'created_by', header: 'Created By' },
    ],
    filename: 'expenses',
    title: 'Expenses Report',
    dateRange,
    summaries: [
      { label: 'Total Expenses', value: formatCurrencyPdf(summary.totalAmount) },
      { label: 'Number of Expenses', value: summary.totalExpenses.toString() },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return <div className="p-8 text-center text-red-400">Error loading data</div>;
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  // Show feature not available message
  if (!isFeatureAvailable) {
    return (
      <div className="space-y-6">
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-500/10 rounded-full">
              <Receipt className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Expenses Module - Coming Soon
          </h3>
          <p className="text-[var(--theme-text-muted)]">
            Expense tracking will be available in an upcoming version. This feature will allow you to manage and track all operational expenses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="thisMonth" />
        <ExportButtons config={exportConfig} />
      </div>

      <ExpensesKpis
        totalAmount={summary.totalAmount}
        totalExpenses={summary.totalExpenses}
        avgExpense={summary.avgExpense}
        formatCurrency={formatCurrency}
      />

      <ExpensesCharts
        dailyData={dailyData}
        categoryData={categoryData}
        formatCurrency={formatCurrency}
      />

      <ExpensesTable data={data} formatCurrency={formatCurrency} />
    </div>
  );
}
