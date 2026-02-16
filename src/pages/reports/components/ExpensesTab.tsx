import { useMemo } from 'react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import { useExpenseSummary } from '@/hooks/expenses';
import { useExpenses } from '@/hooks/expenses';
import { ExpensesKpis } from './expenses/ExpensesKpis';
import { ExpensesCharts } from './expenses/ExpensesCharts';
import { ExpensesTable } from './expenses/ExpensesTable';

interface ExpenseRow {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  created_by: string;
}

export function ExpensesTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'thisMonth' });

  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(dateRange.from, dateRange.to);

  const { data: expenses, isLoading: expensesLoading, error } = useExpenses({
    from: dateRange.from,
    to: dateRange.to,
    status: 'approved',
  });

  const isLoading = summaryLoading || expensesLoading;

  const categoryData = useMemo(() => {
    if (!summary?.by_category) return [];
    return summary.by_category.map(c => ({
      category: c.name,
      total: c.total,
      count: c.count,
    }));
  }, [summary]);

  const dailyData = useMemo(() => {
    if (!summary?.by_day) return [];
    return summary.by_day.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      amount: d.amount,
    }));
  }, [summary]);

  const tableData: ExpenseRow[] | undefined = useMemo(() => {
    if (!expenses) return undefined;
    return expenses.map(e => ({
      id: e.id,
      expense_date: e.expense_date,
      category: e.category_name,
      description: e.description,
      amount: e.amount,
      payment_method: e.payment_method,
      created_by: e.creator_name || 'Unknown',
    }));
  }, [expenses]);

  const exportConfig: ExportConfig<ExpenseRow> = useMemo(() => ({
    data: tableData || [],
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
      { label: 'Total Expenses', value: formatCurrencyPdf(summary?.total ?? 0) },
      { label: 'Number of Expenses', value: (summary?.count ?? 0).toString() },
    ],
  }), [tableData, dateRange, summary]);

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
        <DateRangePicker defaultPreset="thisMonth" />
        <ExportButtons config={exportConfig} />
      </div>

      <ExpensesKpis
        totalAmount={summary?.total ?? 0}
        totalExpenses={summary?.count ?? 0}
        avgExpense={summary?.avg ?? 0}
        formatCurrency={formatCurrency}
      />

      <ExpensesCharts
        dailyData={dailyData}
        categoryData={categoryData}
        formatCurrency={formatCurrency}
      />

      <ExpensesTable data={tableData} formatCurrency={formatCurrency} />
    </div>
  );
}
