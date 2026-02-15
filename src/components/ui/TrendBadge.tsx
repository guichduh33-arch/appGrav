import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ITrendBadgeProps {
  value: number | null | undefined
  /** If true, negative values are shown as positive (e.g., cost reduction) */
  invertColor?: boolean
  className?: string
}

/**
 * Displays a percentage change badge with color and arrow icon.
 * Green for positive changes, red for negative (or inverted).
 */
export function TrendBadge({ value, invertColor = false, className = '' }: ITrendBadgeProps) {
  if (value === null || value === undefined || !isFinite(value)) return null

  const isPositive = value > 0
  const isNeutral = value === 0
  const displayPositive = invertColor ? !isPositive : isPositive

  const colorClass = isNeutral
    ? 'text-white/40 bg-white/5'
    : displayPositive
      ? 'text-emerald-400 bg-emerald-400/10'
      : 'text-red-400 bg-red-400/10'

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${colorClass} ${className}`}>
      <Icon size={12} />
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}
