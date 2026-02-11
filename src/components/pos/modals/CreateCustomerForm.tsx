import { useState } from 'react'
import { X, User, Crown, Building2, UserCheck, Phone, Mail, Save } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { ICustomerCategory, ICustomerSearchCustomer } from './customerSearchTypes'

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
                .single()

            if (error) throw error

            onCustomerCreated(data as unknown as ICustomerSearchCustomer)
        } catch (error: unknown) {
            console.error('Error creating customer:', error)
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
        <div className="create-customer-form">
            {formError && (
                <div className="form-error">
                    <X size={16} />
                    {formError}
                </div>
            )}

            <div className="form-group">
                <label>
                    <User size={16} />
                    Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Customer name"
                    autoFocus
                />
            </div>

            <div className="form-group">
                <label>
                    <Phone size={16} />
                    Phone
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 345 6789"
                />
            </div>

            <div className="form-group">
                <label>
                    <Mail size={16} />
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                />
            </div>

            <div className="form-group">
                <label>
                    <Crown size={16} />
                    Category
                </label>
                <div className="category-selector">
                    <button
                        type="button"
                        className={`category-option ${!categoryId ? 'active' : ''}`}
                        onClick={() => setCategoryId(null)}
                    >
                        <User size={14} />
                        Standard
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`category-option ${categoryId === cat.id ? 'active' : ''}`}
                            style={{
                                '--category-color': cat.color
                            } as React.CSSProperties}
                            onClick={() => setCategoryId(cat.id)}
                        >
                            {cat.slug === 'wholesale' && <Building2 size={14} />}
                            {cat.slug === 'vip' && <Crown size={14} />}
                            {cat.slug === 'staff' && <UserCheck size={14} />}
                            {!['wholesale', 'vip', 'staff'].includes(cat.slug) && <User size={14} />}
                            {cat.name}
                            {cat.discount_percentage && cat.discount_percentage > 0 && (
                                <span className="discount">-{cat.discount_percentage}%</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="btn btn-primary btn-create-customer"
                onClick={handleCreate}
                disabled={saving || !name.trim()}
            >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save and Select'}
            </button>
        </div>
    )
}
