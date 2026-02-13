import { memo } from 'react'

interface OrderProgressBarProps {
    elapsedSeconds: number
    maxMinutes?: number
}

export const OrderProgressBar = memo(function OrderProgressBar({
    elapsedSeconds,
    maxMinutes = 20,
}: OrderProgressBarProps) {
    const elapsedMinutes = elapsedSeconds / 60
    const progress = Math.min(elapsedMinutes / maxMinutes, 1)

    const color = progress < 0.25
        ? '#22C55E'
        : progress < 0.5
            ? '#F59E0B'
            : progress < 0.75
                ? '#F97316'
                : '#EF4444'

    return (
        <div className="h-1 w-full bg-white/10 overflow-hidden">
            <div
                className="h-full transition-all duration-1000 ease-linear rounded-r-full"
                style={{ width: `${progress * 100}%`, backgroundColor: color }}
            />
        </div>
    )
})
