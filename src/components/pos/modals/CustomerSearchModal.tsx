import { useState, useEffect, useRef } from 'react'
import { X, Search, QrCode, User, Crown, Star, Building2, UserCheck, Check, UserPlus, Phone, Mail, Save, WifiOff, Heart, History, ShoppingBag, RotateCcw, ChevronLeft, Package, AlertTriangle, Clock } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useNetworkStore } from '../../../stores/networkStore'
import { searchCustomersOffline, syncCustomersToOffline, IOfflineCustomer } from '../../../services/sync/customerSync'
import { useCustomersLastSync } from '@/hooks/customers/useCustomersOffline'
import { formatPrice } from '../../../utils/helpers'
import { TIER_COLORS, TIER_DISCOUNTS } from '@/constants/loyalty'
import './CustomerSearchModal.css'

interface CustomerCategory {
    id: string
    name: string
    slug: string
    color: string | null
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
    category?: {
        name: string
        slug: string
        color: string
        price_modifier_type: string
        discount_percentage: number | null
    }
    loyalty_points: number
    loyalty_tier: string
    total_spent: number
    membership_number: string | null
    loyalty_qr_slug: string | null
}

interface OrderHistoryItem {
    id: string
    order_number: string
    created_at: string
    total: number
    items: Array<{
        id: string
        product_id: string
        product_name: string
        quantity: number
        unit_price: number
    }>
}

interface FrequentProduct {
    product_id: string
    product_name: string
    times_ordered: number
    last_ordered: string
}

interface CustomerSearchModalProps {
    onClose: () => void
    onSelectCustomer: (customer: Customer | null) => void
    selectedCustomerId?: string | null
}

// TIER_COLORS and TIER_DISCOUNTS imported from @/constants/loyalty

// LocalStorage key for favorites
const FAVORITES_KEY = 'appgrav_favorite_customers'

