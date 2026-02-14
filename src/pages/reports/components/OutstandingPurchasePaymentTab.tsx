import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, AlertTriangle, Clock, FileText } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { supabase } from '@/lib/supabase';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import { OutstandingPaymentTable } from './purchasing/OutstandingPaymentTable';

interface OutstandingPayment {
  id: string;
  po_number: string;
  supplier_name: string;
  order_date: string;
  total: number;
  amount_paid: number;
  amount_due: number;
  days_outstanding: number;
  status: string;
  payment_status: 'unpaid' | 'partial';
  is_estimated: boolean;
}

interface PurchaseOrderQueryResult {
  id: string;
  po_number: string | null;
  order_date: string;
  total_amount: number | null;
  payment_status: string;
  status: string;
  supplier: { name: string } | { name: string }[] | null;
}

async function getOutstandingPayments(): Promise<OutstandingPayment[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      po_number,
      order_date,
      total_amount,
      payment_status,
      status,
      supplier:suppliers(name)
    `)
    .in('payment_status', ['unpaid', 'partial'])
    .order('order_date', { ascending: true });

  if (error) throw error;

  return (data || [])
    .map((po: PurchaseOrderQueryResult) => {
      const isPartial = po.payment_status === 'partial';
      const amountPaid = isPartial ? (po.total_amount || 0) * 0.5 : 0;
      const amountDue = (po.total_amount || 0) - amountPaid;
      const orderDate = new Date(po.order_date);
      const today = new Date();
      const daysOutstanding = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: po.id,
        po_number: po.po_number || '-',
        supplier_name: (Array.isArray(po.supplier) ? po.supplier[0]?.name : po.supplier?.name) || 'Unknown',
        order_date: po.order_date,
        total: po.total_amount || 0,
        amount_paid: amountPaid,
        amount_due: amountDue,
        days_outstanding: daysOutstanding,
        status: po.status,
        payment_status: po.payment_status as 'unpaid' | 'partial',
        is_estimated: isPartial,
      };
    })
    .filter((po) => po.amount_due > 0);
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
};

export function OutstandingPurchasePaymentTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['outstanding-purchase-payments'],
    queryFn: () => getOutstandingPayments(),
    staleTime: 5 * 60 * 1000,
  });

  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalOrders: 0, totalOutstanding: 0, overdueOrders: 0, avgDaysOutstanding: 0 };
    }

    const overdueOrders = data.filter((po) => po.days_outstanding > 30).length;
    const avgDays = Math.round(data.reduce((sum, po) => sum + po.days_outstanding, 0) / data.length);

    return {
      totalOrders: data.length,
      totalOutstanding: data.reduce((sum, po) => sum + po.amount_due, 0),
      overdueOrders,
      avgDaysOutstanding: avgDays,
    };
  }, [data]);

  const exportConfig: ExportConfig<OutstandingPayment> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'po_number', header: 'Order #' },
      { key: 'supplier_name', header: 'Supplier' },
      { key: 'order_date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'total', header: 'Total', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'amount_paid', header: 'Paid', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'amount_due', header: 'Due', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'days_outstanding', header: 'Days', align: 'right' as const },
    ],
    filename: 'outstanding-payments',
    title: 'Outstanding Supplier Payments',
    summaries: [
      { label: 'Total due', value: formatCurrencyPdf(summary.totalOutstanding) },
      { label: 'Overdue orders', value: summary.overdueOrders.toString() },
    ],
  }), [data, summary]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Outstanding Supplier Payments</h2>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Pending orders</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalOrders}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total due</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(summary.totalOutstanding)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Overdue (&gt;30d)</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{summary.overdueOrders}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Avg days pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{`${summary.avgDaysOutstanding}d`}</p>
        </div>
      </div>

      {/* Estimation Warning */}
      {data && data.some((po) => po.is_estimated) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Partial amounts estimated</p>
            <p className="text-sm text-amber-400/80">
              Partial payments are estimated at 50% of the total. Actual amounts will be available
              when the supplier payments module is implemented.
            </p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <OutstandingPaymentTable data={data || []} />
    </div>
  );
}
