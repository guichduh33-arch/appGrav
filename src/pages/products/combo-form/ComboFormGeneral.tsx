import { Box, Save, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboFormGeneralProps {
    name: string
    description: string
    comboPrice: number
    sortOrder: number
    imageUrl: string
    isActive: boolean
    availableAtPos: boolean
    availableFrom: string
    availableTo: string
    onNameChange: (v: string) => void
    onDescriptionChange: (v: string) => void
    onComboPriceChange: (v: number) => void
    onSortOrderChange: (v: number) => void
    onImageUrlChange: (v: string) => void
    onIsActiveChange: (v: boolean) => void
    onAvailableAtPosChange: (v: boolean) => void
    onAvailableFromChange: (v: string) => void
    onAvailableToChange: (v: string) => void
}

const INPUT_CLASS = "w-full px-5 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none transition-all focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]"
const LABEL_CLASS = "text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"

export default function ComboFormGeneral({
    name, description, comboPrice, sortOrder, imageUrl,
    isActive, availableAtPos, availableFrom, availableTo,
    onNameChange, onDescriptionChange, onComboPriceChange,
    onSortOrderChange, onImageUrlChange, onIsActiveChange, onAvailableAtPosChange,
    onAvailableFromChange, onAvailableToChange
}: ComboFormGeneralProps) {
    return (
        <div className="bg-[var(--onyx-surface)] rounded-xl p-8 border border-white/5 shadow-sm">
            <h2 className="flex items-center gap-3 font-display text-xl font-semibold text-white m-0 mb-8 pb-4 border-b border-white/5">
                <Box size={20} className="text-[var(--color-gold)]" /> General Information
            </h2>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="name" className={LABEL_CLASS}>Combo Name *</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g., Parisian Breakfast"
                        className={INPUT_CLASS}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className={LABEL_CLASS}>Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Describe the combo..."
                        rows={4}
                        className={cn(INPUT_CLASS, "resize-none")}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                    <div className="space-y-2">
                        <label htmlFor="comboPrice" className={LABEL_CLASS}>Base Price (IDR) *</label>
                        <div className="relative">
                            <input
                                id="comboPrice"
                                type="number"
                                value={comboPrice}
                                onChange={(e) => onComboPriceChange(Number(e.target.value))}
                                min="0"
                                step="1000"
                                className={cn(INPUT_CLASS, "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                                required
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] font-bold text-xs pointer-events-none">IDR</div>
                        </div>
                        <p className="text-[0.7rem] text-[var(--theme-text-muted)] mt-1 opacity-70 italic">Surcharges from choices will be added</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="sortOrder" className={LABEL_CLASS}>Display Order</label>
                        <input
                            id="sortOrder"
                            type="number"
                            value={sortOrder}
                            onChange={(e) => onSortOrderChange(Number(e.target.value))}
                            min="0"
                            className={INPUT_CLASS}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="imageUrl" className={LABEL_CLASS}>Image URL</label>
                    <input
                        id="imageUrl"
                        type="text"
                        value={imageUrl}
                        onChange={(e) => onImageUrlChange(e.target.value)}
                        placeholder="https://example.com/combo-image.jpg"
                        className={INPUT_CLASS}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                    <div className="space-y-2">
                        <label htmlFor="availableFrom" className={LABEL_CLASS}>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={12} className="text-[var(--color-gold)]" />
                                Available From
                            </span>
                        </label>
                        <input
                            id="availableFrom"
                            type="time"
                            value={availableFrom}
                            onChange={(e) => onAvailableFromChange(e.target.value)}
                            className={cn(INPUT_CLASS, "[color-scheme:dark]")}
                        />
                        <p className="text-[0.7rem] text-[var(--theme-text-muted)] mt-1 opacity-70 italic">
                            Leave empty for all-day availability
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="availableTo" className={LABEL_CLASS}>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={12} className="text-[var(--color-gold)]" />
                                Available To
                            </span>
                        </label>
                        <input
                            id="availableTo"
                            type="time"
                            value={availableTo}
                            onChange={(e) => onAvailableToChange(e.target.value)}
                            className={cn(INPUT_CLASS, "[color-scheme:dark]")}
                        />
                    </div>
                </div>

                <div className="flex gap-10 pt-4 max-md:flex-col max-md:gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                            "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                            isActive ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-black shadow-[0_2px_8px_rgba(201,165,92,0.4)]" : "bg-transparent border-white/20 group-hover:border-white/40"
                        )}>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isActive}
                                onChange={(e) => onIsActiveChange(e.target.checked)}
                            />
                            {isActive && <Save size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-semibold text-white">Active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                            "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                            availableAtPos ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-black shadow-[0_2px_8px_rgba(201,165,92,0.4)]" : "bg-transparent border-white/20 group-hover:border-white/40"
                        )}>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={availableAtPos}
                                onChange={(e) => onAvailableAtPosChange(e.target.checked)}
                            />
                            {availableAtPos && <Box size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-semibold text-white">Show in POS</span>
                    </label>
                </div>
            </div>
        </div>
    )
}
