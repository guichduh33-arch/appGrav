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
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[0.85rem]">
                    <X size={16} />
                    {formError}
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-500 [&>svg]:text-slate-400">
                    <User size={16} />
                    Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Customer name"
                    autoFocus
                    className="px-4 py-3 border-2 border-slate-200 rounded-lg text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-500 [&>svg]:text-slate-400">
                    <Phone size={16} />
                    Phone
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 345 6789"
                    className="px-4 py-3 border-2 border-slate-200 rounded-lg text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-500 [&>svg]:text-slate-400">
                    <Mail size={16} />
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="px-4 py-3 border-2 border-slate-200 rounded-lg text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-500 [&>svg]:text-slate-400">
                    <Crown size={16} />
                    Category
                </label>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2 border-2 border-slate-200 bg-slate-50 rounded-lg text-[0.8rem] font-medium text-slate-500 cursor-pointer transition-all duration-200',
                            'hover:border-slate-300 hover:bg-slate-100',
                            !categoryId && 'border-indigo-500 bg-indigo-500 text-white'
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
                                'flex items-center gap-1.5 px-3 py-2 border-2 border-slate-200 bg-slate-50 rounded-lg text-[0.8rem] font-medium text-slate-500 cursor-pointer transition-all duration-200',
                                'hover:border-slate-300 hover:bg-slate-100',
                                categoryId === cat.id && 'text-white'
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
                className="mt-2 p-4 text-base justify-center inline-flex items-center gap-2 rounded-lg font-medium cursor-pointer border-none transition-all duration-200 text-white bg-gradient-to-br from-emerald-500 to-emerald-600 hover:not-disabled:bg-gradient-to-br hover:not-disabled:from-emerald-600 hover:not-disabled:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCreate}
                disabled={saving || !name.trim()}
            >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save and Select'}
            </button>
        </div>
    )
}
