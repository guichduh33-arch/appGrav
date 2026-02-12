import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Plus, Trash2, Save, Send, Search,
    User, Calendar, Percent, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'

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
        product_id: null,
        product_name: '',
        product_sku: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        discount_percentage: 0,
        discount_amount: 0,
        line_total: 0
    }])

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [productSearch, setProductSearch] = useState('')
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null)

    useEffect(() => {
        fetchCustomers()
        fetchProducts()
        if (isEditing) {
            fetchOrder()
        }
    }, [id])

    const fetchCustomers = async () => {
        try {
            // Fetch all active customers for B2B orders
            // This includes wholesale and retail customers who may need formal orders/invoices
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('is_active', true)
                .returns<Customer[]>()
                .order('company_name', { ascending: true, nullsFirst: false })
                .order('name')

            if (error) throw error
            if (data) setCustomers(data)
        } catch (error) {
            console.error('Error fetching customers:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku, retail_price, wholesale_price, unit, current_stock')
                .eq('is_active', true)
                .eq('product_type', 'finished')
                .eq('available_for_sale', true)
                .returns<Product[]>()
                .order('name')

            if (error) throw error
            if (data) setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const fetchOrder = async () => {
        setLoading(true)
        try {
            const { data: order, error: orderError } = await supabase
                .from('b2b_orders')
                .select(`
                    *,
                    customer:customers(*)
                `)
                .eq('id', id!)
                .single()

            if (orderError) throw orderError

            const { data: orderItems, error: itemsError } = await supabase
                .from('b2b_order_items')
                .select('*')
                .eq('order_id', id!)

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
                    id: item.id as string,
                    product_id: item.product_id as string | null,
                    product_name: item.product_name as string,
                    product_sku: (item.product_sku as string) || '',
                    quantity: parseFloat(String(item.quantity)),
                    unit: item.unit as string,
                    unit_price: parseFloat(String(item.unit_price)),
                    discount_percentage: parseFloat(String(item.discount_percentage || 0)),
                    discount_amount: parseFloat(String(item.discount_amount)),
                    line_total: parseFloat(String(item.line_total))
                })))
            }
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId)
        setSelectedCustomer(customer || null)
        setFormData({
            ...formData,
            customer_id: customerId,
            delivery_address: customer?.address || '',
            payment_terms: customer?.payment_terms || ''
        })
    }

    const calculateLineTotal = (item: OrderItem): number => {
        const subtotal = item.quantity * item.unit_price
        const discountAmount = item.discount_percentage > 0
            ? subtotal * (item.discount_percentage / 100)
            : item.discount_amount
        return subtotal - discountAmount
    }

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        // Recalculate discount and line total
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
            ...newItems[index],
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            unit: product.unit,
            unit_price: product.wholesale_price || product.retail_price || 0,
            line_total: (product.wholesale_price || product.retail_price || 0) * newItems[index].quantity
        }
        setItems(newItems)
        setShowProductSearch(null)
        setProductSearch('')
    }

    const addItem = () => {
        setItems([...items, {
            product_id: null,
            product_name: '',
            product_sku: '',
            quantity: 1,
            unit: 'pcs',
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            line_total: 0
        }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
        let discountAmount = 0
        if (formData.discount_type === 'percentage') {
            discountAmount = subtotal * (formData.discount_value / 100)
        } else if (formData.discount_type === 'fixed') {
            discountAmount = formData.discount_value
        }
        const taxableAmount = subtotal - discountAmount
        const taxAmount = taxableAmount * (formData.tax_rate / 100)
        const total = taxableAmount + taxAmount

        return { subtotal, discountAmount, taxAmount, total }
    }

    const handleSubmit = async (status: 'draft' | 'confirmed' = 'draft') => {
        if (!formData.customer_id) {
            alert('Please select a customer')
            return
        }

        if (items.some(item => !item.product_name || item.quantity <= 0)) {
            alert('Please fill in all items correctly')
            return
        }

        setSaving(true)
        try {
            const totals = calculateTotals()

            // Map UI status to DB status (must match CHECK constraint)
            const dbStatus = status === 'draft' ? 'draft' : 'confirmed'

            // Map UI fields to database column names
            // Use type assertion to bypass strict type checking for dynamic insert
            // Note: tax_rate in DB is stored as decimal (0.10 = 10%), not percentage
            const orderData = {
                customer_id: formData.customer_id,
                status: dbStatus,
                order_number: `B2B-${Date.now()}`, // Generate order number
                delivery_date: formData.requested_delivery_date || null,
                subtotal: totals.subtotal,
                discount_percent: formData.discount_type === 'percentage' ? formData.discount_value : null,
                discount_amount: totals.discountAmount,
                tax_rate: formData.tax_rate / 100, // Convert percentage to decimal (10% -> 0.10)
                tax_amount: totals.taxAmount,
                total: totals.total,
                paid_amount: 0,
                payment_status: 'unpaid' as const,
                notes: formData.notes || null,
            }

            let orderId: string | undefined = id

            if (isEditing) {
                const { error } = await supabase
                    .from('b2b_orders')
                    .update(orderData as never)
                    .eq('id', id!)

                if (error) throw error

                // Delete existing items
                await supabase
                    .from('b2b_order_items')
                    .delete()
                    .eq('order_id', id!)
            } else {
                const { data: newOrder, error } = await supabase
                    .from('b2b_orders')
                    .insert(orderData as never)
                    .select()
                    .single()

                if (error) throw error
                orderId = newOrder.id
            }

            if (!orderId) {
                throw new Error('Failed to get order ID')
            }

            // Insert items - map UI fields to database column names
            const itemsToInsert = items.map(item => ({
                order_id: orderId as string,
                product_id: item.product_id || '', // product_id is required in DB
                product_name: item.product_name,
                product_sku: item.product_sku || null,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount_percent: item.discount_percentage || null,
                total: item.line_total
            }))

            const { error: itemsError } = await supabase
                .from('b2b_order_items')
                .insert(itemsToInsert as never)

            if (itemsError) throw itemsError

            navigate('/b2b/orders')
        } catch (error) {
            console.error('Error saving order:', error)
            alert(`Error saving: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setSaving(false)
        }
    }

    const totals = calculateTotals()

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-md text-[var(--color-gris-chaud)]">
                <div className="w-10 h-10 border-3 border-border border-t-[var(--color-rose-poudre)] rounded-full animate-spin"></div>
                <span>Loading order...</span>
            </div>
        )
    }

    return (
        <div className="p-lg h-full overflow-y-auto bg-[var(--color-blanc-creme)]">
            {/* Header */}
            <div className="flex items-center gap-md mb-xl">
                <button className="btn btn-ghost" onClick={() => navigate('/b2b/orders')}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1 className="font-display text-2xl font-bold text-[var(--color-brun-chocolat)]">
                    {isEditing ? 'Edit Order' : 'New B2B Order'}
                </h1>
            </div>

            <div className="grid grid-cols-[1fr_340px] max-md:grid-cols-1 gap-xl items-start">
                {/* Main Form */}
                <div className="flex flex-col gap-lg">
                    {/* Customer Section */}
                    <div className="bg-white rounded-lg shadow p-lg">
                        <h2 className="flex items-center gap-sm text-lg font-semibold text-[var(--color-brun-chocolat)] mb-lg">
                            <User size={20} />
                            Customer
                        </h2>
                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-md">
                            <div className="form-group form-group--full">
                                <label>B2B Customer *</label>
                                <select
                                    value={formData.customer_id}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                    required
                                >
                                    <option value="">Select a customer...</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.company_name || customer.name}
                                            {customer.company_name && ` (${customer.name})`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedCustomer && (
                                <div className="col-span-full flex flex-wrap gap-md p-md bg-[var(--color-blanc-creme)] rounded-md mt-sm">
                                    <div className="flex gap-xs text-sm">
                                        <span className="text-[var(--color-gris-chaud)]">Contact:</span>
                                        <span>{selectedCustomer.name}</span>
                                    </div>
                                    {selectedCustomer.phone && (
                                        <div className="flex gap-xs text-sm">
                                            <span className="text-[var(--color-gris-chaud)]">Phone:</span>
                                            <span>{selectedCustomer.phone}</span>
                                        </div>
                                    )}
                                    {selectedCustomer.email && (
                                        <div className="flex gap-xs text-sm">
                                            <span className="text-[var(--color-gris-chaud)]">Email:</span>
                                            <span>{selectedCustomer.email}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Section */}
                    <div className="bg-white rounded-lg shadow p-lg">
                        <h2 className="flex items-center gap-sm text-lg font-semibold text-[var(--color-brun-chocolat)] mb-lg">
                            <Calendar size={20} />
                            Delivery
                        </h2>
                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-md">
                            <div className="form-group">
                                <label>Requested delivery date</label>
                                <input
                                    type="date"
                                    value={formData.requested_delivery_date}
                                    onChange={(e) => setFormData({ ...formData, requested_delivery_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Payment terms</label>
                                <select
                                    value={formData.payment_terms}
                                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value as '' | 'cod' | 'net15' | 'net30' | 'net60' })}
                                >
                                    <option value="">Select...</option>
                                    <option value="cod">Cash on delivery</option>
                                    <option value="net15">Net 15 days</option>
                                    <option value="net30">Net 30 days</option>
                                    <option value="net60">Net 60 days</option>
                                </select>
                            </div>
                            <div className="form-group form-group--full">
                                <label>Delivery address</label>
                                <textarea
                                    rows={2}
                                    value={formData.delivery_address}
                                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                                    placeholder="Full delivery address..."
                                />
                            </div>
                            <div className="form-group form-group--full">
                                <label>Delivery instructions</label>
                                <textarea
                                    rows={2}
                                    value={formData.delivery_notes}
                                    onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
                                    placeholder="Special delivery instructions..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white rounded-lg shadow p-lg">
                        <div className="flex items-center justify-between mb-lg">
                            <h2 className="flex items-center gap-sm text-lg font-semibold text-[var(--color-brun-chocolat)]">
                                <Package size={20} />
                                Items
                            </h2>
                            <button className="btn btn-secondary btn-sm" onClick={addItem}>
                                <Plus size={16} />
                                Add
                            </button>
                        </div>

                        <div className="overflow-x-auto overflow-y-visible mt-md">
                            <table className="w-full border-collapse overflow-visible">
                                <thead>
                                    <tr>
                                        <th className="px-md py-sm text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border">Product</th>
                                        <th className="px-md py-sm text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border" style={{ width: '80px' }}>Qty</th>
                                        <th className="px-md py-sm text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border" style={{ width: '100px' }}>Unit Price</th>
                                        <th className="px-md py-sm text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border" style={{ width: '80px' }}>Discount %</th>
                                        <th className="px-md py-sm text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border" style={{ width: '120px' }}>Total</th>
                                        <th className="px-md py-sm text-left text-xs font-semibold text-[var(--color-gris-chaud)] uppercase tracking-wide bg-[var(--color-blanc-creme)] border-b border-border" style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="[&:last-child>td]:border-b-0">
                                            <td className="px-md py-sm text-sm border-b border-border align-middle overflow-visible">
                                                <div className="relative z-10">
                                                    <div
                                                        className="px-md py-sm border border-border rounded-md text-sm cursor-pointer bg-white min-w-[200px] hover:border-[var(--color-rose-poudre)]"
                                                        onClick={() => setShowProductSearch(showProductSearch === index ? null : index)}
                                                    >
                                                        {item.product_name || (
                                                            <span className="text-[var(--color-gris-chaud)]">Search a product...</span>
                                                        )}
                                                    </div>
                                                    {showProductSearch === index && (
                                                        <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg z-[1000] min-w-[350px] max-h-[400px] overflow-hidden flex flex-col">
                                                            <div className="flex items-center gap-sm px-md py-sm border-b border-border">
                                                                <Search size={16} className="text-[var(--color-gris-chaud)] shrink-0" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search..."
                                                                    value={productSearch}
                                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                                    autoFocus
                                                                    className="flex-1 border-none outline-none text-sm"
                                                                />
                                                            </div>
                                                            <div className="overflow-y-auto max-h-[350px]">
                                                                {filteredProducts.map(product => (
                                                                    <div
                                                                        key={product.id}
                                                                        className="px-md py-sm cursor-pointer transition-colors duration-fast hover:bg-[rgba(186,144,162,0.1)]"
                                                                        onClick={() => handleProductSelect(index, product)}
                                                                    >
                                                                        <div className="font-medium text-[var(--color-brun-chocolat)] mb-0.5">
                                                                            {product.name}
                                                                        </div>
                                                                        <div className="flex gap-md text-xs text-[var(--color-gris-chaud)]">
                                                                            <span>{product.sku}</span>
                                                                            <span>{formatCurrency(product.wholesale_price || product.retail_price || 0)}</span>
                                                                            <span>Stock: {product.current_stock}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-md py-sm text-sm border-b border-border align-middle">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                                                    className="w-full px-sm py-xs border border-border rounded-sm text-sm focus:outline-none focus:border-[var(--color-rose-poudre)]"
                                                />
                                            </td>
                                            <td className="px-md py-sm text-sm border-b border-border align-middle">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-sm py-xs border border-border rounded-sm text-sm focus:outline-none focus:border-[var(--color-rose-poudre)]"
                                                />
                                            </td>
                                            <td className="px-md py-sm text-sm border-b border-border align-middle">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={item.discount_percentage}
                                                    onChange={(e) => handleItemChange(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-sm py-xs border border-border rounded-sm text-sm focus:outline-none focus:border-[var(--color-rose-poudre)]"
                                                />
                                            </td>
                                            <td className="px-md py-sm text-sm border-b border-border align-middle">
                                                <strong>{formatCurrency(item.line_total)}</strong>
                                            </td>
                                            <td className="px-md py-sm text-sm border-b border-border align-middle">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-md text-[var(--color-gris-chaud)] cursor-pointer transition-all duration-fast hover:border-[var(--color-urgent)] hover:text-[var(--color-urgent)] disabled:opacity-40 disabled:cursor-not-allowed"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-lg shadow p-lg">
                        <h2 className="flex items-center gap-sm text-lg font-semibold text-[var(--color-brun-chocolat)] mb-lg">Notes</h2>
                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-md">
                            <div className="form-group">
                                <label>Notes (visible on purchase order)</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Notes for the customer..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Internal notes</label>
                                <textarea
                                    rows={3}
                                    value={formData.internal_notes}
                                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                                    placeholder="Internal notes (not visible to customer)..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Summary */}
                <div className="sticky top-lg max-md:static">
                    <div className="bg-white rounded-lg shadow p-lg">
                        <h3 className="text-lg font-semibold text-[var(--color-brun-chocolat)] mb-lg">Summary</h3>

                        <div className="flex justify-between items-center py-sm text-sm text-[var(--color-brun-chocolat)]">
                            <span>Subtotal</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>

                        {/* Discount */}
                        <div className="flex flex-col gap-sm py-sm">
                            <div className="flex gap-xs">
                                <button
                                    className={cn(
                                        'inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-blanc-creme)] border border-border rounded-xl text-xs font-medium text-[var(--color-gris-chaud)] cursor-pointer transition-all duration-fast hover:border-[var(--color-rose-poudre)] hover:text-[var(--color-rose-poudre)]',
                                        formData.discount_type === 'percentage' && 'bg-[var(--color-rose-poudre)] border-[var(--color-rose-poudre)] text-white'
                                    )}
                                    onClick={() => setFormData({ ...formData, discount_type: 'percentage' })}
                                >
                                    <Percent size={14} />
                                    %
                                </button>
                                <button
                                    className={cn(
                                        'inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-blanc-creme)] border border-border rounded-xl text-xs font-medium text-[var(--color-gris-chaud)] cursor-pointer transition-all duration-fast hover:border-[var(--color-rose-poudre)] hover:text-[var(--color-rose-poudre)]',
                                        formData.discount_type === 'fixed' && 'bg-[var(--color-rose-poudre)] border-[var(--color-rose-poudre)] text-white'
                                    )}
                                    onClick={() => setFormData({ ...formData, discount_type: 'fixed' })}
                                >
                                    Fixed
                                </button>
                                {formData.discount_type && (
                                    <button
                                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-[var(--color-blanc-creme)] border border-border rounded-xl text-xs font-medium text-[var(--color-gris-chaud)] cursor-pointer transition-all duration-fast hover:border-[var(--color-rose-poudre)] hover:text-[var(--color-rose-poudre)]"
                                        onClick={() => setFormData({ ...formData, discount_type: '', discount_value: 0 })}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                            {formData.discount_type && (
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                                    placeholder={formData.discount_type === 'percentage' ? '% discount' : 'Amount'}
                                    className="p-sm border border-border rounded-md text-sm"
                                />
                            )}
                        </div>

                        {totals.discountAmount > 0 && (
                            <div className="flex justify-between items-center py-sm text-sm text-success">
                                <span>Discount</span>
                                <span>-{formatCurrency(totals.discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-sm text-sm text-[var(--color-brun-chocolat)]">
                            <span>Tax ({formData.tax_rate}%)</span>
                            <span>{formatCurrency(totals.taxAmount)}</span>
                        </div>

                        <div className="h-px bg-border my-md"></div>

                        <div className="flex justify-between items-center text-xl font-bold text-[var(--color-brun-chocolat)] py-sm">
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>

                        <div className="flex flex-col gap-sm mt-lg">
                            <button
                                className="btn btn-secondary btn-block"
                                onClick={() => handleSubmit('draft')}
                                disabled={saving}
                            >
                                <Save size={18} />
                                Save Draft
                            </button>
                            <button
                                className="btn btn-primary btn-block"
                                onClick={() => handleSubmit('confirmed')}
                                disabled={saving}
                            >
                                <Send size={18} />
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
