import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
    id: string
    name: string
}

interface ProductFormData {
    sku: string
    name: string
    description: string
    category_id: string
    product_type: 'finished' | 'semi_finished' | 'raw_material'
    unit: string
}

const PRODUCT_TYPES = [
    { value: 'finished', label: 'Finished product' },
    { value: 'semi_finished', label: 'Semi-finished' },
    { value: 'raw_material', label: 'Raw material' }
]

const UNITS = ['piece', 'kg', 'g', 'L', 'mL', 'unit', 'portion', 'box', 'pouch']

const INPUT_CLASS = "py-3 px-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none transition-all focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]"
const LABEL_CLASS = "text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"
const SELECT_CLASS = "py-3 px-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none transition-all focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239CA3AF%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"

interface BasicInfoSectionProps {
    form: ProductFormData
    categories: Category[]
    errors: Record<string, string>
    onChange: (updates: Partial<ProductFormData>) => void
}

export default function BasicInfoSection({ form, categories, errors, onChange }: BasicInfoSectionProps) {
    return (
        <section className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-white/5 text-white">
                <Package size={20} className="text-[var(--color-gold)]" /> Basic information
            </h2>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-md:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>SKU *</label>
                    <input
                        type="text"
                        value={form.sku}
                        onChange={e => onChange({ sku: e.target.value.toUpperCase() })}
                        placeholder="PRD-0001"
                        className={cn(INPUT_CLASS, errors.sku && 'border-red-500/50')}
                    />
                    {errors.sku && <span className="text-red-400 text-xs mt-1">{errors.sku}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Name *</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => onChange({ name: e.target.value })}
                        placeholder="Product name"
                        className={cn(INPUT_CLASS, errors.name && 'border-red-500/50')}
                    />
                    {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name}</span>}
                </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-5">
                <label className={LABEL_CLASS}>Description</label>
                <textarea
                    value={form.description}
                    onChange={e => onChange({ description: e.target.value })}
                    placeholder="Product description..."
                    rows={3}
                    className={cn(INPUT_CLASS, "resize-none")}
                />
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mt-5 max-md:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Category</label>
                    <select
                        value={form.category_id}
                        onChange={e => onChange({ category_id: e.target.value })}
                        className={SELECT_CLASS}
                    >
                        <option value="">No category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Product Type</label>
                    <select
                        value={form.product_type}
                        onChange={e => onChange({ product_type: e.target.value as ProductFormData['product_type'] })}
                        className={SELECT_CLASS}
                    >
                        {PRODUCT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Unit *</label>
                    <select
                        value={form.unit}
                        onChange={e => onChange({ unit: e.target.value })}
                        className={cn(SELECT_CLASS, errors.unit && 'border-red-500/50')}
                    >
                        {UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    )
}
