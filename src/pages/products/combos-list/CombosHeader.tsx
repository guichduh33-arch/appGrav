import { Box, Plus } from 'lucide-react'

interface CombosHeaderProps {
    onCreateNew: () => void
}

export default function CombosHeader({ onCreateNew }: CombosHeaderProps) {
    return (
        <header className="flex justify-between items-start mb-8 gap-4 flex-wrap max-md:flex-col">
            <div className="flex-1">
                <h1 className="flex items-center gap-3 font-display text-[2.5rem] font-semibold text-white m-0 mb-2 max-md:text-3xl">
                    <Box size={32} className="text-[var(--color-gold)]" />
                    Combo Management
                </h1>
                <p className="text-[var(--theme-text-secondary)] text-lg opacity-80 max-w-2xl">
                    Create artisan bundles and curated sets at premium value
                </p>
            </div>
            <button
                className="inline-flex items-center gap-2 py-3 px-8 rounded-xl font-body text-sm font-bold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-[var(--color-gold)] text-black shadow-[0_4px_12px_rgba(201,165,92,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(201,165,92,0.35)] shrink-0 active:scale-[0.98]"
                onClick={onCreateNew}
            >
                <Plus size={20} />
                Create New Combo
            </button>
        </header>
    )
}
