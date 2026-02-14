import { Plus, Gift } from 'lucide-react'

interface CustomerPointsModalProps {
    action: 'add' | 'redeem'
    availablePoints: number
    pointsAmount: string
    onPointsAmountChange: (value: string) => void
    pointsDescription: string
    onPointsDescriptionChange: (value: string) => void
    onSubmit: () => void
    onClose: () => void
}

export function CustomerPointsModal({
    action,
    availablePoints,
    pointsAmount,
    onPointsAmountChange,
    pointsDescription,
    onPointsDescriptionChange,
    onSubmit,
    onClose,
}: CustomerPointsModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
            onClick={onClose}
        >
            <div
                className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl p-6 w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="flex items-center gap-2 text-xl font-display font-bold m-0 mb-5 text-white">
                    {action === 'add' ? (
                        <><Plus size={20} className="text-[var(--color-gold)]" /> Add Points</>
                    ) : (
                        <><Gift size={20} className="text-[var(--color-gold)]" /> Redeem Points</>
                    )}
                </h2>

                {action === 'redeem' && (
                    <p className="m-0 mb-5 p-3 bg-white/5 border border-white/5 rounded-xl text-sm text-[var(--muted-smoke)]">
                        Available points: <strong className="text-[var(--color-gold)]">{availablePoints.toLocaleString()}</strong>
                    </p>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">
                            Number of points
                        </label>
                        <input
                            type="number"
                            value={pointsAmount}
                            onChange={(e) => onPointsAmountChange(e.target.value)}
                            placeholder="Ex: 100"
                            min="1"
                            max={action === 'redeem' ? availablePoints : undefined}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2">
                            Description (optional)
                        </label>
                        <input
                            type="text"
                            value={pointsDescription}
                            onChange={(e) => onPointsDescriptionChange(e.target.value)}
                            placeholder="Reason for adjustment"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        className="flex-1 py-3 rounded-xl text-sm font-bold bg-transparent border border-white/10 text-white hover:border-white/20 transition-all"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 py-3 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all"
                        onClick={onSubmit}
                    >
                        {action === 'add' ? 'Add' : 'Redeem'}
                    </button>
                </div>
            </div>
        </div>
    )
}
