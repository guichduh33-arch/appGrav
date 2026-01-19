import { useState, useEffect, useRef } from 'react'
import { X, Search, QrCode, User, Crown, Star, Building2, UserCheck, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './CustomerSearchModal.css'

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

interface CustomerSearchModalProps {
    onClose: () => void
    onSelectCustomer: (customer: Customer | null) => void
    selectedCustomerId?: string | null
}

const TIER_COLORS: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2'
}

export default function CustomerSearchModal({
    onClose,
    onSelectCustomer,
    selectedCustomerId
}: CustomerSearchModalProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)
    const [scanMode, setScanMode] = useState(false)
    const [qrInput, setQrInput] = useState('')
    const qrInputRef = useRef<HTMLInputElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Focus QR input when in scan mode
        if (scanMode && qrInputRef.current) {
            qrInputRef.current.focus()
        }
    }, [scanMode])

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
        }
    }, [searchTerm])

    useEffect(() => {
        fetchRecentCustomers()
    }, [])

    const fetchRecentCustomers = async () => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, code, color, price_modifier_type, discount_percentage)
                `)
                .eq('is_active', true)
                .order('last_visit_at', { ascending: false, nullsFirst: false })
                .limit(10)

            if (data) setCustomers(data)
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const searchCustomers = async (term: string) => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, code, color, price_modifier_type, discount_percentage)
                `)
                .eq('is_active', true)
                .or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,company_name.ilike.%${term}%,membership_number.ilike.%${term}%`)
                .limit(20)

            if (data) setCustomers(data)
        } catch (error) {
            console.error('Error searching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleQrScan = async () => {
        if (!qrInput.trim()) return

        setLoading(true)
        try {
            // Search by QR code or membership number
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, code, color, price_modifier_type, discount_percentage)
                `)
                .or(`loyalty_qr_code.eq.${qrInput.trim()},membership_number.eq.${qrInput.trim()}`)
                .eq('is_active', true)
                .single()

            if (error || !data) {
                // Not found - show error and clear
                setQrInput('')
                alert('Client non trouvé avec ce code QR')
                return
            }

            // Found - select immediately
            onSelectCustomer(data)
            onClose()
        } catch (error) {
            console.error('Error scanning QR:', error)
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

    const getCategoryIcon = (code?: string) => {
        switch (code) {
            case 'wholesale': return <Building2 size={12} />
            case 'vip': return <Crown size={12} />
            case 'staff': return <UserCheck size={12} />
            default: return <User size={12} />
        }
    }

    return (
        <div className="customer-search-modal-overlay" onClick={onClose}>
            <div className="customer-search-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="customer-search-modal__header">
                    <h2>
                        <User size={22} />
                        {scanMode ? 'Scanner Code QR Client' : 'Sélectionner un Client'}
                    </h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Toggle */}
                <div className="customer-search-modal__modes">
                    <button
                        className={`mode-btn ${!scanMode ? 'active' : ''}`}
                        onClick={() => setScanMode(false)}
                    >
                        <Search size={16} />
                        Rechercher
                    </button>
                    <button
                        className={`mode-btn ${scanMode ? 'active' : ''}`}
                        onClick={() => setScanMode(true)}
                    >
                        <QrCode size={16} />
                        Scanner QR
                    </button>
                </div>

                {/* Content */}
                <div className="customer-search-modal__content">
                    {scanMode ? (
                        <div className="qr-scan-area">
                            <div className="qr-scan-icon">
                                <QrCode size={80} />
                            </div>
                            <p className="qr-scan-instruction">
                                Scannez le code QR du client ou entrez son numéro de membre
                            </p>
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
                    ) : (
                        <>
                            {/* Search Input */}
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

                            {/* Remove Customer Button */}
                            {selectedCustomerId && (
                                <button
                                    className="btn btn-remove-customer"
                                    onClick={handleRemoveCustomer}
                                >
                                    <X size={16} />
                                    Retirer le client sélectionné
                                </button>
                            )}

                            {/* Customer List */}
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
                                    customers.map(customer => (
                                        <div
                                            key={customer.id}
                                            className={`customer-item ${selectedCustomerId === customer.id ? 'selected' : ''}`}
                                            onClick={() => handleSelectCustomer(customer)}
                                        >
                                            <div
                                                className="customer-item__avatar"
                                                style={{
                                                    backgroundColor: customer.category?.color || TIER_COLORS[customer.loyalty_tier] || '#6366f1'
                                                }}
                                            >
                                                {(customer.company_name || customer.name)[0].toUpperCase()}
                                            </div>

                                            <div className="customer-item__info">
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
                                                {customer.category?.discount_percentage && customer.category.discount_percentage > 0 && (
                                                    <span className="discount-badge">
                                                        -{customer.category.discount_percentage}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
