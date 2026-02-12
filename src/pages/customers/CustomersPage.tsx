import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users, Plus, Search, Filter, Building2, Crown, UserCheck,
    Star, QrCode, Phone, Mail, TrendingUp, Eye, Edit
} from 'lucide-react'
import { useCustomers, useCustomerCategories } from '@/hooks/customers'
import { formatCurrency } from '../../utils/helpers'
import { cn } from '@/lib/utils'

const TIER_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    bronze: { color: '#cd7f32', icon: <Star size={14} /> },
    silver: { color: '#c0c0c0', icon: <Star size={14} /> },
    gold: { color: '#ffd700', icon: <Crown size={14} /> },
    platinum: { color: '#e5e4e2', icon: <Crown size={14} /> }
}

export default function CustomersPage() {
    const navigate = useNavigate()
    const { data: customers = [], isLoading: loading } = useCustomers()
    const { data: categories = [] } = useCustomerCategories(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [tierFilter, setTierFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const stats = useMemo(() => {
        const active = customers.filter(c => c.is_active)
        const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
        const totalPoints = customers.reduce((sum, c) => sum + (c.lifetime_points || 0), 0)

        return {
            totalCustomers: customers.length,
            activeMembers: active.length,
            totalPointsIssued: totalPoints,
            averageSpent: customers.length > 0 ? totalSpent / customers.length : 0
        }
    }, [customers])

    const filteredCustomers = customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            customer.name.toLowerCase().includes(searchLower) ||
            customer.company_name?.toLowerCase().includes(searchLower) ||
            customer.phone?.includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchLower) ||
            customer.membership_number?.toLowerCase().includes(searchLower)

        const matchesCategory = categoryFilter === 'all' || customer.category_id === categoryFilter
        const matchesTier = tierFilter === 'all' || customer.loyalty_tier === tierFilter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && customer.is_active) ||
            (statusFilter === 'inactive' && !customer.is_active)

        return matchesSearch && matchesCategory && matchesTier && matchesStatus
    })

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'wholesale': return <Building2 size={14} />
            case 'vip': return <Crown size={14} />
            case 'staff': return <UserCheck size={14} />
            default: return <Users size={14} />
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto max-md:p-4">
            {/* Header */}
            <header className="flex justify-between items-start mb-6 gap-4 flex-wrap max-md:flex-col max-md:gap-4">
                <div>
                    <h1 className="flex items-center gap-3 text-[1.75rem] font-bold text-foreground m-0 [&>svg]:text-primary">
                        <Users size={28} />
                        Customer Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your customers, categories and loyalty program
                    </p>
                </div>
                <div className="flex gap-3 max-md:w-full max-md:[&>.btn]:flex-1">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/customers/categories')}
                    >
                        <Filter size={18} />
                        Categories
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/customers/new')}
                    >
                        <Plus size={18} />
                        New Customer
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2 max-md:grid-cols-2">
                <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 text-violet-600">
                        <Users size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground leading-tight">{stats.totalCustomers}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Total Customers</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-green-100 text-green-600">
                        <UserCheck size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground leading-tight">{stats.activeMembers}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Active Members</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                        <Star size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground leading-tight">{stats.totalPointsIssued.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Points Issued</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground leading-tight">
                            {formatCurrency(stats.averageSpent)}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">Average Basket</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap max-md:flex-col">
                <div className="flex-1 min-w-[280px] flex items-center gap-3 bg-white border border-border rounded-lg px-4 [&>svg]:text-slate-400 [&>svg]:shrink-0 max-md:min-w-full">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, email or member #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="py-3 px-4 border border-border rounded-lg bg-white text-sm text-slate-600 cursor-pointer min-w-[150px] focus:outline-none focus:border-primary max-md:w-full"
                >
                    <option value="all">All categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="py-3 px-4 border border-border rounded-lg bg-white text-sm text-slate-600 cursor-pointer min-w-[150px] focus:outline-none focus:border-primary max-md:w-full"
                >
                    <option value="all">All tiers</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-3 px-4 border border-border rounded-lg bg-white text-sm text-slate-600 cursor-pointer min-w-[150px] focus:outline-none focus:border-primary max-md:w-full"
                >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Category Quick Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    className={cn(
                        'flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-white text-xs text-slate-600 cursor-pointer transition-all',
                        categoryFilter === 'all' && 'bg-primary border-primary text-white'
                    )}
                    onClick={() => setCategoryFilter('all')}
                >
                    <Users size={14} />
                    All ({customers.length})
                </button>
                {categories.map(cat => {
                    const count = customers.filter(c => c.category_id === cat.id).length
                    return (
                        <button
                            key={cat.id}
                            className={cn(
                                'flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-white text-xs text-slate-600 cursor-pointer transition-all',
                                'hover:border-[var(--chip-color)] hover:bg-[color-mix(in_srgb,var(--chip-color)_10%,white)]',
                                categoryFilter === cat.id && 'bg-[var(--chip-color)] border-[var(--chip-color)] text-white'
                            )}
                            onClick={() => setCategoryFilter(cat.id)}
                            style={{ '--chip-color': cat.color } as React.CSSProperties}
                        >
                            {getCategoryIcon(cat.slug)}
                            {cat.name} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Customer List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-muted-foreground gap-4">
                    <div className="spinner"></div>
                    <span>Loading customers...</span>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white rounded-xl border border-dashed border-border [&>svg]:text-slate-300 [&>svg]:mb-4">
                    <Users size={64} />
                    <h3 className="m-0 mb-2 text-slate-600 text-lg">No customer found</h3>
                    <p className="m-0 mb-6 text-slate-400 text-sm">
                        {searchTerm || categoryFilter !== 'all' || tierFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start by adding your first customer'}
                    </p>
                    {!searchTerm && categoryFilter === 'all' && (
                        <button className="btn btn-primary" onClick={() => navigate('/customers/new')}>
                            <Plus size={18} />
                            Add a customer
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 max-md:grid-cols-1">
                    {filteredCustomers.map(customer => (
                        <div
                            key={customer.id}
                            className="group bg-white rounded-xl border border-border p-5 cursor-pointer transition-all relative hover:border-primary hover:shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
                            onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-base"
                                    style={{
                                        backgroundColor: customer.category?.color || '#6366f1'
                                    }}
                                >
                                    {getInitials(customer.company_name || customer.name)}
                                </div>
                                <div className="flex gap-1.5 flex-wrap justify-end">
                                    {customer.category && (
                                        <span
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[0.7rem] font-medium text-white capitalize"
                                            style={{ backgroundColor: customer.category.color }}
                                        >
                                            {getCategoryIcon(customer.category.slug)}
                                            {customer.category.name}
                                        </span>
                                    )}
                                    {customer.loyalty_tier && customer.loyalty_tier !== 'bronze' && (
                                        <span
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[0.7rem] font-medium text-white capitalize"
                                            style={{ backgroundColor: TIER_CONFIG[customer.loyalty_tier]?.color }}
                                        >
                                            {TIER_CONFIG[customer.loyalty_tier]?.icon}
                                            {customer.loyalty_tier}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="m-0 mb-1 text-base font-semibold text-foreground">
                                    {customer.company_name || customer.name}
                                </h3>
                                {customer.company_name && (
                                    <p className="m-0 mb-2 text-sm text-muted-foreground">{customer.name}</p>
                                )}
                                <div className="flex flex-col gap-1">
                                    {customer.phone && (
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground [&>svg]:text-slate-400">
                                            <Phone size={12} />
                                            {customer.phone}
                                        </span>
                                    )}
                                    {customer.email && (
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground [&>svg]:text-slate-400">
                                            <Mail size={12} />
                                            {customer.email}
                                        </span>
                                    )}
                                </div>
                                {customer.membership_number && (
                                    <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 bg-slate-100 rounded-md font-mono text-xs text-slate-600 w-fit">
                                        <QrCode size={12} />
                                        {customer.membership_number}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 mb-3">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-base font-semibold text-foreground">{customer.total_visits}</span>
                                    <span className="text-[0.7rem] text-slate-400 uppercase tracking-wide">Visits</span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-base font-semibold text-foreground">{customer.loyalty_points.toLocaleString()}</span>
                                    <span className="text-[0.7rem] text-slate-400 uppercase tracking-wide">Points</span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-xs font-semibold text-foreground">
                                        {formatCurrency(customer.total_spent)}
                                    </span>
                                    <span className="text-[0.7rem] text-slate-400 uppercase tracking-wide">Total</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className={cn(
                                    'px-2 py-1 rounded text-[0.7rem] font-medium',
                                    customer.is_active ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-600'
                                )}>
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    Since {formatDate(customer.created_at)}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-md:opacity-100">
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/customers/${customer.id}`)
                                    }}
                                    title="View details"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/customers/${customer.id}/edit`)
                                    }}
                                    title="Edit"
                                >
                                    <Edit size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
