import { useState, useEffect } from 'react'
import {
    Factory, Calendar, ChevronLeft, ChevronRight, Search, Plus, Minus,
    Trash2, Save, Clock, Package, AlertTriangle, Lock, Edit3, Eye, Layers
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Product, Section, ProductionRecord } from '../../types/database'
import toast from 'react-hot-toast'

interface ProductionItem {
    productId: string
    name: string
    category: string
    icon: string
    unit: string
    quantity: number
    wasted: number
    wasteReason: string
}

interface ProductUOM {
    id: string
    unit_name: string
    conversion_factor: number
    is_consumption_unit: boolean
}

interface ProductWithSection extends Product {
    category?: { name: string; icon: string }
    product_uoms?: ProductUOM[]
}

const ProductionPage = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'admin' || user?.role === 'manager'

    // State
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [sections, setSections] = useState<Section[]>([])
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [sectionProducts, setSectionProducts] = useState<ProductWithSection[]>([])
    const [productionItems, setProductionItems] = useState<ProductionItem[]>([])
    const [todayHistory, setTodayHistory] = useState<(ProductionRecord & { product?: Product })[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null)

    // Fetch sections on mount
    useEffect(() => {
        fetchSections()
    }, [])

    // Fetch products when section changes
    useEffect(() => {
        if (selectedSectionId) {
            fetchSectionProducts()
            fetchTodayHistory()
        }
    }, [selectedSectionId, selectedDate])

    const fetchSections = async () => {
        try {
            const { data, error } = await supabase
                .from('sections')
                .select('*')
                .eq('is_production_point', true)
                .order('name')

            if (error) throw error
            setSections(data || [])

            // Auto-select first section
            if (data && data.length > 0 && !selectedSectionId) {
                setSelectedSectionId(data[0].id)
            }
        } catch (error) {
            console.error('Error fetching sections:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSectionProducts = async () => {
        if (!selectedSectionId) return

        try {
            // Get products linked to this section via product_sections
            const { data, error } = await supabase
                .from('product_sections')
                .select(`
                    product:products(
                        *,
                        category:categories(name, icon),
                        product_uoms(id, unit_name, conversion_factor, is_consumption_unit)
                    )
                `)
                .eq('section_id', selectedSectionId)

            if (error) throw error

            const products = data
                ?.map((ps: any) => ps.product)
                .filter(Boolean)
                .filter((p: any) => p.product_type === 'finished' || p.product_type === 'semi_finished')

            setSectionProducts(products || [])
        } catch (error) {
            console.error('Error fetching section products:', error)
        }
    }

    const fetchTodayHistory = async () => {
        if (!selectedSectionId) return

        try {
            const dateStr = selectedDate.toISOString().split('T')[0]

            const { data, error } = await supabase
                .from('production_records')
                .select(`
                    *,
                    product:products(
                        name,
                        sku,
                        unit,
                        product_uoms(id, unit_name, is_consumption_unit)
                    )
                `)
                .eq('section_id', selectedSectionId)
                .eq('production_date', dateStr)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodayHistory(data || [])
        } catch (error) {
            console.error('Error fetching history:', error)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const navigateDate = (direction: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + direction)
        setSelectedDate(newDate)
    }

    const isToday = selectedDate.toDateString() === new Date().toDateString()

    // Filter products by search
    const filteredProducts = sectionProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !productionItems.find(item => item.productId === p.id)
    )

    // Get the appropriate unit for production (consumption unit if available)
    const getProductionUnit = (product: ProductWithSection): string => {
        const consumptionUom = product.product_uoms?.find(u => u.is_consumption_unit)
        return consumptionUom?.unit_name || product.unit || 'pcs'
    }

    // Get unit from history record
    const getRecordUnit = (record: any): string => {
        const product = record.product
        if (!product) return 'pcs'
        const consumptionUom = product.product_uoms?.find((u: any) => u.is_consumption_unit)
        return consumptionUom?.unit_name || product.unit || 'pcs'
    }

    const addProduct = (product: ProductWithSection) => {
        setProductionItems([...productionItems, {
            productId: product.id,
            name: product.name,
            category: product.category?.name || 'General',
            icon: product.category?.icon || '📦',
            unit: getProductionUnit(product),
            quantity: 1,
            wasted: 0,
            wasteReason: ''
        }])
        setSearchQuery('')
    }

    const updateQuantity = (productId: string, field: 'quantity' | 'wasted', delta: number) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, [field]: Math.max(0, item[field] + delta) }
                    : item
            )
        )
    }

    const updateReason = (productId: string, reason: string) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, wasteReason: reason }
                    : item
            )
        )
    }

    const removeItem = (productId: string) => {
        setProductionItems(items => items.filter(item => item.productId !== productId))
    }

    const handleSave = async () => {
        if (productionItems.length === 0 || !selectedSectionId) return
        setIsSaving(true)

        try {
            const dateStr = selectedDate.toISOString().split('T')[0]

            for (const item of productionItems) {
                // 1. Insert production record
                const { data: prodRecord, error: prodError } = await supabase
                    .from('production_records')
                    .insert({
                        product_id: item.productId,
                        section_id: selectedSectionId,
                        quantity_produced: item.quantity,
                        quantity_waste: item.wasted,
                        production_date: dateStr,
                        created_by: user?.id,
                        notes: item.wasteReason ? `Waste: ${item.wasteReason}` : null,
                        stock_updated: true
                    })
                    .select()
                    .single()

                if (prodError) throw prodError

                // 2. Create stock movement for production (positive)
                if (item.quantity > 0) {
                    const { error: stockError } = await supabase
                        .from('stock_movements')
                        .insert({
                            product_id: item.productId,
                            movement_type: 'production',
                            quantity: item.quantity,
                            reason: `Production ${selectedSection?.name || ''} - ${dateStr}`,
                            reference_id: prodRecord.id,
                            staff_id: user?.id
                        })

                    if (stockError) throw stockError
                }

                // 3. Create stock movement for waste (negative)
                if (item.wasted > 0) {
                    const { error: wasteError } = await supabase
                        .from('stock_movements')
                        .insert({
                            product_id: item.productId,
                            movement_type: 'waste',
                            quantity: -item.wasted,
                            reason: item.wasteReason || `Production waste ${dateStr}`,
                            reference_id: prodRecord.id,
                            staff_id: user?.id
                        })

                    if (wasteError) throw wasteError
                }
            }

            toast.success('Production saved')
            setProductionItems([])
            fetchTodayHistory()
        } catch (error: any) {
            console.error('Error saving:', error)
            toast.error('Error: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRecord = async (recordId: string) => {
        if (!isAdmin) return
        if (!confirm('Delete this entry and its stock movements?')) return

        try {
            // 1. Delete associated stock movements
            await supabase
                .from('stock_movements')
                .delete()
                .eq('reference_id', recordId)

            // 2. Delete production record
            const { error } = await supabase
                .from('production_records')
                .delete()
                .eq('id', recordId)

            if (error) throw error
            toast.success('Entry and movements deleted')
            fetchTodayHistory()
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        }
    }

    const selectedSection = sections.find(s => s.id === selectedSectionId)
    const totalProduced = todayHistory.reduce((sum, r) => sum + r.quantity_produced, 0)
    const totalWaste = todayHistory.reduce((sum, r) => sum + (r.quantity_waste || 0), 0)

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Factory size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#4A3728' }}>
                            Production
                        </h1>
                        <p style={{ margin: 0, color: '#8B7355', fontSize: '0.875rem' }}>
                            Production entry by section
                        </p>
                    </div>
                </div>
            </div>

            {/* Section & Date Selectors */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {/* Section Selector */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Layers size={18} style={{ color: '#F59E0B' }} />
                        <span style={{ fontWeight: 600, color: '#4A3728', fontSize: '0.875rem' }}>Section</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                style={{
                                    padding: '0.625rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: selectedSectionId === section.id ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                                    background: selectedSectionId === section.id ? '#FFFBEB' : 'white',
                                    color: selectedSectionId === section.id ? '#B45309' : '#6B7280',
                                    fontWeight: selectedSectionId === section.id ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {section.name}
                            </button>
                        ))}
                        {sections.length === 0 && (
                            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                No production section configured
                            </p>
                        )}
                    </div>
                </div>

                {/* Date Selector */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Calendar size={18} style={{ color: '#3B82F6' }} />
                        <span style={{ fontWeight: 600, color: '#4A3728', fontSize: '0.875rem' }}>Date</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => navigateDate(-1)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #E5E7EB',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '0.625rem 1rem',
                            background: isToday ? '#DBEAFE' : '#F3F4F6',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            color: isToday ? '#1D4ED8' : '#4B5563',
                            textTransform: 'capitalize'
                        }}>
                            {isToday ? "Today" : formatDate(selectedDate)}
                        </div>
                        <button
                            onClick={() => navigateDate(1)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #E5E7EB',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {!selectedSectionId ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    background: '#F9FAFB',
                    borderRadius: '1rem',
                    border: '2px dashed #E5E7EB'
                }}>
                    <Layers size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: 0, color: '#4B5563' }}>Select a section</h3>
                    <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>
                        Choose a production section to get started
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {/* Left - Production Entry */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        border: '1px solid #E5E7EB'
                    }}>
                        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600, color: '#4A3728' }}>
                            Production Entry - {selectedSection?.name}
                        </h2>

                        {/* Product Search */}
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="text"
                                placeholder="Search for a product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '0.75rem',
                                    fontSize: '1rem'
                                }}
                            />

                            {/* Search Results */}
                            {searchQuery && filteredProducts.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '0.75rem',
                                    marginTop: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 10,
                                    maxHeight: '300px',
                                    overflow: 'auto'
                                }}>
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addProduct(product)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                borderBottom: '1px solid #F3F4F6'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.25rem' }}>{product.category?.icon || '📦'}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1F2937' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{product.category?.name}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searchQuery && filteredProducts.length === 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '0.75rem',
                                    marginTop: '0.5rem',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    color: '#9CA3AF',
                                    zIndex: 10
                                }}>
                                    No product found in this section
                                </div>
                            )}
                        </div>

                        {/* Production Items Table */}
                        {productionItems.length > 0 ? (
                            <div style={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#F9FAFB' }}>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Product</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Quantity</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Waste</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Note</th>
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productionItems.map(item => (
                                            <tr key={item.productId} style={{ borderTop: '1px solid #F3F4F6' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#1F2937' }}>{item.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{item.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <button onClick={() => updateQuantity(item.productId, 'quantity', -1)} style={{ padding: '0.25rem', border: 'none', background: '#F3F4F6', borderRadius: '0.25rem', cursor: 'pointer' }}>
                                                            <Minus size={16} />
                                                        </button>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{item.quantity}</span>
                                                            <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{item.unit}</span>
                                                        </div>
                                                        <button onClick={() => updateQuantity(item.productId, 'quantity', 1)} style={{ padding: '0.25rem', border: 'none', background: '#F3F4F6', borderRadius: '0.25rem', cursor: 'pointer' }}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <button onClick={() => updateQuantity(item.productId, 'wasted', -1)} style={{ padding: '0.25rem', border: 'none', background: '#FEE2E2', borderRadius: '0.25rem', cursor: 'pointer', color: '#DC2626' }}>
                                                            <Minus size={16} />
                                                        </button>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: item.wasted > 0 ? '#DC2626' : '#D1D5DB' }}>{item.wasted}</span>
                                                            {item.wasted > 0 && <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', color: '#DC2626', fontWeight: 500 }}>{item.unit}</span>}
                                                        </div>
                                                        <button onClick={() => updateQuantity(item.productId, 'wasted', 1)} style={{ padding: '0.25rem', border: 'none', background: '#FEE2E2', borderRadius: '0.25rem', cursor: 'pointer', color: '#DC2626' }}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {item.wasted > 0 && (
                                                        <input
                                                            type="text"
                                                            placeholder="Reason..."
                                                            value={item.wasteReason}
                                                            onChange={(e) => updateReason(item.productId, e.target.value)}
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #FCA5A5', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                                                        />
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button onClick={() => removeItem(item.productId)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                background: '#F9FAFB',
                                borderRadius: '0.75rem',
                                border: '2px dashed #E5E7EB'
                            }}>
                                <Package size={40} style={{ color: '#D1D5DB', margin: '0 auto 0.75rem' }} />
                                <p style={{ color: '#6B7280', margin: 0 }}>No product added</p>
                                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Search for a product to add to production
                                </p>
                            </div>
                        )}

                        {/* Save Button */}
                        {productionItems.length > 0 && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setProductionItems([])}
                                    disabled={isSaving}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '0.5rem',
                                        background: 'white',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        opacity: isSaving ? 0.7 : 1
                                    }}
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right - Summary & History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Summary Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            border: '1px solid #E5E7EB'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                Daily Summary
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ padding: '1rem', background: '#ECFDF5', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{totalProduced}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 500 }}>Produced</div>
                                </div>
                                <div style={{ padding: '1rem', background: '#FEF2F2', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#DC2626' }}>{totalWaste}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#B91C1C', fontWeight: 500 }}>Waste</div>
                                </div>
                            </div>
                        </div>

                        {/* History Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            border: '1px solid #E5E7EB',
                            flex: 1
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                    Today's Production ({todayHistory.length})
                                </h3>
                                {!isAdmin && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9CA3AF', fontSize: '0.75rem' }}>
                                        <Eye size={14} />
                                        Read only
                                    </div>
                                )}
                            </div>

                            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                                {todayHistory.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {todayHistory.map(record => (
                                            <div
                                                key={record.id}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: '#F9FAFB',
                                                    borderRadius: '0.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>
                                                        {(record as any).product?.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={12} />
                                                        {new Date(record.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        background: '#D1FAE5',
                                                        color: '#059669',
                                                        borderRadius: '0.25rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        +{record.quantity_produced} {getRecordUnit(record)}
                                                    </span>
                                                    {record.quantity_waste > 0 && (
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: '#FEE2E2',
                                                            color: '#DC2626',
                                                            borderRadius: '0.25rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600
                                                        }}>
                                                            -{record.quantity_waste} {getRecordUnit(record)}
                                                        </span>
                                                    )}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteRecord(record.id)}
                                                            style={{
                                                                padding: '0.25rem',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                cursor: 'pointer',
                                                                color: '#EF4444'
                                                            }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                                        <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No production recorded</p>
                                    </div>
                                )}
                            </div>

                            {!isAdmin && todayHistory.length > 0 && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#FEF3C7',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Lock size={16} style={{ color: '#D97706' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#92400E' }}>
                                        Only an administrator can modify entries
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductionPage
