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

    // Uses KDS accent orange as the transition midpoint
    const color = progress < 0.25
        ? '#22C55E'
        : progress < 0.5
            ? '#ec5b13'
            : progress < 0.75
                ? '#F97316'
                : '#EF4444'

    return (
        <div className="h-0.5 w-full bg-white/5 overflow-hidden">
            <div
                className="h-full transition-all duration-1000 ease-linear rounded-r-full"
                style={{ width: `${progress * 100}%`, backgroundColor: color }}
            />
        </div>
    )
})
