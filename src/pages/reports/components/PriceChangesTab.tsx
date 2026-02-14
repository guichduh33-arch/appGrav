import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import { PriceChangesKpis } from './price-changes/PriceChangesKpis';
import { PriceChangesTable } from './price-changes/PriceChangesTable';

interface PriceChange {
  id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  old_retail_price: number;
  new_retail_price: number;
  old_cost_price: number;
  new_cost_price: number;
  changed_by: string;
  changed_at: string;
  reason: string | null;
}

interface AuditLogQueryResult {
  id: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
}

interface ProductQueryResult {
  id: string;
  name: string;
  sku: string | null;
}

interface UserQueryResult {
  id: string;
  name: string;
}

async function getPriceChanges(from: Date, to: Date): Promise<PriceChange[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`id, entity_id, old_values, new_values, user_id, created_at`)
    .eq('entity_type', 'product')
    .eq('action', 'price_change')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  const auditLogs = (data || []) as AuditLogQueryResult[];

  const productIds = [...new Set(auditLogs.map((d) => d.entity_id).filter(Boolean))];
  const { data: products } = productIds.length > 0
    ? await supabase.from('products').select('id, name, sku').in('id', productIds)
    : { data: [] };

  const productMap = new Map((products as ProductQueryResult[] || []).map(p => [p.id, p]));

  const userIds = [...new Set(auditLogs.map((d) => d.user_id).filter(Boolean))] as string[];
  const { data: users } = userIds.length > 0
    ? await supabase.from('user_profiles').select('id, name').in('id', userIds)
    : { data: [] };

  const userMap = new Map((users as UserQueryResult[] || []).map(u => [u.id, u.name]));

  return auditLogs.map((d) => {
    const product = productMap.get(d.entity_id);
    const oldVal = d.old_values || {};
    const newVal = d.new_values || {};
    return {
      id: d.id,
      product_id: d.entity_id,
      product_name: product?.name || 'Unknown Product',
      sku: product?.sku || null,
      old_retail_price: (oldVal.retail_price as number) || 0,
      new_retail_price: (newVal.retail_price as number) || 0,
      old_cost_price: (oldVal.cost_price as number) || 0,
      new_cost_price: (newVal.cost_price as number) || 0,
      changed_by: userMap.get(d.user_id || '') || 'Unknown',
      changed_at: d.created_at,
      reason: null,
    };
  });
}

export function PriceChangesTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['price-changes', dateRange.from, dateRange.to],
    queryFn: () => getPriceChanges(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const summary = useMemo(() => {
    if (!data || data.length === 0) return { totalChanges: 0, priceIncreases: 0, priceDecreases: 0 };
    let increases = 0;
    let decreases = 0;
    data.forEach((d) => {
      if (d.new_retail_price > d.old_retail_price) increases++;
      else if (d.new_retail_price < d.old_retail_price) decreases++;
    });
    return { totalChanges: data.length, priceIncreases: increases, priceDecreases: decreases };
  }, [data]);

  const exportConfig: ExportConfig<PriceChange> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'product_name', header: 'Product' },
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'old_retail_price', header: 'Old Price', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'new_retail_price', header: 'New Price', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'changed_by', header: 'Modified By' },
      { key: 'changed_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'reason', header: 'Reason', format: (v) => (v as string) || '-' },
    ],
    filename: 'price-changes',
    title: 'Price Change History',
    dateRange,
    summaries: [
      { label: 'Total Changes', value: summary.totalChanges.toString() },
      { label: 'Increases', value: summary.priceIncreases.toString() },
      { label: 'Decreases', value: summary.priceDecreases.toString() },
    ],
  }), [data, dateRange, summary]);

  if (error) {
    return <div className="p-8 text-center text-red-400">Error loading data</div>;
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <PriceChangesKpis
        totalChanges={summary.totalChanges}
        priceIncreases={summary.priceIncreases}
        priceDecreases={summary.priceDecreases}
      />

      <PriceChangesTable data={data} formatCurrency={formatCurrency} />
    </div>
  );
}
