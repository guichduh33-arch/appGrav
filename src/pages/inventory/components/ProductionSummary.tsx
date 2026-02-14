// Format number with thousand separators
const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US')
}

interface ProductionSummaryProps {
    totalProduced: number
    totalWaste: number
}

export default function ProductionSummary({
    totalProduced,
    totalWaste,
}: ProductionSummaryProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-1">
                    Produced
                </p>
                <h4 className="text-4xl font-semibold text-emerald-500 tabular-nums">
                    {formatNumber(totalProduced)}
                </h4>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold mb-1">
                    Waste
                </p>
                <h4 className="text-4xl font-semibold text-rose-500 tabular-nums">
                    {formatNumber(totalWaste)}
                </h4>
            </div>
        </div>
    )
}
