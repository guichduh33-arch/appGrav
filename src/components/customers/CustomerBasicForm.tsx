import { User, Building2, Phone, Mail, MapPin, Calendar } from 'lucide-react'

interface CustomerBasicFormProps {
    formData: {
        name: string
        company_name: string
        phone: string
        email: string
        address: string
        date_of_birth: string
    }
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

const inputClass = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none'
const labelClass = 'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2'

export function CustomerBasicForm({ formData, onChange }: CustomerBasicFormProps) {
    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
            <h2 className="flex items-center gap-2 text-base font-display font-bold text-white mb-5 pb-3 border-b border-white/5">
                <User size={18} className="text-[var(--color-gold)]" />
                General Information
            </h2>

            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelClass}>Full name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        placeholder="Customer name"
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="company_name" className={labelClass}>
                        <Building2 size={11} />
                        Company name
                    </label>
                    <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={onChange}
                        placeholder="Company (optional)"
                        className={inputClass}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <div>
                        <label htmlFor="phone" className={labelClass}>
                            <Phone size={11} />
                            Phone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={onChange}
                            placeholder="+62 xxx xxx xxx"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClass}>
                            <Mail size={11} />
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            placeholder="email@example.com"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="address" className={labelClass}>
                        <MapPin size={11} />
                        Address
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={onChange}
                        placeholder="Full address"
                        rows={2}
                        className={`${inputClass} resize-none`}
                    />
                </div>

                <div>
                    <label htmlFor="date_of_birth" className={labelClass}>
                        <Calendar size={11} />
                        Date of birth
                    </label>
                    <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={onChange}
                        className={inputClass}
                    />
                </div>
            </div>
        </div>
    )
}
