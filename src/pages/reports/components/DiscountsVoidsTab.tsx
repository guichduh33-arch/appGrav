import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import { DiscountsVoidsKpis } from './discounts-voids/DiscountsVoidsKpis';
import { DiscountsVoidsChart } from './discounts-voids/DiscountsVoidsChart';
import { DiscountsVoidsTable } from './discounts-voids/DiscountsVoidsTable';

interface DiscountVoidEntry {
  id: string;
  created_at: string;
  order_number: string;
  type: 'discount' | 'void' | 'refund';
  amount: number;
  reason: string | null;
  staff_name: string | null;
}

interface DailyData {
  date: string;
  discounts: number;
  voids: number;
  refunds: number;
}

async function getDiscountsVoids(from: Date, to: Date): Promise<DiscountVoidEntry[]> {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      order_number,
      status,
      discount_amount,
      refund_amount,
      total,
      user_profiles:user_id(full_name)
    `)
    .gte('created_at', fromStr)
    .lte('created_at', toStr + 'T23:59:59')
    .or('discount_amount.gt.0,status.eq.cancelled,refund_amount.gt.0')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const entries: DiscountVoidEntry[] = [];

  for (const order of data || []) {
    const staffName = Array.isArray(order.user_profiles)
      ? order.user_profiles[0]?.full_name
      : (order.user_profiles as { full_name: string } | null)?.full_name;

    if (order.discount_amount && order.discount_amount > 0) {
      entries.push({
        id: `${order.id}-discount`,
        created_at: order.created_at,
        order_number: order.order_number || order.id.slice(0, 8),
        type: 'discount',
        amount: order.discount_amount,
        reason: 'Discount applied',
        staff_name: staffName || null,
      });
    }

    if (order.status === 'cancelled') {
      entries.push({
        id: `${order.id}-void`,
        created_at: order.created_at,
        order_number: order.order_number || order.id.slice(0, 8),
        type: 'void',
        amount: order.total || 0,
        reason: 'Order cancelled',
        staff_name: staffName || null,
      });
    }

    if (order.refund_amount && order.refund_amount > 0) {
      entries.push({
        id: `${order.id}-refund`,
        created_at: order.created_at,
        order_number: order.order_number || order.id.slice(0, 8),
        type: 'refund',
        amount: order.refund_amount,
        reason: 'Refund processed',
        staff_name: staffName || null,
      });
    }
  }

  return entries;
}

export function DiscountsVoidsTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['discounts-voids', dateRange.from, dateRange.to],
    queryFn: () => getDiscountsVoids(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(
      (e) =>
        e.order_number.toLowerCase().includes(term) ||
        e.staff_name?.toLowerCase().includes(term) ||
        e.reason?.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

  const kpis = useMemo(() => {
    const totalDiscounts = filteredData
      .filter((e) => e.type === 'discount')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalVoids = filteredData
      .filter((e) => e.type === 'void')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalRefunds = filteredData
      .filter((e) => e.type === 'refund')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalLoss = totalDiscounts + totalVoids + totalRefunds;

    return {
      totalDiscounts,
      totalVoids,
      totalRefunds,
      totalLoss,
      discountCount: filteredData.filter((e) => e.type === 'discount').length,
      voidCount: filteredData.filter((e) => e.type === 'void').length,
      refundCount: filteredData.filter((e) => e.type === 'refund').length,
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    const dayMap: Record<string, DailyData> = {};
    for (const entry of entries) {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      });
      if (!dayMap[date]) {
        dayMap[date] = { date, discounts: 0, voids: 0, refunds: 0 };
      }
      if (entry.type === 'discount') dayMap[date].discounts += entry.amount;
      else if (entry.type === 'void') dayMap[date].voids += entry.amount;
      else if (entry.type === 'refund') dayMap[date].refunds += entry.amount;
    }
    return Object.values(dayMap).sort((a, b) => {
      const dateA = new Date(a.date.split(' ').reverse().join(' '));
      const dateB = new Date(b.date.split(' ').reverse().join(' '));
      return dateA.getTime() - dateB.getTime();
    });
  }, [entries]);

  const exportConfig: ExportConfig<DiscountVoidEntry> = useMemo(() => ({
    data: filteredData,
    columns: [
      { key: 'created_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'order_number', header: 'Order' },
      { key: 'type', header: 'Type', format: (v) => v === 'discount' ? 'Discount' : v === 'void' ? 'Void' : 'Refund' },
      { key: 'amount', header: 'Amount', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'reason', header: 'Reason' },
      { key: 'staff_name', header: 'Staff' },
    ],
    filename: 'discounts-voids',
    title: 'Discounts & Voids Report',
    dateRange,
    summaries: [
      { label: 'Total Discounts', value: formatCurrencyPdf(kpis.totalDiscounts) },
      { label: 'Total Voids', value: formatCurrencyPdf(kpis.totalVoids) },
      { label: 'Total Refunds', value: formatCurrencyPdf(kpis.totalRefunds) },
    ],
  }), [filteredData, dateRange, kpis]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <DiscountsVoidsKpis {...kpis} formatCurrency={formatCurrency} />

      <DiscountsVoidsChart chartData={chartData} formatCurrency={formatCurrency} />

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Search order, staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          />
        </div>
      </div>

      <DiscountsVoidsTable data={filteredData} formatCurrency={formatCurrency} />
    </div>
  );
}