// Get favorites from localStorage
const getFavorites = (): string[] => {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

// Save favorites to localStorage
const saveFavorites = (favorites: string[]) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export default function CustomerSearchModal({
    onClose,
    onSelectCustomer,
    selectedCustomerId
}: CustomerSearchModalProps) {
    const isOnline = useNetworkStore((state) => state.isOnline)
    // Story 6.1: Track cache freshness for stale data indicator
    const { lastSyncAt: _lastSyncAt, isStale, ageDisplay } = useCustomersLastSync()
    const [searchTerm, setSearchTerm] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'search' | 'scan' | 'create' | 'favorites'>('search')
    const [qrInput, setQrInput] = useState('')
    const qrInputRef = useRef<HTMLInputElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Favorites state (Story 7.3)
    const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavorites)
    const [favoriteCustomers, setFavoriteCustomers] = useState<Customer[]>([])

    // Customer detail view (Story 7.4, 7.5)
    const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<Customer | null>(null)
    const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([])
    const [frequentProducts, setFrequentProducts] = useState<FrequentProduct[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // New customer form state
    const [newCustomerName, setNewCustomerName] = useState('')
    const [newCustomerPhone, setNewCustomerPhone] = useState('')
    const [newCustomerEmail, setNewCustomerEmail] = useState('')
    const [newCustomerCategoryId, setNewCustomerCategoryId] = useState<string | null>(null)
    const [categories, setCategories] = useState<CustomerCategory[]>([])
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')
    const [qrError, setQrError] = useState('')
    const searchAbortRef = useRef<AbortController | null>(null)

    // Sync customers to offline when online (Story 2.4)
    useEffect(() => {
        if (isOnline) {
            syncCustomersToOffline().catch(err =>
                console.error('[CustomerSearchModal] Error syncing customers:', err)
            )
        }
    }, [isOnline])

    useEffect(() => {
        // Focus QR input when in scan mode
        if (mode === 'scan' && qrInputRef.current) {
            qrInputRef.current.focus()
        }
    }, [mode])

    useEffect(() => {
        // Load customer categories for the new customer form
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('customer_categories')
                .select('*')
                .eq('is_active', true)
                .order('name')
            if (data) setCategories(data)
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        // Search debounce
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (searchTerm.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                searchCustomers(searchTerm)
            }, 300)
        } else if (searchTerm.length === 0) {
            fetchRecentCustomers()
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
            // Cancel any pending search on unmount
            if (searchAbortRef.current) {
                searchAbortRef.current.abort()
            }
        }
    }, [searchTerm])

    useEffect(() => {
        fetchRecentCustomers()
    }, [])

    // Load favorites when mode changes to favorites (Story 7.3)
    useEffect(() => {
        if (mode === 'favorites' && favoriteIds.length > 0 && isOnline) {
            loadFavoriteCustomers()
        }
    }, [mode, favoriteIds, isOnline])

    // Load order history when customer detail is shown (Story 7.4)
    useEffect(() => {
        if (selectedDetailCustomer && isOnline) {
            loadCustomerHistory(selectedDetailCustomer.id)
        }
    }, [selectedDetailCustomer, isOnline])

    // Transform offline customer to Customer type for display
    // Story 6.1: Uses new fields (points_balance, category_slug, loyalty_tier)
    const transformOfflineCustomer = (c: IOfflineCustomer): Customer => ({
        id: c.id,
        name: c.name,
        company_name: null,
        phone: c.phone,
        email: c.email,
        customer_type: c.category_slug === 'wholesale' ? 'b2b' : 'retail',
        category_id: null,
        category: c.category_slug ? {
            name: c.category_slug.charAt(0).toUpperCase() + c.category_slug.slice(1),
            slug: c.category_slug,
            color: c.category_slug === 'wholesale' ? '#3b82f6' :
                   c.category_slug === 'vip' ? '#f59e0b' : '#6366f1',
            price_modifier_type: c.category_slug === 'wholesale' ? 'wholesale_price' : 'none',
            discount_percentage: null,
        } : undefined,
        loyalty_points: c.points_balance,
        loyalty_tier: c.loyalty_tier?.toLowerCase() || 'bronze',
        total_spent: 0,
        membership_number: null,
        loyalty_qr_slug: null,
    })

    const fetchRecentCustomers = async () => {
        setLoading(true)
        try {
            // Story 2.4: Use offline data when offline
            if (!isOnline) {
                const offlineCustomers = await searchCustomersOffline('')
                setCustomers(offlineCustomers.slice(0, 10).map(transformOfflineCustomer))
                return
            }

            const { data } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, slug, color, price_modifier_type, discount_percentage)
                `)
                .eq('is_active', true)
                .order('last_visit_at', { ascending: false, nullsFirst: false })
                .limit(10)

            if (data) setCustomers(data as unknown as Customer[])
        } catch (error) {
            console.error('Error fetching customers:', error)
            try {
                const offlineCustomers = await searchCustomersOffline('')
                setCustomers(offlineCustomers.slice(0, 10).map(transformOfflineCustomer))
            } catch (offlineErr) {
                console.error('Error fetching offline customers:', offlineErr)
            }
        } finally {
            setLoading(false)
        }
    }

    const searchCustomers = async (term: string) => {
        // Cancel any pending search request
        if (searchAbortRef.current) {
            searchAbortRef.current.abort()
        }
        searchAbortRef.current = new AbortController()

        setLoading(true)
        try {
            if (!isOnline) {
                const offlineCustomers = await searchCustomersOffline(term)
                setCustomers(offlineCustomers.map(transformOfflineCustomer))
                return
            }

            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, slug, color, price_modifier_type, discount_percentage)
                `)
                .eq('is_active', true)
                .or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,company_name.ilike.%${term}%,membership_number.ilike.%${term}%`)
                .limit(20)
                .abortSignal(searchAbortRef.current.signal)

            if (error) throw error
            if (data) setCustomers(data as unknown as Customer[])
        } catch (error) {
            // Ignore abort errors - they're expected when cancelling
            if (error instanceof Error && error.name === 'AbortError') return

            console.error('Error searching customers:', error)
            try {
                const offlineCustomers = await searchCustomersOffline(term)
                setCustomers(offlineCustomers.map(transformOfflineCustomer))
            } catch (offlineErr) {
                console.error('Error searching offline customers:', offlineErr)
            }
        } finally {
            setLoading(false)
        }
    }

    // Load favorite customers (Story 7.3)
    const loadFavoriteCustomers = async () => {
        if (favoriteIds.length === 0) {
            setFavoriteCustomers([])
            return
        }

        setLoading(true)
        try {
            const { data } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, slug, color, price_modifier_type, discount_percentage)
                `)
                .in('id', favoriteIds)
                .eq('is_active', true)

            if (data) setFavoriteCustomers(data as unknown as Customer[])
        } catch (error) {
            console.error('Error loading favorites:', error)
        } finally {
            setLoading(false)
        }
    }

    // Toggle favorite status (Story 7.3)
    const toggleFavorite = (customerId: string) => {
        setFavoriteIds(prev => {
            const newFavorites = prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
            saveFavorites(newFavorites)
            return newFavorites
        })
    }

    // Load customer order history and preferences (Story 7.4, 7.5)
    const loadCustomerHistory = async (customerId: string) => {
        setLoadingHistory(true)
        try {
            // Fetch recent orders
            const { data: orders } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    created_at,
                    total,
                    order_items (
                        id,
                        product_id,
                        quantity,
                        unit_price,
                        products (name)
                    )
                `)
                .eq('customer_id', customerId)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(10)

            if (orders) {
                const historyItems: OrderHistoryItem[] = orders.map(order => ({
                    id: order.id,
                    order_number: order.order_number,
                    created_at: order.created_at ?? new Date().toISOString(),
                    total: order.total ?? 0,
                    items: (order.order_items || []).map((item: any) => ({
                        id: item.id,
                        product_id: item.product_id ?? '',
                        product_name: Array.isArray(item.products) ? item.products[0]?.name : item.products?.name || 'Unknown',
                        quantity: item.quantity,
                        unit_price: item.unit_price
                    }))
                }))
                setOrderHistory(historyItems)
            }

            // Calculate frequent products (Story 7.5)
            const { data: frequentData } = await supabase
                .from('order_items')
                .select(`
                    product_id,
                    quantity,
                    orders!inner (customer_id, created_at),
                    products (name)
                `)
                .eq('orders.customer_id', customerId)
                .order('orders.created_at', { ascending: false })
                .limit(100)

            if (frequentData) {
                const productMap = new Map<string, { name: string; count: number; lastOrdered: string }>()
                frequentData.forEach((item: any) => {
                    if (!item.product_id) return
                    const existing = productMap.get(item.product_id)
                    const productName = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name || 'Unknown'
                    const orderDate = Array.isArray(item.orders) ? item.orders[0]?.created_at : item.orders?.created_at
                    if (existing) {
                        existing.count += item.quantity
                    } else {
                        productMap.set(item.product_id, {
                            name: productName,
                            count: item.quantity,
                            lastOrdered: orderDate ?? new Date().toISOString()
                        })
                    }
                })

                const sortedProducts = Array.from(productMap.entries())
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 5)
                    .map(([productId, data]) => ({
                        product_id: productId,
                        product_name: data.name,
                        times_ordered: data.count,
                        last_ordered: data.lastOrdered
                    }))

                setFrequentProducts(sortedProducts)
            }
        } catch (error) {
            console.error('Error loading customer history:', error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const handleQrScan = async () => {
        if (!qrInput.trim()) return

        setLoading(true)
        setQrError('')
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, slug, color, price_modifier_type, discount_percentage)
                `)
                .or(`loyalty_qr_code.eq.${qrInput.trim()},membership_number.eq.${qrInput.trim()}`)
                .eq('is_active', true)
                .single()

            if (error || !data) {
                setQrInput('')
                setQrError('Client non trouvé avec ce code QR')
                return
            }

            onSelectCustomer(data as unknown as Customer)
            onClose()
        } catch (error) {
            console.error('Error scanning QR:', error)
            setQrError('Erreur lors de la recherche')
            setQrInput('')
        } finally {
            setLoading(false)
        }
    }

    const handleQrKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleQrScan()
        }
    }

    const handleSelectCustomer = (customer: Customer) => {
        onSelectCustomer(customer)
        onClose()
    }

    const handleRemoveCustomer = () => {
        onSelectCustomer(null)
        onClose()
    }

    // Show customer detail view (Story 7.4)
    const handleShowDetail = (customer: Customer) => {
        setSelectedDetailCustomer(customer)
    }

    // Reorder functionality (Story 7.4)
    const handleReorder = async (_order: OrderHistoryItem) => {
        if (selectedDetailCustomer) {
            onSelectCustomer(selectedDetailCustomer)
        }
        onClose()
    }

    const handleCreateCustomer = async () => {
        if (!newCustomerName.trim()) {
            setFormError('Le nom est obligatoire')
            return
        }

        setSaving(true)
        setFormError('')

        try {
            const { data, error } = await supabase
                .from('customers')
                .insert({
                    name: newCustomerName.trim(),
                    phone: newCustomerPhone.trim() || null,
                    email: newCustomerEmail.trim() || null,
                    category_id: newCustomerCategoryId,
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

            onSelectCustomer(data as unknown as Customer)
            onClose()
        } catch (error: unknown) {
            console.error('Error creating customer:', error)
            if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
                setFormError('Un client avec ce téléphone ou email existe déjà')
            } else {
                setFormError('Erreur lors de la création du client')
            }
        } finally {
            setSaving(false)
        }
    }

    const resetCreateForm = () => {
        setNewCustomerName('')
        setNewCustomerPhone('')
        setNewCustomerEmail('')
        setNewCustomerCategoryId(null)
        setFormError('')
    }

    const getCategoryIcon = (slug?: string) => {
        switch (slug) {
            case 'wholesale': return <Building2 size={12} />
            case 'vip': return <Crown size={12} />
            case 'staff': return <UserCheck size={12} />
            default: return <User size={12} />
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Render customer card
    const renderCustomerCard = (customer: Customer, showFavoriteButton = true) => {
        const isFavorite = favoriteIds.includes(customer.id)

        return (
            <div
                key={customer.id}
                className={`customer-item ${selectedCustomerId === customer.id ? 'selected' : ''}`}
            >
                <div
                    className="customer-item__avatar"
                    style={{
                        backgroundColor: customer.category?.color || TIER_COLORS[customer.loyalty_tier] || '#6366f1'
                    }}
                    onClick={() => handleSelectCustomer(customer)}
                >
                    {(customer.company_name || customer.name)[0].toUpperCase()}
                </div>

                <div className="customer-item__info" onClick={() => handleSelectCustomer(customer)}>
                    <div className="customer-item__name">
                        {customer.company_name || customer.name}
                        {selectedCustomerId === customer.id && (
                            <Check size={16} className="check-icon" />
                        )}
                    </div>
                    {customer.company_name && (
                        <span className="customer-item__contact">{customer.name}</span>
                    )}
                    <div className="customer-item__details">
                        {customer.phone && <span>{customer.phone}</span>}
                        {customer.membership_number && (
                            <span className="member-number">
                                <QrCode size={10} />
                                {customer.membership_number}
                            </span>
                        )}
                    </div>
                </div>

                <div className="customer-item__meta">
                    {customer.category && (
                        <span
                            className="category-tag"
                            style={{ backgroundColor: customer.category.color }}
                        >
                            {getCategoryIcon(customer.category.slug)}
                            {customer.category.name}
                        </span>
                    )}
                    <div className="loyalty-info">
                        <span
                            className="tier-badge"
                            style={{ backgroundColor: TIER_COLORS[customer.loyalty_tier] }}
                        >
                            <Star size={10} />
                            {customer.loyalty_tier}
                        </span>
                        <span className="points">
                            {customer.loyalty_points.toLocaleString()} pts
                        </span>
                    </div>
                    {(customer.category?.discount_percentage ?? TIER_DISCOUNTS[customer.loyalty_tier]) > 0 && (
                        <span className="discount-badge">
                            -{customer.category?.discount_percentage || TIER_DISCOUNTS[customer.loyalty_tier]}%
                        </span>
                    )}
                </div>

                <div className="customer-item__actions-right">
                    {showFavoriteButton && (
                        <button
                            type="button"
                            className={`btn-favorite ${isFavorite ? 'is-favorite' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(customer.id)
                            }}
                            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                    )}
                    {isOnline && (
                        <button
                            type="button"
                            className="btn-history"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleShowDetail(customer)
                            }}
                            title="Voir l'historique"
                        >
                            <History size={16} />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // Render customer detail view (Story 7.4, 7.5)
    const renderDetailView = () => {
        if (!selectedDetailCustomer) return null

        return (
            <div className="customer-detail">
                <div className="customer-detail__header">
                    <button
                        type="button"
                        className="btn-back"
                        onClick={() => setSelectedDetailCustomer(null)}
                    >
                        <ChevronLeft size={20} />
                        Retour
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-select-customer"
                        onClick={() => handleSelectCustomer(selectedDetailCustomer)}
                    >
                        <Check size={16} />
                        Sélectionner
                    </button>
                </div>

                <div className="customer-detail__profile">
                    <div
                        className="customer-detail__avatar"
                        style={{
                            backgroundColor: selectedDetailCustomer.category?.color || TIER_COLORS[selectedDetailCustomer.loyalty_tier] || '#6366f1'
                        }}
                    >
                        {(selectedDetailCustomer.company_name || selectedDetailCustomer.name)[0].toUpperCase()}
                    </div>
                    <div className="customer-detail__info">
                        <h3>{selectedDetailCustomer.company_name || selectedDetailCustomer.name}</h3>
                        {selectedDetailCustomer.phone && <p><Phone size={14} /> {selectedDetailCustomer.phone}</p>}
                        {selectedDetailCustomer.email && <p><Mail size={14} /> {selectedDetailCustomer.email}</p>}
                    </div>
                    <div className="customer-detail__loyalty">
                        <span
                            className="tier-badge tier-badge--large"
                            style={{ backgroundColor: TIER_COLORS[selectedDetailCustomer.loyalty_tier] }}
                        >
                            <Crown size={14} />
                            {selectedDetailCustomer.loyalty_tier}
                        </span>
                        <span className="points-large">
                            {selectedDetailCustomer.loyalty_points.toLocaleString()} pts
                        </span>
                        {(selectedDetailCustomer.category?.discount_percentage ?? TIER_DISCOUNTS[selectedDetailCustomer.loyalty_tier]) > 0 && (
                            <span className="discount-badge discount-badge--large">
                                -{selectedDetailCustomer.category?.discount_percentage || TIER_DISCOUNTS[selectedDetailCustomer.loyalty_tier]}% remise
                            </span>
                        )}
                    </div>
                </div>

                {loadingHistory ? (
                    <div className="customer-detail__loading">
                        <div className="spinner"></div>
                        <span>Chargement de l'historique...</span>
                    </div>
                ) : (
                    <>
                        {/* Frequent products (Story 7.5) */}
                        {frequentProducts.length > 0 && (
                            <div className="customer-detail__section">
                                <h4><Package size={16} /> Produits préférés</h4>
                                <div className="frequent-products">
                                    {frequentProducts.map(product => (
                                        <div key={product.product_id} className="frequent-product">
                                            <span className="frequent-product__name">{product.product_name}</span>
                                            <span className="frequent-product__count">×{product.times_ordered}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order history (Story 7.4) */}
                        <div className="customer-detail__section">
                            <h4><ShoppingBag size={16} /> Historique des commandes</h4>
                            {orderHistory.length === 0 ? (
                                <p className="no-history">Aucune commande précédente</p>
                            ) : (
                                <div className="order-history">
                                    {orderHistory.map(order => (
                                        <div key={order.id} className="order-history__item">
                                            <div className="order-history__header">
                                                <span className="order-history__number">{order.order_number}</span>
                                                <span className="order-history__date">{formatDate(order.created_at)}</span>
                                                <span className="order-history__total">{formatPrice(order.total)}</span>
                                            </div>
                                            <div className="order-history__items">
                                                {order.items.slice(0, 3).map(item => (
                                                    <span key={item.id} className="order-history__product">
                                                        {item.quantity}× {item.product_name}
                                                    </span>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="order-history__more">
                                                        +{order.items.length - 3} autres
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-reorder"
                                                onClick={() => handleReorder(order)}
                                            >
                                                <RotateCcw size={14} />
                                                Recommander
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="customer-search-modal-overlay" onClick={onClose}>
            <div className="customer-search-modal" onClick={e => e.stopPropagation()}>
                {/* Customer Detail View */}
                {selectedDetailCustomer ? (
                    renderDetailView()
                ) : (
                    <>
                        {/* Header */}
                        <div className="customer-search-modal__header">
                            <h2>
                                {mode === 'search' && <User size={22} />}
                                {mode === 'scan' && <QrCode size={22} />}
                                {mode === 'create' && <UserPlus size={22} />}
                                {mode === 'favorites' && <Heart size={22} />}
                                {mode === 'search' && 'Sélectionner un Client'}
                                {mode === 'scan' && 'Scanner Code QR Client'}
                                {mode === 'create' && 'Nouveau Client'}
                                {mode === 'favorites' && 'Clients Favoris'}
                                {/* Story 6.1 AC4: Offline indicator with data age */}
                                {!isOnline && (
                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: isStale ? '#ef4444' : '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <WifiOff size={14} />
                                        Hors-ligne
                                        {ageDisplay && (
                                            <span title={isStale ? 'Données de plus de 24h' : 'Date de dernière synchronisation'}>
                                                {isStale && <AlertTriangle size={12} style={{ marginLeft: '2px' }} />}
                                                <Clock size={10} style={{ marginLeft: '4px' }} />
                                                {ageDisplay}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </h2>
                            <button className="btn-close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="customer-search-modal__modes">
                            <button
                                className={`mode-btn ${mode === 'search' ? 'active' : ''}`}
                                onClick={() => setMode('search')}
                            >
                                <Search size={16} />
                                Rechercher
                            </button>
                            <button
                                className={`mode-btn mode-btn--favorites ${mode === 'favorites' ? 'active' : ''}`}
                                onClick={() => setMode('favorites')}
                            >
                                <Heart size={16} />
                                Favoris
                                {favoriteIds.length > 0 && (
                                    <span className="mode-btn__badge">{favoriteIds.length}</span>
                                )}
                            </button>
                            <button
                                className={`mode-btn ${mode === 'scan' ? 'active' : ''} ${!isOnline ? 'disabled' : ''}`}
                                onClick={() => isOnline && setMode('scan')}
                                disabled={!isOnline}
                                title={!isOnline ? 'Nécessite une connexion internet' : ''}
                            >
                                <QrCode size={16} />
                                QR
                            </button>
                            <button
                                className={`mode-btn mode-btn--create ${mode === 'create' ? 'active' : ''} ${!isOnline ? 'disabled' : ''}`}
                                onClick={() => { if (isOnline) { setMode('create'); resetCreateForm() } }}
                                disabled={!isOnline}
                                title={!isOnline ? 'Nécessite une connexion internet' : ''}
                            >
                                <UserPlus size={16} />
                                Nouveau
                            </button>
                        </div>

                        {/* Content */}
                        <div className="customer-search-modal__content">
                            {mode === 'create' ? (
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
                                            Nom *
                                        </label>
                                        <input
                                            type="text"
                                            value={newCustomerName}
                                            onChange={(e) => setNewCustomerName(e.target.value)}
                                            placeholder="Nom du client"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <Phone size={16} />
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            value={newCustomerPhone}
                                            onChange={(e) => setNewCustomerPhone(e.target.value)}
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
                                            value={newCustomerEmail}
                                            onChange={(e) => setNewCustomerEmail(e.target.value)}
                                            placeholder="email@exemple.com"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <Crown size={16} />
                                            Catégorie
                                        </label>
                                        <div className="category-selector">
                                            <button
                                                type="button"
                                                className={`category-option ${!newCustomerCategoryId ? 'active' : ''}`}
                                                onClick={() => setNewCustomerCategoryId(null)}
                                            >
                                                <User size={14} />
                                                Standard
                                            </button>
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    className={`category-option ${newCustomerCategoryId === cat.id ? 'active' : ''}`}
                                                    style={{
                                                        '--category-color': cat.color
                                                    } as React.CSSProperties}
                                                    onClick={() => setNewCustomerCategoryId(cat.id)}
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
                                        onClick={handleCreateCustomer}
                                        disabled={saving || !newCustomerName.trim()}
                                    >
                                        <Save size={18} />
                                        {saving ? 'Enregistrement...' : 'Enregistrer et Sélectionner'}
                                    </button>
                                </div>
                            ) : mode === 'scan' ? (
                                <div className="qr-scan-area">
                                    <div className="qr-scan-icon">
                                        <QrCode size={80} />
                                    </div>
                                    <p className="qr-scan-instruction">
                                        Scannez le code QR du client ou entrez son numéro de membre
                                    </p>
                                    {qrError && (
                                        <div className="qr-error">
                                            <X size={16} />
                                            {qrError}
                                        </div>
                                    )}
                                    <input
                                        ref={qrInputRef}
                                        type="text"
                                        className="qr-scan-input"
                                        value={qrInput}
                                        onChange={(e) => setQrInput(e.target.value)}
                                        onKeyDown={handleQrKeyDown}
                                        placeholder="Code QR ou N° Membre..."
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-primary btn-scan"
                                        onClick={handleQrScan}
                                        disabled={!qrInput.trim() || loading}
                                    >
                                        {loading ? 'Recherche...' : 'Valider'}
                                    </button>
                                </div>
                            ) : mode === 'favorites' ? (
                                <div className="customer-list">
                                    {loading ? (
                                        <div className="customer-list__loading">
                                            <div className="spinner"></div>
                                            <span>Chargement...</span>
                                        </div>
                                    ) : favoriteCustomers.length === 0 ? (
                                        <div className="customer-list__empty">
                                            <Heart size={40} />
                                            <p>Aucun client favori</p>
                                            <span className="customer-list__hint">
                                                Cliquez sur le ♥ pour ajouter des favoris
                                            </span>
                                        </div>
                                    ) : (
                                        favoriteCustomers.map(customer => renderCustomerCard(customer, true))
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="customer-search-input">
                                        <Search size={20} />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Rechercher par nom, téléphone, email..."
                                            autoFocus
                                        />
                                    </div>

                                    {selectedCustomerId && (
                                        <button
                                            className="btn btn-remove-customer"
                                            onClick={handleRemoveCustomer}
                                        >
                                            <X size={16} />
                                            Retirer le client sélectionné
                                        </button>
                                    )}

                                    <div className="customer-list">
                                        {loading ? (
                                            <div className="customer-list__loading">
                                                <div className="spinner"></div>
                                                <span>Chargement...</span>
                                            </div>
                                        ) : customers.length === 0 ? (
                                            <div className="customer-list__empty">
                                                <User size={40} />
                                                <p>
                                                    {searchTerm
                                                        ? 'Aucun client trouvé'
                                                        : 'Aucun client récent'}
                                                </p>
                                            </div>
                                        ) : (
                                            customers.map(customer => renderCustomerCard(customer, true))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
