import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, XCircle, Package, DollarSign } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IExpiredStockReport } from '@/types/reporting';

export function ExpiredStockTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expired-stock'],
    queryFn: () => ReportingService.getExpiredStock(),
    staleTime: 5 * 60 * 1000,
  });

  const expiryStats = useMemo(() => {
    if (!data) return { expired: 0, expiringSoon: 0, expiring: 0, totalLoss: 0 };
    const stats = { expired: 0, expiringSoon: 0, expiring: 0, totalLoss: 0 };
    data.forEach((item) => {
      if (item.expiry_status === 'expired') {
        stats.expired++;
        stats.totalLoss += item.potential_loss || 0;
      } else if (item.expiry_status === 'expiring_soon') {
        stats.expiringSoon++;
      } else if (item.expiry_status === 'expiring') {
        stats.expiring++;
      }
    });
    return stats;
  }, [data]);

  const exportConfig: ExportConfig<IExpiredStockReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'product_name', header: 'Product' },
      { key: 'category_name', header: 'Category', format: (v) => (v as string) || '-' },
      { key: 'current_stock', header: 'Stock', align: 'right' as const },
      { key: 'expiry_date', header: 'Expiry Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'days_until_expiry', header: 'Days', align: 'right' as const },
      { key: 'expiry_status', header: 'Status', format: (v) => getStatusLabel(v as string) },
      { key: 'potential_loss', header: 'Potential Loss', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
    ],
    filename: 'expired-stock',
    title: 'Expired Stock Report',
    summaries: [
      { label: 'Expired Products', value: expiryStats.expired.toString() },
      { label: 'Expiring Soon (7d)', value: expiryStats.expiringSoon.toString() },
      { label: 'Potential Loss', value: formatCurrencyPdf(expiryStats.totalLoss) },
    ],
  }), [data, expiryStats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getStatusBadge = (status: string, daysUntil: number) => {
    switch (status) {
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
            <XCircle className="w-3 h-3" />
            Expired
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full">
            <Clock className="w-3 h-3" />
            {daysUntil}d remaining
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {daysUntil}d remaining
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            OK
          </span>
        );
    }
  };

  if (error) {
    return <div className="p-8 text-center text-red-400">Error loading data</div>;
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-white">Expired / Expiring Stock</h2>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Expired</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{expiryStats.expired}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Expires in 7 days</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{expiryStats.expiringSoon}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Expires in 30 days</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{expiryStats.expiring}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Potential Loss</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(expiryStats.totalLoss)}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Products to Watch</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Category</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Stock</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Expiration</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Status</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Potential Loss</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr
                    key={row.product_id}
                    className={`border-b border-white/5 hover:bg-white/[0.02] ${row.expiry_status === 'expired' ? 'bg-red-500/[0.03]' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <Package className="w-4 h-4 text-white/40" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{row.product_name}</p>
                          {row.sku && <p className="text-xs text-white/30">{row.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">{row.category_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-white text-right font-medium">
                      {row.current_stock} {row.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {new Date(row.expiry_date).toLocaleDateString('en-US', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(row.expiry_status, row.days_until_expiry)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      <span className={row.expiry_status === 'expired' ? 'text-red-400' : 'text-white'}>
                        {formatCurrency(row.potential_loss)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--muted-smoke)]">
                    No expired or expiring products
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

function getStatusLabel(status: string): string {
  switch (status) {
    case 'expired': return 'Expired';
    case 'expiring_soon': return 'Expiring Soon';
    case 'expiring': return 'Watch';
    default: return status;
  }
}
