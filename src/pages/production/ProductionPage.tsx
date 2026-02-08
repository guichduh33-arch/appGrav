import { useState, useEffect } from 'react'
import {
    Factory, Calendar, ChevronLeft, ChevronRight, Search, Plus, Minus,
    Trash2, Save, Clock, Package, Lock, Eye, Layers, WifiOff, Bookmark, Bell, X
} from 'lucide-react'
import { toast } from 'sonner'
import { useProduction, ProductWithSection, ProductionRecordWithProduct, ProductionItem } from '../../hooks/useProduction'
import { useNetworkStatus } from '../../hooks/offline/useNetworkStatus'
import {
    saveProductionReminder,
    getProductionReminders,
    deleteProductionReminder,
    getRemindersCount,
    hasReminders,
} from '../../services/offline/productionReminderService'
import type { IProductionReminder } from '../../types/offline'

const ProductionPage = () => {
    const { isOnline } = useNetworkStatus()
    const {
        selectedDate,
        sections,
        selectedSectionId,
        selectedSection,
        sectionProducts,
        productionItems,
        todayHistory,
        isSaving,
        isAdmin,
        isToday,
        totalProduced,
        totalWaste,
        setSelectedSectionId,
        navigateDate,
        addProduct,
        updateQuantity,
        updateReason,
        removeItem,
        clearItems,
        handleSave,
        handleDeleteRecord,
        restoreFromReminder,
    } = useProduction()

    const [searchQuery, setSearchQuery] = useState('')
    const [remindersCount, setRemindersCount] = useState(0)
    const [showRemindersPanel, setShowRemindersPanel] = useState(false)
    const [reminders, setReminders] = useState<IProductionReminder[]>([])
    const [reminderNote, setReminderNote] = useState('')

    // Refresh reminders count on mount and when panel opens
    useEffect(() => {
        setRemindersCount(getRemindersCount())
    }, [])

    // Show notification when coming back online with pending reminders
    useEffect(() => {
        if (isOnline && hasReminders()) {
            const count = getRemindersCount()
            toast.info(`${count} pending reminder(s)`, {
                description: 'Click to view reminders',
                duration: 8000,
                action: {
                    label: 'View',
                    onClick: () => setShowRemindersPanel(true),
                },
            })
        }
    }, [isOnline])

    // Load reminders when panel opens
    useEffect(() => {
        if (showRemindersPanel) {
            setReminders(getProductionReminders())
        }
    }, [showRemindersPanel])

    const handleSaveReminder = () => {
        if (productionItems.length === 0 || !selectedSectionId || !selectedSection) return

        saveProductionReminder(
            productionItems,
            selectedSectionId,
            selectedSection.name,
            selectedDate,
            reminderNote || undefined
        )

        toast.success('Reminder saved')
        setRemindersCount(getRemindersCount())
        setReminderNote('')
        clearItems()
    }

    const handleDeleteReminder = (id: string) => {
        deleteProductionReminder(id)
        setReminders(getProductionReminders())
        setRemindersCount(getRemindersCount())
    }

    const handleRestoreReminder = (reminder: IProductionReminder) => {
        // Set section first
        setSelectedSectionId(reminder.sectionId)
        // Restore items via hook
        restoreFromReminder(reminder.items as ProductionItem[])
        setShowRemindersPanel(false)
        toast.success('Reminder restored')
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    const filteredProducts = sectionProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !productionItems.find(item => item.productId === p.id)
    )

    const getRecordUnit = (record: ProductionRecordWithProduct): string => {
        const product = record.product
        if (!product) return 'pcs'
        const consumptionUom = product.product_uoms?.find(u => u.is_consumption_unit)
        return consumptionUom?.unit_name || product.unit || 'pcs'
    }

    const handleAddProduct = (product: ProductWithSection) => {
        addProduct(product)
        setSearchQuery('')
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                            <Factory size={24} color="white" />
                        </div>
                        <div>
                            <h1 className="m-0 text-2xl font-bold text-gray-800">Production</h1>
                            <p className="m-0 text-gray-500 text-sm">Production entry by section</p>
                        </div>
                    </div>
                    {/* Reminders indicator */}
                    {remindersCount > 0 && (
                        <button
                            onClick={() => setShowRemindersPanel(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                        >
                            <Bell size={18} />
                            <span className="font-medium">{remindersCount} pending reminder(s)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Reminders Panel Modal */}
            {showRemindersPanel && (
                <RemindersPanel
                    reminders={reminders}
                    onClose={() => setShowRemindersPanel(false)}
                    onRestore={handleRestoreReminder}
                    onDelete={handleDeleteReminder}
                    isOnline={isOnline}
                />
            )}

            {/* Section & Date Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <SectionSelector
                    sections={sections}
                    selectedSectionId={selectedSectionId}
                    onSelect={setSelectedSectionId}
                />
                <DateSelector
                    selectedDate={selectedDate}
                    isToday={isToday}
                    formatDate={formatDate}
                    onNavigate={navigateDate}
                />
            </div>

            {/* Main Content */}
            {!selectedSectionId ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                    <ProductionEntry
                        sectionName={selectedSection?.name || ''}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filteredProducts={filteredProducts}
                        productionItems={productionItems}
                        isSaving={isSaving}
                        isOnline={isOnline}
                        reminderNote={reminderNote}
                        setReminderNote={setReminderNote}
                        onAddProduct={handleAddProduct}
                        onUpdateQuantity={updateQuantity}
                        onUpdateReason={updateReason}
                        onRemoveItem={removeItem}
                        onClear={clearItems}
                        onSave={handleSave}
                        onSaveReminder={handleSaveReminder}
                    />
                    <div className="flex flex-col gap-4">
                        <SummaryCard totalProduced={totalProduced} totalWaste={totalWaste} />
                        <HistoryCard
                            history={todayHistory}
                            isAdmin={isAdmin}
                            getRecordUnit={getRecordUnit}
                            onDelete={handleDeleteRecord}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// Sub-components

function SectionSelector({ sections, selectedSectionId, onSelect }: {
    sections: { id: string; name: string }[]
    selectedSectionId: string | null
    onSelect: (id: string) => void
}) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Layers size={18} className="text-amber-500" />
                <span className="font-semibold text-gray-700 text-sm">Section</span>
            </div>
            <div className="flex gap-2 flex-wrap">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => onSelect(section.id)}
                        className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            selectedSectionId === section.id
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {section.name}
                    </button>
                ))}
                {sections.length === 0 && (
                    <p className="text-gray-400 text-sm italic">No production section configured</p>
                )}
            </div>
        </div>
    )
}

