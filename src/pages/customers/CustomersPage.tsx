import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users, Plus, Search, Filter, Building2, Crown, UserCheck,
    Star, QrCode, Phone, Mail, TrendingUp, Eye, Edit
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import './CustomersPage.css'

interface CustomerCategory {
    id: string
    name: string
    slug: string
    color: string
    price_modifier_type: string
    discount_percentage: number | null
}

interface Customer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    customer_type: string
    category_id: string | null
    category?: CustomerCategory
    loyalty_points: number
    lifetime_points: number
    loyalty_tier: string
    total_spent: number
    total_visits: number
    is_active: boolean
    membership_number: string | null
    created_at: string
}

interface Stats {
    totalCustomers: number
    activeMembers: number
    totalPointsIssued: number
    averageSpent: number
}

const TIER_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    bronze: { color: '#cd7f32', icon: <Star size={14} /> },
    silver: { color: '#c0c0c0', icon: <Star size={14} /> },
    gold: { color: '#ffd700', icon: <Crown size={14} /> },
    platinum: { color: '#e5e4e2', icon: <Crown size={14} /> }
}

export default function CustomersPage() {
    const navigate = useNavigate()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [categories, setCategories] = useState<CustomerCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [tierFilter, setTierFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [stats, setStats] = useState<Stats>({
        totalCustomers: 0,
        activeMembers: 0,
        totalPointsIssued: 0,
        averageSpent: 0
    })

    useEffect(() => {
        fetchCategories()
        fetchCustomers()
    }, [])

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('customer_categories')
            .select('*')
            .eq('is_active', true)
            .order('name')
        if (data) setCategories(data as unknown as CustomerCategory[])
    }

    const fetchCustomers = async () => {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(id, name, slug, color, price_modifier_type, discount_percentage)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                const typedData = data as unknown as Customer[]
                setCustomers(typedData)

                // Calculate stats
                const active = typedData.filter(c => c.is_active)
                const totalSpent = typedData.reduce((sum, c) => sum + (c.total_spent || 0), 0)
                const totalPoints = typedData.reduce((sum, c) => sum + (c.lifetime_points || 0), 0)

                setStats({
                    totalCustomers: typedData.length,
                    activeMembers: active.length,
                    totalPointsIssued: totalPoints,
                    averageSpent: typedData.length > 0 ? totalSpent / typedData.length : 0
                })
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

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
        <div className="customers-page">
            {/* Header */}
            <header className="customers-header">
                <div className="customers-header__info">
                    <h1 className="customers-header__title">
                        <Users size={28} />
                        Customer Management
                    </h1>
                    <p className="customers-header__subtitle">
                        Manage your customers, categories and loyalty program
                    </p>
                </div>
                <div className="customers-header__actions">
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
            <div className="customers-stats">
                <div className="customer-stat-card">
                    <div className="customer-stat-card__icon customers">
                        <Users size={24} />
                    </div>
                    <div className="customer-stat-card__content">
                        <span className="customer-stat-card__value">{stats.totalCustomers}</span>
                        <span className="customer-stat-card__label">Total Customers</span>
                    </div>
                </div>
                <div className="customer-stat-card">
                    <div className="customer-stat-card__icon active">
                        <UserCheck size={24} />
                    </div>
                    <div className="customer-stat-card__content">
                        <span className="customer-stat-card__value">{stats.activeMembers}</span>
                        <span className="customer-stat-card__label">Active Members</span>
                    </div>
                </div>
                <div className="customer-stat-card">
                    <div className="customer-stat-card__icon points">
                        <Star size={24} />
                    </div>
                    <div className="customer-stat-card__content">
                        <span className="customer-stat-card__value">{stats.totalPointsIssued.toLocaleString()}</span>
                        <span className="customer-stat-card__label">Points Issued</span>
                    </div>
                </div>
                <div className="customer-stat-card">
                    <div className="customer-stat-card__icon revenue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="customer-stat-card__content">
                        <span className="customer-stat-card__value customer-stat-card__value--sm">
                            {formatCurrency(stats.averageSpent)}
                        </span>
                        <span className="customer-stat-card__label">Average Basket</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="customers-filters">
                <div className="customers-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, email or member #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="customers-filter"
                >
                    <option value="all">All categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="customers-filter"
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
                    className="customers-filter"
                >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Category Quick Filters */}
            <div className="category-chips">
                <button
                    className={`category-chip ${categoryFilter === 'all' ? 'active' : ''}`}
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
                            className={`category-chip ${categoryFilter === cat.id ? 'active' : ''}`}
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
                <div className="customers-loading">
                    <div className="spinner"></div>
                    <span>Loading customers...</span>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="customers-empty">
                    <Users size={64} />
                    <h3>No customer found</h3>
                    <p>
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
                <div className="customers-grid">
                    {filteredCustomers.map(customer => (
                        <div
                            key={customer.id}
                            className="customer-card"
                            onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                            <div className="customer-card__header">
                                <div
                                    className="customer-card__avatar"
                                    style={{
                                        backgroundColor: customer.category?.color || '#6366f1'
                                    }}
                                >
                                    {getInitials(customer.company_name || customer.name)}
                                </div>
                                <div className="customer-card__badges">
                                    {customer.category && (
                                        <span
                                            className="category-badge"
                                            style={{ backgroundColor: customer.category.color }}
                                        >
                                            {getCategoryIcon(customer.category.slug)}
                                            {customer.category.name}
                                        </span>
                                    )}
                                    {customer.loyalty_tier && customer.loyalty_tier !== 'bronze' && (
                                        <span
                                            className="tier-badge"
                                            style={{ backgroundColor: TIER_CONFIG[customer.loyalty_tier]?.color }}
                                        >
                                            {TIER_CONFIG[customer.loyalty_tier]?.icon}
                                            {customer.loyalty_tier}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="customer-card__info">
                                <h3 className="customer-card__name">
                                    {customer.company_name || customer.name}
                                </h3>
                                {customer.company_name && (
                                    <p className="customer-card__contact">{customer.name}</p>
                                )}
                                <div className="customer-card__details">
                                    {customer.phone && (
                                        <span className="detail">
                                            <Phone size={12} />
                                            {customer.phone}
                                        </span>
                                    )}
                                    {customer.email && (
                                        <span className="detail">
                                            <Mail size={12} />
                                            {customer.email}
                                        </span>
                                    )}
                                </div>
                                {customer.membership_number && (
                                    <div className="customer-card__membership">
                                        <QrCode size={12} />
                                        {customer.membership_number}
                                    </div>
                                )}
                            </div>

                            <div className="customer-card__stats">
                                <div className="stat">
                                    <span className="stat__value">{customer.total_visits}</span>
                                    <span className="stat__label">Visits</span>
                                </div>
                                <div className="stat">
                                    <span className="stat__value">{customer.loyalty_points.toLocaleString()}</span>
                                    <span className="stat__label">Points</span>
                                </div>
                                <div className="stat">
                                    <span className="stat__value stat__value--sm">
                                        {formatCurrency(customer.total_spent)}
                                    </span>
                                    <span className="stat__label">Total</span>
                                </div>
                            </div>

                            <div className="customer-card__footer">
                                <span className={`status-badge ${customer.is_active ? 'active' : 'inactive'}`}>
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className="customer-card__date">
                                    Since {formatDate(customer.created_at)}
                                </span>
                            </div>

                            <div className="customer-card__actions">
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
