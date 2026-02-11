import { useState, useEffect, useRef } from 'react'
import { X, Search, QrCode, User, UserPlus, WifiOff, Heart, AlertTriangle, Clock } from 'lucide-react'
import { useNetworkStore } from '../../../stores/networkStore'
import { syncCustomersToOffline } from '../../../services/sync/customerSync'
import { useCustomersLastSync } from '@/hooks/customers/useCustomersOffline'
import {
    ICustomerCategory, ICustomerSearchCustomer, IOrderHistoryItem, IFrequentProduct,
    getFavorites, saveFavorites,
} from './customerSearchTypes'
import {
    fetchRecentCustomers, searchCustomers as searchCustomersApi,
    loadFavoriteCustomers as loadFavoritesApi, loadCustomerHistory as loadHistoryApi,
    fetchCategories,
} from './customerSearchData'
import CustomerCard from './CustomerCard'
import CreateCustomerForm from './CreateCustomerForm'
import QRScanArea from './QRScanArea'
import CustomerDetailView from './CustomerDetailView'
import './CustomerSearchModal.css'

const MODE_ICONS = { search: User, scan: QrCode, create: UserPlus, favorites: Heart } as const
const MODE_TITLES = { search: 'Select a Customer', scan: 'Scan Customer QR Code', create: 'New Customer', favorites: 'Favorite Customers' } as const

interface CustomerSearchModalProps {
    onClose: () => void
    onSelectCustomer: (customer: ICustomerSearchCustomer | null) => void
    selectedCustomerId?: string | null
}

