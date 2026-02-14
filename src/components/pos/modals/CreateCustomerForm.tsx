import { useState } from 'react'
import { X, User, Crown, Building2, UserCheck, Phone, Mail, Save } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { ICustomerCategory, ICustomerSearchCustomer } from './customerSearchTypes'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'

interface CreateCustomerFormProps {
    categories: ICustomerCategory[]
    onCustomerCreated: (customer: ICustomerSearchCustomer) => void
}

export default function CreateCustomerForm({
    categories,
    onCustomerCreated,
}: CreateCustomerFormProps) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [categoryId, setCategoryId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    const handleCreate = async () => {
        if (!name.trim()) {
            setFormError('Name is required')
            return
        }

        setSaving(true)
        setFormError('')

        try {
            const { data, error } = await supabase
                .from('customers')
                .insert({
                    name: name.trim(),
                    phone: phone.trim() || null,
                    email: email.trim() || null,
                    category_id: categoryId,
                    customer_type: 'retail',
                    is_active: true,
                    loyalty_points: 0,
                    loyalty_tier: 'bronze',
                    total_spent: 0,
                    visit_count: 0
                })
                .select(`
                    *,
                    category:customer_categories(name, slug, color, price_modifier_type, discount_percentage)
                `)
                .returns<ICustomerSearchCustomer>()
                .single()

            if (error) throw error

            onCustomerCreated(data)
        } catch (error: unknown) {
            logError('Error creating customer:', error)
            if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
                setFormError('A customer with this phone or email already exists')
            } else {
                setFormError('Error creating customer')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-4 py-2 overflow-y-auto flex-1 min-h-0">
            {formError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[0.85rem]">
                    <X size={16} />
                    {formError}
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--theme-text-secondary)] [&>svg]:text-[var(--theme-text-muted)]">
                    <User size={16} />
                    Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Customer name"
                    autoFocus
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--theme-text-muted)]"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--theme-text-secondary)] [&>svg]:text-[var(--theme-text-muted)]">
                    <Phone size={16} />
                    Phone
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 345 6789"
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--theme-text-muted)]"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--theme-text-secondary)] [&>svg]:text-[var(--theme-text-muted)]">
                    <Mail size={16} />
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--theme-text-muted)]"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--theme-text-secondary)] [&>svg]:text-[var(--theme-text-muted)]">
                    <Crown size={16} />
                    Category
                </label>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2 border-2 rounded-lg text-[0.8rem] font-medium cursor-pointer transition-all duration-200',
                            'hover:border-white/20 hover:bg-[var(--theme-bg-tertiary)]',
                            !categoryId
                                ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black'
                                : 'border-white/10 bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]'
                        )}
                        onClick={() => setCategoryId(null)}
                    >
                        <User size={14} />
                        Standard
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-2 border-2 rounded-lg text-[0.8rem] font-medium cursor-pointer transition-all duration-200',
                                'hover:border-white/20 hover:bg-[var(--theme-bg-tertiary)]',
                                categoryId === cat.id
                                    ? 'text-white'
                                    : 'border-white/10 bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]'
                            )}
                            style={categoryId === cat.id ? {
                                borderColor: cat.color ?? undefined,
                                backgroundColor: cat.color ?? undefined,
                            } : {
                                '--category-color': cat.color ?? undefined
                            } as React.CSSProperties}
                            onClick={() => setCategoryId(cat.id)}
                        >
                            {cat.slug === 'wholesale' && <Building2 size={14} />}
                            {cat.slug === 'vip' && <Crown size={14} />}
                            {cat.slug === 'staff' && <UserCheck size={14} />}
                            {!['wholesale', 'vip', 'staff'].includes(cat.slug) && <User size={14} />}
                            {cat.name}
                            {cat.discount_percentage && cat.discount_percentage > 0 && (
                                <span className="px-1.5 py-0.5 bg-white/20 rounded text-[0.7rem] font-semibold">-{cat.discount_percentage}%</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="mt-2 p-4 text-base justify-center inline-flex items-center gap-2 rounded-xl font-bold cursor-pointer border-none transition-all duration-200 text-black bg-[var(--color-gold)] hover:not-disabled:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCreate}
                disabled={saving || !name.trim()}
            >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save and Select'}
            </button>
        </div>
    )
}
