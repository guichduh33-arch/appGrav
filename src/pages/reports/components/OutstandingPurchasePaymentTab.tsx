import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, AlertTriangle, Clock, Building2, Calendar, FileText } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { supabase } from '@/lib/supabase';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

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
  is_estimated: boolean; // True when amount_paid is estimated (partial payments)
}

// Type for Supabase query result (supplier can be array or object due to relation)
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
      // POST-LAUNCH: Replace with actual amount_paid from po_payments table when supplier payments module is built
      // Currently estimating 50% for partial payments - this is INACCURATE
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
        is_estimated: isPartial, // Mark partial payments as estimated
      };
    })
    .filter((po) => po.amount_due > 0);
}

export function OutstandingPurchasePaymentTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['outstanding-purchase-payments'],
    queryFn: () => getOutstandingPayments(),
    staleTime: 5 * 60 * 1000,
  });

  // Summary stats
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

  // Export config
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getDaysBadge = (days: number) => {
    if (days > 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          {days}d
        </span>
      );
    }
    if (days > 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          <Clock className="w-3 h-3" />
          {days}d
        </span>
      );
    }
    if (days > 14) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          {days}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
        {days}d
      </span>
    );
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
        <h2 className="text-lg font-semibold text-gray-900">Outstanding Supplier Payments</h2>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Pending orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Total due</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(summary.totalOutstanding)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Overdue (&gt;30d)</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.overdueOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Avg days pending</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {`${summary.avgDaysOutstanding}d`}
          </p>
        </div>
      </div>

      {/* Estimation Warning */}
      {data && data.some((po) => po.is_estimated) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Partial amounts estimated</p>
            <p className="text-sm text-amber-700">
              Partial payments are estimated at 50% of the total. Actual amounts will be available
              when the supplier payments module is implemented.
            </p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Orders with pending payment</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.po_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{row.supplier_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(row.order_date).toLocaleDateString('en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {formatCurrency(row.amount_paid)}
                        {row.is_estimated && (
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 text-xs text-amber-700 bg-amber-100 rounded-full cursor-help"
                            title="Amount estimated at 50% - actual partial payments are not yet tracked in the system"
                          >
                            ~
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-600 text-right font-medium">
                      {formatCurrency(row.amount_due)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getDaysBadge(row.days_outstanding)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No pending payments
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
