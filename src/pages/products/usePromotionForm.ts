import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Product } from '../../types/database'
import { formatCurrency } from '../../utils/helpers'
import { toast } from 'sonner'
import { PromotionFormData, initialFormData, mapPromotionToForm } from './promotionFormConstants'

export function usePromotionForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<PromotionFormData>(initialFormData)
    const [errors, setErrors] = useState<Partial<Record<keyof PromotionFormData, string>>>({})

    const [products, setProducts] = useState<Product[]>([])
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
    const [freeProducts, setFreeProducts] = useState<Product[]>([])
    const [showProductSearch, setShowProductSearch] = useState<'applicable' | 'free' | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
        if (isEditing) {
            fetchPromotion()
        }
    }, [id])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            if (data) setProducts(data)
        } catch {
            toast.error('Error loading products')
        }
    }

    const fetchPromotion = async () => {
        if (!id) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (data) {
                const d = data as Record<string, unknown>
                setForm(mapPromotionToForm(data, d))

                const { data: promoProducts } = await supabase
                    .from('promotion_products')
                    .select('product:products(*)')
                    .eq('promotion_id', id)

                if (promoProducts) {
                    type PromoProductRow = { product: Product | null }
                    const rawData = promoProducts as unknown as PromoProductRow[]
                    setSelectedProducts(
                        rawData.map((pp) => pp.product).filter((p): p is Product => p !== null)
                    )
                }

                const { data: promoFreeProducts } = await supabase
                    .from('promotion_free_products')
                    .select('product:products(*)')
                    .eq('promotion_id', id)

                if (promoFreeProducts) {
                    type PromoFreeProductRow = { product: Product | null }
                    const rawFreeData = promoFreeProducts as unknown as PromoFreeProductRow[]
                    setFreeProducts(
                        rawFreeData.map((pp) => pp.product).filter((p): p is Product => p !== null)
                    )
                }
            }
        } catch {
            toast.error('Error loading promotion')
        } finally {
            setLoading(false)
        }
    }

    const updateField = useCallback(<K extends keyof PromotionFormData>(
        field: K,
        value: PromotionFormData[K]
    ) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }, [errors])

    const toggleDay = (day: number) => {
        setForm(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day].sort()
        }))
    }

    const addProduct = (product: Product, type: 'applicable' | 'free') => {
        if (type === 'applicable') {
            if (!selectedProducts.find(p => p.id === product.id)) {
                setSelectedProducts(prev => [...prev, product])
            }
        } else {
            if (!freeProducts.find(p => p.id === product.id)) {
                setFreeProducts(prev => [...prev, product])
            }
        }
        setShowProductSearch(null)
        setSearchTerm('')
    }

    const removeProduct = (productId: string, type: 'applicable' | 'free') => {
        if (type === 'applicable') {
            setSelectedProducts(prev => prev.filter(p => p.id !== productId))
        } else {
            setFreeProducts(prev => prev.filter(p => p.id !== productId))
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof PromotionFormData, string>> = {}

        if (!form.code.trim()) newErrors.code = 'Code required'
        if (!form.name.trim()) newErrors.name = 'Name required'

        if (form.promotion_type === 'percentage' && (form.discount_percentage <= 0 || form.discount_percentage > 100)) {
            newErrors.discount_percentage = 'Between 1% and 100%'
        }
        if (form.promotion_type === 'fixed_amount' && form.discount_amount <= 0) {
            newErrors.discount_amount = 'Amount required'
        }
        if (form.promotion_type === 'buy_x_get_y' && (form.buy_quantity < 1 || form.get_quantity < 1)) {
            newErrors.buy_quantity = 'Quantities required'
        }

        if (form.start_date && form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
            newErrors.end_date = 'End date after start date'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)
        try {
            const promotionData = {
                code: form.code,
                name: form.name,
                description: form.description || null,
                promotion_type: form.promotion_type,
                discount_percentage: form.promotion_type === 'percentage' ? form.discount_percentage : null,
                discount_amount: form.promotion_type === 'fixed_amount' ? form.discount_amount : null,
                buy_quantity: form.promotion_type === 'buy_x_get_y' ? form.buy_quantity : null,
                get_quantity: form.promotion_type === 'buy_x_get_y' ? form.get_quantity : null,
                min_purchase_amount: form.min_purchase_amount || null,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
                days_of_week: form.days_of_week.length > 0 ? form.days_of_week : null,
                time_start: form.time_start || null,
                time_end: form.time_end || null,
                max_uses_total: form.max_uses_total,
                max_uses_per_customer: form.max_uses_per_customer,
                priority: form.priority,
                is_stackable: form.is_stackable,
                is_active: form.is_active
            }

            let promotionId: string

            if (isEditing) {
                const { error } = await supabase
                    .from('promotions')
                    .update(promotionData as never)
                    .eq('id', id!)

                if (error) throw error
                promotionId = id!

                // Clean up existing relations
                await supabase.from('promotion_products').delete().eq('promotion_id', promotionId)
                await supabase.from('promotion_free_products').delete().eq('promotion_id', promotionId)
            } else {
                const { data, error } = await supabase
                    .from('promotions')
                    .insert(promotionData as never)
                    .select()
                    .single()

                if (error) throw error
                promotionId = data.id
            }

            // Insert product relations
            if (selectedProducts.length > 0) {
                await supabase.from('promotion_products').insert(
                    selectedProducts.map(p => ({
                        promotion_id: promotionId,
                        product_id: p.id
                    })) as never[]
                )
            }

            if (freeProducts.length > 0) {
                await supabase.from('promotion_free_products').insert(
                    freeProducts.map(p => ({
                        promotion_id: promotionId,
                        product_id: p.id,
                        quantity: 1
                    })) as never[]
                )
            }

            toast.success(isEditing ? 'Promotion updated' : 'Promotion created')
            navigate('/products/promotions')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error saving promotion')
        } finally {
            setSaving(false)
        }
    }

    const getPreviewValue = (): string => {
        switch (form.promotion_type) {
            case 'percentage':
                return `-${form.discount_percentage}%`
            case 'fixed_amount':
                return `-${formatCurrency(form.discount_amount)}`
            case 'buy_x_get_y':
                return `${form.buy_quantity} + ${form.get_quantity} free`
            case 'free_product':
                return 'Free gift'
            default:
                return ''
        }
    }

    return {
        // State
        isEditing,
        loading,
        saving,
        form,
        errors,
        // Product selection
        selectedProducts,
        freeProducts,
        showProductSearch,
        searchTerm,
        filteredProducts,
        // Actions
        navigate,
        updateField,
        toggleDay,
        addProduct,
        removeProduct,
        setShowProductSearch,
        setSearchTerm,
        handleSubmit,
        getPreviewValue
    }
}
