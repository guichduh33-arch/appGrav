import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, WifiOff, Percent } from 'lucide-react'
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
import { logError } from '@/utils/logger'
import { POFormHeader } from './po-form/POFormHeader'
import { POFormItems } from './po-form/POFormItems'
import { PODiscountModal } from './po-form/PODiscountModal'

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
        newItems[index].line_total = calculateLineTotal(newItems[index])

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
            const preparedItems = items.map(item => ({
                ...item,
                line_total: calculateLineTotal(item)
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
            logError('Error saving purchase order:', error)
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
            <div className="min-h-screen bg-[var(--theme-bg-primary)] p-10">
                <div className="flex items-center justify-center min-h-[300px] text-[var(--muted-smoke)] text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] p-10 max-w-7xl mx-auto">
            {/* Offline Warning Banner */}
            {!isOnline && (
                <div className="flex items-center gap-3 px-5 py-3.5 mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-medium">
                    <WifiOff size={18} />
                    <span>This feature requires an internet connection</span>
                </div>
            )}

            {/* Page Title */}
            <div className="mb-10">
                <button
                    className="flex items-center gap-2 text-sm text-[var(--muted-smoke)] hover:text-[var(--color-gold)] transition-colors mb-4"
                    onClick={() => navigate('/purchasing/purchase-orders')}
                >
                    <ArrowLeft size={16} />
                    Back to Orders
                </button>
                <h1 className="text-3xl font-light text-white">
                    Stock Order{' '}
                    <span className="text-[var(--color-gold)] font-semibold tracking-tight">
                        {isEditing ? 'Edit' : 'Request'}
                    </span>
                </h1>
                <p className="text-[var(--muted-smoke)] mt-2 text-sm">
                    {isEditing
                        ? 'Modify your purchase order details before resubmitting.'
                        : 'Create and dispatch a high-priority inventory request to your verified suppliers.'}
                </p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Form Details */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <POFormHeader
                        formData={formData}
                        suppliers={suppliers}
                        isOnline={isOnline}
                        onFormChange={(data) => setFormData({ ...formData, ...data })}
                    />

                    {/* Info Card */}
                    <div className="bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 rounded-xl p-5">
                        <h4 className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-tight mb-1">
                            Supply Chain Verified
                        </h4>
                        <p className="text-xs text-[var(--muted-smoke)] leading-relaxed">
                            Your order will be transmitted to the chosen supplier upon submission.
                        </p>
                    </div>
                </div>

                {/* Right Column: Items + Summary */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <POFormItems
                        items={items}
                        products={products}
                        isOnline={isOnline}
                        onItemChange={handleItemChange}
                        onAddItem={handleAddItem}
                        onRemoveItem={handleRemoveItem}
                    />

                    {/* Totals & Actions Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-7 bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                        <div className="flex items-center gap-10">
                            <div>
                                <p className="text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest mb-1">Total Items</p>
                                <p className="text-xl font-light text-white">
                                    {items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                                    <span className="text-xs text-[var(--muted-smoke)] font-normal ml-1">Units</span>
                                </p>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                            <button
                                className="flex items-center gap-2 text-xs text-[var(--muted-smoke)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-40"
                                onClick={() => setShowDiscountModal(true)}
                                disabled={!isOnline}
                            >
                                <Percent size={14} />
                                Discount
                            </button>
                            {totals.orderDiscount > 0 && (
                                <>
                                    <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mb-1">Discount</p>
                                        <p className="text-sm font-medium text-emerald-400">-{formatCurrency(totals.orderDiscount)}</p>
                                    </div>
                                </>
                            )}
                            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                            <div>
                                <p className="text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest mb-1">Estimated Order Value</p>
                                <p className="text-2xl font-bold text-[var(--color-gold)]">{formatCurrency(totals.total)}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3.5 px-6 bg-transparent border border-white/10 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all hover:border-white/20 disabled:opacity-40"
                                onClick={() => handleSubmit(false)}
                                disabled={isSaving || !isOnline}
                            >
                                Save Draft
                            </button>
                            <button
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3.5 px-8 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-40"
                                onClick={() => handleSubmit(true)}
                                disabled={isSaving || !isOnline}
                            >
                                Send Order Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <PODiscountModal
                    discountAmount={formData.discount_amount}
                    discountPercentage={formData.discount_percentage}
                    onDiscountChange={(amount, percentage) => setFormData({
                        ...formData,
                        discount_amount: amount,
                        discount_percentage: percentage
                    })}
                    onApply={applyGlobalDiscount}
                    onClose={() => setShowDiscountModal(false)}
                />
            )}
        </div>
    )
}
