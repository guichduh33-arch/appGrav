import { Crown, QrCode, Plus, Gift } from 'lucide-react'

const TIER_CONFIG: Record<string, { gradient: string }> = {
    bronze: { gradient: 'linear-gradient(135deg, #cd7f32 0%, #a66829 100%)' },
    silver: { gradient: 'linear-gradient(135deg, #c0c0c0 0%, #8e8e8e 100%)' },
    gold: { gradient: 'linear-gradient(135deg, #ffd700 0%, #d4a800 100%)' },
    platinum: { gradient: 'linear-gradient(135deg, #e5e4e2 0%, #b8b8b8 100%)' },
}

interface CustomerLoyaltyCardProps {
    loyaltyTier: string
    membershipNumber?: string | null
    loyaltyPoints: number
    lifetimePoints: number
    nextTier: { name: string; min_lifetime_points: number } | null
    progressPercent: number
    onAddPoints: () => void
    onRedeemPoints: () => void
}

export function CustomerLoyaltyCard({
    loyaltyTier,
    membershipNumber,
    loyaltyPoints,
    lifetimePoints,
    nextTier,
    progressPercent,
    onAddPoints,
    onRedeemPoints,
}: CustomerLoyaltyCardProps) {
    const tierConfig = TIER_CONFIG[loyaltyTier] || TIER_CONFIG.bronze

    return (
        <div
            className="rounded-2xl p-6 text-white mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10"
            style={{ background: tierConfig.gradient }}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 text-xl font-display font-bold uppercase tracking-wide">
                    <Crown size={24} />
                    <span>{loyaltyTier.toUpperCase()}</span>
                </div>
                {membershipNumber && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-lg text-sm font-mono border border-white/10">
                        <QrCode size={14} />
                        {membershipNumber}
                    </div>
                )}
            </div>

            <div className="flex gap-12 mb-6 max-md:flex-col max-md:gap-4">
                <div className="flex flex-col">
                    <span className="text-[2rem] font-extrabold leading-none">{loyaltyPoints.toLocaleString()}</span>
                    <span className="text-sm opacity-80 mt-1">Available points</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[2rem] font-extrabold leading-none">{lifetimePoints.toLocaleString()}</span>
                    <span className="text-sm opacity-80 mt-1">Lifetime points</span>
                </div>
            </div>

            {nextTier && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2 opacity-80">
                        <span>Next tier: {nextTier.name}</span>
                        <span>{nextTier.min_lifetime_points - lifetimePoints} pts remaining</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-[width] duration-300 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-3 max-md:flex-col">
                <button
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-bold cursor-pointer transition-all hover:bg-black/30"
                    onClick={onAddPoints}
                >
                    <Plus size={16} />
                    Add points
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-bold cursor-pointer transition-all hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onRedeemPoints}
                    disabled={loyaltyPoints <= 0}
                >
                    <Gift size={16} />
                    Redeem points
                </button>
            </div>
        </div>
    )
}
