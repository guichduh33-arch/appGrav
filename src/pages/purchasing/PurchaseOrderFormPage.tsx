import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, Send, Percent, WifiOff } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useSuppliers } from '@/hooks/purchasing/useSuppliers'
import { useRawMaterials } from '@/hooks/purchasing/useRawMaterials'
import {
    usePurchaseOrder,
    useCreatePurchaseOrder,
    useUpdatePurchaseOrder,
    calculateLineTotal,
    type IPOItem
} from '@/hooks/purchasing/usePurchaseOrders'
import { toast } from 'sonner'

const DEFAULT_ITEM: IPOItem = {
    product_id: null,
    product_name: '',
    description: '',
    quantity: 1,
    unit: 'kg',
    unit_price: 0,
    discount_amount: 0,
    discount_percentage: null,
    tax_rate: 10,
    line_total: 0
}

export default function PurchaseOrderFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id
    const { isOnline } = useNetworkStatus()
    const hasCheckedInitialOnlineStatus = useRef(false)

    // React Query hooks
    const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers({ isActive: true })
    const { data: purchaseOrder, isLoading: poLoading } = usePurchaseOrder(id || null)
    const createMutation = useCreatePurchaseOrder()
    const updateMutation = useUpdatePurchaseOrder()

    // Raw materials from hook
    const { data: products = [], isLoading: productsLoading } = useRawMaterials()

    const [formData, setFormData] = useState({
        supplier_id: '',
        expected_delivery_date: '',
        notes: '',
        discount_amount: 0,
        discount_percentage: null as number | null,
        status: 'draft' as const
    })

    const [items, setItems] = useState<IPOItem[]>([{ ...DEFAULT_ITEM }])
    const [showDiscountModal, setShowDiscountModal] = useState(false)

    // Check online status on mount
    useEffect(() => {
        if (!hasCheckedInitialOnlineStatus.current) {
            hasCheckedInitialOnlineStatus.current = true
            if (!isOnline) {
                toast.error('This feature requires an internet connection')
            }
        }
    }, [isOnline])

    // Populate form when editing
    useEffect(() => {
        if (purchaseOrder && isEditing) {
            setFormData({
                supplier_id: purchaseOrder.supplier_id,
                expected_delivery_date: (purchaseOrder.expected_delivery_date || '').split('T')[0],
                notes: purchaseOrder.notes || '',
                discount_amount: purchaseOrder.discount_amount ?? 0,
                discount_percentage: purchaseOrder.discount_percentage ?? null,
                status: purchaseOrder.status as 'draft'
            })

            if (purchaseOrder.items && purchaseOrder.items.length > 0) {
                setItems(purchaseOrder.items.map(item => ({
                    ...item,
                    quantity: parseFloat(String(item.quantity || 0)),
                    unit_price: parseFloat(String(item.unit_price || 0)),
                    discount_amount: parseFloat(String(item.discount_amount || 0)),
                    tax_rate: parseFloat(String(item.tax_rate || 10)),
                    line_total: parseFloat(String(item.line_total || 0))
                })))
            }
        }
    }, [purchaseOrder, isEditing])

    // Calculate line total for a single item
    const calculateItemLineTotal = (item: IPOItem): number => {
        return calculateLineTotal(item)
    }

    const handleItemChange = (index: number, field: keyof IPOItem, value: string | number | null) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        // If product selected, auto-fill details
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index].product_name = product.name
                newItems[index].unit = product.unit ?? 'kg'
                newItems[index].unit_price = product.cost_price || 0
            }
        }

        // Recalculate line total
        newItems[index].line_total = calculateItemLineTotal(newItems[index])

        setItems(newItems)
    }

    const handleAddItem = () => {
        setItems([...items, { ...DEFAULT_ITEM }])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    // Memoized totals calculation
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
        const orderDiscount = formData.discount_percentage
            ? subtotal * (formData.discount_percentage / 100)
            : formData.discount_amount
        const afterDiscount = subtotal - orderDiscount
        const tax = items.reduce((sum, item) => sum + (item.line_total * item.tax_rate / 100), 0)
        const total = afterDiscount + tax

        return { subtotal, orderDiscount, tax, total }
    }, [items, formData.discount_amount, formData.discount_percentage])

    const handleSubmit = async (sendToSupplier: boolean = false) => {
        if (!isOnline) {
            toast.error('This feature requires an internet connection')
            return
        }

        if (!formData.supplier_id) {
            toast.error('Please fill in all required fields')
            return
        }

        if (items.some(item => !item.product_name || item.quantity <= 0 || item.unit_price < 0)) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            // Prepare items with recalculated line totals
            const preparedItems = items.map(item => ({
                ...item,
                line_total: calculateItemLineTotal(item)
            }))

            if (isEditing) {
                await updateMutation.mutateAsync({
                    id: id!,
                    supplier_id: formData.supplier_id,
                    expected_delivery_date: formData.expected_delivery_date || null,
                    notes: formData.notes,
                    discount_amount: formData.discount_amount,
                    discount_percentage: formData.discount_percentage,
                    items: preparedItems,
                    status: sendToSupplier ? 'sent' : formData.status
                })
                toast.success('Purchase order updated successfully')
            } else {
                await createMutation.mutateAsync({
                    supplier_id: formData.supplier_id,
                    expected_delivery_date: formData.expected_delivery_date || null,
                    notes: formData.notes,
                    discount_amount: formData.discount_amount,
                    discount_percentage: formData.discount_percentage,
                    items: preparedItems,
                    sendToSupplier
                })
                toast.success('Purchase order created successfully')
            }

            navigate('/purchasing/purchase-orders')
        } catch (error) {
            console.error('Error saving purchase order:', error)
            toast.error(isEditing ? 'Failed to update purchase order' : 'Failed to create purchase order')
        }
    }

    const applyGlobalDiscount = () => {
        setFormData({
            ...formData,
            discount_amount: formData.discount_percentage
                ? totals.subtotal * (formData.discount_percentage / 100)
                : formData.discount_amount
        })
        setShowDiscountModal(false)
    }

    const isLoading = suppliersLoading || productsLoading || (isEditing && poLoading)
    const isSaving = createMutation.isPending || updateMutation.isPending

    if (isLoading) {
        return (
            <div className="p-xl max-w-[1600px] mx-auto">
                <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="p-xl max-w-[1600px] mx-auto">
            {/* Offline Warning Banner */}
            {!isOnline && (
                <div className="flex items-center gap-sm px-lg py-md mb-lg bg-warning/10 border border-warning rounded-md text-warning font-medium">
                    <WifiOff size={20} />
                    <span>This feature requires an internet connection</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-lg mb-xl">
                <button className="btn btn-secondary" onClick={() => navigate('/purchasing/purchase-orders')}>
                    <ArrowLeft size={20} />
                    Cancel
                </button>
                <h1 className="text-3xl font-bold text-white m-0">
                    {isEditing ? 'Edit Purchase Order' : 'New Purchase Order'}
                </h1>
            </div>

            <div className="grid grid-cols-[1fr_350px] gap-xl items-start max-lg:grid-cols-1">
                {/* Main Form */}
                <div className="flex flex-col gap-xl">
                    {/* Supplier & Dates */}
                    <div className="bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg p-lg [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:m-0 [&>h2]:mb-lg">
                        <h2>Supplier</h2>
                        <div className="grid grid-cols-2 gap-md max-md:grid-cols-1">
                            <div className="form-group">
                                <label>Supplier *</label>
                                <select
                                    required
                                    value={formData.supplier_id}
                                    onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                                    disabled={!isOnline}
                                    aria-label="Select supplier"
                                >
                                    <option value="">Select a supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Expected Delivery</label>
                                <input
                                    type="date"
                                    value={formData.expected_delivery_date}
                                    onChange={e => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                                    disabled={!isOnline}
                                    aria-label="Expected delivery date"
                                />
                            </div>
                            <div className="form-group col-span-full">
                                <label>Notes</label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any notes..."
                                    disabled={!isOnline}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg p-lg">
                        <div className="flex justify-between items-center mb-lg">
                            <h2 className="text-xl font-bold text-white m-0">Items</h2>
                            <button
                                className="btn btn-secondary py-2 px-4 text-sm"
                                onClick={handleAddItem}
                                disabled={!isOnline}
                            >
                                <Plus size={16} />
                                Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto max-md:text-sm">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]">Product</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]">Description</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]" style={{ width: '100px' }}>Quantity</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]" style={{ width: '80px' }}>Unit</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]" style={{ width: '120px' }}>Unit Price</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]" style={{ width: '100px' }}>Discount</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]" style={{ width: '80px' }}>Tax %</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]" style={{ width: '120px' }}>Line Total</th>
                                        <th className="p-sm text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-[var(--color-gray-700)]" style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody className="[&_td]:p-sm [&_td]:border-b [&_td]:border-[var(--color-gray-700)] [&_tr:last-child_td]:border-b-0 [&_input]:w-full [&_input]:p-2 [&_input]:bg-[var(--color-gray-700)] [&_input]:border [&_input]:border-[var(--color-gray-600)] [&_input]:rounded-md [&_input]:text-white [&_input]:text-sm [&_input:focus]:outline-none [&_input:focus]:border-primary [&_input[type=number]]:text-right [&_select]:w-full [&_select]:p-2 [&_select]:bg-[var(--color-gray-700)] [&_select]:border [&_select]:border-[var(--color-gray-600)] [&_select]:rounded-md [&_select]:text-white [&_select]:text-sm [&_select:focus]:outline-none [&_select:focus]:border-primary">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    value={item.product_id || ''}
                                                    onChange={e => handleItemChange(index, 'product_id', e.target.value || null)}
                                                    disabled={!isOnline}
                                                    aria-label="Select product"
                                                >
                                                    <option value="">Custom product</option>
                                                    {products.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {!item.product_id && (
                                                    <input
                                                        type="text"
                                                        placeholder="Product name"
                                                        value={item.product_name}
                                                        onChange={e => handleItemChange(index, 'product_name', e.target.value)}
                                                        style={{ marginTop: '4px' }}
                                                        disabled={!isOnline}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                    aria-label="Description"
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    aria-label="Quantity"
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={item.unit}
                                                    onChange={e => handleItemChange(index, 'unit', e.target.value)}
                                                    aria-label="Unit"
                                                    disabled={!isOnline}
                                                >
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="L">L</option>
                                                    <option value="mL">mL</option>
                                                    <option value="pcs">pcs</option>
                                                    <option value="box">box</option>
                                                    <option value="bag">bag</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={item.unit_price}
                                                    onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    aria-label="Unit price"
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.discount_amount}
                                                    onChange={e => handleItemChange(index, 'discount_amount', parseFloat(e.target.value) || 0)}
                                                    aria-label="Discount"
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={item.tax_rate}
                                                    onChange={e => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                                    aria-label="Tax rate"
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <strong>{formatCurrency(item.line_total)}</strong>
                                            </td>
                                            <td>
                                                <button
                                                    className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:enabled:bg-red-500/15 hover:enabled:text-danger disabled:opacity-40 disabled:cursor-not-allowed"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={items.length === 1 || !isOnline}
                                                    aria-label="Delete"
                                                    title="Delete"
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
                </div>

                {/* Summary Sidebar */}
                <div className="sticky top-lg max-lg:static">
                    <div className="bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg p-lg">
                        <h3 className="text-lg font-bold text-white m-0 mb-lg">Summary</h3>

                        <div className="flex justify-between items-center py-sm text-base text-[var(--color-gray-300)]">
                            <span>Subtotal</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>

                        <button
                            className="w-full flex items-center justify-center gap-2 py-sm px-sm my-sm bg-transparent border border-dashed border-[var(--color-gray-600)] rounded-md text-primary-light text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-500/10 hover:border-primary"
                            onClick={() => setShowDiscountModal(true)}
                            disabled={!isOnline}
                        >
                            <Percent size={16} />
                            Discount
                        </button>

                        {totals.orderDiscount > 0 && (
                            <div className="flex justify-between items-center py-sm text-base text-success">
                                <span>Discount Amount</span>
                                <span>-{formatCurrency(totals.orderDiscount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-sm text-base text-[var(--color-gray-300)]">
                            <span>Tax Amount</span>
                            <span>{formatCurrency(totals.tax)}</span>
                        </div>

                        <div className="h-px bg-[var(--color-gray-700)] my-md"></div>

                        <div className="flex justify-between items-center py-md text-xl font-bold text-white">
                            <span>Total Amount</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>

                        <div className="flex flex-col gap-sm mt-lg">
                            <button
                                className="btn btn-secondary w-full justify-center"
                                onClick={() => handleSubmit(false)}
                                disabled={isSaving || !isOnline}
                            >
                                <Save size={18} />
                                Save as Draft
                            </button>
                            <button
                                className="btn btn-primary w-full justify-center"
                                onClick={() => handleSubmit(true)}
                                disabled={isSaving || !isOnline}
                            >
                                <Send size={18} />
                                Save & Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <div className="modal-backdrop is-active" onClick={() => setShowDiscountModal(false)}>
                    <div className="modal is-active" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Discount</h2>
                        </div>
                        <div className="modal__body">
                            <div className="form-group">
                                <label>Fixed Amount (IDR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={formData.discount_amount}
                                    onChange={e => setFormData({
                                        ...formData,
                                        discount_amount: parseFloat(e.target.value) || 0,
                                        discount_percentage: null
                                    })}
                                    aria-label="Fixed discount amount"
                                />
                            </div>
                            <div className="form-group">
                                <label>Percentage (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.discount_percentage || ''}
                                    onChange={e => setFormData({
                                        ...formData,
                                        discount_percentage: parseFloat(e.target.value) || null,
                                        discount_amount: 0
                                    })}
                                    aria-label="Discount percentage"
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setShowDiscountModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={applyGlobalDiscount}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