export default function CustomerSearchModal({ onClose, onSelectCustomer, selectedCustomerId }: CustomerSearchModalProps) {
    const isOnline = useNetworkStore((state) => state.isOnline)
    const { isStale, ageDisplay } = useCustomersLastSync()
    const [searchTerm, setSearchTerm] = useState('')
    const [customers, setCustomers] = useState<ICustomerSearchCustomer[]>([])
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'search' | 'scan' | 'create' | 'favorites'>('search')
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavorites)
    const [favoriteCustomers, setFavoriteCustomers] = useState<ICustomerSearchCustomer[]>([])
    const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<ICustomerSearchCustomer | null>(null)
    const [orderHistory, setOrderHistory] = useState<IOrderHistoryItem[]>([])
    const [frequentProducts, setFrequentProducts] = useState<IFrequentProduct[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [categories, setCategories] = useState<ICustomerCategory[]>([])
    const searchAbortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        if (isOnline) syncCustomersToOffline().catch(err => console.error('[CustomerSearchModal] Error syncing customers:', err))
    }, [isOnline])

    useEffect(() => { fetchCategories().then(setCategories) }, [])

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        if (searchTerm.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => doSearch(searchTerm), 300)
        } else if (searchTerm.length === 0) {
            doFetchRecent()
        }
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
            if (searchAbortRef.current) searchAbortRef.current.abort()
        }
    }, [searchTerm])

    useEffect(() => { doFetchRecent() }, [])

    useEffect(() => {
        if (mode === 'favorites' && favoriteIds.length > 0 && isOnline) doLoadFavorites()
    }, [mode, favoriteIds, isOnline])

    useEffect(() => {
        if (selectedDetailCustomer && isOnline) doLoadHistory(selectedDetailCustomer.id)
    }, [selectedDetailCustomer, isOnline])

    const doFetchRecent = async () => {
        setLoading(true)
        try { setCustomers(await fetchRecentCustomers(isOnline)) }
        catch (e) { console.error('Error fetching recent customers:', e) }
        finally { setLoading(false) }
    }

    const doSearch = async (term: string) => {
        if (searchAbortRef.current) searchAbortRef.current.abort()
        searchAbortRef.current = new AbortController()
        setLoading(true)
        try { setCustomers(await searchCustomersApi(term, isOnline, searchAbortRef.current.signal)) }
        catch (e) { if (e instanceof Error && e.name === 'AbortError') return; console.error('Error searching:', e) }
        finally { setLoading(false) }
    }

    const doLoadFavorites = async () => {
        setLoading(true)
        try { setFavoriteCustomers(await loadFavoritesApi(favoriteIds)) }
        catch (e) { console.error('Error loading favorites:', e) }
        finally { setLoading(false) }
    }

    const doLoadHistory = async (customerId: string) => {
        setLoadingHistory(true)
        try {
            const r = await loadHistoryApi(customerId)
            setOrderHistory(r.orderHistory)
            setFrequentProducts(r.frequentProducts)
        } catch (e) { console.error('Error loading customer history:', e) }
        finally { setLoadingHistory(false) }
    }

    const toggleFavorite = (customerId: string) => {
        setFavoriteIds(prev => {
            const next = prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
            saveFavorites(next)
            return next
        })
    }

    const selectAndClose = (customer: ICustomerSearchCustomer) => { onSelectCustomer(customer); onClose() }
    const handleRemoveCustomer = () => { onSelectCustomer(null); onClose() }
    const handleReorder = async (_order: IOrderHistoryItem) => {
        if (selectedDetailCustomer) onSelectCustomer(selectedDetailCustomer)
        onClose()
    }

    const renderCustomerList = (list: ICustomerSearchCustomer[]) =>
        list.map(c => (
            <CustomerCard key={c.id} customer={c} selectedCustomerId={selectedCustomerId}
                isFavorite={favoriteIds.includes(c.id)} isOnline={isOnline} showFavoriteButton
                onSelect={selectAndClose} onToggleFavorite={toggleFavorite} onShowDetail={setSelectedDetailCustomer} />
        ))

    const ModeIcon = MODE_ICONS[mode]

    return (
        <div className="customer-search-modal-overlay" onClick={onClose}>
            <div className="customer-search-modal" onClick={e => e.stopPropagation()}>
                {selectedDetailCustomer ? (
                    <CustomerDetailView customer={selectedDetailCustomer} orderHistory={orderHistory}
                        frequentProducts={frequentProducts} loadingHistory={loadingHistory}
                        onBack={() => setSelectedDetailCustomer(null)} onSelectCustomer={selectAndClose} onReorder={handleReorder} />
                ) : (
                    <>
                        <div className="customer-search-modal__header">
                            <h2>
                                <ModeIcon size={22} />
                                {MODE_TITLES[mode]}
                                {!isOnline && (
                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: isStale ? '#ef4444' : '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <WifiOff size={14} /> Offline
                                        {ageDisplay && (
                                            <span title={isStale ? 'Data older than 24h' : 'Last sync time'}>
                                                {isStale && <AlertTriangle size={12} style={{ marginLeft: '2px' }} />}
                                                <Clock size={10} style={{ marginLeft: '4px' }} /> {ageDisplay}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </h2>
                            <button className="btn-close" onClick={onClose}><X size={20} /></button>
                        </div>

                        <div className="customer-search-modal__modes">
                            <button className={`mode-btn ${mode === 'search' ? 'active' : ''}`} onClick={() => setMode('search')}>
                                <Search size={16} /> Search
                            </button>
                            <button className={`mode-btn mode-btn--favorites ${mode === 'favorites' ? 'active' : ''}`} onClick={() => setMode('favorites')}>
                                <Heart size={16} /> Favorites
                                {favoriteIds.length > 0 && <span className="mode-btn__badge">{favoriteIds.length}</span>}
                            </button>
                            <button className={`mode-btn ${mode === 'scan' ? 'active' : ''} ${!isOnline ? 'disabled' : ''}`}
                                onClick={() => isOnline && setMode('scan')} disabled={!isOnline}
                                title={!isOnline ? 'Requires internet connection' : ''}>
                                <QrCode size={16} /> QR
                            </button>
                            <button className={`mode-btn mode-btn--create ${mode === 'create' ? 'active' : ''} ${!isOnline ? 'disabled' : ''}`}
                                onClick={() => { if (isOnline) setMode('create') }} disabled={!isOnline}
                                title={!isOnline ? 'Requires internet connection' : ''}>
                                <UserPlus size={16} /> New
                            </button>
                        </div>

                        <div className="customer-search-modal__content">
                            {mode === 'create' ? (
                                <CreateCustomerForm categories={categories} onCustomerCreated={selectAndClose} />
                            ) : mode === 'scan' ? (
                                <QRScanArea onCustomerFound={selectAndClose} />
                            ) : mode === 'favorites' ? (
                                <div className="customer-list">
                                    {loading ? (
                                        <div className="customer-list__loading"><div className="spinner"></div><span>Loading...</span></div>
                                    ) : favoriteCustomers.length === 0 ? (
                                        <div className="customer-list__empty">
                                            <Heart size={40} /><p>No favorite customers</p>
                                            <span className="customer-list__hint">Click the heart to add favorites</span>
                                        </div>
                                    ) : renderCustomerList(favoriteCustomers)}
                                </div>
                            ) : (
                                <>
                                    <div className="customer-search-input">
                                        <Search size={20} />
                                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, phone, email..." autoFocus />
                                    </div>
                                    {selectedCustomerId && (
                                        <button className="btn btn-remove-customer" onClick={handleRemoveCustomer}>
                                            <X size={16} /> Remove selected customer
                                        </button>
                                    )}
                                    <div className="customer-list">
                                        {loading ? (
                                            <div className="customer-list__loading"><div className="spinner"></div><span>Loading...</span></div>
                                        ) : customers.length === 0 ? (
                                            <div className="customer-list__empty">
                                                <User size={40} />
                                                <p>{searchTerm ? 'No customer found' : 'No recent customers'}</p>
                                            </div>
                                        ) : renderCustomerList(customers)}
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
