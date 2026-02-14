import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, ArrowLeft, Package } from 'lucide-react';
import { ReportBreadcrumb, BreadcrumbLevel } from '@/components/reports/ReportBreadcrumb';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';

interface ProductInCategory {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
  avg_price: number;
}

async function getProductsInCategory(categoryId: string, from: Date, to: Date): Promise<ProductInCategory[]> {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('order_items')
    .select(`quantity, unit_price, product:products!inner(id, name, category_id)`)
    .eq('product.category_id', categoryId)
    .gte('created_at', fromStr)
    .lte('created_at', toStr + 'T23:59:59');

  if (error) throw error;

  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of data || []) {
    const productData = item.product;
    const product = Array.isArray(productData) ? productData[0] : productData;
    if (!product) continue;
    const existing = productMap.get(product.id) || { name: product.name, qty: 0, revenue: 0 };
    existing.qty += item.quantity || 0;
    existing.revenue += (item.quantity || 0) * (item.unit_price || 0);
    productMap.set(product.id, existing);
  }

  return Array.from(productMap.entries())
    .map(([id, d]) => ({
      product_id: id, product_name: d.name, quantity_sold: d.qty,
      total_revenue: d.revenue, avg_price: d.qty > 0 ? d.revenue / d.qty : 0,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue);
}

interface Props {
  categoryId: string;
  categoryName: string;
  dateRange: { from: Date; to: Date };
  breadcrumbLevels: BreadcrumbLevel[];
  onDrillReset: () => void;
}

export function SalesByCategoryDrillDown({ categoryId, categoryName, dateRange, breadcrumbLevels, onDrillReset }: Props) {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['categoryProducts', categoryId, dateRange.from, dateRange.to],
    queryFn: () => getProductsInCategory(categoryId, dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: !!categoryId,
  });

  const categoryTotal = products.reduce((s, p) => s + p.total_revenue, 0);

  const productsExportConfig: ExportConfig<ProductInCategory> = useMemo(() => ({
    data: products,
    columns: [
      { key: 'product_name', header: 'Product' },
      { key: 'quantity_sold', header: 'Qty Sold', align: 'right' as const },
      { key: 'total_revenue', header: 'Revenue', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
      { key: 'avg_price', header: 'Avg Price', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
    ],
    filename: `category-${categoryName || 'products'}`,
    title: `Products in ${categoryName || 'Category'}`,
    dateRange: { from: dateRange.from, to: dateRange.to },
  }), [products, categoryName, dateRange]);

  return (
    <div className="space-y-6">
      <ReportBreadcrumb levels={breadcrumbLevels} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button onClick={onDrillReset} className="flex items-center gap-2 text-[var(--color-gold)] hover:text-[var(--color-gold)]/80 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </button>
        <ExportButtons config={productsExportConfig} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
          <p className="text-sm text-blue-400 font-medium">Category Revenue</p>
          <p className="text-2xl font-bold text-white">
            {productsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(categoryTotal)}
          </p>
        </div>
        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
          <p className="text-sm text-emerald-400 font-medium">Products</p>
          <p className="text-2xl font-bold text-white">
            {productsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : products.length}
          </p>
        </div>
        <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
          <p className="text-sm text-purple-400 font-medium">Total Qty Sold</p>
          <p className="text-2xl font-bold text-white">
            {productsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : products.reduce((s, p) => s + p.quantity_sold, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Products in {categoryName}</h3>
        {productsLoading ? (
          <div className="h-80 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--theme-text-muted)]" /></div>
        ) : products.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[var(--theme-text-muted)]">No products found in this category.</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, products.length * 40)}>
            <BarChart layout="vertical" data={products.slice(0, 15)} margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis type="category" dataKey="product_name" width={150} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="total_revenue" name="Revenue" fill="var(--color-gold)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Products in {categoryName}</h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-white/[0.02]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Qty Sold</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Avg Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {productsLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--theme-text-muted)]" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">No products found.</td></tr>
            ) : (
              products.map((row) => (
                <tr key={row.product_id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-[var(--theme-text-muted)]" />
                      {row.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.quantity_sold}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[var(--color-gold)] text-right">{formatCurrency(row.total_revenue)}</td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{formatCurrency(row.avg_price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
