export type TStockLevel = 'ok' | 'low' | 'critical' | 'out'

interface IStockStatusBadgeProps {
  /** Direct stock level override (skips threshold calculation) */
  status?: TStockLevel
  /** Current stock quantity (used with thresholds if status not provided) */
  currentStock?: number
  /** Threshold for low stock warning (default: 10) */
  lowThreshold?: number
  /** Threshold for critical/out of stock (default: 5) */
  criticalThreshold?: number
  /** Show label text alongside dot (default: true) */
  showLabel?: boolean
  className?: string
}

const STOCK_CONFIG: Record<TStockLevel, { dot: string; text: string; label: string }> = {
  ok: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'In Stock' },
  low: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Low Stock' },
  critical: { dot: 'bg-red-400', text: 'text-red-400', label: 'Critical' },
  out: { dot: 'bg-red-500', text: 'text-red-500', label: 'Out of Stock' },
}

function getStockLevel(stock: number, low: number, critical: number): TStockLevel {
  if (stock <= 0) return 'out'
  if (stock < critical) return 'critical'
  if (stock < low) return 'low'
  return 'ok'
}

export function StockStatusBadge({
  status,
  currentStock = 0,
  lowThreshold = 10,
  criticalThreshold = 5,
  showLabel = true,
  className = '',
}: IStockStatusBadgeProps) {
  const level = status ?? getStockLevel(currentStock, lowThreshold, criticalThreshold)
  const config = STOCK_CONFIG[level]

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${level === 'out' ? 'animate-pulse' : ''}`} />
      {showLabel && (
        <span className={`text-[11px] font-medium ${config.text}`}>{config.label}</span>
      )}
    </span>
  )
}
