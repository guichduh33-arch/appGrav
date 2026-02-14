import { Tag, Crown, Percent, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ICustomerCategory } from '@/hooks/customers'

interface CustomerCategoryFormProps {
    categories: ICustomerCategory[]
    selectedCategoryId: string
    isActive: boolean
    isEditing: boolean
    customerQR: string | null
    onCategoryChange: (categoryId: string) => void
    onActiveChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function CustomerCategoryForm({
    categories,
    selectedCategoryId,
    isActive,
    isEditing,
    customerQR,
    onCategoryChange,
    onActiveChange,
}: CustomerCategoryFormProps) {
    const selectedCategory = categories.find(c => c.id === selectedCategoryId)

    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
            <h2 className="flex items-center gap-2 text-base font-display font-bold text-white mb-5 pb-3 border-b border-white/5">
                <Tag size={18} className="text-[var(--color-gold)]" />
                Category & Loyalty
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-3">
                        Customer Category
                    </label>
                    <div className="flex flex-col gap-2">
                        {categories.map(category => (
                            <div
                                key={category.id}
                                className={cn(
                                    'flex items-center gap-3 py-3.5 px-4 border border-white/10 rounded-xl cursor-pointer transition-all',
                                    'hover:border-[var(--category-color)]',
                                    selectedCategoryId === category.id && 'border-[var(--category-color)] bg-[var(--category-color)]/10'
                                )}
                                onClick={() => onCategoryChange(category.id)}
                                style={{ '--category-color': category.color } as React.CSSProperties}
                            >
                                <div
                                    className={cn(
                                        'w-4 h-4 rounded-full border-2 border-white/20 shrink-0 relative transition-all',
                                        selectedCategoryId === category.id && 'border-[var(--category-color)] bg-[var(--category-color)] after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-white'
                                    )}
                                />
                                <div className="flex-1">
                                    <span className="block font-bold text-white text-sm">{category.name}</span>
                                    <span className="block text-xs text-[var(--theme-text-muted)] mt-0.5">
                                        {category.price_modifier_type === 'retail' && 'Standard price'}
                                        {category.price_modifier_type === 'wholesale' && 'Wholesale price'}
                                        {category.price_modifier_type === 'discount_percentage' && `${category.discount_percentage}% discount`}
                                        {category.price_modifier_type === 'custom' && 'Custom price'}
                                    </span>
                                </div>
                                {category.discount_percentage && category.discount_percentage > 0 && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                                        <Percent size={10} />
                                        {category.discount_percentage}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {selectedCategory && (
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                        <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border"
                            style={{
                                color: selectedCategory.color,
                                borderColor: `${selectedCategory.color}33`,
                                backgroundColor: `${selectedCategory.color}15`,
                            }}
                        >
                            <Crown size={14} />
                            {selectedCategory.name}
                        </div>
                        {selectedCategory.description && (
                            <p className="mt-3 text-sm text-[var(--muted-smoke)]">
                                {selectedCategory.description}
                            </p>
                        )}
                    </div>
                )}

                {isEditing && customerQR && (
                    <div className="pt-5 border-t border-white/5">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                            <QrCode size={14} />
                            Loyalty QR Code
                        </h3>
                        <div className="flex gap-6 items-start max-md:flex-col max-md:items-center max-md:text-center">
                            <div className="flex flex-col items-center p-6 bg-white/[0.03] border border-dashed border-white/10 rounded-xl">
                                <QrCode size={80} className="text-white/20" />
                                <span className="mt-3 font-mono text-sm text-[var(--muted-smoke)] bg-white/5 px-3 py-1.5 rounded-lg">
                                    {customerQR}
                                </span>
                            </div>
                            <p className="flex-1 text-sm text-[var(--muted-smoke)] leading-relaxed">
                                The customer can present this QR code during purchases
                                to accumulate loyalty points.
                            </p>
                        </div>
                    </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer py-2">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={isActive}
                        onChange={onActiveChange}
                        className="w-[18px] h-[18px] accent-[var(--color-gold)] rounded"
                    />
                    <span className="text-sm text-white font-medium">Active customer</span>
                </label>
            </div>
        </div>
    )
}
