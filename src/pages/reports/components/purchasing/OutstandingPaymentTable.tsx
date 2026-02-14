import { Building2, Calendar, AlertTriangle, Clock } from 'lucide-react';

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
}

function getDaysBadge(days: number) {
  if (days > 60) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertTriangle className="w-3 h-3" />
        {days}d
      </span>
    );
  }
  if (days > 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3 h-3" />
        {days}d
      </span>
    );
  }
  if (days > 14) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-white/5 text-[var(--theme-text-muted)] border border-white/10">
      {days}d
    </span>
  );
}

interface OutstandingPaymentTableProps {
  data: OutstandingPayment[];
}

export function OutstandingPaymentTable({ data }: OutstandingPaymentTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Orders with pending payment</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Order #</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Supplier</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Total</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Paid</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Due</th>
              <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Pending</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{row.po_number}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--theme-text-muted)]" />
                      <span className="text-sm text-white">{row.supplier_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(row.order_date).toLocaleDateString('en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">
                    {formatCurrency(row.total)}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-400 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {formatCurrency(row.amount_paid)}
                      {row.is_estimated && (
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full cursor-help"
                          title="Amount estimated at 50% - actual partial payments are not yet tracked in the system"
                        >
                          ~
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-400 text-right font-medium">
                    {formatCurrency(row.amount_due)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getDaysBadge(row.days_outstanding)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                  No pending payments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
