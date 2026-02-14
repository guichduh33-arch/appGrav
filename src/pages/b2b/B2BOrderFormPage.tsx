import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { logError } from '@/utils/logger'
import B2BOrderFormCustomer from './B2BOrderFormCustomer'
import B2BOrderFormDelivery from './B2BOrderFormDelivery'
import B2BOrderFormItems from './B2BOrderFormItems'
import B2BOrderFormNotes from './B2BOrderFormNotes'
import B2BOrderFormSidebar from './B2BOrderFormSidebar'

interface Customer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    address: string | null
    payment_terms: 'cod' | 'net15' | 'net30' | 'net60' | null
    customer_type: 'retail' | 'wholesale'
}

interface Product {
    id: string
    name: string
    sku: string
    retail_price: number | null
    wholesale_price: number | null
    unit: string
    current_stock: number
}

interface OrderItem {
    id?: string
    product_id: string | null
    product_name: string
    product_sku: string
    quantity: number
    unit: string
    unit_price: number
    discount_percentage: number
    discount_amount: number
    line_total: number
}

export default function B2BOrderFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id

    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        customer_id: '',
        requested_delivery_date: '',
        delivery_address: '',
        delivery_notes: '',
        notes: '',
        internal_notes: '',
        discount_type: '' as '' | 'percentage' | 'fixed',
        discount_value: 0,
        tax_rate: 10,
        payment_terms: '' as '' | 'cod' | 'net15' | 'net30' | 'net60'
    })

    const [items, setItems] = useState<OrderItem[]>([{
        product_id: null, product_name: '', product_sku: '', quantity: 1,
        unit: 'pcs', unit_price: 0, discount_percentage: 0, discount_amount: 0, line_total: 0
    }])

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [productSearch, setProductSearch] = useState('')
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null)

    useEffect(() => {
        fetchCustomers()
        fetchProducts()
        if (isEditing) fetchOrder()
    }, [id])

    const fetchCustomers = async () => {
        try {
            const { data, error } = await supabase
                .from('customers').select('*').eq('is_active', true)
                .returns<Customer[]>()
                .order('company_name', { ascending: true, nullsFirst: false })
                .order('name')
            if (error) throw error
            if (data) setCustomers(data)
        } catch (error) { logError('Error fetching customers:', error) }
    }

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products').select('id, name, sku, retail_price, wholesale_price, unit, current_stock')
                .eq('is_active', true).eq('product_type', 'finished').eq('available_for_sale', true)
                .returns<Product[]>().order('name')
            if (error) throw error
            if (data) setProducts(data)
        } catch (error) { logError('Error fetching products:', error) }
    }

    const fetchOrder = async () => {
        setLoading(true)
        try {
            const { data: order, error: orderError } = await supabase
                .from('b2b_orders').select(`*, customer:customers(*)`).eq('id', id!).single()
            if (orderError) throw orderError
            const { data: orderItems, error: itemsError } = await supabase
                .from('b2b_order_items').select('*').eq('order_id', id!)
            if (itemsError) throw itemsError

            const typedOrder = order as Record<string, unknown>
            setFormData({
                customer_id: typedOrder.customer_id as string,
                requested_delivery_date: ((typedOrder.requested_delivery_date as string)?.split('T')[0]) || '',
                delivery_address: (typedOrder.delivery_address as string) || '',
                delivery_notes: (typedOrder.delivery_notes as string) || '',
                notes: (typedOrder.notes as string) || '',
                internal_notes: (typedOrder.internal_notes as string) || '',
                discount_type: (typedOrder.discount_type as '' | 'percentage' | 'fixed') || '',
                discount_value: (typedOrder.discount_value as number) || 0,
                tax_rate: (typedOrder.tax_rate as number) || 10,
                payment_terms: (typedOrder.payment_terms as '' | 'cod' | 'net15' | 'net30' | 'net60') || ''
            })
            setSelectedCustomer(typedOrder.customer as Customer)
            if (orderItems && orderItems.length > 0) {
                const typedItems = orderItems as Record<string, unknown>[]
                setItems(typedItems.map(item => ({
                    id: item.id as string, product_id: item.product_id as string | null,
                    product_name: item.product_name as string, product_sku: (item.product_sku as string) || '',
                    quantity: parseFloat(String(item.quantity)), unit: item.unit as string,
                    unit_price: parseFloat(String(item.unit_price)),
                    discount_percentage: parseFloat(String(item.discount_percentage || 0)),
                    discount_amount: parseFloat(String(item.discount_amount)),
                    line_total: parseFloat(String(item.line_total))
                })))
            }
        } catch (error) { logError('Error fetching order:', error) }
        finally { setLoading(false) }
    }

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId)
        setSelectedCustomer(customer || null)
        setFormData({
            ...formData, customer_id: customerId,
            delivery_address: customer?.address || '',
            payment_terms: customer?.payment_terms || ''
        })
    }

    const calculateLineTotal = (item: OrderItem): number => {
        const subtotal = item.quantity * item.unit_price
        const discountAmount = item.discount_percentage > 0
            ? subtotal * (item.discount_percentage / 100) : item.discount_amount
        return subtotal - discountAmount
    }

    const handleItemChange = (index: number, field: keyof OrderItem, value: unknown) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        if (['quantity', 'unit_price', 'discount_percentage'].includes(field)) {
            const subtotal = newItems[index].quantity * newItems[index].unit_price
            newItems[index].discount_amount = subtotal * (newItems[index].discount_percentage / 100)
            newItems[index].line_total = calculateLineTotal(newItems[index])
        }
        setItems(newItems)
    }

    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...items]
        newItems[index] = {
            ...newItems[index], product_id: product.id, product_name: product.name,
            product_sku: product.sku, unit: product.unit,
            unit_price: product.wholesale_price || product.retail_price || 0,
            line_total: (product.wholesale_price || product.retail_price || 0) * newItems[index].quantity
        }
        setItems(newItems)
        setShowProductSearch(null)
        setProductSearch('')
    }

    const addItem = () => {
        setItems([...items, {
            product_id: null, product_name: '', product_sku: '', quantity: 1,
            unit: 'pcs', unit_price: 0, discount_percentage: 0, discount_amount: 0, line_total: 0
        }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index))
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
        let discountAmount = 0
        if (formData.discount_type === 'percentage') discountAmount = subtotal * (formData.discount_value / 100)
        else if (formData.discount_type === 'fixed') discountAmount = formData.discount_value
        const taxableAmount = subtotal - discountAmount
        const taxAmount = taxableAmount * (formData.tax_rate / 100)
        const total = taxableAmount + taxAmount
        return { subtotal, discountAmount, taxAmount, total }
    }

    const handleSubmit = async (status: 'draft' | 'confirmed' = 'draft') => {
        if (!formData.customer_id) { alert('Please select a customer'); return }
        if (items.some(item => !item.product_name || item.quantity <= 0)) { alert('Please fill in all items correctly'); return }
        setSaving(true)
        try {
            const totals = calculateTotals()
            const dbStatus = status === 'draft' ? 'draft' : 'confirmed'
            const orderData = {
                customer_id: formData.customer_id, status: dbStatus,
                order_number: `B2B-${Date.now()}`,
                delivery_date: formData.requested_delivery_date || null,
                subtotal: totals.subtotal,
                discount_percent: formData.discount_type === 'percentage' ? formData.discount_value : null,
                discount_amount: totals.discountAmount, tax_rate: formData.tax_rate / 100,
                tax_amount: totals.taxAmount, total: totals.total, paid_amount: 0,
                payment_status: 'unpaid' as const, notes: formData.notes || null,
            }
            let orderId: string | undefined = id
            if (isEditing) {
                const { error } = await supabase.from('b2b_orders').update(orderData as never).eq('id', id!)
                if (error) throw error
                await supabase.from('b2b_order_items').delete().eq('order_id', id!)
            } else {
                const { data: newOrder, error } = await supabase.from('b2b_orders').insert(orderData as never).select().single()
                if (error) throw error
                orderId = newOrder.id
            }
            if (!orderId) throw new Error('Failed to get order ID')
            const itemsToInsert = items.map(item => ({
                order_id: orderId as string, product_id: item.product_id || '',
                product_name: item.product_name, product_sku: item.product_sku || null,
                quantity: item.quantity, unit_price: item.unit_price,
                discount_percent: item.discount_percentage || null, total: item.line_total
            }))
            const { error: itemsError } = await supabase.from('b2b_order_items').insert(itemsToInsert as never)
            if (itemsError) throw itemsError
            navigate('/b2b/orders')
        } catch (error) {
            logError('Error saving order:', error)
            alert(`Error saving: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally { setSaving(false) }
    }

    const totals = calculateTotals()
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-[var(--theme-text-muted)]">
                <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
                <span>Loading order...</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    className="inline-flex items-center gap-2 px-3 py-2 bg-transparent border border-white/10 text-white rounded-xl text-sm transition-colors hover:border-white/20"
                    onClick={() => navigate('/b2b/orders')}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1 className="font-display text-2xl font-bold text-white">
                    {isEditing ? 'Edit Order' : 'New B2B Order'}
                </h1>
            </div>

            <div className="grid grid-cols-[1fr_340px] max-md:grid-cols-1 gap-8 items-start">
                {/* Main Form */}
                <div className="flex flex-col gap-6">
                    <B2BOrderFormCustomer
                        customers={customers}
                        selectedCustomer={selectedCustomer}
                        customerId={formData.customer_id}
                        onCustomerChange={handleCustomerChange}
                    />
                    <B2BOrderFormDelivery
                        formData={{
                            requested_delivery_date: formData.requested_delivery_date,
                            delivery_address: formData.delivery_address,
                            delivery_notes: formData.delivery_notes,
                            payment_terms: formData.payment_terms,
                        }}
                        onFormChange={(data) => setFormData({ ...formData, ...data })}
                    />
                    <B2BOrderFormItems
                        items={items}
                        products={products}
                        productSearch={productSearch}
                        showProductSearch={showProductSearch}
                        filteredProducts={filteredProducts}
                        onItemChange={handleItemChange}
                        onProductSelect={handleProductSelect}
                        onAddItem={addItem}
                        onRemoveItem={removeItem}
                        onProductSearchChange={setProductSearch}
                        onToggleProductSearch={setShowProductSearch}
                    />
                    <B2BOrderFormNotes
                        notes={formData.notes}
                        internalNotes={formData.internal_notes}
                        onNotesChange={(v) => setFormData({ ...formData, notes: v })}
                        onInternalNotesChange={(v) => setFormData({ ...formData, internal_notes: v })}
                    />
                </div>

                {/* Sidebar */}
                <B2BOrderFormSidebar
                    totals={totals}
                    discountType={formData.discount_type}
                    discountValue={formData.discount_value}
                    taxRate={formData.tax_rate}
                    saving={saving}
                    onDiscountTypeChange={(type) => setFormData({ ...formData, discount_type: type })}
                    onDiscountValueChange={(value) => setFormData({ ...formData, discount_value: value })}
                    onSaveDraft={() => handleSubmit('draft')}
                    onConfirm={() => handleSubmit('confirmed')}
                />
            </div>
        </div>
    )
}