function DateSelector({ selectedDate, isToday, formatDate, onNavigate }: {
    selectedDate: Date
    isToday: boolean
    formatDate: (date: Date) => string
    onNavigate: (direction: number) => void
}) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-blue-500" />
                <span className="font-semibold text-gray-700 text-sm">Date</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onNavigate(-1)}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    aria-label="Previous day"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className={`flex-1 text-center py-2.5 px-4 rounded-lg font-semibold capitalize ${
                    isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {isToday ? "Today" : formatDate(selectedDate)}
                </div>
                <button
                    onClick={() => onNavigate(1)}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    aria-label="Next day"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="text-center p-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Layers size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="m-0 text-gray-600 font-medium">Select a section</h3>
            <p className="text-gray-400 mt-2 text-sm">Choose a production section to start</p>
        </div>
    )
}

function ProductionEntry({
    sectionName, searchQuery, setSearchQuery, filteredProducts, productionItems,
    isSaving, isOnline, reminderNote, setReminderNote, onAddProduct, onUpdateQuantity,
    onUpdateReason, onRemoveItem, onClear, onSave, onSaveReminder
}: {
    sectionName: string
    searchQuery: string
    setSearchQuery: (q: string) => void
    filteredProducts: ProductWithSection[]
    productionItems: { productId: string; name: string; category: string; icon: string; unit: string; quantity: number; wasted: number; wasteReason: string }[]
    isSaving: boolean
    isOnline: boolean
    reminderNote: string
    setReminderNote: (note: string) => void
    onAddProduct: (p: ProductWithSection) => void
    onUpdateQuantity: (id: string, field: 'quantity' | 'wasted', delta: number) => void
    onUpdateReason: (id: string, reason: string) => void
    onRemoveItem: (id: string) => void
    onClear: () => void
    onSave: () => void
    onSaveReminder: () => void
}) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="m-0 mb-4 text-lg font-semibold text-gray-800">Production Entry - {sectionName}</h2>

            {/* Offline warning banner */}
            {!isOnline && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <WifiOff size={18} className="text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-amber-800 font-medium">
                        Production requires an internet connection
                    </span>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search for a product to produce..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:border-amber-500 focus:outline-none transition-colors"
                />
                {searchQuery && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-xl z-20 max-h-[300px] overflow-auto">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => onAddProduct(product)}
                                className="w-full px-4 py-3 flex items-center gap-3 border-none bg-transparent hover:bg-gray-50 cursor-pointer text-left"
                            >
                                <span className="text-xl">{product.category?.icon || '📦'}</span>
                                <div>
                                    <div className="font-semibold text-gray-800">{product.name}</div>
                                    <div className="text-xs text-gray-400">{product.category?.name}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Items Table */}
            {productionItems.length > 0 ? (
                <ProductionTable
                    items={productionItems}
                    onUpdateQuantity={onUpdateQuantity}
                    onUpdateReason={onUpdateReason}
                    onRemove={onRemoveItem}
                />
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Package size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="m-0 text-gray-500 font-medium">No product added</p>
                    <p className="mt-1 text-sm text-gray-400">Search for a product to add</p>
                </div>
            )}

            {/* Actions */}
            {productionItems.length > 0 && (
                <div className="mt-6 space-y-4">
                    {/* Reminder note input (only when offline) */}
                    {!isOnline && (
                        <div>
                            <input
                                type="text"
                                placeholder="Add a note..."
                                value={reminderNote}
                                onChange={(e) => setReminderNote(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <button onClick={onClear} disabled={isSaving} className="px-6 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        {isOnline ? (
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        ) : (
                            <button
                                onClick={onSaveReminder}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <Bookmark size={18} />
                                Save Reminder
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function ProductionTable({ items, onUpdateQuantity, onUpdateReason, onRemove }: {
    items: { productId: string; name: string; category: string; icon: string; unit: string; quantity: number; wasted: number; wasteReason: string }[]
    onUpdateQuantity: (id: string, field: 'quantity' | 'wasted', delta: number) => void
    onUpdateReason: (id: string, reason: string) => void
    onRemove: (id: string) => void
}) {
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Waste</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
                        <th className="w-[50px]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.map(item => (
                        <tr key={item.productId} className="hover:bg-gray-50/50">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <div className="font-semibold text-gray-800">{item.name}</div>
                                        <div className="text-xs text-gray-400">{item.category}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <QuantityControl value={item.quantity} unit={item.unit} onChange={(d) => onUpdateQuantity(item.productId, 'quantity', d)} />
                            </td>
                            <td className="p-4">
                                <QuantityControl value={item.wasted} unit={item.unit} onChange={(d) => onUpdateQuantity(item.productId, 'wasted', d)} isWaste />
                            </td>
                            <td className="p-4">
                                {item.wasted > 0 && (
                                    <input
                                        type="text"
                                        placeholder="Reason..."
                                        value={item.wasteReason}
                                        onChange={(e) => onUpdateReason(item.productId, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-red-200 rounded text-sm text-gray-700 bg-red-50/30 focus:border-red-400 focus:outline-none"
                                    />
                                )}
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => onRemove(item.productId)} className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function QuantityControl({ value, unit, onChange, isWaste = false }: {
    value: number
    unit: string
    onChange: (delta: number) => void
    isWaste?: boolean
}) {
    const btnClass = isWaste ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
    const valueClass = isWaste ? (value > 0 ? 'text-red-600' : 'text-gray-300') : 'text-gray-800'

    return (
        <div className="flex items-center justify-center gap-2">
            <button onClick={() => onChange(-1)} className={`p-1 rounded ${btnClass} transition-colors`} aria-label="Decrease">
                <Minus size={16} />
            </button>
            <div className="text-center min-w-[3rem]">
                <span className={`block font-bold text-lg leading-none ${valueClass}`}>{value}</span>
                {(!isWaste || value > 0) && <span className={`text-[10px] font-medium uppercase ${isWaste ? 'text-red-500' : 'text-gray-500'}`}>{unit}</span>}
            </div>
            <button onClick={() => onChange(1)} className={`p-1 rounded ${btnClass} transition-colors`} aria-label="Increase">
                <Plus size={16} />
            </button>
        </div>
    )
}

function SummaryCard({ totalProduced, totalWaste }: { totalProduced: number; totalWaste: number }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Today's summary</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">{totalProduced}</div>
                    <div className="text-xs font-semibold text-emerald-700 uppercase mt-1">Produced</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl text-center border border-red-100">
                    <div className="text-2xl font-bold text-red-600">{totalWaste}</div>
                    <div className="text-xs font-semibold text-red-700 uppercase mt-1">Waste</div>
                </div>
            </div>
        </div>
    )
}

function HistoryCard({ history, isAdmin, getRecordUnit, onDelete }: {
    history: ProductionRecordWithProduct[]
    isAdmin: boolean
    getRecordUnit: (r: ProductionRecordWithProduct) => string
    onDelete: (id: string) => void
}) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
                <h3 className="m-0 text-xs font-bold text-gray-500 uppercase tracking-wider">History ({history.length})</h3>
                {!isAdmin && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye size={14} />Read-only
                    </div>
                )}
            </div>

            <div className="max-h-[400px] overflow-auto pr-1">
                {history.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {history.map(record => (
                            <div key={record.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100 hover:border-gray-200 transition-colors">
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">{record.product?.name}</div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Clock size={12} />
                                        {record.created_at ? new Date(record.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">+{record.quantity_produced} {getRecordUnit(record)}</span>
                                    {(record.quantity_waste ?? 0) > 0 && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">-{record.quantity_waste} {getRecordUnit(record)}</span>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => onDelete(record.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" aria-label="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <Clock size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="m-0 text-sm">No production recorded</p>
                    </div>
                )}
            </div>

            {!isAdmin && history.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-center gap-2 border border-amber-100">
                    <Lock size={16} className="text-amber-600" />
                    <span className="text-xs text-amber-800 font-medium">Only an administrator can modify entries</span>
                </div>
            )}
        </div>
    )
}

function RemindersPanel({
    reminders,
    onClose,
    onRestore,
    onDelete,
    isOnline
}: {
    reminders: IProductionReminder[]
    onClose: () => void
    onRestore: (reminder: IProductionReminder) => void
    onDelete: (id: string) => void
    isOnline: boolean
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Bell size={20} className="text-amber-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Production Reminders</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {reminders.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Bookmark size={40} className="mx-auto mb-2 opacity-50" />
                            <p className="m-0">No reminders</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="font-semibold text-gray-800">{reminder.sectionName}</div>
                                            <div className="text-xs text-gray-500">
                                                Created at: {new Date(reminder.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                            {reminder.items.length} items
                                        </span>
                                    </div>

                                    {/* Items preview */}
                                    <div className="mb-3 text-sm text-gray-600">
                                        {reminder.items.slice(0, 3).map((item, idx) => (
                                            <span key={idx}>
                                                {item.icon} {item.name} ({item.quantity} {item.unit})
                                                {idx < Math.min(reminder.items.length, 3) - 1 && ', '}
                                            </span>
                                        ))}
                                        {reminder.items.length > 3 && <span className="text-gray-400"> +{reminder.items.length - 3}</span>}
                                    </div>

                                    {reminder.note && (
                                        <div className="mb-3 p-2 bg-white rounded border border-gray-100 text-sm text-gray-600">
                                            <span className="font-medium text-gray-700">Note:</span> {reminder.note}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onRestore(reminder)}
                                            disabled={!isOnline}
                                            className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                            title={!isOnline ? 'Production requires an internet connection' : ''}
                                        >
                                            <Save size={14} />
                                            Restore
                                        </button>
                                        <button
                                            onClick={() => onDelete(reminder.id)}
                                            className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductionPage
