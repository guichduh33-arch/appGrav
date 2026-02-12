import { useState, useEffect, useRef } from 'react'
import { X, Search, QrCode, User, UserPlus, WifiOff, Heart, AlertTriangle, Clock } from 'lucide-react'
import { useNetworkStore } from '../../../stores/networkStore'
import { syncCustomersToOffline } from '../../../services/sync/customerSync'
import { useCustomersLastSync } from '@/hooks/customers/useCustomersOffline'
import { cn } from '@/lib/utils'
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-[500px] max-h-[80vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-[600px]:max-w-full max-[600px]:max-h-full max-[600px]:rounded-none" onClick={e => e.stopPropagation()}>
                {selectedDetailCustomer ? (
                    <CustomerDetailView customer={selectedDetailCustomer} orderHistory={orderHistory}
                        frequentProducts={frequentProducts} loadingHistory={loadingHistory}
                        onBack={() => setSelectedDetailCustomer(null)} onSelectCustomer={selectAndClose} onReorder={handleReorder} />
                ) : (
                    <>
                        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
                            <h2 className="flex items-center gap-2 m-0 text-lg text-slate-800 [&>svg]:text-indigo-500">
                                <ModeIcon size={22} />
                                {MODE_TITLES[mode]}
                                {!isOnline && (
                                    <span className={cn(
                                        'ml-2.5 text-xs inline-flex items-center gap-1',
                                        isStale ? 'text-red-500' : 'text-amber-500'
                                    )}>
                                        <WifiOff size={14} /> Offline
                                        {ageDisplay && (
                                            <span title={isStale ? 'Data older than 24h' : 'Last sync time'}>
                                                {isStale && <AlertTriangle size={12} className="ml-0.5" />}
                                                <Clock size={10} className="ml-1" /> {ageDisplay}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </h2>
                            <button
                                className="w-9 h-9 rounded-lg border-none bg-slate-100 text-slate-500 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-slate-200 hover:text-slate-800"
                                onClick={onClose}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                            <button
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-2.5 py-2.5 border-none bg-transparent rounded-lg text-[0.85rem] font-medium text-slate-500 cursor-pointer transition-all duration-200',
                                    'hover:bg-slate-200 hover:text-slate-600',
                                    mode === 'search' && 'bg-indigo-500 text-white'
                                )}
                                onClick={() => setMode('search')}
                            >
                                <Search size={16} /> Search
                            </button>
                            <button
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-2.5 py-2.5 border-none bg-transparent rounded-lg text-[0.85rem] font-medium text-slate-500 cursor-pointer transition-all duration-200 relative',
                                    'hover:bg-slate-200 hover:text-slate-600',
                                    mode === 'favorites' && 'bg-indigo-500 text-white'
                                )}
                                onClick={() => setMode('favorites')}
                            >
                                <Heart size={16} /> Favorites
                                {favoriteIds.length > 0 && (
                                    <span className={cn(
                                        'text-[0.65rem] px-1.5 py-0.5 rounded-[10px] ml-1',
                                        mode === 'favorites' ? 'bg-white text-red-500' : 'bg-red-500 text-white'
                                    )}>
                                        {favoriteIds.length}
                                    </span>
                                )}
                            </button>
                            <button
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-2.5 py-2.5 border-none bg-transparent rounded-lg text-[0.85rem] font-medium text-slate-500 cursor-pointer transition-all duration-200',
                                    'hover:bg-slate-200 hover:text-slate-600',
                                    mode === 'scan' && 'bg-indigo-500 text-white',
                                    !isOnline && 'opacity-50 cursor-not-allowed'
                                )}
                                onClick={() => isOnline && setMode('scan')} disabled={!isOnline}
                                title={!isOnline ? 'Requires internet connection' : ''}
                            >
                                <QrCode size={16} /> QR
                            </button>
                            <button
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-2.5 py-2.5 border-none rounded-lg text-[0.85rem] font-medium cursor-pointer transition-all duration-200',
                                    'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
                                    'hover:bg-gradient-to-br hover:from-emerald-600 hover:to-emerald-700',
                                    mode === 'create' && 'bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.3)]',
                                    !isOnline && 'opacity-50 cursor-not-allowed'
                                )}
                                onClick={() => { if (isOnline) setMode('create') }} disabled={!isOnline}
                                title={!isOnline ? 'Requires internet connection' : ''}
                            >
                                <UserPlus size={16} /> New
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col p-4 min-h-0">
                            {mode === 'create' ? (
                                <CreateCustomerForm categories={categories} onCustomerCreated={selectAndClose} />
                            ) : mode === 'scan' ? (
                                <QRScanArea onCustomerFound={selectAndClose} />
                            ) : mode === 'favorites' ? (
                                <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 gap-3">
                                            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <span>Loading...</span>
                                        </div>
                                    ) : favoriteCustomers.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 gap-3">
                                            <Heart size={40} />
                                            <p className="m-0 text-[0.9rem]">No favorite customers</p>
                                            <span className="text-[0.8rem] text-slate-400 mt-2">Click the heart to add favorites</span>
                                        </div>
                                    ) : renderCustomerList(favoriteCustomers)}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 px-4 bg-slate-100 rounded-[10px] mb-3 [&>svg]:text-slate-400 [&>svg]:shrink-0">
                                        <Search size={20} />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Search by name, phone, email..."
                                            autoFocus
                                            className="flex-1 border-none bg-transparent py-3.5 text-[0.95rem] outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    {selectedCustomerId && (
                                        <button
                                            className="flex items-center justify-center gap-2 p-2 mb-3 border border-dashed border-red-300 bg-red-50 rounded-lg text-red-600 text-[0.8rem] cursor-pointer transition-all duration-200 hover:bg-red-100 hover:border-red-400"
                                            onClick={handleRemoveCustomer}
                                        >
                                            <X size={16} /> Remove selected customer
                                        </button>
                                    )}
                                    <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 gap-3">
                                                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <span>Loading...</span>
                                            </div>
                                        ) : customers.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 gap-3">
                                                <User size={40} />
                                                <p className="m-0 text-[0.9rem]">{searchTerm ? 'No customer found' : 'No recent customers'}</p>
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
