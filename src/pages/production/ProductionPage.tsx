import { useState } from 'react'
import {
    Factory, Calendar, ChevronLeft, ChevronRight, Search, Plus, Minus,
    Trash2, Save, Clock, Package, Lock, Eye, Layers
} from 'lucide-react'
import { useProduction, ProductWithSection, ProductionRecordWithProduct } from '../../hooks/useProduction'

const ProductionPage = () => {
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
    } = useProduction()

    const [searchQuery, setSearchQuery] = useState('')

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
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                        <Factory size={24} color="white" />
                    </div>
                    <div>
                        <h1 className="m-0 text-2xl font-bold text-gray-800">Production</h1>
                        <p className="m-0 text-gray-500 text-sm">Saisie de production par section</p>
                    </div>
                </div>
            </div>

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
                        onAddProduct={handleAddProduct}
                        onUpdateQuantity={updateQuantity}
                        onUpdateReason={updateReason}
                        onRemoveItem={removeItem}
                        onClear={clearItems}
                        onSave={handleSave}
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
                    <p className="text-gray-400 text-sm italic">Aucune section de production configurée</p>
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
                    aria-label="Jour précédent"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className={`flex-1 text-center py-2.5 px-4 rounded-lg font-semibold capitalize ${
                    isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
                </div>
                <button
                    onClick={() => onNavigate(1)}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    aria-label="Jour suivant"
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
            <h3 className="m-0 text-gray-600 font-medium">Sélectionnez une section</h3>
            <p className="text-gray-400 mt-2 text-sm">Choisissez une section de production pour commencer</p>
        </div>
    )
}

function ProductionEntry({
    sectionName, searchQuery, setSearchQuery, filteredProducts, productionItems,
    isSaving, onAddProduct, onUpdateQuantity, onUpdateReason, onRemoveItem, onClear, onSave
}: {
    sectionName: string
    searchQuery: string
    setSearchQuery: (q: string) => void
    filteredProducts: ProductWithSection[]
    productionItems: { productId: string; name: string; category: string; icon: string; unit: string; quantity: number; wasted: number; wasteReason: string }[]
    isSaving: boolean
    onAddProduct: (p: ProductWithSection) => void
    onUpdateQuantity: (id: string, field: 'quantity' | 'wasted', delta: number) => void
    onUpdateReason: (id: string, reason: string) => void
    onRemoveItem: (id: string) => void
    onClear: () => void
    onSave: () => void
}) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="m-0 mb-4 text-lg font-semibold text-gray-800">Saisie Production - {sectionName}</h2>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un produit à produire..."
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
                    <p className="m-0 text-gray-500 font-medium">Aucun produit ajouté</p>
                    <p className="mt-1 text-sm text-gray-400">Recherchez un produit pour l'ajouter</p>
                </div>
            )}

            {/* Actions */}
            {productionItems.length > 0 && (
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClear} disabled={isSaving} className="px-6 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Annuler
                    </button>
                    <button onClick={onSave} disabled={isSaving} className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
                        <Save size={18} />
                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produit</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Quantité</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Perte</th>
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
                                        placeholder="Raison..."
                                        value={item.wasteReason}
                                        onChange={(e) => onUpdateReason(item.productId, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-red-200 rounded text-sm text-gray-700 bg-red-50/30 focus:border-red-400 focus:outline-none"
                                    />
                                )}
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => onRemove(item.productId)} className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer">
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
            <button onClick={() => onChange(-1)} className={`p-1 rounded ${btnClass} transition-colors`} aria-label="Diminuer">
                <Minus size={16} />
            </button>
            <div className="text-center min-w-[3rem]">
                <span className={`block font-bold text-lg leading-none ${valueClass}`}>{value}</span>
                {(!isWaste || value > 0) && <span className={`text-[10px] font-medium uppercase ${isWaste ? 'text-red-500' : 'text-gray-500'}`}>{unit}</span>}
            </div>
            <button onClick={() => onChange(1)} className={`p-1 rounded ${btnClass} transition-colors`} aria-label="Augmenter">
                <Plus size={16} />
            </button>
        </div>
    )
}

function SummaryCard({ totalProduced, totalWaste }: { totalProduced: number; totalWaste: number }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Résumé du jour</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">{totalProduced}</div>
                    <div className="text-xs font-semibold text-emerald-700 uppercase mt-1">Produit</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl text-center border border-red-100">
                    <div className="text-2xl font-bold text-red-600">{totalWaste}</div>
                    <div className="text-xs font-semibold text-red-700 uppercase mt-1">Perte</div>
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
                <h3 className="m-0 text-xs font-bold text-gray-500 uppercase tracking-wider">Historique ({history.length})</h3>
                {!isAdmin && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye size={14} />Lecture seule
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
                                        {record.created_at ? new Date(record.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">+{record.quantity_produced} {getRecordUnit(record)}</span>
                                    {(record.quantity_waste ?? 0) > 0 && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">-{record.quantity_waste} {getRecordUnit(record)}</span>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => onDelete(record.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" aria-label="Supprimer">
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
                        <p className="m-0 text-sm">Aucune production enregistrée</p>
                    </div>
                )}
            </div>

            {!isAdmin && history.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-center gap-2 border border-amber-100">
                    <Lock size={16} className="text-amber-600" />
                    <span className="text-xs text-amber-800 font-medium">Seul un administrateur peut modifier les entrées</span>
                </div>
            )}
        </div>
    )
}

export default ProductionPage
