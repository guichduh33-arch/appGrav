import { Tag, Plus } from 'lucide-react'

interface PromotionsHeaderProps {
    onCreateNew: () => void
}

export default function PromotionsHeader({ onCreateNew }: PromotionsHeaderProps) {
    return (
        <header className="flex justify-between items-center mb-8 max-md:flex-col max-md:items-start max-md:gap-4">
            <div className="flex-col">
                <h1 className="font-display text-3xl font-semibold text-white m-0 flex items-center gap-3">
                    <Tag size={28} className="text-[var(--color-gold)]" />
                    Promotions
                </h1>
                <p className="text-[var(--theme-text-secondary)] text-sm opacity-60 mt-1">
                    Create and manage promotional offers
                </p>
            </div>
            <button
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 bg-[var(--color-gold)] text-black shadow-[0_4px_12px_rgba(201,165,92,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(201,165,92,0.35)] active:scale-[0.98]"
                onClick={onCreateNew}
            >
                <Plus size={20} />
                <span>New Promotion</span>
            </button>
        </header>
    )
}
