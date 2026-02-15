/**
 * ProductPerformanceCard - Shows product conversion rate and sales metrics (D3)
 */

import { TrendingUp, ShoppingCart, Target } from 'lucide-react'
import { useProductPerformance } from '@/hooks/products/useProductPerformance'

interface ProductPerformanceCardProps {
  productId: string
}

export function ProductPerformanceCard({ productId }: ProductPerformanceCardProps) {
  const { data, isLoading } = useProductPerformance(productId)

  if (isLoading) {
    return (
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-sm p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="h-8 bg-white/5 rounded w-20" />
      </div>
    )
  }

  if (!data) return null

  const convColor = data.conversionRate >= 50
    ? 'text-emerald-400'
    : data.conversionRate >= 20
      ? 'text-amber-400'
      : 'text-white/50'

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-sm shadow-2xl">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest">
          Performance (30d)
        </h3>
      </div>
      <div className="p-6 space-y-5">
        {/* Conversion Rate */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center">
            <Target size={16} className="text-[var(--color-gold)]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">
              Conversion
            </p>
            <p className={`text-xl font-bold ${convColor}`}>
              {data.conversionRate}%
            </p>
          </div>
        </div>

        {/* Units Sold */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
            <ShoppingCart size={16} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">
              Units Sold
            </p>
            <p className="text-xl font-bold text-white">
              {data.unitsSold.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-sky-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)]">
              Revenue
            </p>
            <p className="text-xl font-bold text-white">
              {Math.round(data.totalRevenue / 100) * 100 > 0
                ? `Rp ${(Math.round(data.totalRevenue / 100) * 100).toLocaleString()}`
                : '-'}
            </p>
          </div>
        </div>

        {/* Conversion explanation */}
        <p className="text-[10px] text-white/30 pt-2 border-t border-white/5">
          In {data.ordersWithProduct} of {data.totalOrders} orders
        </p>
      </div>
    </div>
  )
}
