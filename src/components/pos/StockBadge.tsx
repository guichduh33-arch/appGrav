import { memo } from 'react'
import { TStockStatus } from '@/hooks/offline/useStockLevelsOffline'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface StockBadgeProps {
    status: TStockStatus | null
    stockQuantity?: number
    minLevel?: number
    className?: string
}

const statusConfig: Record<TStockStatus, { color: string; bgColor: string; label: string }> = {
    ok: {
        color: 'text-green-600',
        bgColor: 'bg-green-500/20',
        label: '●',
    },
    warning: {
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/20',
        label: '●',
    },
    critical: {
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        label: '●',
    },
    out_of_stock: {
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        label: '○',
    },
}

export const StockBadge = memo(function StockBadge({ status, stockQuantity, minLevel, className = '' }: StockBadgeProps) {
    if (!status) return null

    const config = statusConfig[status]
    const hasStockInfo = stockQuantity !== undefined && minLevel !== undefined

    const badge = (
        <span
            className={`
                inline-flex items-center justify-center
                w-5 h-5 rounded-full text-xs font-bold
                ${config.bgColor} ${config.color}
                ${className}
            `}
        >
            {config.label}
        </span>
    )

    if (!hasStockInfo) {
        return badge
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent side="right" className="text-sm">
                    <p>Stock: {stockQuantity} / Min: {minLevel}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
})
